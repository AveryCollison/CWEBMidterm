import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { engine as createHbs } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

import sequelize from "./config/database.js";
import { User } from "./models/index.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { attachUserToViews } from "./middleware/attachUserToViews.js";

// ESM dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants from original file
const PORT = process.env.PORT || 3000;

// Express app
const app = express();
app.use(helmet());
app.disable("x-powered-by");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

// Handlebars setup (same helpers)
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

// Make user available in templates (original "non-blocking decoration")
app.use(attachUserToViews);

// ROUTING
app.get("/", (req, res) => {
  res.render("home", {
    title: "Tutoring Scheduler",
    welcome:
      "Book tutoring sessions by subject and time. This build includes authentication, JWT (cookie or Bearer), and role-based access.",
  });
});

app.use("/auth", authRoutes);
app.use("/", studentRoutes); 
app.use("/tutor", tutorRoutes);
app.use("/admin", adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Not Found",
    message: "The page you requested was not found.",
  });
});

// 500
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong on our side. Please try again.",
  });
});

// Bootstrap — DB sync + seed users (unchanged from your file)
(async () => {
  await sequelize.sync({ alter: true });

  const ROLES = { STUDENT: "student", TUTOR: "tutor", ADMIN: "admin" };

  const demoUsers = [
    {
      name: "Student One",
      email: "student@example.com",
      role: ROLES.STUDENT,
      passwordHash: bcrypt.hashSync("student123", 10),
    },
    {
      name: "Tutor One",
      email: "tutor@example.com",
      role: ROLES.TUTOR,
      passwordHash: bcrypt.hashSync("tutor123", 10),
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      role: ROLES.ADMIN,
      passwordHash: bcrypt.hashSync("admin123", 10),
    },
  ];

  for (const u of demoUsers) {
    const exists = await User.findOne({ where: { email: u.email } });
    if (!exists) await User.create(u);
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();
