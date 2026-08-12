import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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

        // Job Description
        formData.append(
            "jobDescription",
            jobDescription || ""
        );

        // Self Description
        formData.append(
            "selfDescription",
            selfDescription || ""
        );

        // Resume File
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

        console.error(
            "Server response:",
            error?.response?.data
        );

        throw error;
    }
};

// ==========================================
// Get All Interview Reports
// ==========================================

export const getAllInterviewReports =
    async () => {
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

            console.error(
                "Server response:",
                error?.response?.data
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

        console.error(
            "Server response:",
            error?.response?.data
        );

        throw error;
    }
};

// ==========================================
// Export API instance
// ==========================================

export default api;