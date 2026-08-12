import React, { useState } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useParams } from "react-router";

const NAV_ITEMS = [
    {
        id: "technical",
        label: "Technical Questions",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        ),
    },
    {
        id: "behavioral",
        label: "Behavioral Questions",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
        ),
    },
    {
        id: "roadmap",
        label: "Road Map",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
];

// Question Card
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="q-card">
            <div
                className="q-card__header"
                onClick={() => setOpen((value) => !value)}
            >
                <span className="q-card__index">
                    Q{index + 1}
                </span>

                <p className="q-card__question">
                    {item?.question || "Question unavailable"}
                </p>

                <span
                    className={`q-card__chevron ${
                        open ? "q-card__chevron--open" : ""
                    }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </div>

            {open && (
                <div className="q-card__body">
                    <div className="q-card__section">
                        <span className="q-card__tag q-card__tag--intention">
                            Intention
                        </span>

                        <p>
                            {item?.intention ||
                                "No intention available."}
                        </p>
                    </div>

                    <div className="q-card__section">
                        <span className="q-card__tag q-card__tag--answer">
                            Model Answer
                        </span>

                        <p>
                            {item?.answer ||
                                "No model answer available."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Roadmap Day
const RoadMapDay = ({ day }) => {
    return (
        <div className="roadmap-day">
            <div className="roadmap-day__header">
                <span className="roadmap-day__badge">
                    Day {day?.day}
                </span>

                <h3 className="roadmap-day__focus">
                    {day?.focus || "Preparation"}
                </h3>
            </div>

            <ul className="roadmap-day__tasks">
                {(day?.tasks || []).map((task, index) => (
                    <li key={index}>
                        <span className="roadmap-day__bullet" />
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Main Component
const Interview = () => {
    const [activeNav, setActiveNav] = useState("technical");

    const {
        report,
        loading,
        getResumePdf,
    } = useInterview();

    const { interviewId } = useParams();

    /*
     * useInterview hook already report fetch karta hai.
     * Yahan dobara getReportById call nahi karna hai.
     */

    if (loading) {
        return (
            <main className="loading-screen">
                <h1>Loading your interview plan...</h1>
            </main>
        );
    }

    if (!report) {
        return (
            <main className="loading-screen">
                <h1>Interview report not found.</h1>

                <p>
                    Please go back and generate the interview report again.
                </p>
            </main>
        );
    }

    const technicalQuestions =
        Array.isArray(report.technicalQuestions)
            ? report.technicalQuestions
            : [];

    const behavioralQuestions =
        Array.isArray(report.behavioralQuestions)
            ? report.behavioralQuestions
            : [];

    const preparationPlan =
        Array.isArray(report.preparationPlan)
            ? report.preparationPlan
            : [];

    const skillGaps =
        Array.isArray(report.skillGaps)
            ? report.skillGaps
            : [];

    const score = Number(report.matchScore) || 0;

    const scoreColor =
        score >= 80
            ? "score--high"
            : score >= 60
            ? "score--mid"
            : "score--low";

    const handleDownloadResume = async () => {
        try {
            if (!interviewId) {
                console.error("Interview ID is missing.");
                return;
            }

            await getResumePdf(interviewId);
        } catch (error) {
            console.error(
                "DOWNLOAD RESUME ERROR:",
                error
            );
        }
    };

    return (
        <div className="interview-page">
            <div className="interview-layout">

                {/* LEFT NAVIGATION */}
                <nav className="interview-nav">
                    <div className="nav-content">
                        <p className="interview-nav__label">
                            Sections
                        </p>

                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`interview-nav__item ${
                                    activeNav === item.id
                                        ? "interview-nav__item--active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setActiveNav(item.id)
                                }
                            >
                                <span className="interview-nav__icon">
                                    {item.icon}
                                </span>

                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* DOWNLOAD RESUME */}
                    <button
                        type="button"
                        onClick={handleDownloadResume}
                        className="button primary-button"
                    >
                        <svg
                            height="0.8rem"
                            style={{
                                marginRight: "0.8rem",
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 21h14a2 2 0 0 0 2-2v-1H3v1a2 2 0 0 0 2 2Z" />
                        </svg>

                        Download Resume
                    </button>
                </nav>

                <div className="interview-divider" />

                {/* CENTER CONTENT */}
                <main className="interview-content">

                    {/* TECHNICAL */}
                    {activeNav === "technical" && (
                        <section>
                            <div className="content-header">
                                <h2>
                                    Technical Questions
                                </h2>

                                <span className="content-header__count">
                                    {technicalQuestions.length} questions
                                </span>
                            </div>

                            <div className="q-list">
                                {technicalQuestions.length > 0 ? (
                                    technicalQuestions.map(
                                        (question, index) => (
                                            <QuestionCard
                                                key={index}
                                                item={question}
                                                index={index}
                                            />
                                        )
                                    )
                                ) : (
                                    <p>
                                        No technical questions available.
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* BEHAVIORAL */}
                    {activeNav === "behavioral" && (
                        <section>
                            <div className="content-header">
                                <h2>
                                    Behavioral Questions
                                </h2>

                                <span className="content-header__count">
                                    {behavioralQuestions.length} questions
                                </span>
                            </div>

                            <div className="q-list">
                                {behavioralQuestions.length > 0 ? (
                                    behavioralQuestions.map(
                                        (question, index) => (
                                            <QuestionCard
                                                key={index}
                                                item={question}
                                                index={index}
                                            />
                                        )
                                    )
                                ) : (
                                    <p>
                                        No behavioral questions available.
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ROADMAP */}
                    {activeNav === "roadmap" && (
                        <section>
                            <div className="content-header">
                                <h2>
                                    Preparation Road Map
                                </h2>

                                <span className="content-header__count">
                                    {preparationPlan.length}-day plan
                                </span>
                            </div>

                            <div className="roadmap-list">
                                {preparationPlan.length > 0 ? (
                                    preparationPlan.map(
                                        (day, index) => (
                                            <RoadMapDay
                                                key={
                                                    day?.day ??
                                                    index
                                                }
                                                day={day}
                                            />
                                        )
                                    )
                                ) : (
                                    <p>
                                        No preparation plan available.
                                    </p>
                                )}
                            </div>
                        </section>
                    )}
                </main>

                <div className="interview-divider" />

                {/* RIGHT SIDEBAR */}
                <aside className="interview-sidebar">

                    {/* MATCH SCORE */}
                    <div className="match-score">
                        <p className="match-score__label">
                            Match Score
                        </p>

                        <div
                            className={`match-score__ring ${scoreColor}`}
                        >
                            <span className="match-score__value">
                                {score}
                            </span>

                            <span className="match-score__pct">
                                %
                            </span>
                        </div>

                        <p className="match-score__sub">
                            {score >= 80
                                ? "Strong match for this role"
                                : score >= 60
                                ? "Moderate match for this role"
                                : "Needs improvement for this role"}
                        </p>
                    </div>

                    <div className="sidebar-divider" />

                    {/* SKILL GAPS */}
                    <div className="skill-gaps">
                        <p className="skill-gaps__label">
                            Skill Gaps
                        </p>

                        <div className="skill-gaps__list">
                            {skillGaps.length > 0 ? (
                                skillGaps.map(
                                    (gap, index) => (
                                        <span
                                            key={index}
                                            className={`skill-tag skill-tag--${
                                                gap?.severity ||
                                                "low"
                                            }`}
                                        >
                                            {gap?.skill ||
                                                "Unknown skill"}
                                        </span>
                                    )
                                )
                            ) : (
                                <p>
                                    No major skill gaps found.
                                </p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Interview;