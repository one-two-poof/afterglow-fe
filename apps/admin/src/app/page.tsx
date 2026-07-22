import { Button } from "@afterglow/design-system";
import { formatDate } from "@afterglow/utils";
import { UsersList } from "@/components/users-list";

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin</h1>
        <Button>+ 사용자 추가</Button>
      </div>
      <p className="mb-6 text-sm text-foreground/50">{formatDate(new Date())}</p>
      <UsersList />
    </main>
  );
}
