export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-marigold text-white hover:bg-marigold-dark active:scale-[0.98]",
    secondary: "bg-ink text-cream hover:bg-ink/90 active:scale-[0.98]",
    ghost: "bg-transparent text-ink border border-ink/15 hover:bg-sage-dark/50",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
