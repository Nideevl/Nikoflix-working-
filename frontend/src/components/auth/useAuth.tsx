"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      setIsUser(true);
    }
  }, []);

  function login(token: string) {
    localStorage.setItem("token", token);
    setToken(token);
    setIsUser(true);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setIsUser(false);
  }

  function adminLogout() {
    localStorage.removeItem("admin_token");
    setToken(null);
    setIsUser(false);
  }

  return { token, isUser, login, logout, adminLogout };
}
