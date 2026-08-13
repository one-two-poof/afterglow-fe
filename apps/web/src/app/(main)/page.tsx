"use client";

import { MapLibreMap } from "@/components";
import { Input, TagList } from "@afterglow/ui";
import { Search, X } from "lucide-react";
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
  // TODO: 데이터 불러올 시. 변경
  const [filter, setFilter] = useState("all");
  // TODO: 추후 검색 구현 시 Input value x 구현

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
    </div>
  );
}
