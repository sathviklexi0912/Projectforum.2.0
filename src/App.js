import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Interactions from "@/components/Interactions";

import Landing from "@/pages/Landing";
import BrowseChallenges from "@/pages/BrowseChallenges";
import ChallengeDetail from "@/pages/ChallengeDetail";
import SubmissionForm from "@/pages/SubmissionForm";
import Dashboard from "@/pages/Dashboard";
import PublicProfile from "@/pages/PublicProfile";
import EditProfile from "@/pages/EditProfile";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import PasswordReset from "@/pages/PasswordReset";
import SubmitChallenge from "@/pages/SubmitChallenge";
import ThankYou from "@/pages/ThankYou";
import Admin from "@/pages/Admin";
import TalentDirectory from "@/pages/TalentDirectory";
import Legal from "@/pages/Legal";
import NotFound from "@/pages/NotFound";
import { TERMS, PRIVACY } from "@/content/legal";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Interactions />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/challenges" element={<BrowseChallenges />} />
            <Route path="/challenges/:id" element={<ChallengeDetail />} />
            <Route path="/submit/:id" element={
              <ProtectedRoute>
                <SubmissionForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/:tab" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/:tab/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile/:student_id" element={<PublicProfile />} />
            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/submit-challenge" element={<SubmitChallenge />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/talent" element={<TalentDirectory />} />
            <Route path="/terms" element={<Legal doc={TERMS} otherLink={{ to: "/privacy", label: "Privacy Policy" }} />} />
            <Route path="/privacy" element={<Legal doc={PRIVACY} otherLink={{ to: "/terms", label: "Terms of Service" }} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
