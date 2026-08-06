interface StatusBadgeProps {
  current: number;
  max: number;
}

export const StatusBadge = ({ current, max }: StatusBadgeProps) => {
  if (current > max) {
    return;
  }

  return (
    <span className="flex items-center justify-center rounded-[12px] bg-primary-100 px-[10px] py-1 text-label-sm text-primary">
      <span>{`${current} / ${max} 단계`}</span>
    </span>
  );
};
