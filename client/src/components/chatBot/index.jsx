import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";

const Chatbot = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat`,
        { message: input }
      );
      const botMessage = {
        role: "bot",
        content: response.data?.response || "No reply received.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error connecting to chatbot:", error);
      const errorMessage = {
        role: "bot",
        content: "Error connecting to chatbot. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        className="p-4 bg-white shadow-xl rounded-lg w-[32rem] max-h-[480px] flex flex-col"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.8,
          y: isOpen ? 0 : 20,
        }}
        transition={{ duration: 0.3 }}
        style={{
          display: isOpen ? "flex" : "none",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div className="flex-1 overflow-y-auto mb-3 pb-2 border-b">
          {messages.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              How can I help you today?
            </p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
            >
              <p
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.content}
              </p>
            </div>
          ))}
          {isLoading && (
            <div className="text-left mb-3">
              <p className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                Thinking...
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <button
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-r-lg disabled:bg-gray-400"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            aria-label="Send Message"
          >
            <Send size={20} />
          </button>
        </div>
      </motion.div>

      <motion.button
        className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
        onClick={toggleChat}
        aria-label="Toggle Chatbot"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
};

export default Chatbot;
