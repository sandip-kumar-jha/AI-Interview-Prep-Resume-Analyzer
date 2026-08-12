const express = require("express");
const multer = require("multer");

const {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
} = require("../controllers/interview.controller");

const { authUser } = require("../middlewares/auth.middleware");

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
// GET SINGLE INTERVIEW REPORT
// GET /api/interview/report/:interviewId
// ======================================================

router.get(
    "/report/:interviewId",
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
// MULTER / ROUTE ERROR HANDLER
// ======================================================

router.use((error, req, res, next) => {
    console.error(
        "INTERVIEW ROUTE ERROR:",
        error
    );

    return res.status(400).json({
        message:
            error?.message ||
            "Interview request failed.",
    });
});

module.exports = router;