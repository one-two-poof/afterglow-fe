"use client";

import { cn } from "@afterglow/utils";
import {
  ComponentPropsWithoutRef,
  ReactNode,
  createContext,
  useContext,
  useRef,
} from "react";

interface TagListContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TagListContext = createContext<TagListContextValue | null>(null);

const useTagListContext = () => {
  const context = useContext(TagListContext);

  if (!context) {
    throw new Error("TagList.Item은 <TagList> 안에서만 사용할 수 있습니다.");
  }
  return context;
};

const DRAG_THRESHOLD = 4;

interface TagListRootProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

const TagListRoot = ({
  value,
  onChange,
  children,
  className,
  "aria-label": ariaLabel,
}: TagListRootProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    moved: false,
    captured: false,
    startX: 0,
    startScroll: 0,
  });

  return (
    <TagListContext.Provider value={{ value, onChange }}>
      <div
        ref={listRef}
        role="group"
        aria-label={ariaLabel}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") {
            return;
          }
          const el = listRef.current;
          if (!el) {
            return;
          }
          drag.current = {
            active: true,
            moved: false,
            captured: false,
            startX: e.clientX,
            startScroll: el.scrollLeft,
          };
        }}
        onPointerMove={(e) => {
          const el = listRef.current;
          if (!el || !drag.current.active) {
            return;
          }
          const dx = e.clientX - drag.current.startX;
          if (!drag.current.moved && Math.abs(dx) > DRAG_THRESHOLD) {
            drag.current.moved = true;
            drag.current.captured = true;
            el.setPointerCapture(e.pointerId);
          }
          if (drag.current.moved) {
            el.scrollLeft = drag.current.startScroll - dx;
          }
        }}
        onPointerUp={(e) => {
          if (drag.current.captured) {
            listRef.current?.releasePointerCapture(e.pointerId);
          }
          drag.current.active = false;
          drag.current.captured = false;
        }}
        onPointerCancel={() => {
          drag.current.active = false;
          drag.current.captured = false;
        }}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className={cn(
          "flex w-full items-center gap-2 overflow-x-auto",
          "cursor-grab select-none active:cursor-grabbing",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {children}
      </div>
    </TagListContext.Provider>
  );
};

interface TagListItemProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "value" | "onClick"
> {
  value: string;
  icon?: ReactNode;
  children: ReactNode;
}

const TagListItem = ({
  value,
  icon,
  children,
  className,
  disabled,
  ...rest
}: TagListItemProps) => {
  const { value: selectedValue, onChange } = useTagListContext();
  const selected = value === selectedValue;

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onChange(value)}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-label-md whitespace-nowrap transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "bg-primary text-neutral-0"
          : "bg-neutral-0 text-text-secondary shadow-sm hover:bg-surface-muted",
        className,
      )}
      {...rest}
    >
      {icon != null && (
        <span aria-hidden className="flex items-center">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
};

export const TagList = Object.assign(TagListRoot, {
  Item: TagListItem,
});
