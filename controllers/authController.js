import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { User } from "../models/index.js";
import { signAccessToken } from "../middleware/auth.js";

const ACCESS_COOKIE = "access_token";

export const loginValidators = [
  body("email").trim().isEmail().withMessage("Valid email is required."),
  body("password")
    .isString()
    .isLength({ min: 4 })
    .withMessage("Password is required."),
];

export const authController = {
  loginPage(req, res) {
    res.render("login", {
      title: "Login",
      form: {
        email: "student@example.com",
        password: "student123",
        useCookie: true,
      },
      error: null,
      token: null,
    });
  },

  async login(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).render("login", {
        title: "Login",
        form: {
          email: req.body.email || "",
          password: "",
          useCookie: !!req.body.useCookie,
        },
        error: result.array()[0]?.msg || "Invalid form input.",
        token: null,
      });
    }

    const { email, password, useCookie } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

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

    return res.status(200).render("login", {
      title: "Login",
      form: { email, password: "", useCookie: false },
      error: null,
      token: accessToken,
    });
  },

  logout(req, res) {
    res.clearCookie(ACCESS_COOKIE, { httpOnly: true, sameSite: "lax" });
    res.redirect("/");
  },
};
