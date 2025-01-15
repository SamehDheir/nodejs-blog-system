// Check if the user is authenticated
const checkUser = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Access denied, you must be logged in" });
  }
  next();
};

// Middleware to check if the user has the required role(s)
const checkRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}`,
    });
  }
  next();
};

// Export role-based middlewares
module.exports = {
  checkUser, 
  checkAdmin: checkRole(["admin"]),
  checkEditor: checkRole(["editor"]), 
  checkAdminOrEditor: checkRole(["admin", "editor"]), 
  checkUserRole: checkRole(["user", "editor", "admin"]), 
};
