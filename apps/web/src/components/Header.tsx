"use client";

import { Logo } from "@afterglow/ui";
import { cn } from "@afterglow/utils";
import { Globe, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { title: "Find Clinics", url: "/find-clinics" },
  { title: "Recovery Courses", url: "/recovery-courses" },
  { title: "My Itinerary", url: "/my-itinerary" },
];

const Header = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-4 md:px-10">
      <div className="flex items-center gap-[50px]">
        <Logo />
        <nav className="hidden md:block">
          <ul className="flex gap-8">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.url}
                className={cn(
                  "text-label-md",
                  item.url === pathname
                    ? "scale-[1.1] border-b-2 border-border-focus pb-1 text-text transition"
                    : "text-text-secondary",
                )}
              >
                <Link href={item.url}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex items-center gap-5">
        <Globe width={32} height={32} />
        {/* TODO: 사진 기능 가능여부에 따른 변경 및 로그인 여부에따른 조건부 처리*/}
        <Image alt="프로필 아바타" src="/Avatar.png" width={32} height={32} />
        <button
          type="button"
          className="md:hidden"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={28} />
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-black/30" />
        <nav
          id="mobile-menu"
          className={cn(
            "absolute top-0 right-0 h-full w-3/4 max-w-xs bg-surface p-6 shadow-xl transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="mb-6"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
          >
            <X size={24} />
          </button>
          <ul className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.url}>
                <Link
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-body-lg",
                    item.url === pathname
                      ? "border-b-2 border-border-focus pb-1 text-text"
                      : "text-text-secondary",
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
