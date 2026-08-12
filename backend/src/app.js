const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===============================
// CORS
// ===============================

const allowedOrigins = [
    "https://ai-interview-prep-resume-analyzer-nu.vercel.app",
    "http://localhost:5173",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without origin
            // (Postman, server-to-server etc.)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

// ===============================
// ROUTES
// ===============================

const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Interview Prep Resume Analyzer API is running",
    });
});

module.exports = app;