"use client";

import { cn } from "@afterglow/utils";
import {
  ComponentPropsWithoutRef,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface ModalContextValue {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error(
      "Modal 하위 컴포넌트는 <Modal> 안에서만 사용할 수 있습니다.",
    );
  }
  return context;
};

interface ModalRootProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  container?: Element;
}

const ModalRoot = ({
  open,
  onClose,
  children,
  className,
  container,
}: ModalRootProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <ModalContext.Provider value={{ onClose }}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/50"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn("rounded-[16px] bg-neutral-50 p-6", className)}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    container ?? document.body,
  );
};

type SlotProps = ComponentPropsWithoutRef<"div">;

const ModalHeader = ({ className, children, ...rest }: SlotProps) => (
  <div
    className={cn(
      "flex items-center justify-between text-heading-sm",
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

const ModalBody = ({ className, children, ...rest }: SlotProps) => (
  <div className={cn("mt-4 text-body-md", className)} {...rest}>
    {children}
  </div>
);

const ModalFooter = ({ className, children, ...rest }: SlotProps) => (
  <div className={cn("mt-6 flex items-center gap-2", className)} {...rest}>
    {children}
  </div>
);

type CloseProps = ComponentPropsWithoutRef<"button">;

const ModalClose = ({ className, children, onClick, ...rest }: CloseProps) => {
  const { onClose } = useModalContext();
  return (
    <button
      type="button"
      aria-label="닫기"
      onClick={(e) => {
        onClick?.(e);
        onClose();
      }}
      className={cn("cursor-pointer", className)}
      {...rest}
    >
      {children ?? "✕"}
    </button>
  );
};

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});
