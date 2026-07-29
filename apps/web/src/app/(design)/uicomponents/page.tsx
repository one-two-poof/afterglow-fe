"use client";
import { Button, Logo } from "@afterglow/ui";
import Link from "next/link";

const UiComponents = () => {
  return (
    <div className="flex gap-4 p-4">
      <div className="flex flex-col gap-4">
        <Button as="a" href="/test" variant="primary">
          로그인
        </Button>
        <Button variant="secondary">로그인</Button>
        <Button variant="ghost">로그인</Button>{" "}
        <Button variant="primary" size="lg" disabled>
          로그인
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <Button variant="primary" size="md">
          로그인
        </Button>
        <Button variant="secondary" size="md">
          로그인
        </Button>{" "}
        <Button variant="ghost" size="md">
          로그인
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Button variant="primary" size="sm">
          로그인
        </Button>

        <Button variant="secondary" size="sm">
          로그인
        </Button>

        <Button variant="ghost" size="sm">
          로그인
        </Button>
      </div>

      <div>
        <Link href="/">
          <Logo />
        </Link>
      </div>
    </div>
  );
};

export default UiComponents;
