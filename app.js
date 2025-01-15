require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoute");
const { verifyToken } = require("./src/middleware/authMiddleware");
const postRoutes = require("./src/routes/postRoute");
const categoryRoutes = require("./src/routes/categoryRoute");

const app = express();

const port = process.env.PORT;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Route
app.use("/auth", authRoutes);
app.use("/api", postRoutes);
app.use("/api", categoryRoutes);

app.use("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});
// Catch-all route for handling 404 errors
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
