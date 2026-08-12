# 🤖 AI Interview Prep & Resume Analyzer

<div align="center">

### 🚀 AI-Powered Full Stack Interview Preparation & Resume Analysis Platform

An intelligent full-stack web application that analyzes resumes and job descriptions to generate personalized interview questions, interview-ready answers, skill-gap analysis, preparation plans, and ATS-friendly resumes.

<br/>

![AI](https://img.shields.io/badge/AI-Powered-8A2BE2?style=for-the-badge)
![Full Stack](https://img.shields.io/badge/Full--Stack-Developer-FF5722?style=for-the-badge)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

</div>

---

## 🌟 Overview

**AI Interview Prep & Resume Analyzer** is a full-stack AI-powered career preparation platform built to help students, freshers, and job seekers prepare for technical and behavioral interviews.

The application analyzes:

- 📄 Candidate Resume
- 👨‍💻 Candidate Skills
- 📝 Self Description
- 💼 Target Job Description

Using **Google Gemini AI**, the platform generates a personalized interview preparation report containing technical questions, behavioral questions, interview-ready answers, skill gaps, job match score, and a preparation roadmap.

The application also provides an **AI-powered ATS-friendly resume generator** with PDF export functionality.

---

## ✨ Features

### 🤖 AI Interview Report

Generate a personalized interview preparation report based on the candidate profile and target job.

The report includes:

- 🎯 Job Match Score
- 💻 Technical Interview Questions
- 🧠 Technical Interview Answers
- 👥 Behavioral Interview Questions
- 💬 Behavioral Interview Answers
- 📊 Skill Gap Analysis
- 📅 Personalized Preparation Plan
- 🎓 Recommended Focus Areas

---

### 📄 Resume Upload

Candidates can upload their resume and provide additional information about themselves.

The resume and candidate information are processed along with the target job description to generate personalized interview preparation content.

---

### 💻 Technical Interview Preparation

Technical questions are generated according to:

- Candidate skills
- Candidate projects
- Resume information
- Job requirements
- Required technologies
- Practical development scenarios

Each technical question contains:

```text
Question
Intention
Interview-ready Answer.

👥 Behavioral Interview Preparation

The application generates realistic behavioral interview questions and first-person answers.

Examples:

Tell me about yourself.

Tell me about a difficult project problem.


Tell me about a time you learned something quickly.
How do you handle deadlines?

Tell me about a debugging problem you solved.

How do you handle failure?

Tell me about a project you are proud of.

The generated answers are designed to be practical and interview-ready

📊 Skill Gap Analysis

The system compares the candidate's current skills with the requirements of the target job.

Skill gaps are categorized as:

🟢 Low
🟡 Medium
🔴 High

This helps candidates identify the skills they should improve before an interview.

📅 Personalized Preparation Plan

The AI generates a structured preparation roadmap based on the target role.

Example     Day 1 → JavaScript Fundamentals
Day 2 → React & Frontend
Day 3 → Node.js & Express
Day 4 → MongoDB & APIs
Day 5 → SQL & Data Handling
Day 6 → Behavioral Interview
Day 7 → Mock Interview & Revision


📑 AI Resume Generator

The platform can generate a professional resume based on:

Existing resume
Candidate profile
Skills
Projects
Target job description

The generated resume is:

ATS-friendly
Job-specific
Concise
Professional
A4 print-ready
📥 Resume PDF Generation

Generated resume HTML is converted into a professional PDF using Puppeteer.

The PDF generation process runs on the backend and provides a downloadable resume.

🧠 AI Workflow
                    ┌──────────────────────┐
                    │    Candidate Input   │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
             Resume      Self Description   Job Description
                │              │              │
                └──────────────┼──────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Node.js API      │
                    │    Express Backend   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Google Gemini     │
                    │      AI Engine       │
                    └──────────┬───────────┘
                               │
                               ▼
                ┌──────────────────────────────┐
                │      Interview Report        │
                ├──────────────────────────────┤
                │ 🎯 Match Score               │
                │ 💻 Technical Questions       │
                │ 👥 Behavioral Questions      │
                │ 📊 Skill Gaps                │
                │ 📅 Preparation Plan           │
                └──────────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       React UI       │
                    └──────────────────────┘
🛠️ Tech Stack
🎨 Frontend
Technology	Purpose
⚛️ React	User Interface
⚡ Vite	Frontend Build Tool
🔄 Axios	API Communication
🧭 React Router	Client-side Routing
🎨 CSS	UI Styling
📦 JavaScript	Application Logic
⚙️ Backend
Technology	Purpose
🟢 Node.js	Runtime Environment
🚂 Express.js	REST API
🍃 MongoDB	Database
🧩 Mongoose	MongoDB ODM
🔐 Authentication	User Authentication
📦 Multer	Resume File Upload
🤖 Google Gemini	Generative AI
📄 Puppeteer	PDF Generation
🔒 dotenv	Environment Variables
📁 Project Structure
AI-Interview-Prep-Resume-Analyzer/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
🔌 API Endpoints
Generate Interview Report
POST /api/interview/

Accepts:

jobDescription
selfDescription
resume

Returns:

matchScore
technicalQuestions
behavioralQuestions
skillGaps
preparationPlan
title

🔐 Environment Variables

Create a .env file inside the backend directory.

GOOGLE_GENAI_API_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_connection_string
GEMINI_MODEL=gemini-3-flash-preview

⚠️ Never upload .env to GitHub.

Add the following to .gitignore:

node_modules/
.env
.env.local
dist/
build/
🚀 Installation
1. Clone Repository
git clone https://github.com/sandip-kumar-jha/AI-Interview-Prep-Resume-Analyzer.git
cd AI-Interview-Prep-Resume-Analyzer
2. Backend Setup
cd backend

Install dependencies:

npm install

Create .env:

GOOGLE_GENAI_API_KEY=your_api_key
MONGO_URI=your_mongodb_uri
GEMINI_MODEL=gemini-3-flash-preview

Start backend:

npm run dev

Backend:

http://localhost:3000
3. Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Start frontend:

npm run dev
🔄 Application Flow
1. User creates an account
        ↓
2. User uploads resume
        ↓
3. User enters self-description
        ↓
4. User enters target job description
        ↓
5. Backend receives the request
        ↓
6. Resume + profile + job description
   are processed
        ↓
7. Google Gemini generates analysis
        ↓
8. Backend validates AI response
        ↓
9. Interview report is stored in MongoDB
        ↓
10. React displays personalized report
        ↓
11. User can generate ATS resume PDF
🎯 Example Use Case
Target Role
Full Stack Developer
Candidate Skills
HTML
CSS
JavaScript
React
Node.js
Express.js
MongoDB
SQL
Python
Git
GitHub

The application analyzes the candidate against the target job and generates:

🎯 Match Score
        ↓
💻 Technical Questions
        ↓
👥 Behavioral Questions
        ↓
📊 Skill Gaps
        ↓
📅 Preparation Roadmap
        ↓
📄 ATS Resume
🧠 AI Engineering Highlights

This project demonstrates practical implementation of:

Generative AI
Google Gemini API
Prompt Engineering
Structured AI Output
JSON Schema Validation
Zod Validation
AI Response Normalization
Resume Analysis
Job Description Matching
Interview Question Generation
Behavioral Answer Generation
Skill Gap Detection
REST API Development
Error Handling
Retry Mechanisms
PDF Generation
MongoDB Data Persistence
🛡️ Error Handling

The backend handles:

Invalid AI responses
Empty AI responses
Invalid JSON
Gemini API failures
Temporary API failures
Database validation errors
Missing job descriptions
Invalid resume input
PDF generation errors

Gemini requests also support retry handling for temporary API failures.

📈 Future Improvements
🎤 AI Mock Interview
🎙️ Voice-based Interview
🗣️ Speech-to-Text
📊 Interview Performance Analytics
⭐ AI Answer Scoring
🧠 DSA Question Generator
💼 Job Recommendation System
📧 Job Application Tracker
🔗 LinkedIn Profile Analyzer
📄 Advanced ATS Score
🌐 Multi-language Interview Support
🎥 AI Video Interview Analysis
💼 Why I Built This Project

Job seekers often prepare using generic interview questions that do not match their actual resume or the requirements of a specific job.

This project solves that problem by combining:

Candidate Profile
        +
Resume
        +
Job Description
        ↓
Google Gemini AI
        ↓
Personalized Interview Preparation

Instead of generic preparation, candidates receive job-specific questions, answers, skill-gap analysis, and a preparation roadmap.

📌 Resume Project Description
AI Interview Prep & Resume Analyzer

React.js • Node.js • Express.js • MongoDB • Google Gemini AI • Puppeteer

Built a full-stack AI-powered platform that analyzes resumes and job descriptions to generate personalized interview preparation reports.
Integrated Google Gemini AI to generate technical and behavioral interview questions, interview-ready answers, job match scores, skill-gap analysis, and personalized preparation plans.
Implemented REST APIs, MongoDB persistence, resume file uploads, structured AI response validation, and automated ATS-friendly resume PDF generation using Puppeteer.
⭐ Project Highlights
🤖 Generative AI Integration
📄 Resume Analysis
💼 Job Description Matching
🎯 AI Match Score
💻 Technical Interview Questions
👥 Behavioral Interview Preparation
📊 Skill Gap Analysis
📅 Personalized Preparation Plan
📑 ATS Resume Generator
📥 PDF Generation
🔐 Authentication
🗄️ MongoDB Database
⚡ REST APIs
🎨 Modern React UI
👨‍💻 Developer
<div align="center">
Sandip Kumar Jha

BSc Computer Science & Data Analytics — IIT Patna

Full Stack Developer | Data Analytics | Generative AI
</div>
📜 License

This project is developed for educational, portfolio, and career-development purposes.

<div align="center">
⭐ If you find this project useful, consider giving it a star!
Built with ❤️ using React, Node.js, MongoDB & Google Gemini AI
</div> ```
