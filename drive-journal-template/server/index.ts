import express from "express";
import { json, urlencoded } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import session from "express-session";
import { storage } from "./storage";
import path from "path";

// Create Express server
const app = express();

// Basic middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "drive-journal-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  })
);

// Register API routes
const server = registerRoutes(app);

// Serve the React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// Handle errors
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Server error",
    message: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});