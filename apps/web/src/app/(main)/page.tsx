"use client";

import NaverMap from "@/components/NaverMap";
import { TagList } from "@afterglow/ui";
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

  return (
    <div className="relative h-full">
      <NaverMap />
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
