const { PDFParse } = require("pdf-parse");

const {
    generateInterviewReport,
    generateResumePdf,
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Generate interview report based on
 * user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        // Authentication check
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized. Please login again.",
            });
        }

        const {
            selfDescription,
            jobDescription,
        } = req.body;

        // Job description validation
        if (
            !jobDescription ||
            !jobDescription.trim()
        ) {
            return res.status(400).json({
                message: "Job description is required.",
            });
        }

        // Resume / self description validation
        if (
            !req.file &&
            (!selfDescription ||
                !selfDescription.trim())
        ) {
            return res.status(400).json({
                message:
                    "Please upload a resume or provide self description.",
            });
        }

        let resumeText = "";

        // Parse PDF resume
        if (req.file) {
            if (
                req.file.mimetype !==
                "application/pdf"
            ) {
                return res.status(400).json({
                    message:
                        "Only PDF resume files are supported.",
                });
            }

            try {
                const parser = new PDFParse({
                    data: req.file.buffer,
                });

                const parsedResume =
                    await parser.getText();

                resumeText =
                    parsedResume?.text || "";

                await parser.destroy();
            } catch (pdfError) {
                console.error(
                    "PDF PARSING ERROR:",
                    pdfError
                );

                return res.status(400).json({
                    message:
                        "Unable to read the uploaded PDF resume.",
                    error: pdfError.message,
                });
            }
        }

        // Generate AI interview report
        const aiReport =
            await generateInterviewReport({
                resume: resumeText,
                selfDescription:
                    selfDescription || "",
                jobDescription,
            });

        // Get title from AI response
        // If AI does not return title, extract it
        // from the job description.
        const title =
            aiReport?.title &&
            typeof aiReport.title === "string" &&
            aiReport.title.trim()
                ? aiReport.title.trim()
                : extractJobTitle(jobDescription);

        // Create database record
        const interviewReport =
            await interviewReportModel.create({
                user: req.user.id,

                resume: resumeText,

                selfDescription:
                    selfDescription || "",

                jobDescription,

                title,

                matchScore:
                    Number(aiReport?.matchScore) || 0,

                technicalQuestions:
                    Array.isArray(
                        aiReport?.technicalQuestions
                    )
                        ? aiReport.technicalQuestions
                        : [],

                behavioralQuestions:
                    Array.isArray(
                        aiReport?.behavioralQuestions
                    )
                        ? aiReport.behavioralQuestions
                        : [],

                skillGaps:
                    Array.isArray(
                        aiReport?.skillGaps
                    )
                        ? aiReport.skillGaps
                        : [],

                preparationPlan:
                    Array.isArray(
                        aiReport?.preparationPlan
                    )
                        ? aiReport.preparationPlan
                        : [],
            });

        return res.status(201).json({
            message:
                "Interview report generated successfully.",

            interviewReport,
        });
    } catch (error) {
        console.error(
            "GENERATE INTERVIEW REPORT ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to generate interview report.",

            error: error.message,
        });
    }
}

/**
 * @description Extract job title from job description
 * if AI does not return a title.
 */
function extractJobTitle(jobDescription) {
    const text = String(
        jobDescription || ""
    ).trim();

    // Different possible job-title formats
    const patterns = [
        /job\s*title\s*[:\-]\s*(.+)/i,
        /position\s*[:\-]\s*(.+)/i,
        /role\s*[:\-]\s*(.+)/i,
        /designation\s*[:\-]\s*(.+)/i,
        /job\s*role\s*[:\-]\s*(.+)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);

        if (match && match[1]) {
            let title = match[1]
                .split("\n")[0]
                .trim();

            // Remove unnecessary punctuation
            title = title
                .replace(/[|,;]+$/, "")
                .trim();

            if (title.length > 100) {
                title = title.substring(0, 100);
            }

            if (title.length > 2) {
                return title;
            }
        }
    }

    // Common job titles
    const commonTitles = [
        "Frontend Developer",
        "Frontend Engineer",
        "Backend Developer",
        "Backend Engineer",
        "Full Stack Developer",
        "Full Stack Engineer",
        "Software Developer",
        "Software Engineer",
        "React Developer",
        "React Engineer",
        "Node.js Developer",
        "Node Developer",
        "MERN Stack Developer",
        "MERN Developer",
        "Data Analyst",
        "Data Scientist",
        "Machine Learning Engineer",
        "Python Developer",
        "Java Developer",
        "Web Developer",
        "UI/UX Designer",
        "DevOps Engineer",
        "Cloud Engineer",
        "Mobile App Developer",
        "Android Developer",
        "iOS Developer",
    ];

    for (const title of commonTitles) {
        if (
            text
                .toLowerCase()
                .includes(title.toLowerCase())
        ) {
            return title;
        }
    }

    return "Interview Preparation Plan";
}

/**
 * @description Get interview report by interview ID.
 */
async function getInterviewReportByIdController(
    req,
    res
) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message:
                    "Unauthorized. Please login again.",
            });
        }

        const { interviewId } = req.params;

        const interviewReport =
            await interviewReportModel.findOne({
                _id: interviewId,
                user: req.user.id,
            });

        if (!interviewReport) {
            return res.status(404).json({
                message:
                    "Interview report not found.",
            });
        }

        return res.status(200).json({
            message:
                "Interview report fetched successfully.",

            interviewReport,
        });
    } catch (error) {
        console.error(
            "GET INTERVIEW REPORT ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch interview report.",

            error: error.message,
        });
    }
}

/**
 * @description Get all interview reports
 * of logged in user.
 */
async function getAllInterviewReportsController(
    req,
    res
) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message:
                    "Unauthorized. Please login again.",
            });
        }

        const interviewReports =
            await interviewReportModel
                .find({
                    user: req.user.id,
                })
                .sort({
                    createdAt: -1,
                })
                .select(
                    "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
                );

        return res.status(200).json({
            message:
                "Interview reports fetched successfully.",

            interviewReports,
        });
    } catch (error) {
        console.error(
            "GET ALL INTERVIEW REPORTS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch interview reports.",

            error: error.message,
        });
    }
}

/**
 * @description Generate resume PDF based on
 * stored interview report.
 */
async function generateResumePdfController(
    req,
    res
) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message:
                    "Unauthorized. Please login again.",
            });
        }

        const {
            interviewReportId,
        } = req.params;

        const interviewReport =
            await interviewReportModel.findOne({
                _id: interviewReportId,
                user: req.user.id,
            });

        if (!interviewReport) {
            return res.status(404).json({
                message:
                    "Interview report not found.",
            });
        }

        const {
            resume,
            jobDescription,
            selfDescription,
        } = interviewReport;

        const pdfBuffer =
            await generateResumePdf({
                resume: resume || "",
                jobDescription:
                    jobDescription || "",
                selfDescription:
                    selfDescription || "",
            });

        res.set({
            "Content-Type": "application/pdf",

            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`,

            "Content-Length":
                pdfBuffer.length,
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error(
            "GENERATE RESUME PDF ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to generate resume PDF.",

            error: error.message,
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
};