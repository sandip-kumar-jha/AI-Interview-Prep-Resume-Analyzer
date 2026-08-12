const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

// ======================================================
// GEMINI AI
// ======================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const GEMINI_MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3-flash-preview";

console.log("Gemini model:", GEMINI_MODEL);

// ======================================================
// INTERVIEW REPORT SCHEMA
// ======================================================

const interviewQuestionSchema = z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string(),
});

const skillGapSchema = z.object({
    skill: z.string(),
    severity: z.enum([
        "low",
        "medium",
        "high",
    ]),
});

const preparationDaySchema = z.object({
    day: z.number(),
    focus: z.string(),
    tasks: z.array(z.string()),
});

const interviewReportSchema = z.object({
    matchScore: z
        .number()
        .min(0)
        .max(100),

    technicalQuestions: z.array(
        interviewQuestionSchema
    ),

    behavioralQuestions: z.array(
        interviewQuestionSchema
    ),

    skillGaps: z.array(
        skillGapSchema
    ),

    preparationPlan: z.array(
        preparationDaySchema
    ),

    title: z.string(),
});

// ======================================================
// RESUME PDF SCHEMA
// ======================================================

const resumePdfSchema = z.object({
    html: z.string(),
});

// ======================================================
// SLEEP
// ======================================================

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// ======================================================
// CLEAN JSON
// ======================================================

