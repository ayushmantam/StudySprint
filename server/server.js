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


const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
 

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//database connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("mongodb is connected"))
  .catch((e) => console.log(e));

//routes configuration
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);

///// chat bot ////
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI with the correct model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chatbot endpoint (Updated for latest Gemini API)
// ... (your existing code) ...

// Chatbot endpoint (Updated for latest Gemini API)
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Use the model name obtained from listModels.js that supports generateContent
    // For example, if you found "models/gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // <--- CHANGE THIS LINE

    // Generate response
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to get response from Gemini" });
  }
});
// ... (rest of your existing code) ...

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
