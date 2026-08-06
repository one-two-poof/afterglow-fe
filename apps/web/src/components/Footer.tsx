"use client";

import { cn } from "@afterglow/utils";
import { Home, LineSquiggle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENUS = [
  { title: "홈", url: "/", icon: <Home /> },
  { title: "내 코스", url: "/my-course", icon: <LineSquiggle /> },
  { title: "내 정보", url: "/my-page", icon: <User /> },
];

const Footer = () => {
  const pathname = usePathname();
  return (
    <footer>
      <ul className="flex justify-between px-8 py-3">
        {MENUS.map((menu) => (
          <li key={menu.url}>
            <Link
              href={menu.url}
              className={cn(
                "flex flex-col items-center gap-1 text-label-md",
                menu.url === pathname
                  ? "text-action-primary"
                  : "text-text-muted",
              )}
            >
              <span>{menu.icon}</span>
              <span>{menu.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
};

export default Footer;
