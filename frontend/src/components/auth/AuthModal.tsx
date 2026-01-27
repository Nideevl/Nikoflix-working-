"use client";

import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import VerifyOtpForm from "./VerifyOtpForm";
import SetPasswordForm from "./setPasswordForm";
import styles from "./auth.module.css";

type Mode = "login" | "signup" | "otp" | "password";

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("OPEN_AUTH_MODAL", handler);
    return () => window.removeEventListener("OPEN_AUTH_MODAL", handler);
  }, []);

  if (!open) return null;

  function closeModal() {
    setOpen(false);
    setMode("login");
    setEmail("");
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* LOGIN */}
        {mode === "login" && (
          <LoginForm
            switchMode={() => setMode("signup")}
            close={closeModal}
          />
        )}

        {/* SIGNUP */}
        {mode === "signup" && (
          <SignupForm
            switchMode={() => setMode("login")}
            onOtp={(mail) => {
              setEmail(mail);
              setMode("otp");
            }}
          />
        )}

        {/* VERIFY OTP */}
        {mode === "otp" && (
          <VerifyOtpForm
            email={email}
            goBack={() => setMode("signup")}
            onVerified={() => setMode("password")}
          />
        )}

        {/* SET PASSWORD */}
        {mode === "password" && (
          <SetPasswordForm
            email={email}
            goBack={() => setMode("otp")}
            close={closeModal}
          />
        )}

      </div>
    </div>
  );
}
