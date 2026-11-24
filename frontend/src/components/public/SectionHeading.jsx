export default function SectionHeading({
  badge,
  title,
  subtitle,
  description,
  align = 'center',
  action,
  className = '',
}) {
  const isCenter = align === 'center';
  const textDesc = subtitle || description;

  return (
    <div
      className={`mb-12 ${
        isCenter ? 'text-center mx-auto max-w-3xl' : 'flex flex-col md:flex-row md:items-end md:justify-between gap-4'
      } ${className}`}
    >
      <div>
        {badge && (
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-[#0b7a55]/20 bg-[#e4f2ec] px-3.5 py-1 text-xs font-bold text-[#0b7a55] mb-3`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#0b7a55]" />
            <span>{badge}</span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
          {title}
        </h2>
        {textDesc && (
          <p className="mt-3 text-sm sm:text-base text-[#4a5666] leading-relaxed">
            {textDesc}
          </p>
        )}
      </div>

      {action && !isCenter && <div className="shrink-0">{action}</div>}
    </div>
  );
}
