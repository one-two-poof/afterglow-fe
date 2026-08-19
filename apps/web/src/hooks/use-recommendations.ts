"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRecommendations } from "@/lib/recommendations";

/** 저장된(내) 코스 목록을 조회한다. */
export const useRecommendations = () =>
  useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
  });
