import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/auth-context";
import InstructorProvider from "./context/instructor-context";
import StudentProvider from "./context/student-context";
import { Toaster } from "sonner";
import InitialLoader from "./components/ui/InitialLoader.jsx";

function RootWrapper() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading (can be replaced with auth token check etc.)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // Duration in ms

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <InitialLoader />;

  return (
    <BrowserRouter>
      <AuthProvider>
        <InstructorProvider>
          <StudentProvider>
            <App />
            <Toaster position="top-center" richColors closeButton duration={5000} />
          </StudentProvider>
        </InstructorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<RootWrapper />);
