import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, FileText, UploadCloud, Loader2, Briefcase, Clock, ClipboardList } from 'lucide-react';

// Set the base URL for axios requests from environment variables
// It's good practice to have a fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const ReviewResumePage = () => {
    // State to manage form inputs
    const [formData, setFormData] = useState({
        jobRole: '',
        experience: '',
        jobDescription: '',
    });
    // State for the uploaded resume file
    const [resumeFile, setResumeFile] = useState(null);
    // State to store the AI-generated review content
    const [reviewContent, setReviewContent] = useState('');
    // State to manage the loading status of the API call
    const [loading, setLoading] = useState(false);

    /**
     * Handles changes in text inputs and select fields.
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Handles the file input change, validating for PDF type.
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setResumeFile(file);
            toast.success("Resume uploaded successfully!");
        } else {
            toast.error("Please upload a PDF file only.");
            setResumeFile(null);
            e.target.value = null; // Reset file input if the file is not a PDF
        }
    };

    /**
     * Handles the form submission to the backend.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that all fields are filled and a resume is uploaded
        if (!formData.jobRole || !formData.experience || !formData.jobDescription || !resumeFile) {
            toast.error("Please fill all fields and upload your resume.");
            return;
        }

        setLoading(true);
        setReviewContent('');

        // Use FormData to send both text and file data
        const submissionData = new FormData();
        submissionData.append('jobRole', formData.jobRole);
        submissionData.append('experience', formData.experience);
        submissionData.append('jobDescription', formData.jobDescription);
        submissionData.append('resume', resumeFile);

        try {
            // Post data to the backend endpoint
            const { data } = await axios.post('/api/ai/review-resume', submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Handle success and error responses from the API
            if (data.success) {
                setReviewContent(data.review); // Assuming backend returns { success: true, review: '...' }
                toast.success("Resume review generated successfully!");
            } else {
                toast.error(data.message || "An unexpected error occurred.");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to generate review. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- Form Section --- */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-7 h-7 text-indigo-600" />
                        <h1 className="text-2xl font-bold text-slate-800">AI Resume Reviewer</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Job Role Input */}
                        <div>
                            <label htmlFor="jobRole" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <Briefcase className="w-4 h-4" />
                                Job Role
                            </label>
                            <input
                                type="text"
                                id="jobRole"
                                name="jobRole"
                                value={formData.jobRole}
                                onChange={handleInputChange}
                                placeholder="e.g., Senior Software Engineer"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        {/* Years of Experience Select */}
                        <div>
                            <label htmlFor="experience" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <Clock className="w-4 h-4" />
                                Years of Experience
                            </label>
                            <select
                                id="experience"
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                required
                            >
                                <option value="" disabled>Select your experience level</option>
                                <option value="0-2">0-2 years (Entry-level)</option>
                                <option value="3-5">3-5 years (Mid-level)</option>
                                <option value="6-10">6-10 years (Senior-level)</option>
                                <option value="10+">10+ years (Lead/Principal)</option>
                            </select>
                        </div>

                        {/* Job Description Textarea */}
                        <div>
                            <label htmlFor="jobDescription" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <ClipboardList className="w-4 h-4" />
                                Job Description
                            </label>
                            <textarea
                                id="jobDescription"
                                name="jobDescription"
                                value={formData.jobDescription}
                                onChange={handleInputChange}
                                placeholder="Paste the full job description here..."
                                rows={8}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y"
                                required
                            />
                        </div>

                        {/* Resume File Upload */}
                        <div>
                            <label htmlFor="resume" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <UploadCloud className="w-4 h-4" />
                                Upload Your Resume
                            </label>
                            <input
                                type="file"
                                id="resume"
                                name="resume"
                                onChange={handleFileChange}
                                accept="application/pdf"
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">PDF format only, max 5MB.</p>
                        </div>
                        
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-4 py-3 text-sm rounded-lg cursor-pointer transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Analyzing Your Resume...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>Review My Resume</span>
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* --- Results Section --- */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:max-h-[calc(100vh-4rem)] flex flex-col">
                    <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                        <FileText className="w-7 h-7 text-green-600" />
                        <h1 className="text-2xl font-bold text-slate-800">Analysis & Feedback</h1>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                        {loading && !reviewContent && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                                <p className="font-semibold">Our AI is reading your resume...</p>
                                <p className="text-sm">This may take a moment. Please wait.</p>
                            </div>
                        )}

                        {!loading && !reviewContent && (
                             <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                                <div className="p-4 bg-slate-100 rounded-full mb-4">
                                    <FileText className="w-10 h-10 text-slate-400" />
                                </div>
                                <p className="font-semibold">Your resume feedback will appear here.</p>
                                <p className="text-sm">Fill out the form and click "Review My Resume" to start.</p>
                            </div>
                        )}

                        {reviewContent && (
                             <article className="prose prose-slate max-w-none prose-sm sm:prose-base">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {reviewContent}
                                </ReactMarkdown>
                            </article>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default ReviewResumePage;