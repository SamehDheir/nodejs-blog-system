require("dotenv").config();
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY_JWT;

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Authorization token is required" });
  }

  if (!token.startsWith("Bearer ")) {
    return res
      .status(403)
      .json({ message: "Invalid token format. Expected 'Bearer <token>'" });
  }

  const actualToken = token.split(" ")[1];

  try {
    const decoded = jwt.verify(actualToken, secretKey);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };
