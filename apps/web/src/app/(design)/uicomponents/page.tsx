"use client";
import {
  StatusBadge,
  Button,
  Input,
  Logo,
  Modal,
  TagList,
} from "@afterglow/ui";
import { Calendar, TripSummaryCard, type DateRange } from "@/components";
import { Eye, EyeOff, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const UiComponents = () => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showPassword, setShowPassword] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [tripRange, setTripRange] = useState<DateRange>({
    start: new Date(2026, 10, 15),
    end: new Date(2026, 10, 18),
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex w-[400px] max-w-full flex-col gap-3 rounded-[24px] bg-bg p-3">
        <TripSummaryCard range={tripRange} />
        <Calendar
          value={tripRange}
          onChange={setTripRange}
          startLabel="시작일"
          defaultMonth={new Date(2026, 10, 1)}
        />
      </div>

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
        <StatusBadge current={1} max={4} />
        <StatusBadge current={2} max={4} />
        <StatusBadge current={3} max={4} />
        <StatusBadge current={4} max={4} />
        <StatusBadge current={5} max={4} />
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

      <div className="flex w-[280px] flex-col gap-4">
        <Input
          label="검색"
          placeholder="병원 검색"
          leftIcon={<Search size={18} />}
        />

        <Input
          label="값 지우기"
          placeholder="입력해 보세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          rightIcon={
            keyword ? (
              <button
                type="button"
                aria-label="입력 지우기"
                onClick={() => setKeyword("")}
                className="cursor-pointer"
              >
                <X size={18} />
              </button>
            ) : null
          }
        />

        {/* 오른쪽 아이콘 — 비밀번호 표시 토글 */}
        <Input
          label="비밀번호"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          rightIcon={
            <button
              type="button"
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              onClick={() => setShowPassword((v) => !v)}
              className="cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {/* 좌우 아이콘 동시 */}
        <Input
          label="좌우 아이콘"
          placeholder="search + clear"
          leftIcon={<Search size={18} />}
          rightIcon={<X size={18} />}
          size="md"
        />
      </div>

      <div className="flex w-[360px] flex-col gap-4">
        <TagList value={filter} onChange={setFilter} aria-label="카테고리 필터">
          <TagList.Item value="all">전체</TagList.Item>
          <TagList.Item value="clinic" icon="🏥">
            추천병원
          </TagList.Item>
          <TagList.Item value="spot" icon="📍">
            관광명소
          </TagList.Item>
          <TagList.Item value="course" icon="📍">
            아이디 성형외과 코스
          </TagList.Item>
          <TagList.Item value="review" icon="⭐">
            후기
          </TagList.Item>
          <TagList.Item value="event" icon="🎁" disabled>
            이벤트(비활성)
          </TagList.Item>
        </TagList>
      </div>
    </div>
  );
};

export default UiComponents;
