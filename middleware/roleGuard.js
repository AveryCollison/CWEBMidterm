export function requireRole(role) {
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
