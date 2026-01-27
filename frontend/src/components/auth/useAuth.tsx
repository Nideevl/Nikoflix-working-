"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("jwt");
    if (t) {
      setToken(t);
      setIsUser(true);
    }
  }, []);

  function login(token: string) {
    localStorage.setItem("jwt", token);
    setToken(token);
    setIsUser(true);
  }

  function logout() {
    localStorage.removeItem("jwt");
    setToken(null);
    setIsUser(false);
  }

  return { token, isUser, login, logout };
}
