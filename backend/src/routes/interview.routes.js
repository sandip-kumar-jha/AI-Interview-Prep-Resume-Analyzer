const express = require("express");

const {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
} = require("../controllers/interview.controller");

const { authUser } = require("../middlewares/auth.middleware");

const multer = require("multer");

const router = express.Router();

// ======================================================
// MULTER CONFIG
// ======================================================

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
                new Error(
                    "Only PDF resume files are allowed."
                ),
                false
            );
        }
    },
});

// ======================================================
// GENERATE INTERVIEW REPORT
// POST /api/interview/
// ======================================================

router.post(
    "/",
    authUser,
    upload.single("resume"),
    generateInterViewReportController
);

// ======================================================
// GET ALL INTERVIEW REPORTS
// GET /api/interview/
// ======================================================

router.get(
    "/",
    authUser,
    getAllInterviewReportsController
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
// GET SINGLE INTERVIEW REPORT
// GET /api/interview/:interviewId
// ======================================================

router.get(
    "/:interviewId",
    authUser,
    getInterviewReportByIdController
);

// ======================================================
// MULTER / ROUTE ERROR HANDLER
// ======================================================

router.use((error, req, res, next) => {
    console.error(
        "INTERVIEW ROUTE ERROR:",
        error
    );

    return res.status(400).json({
        success: false,
        message:
            error.message ||
            "Interview request failed.",
    });
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;