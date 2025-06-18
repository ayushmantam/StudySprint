require("dotenv").config();
const express = require("express");
const cors = require("cors");  
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
app.use(express.json({ limit: '10mb' })); // Add size limit for security
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Database connection with better error handling
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

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

// Utility function to safely parse JSON from AI response
function parseAIResponse(text) {
  try {
    // Remove potential markdown code blocks
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw response:', text);
    throw new Error('Invalid JSON response from AI');
  }
}

// Original Chatbot Implementation (Improved)
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message is required and must be a string" });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: "Message too long. Maximum 1000 characters allowed." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    
    if (error.message?.includes('quota')) {
      return res.status(429).json({ error: "API quota exceeded" });
    }
    
    res.status(500).json({ error: "Failed to get response from Gemini API" });
  }
});

// Interview Question Generation (Improved with better code formatting)
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions = 5 } = req.body;

    // Validation
    if (!role || !experience || !topicsToFocus) {
      return res.status(400).json({ 
        error: 'Missing required fields: role, experience, and topicsToFocus are required' 
      });
    }

    if (typeof role !== 'string' || typeof topicsToFocus !== 'string') {
      return res.status(400).json({ 
        error: 'Role and topicsToFocus must be strings' 
      });
    }

    const experienceNum = parseInt(experience);
    if (isNaN(experienceNum) || experienceNum < 0 || experienceNum > 50) {
      return res.status(400).json({ 
        error: 'Experience must be a valid number between 0 and 50' 
      });
    }

    const questionsNum = parseInt(numberOfQuestions);
    if (isNaN(questionsNum) || questionsNum < 1 || questionsNum > 20) {
      return res.status(400).json({ 
        error: 'Number of questions must be between 5 and 20' 
      });
    }

    const prompt = `
You are an AI trained to generate technical interview questions and answers with proper code formatting.

Task:
— Role: ${role}
— Candidate Experience: ${experienceNum} years
— Focus Topics: ${topicsToFocus}
— Write ${questionsNum} interview questions appropriate for the experience level.
— For each question, generate a detailed but clear answer suitable for the experience level.
— IMPORTANT: When including code examples, wrap them in proper markdown code blocks using triple backticks with language specification.
— Example format for code: \`\`\`javascript\\nconst example = 'code here';\\nconsole.log(example);\\n\`\`\`
— Use proper markdown formatting: **bold text**, ## headings, bullet points with -
— Keep formatting very clean and professional.

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "answer": "Detailed answer here with explanations.\\n\\n## Code Example\\n\\n\`\`\`javascript\\nconst example = () => {\\n  return 'properly formatted code';\\n};\\n\`\`\`\\n\\nContinue with more explanation if needed."
  }
]

Important: 
- Return ONLY valid JSON. No markdown, no extra text, no code blocks around the JSON.
- Use \\\\n for newlines in JSON strings
- Always use proper code block formatting with language specification
- Escape quotes properly in JSON
- Structure answers with clear sections when needed
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const questions = parseAIResponse(text);
    
    // Validate response structure
    if (!Array.isArray(questions)) {
      throw new Error('AI response is not an array');
    }

    const questionsWithIds = questions.map((q, index) => {
      if (!q.question || !q.answer) {
        throw new Error('Invalid question format');
      }
      return {
        id: index + 1,
        question: q.question,
        answer: q.answer,
        isPinned: false
      };
    });

    res.json({ 
      questions: questionsWithIds,
      metadata: {
        role,
        experience: experienceNum,
        topicsToFocus,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    if (error.message?.includes('quota')) {
      return res.status(429).json({ error: 'API quota exceeded' });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate questions. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Question Explanation Generation (Improved with better code formatting)
app.post('/api/generate-explanation', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ 
        error: 'Question is required and must be a string' 
      });
    }

    if (question.length > 500) {
      return res.status(400).json({ 
        error: 'Question too long. Maximum 500 characters allowed.' 
      });
    }

    const prompt = `
You are an AI trained to generate detailed explanations for interview questions  with proper code formatting.

Task:
— Explain the following interview question and its underlying concepts in depth.
— Question: "${question}"
— Write as if teaching a developer who wants to understand the concept thoroughly.
— Include practical examples and code snippets where relevant.
— IMPORTANT: When including code examples, wrap them in proper markdown code blocks using triple backticks with language specification.
— Example format for code: \`\`\`javascript\\nconst example = 'code here';\\nconsole.log(example);\\n\`\`\`
— Use proper markdown formatting: **bold text**, ## headings, bullet points with -
— Provide a concise, descriptive title for the explanation.

Return ONLY a valid JSON object in this exact format:
{
  "title": "Concise title describing the concept",
  "explanation": "## Overview\\n\\nDetailed explanation with examples.\\n\\n## Code Example\\n\\n\`\`\`javascript\\nconst example = () => {\\n  return 'properly formatted code';\\n};\\nexample();\\n\`\`\`\\n\\n## Key Points\\n\\n- Point 1 with **important** details\\n- Point 2 with more information\\n\\nMore detailed explanation if needed."
}

Important: 
- Return ONLY valid JSON. No markdown, no extra text, no code blocks around the JSON.
- Use \\\\n for newlines in JSON strings
- Always use proper code block formatting with language specification
- Escape quotes properly in JSON
- Structure the explanation with clear headings and sections
- Include practical examples and use cases
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const explanation = parseAIResponse(text);
    
    // Validate response structure
    if (!explanation.title || !explanation.explanation) {
      throw new Error('Invalid explanation format');
    }
    
    res.json({
      ...explanation,
      metadata: {
        originalQuestion: question,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating explanation:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    if (error.message?.includes('quota')) {
      return res.status(429).json({ error: 'API quota exceeded' });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate explanation. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler (improved)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body"
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: "Request body too large"
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM. Shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});