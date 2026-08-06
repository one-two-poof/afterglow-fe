"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const OAuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      localStorage.setItem("accessToken", token);

      const returnTo = sessionStorage.getItem("returnTo") ?? "/";
      sessionStorage.removeItem("returnTo");
      router.replace(returnTo);
    } else {
      router.replace("/?error=login_failed");
    }
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-body-md text-text-secondary">로그인 처리 중...</p>
    </div>
  );
};

export default OAuthCallbackPage;
