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
        fileSize: 5 * 1024 * 1024,
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
// TEST
// GET /api/interview/test
// ======================================================

router.get("/test", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Interview route is working",
    });
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
// GET ALL REPORTS
// GET /api/interview/
// ======================================================

router.get(
    "/",
    authUser,
    getAllInterviewReportsController
);

// ======================================================
// GET SINGLE REPORT
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
// ERROR HANDLER
// ======================================================

router.use((error, req, res, next) => {
    console.error("INTERVIEW ROUTE ERROR:", error);

    return res.status(400).json({
        success: false,
        message:
            error?.message ||
            "Interview request failed.",
    });
});

module.exports = router;