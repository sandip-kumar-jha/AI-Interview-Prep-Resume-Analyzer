import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
} from "../services/interview.api";

import {
    useContext,
    useEffect,
    useCallback,
} from "react";

import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext);

    const { interviewId } = useParams();

    if (!context) {
        throw new Error(
            "useInterview must be used within an InterviewProvider"
        );
    }

    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
    } = context;

    /**
     * Generate new interview report
     */
    const generateReport = useCallback(
        async ({
            jobDescription,
            selfDescription,
            resumeFile,
        }) => {
            setLoading(true);

            try {
                const response =
                    await generateInterviewReport({
                        jobDescription,
                        selfDescription,
                        resumeFile,
                    });

                if (response?.interviewReport) {
                    setReport(response.interviewReport);
                }

                return (
                    response?.interviewReport || null
                );
            } catch (error) {
                console.error(
                    "GENERATE INTERVIEW REPORT ERROR:",
                    error
                );

                return null;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setReport]
    );

    /**
     * Get interview report by ID
     */
    const getReportById = useCallback(
        async (id) => {
            if (!id) {
                console.error(
                    "Interview ID is missing."
                );

                return null;
            }

            setLoading(true);

            try {
                const response =
                    await getInterviewReportById(id);

                if (response?.interviewReport) {
                    setReport(
                        response.interviewReport
                    );
                }

                return (
                    response?.interviewReport || null
                );
            } catch (error) {
                console.error(
                    "GET INTERVIEW REPORT ERROR:",
                    error
                );

                setReport(null);

                return null;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setReport]
    );

    /**
     * Get all interview reports
     */
    const getReports = useCallback(
        async () => {
            setLoading(true);

            try {
                const response =
                    await getAllInterviewReports();

                if (
                    Array.isArray(
                        response?.interviewReports
                    )
                ) {
                    setReports(
                        response.interviewReports
                    );
                } else {
                    setReports([]);
                }

                return (
                    response?.interviewReports || []
                );
            } catch (error) {
                console.error(
                    "GET INTERVIEW REPORTS ERROR:",
                    error
                );

                setReports([]);

                return [];
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setReports]
    );

    /**
     * Generate and download resume PDF
     */
    const getResumePdf = useCallback(
        async (interviewReportId) => {
            if (!interviewReportId) {
                console.error(
                    "Interview report ID is missing."
                );

                return;
            }

            setLoading(true);

            try {
                const response =
                    await generateResumePdf({
                        interviewReportId,
                    });

                const blob = new Blob(
                    [response],
                    {
                        type: "application/pdf",
                    }
                );

                const url =
                    window.URL.createObjectURL(blob);

                const link =
                    document.createElement("a");

                link.href = url;

                link.download = `resume_${interviewReportId}.pdf`;

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);

                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error(
                    "GENERATE RESUME PDF ERROR:",
                    error
                );
            } finally {
                setLoading(false);
            }
        },
        [setLoading]
    );

    /**
     * Load report when interviewId exists.
     * Otherwise load all reports.
     */
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        } else {
            getReports();
        }
    }, [
        interviewId,
        getReportById,
        getReports,
    ]);

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf,
    };
};