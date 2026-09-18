interface SectionHeaderProps {
  id: string;
  command: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
}

export default function SectionHeader({
  id,
  command,
  title,
  description,
  right,
}: SectionHeaderProps) {
  return (
    <div className="mb-9 sm:mb-11">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
        <span className="text-muted">
          <span className="mr-2 text-accent" aria-hidden="true">
            $
          </span>
          {command}
        </span>
        {right && <span className="text-muted">{right}</span>}
      </div>
      <h2
        id={id}
        className="text-[clamp(28px,3.5vw,38px)] font-medium leading-tight tracking-[-0.035em]"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
