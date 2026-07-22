"use client";

import { useCounterStore } from "@/stores/counter-store";

export function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-2xl font-semibold" aria-live="polite">
        Count: <span data-testid="count">{count}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={decrement}
          className="rounded-md border border-foreground/20 px-4 py-2 hover:bg-foreground/5"
        >
          -
        </button>
        <button
          onClick={reset}
          className="rounded-md border border-foreground/20 px-4 py-2 hover:bg-foreground/5"
        >
          Reset
        </button>
        <button
          onClick={increment}
          className="rounded-md border border-foreground/20 px-4 py-2 hover:bg-foreground/5"
        >
          +
        </button>
      </div>
    </div>
  );
}
