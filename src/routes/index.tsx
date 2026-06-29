import { BrowserRouter, Routes, Route } from "react-router-dom";

import {LoginPage} from "../pages/auth/LoginPage";
import {RegisterPage} from "../pages/auth/RegisterPage";
import {ChatPage} from "../pages/chat/ChatPage";
import {ForgotPasswordPage} from "../pages/auth/ForgotPasswordPage";
import {ResetPasswordPage} from "../pages/auth/ResetPasswordPage";
import {ProtectedRoute} from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}