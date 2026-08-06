import { Footer } from "@/components";
import { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-dvh justify-center bg-neutral-100">
      <div className="flex min-h-dvh w-full max-w-3xl flex-col bg-surface shadow-sm">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
