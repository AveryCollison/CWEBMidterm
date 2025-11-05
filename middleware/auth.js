import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_COOKIE = "access_token";

export function signAccessToken(user, ttlSeconds = 15 * 60) {
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

export function getBearerToken(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export function requireAuth(req, res, next) {
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
    res.locals.user = payload;
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
