import bcrypt from "bcryptjs";
import { User, Booking, Subject } from "../models/index.js";

export const adminController = {
  async overview(req, res) {
    const users = await User.findAll();
    const sessions = await Booking.findAll();
    const subjects = await Subject.findAll();

    res.render("admin-overview", {
      title: "Admin Overview",
      metrics: { total: 0, upcomingWeek: 0, topSubjects: [] },
      users: users.map((u) => u.get({ plain: true })),
      sessions: sessions.map((ss) => ss.get({ plain: true })),
      subjects: subjects.map((sj) => sj.get({ plain: true })),
    });
  },

  createUserPage(req, res) {
    res.render("create-user", {
      title: "Admin Overview",
      metrics: { total: 0, upcomingWeek: 0, topSubjects: [] },
    });
  },

  async createUser(req, res) {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role || !password) {
      return res.status(400).render("create-user", {
        title: "Create New User",
        error: "All fields are required.",
      });
      console.log("Cannot create user!");
    }

    await User.create({
      name,
      email,
      role,
      passwordHash: bcrypt.hashSync(password, 10),
    });
    console.log("User created successfully!");
    res.redirect("/admin/overview");
  },

  async deleteUser(req, res) {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(403).render("error", {
        title: "Forbidden",
        message: "You can only delete your own slots.",
      });
    }
    await slot.destroy(); // ⚠ as-is, known bug
    res.redirect("/admin/overview");
  },

  createSubjectPage(req, res) {
    res.render("create-subjects", {
      title: "Create New Subject",
      metrics: { total: 0, upcomingWeek: 0, topSubjects: [] },
    });
  },

  async createSubject(req, res) {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).render("create-subjects", {
        title: "Create New Subject",
        error: "All fields are required.",
      });
    }

    await Subject.create({ name, code });
    res.redirect("/admin/overview");
  },

  async deleteSubject(req, res) {
    const subject = await Subject.findOne({ where: { id: req.params.id } });
    if (!subject) {
      return res.status(403).render("error", {
        title: "Forbidden",
        message: "You can only delete your own slots.",
      });
    }
    await subject.destroy();
    res.redirect("/admin/overview");
  },
};