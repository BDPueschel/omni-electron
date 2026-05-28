interface GroupHeaderProps {
  category: string;
  count: number;
  isActive: boolean;
  isExpanded: boolean;
}

export function GroupHeader({ category, count, isActive, isExpanded }: GroupHeaderProps) {
  return (
    <div
      className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border-b border-white/[0.04] select-none ${
        isActive ? 'text-omni-group-text bg-[rgba(130,180,255,0.03)]' : 'text-white/25 bg-white/[0.02]'
      }`}
      style={{ animation: 'fadeIn var(--anim-duration, 100ms) ease-out' }}
    >
      {category} ({count})
      {isExpanded && <span className="ml-2 text-[9px] font-normal italic text-white/20">expanded</span>}
    </div>
  );
}
