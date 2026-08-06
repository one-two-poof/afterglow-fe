"use client";

import { useAuthModalStore } from "@/stores/auth-modal-store";
import { Button, Logo, Modal } from "@afterglow/ui";

const LoginModal = () => {
  const isOpen = useAuthModalStore((state) => state.isOpen);
  const close = useAuthModalStore((state) => state.close);

  const handleGoogleLogin = () => {
    const authUrl = new URL(
      "api/auth/login/google",
      process.env.NEXT_PUBLIC_API_URL,
    );

    // 로그인 후 복귀할 현재 위치를 저장 — 같은 탭·오리진이라 콜백에서 그대로 꺼낼 수 있음
    sessionStorage.setItem(
      "returnTo",
      window.location.pathname + window.location.search,
    );

    window.location.href = authUrl.toString();
  };

  return (
    <Modal open={isOpen} onClose={close} className="w-[360px]">
      <Modal.Header className="justify-center gap-1">
        <Logo />
        <span>Afterglow</span>
      </Modal.Header>

      <Modal.Body>
        <p className="text-body-sm text-text-secondary">
          Google 계정으로 간편하게 로그인하고 시작하세요.
        </p>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleGoogleLogin}
          className="mt-4 w-full"
        >
          Google로 계속하기
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
