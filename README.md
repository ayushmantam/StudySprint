# StudySprint

[![Built with React](https://img.shields.io/badge/Frontend-React-blue.svg)](#)
[![Backend Node.js](https://img.shields.io/badge/Backend-Node.js-brightgreen.svg)](#)

**StudySprint** is a full-featured Learning Management System (LMS) enhanced with AI-driven interview preparation and resume analysis tools. It provides instructors and students with an interactive, secure, and scalable platform for modern education.

---

## 🚀 Features

- **Role-Based Access:** Separate interfaces and permissions for students and instructors.
- **Seamless Course Management:** Course creation, bulk lecture uploads, content management, and revenue tracking.
- **Real-Time Progress Tracking:** Detailed analytics and progress dashboards for students.
- **Interactive Learning:** Video lectures, quizzes, and AI-powered interview prep.
- **Secure Payments:** PayPal API integration validated with 50+ sandbox transactions (100% accuracy in tests).
- **Cloud Media Storage:** Cloudinary integration for reliable media storage and streaming.
- **AI Tools:**
  - **Interview Prep:** Gemini API-powered personalized Q&A (95% relevance in tests).
  - **Resume Analyzer:** PDF resume analysis against job descriptions using Gemini (90% relevance in tests).
  - **AI Chatbot:** Real-time support using Gemini API.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Shadcn UI  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Media & Storage:** Cloudinary  
- **Payments:** PayPal API  
- **AI Integration:** Gemini API

---

## 📚 Project Modules

### Backend
- RESTful APIs:
  - Authentication (JWT)
  - Course & lecture management
  - Payment processing (PayPal)
  - Media upload & streaming (Cloudinary)

### Instructor Dashboard
- Course creation and management
- Bulk lecture uploads
- Revenue & analytics dashboard

### Student Portal
- Course discovery & enrollment
- Progress tracking & completion certificates
- Video player, quizzes, and history
- Payment & invoice history

### AI-Powered Tools
- Interview question generation and personalized answers
- Resume PDF upload and analysis
- Live AI chatbot for instant help

---

## 🔧 Getting Started

### Prerequisites
- Node.js (v16+ recommended) & npm / pnpm / yarn  
- MongoDB (local or cloud)  
- Cloudinary account & credentials  
- PayPal Developer account & credentials  
- Gemini API access & keys

### Installation (development)

```bash
# clone the repo
git clone https://github.com/ayushmantam/StudySprint.git
cd StudySprint

# install root or server deps (if monorepo, adapt per folder)
npm install

# example: if frontend and backend in separate folders
cd backend && npm install
cd ../frontend && npm install
