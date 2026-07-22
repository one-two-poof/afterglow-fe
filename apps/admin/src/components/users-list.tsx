"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@afterglow/api";

export function UsersList() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isPending) {
    return <p className="text-foreground/60">사용자 불러오는 중…</p>;
  }

  if (isError) {
    return <p className="text-red-500">사용자를 불러오지 못했습니다.</p>;
  }

  return (
    <ul className="divide-y divide-foreground/10 rounded-lg border border-foreground/10">
      {data.map((user) => (
        <li key={user.id} className="flex flex-col gap-0.5 p-4">
          <span className="font-medium">{user.name}</span>
          <span className="text-sm text-foreground/60">{user.email}</span>
        </li>
      ))}
    </ul>
  );
}
