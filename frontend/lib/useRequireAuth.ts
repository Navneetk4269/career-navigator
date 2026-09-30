"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "./api";

export function useRequireAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const syncSession = () => {
      const currentToken = getAccessToken();
      if (!currentToken) {
        setToken(null);
        router.replace("/login");
        return;
      }
      setToken(currentToken);
    };

    syncSession();
    window.addEventListener("career-navigator-auth-change", syncSession);
    return () => {
      window.removeEventListener("career-navigator-auth-change", syncSession);
    };
  }, [router]);

  return token;
}
