import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Landing from "@/pages/Landing";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import PasswordReset from "@/pages/PasswordReset";
import BrowseChallenges from "@/pages/BrowseChallenges";
import ChallengeDetail from "@/pages/ChallengeDetail";
import SubmitChallenge from "@/pages/SubmitChallenge";
import SubmissionForm from "@/pages/SubmissionForm";
import ThankYou from "@/pages/ThankYou";
import Dashboard from "@/pages/Dashboard";
import PublicProfile from "@/pages/PublicProfile";
import Admin from "@/pages/Admin";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors position="top-right" />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/challenges" element={<BrowseChallenges />} />
            <Route path="/challenges/:id" element={<ChallengeDetail />} />
            <Route path="/submit-challenge" element={<SubmitChallenge />} />
            <Route path="/profile/:studentId" element={<PublicProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/submit/:challengeId" element={
              <ProtectedRoute><SubmissionForm /></ProtectedRoute>
            } />
            <Route path="/submissions/:submissionId/edit" element={
              <ProtectedRoute><SubmissionForm mode="edit" /></ProtectedRoute>
            } />
            <Route path="/thank-you" element={
              <ProtectedRoute><ThankYou /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/:tab" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
