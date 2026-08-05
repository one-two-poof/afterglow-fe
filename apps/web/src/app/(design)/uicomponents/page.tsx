"use client";
import { Badge, Button, Input, Logo, Modal } from "@afterglow/ui";
import Link from "next/link";
import { useState } from "react";

const UiComponents = () => {
  const [open, setOpen] = useState(false);

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

      <div className="flex flex-col gap-4">
        <Badge size="lg">Day 1</Badge>
        <Badge size="md">Day 2</Badge>
        <Badge size="sm">Day 3</Badge>
      </div>

      <div className="flex flex-col gap-4">
        <Button variant="primary" onClick={() => setOpen(true)}>
          모달 열기
        </Button>

        <Modal open={open} onClose={() => setOpen(false)}>
          <Modal.Header>로그인</Modal.Header>

          <Modal.Body>
            <Button variant="secondary" size="lg">
              Google로 계속하기
            </Button>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" size="md">
              로그인하기
            </Button>
            <Modal.Close className="text-label-md text-neutral-500">
              <Button variant="primary" size="md">
                로그인하기
              </Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal>
      </div>

      <div className="flex w-[280px] flex-col gap-4">
        <Input label="이메일" type="email" placeholder="you@example.com" />
        <Input
          label="비밀번호"
          type="password"
          placeholder="••••••••"
          helperText="8자 이상 입력하세요"
        />
        <Input
          label="에러 상태"
          defaultValue="wrong@"
          error="올바른 이메일 형식이 아닙니다"
        />
        <Input label="비활성화" placeholder="disabled" disabled />

        <Input size="md" placeholder="size md" />
        <Input size="sm" placeholder="size sm" />
      </div>
    </div>
  );
};

export default UiComponents;
