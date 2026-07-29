import { Header } from "@/components";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="h-[1000px] flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
