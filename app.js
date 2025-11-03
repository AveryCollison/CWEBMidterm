// login, JWT, cookie/Bearer, role guards, seeded users.

import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { engine as createHbs } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { body, validationResult } from "express-validator";
import { Sequelize, DataTypes } from "sequelize";

// initialize database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "C:\\Users\\avery\\OneDrive - Saskatchewan Polytechnic\\Year2CST\\CWEB280\\Midterm\\Tutoring Scheduler Web App\\scheduler.db",
  logging: false,
});

// --- __dirname for ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Config ---
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_COOKIE = "access_token"; // httpOnly cookie for website sessions

// --- App bootstrap ---
const app = express();
app.use(helmet());
app.disable("x-powered-by");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

// --- Roles (constants to avoid typos) ---
const ROLES = Object.freeze({
  STUDENT: "student",
  TUTOR: "tutor",
  ADMIN: "admin",
});

// --- Models ---
const User = sequelize.define("User", {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  role: DataTypes.STRING,
  passwordHash: DataTypes.STRING,
});

const TutorSlot = sequelize.define("TutorSlot", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tutorId: DataTypes.STRING,
  tutorName: DataTypes.STRING,
  subject: DataTypes.STRING,
  date: DataTypes.STRING,
  start: DataTypes.STRING,
  end: DataTypes.STRING,
  booked: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId: DataTypes.STRING,
  studentName: DataTypes.STRING,
  tutorSlotId: DataTypes.INTEGER,
  tutorName: DataTypes.STRING,
  subject: DataTypes.STRING,
  date: DataTypes.STRING,
  start: DataTypes.STRING,
  end: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: "booked" },
});

User.hasMany(TutorSlot, { foreignKey: "tutorId" });
TutorSlot.belongsTo(User, { foreignKey: "tutorId" });

User.hasMany(Booking, { foreignKey: "studentId" });
Booking.belongsTo(User, { foreignKey: "studentId" });

TutorSlot.hasOne(Booking, { foreignKey: "tutorSlotId" });
Booking.belongsTo(TutorSlot, { foreignKey: "tutorSlotId" });

await sequelize.sync({ force: true }); // use { alter: true } after first run

// --- Seed users (demo only; passwords are hashed) ---
const users = [
  {
    id: "stu1",
    name: "Student One",
    email: "student@example.com",
    role: ROLES.STUDENT,
    passwordHash: bcrypt.hashSync("student123", 10),
  },
  {
    id: "tut1",
    name: "Tutor One",
    email: "tutor@example.com",
    role: ROLES.TUTOR,
    passwordHash: bcrypt.hashSync("tutor123", 10),
  },
  {
    id: "adm1",
    name: "Admin User",
    email: "admin@example.com",
    role: ROLES.ADMIN,
    passwordHash: bcrypt.hashSync("admin123", 10),
  },
];

// --- Seed users ---
for (const u of users) {
  await User.create(u);
}

// --- Handlebars setup + helpers ---
app.engine(
  "hbs",
  createHbs({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    helpers: {
      upper: (s) => (typeof s === "string" ? s.toUpperCase() : s),
      year: () => new Date().getFullYear(),
      hasRole: (userRole, role) => userRole === role,
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// --- JWT helpers/middleware (accept Cookie or Bearer) ---
function signAccessToken(user, ttlSeconds = 15 * 60) {
  const iat = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat,
      exp: iat + ttlSeconds,
    },
    JWT_SECRET
  );
}
function getBearerToken(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}
function requireAuth(req, res, next) {
  const token = req.cookies[ACCESS_COOKIE] || getBearerToken(req);
  if (!token) {
    return res.status(403).render("error", {
      title: "Forbidden",
      message:
        "Authentication required. Log in at /auth/login or send a Bearer token.",
    });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    res.locals.user = payload; // expose to views
    next();
  } catch {
    if (req.cookies[ACCESS_COOKIE]) {
      res.clearCookie(ACCESS_COOKIE, { httpOnly: true, sameSite: "lax" });
    }
    return res.status(403).render("error", {
      title: "Forbidden",
      message: "Your session/token is invalid or expired. Please log in again.",
    });
  }
}
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).render("error", {
        title: "Forbidden",
        message: "You do not have permission to access this page.",
      });
    }
    next();
  };
}
// Non-blocking decoration: make user visible to views if present
app.use((req, res, next) => {
  const token = req.cookies[ACCESS_COOKIE] || getBearerToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = req.user || payload;
    res.locals.user = payload;
  } catch {}
  next();
});

// --- Routes: Home ---
app.get("/", (req, res) => {
  res.render("home", {
    title: "Tutoring Scheduler",
    welcome:
      "Book tutoring sessions by subject and time. This build includes authentication, JWT (cookie or Bearer), and role-based access.",
  });
});

