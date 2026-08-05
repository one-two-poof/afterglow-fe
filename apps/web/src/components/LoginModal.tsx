"use client";

import { useAuthModalStore } from "@/stores/auth-modal-store";
import { Button, Logo, Modal } from "@afterglow/ui";

const LoginModal = () => {
  const isOpen = useAuthModalStore((state) => state.isOpen);
  const close = useAuthModalStore((state) => state.close);

  const handleGoogleLogin = () => {
    // TODO: Google OAuth 연동 — 백엔드 인증 엔드포인트로 리다이렉트/팝업 처리
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
