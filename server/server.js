require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = "mongoose";
const multer = require("multer"); // Import multer for file uploads
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectToDatabase = require("./helpers/db");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Validate required environment variables
if (!MONGO_URI) {
    console.error("MONGO_URI is required in environment variables");
    process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is required in environment variables");
    process.exit(1);
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

connectToDatabase(MONGO_URI);

// Routes configuration
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'Server is running!',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// --- Multer Configuration for Resume Upload ---
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed!"), false);
        }
    },
});

// --- NEW: AI Resume Review Endpoint ---
app.post('/api/ai/review-resume', upload.single('resume'), async (req, res) => {
    try {
        const { jobRole, experience, jobDescription } = req.body;

        // 1. Validate inputs
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Resume PDF file is required.' });
        }
        if (!jobRole || !experience || !jobDescription) {
            return res.status(400).json({ success: false, message: 'Job role, experience, and job description are required.' });
        }

        // 2. Prepare file for Gemini API
        const resumeFile = req.file;
        const generativeFile = {
            inlineData: {
                data: resumeFile.buffer.toString("base64"),
                mimeType: resumeFile.mimetype,
            },
        };

        // 3. Construct a detailed prompt for the AI
        const prompt = `
            You are an expert technical recruiter and career coach. Your task is to review a resume against a job description and provide actionable, constructive feedback.

            **Candidate's Target Role:** ${jobRole}
            **Candidate's Experience Level:** ${experience}
            **Job Description:**
            ---
            ${jobDescription}
            ---

            **Instructions:**
            Analyze the attached resume and provide a comprehensive review based on the job description. Structure your feedback in Markdown format with the following sections:

            ### Overall Summary
            Provide a brief, high-level summary of the resume's strengths and weaknesses for this specific role.

            ### Alignment with Job Description (Score: X/10)
            - Give a score out of 10 for how well the resume matches the job description.
            - List key skills from the job description that are **present** in the resume.
            - List key requirements from the job description that are **missing or unclear** in the resume.

            ### Actionable Feedback & Improvements
            Provide specific, bullet-pointed suggestions for improvement. Focus on:
            - **Keywords:** Suggest specific keywords from the job description to add.
            - **Impact Metrics:** Recommend where to add quantifiable achievements (e.g., "Increased user engagement by 15%").
            - **Clarity and Formatting:** Comment on the resume's readability and structure.
            - **Tailoring:** Suggest how to rephrase bullet points to better match the job's responsibilities.

            ### Final Verdict
            Conclude with a final thought on the candidate's potential suitability and key next steps.
        `;

        // 4. Call the Gemini API with the prompt and the file
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent([prompt, generativeFile]);
        const response = await result.response;
        const reviewText = response.text();

        // 5. Send the successful response
        res.status(200).json({
            success: true,
            review: reviewText,
        });

    } catch (error) {
        console.error('Error in /api/ai/review-resume:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while reviewing the resume. Please try again.',
        });
    }
});


// Utility function to safely parse JSON from AI response
function parseAIResponse(text) {
    try {
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Failed to parse AI response:', error);
        console.error('Raw response:', text);
        throw new Error('Invalid JSON response from AI');
    }
}

// Original Chatbot Implementation
app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: "Message is required and must be a string" });
        }
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        res.json({ response: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to get response from Gemini API" });
    }
});

// Interview Question Generation
app.post('/api/generate-questions', async (req, res) => {
    try {
        const { role, experience, topicsToFocus, numberOfQuestions = 5 } = req.body;
        if (!role || !experience || !topicsToFocus) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const prompt = `
            You are an AI trained to generate technical interview questions.
            Role: ${role}, Experience: ${experience} years, Focus: ${topicsToFocus}.
            Generate ${numberOfQuestions} questions and detailed answers.
            Return ONLY a valid JSON array in the format: [{"question": "...", "answer": "..."}]
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const questions = parseAIResponse(text);
        const questionsWithIds = questions.map((q, index) => ({
            id: index + 1,
            ...q,
            isPinned: false
        }));
        res.json({ questions: questionsWithIds });
    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions.' });
    }
});

// Question Explanation Generation
app.post('/api/generate-explanation', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }
        const prompt = `
            You are an AI trained to explain technical concepts clearly.
            Explain the following interview question in depth: "${question}"
            Provide a title and a detailed explanation.
            Return ONLY a valid JSON object in the format: {"title": "...", "explanation": "..."}
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const explanation = parseAIResponse(text);
        res.json(explanation);
    } catch (error) {
        console.error('Error generating explanation:', error);
        res.status(500).json({ error: 'Failed to generate explanation.' });
    }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    // Multer error handling
    if (err instanceof multer.MulterError) {
        return res.status(413).json({ success: false, message: "File is too large. Max size is 5MB." });
    }
    if (err.message === "Only PDF files are allowed!") {
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

// Graceful shutdown handling
const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