function cleanJsonText(text) {
    if (!text) {
        return "";
    }

    let cleaned = text.trim();

    cleaned = cleaned.replace(
        /^```json\s*/i,
        ""
    );

    cleaned = cleaned.replace(
        /^```\s*/i,
        ""
    );

    cleaned = cleaned.replace(
        /\s*```$/i,
        ""
    );

    return cleaned.trim();
}

// ======================================================
// REMOVE DUPLICATE QUESTIONS
// ======================================================

function removeDuplicateQuestions(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    const seen = new Set();

    return items.filter((item) => {
        if (
            !item ||
            typeof item !== "object"
        ) {
            return false;
        }

        const question = String(
            item.question || ""
        )
            .trim()
            .toLowerCase();

        if (!question) {
            return false;
        }

        if (seen.has(question)) {
            return false;
        }

        seen.add(question);

        return true;
    });
}

// ======================================================
// TECHNICAL FALLBACK ANSWER
// ======================================================

function getTechnicalFallbackAnswer(
    question
) {
    const q = String(
        question || ""
    ).toLowerCase();

    if (
        q.includes("react") &&
        q.includes("virtual dom")
    ) {
        return "React uses a Virtual DOM as a lightweight representation of the actual DOM. When the state or props of a component change, React creates a new Virtual DOM representation and compares it with the previous one. It then updates only the parts of the real DOM that actually changed. This helps React build efficient and responsive user interfaces.";
    }

    if (
        q.includes("react") &&
        q.includes("state")
    ) {
        return "State in React represents data that can change during the lifetime of a component. When state is updated using the appropriate state setter, React re-renders the component so the UI reflects the new value. I would use state for values such as form inputs, selected items, loading status or API results that need to change based on user interaction or application events.";
    }

    if (
        q.includes("javascript") &&
        q.includes("closure")
    ) {
        return "A closure occurs when a function remembers and can access variables from its outer lexical scope even after the outer function has finished executing. Closures are useful for data encapsulation, callbacks and maintaining private state. For example, a function can return another function that continues to access a variable created in the original function.";
    }

    if (
        q.includes("javascript") &&
        q.includes("promise")
    ) {
        return "A Promise represents the eventual completion or failure of an asynchronous operation. It can be in a pending, fulfilled or rejected state. In modern JavaScript, I commonly use async and await with Promises because it makes asynchronous code easier to read and allows errors to be handled with try and catch.";
    }

    if (
        q.includes("api") ||
        q.includes("rest")
    ) {
        return "A REST API allows different applications to communicate through HTTP requests. Common methods include GET for retrieving data, POST for creating data, PUT or PATCH for updating data, and DELETE for removing data. In a frontend application, I would call the API, handle loading and error states, validate the response and then update the UI with the returned data.";
    }

    if (
        q.includes("mongodb")
    ) {
        return "MongoDB is a NoSQL document database that stores data in flexible JSON-like documents. In a Node.js application, it can be used with Mongoose to define schemas, validate data and interact with collections. I would use appropriate indexes for frequently queried fields and design the document structure according to the application's access patterns.";
    }

    if (
        q.includes("express")
    ) {
        return "Express.js is a lightweight Node.js framework used for building web servers and REST APIs. It provides routing, middleware support and request-response handling. In a backend application, I would separate routes, controllers, services and models so that the code remains maintainable and easier to test.";
    }

    if (
        q.includes("node")
    ) {
        return "Node.js allows JavaScript to run outside the browser using the V8 JavaScript engine. It is particularly useful for backend applications because its event-driven and non-blocking I/O model can efficiently handle many concurrent requests. I would typically use Node.js with Express for API development and MongoDB for data persistence.";
    }

    if (
        q.includes("sql")
    ) {
        return "SQL is used to store, retrieve and analyze structured data in relational databases. Important operations include SELECT, WHERE, JOIN, GROUP BY, ORDER BY and aggregate functions such as COUNT and SUM. For analytics work, I would use joins to combine related tables and grouping and aggregation to generate meaningful business metrics.";
    }

    if (
        q.includes("power bi")
    ) {
        return "Power BI is a business intelligence tool used to connect, transform, model and visualize data. I would typically clean data using Power Query, create a suitable data model, define measures using DAX and then build interactive reports using charts, slicers and filters. A good Power BI dashboard should focus on useful business questions rather than simply displaying many visualizations.";
    }

    if (
        q.includes("python") &&
        (
            q.includes("pandas") ||
            q.includes("data")
        )
    ) {
        return "Python is widely used for data analysis because of libraries such as Pandas and NumPy. Pandas provides DataFrame structures and functions for cleaning, filtering, grouping and transforming data, while NumPy provides efficient numerical operations. I would normally inspect the data first, handle missing or incorrect values, perform analysis and then visualize or export the results.";
    }

    if (
        q.includes("git")
    ) {
        return "Git is a distributed version control system used to track changes in source code. I would create meaningful commits, use branches for separate features or fixes and merge changes after testing. Git also makes collaboration safer because developers can work independently and review changes before integrating them into the main branch.";
    }

    if (
        q.includes("authentication") ||
        q.includes("jwt")
    ) {
        return "Authentication verifies the identity of a user, while authorization determines what that authenticated user is allowed to access. JWT can be used to represent authenticated sessions by signing a token containing relevant claims. On protected routes, the backend verifies the token before allowing access to private resources.";
    }

    if (
        q.includes("responsive") ||
        q.includes("responsive design")
    ) {
        return "Responsive design means creating interfaces that adapt to different screen sizes and devices. I would use flexible layouts, CSS media queries, relative units and responsive components instead of relying on fixed dimensions. I would also test the interface at different viewport sizes to make sure navigation, forms and content remain usable.";
    }

    if (
        q.includes("css")
    ) {
        return "CSS controls the presentation and layout of web pages. I prefer organizing styles into reusable classes or component-level styles and using Flexbox or Grid for modern layouts. For responsive applications, I combine flexible dimensions with media queries and make sure the layout works across desktop, tablet and mobile screen sizes.";
    }

    if (
        q.includes("html")
    ) {
        return "HTML provides the semantic structure of a web page. I use semantic elements such as header, nav, main, section, article and footer where appropriate. Good HTML improves accessibility, maintainability and search engine understanding, while CSS and JavaScript are then used for presentation and behavior.";
    }

    if (
        q.includes("dax")
    ) {
        return "DAX is the expression language used in Power BI for creating calculated measures and columns. Measures are especially useful for dynamic calculations because they respond to the current filter context. I would use measures for metrics such as total sales, average revenue, growth percentages and other calculations required by the dashboard.";
    }

    if (
        q.includes("excel")
    ) {
        return "Excel is useful for data cleaning, analysis and reporting. I would use formulas, sorting, filtering, conditional formatting, PivotTables and charts depending on the requirement. For larger analytical workflows, I would first clean and structure the data properly and then create summary calculations or dashboards from the cleaned dataset.";
    }

    return "I would approach this problem by first understanding the requirement, identifying the relevant concepts and then implementing the solution in small testable steps. I would validate the result with realistic test cases and check edge cases before considering the implementation complete. If the issue involved an existing project, I would also inspect logs, reproduce the problem and isolate the root cause before changing the code.";
}

// ======================================================
// BEHAVIORAL FALLBACK ANSWER
// ======================================================

function getBehavioralFallbackAnswer(
    question,
    index
) {
    const answers = [
        "During one of my academic web development projects, I faced a technical issue that was preventing a feature from working as expected. I first reproduced the problem and checked the browser console and network requests to understand what was happening. Instead of changing multiple parts of the code at once, I isolated the issue and tested the related component separately. After identifying the incorrect logic, I fixed it and tested the feature with different inputs. The experience taught me to approach debugging systematically and focus on the root cause rather than making random changes.",

        "While working on my projects, I have had situations where I needed to learn a technology that was unfamiliar to me. I started by understanding the basic concepts and then created a small example to test them independently. Once I understood how the technology worked, I integrated it into my main project and solved the issues that appeared during implementation. This approach helped me learn faster because I was combining theory with practical work. It also taught me that when I face an unfamiliar technology, breaking it into smaller concepts makes the learning process much easier.",

        "One challenge I have experienced during project development is managing multiple tasks while working toward a deadline. I handled it by first listing the required features and separating them into smaller tasks. I completed the core functionality first and then focused on improvements and UI details. I also tested each completed feature instead of waiting until the end to test everything together. This helped me identify problems earlier and avoid last-minute debugging. From that experience, I learned that prioritization and incremental testing are important when working under time constraints.",

        "During a project, I encountered a situation where my initial approach was not producing the expected result. Instead of continuing with the same approach, I reviewed the requirement, checked my implementation and looked for a simpler solution. I used documentation and practical testing to compare different approaches before choosing one. After implementing the improved approach, I tested it with multiple scenarios. This experience helped me understand that being flexible is important in software development. A solution that looks good initially may need to be changed when testing reveals a better or more reliable approach.",

        "When I work on a project, I try to keep communication clear and make sure that everyone involved understands what needs to be completed. In academic and project work, I prefer dividing larger requirements into smaller responsibilities and discussing any blockers early. If I face a problem, I explain what I have already tried instead of simply saying that something is not working. This makes it easier to find a solution and prevents duplicated effort. I believe good teamwork in software development depends on communication, responsibility and being willing to help solve problems together.",

        "One of the important lessons I have learned from building projects is that finishing the code is not the same as finishing the feature. After implementing functionality, I test different inputs, check edge cases and verify how the UI behaves when something goes wrong. For example, when working with APIs, I consider loading states, failed requests and unexpected responses instead of only testing the successful case. This habit has helped me become more careful about application quality and has improved the way I approach development and debugging.",

        "When I receive feedback about my work, I try to understand the reason behind the feedback instead of taking it personally. If someone points out that a part of my implementation or UI can be improved, I review the suggestion and compare it with the project requirement. If the suggestion makes the solution better, I implement it and test the result. I consider feedback an opportunity to improve because software development involves continuous learning. This mindset helps me identify weaknesses in my approach and improve the quality of my future projects."
    ];

    return answers[
        index % answers.length
    ];
}

// ======================================================
// NORMALIZE INTERVIEW REPORT
// ======================================================

function normalizeInterviewReport(report) {
    const normalized = {
        matchScore: 0,

        technicalQuestions: [],

        behavioralQuestions: [],

        skillGaps: [],

        preparationPlan: [],

        title:
            "Interview Preparation Plan",
    };

    // ==================================================
    // MATCH SCORE
    // ==================================================

    const score = Number(
        report?.matchScore
    );

    if (!Number.isNaN(score)) {
        normalized.matchScore =
            Math.min(
                100,
                Math.max(0, score)
            );
    }

    // ==================================================
    // TITLE
    // ==================================================

    if (
        typeof report?.title === "string" &&
        report.title.trim()
    ) {
        normalized.title =
            report.title.trim();
    }

    // ==================================================
    // TECHNICAL QUESTIONS
    // ==================================================

    if (
        Array.isArray(
            report?.technicalQuestions
        )
    ) {
        normalized.technicalQuestions =
            report.technicalQuestions
                .map((item) => {
                    if (
                        item &&
                        typeof item === "object" &&
                        !Array.isArray(item)
                    ) {
                        const question =
                            String(
                                item.question ||
                                ""
                            ).trim();

                        if (!question) {
                            return null;
                        }

                        const answer =
                            String(
                                item.answer ||
                                ""
                            ).trim();

                        return {
                            question,

                            intention:
                                String(
                                    item.intention ||
                                    "Evaluates the candidate's technical knowledge and practical problem-solving ability."
                                ).trim(),

                            answer:
                                answer ||
                                getTechnicalFallbackAnswer(
                                    question
                                ),
                        };
                    }

                    if (
                        typeof item === "string"
                    ) {
                        const question =
                            item.trim();

                        if (!question) {
                            return null;
                        }

                        return {
                            question,

                            intention:
                                "Evaluates the candidate's technical knowledge and practical problem-solving ability.",

                            answer:
                                getTechnicalFallbackAnswer(
                                    question
                                ),
                        };
                    }

                    return null;
                })
                .filter(Boolean);
    }

    normalized.technicalQuestions =
        removeDuplicateQuestions(
            normalized.technicalQuestions
        );

    // ==================================================
    // BEHAVIORAL QUESTIONS
    // ==================================================

    if (
        Array.isArray(
            report?.behavioralQuestions
        )
    ) {
        normalized.behavioralQuestions =
            report.behavioralQuestions
                .map((item, index) => {
                    if (
                        item &&
                        typeof item === "object" &&
                        !Array.isArray(item)
                    ) {
                        const question =
                            String(
                                item.question ||
                                ""
                            ).trim();

                        if (!question) {
                            return null;
                        }

                        const answer =
                            String(
                                item.answer ||
                                ""
                            ).trim();

                        return {
                            question,

                            intention:
                                String(
                                    item.intention ||
                                    "Evaluates communication, teamwork, adaptability and problem-solving ability."
                                ).trim(),

                            answer:
                                answer ||
                                getBehavioralFallbackAnswer(
                                    question,
                                    index
                                ),
                        };
                    }

                    if (
                        typeof item === "string"
                    ) {
                        const question =
                            item.trim();

                        if (!question) {
                            return null;
                        }

                        return {
                            question,

                            intention:
                                "Evaluates communication, teamwork, adaptability and problem-solving ability.",

                            answer:
                                getBehavioralFallbackAnswer(
                                    question,
                                    index
                                ),
                        };
                    }

                    return null;
                })
                .filter(Boolean);
    }

    normalized.behavioralQuestions =
        removeDuplicateQuestions(
            normalized.behavioralQuestions
        );

    // ==================================================
    // FINAL ANSWER SAFETY CHECK
    // ==================================================

    normalized.technicalQuestions =
        normalized.technicalQuestions.map(
            (item) => ({
                ...item,

                answer:
                    item.answer &&
                    item.answer.trim()
                        ? item.answer.trim()
                        : getTechnicalFallbackAnswer(
                              item.question
                          ),
            })
        );

    normalized.behavioralQuestions =
        normalized.behavioralQuestions.map(
            (item, index) => ({
                ...item,

                answer:
                    item.answer &&
                    item.answer.trim()
                        ? item.answer.trim()
                        : getBehavioralFallbackAnswer(
                              item.question,
                              index
                          ),
            })
        );

    // ==================================================
    // SKILL GAPS
    // ==================================================

    if (
        Array.isArray(
            report?.skillGaps
        )
    ) {
        normalized.skillGaps =
            report.skillGaps
                .map((item) => {
                    if (
                        item &&
                        typeof item === "object" &&
                        !Array.isArray(item)
                    ) {
                        const severity =
                            [
                                "low",
                                "medium",
                                "high",
                            ].includes(
                                item.severity
                            )
                                ? item.severity
                                : "medium";

                        const skill =
                            String(
                                item.skill ||
                                ""
                            ).trim();

                        if (!skill) {
                            return null;
                        }

                        return {
                            skill,
                            severity,
                        };
                    }

                    if (
                        typeof item === "string"
                    ) {
                        const skill =
                            item.trim();

                        if (!skill) {
                            return null;
                        }

                        return {
                            skill,
                            severity:
                                "medium",
                        };
                    }

                    return null;
                })
                .filter(Boolean);
    }

    // ==================================================
    // PREPARATION PLAN
    // ==================================================

    if (
        Array.isArray(
            report?.preparationPlan
        )
    ) {
        normalized.preparationPlan =
            report.preparationPlan
                .map((item, index) => {
                    if (
                        item &&
                        typeof item === "object" &&
                        !Array.isArray(item)
                    ) {
                        return {
                            day:
                                Number(
                                    item.day
                                ) ||
                                index + 1,

                            focus:
                                String(
                                    item.focus ||
                                    "Interview Preparation"
                                ).trim(),

                            tasks:
                                Array.isArray(
                                    item.tasks
                                )
                                    ? item.tasks
                                          .map(
                                              (
                                                  task
                                              ) =>
                                                  String(
                                                      task
                                                  ).trim()
                                          )
                                          .filter(
                                              Boolean
                                          )
                                    : [],
                        };
                    }

                    if (
                        typeof item === "string"
                    ) {
                        return {
                            day:
                                index + 1,

                            focus:
                                "Interview Preparation",

                            tasks: [
                                item.trim(),
                            ],
                        };
                    }

                    return null;
                })
                .filter(Boolean);
    }

    return normalized;
}

// ======================================================
// GEMINI REQUEST
// ======================================================

async function generateGeminiContent({
    prompt,
    schema,
    maxRetries = 3,
}) {
    let lastError = null;

    for (
        let attempt = 1;
        attempt <= maxRetries;
        attempt++
    ) {
        try {
            console.log(
                `Gemini request attempt ${attempt}/${maxRetries}...`
            );

            const response =
                await ai.models.generateContent({
                    model: GEMINI_MODEL,

                    contents: prompt,

                    config: {
                        responseMimeType:
                            "application/json",

                        responseSchema:
                            zodToJsonSchema(
                                schema
                            ),

                        temperature: 0.7,
                    },
                });

            const text =
                response?.text;

            if (!text) {
                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            const cleaned =
                cleanJsonText(text);

            let parsed;

            try {
                parsed =
                    JSON.parse(cleaned);
            } catch (jsonError) {
                console.error(
                    "Gemini returned invalid JSON:"
                );

                console.error(
                    cleaned
                );

                throw new Error(
                    "Gemini returned invalid JSON."
                );
            }

            return parsed;

        } catch (error) {
            lastError = error;

            const status =
                error?.status ||
                error?.code ||
                error?.response?.status;

            console.error(
                `Gemini attempt ${attempt} failed:`,
                error?.message ||
                    error
            );

            const shouldRetry =
                status === 429 ||
                status === 500 ||
                status === 502 ||
                status === 503 ||
                status === 504;

            if (
                !shouldRetry ||
                attempt === maxRetries
            ) {
                break;
            }

            const delay =
                attempt * 4000;

            console.log(
                `Gemini temporarily unavailable. Retrying in ${delay / 1000} seconds...`
            );

            await sleep(delay);
        }
    }

    throw lastError;
}

// ======================================================
// GENERATE INTERVIEW REPORT
// ======================================================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    if (
        !jobDescription ||
        !jobDescription.trim()
    ) {
        throw new Error(
            "Job description is required."
        );
    }

    if (
        (!resume || !resume.trim()) &&
        (!selfDescription ||
            !selfDescription.trim())
    ) {
        throw new Error(
            "Please provide a resume or self-description."
        );
    }

    const prompt = `

You are an expert technical recruiter, interview coach and hiring manager.

Create a complete, realistic and personalized interview preparation report.

==================================================
CANDIDATE RESUME
==================================================

${resume || "No resume provided"}

==================================================
CANDIDATE SELF DESCRIPTION
==================================================

${selfDescription || "No self description provided"}

==================================================
JOB DESCRIPTION
==================================================

${jobDescription}

==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY valid JSON matching the provided schema.

Generate:

- matchScore
- technicalQuestions
- behavioralQuestions
- skillGaps
- preparationPlan
- title

Generate at least 5 technical questions.

Generate at least 5 behavioral questions.

Generate at least 5 preparation days.

==================================================
CRITICAL ANSWER REQUIREMENT
==================================================

EVERY question MUST have a REAL answer.

The answer field MUST NEVER be empty.

The answer field MUST NEVER be null.

The answer field MUST NEVER contain instructions.

Do NOT write:

"Explain your approach."

"Describe your experience."

"Use the STAR method."

"Answer using an example."

"Discuss the concept."

Those are NOT answers.

Instead, write the actual answer that the candidate can speak during an interview.

==================================================
TECHNICAL QUESTIONS
==================================================

Each technical question must contain:

{
    "question": "actual interview question",
    "intention": "what interviewer is evaluating",
    "answer": "actual interview-ready answer"
}

Technical questions should be based on:

- candidate resume
- candidate projects
- candidate skills
- job requirements
- required technologies
- practical development situations

Every technical answer must specifically answer its own question.

Every technical answer must be different.

Do not leave answer empty.

==================================================
BEHAVIORAL QUESTIONS
==================================================

Each behavioral question must contain:

{
    "question": "actual behavioral interview question",
    "intention": "what interviewer is evaluating",
    "answer": "actual answer candidate can speak"
}

CRITICAL:

Every behavioral answer must be UNIQUE.

Never repeat the same answer.

Never use generic instructions.

Behavioral answers must be written in FIRST PERSON.

Use realistic examples from the candidate's actual background.

If the candidate is a student or fresher, use examples from:

- college projects
- personal projects
- coding projects
- debugging
- learning technologies
- assignments
- deadlines
- presentations
- teamwork
- project problems

Do not invent companies.

Do not invent employment.

Do not invent fake internships.

Do not invent fake clients.

Do not invent achievements that are not present in the candidate information.

Use approximately 80-150 words for behavioral answers.

Use STAR structure internally, but do NOT mention STAR in the answer.

==================================================
EXAMPLE
==================================================

Question:

"Tell me about a difficult technical problem you faced."

Intention:

"Evaluates problem-solving ability and debugging skills."

Answer:

"During one of my web development projects, I faced an issue where data received from an API was not updating correctly in the React interface. I first reproduced the issue and checked the browser console and network tab. I then reviewed the component state and found that the state was not being updated correctly after the API response. I corrected the state update logic and tested the feature with different inputs. After the fix, the data displayed correctly. This experience taught me to debug systematically and identify the root cause before changing the code."

==================================================
SKILL GAPS
==================================================

Identify genuine skill gaps by comparing the candidate's profile with the job description.

Do not create random gaps.

Each object:

{
    "skill": "skill name",
    "severity": "low | medium | high"
}

==================================================
PREPARATION PLAN
==================================================

Generate at least 5 preparation days.

Each day:

{
    "day": 1,
    "focus": "specific preparation area",
    "tasks": [
        "specific task",
        "specific task"
    ]
}

Make the preparation plan directly relevant to the job.

==================================================
MATCH SCORE
==================================================

Calculate a realistic score from 0 to 100 based on:

- required skills
- candidate skills
- projects
- experience
- education
- job requirements

Do not automatically give a high score.

==================================================
TITLE
==================================================

Infer the best job title from the job description.

Possible titles:

Frontend Developer
React Developer
Full Stack Developer
MERN Stack Developer
Backend Developer
Software Engineer
Data Analyst
Data Analytics Engineer

Never leave title empty.

==================================================
FINAL CHECK
==================================================

Before returning JSON, verify:

1. Every question has an answer.
2. No answer is empty.
3. No answer is null.
4. No answer contains instructions instead of an actual answer.
5. Behavioral answers are written in first person.
6. Behavioral answers are different from each other.
7. Technical answers are relevant to their questions.
8. Questions are relevant to the candidate and job.
9. Return ONLY JSON.

`;


    try {
        console.log(
            "Generating interview report with Gemini..."
        );

        console.log(
            "Gemini model:",
            GEMINI_MODEL
        );

        const rawReport =
            await generateGeminiContent({
                prompt,

                schema:
                    interviewReportSchema,

                maxRetries: 3,
            });

        const normalizedReport =
            normalizeInterviewReport(
                rawReport
            );

        const validatedReport =
            interviewReportSchema.parse(
                normalizedReport
            );

        if (
            !validatedReport.title ||
            !validatedReport.title.trim()
        ) {
            validatedReport.title =
                "Interview Preparation Plan";
        }

        console.log(
            "Interview report generated successfully."
        );

        return validatedReport;

    } catch (error) {
        console.error(
            "GEMINI INTERVIEW REPORT ERROR:",
            error
        );

        throw error;
    }
}

// ======================================================
// GENERATE PDF FROM HTML
// ======================================================

async function generatePdfFromHtml(
    htmlContent
) {
    let browser = null;

    try {
        if (
            !htmlContent ||
            typeof htmlContent !==
                "string"
        ) {
            throw new Error(
                "Invalid HTML content received for PDF generation."
            );
        }

        let cleanHtml =
            htmlContent.trim();

        cleanHtml =
            cleanHtml
                .replace(
                    /^```html\s*/i,
                    ""
                )
                .replace(
                    /^```\s*/i,
                    ""
                )
                .replace(
                    /\s*```$/i,
                    ""
                )
                .trim();

        console.log(
            "Launching Puppeteer..."
        );

        browser =
            await puppeteer.launch({
                headless: true,

                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-software-rasterizer",
                    "--disable-extensions",
                    "--no-first-run",
                    "--no-default-browser-check",
                ],

                timeout: 60000,
            });

        const page =
            await browser.newPage();

        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1,
        });

        await page.setRequestInterception(
            true
        );

        page.on(
            "request",
            (request) => {
                const url =
                    request.url();

                if (
                    url.startsWith(
                        "http://"
                    ) ||
                    url.startsWith(
                        "https://"
                    )
                ) {
                    request.abort();
                    return;
                }

                request.continue();
            }
        );

        await page.setContent(
            cleanHtml,
            {
                waitUntil:
                    "domcontentloaded",

                timeout: 30000,
            }
        );

        try {
            await page.evaluate(
                async () => {
                    if (
                        document.fonts &&
                        document.fonts.ready
                    ) {
                        await document.fonts.ready;
                    }
                }
            );
        } catch (fontError) {
            console.log(
                "Font loading skipped."
            );
        }

        await sleep(500);

        console.log(
            "Generating PDF..."
        );

        const pdfBuffer =
            await page.pdf({
                format: "A4",

                printBackground: true,

                preferCSSPageSize:
                    false,

                displayHeaderFooter:
                    false,

                margin: {
                    top: "10mm",
                    bottom: "10mm",
                    left: "10mm",
                    right: "10mm",
                },

                timeout: 60000,
            });

        if (
            !pdfBuffer ||
            pdfBuffer.length === 0
        ) {
            throw new Error(
                "Puppeteer generated an empty PDF."
            );
        }

        console.log(
            `PDF generated successfully. Size: ${pdfBuffer.length} bytes`
        );

        return pdfBuffer;

    } catch (error) {
        console.error(
            "PDF GENERATION ERROR:",
            error
        );

        throw error;

    } finally {
        if (browser) {
            try {
                await browser.close();

                console.log(
                    "Puppeteer browser closed."
                );
            } catch (closeError) {
                console.error(
                    "PUPPETEER CLOSE ERROR:",
                    closeError.message
                );
            }
        }
    }
}