// --- Auth UI ---
app.get("/auth/login", (req, res) => {
  res.render("login", {
    title: "Login",
    form: { email: "student@example.com", password: "student123", useCookie: true },
    error: null,
    token: null,
  });
});
app.post(
  "/auth/login",
  [
    body("email").trim().isEmail().withMessage("Valid email is required."),
    body("password").isString().isLength({ min: 4 }).withMessage("Password is required."),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).render("login", {
        title: "Login",
        form: { email: req.body.email || "", password: "", useCookie: !!req.body.useCookie },
        error: result.array()[0]?.msg || "Invalid form input.",
        token: null,
      });
    }
    const { email, password, useCookie } = req.body;
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).render("login", {
        title: "Login",
        form: { email, password: "", useCookie: !!useCookie },
        error: "Invalid email or password.",
        token: null,
      });
    }
    const accessToken = signAccessToken(user, 15 * 60);
    if (useCookie) {
      res.cookie(ACCESS_COOKIE, accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
      });
      return res.redirect("/my/sessions");
    }
    // Stateless: show token to use in curl/Postman
    return res.status(200).render("login", {
      title: "Login",
      form: { email, password: "", useCookie: false },
      error: null,
      token: accessToken,
    });
  }
);
app.get("/auth/logout", (req, res) => {
  res.clearCookie(ACCESS_COOKIE, { httpOnly: true, sameSite: "lax" });
  res.redirect("/");
});

// --- Protected placeholders (prove RBAC now; CRUD comes later) ---
app.get("/my/sessions", requireAuth, requireRole(ROLES.STUDENT), async (req, res) => {
  // Include the tutor slot for full session info
  const bookings = await Booking.findAll({
    where: { studentId: req.user.sub },
    order: [["date", "ASC"], ["start", "ASC"]],
  });

  const sessions = bookings.map(b => b.get({ plain: true }));

  res.render("sessions", { title: "My Sessions", sessions });
});


app.get("/tutor/slots", requireAuth, requireRole(ROLES.TUTOR), async (req, res) => {
  const slots = await TutorSlot.findAll({ where: { tutorId: req.user.sub } });
  res.render("tutor-slots", { title: "Tutor Slots", slots });
});

// --- Tutor: CRUD for slots ---

// Create slot (form submission)
app.post("/tutor/slots", requireAuth, requireRole(ROLES.TUTOR), async (req, res) => {
  const { subject, date, start, end } = req.body;
  if (!subject || !date || !start || !end) {
    const slots = await TutorSlot.findAll({ where: { tutorId: req.user.sub } });
    return res.status(400).render("tutor-slots", {
      title: "Tutor Slots",
      error: "All fields are required.",
      slots,
    });
  }

  await TutorSlot.create({
    tutorId: req.user.sub,
    tutorName: req.user.name,
    subject,
    date,
    start,
    end,
  });

  res.redirect("/tutor/slots");
});

// Delete slot
app.post("/tutor/slots/delete/:id", requireAuth, requireRole(ROLES.TUTOR), async (req, res) => {
  const slot = await TutorSlot.findOne({ where: { id: req.params.id, tutorId: req.user.sub } });
  if (!slot) {
    return res.status(403).render("error", {
      title: "Forbidden",
      message: "You can only delete your own slots.",
    });
  }
  await slot.destroy();
  res.redirect("/tutor/slots");
});

// --- Student: view available slots ---
app.get("/availability", requireAuth, requireRole(ROLES.STUDENT), async (req, res) => {
  const openSlots = await TutorSlot.findAll({ 
    where: { booked: false },
    order: [["date", "ASC"], ["start", "ASC"]]
  });

  // Convert Sequelize instances to plain objects
  const slots = openSlots.map(slot => slot.get({ plain: true }));

  res.render("availability", { title: "Available Slots", slots });
});

// --- Student: book a slot ---
app.post("/book/:slotId", requireAuth, requireRole(ROLES.STUDENT), async (req, res) => {
  const slot = await TutorSlot.findByPk(req.params.slotId);
  if (!slot) return res.status(404).render("error", { title: "Not Found", message: "Slot not found." });
  if (slot.booked) return res.status(400).render("error", { title: "Already Booked", message: "This slot is already booked." });

  await Booking.create({
    studentId: req.user.sub,
    studentName: req.user.name,
    tutorSlotId: slot.id,
    tutorName: slot.tutorName,
    subject: slot.subject,
    date: slot.date,
    start: slot.start,
    end: slot.end,
  });

  slot.booked = true;
  await slot.save();

  res.redirect("/my/sessions");
});

app.get("/admin/overview", requireAuth, requireRole(ROLES.ADMIN), (req, res) => {
  res.render("admin-overview", {
    title: "Admin Overview",
    metrics: { total: 0, upcomingWeek: 0, topSubjects: [] }, // Person 4 later
  });
});

// --- Friendly 404/500 ---
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Not Found",
    message: "The page you requested was not found.",
  });
});
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong on our side. Please try again.",
  });
});

// --- Start server after syncing database and seeding users ---
(async () => {
  await sequelize.sync({ force: true });
  for (const u of users) await User.create(u);

  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log("🔐 Set a strong JWT_SECRET in production.");
  });
})();


