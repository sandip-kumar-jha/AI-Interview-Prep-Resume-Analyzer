import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

// ==========================================
// Generate Interview Report
// ==========================================

export const generateInterviewReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
}) => {
    try {
        const formData = new FormData();

        // Always append job description
        formData.append(
            "jobDescription",
            jobDescription || ""
        );

        // Always append self description
        formData.append(
            "selfDescription",
            selfDescription || ""
        );

        // Append resume only if selected
        if (resumeFile instanceof File) {
            formData.append(
                "resume",
                resumeFile,
                resumeFile.name
            );
        }

        console.log(
            "Sending interview request..."
        );

        console.log(
            "Resume:",
            resumeFile
                ? resumeFile.name
                : "No resume"
        );

        const response = await api.post(
            "/api/interview/",
            formData,
            {
                withCredentials: true,

                // Do NOT manually set Content-Type.
                // Axios/browser will automatically add:
                // multipart/form-data; boundary=...
            }
        );

        console.log(
            "Interview API response:",
            response.data
        );

        return response.data;

    } catch (error) {

        console.error(
            "GENERATE INTERVIEW REPORT API ERROR:",
            error
        );

        console.error(
            "Server response:",
            error?.response?.data
        );

        throw error;
    }
};

// ==========================================
// Get Interview Report By ID
// ==========================================

export const getInterviewReportById = async (
    interviewId
) => {
    try {

        const response = await api.get(
            `/api/interview/report/${interviewId}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "GET INTERVIEW REPORT ERROR:",
            error
        );

        throw error;
    }
};

// ==========================================
// Get All Interview Reports
// ==========================================

export const getAllInterviewReports = async () => {
    try {

        const response = await api.get(
            "/api/interview/"
        );

        return response.data;

    } catch (error) {

        console.error(
            "GET ALL INTERVIEW REPORTS ERROR:",
            error
        );

        throw error;
    }
};

// ==========================================
// Generate Resume PDF
// ==========================================

export const generateResumePdf = async ({
    interviewReportId,
}) => {
    try {

        const response = await api.post(
            `/api/interview/resume/pdf/${interviewReportId}`,
            null,
            {
                withCredentials: true,
                responseType: "blob",
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "GENERATE RESUME PDF ERROR:",
            error
        );

        throw error;
    }
};