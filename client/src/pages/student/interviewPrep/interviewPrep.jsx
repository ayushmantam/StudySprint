import React, { useState } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  User, 
  FileText, 
  Clock, 
  ChevronDown, 
  Pin, 
  PinOff,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Code,
  X
} from 'lucide-react';

// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com' 
  : 'http://localhost:5000';

// API call functions
const apiCall = async (endpoint, data) => {
  const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }

  return response.json();
};

// AI Response Preview Component
const AIResponsePreview = ({ content }) => {
  if (!content) return null;

  const renderContent = (text) => {
    // Simple markdown-like rendering
    const parts = text.split(/```(\w+)?\n([\s\S]*?)```/);
    
    return parts.map((part, index) => {
      if (index % 3 === 2) {
        // This is code content
        const language = parts[index - 1] || 'javascript';
        return <CodeBlock key={index} code={part.trim()} language={language} />;
      } else if (index % 3 === 1) {
        // This is language identifier, skip
        return null;
      } else {
        // This is regular text
        return (
          <div key={index} className="prose prose-sm max-w-none">
            {part.split('\n').map((line, lineIndex) => {
              if (line.startsWith('## ')) {
                return <h2 key={lineIndex} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
              } else if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={lineIndex} className="font-semibold mb-2">{line.replace(/\*\*/g, '')}</p>;
              } else if (line.trim()) {
                return <p key={lineIndex} className="mb-2 leading-relaxed">{line}</p>;
              }
              return <br key={lineIndex} />;
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-sm text-gray-700">
        {renderContent(content)}
      </div>
    </div>
  );
};

// Code Block Component
const CodeBlock = ({ code, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative bg-gray-50 overflow-hidden rounded-lg my-4 border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Code size={16} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {language || 'Code'}
          </span>
        </div>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none relative group"
          onClick={copyCode}
          aria-label="Copy Code"
          type="button"
        >
          {isCopied ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <Copy size={16} />
          )}
          {isCopied && (
            <span className="absolute -top-8 right-0 bg-black text-white text-xs rounded-md px-2 py-1 opacity-80">
              Copied!
            </span>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code className="text-gray-800">{code}</code>
      </pre>
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ question, answer, onLearnMore, isPinned, onTogglePin }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg mb-4 overflow-hidden py-4 px-5 shadow-xl shadow-gray-100/70 border border-gray-100/60 group">
      <div className="flex justify-between items-center cursor-pointer">
        <div className="flex items-center gap-3.5">
          <span className="text-xs md:text-[15px] font-semibold text-gray-400 leading-[18px]">
            Q
          </span>
          <h3 
            className="text-xs md:text-[14px] font-semibold text-gray-800 mr-0 md:mr-20 cursor-pointer" 
            onClick={toggleExpand}
          >
            {question}
          </h3>
        </div>

        <div className="flex items-center justify-end ml-4 relative">
          <div className={`flex ${isExpanded ? "md:flex" : "md:hidden group-hover:flex"}`}>
            <button 
              className="flex items-center gap-2 text-xs text-indigo-800 font-medium bg-indigo-50 px-3 py-1 rounded text-nowrap border border-indigo-50 hover:border-indigo-200 cursor-pointer"
              onClick={onTogglePin}
              type="button"
            >
              {isPinned ? <Pin className="text-xs" /> : <PinOff className="text-xs" />}
            </button>
            <button 
              className="flex items-center gap-2 text-xs text-cyan-800 font-medium px-3 py-1 mr-2 rounded text-nowrap border border-cyan-50 hover:border-cyan-200 cursor-pointer"
              onClick={() => {
                setIsExpanded(true);
                onLearnMore();
              }}
              type="button"
            >
              <Sparkles />
              <span className="hidden md:block">Learn More</span>
            </button>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-500 cursor-pointer" 
            onClick={toggleExpand}
            type="button"
          >
            <ChevronDown 
              size={20} 
              className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 text-gray-700 bg-gray-50 px-5 py-3 rounded-lg">
          <AIResponsePreview content={answer} />
        </div>
      )}
    </div>
  );
};

// Drawer Component
const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <div 
      className={`fixed top-0 right-0 z-40 h-full p-4 overflow-y-auto transition-transform bg-white w-full md:w-[40vw] shadow-2xl shadow-cyan-800/10 border-l border-gray-200 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-base font-semibold text-black">
          {title}
        </h5>
        <button 
          type="button" 
          onClick={onClose} 
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center"
        >
          <X className="text-lg" />
        </button>
      </div>
      <div className="text-sm mx-3 mb-6">{children}</div>
    </div>
  );
};

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="h-32 bg-gray-200 rounded mb-4 flex items-center justify-center">
        <Loader2 className="animate-spin text-2xl text-gray-400" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

// Main Component
const InterviewPrepPage = () => {
  const [formData, setFormData] = useState({
    role: '',
    experience: '',
    topicsToFocus: '',
    description: ''
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateQuestions = async () => {
    if (!formData.role || !formData.experience || !formData.topicsToFocus) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiCall('generate-questions', {
        role: formData.role,
        experience: formData.experience,
        topicsToFocus: formData.topicsToFocus,
        numberOfQuestions: 5
      });

      setQuestions(response.questions);
      setShowResults(true);
    } catch (err) {
      setError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateConceptExplanation = async (question) => {
    try {
      setExplanationError('');
      setExplanation(null);
      setExplanationLoading(true);
      setOpenLearnMoreDrawer(true);
      
      const response = await apiCall('generate-explanation', { question });
      setExplanation(response);
    } catch (error) {
      setExplanation(null);
      setExplanationError(error.message || 'Failed to generate explanation, try again.');
    } finally {
      setExplanationLoading(false);
    }
  };

  const togglePin = (questionId) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, isPinned: !q.isPinned }
          : q
      )
    );
  };

  const resetForm = () => {
    setFormData({
      role: '',
      experience: '',
      topicsToFocus: '',
      description: ''
    });
    setQuestions([]);
    setShowResults(false);
    setError('');
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white relative">
          <div className="container mx-auto px-4 md:px-0">
            <div className="h-[200px] flex flex-col justify-center relative z-10">
              <div className="flex items-center">
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-medium">{formData.role}</h2>
                      <p className="text-sm text-medium text-gray-900 mt-1">{formData.topicsToFocus}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
                  Experience: {formData.experience} {formData.experience > 1 ? 'years' : 'year'}
                </div>
                <div className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
                  {questions.length} Q&A
                </div>
                <div className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
                  Generated: {getCurrentDate()}
                </div>
              </div>
            </div>
            <div className="w-[40vw] md:w-[30vw] h-[200px] flex items-center justify-center bg-white overflow-hidden absolute top-0 right-0">
              <div className="w-16 h-16 bg-lime-400 blur-[65px] animate-pulse"></div>
              <div className="w-16 h-16 bg-teal-400 blur-[65px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-16 h-16 bg-cyan-300 blur-[45px] animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="w-16 h-16 bg-fuchsia-200 blur-[45px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto pt-4 pb-4 px-4 md:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black">Interview Q & A</h2>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              type="button"
            >
              Start New Session
            </button>
          </div>
          
          <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
            <div className={`col-span-12 ${openLearnMoreDrawer ? "md:col-span-7" : "md:col-span-8"}`}>
              {questions.map((data, idx) => (
                <QuestionCard
                  key={data.id}
                  question={data.question}
                  answer={data.answer}
                  onLearnMore={() => generateConceptExplanation(data.question)}
                  isPinned={data.isPinned}
                  onTogglePin={() => togglePin(data.id)}
                />
              ))}
            </div>
          </div>

          <Drawer
            isOpen={openLearnMoreDrawer}
            onClose={() => setOpenLearnMoreDrawer(false)}
            title={!explanationLoading && explanation?.title}
          >
            {explanationError && (
              <p className="flex gap-2 text-sm text-amber-600 font-medium">
                <AlertCircle className="mt-1" /> {explanationError}
              </p>
            )}
            {explanationLoading && <SkeletonLoader />}
            {!explanationLoading && explanation && (
              <AIResponsePreview content={explanation.explanation} />
            )}
          </Drawer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Sparkles className="text-2xl text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Prep Generator</h1>
            <p className="text-gray-600">Generate personalized interview questions and answers with AI</p>
          </div>

          <div className="space-y-6">
            {/* Role Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="text-gray-500" />
                Target Role *
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Experience Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="text-gray-500" />
                Years of Experience *
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select experience level</option>
                <option value="0">Entry Level (0 years)</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5+ years</option>
              </select>
            </div>

            {/* Topics to Focus Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="text-gray-500" />
                Topics to Focus On *
              </label>
              <input
                type="text"
                name="topicsToFocus"
                value={formData.topicsToFocus}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, System Design, Machine Learning"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="text-gray-500" />
                Additional Context (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Any specific areas you want to focus on or companies you're targeting..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={generateQuestions}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles />
                  Generate Interview Questions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepPage;