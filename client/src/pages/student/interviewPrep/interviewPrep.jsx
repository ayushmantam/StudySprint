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

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

// Enhanced Code Block Component
const CodeBlock = ({ code, language }) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    // Language display mapping
    const languageDisplayMap = {
        'javascript': 'JavaScript',
        'js': 'JavaScript',
        'typescript': 'TypeScript',
        'ts': 'TypeScript',
        'python': 'Python',
        'py': 'Python',
        'java': 'Java',
        'cpp': 'C++',
        'c': 'C',
        'html': 'HTML',
        'css': 'CSS',
        'sql': 'SQL',
        'json': 'JSON',
        'xml': 'XML',
        'bash': 'Bash',
        'shell': 'Shell',
        'php': 'PHP',
        'ruby': 'Ruby',
        'go': 'Go',
        'rust': 'Rust',
        'swift': 'Swift',
        'kotlin': 'Kotlin'
    };

    const displayLanguage = languageDisplayMap[language?.toLowerCase()] || language || 'Code';

    return (
        <div className="relative bg-gray-900 overflow-hidden rounded-lg my-4 border border-gray-700">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <Code size={16} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                        {displayLanguage}
                    </span>
                </div>
                <button
                    className="text-gray-400 hover:text-gray-200 focus:outline-none relative group transition-colors"
                    onClick={copyCode}
                    aria-label="Copy Code"
                    type="button"
                >
                    {isCopied ? (
                        <Check size={16} className="text-green-400" />
                    ) : (
                        <Copy size={16} />
                    )}
                    {isCopied && (
                        <span className="absolute -top-8 right-0 bg-gray-700 text-white text-xs rounded-md px-2 py-1 opacity-90 whitespace-nowrap">
                            Copied!
                        </span>
                    )}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto bg-gray-900">
                <code className="text-gray-100 font-mono leading-relaxed whitespace-pre">
                    {code}
                </code>
            </pre>
        </div>
    );
};

// New Text Block Component for better text rendering
const TextBlock = ({ content }) => {
    const renderTextContent = (text) => {
        return text.split('\n').map((line, lineIndex) => {
            const trimmedLine = line.trim();

            // Handle headings
            if (trimmedLine.startsWith('## ')) {
                return (
                    <h2 key={lineIndex} className="text-lg font-bold mt-6 mb-3 text-gray-900">
                        {trimmedLine.replace('## ', '')}
                    </h2>
                );
            } else if (trimmedLine.startsWith('### ')) {
                return (
                    <h3 key={lineIndex} className="text-base font-semibold mt-4 mb-2 text-gray-800">
                        {trimmedLine.replace('### ', '')}
                    </h3>
                );
            }

            // Handle bold text
            else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
                return (
                    <p key={lineIndex} className="font-semibold mb-3 text-gray-900">
                        {trimmedLine.replace(/\*\*/g, '')}
                    </p>
                );
            }

            // Handle bullet points
            else if (trimmedLine.startsWith('- ')) {
                return (
                    <div key={lineIndex} className="flex items-start mb-2">
                        <span className="text-gray-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">
                            {trimmedLine.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                        </span>
                    </div>
                );
            }

            // Handle numbered points
            else if (/^\d+\.\s/.test(trimmedLine)) {
                return (
                    <div key={lineIndex} className="flex items-start mb-2">
                        <span className="text-gray-500 mr-2 mt-1 font-medium">
                            {trimmedLine.match(/^\d+\./)[0]}
                        </span>
                        <span className="text-gray-700 leading-relaxed">
                            {trimmedLine.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                        </span>
                    </div>
                );
            }

            // Handle regular paragraphs
            else if (trimmedLine) {
                // Process inline formatting
                let processedLine = trimmedLine;

                // Bold text
                processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                // Inline code
                processedLine = processedLine.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

                return (
                    <p
                        key={lineIndex}
                        className="mb-3 leading-relaxed text-gray-700"
                        dangerouslySetInnerHTML={{ __html: processedLine }}
                    />
                );
            }

            // Empty line
            else {
                return <div key={lineIndex} className="mb-2" />;
            }
        });
    };

    return (
        <div className="prose prose-sm max-w-none">
            {renderTextContent(content)}
        </div>
    );
};

// Improved AI Response Preview Component with better code parsing
const AIResponsePreview = ({ content }) => {
    if (!content) return null;

    const renderContent = (text) => {
        // More robust parsing for code blocks and markdown
        const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        // Extract code blocks and text parts
        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                const textBefore = text.slice(lastIndex, match.index);
                if (textBefore.trim()) {
                    parts.push({ type: 'text', content: textBefore });
                }
            }

            // Add code block
            parts.push({
                type: 'code',
                language: match[1] || 'javascript',
                content: match[2].trim()
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            const remainingText = text.slice(lastIndex);
            if (remainingText.trim()) {
                parts.push({ type: 'text', content: remainingText });
            }
        }

        // If no code blocks found, treat entire content as text
        if (parts.length === 0) {
            parts.push({ type: 'text', content: text });
        }

        return parts.map((part, index) => {
            if (part.type === 'code') {
                return <CodeBlock key={index} code={part.content} language={part.language} />;
            } else {
                return <TextBlock key={index} content={part.content} />;
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
            className={`fixed top-0 right-0 z-40 h-full p-4 overflow-y-auto transition-transform bg-white w-full md:w-[40vw] shadow-2xl shadow-cyan-800/10 border-l border-gray-200 ${isOpen ? "translate-x-0" : "translate-x-full"
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
            // Simulate API call for demo
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockQuestions = [
                {
                    id: 1,
                    question: "What is the difference between let, const, and var in JavaScript?",
                    answer: `## Variable Declarations in JavaScript

**Key Differences:**

### var Declaration
- **Function-scoped** or globally-scoped
- Can be redeclared within the same scope
- Hoisted and initialized with undefined
- Creates a property on the global object when declared globally

\`\`\`javascript
function example() {
  console.log(x); // undefined (not an error due to hoisting)
  var x = 5;
  var x = 10; // Redeclaration allowed
  console.log(x); // 10
}
\`\`\`

### let Declaration
- **Block-scoped**
- Cannot be redeclared in the same scope
- Hoisted but not initialized (Temporal Dead Zone)
- Does not create a property on the global object

\`\`\`javascript
function example() {
  // console.log(y); // ReferenceError: Cannot access 'y' before initialization
  let y = 5;
  // let y = 10; // SyntaxError: Identifier 'y' has already been declared
  y = 15; // Reassignment allowed
  console.log(y); // 15
}
\`\`\`

### const Declaration
- **Block-scoped**
- Cannot be redeclared or reassigned
- Must be initialized at declaration
- Hoisted but not initialized (Temporal Dead Zone)

\`\`\`javascript
function example() {
  const z = 5;
  // z = 10; // TypeError: Assignment to constant variable
  // const z = 15; // SyntaxError: Identifier 'z' has already been declared
  console.log(z); // 5
}
\`\`\`

**Best Practices:**
- Use \`const\` by default for values that won't be reassigned
- Use \`let\` when you need to reassign the variable
- Avoid \`var\` in modern JavaScript due to its confusing scoping rules`,
                    isPinned: false
                },
                {
                    id: 2,
                    question: "Explain the concept of closures in JavaScript with an example.",
                    answer: `## JavaScript Closures

**Definition:** A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.

### How Closures Work

When a function is created, it maintains a reference to its lexical environment. This environment consists of any local variables that were in-scope at the time the closure was created.

\`\`\`javascript
function outerFunction(x) {
  // This is the outer function's scope
  
  function innerFunction(y) {
    // This inner function has access to 'x' from outer scope
    console.log(x + y);
  }
  
  return innerFunction;
}

const myClosure = outerFunction(10);
myClosure(5); // Outputs: 15
\`\`\`

### Practical Example: Counter

\`\`\`javascript
function createCounter() {
  let count = 0;
  
  return function() {
    count++;
    return count;
  };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 (independent counter)
\`\`\`

### Common Use Cases

**1. Data Privacy**
\`\`\`javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance;
  
  return {
    deposit: function(amount) {
      balance += amount;
      return balance;
    },
    withdraw: function(amount) {
      if (amount <= balance) {
        balance -= amount;
        return balance;
      }
      return "Insufficient funds";
    },
    getBalance: function() {
      return balance;
    }
  };
}
\`\`\`

**2. Module Pattern**
\`\`\`javascript
const myModule = (function() {
  let privateVariable = 0;
  
  return {
    increment: function() {
      privateVariable++;
    },
    getCount: function() {
      return privateVariable;
    }
  };
})();
\`\`\`

**Key Points:**
- Closures provide data privacy and encapsulation
- They're commonly used in module patterns and callbacks
- Each closure maintains its own copy of the outer variables
- Memory considerations: closures can prevent garbage collection`,
                    isPinned: false
                }
            ];

            setQuestions(mockQuestions);
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

            // Simulate API call for demo
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockExplanation = {
                title: "Deep Dive: JavaScript Concepts",
                explanation: `## Understanding JavaScript Fundamentals

### Variable Declarations Deep Dive

**Hoisting Mechanism:**
Hoisting is JavaScript's default behavior of moving declarations to the top of their scope during the compilation phase.

\`\`\`javascript
// What you write:
console.log(myVar); // undefined
var myVar = 5;

// How JavaScript interprets it:
var myVar; // Declaration hoisted
console.log(myVar); // undefined
myVar = 5; // Assignment stays in place
\`\`\`

**Temporal Dead Zone (TDZ):**
The period between entering scope and being declared where variables cannot be accessed.

\`\`\`javascript
function example() {
  // TDZ starts
  console.log(myLet); // ReferenceError
  console.log(myConst); // ReferenceError
  
  let myLet = 1; // TDZ ends for myLet
  const myConst = 2; // TDZ ends for myConst
}
\`\`\`

### Memory Management

- **var**: Creates property on global object, can lead to memory leaks
- **let/const**: Block-scoped, better for memory management
- **const**: Prevents reassignment, not immutability of objects

\`\`\`javascript
const obj = { name: "John" };
obj.name = "Jane"; // This is allowed
obj.age = 30; // This is also allowed

// obj = {}; // This would cause an error
\`\`\`

**Performance Considerations:**
- Block-scoped variables (let/const) are optimized better by modern JavaScript engines
- Avoid creating unnecessary closures that can impact memory usage
- Use const when possible for better optimization hints to the engine`
            };

            setExplanation(mockExplanation);
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