// ======================================================
// GENERATE RESUME PDF
// ======================================================

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `

You are a professional ATS resume writer.

Create a professional resume using the candidate information below.

CANDIDATE RESUME:

${resume || "No resume provided"}

SELF DESCRIPTION:

${selfDescription || "No self description provided"}

JOB DESCRIPTION:

${jobDescription || "No job description provided"}

REQUIREMENTS:

- Tailor the resume to the job description.
- Highlight relevant skills.
- Highlight relevant projects.
- Keep it concise.
- Target approximately 1-2 pages.
- Make it ATS friendly.
- Make it human written.
- Do not mention AI.
- Do not invent companies.
- Do not invent experience.
- Do not invent education.
- Do not invent certifications.
- Use only information supplied by the candidate.
- Use professional HTML.
- Use internal CSS.
- No external CSS.
- No JavaScript.
- No external images.
- No external fonts.
- No SVG.
- No canvas.
- No iframe.
- No external URLs.
- Make it A4 print friendly.
- Keep the layout simple and professional.
- Use black, white and subtle professional styling.

The response MUST contain:

{
    "html": "complete HTML document"
}

Return ONLY valid JSON.

Do not use markdown.

`;

    try {
        console.log(
            "Generating resume with Gemini..."
        );

        const jsonContent =
            await generateGeminiContent({
                prompt,

                schema:
                    resumePdfSchema,

                maxRetries: 3,
            });

        if (
            !jsonContent.html ||
            typeof jsonContent.html !==
                "string"
        ) {
            throw new Error(
                "Gemini did not return valid resume HTML."
            );
        }

        const pdfBuffer =
            await generatePdfFromHtml(
                jsonContent.html
            );

        return pdfBuffer;

    } catch (error) {
        console.error(
            "GEMINI RESUME PDF ERROR:",
            error
        );

        throw error;
    }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    generateInterviewReport,
    generateResumePdf,
};