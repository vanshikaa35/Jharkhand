const palettes = {
  sky: "bg-sky text-ink",
  blush: "bg-blush text-ink",
  marigold: "bg-marigold-light text-marigold-dark",
  sage: "bg-sage-dark text-ink",
};

export default function Tag({ children, tone = "sky" }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${palettes[tone]}`}
    >
      {children}
    </span>
  );
}
