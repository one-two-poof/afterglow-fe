"use client";

import { MapLibreMap, TripPlanPanel } from "@/components";
import { getAccessToken } from "@/lib/auth";
import { Input, TagList } from "@afterglow/ui";
import { Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// TODO: 데이터 불러올 시 변경

const TAGITEMS = [
  {
    value: "all",
    icon: "🏥",
    name: "전체",
  },
  {
    value: "hospital",
    icon: "🏥",
    name: "병원",
  },
  {
    value: "course-A",
    icon: "🏥",
    name: "강남 피부 시술 병원 코스",
  },
  {
    value: "course-B",
    icon: "🏥",
    name: "세브란스 병원 시술 코스",
  },
];

export default function Home() {
  const router = useRouter();
  // TODO: 데이터 불러올 시. 변경
  const [filter, setFilter] = useState("all");
  // TODO: 추후 검색 구현 시 Input value x 구현
  const [planOpen, setPlanOpen] = useState(false);

  // 여행 일정 만들기는 로그인 필요 — 미로그인 시 내 정보(로그인) 화면으로 이동
  const handleCreatePlan = () => {
    if (!getAccessToken()) {
      router.push("/my-page");
      return;
    }
    setPlanOpen(true);
  };

  return (
    <div className="relative h-full">
      <MapLibreMap />
      <Input
        className="absolute top-4 left-1/2 w-[95%] -translate-x-1/2"
        placeholder="병원 또는 관광지를 검색해보세요"
        leftIcon={<Search size={18} />}
        rightIcon={<X size={18} />}
        size="lg"
      />

      <TagList
        value={filter}
        onChange={setFilter}
        className="absolute bottom-0 p-5"
      >
        {TAGITEMS.map((item) => (
          <TagList.Item key={item.value} value={item.value} icon={item.icon}>
            {item.name}
          </TagList.Item>
        ))}
      </TagList>

      <button
        type="button"
        aria-label="여행 일정 만들기"
        onClick={handleCreatePlan}
        className="absolute right-5 bottom-28 z-10 flex size-14 items-center justify-center rounded-full bg-action-primary text-on-action-primary shadow-md hover:bg-action-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
      >
        <Plus size={26} />
      </button>

      <TripPlanPanel open={planOpen} onClose={() => setPlanOpen(false)} />
    </div>
  );
}
