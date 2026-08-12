const express = require("express");

const router = express.Router();

// ======================================================
// CONTROLLERS
// ======================================================

const {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
} = require("../controllers/interview.controller");

// ======================================================
// AUTH MIDDLEWARE
// ======================================================

const { authUser } = require("../middlewares/auth.middleware");

// ======================================================
// MULTER
// ======================================================

const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },

    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(
                new Error("Only PDF files are allowed."),
                false
            );
        }
    },
});

// ======================================================
// GENERATE INTERVIEW REPORT
// POST /api/interview/generate
// ======================================================

router.post(
    "/generate",
    authUser,
    upload.single("resume"),
    generateInterViewReportController
);

// ======================================================
// GET ALL INTERVIEW REPORTS
// GET /api/interview/reports
// ======================================================

router.get(
    "/reports",
    authUser,
    getAllInterviewReportsController
);

// ======================================================
// GET SINGLE INTERVIEW REPORT
// GET /api/interview/reports/:interviewId
// ======================================================

router.get(
    "/reports/:interviewId",
    authUser,
    getInterviewReportByIdController
);

// ======================================================
// GENERATE RESUME PDF
// GET /api/interview/resume/pdf/:interviewReportId
// ======================================================

router.get(
    "/resume/pdf/:interviewReportId",
    authUser,
    generateResumePdfController
);

// ======================================================
// MULTER ERROR HANDLER
// ======================================================

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message:
                    "Resume file is too large. Maximum allowed size is 5 MB.",
            });
        }

        return res.status(400).json({
            message: error.message,
        });
    }

    if (error) {
        return res.status(400).json({
            message: error.message,
        });
    }

    next();
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;