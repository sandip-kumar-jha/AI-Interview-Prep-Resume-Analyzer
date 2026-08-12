const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
    "http://localhost:5173",
    "https://ai-interview-prep-resume-analyzer-psi.vercel.app",
    "https://ai-interview-prep-resume-analyzer-nu.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an Origin
            // Postman, curl, server-to-server etc.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("CORS blocked origin:", origin);

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(cookieParser());

// ======================================================
// ROUTES
// ======================================================

const authRouter = require("./routes/auth.routes");

const interviewRouter = require("./routes/interview.routes");

app.use(
    "/api/auth",
    authRouter
);

app.use(
    "/api/interview",
    interviewRouter
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message:
            "AI Interview Prep Resume Analyzer API is running",
    });
});

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
    console.error(
        "SERVER ERROR:",
        err
    );

    // CORS error
    if (
        err.message ===
        "Not allowed by CORS"
    ) {
        return res.status(403).json({
            success: false,
            message:
                "CORS origin not allowed",
        });
    }

    // Multer / other known errors
    return res.status(500).json({
        success: false,
        message:
            err.message ||
            "Internal Server Error",
    });
});

// ======================================================
// EXPORT
// ======================================================

module.exports = app;