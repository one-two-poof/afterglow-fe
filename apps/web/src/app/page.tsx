import { Button } from "@afterglow/design-system";
import { formatDate } from "@afterglow/utils";
import { Counter } from "@/components/counter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Afterglow</h1>
      <p className="text-foreground/60">
        Next.js 16 · Tailwind v4 · TanStack Query · Zustand
      </p>
      <p className="text-sm text-foreground/50">{formatDate(new Date())}</p>
      <Counter />
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </main>
  );
}
