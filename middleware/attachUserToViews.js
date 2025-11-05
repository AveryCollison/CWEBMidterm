import jwt from "jsonwebtoken";
import { getBearerToken } from "./auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_COOKIE = "access_token";

export function attachUserToViews(req, res, next) {
  const token = req.cookies[ACCESS_COOKIE] || getBearerToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = req.user || payload;
    res.locals.user = payload;
  } catch {}
  next();
}
