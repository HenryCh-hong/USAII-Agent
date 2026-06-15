/** Fixed cinematic backdrop: faint grid + drifting glow orbs. Decorative only. */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
      <div className="absolute top-1/3 -left-32 h-[28rem] w-[28rem] rounded-full bg-research/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-quant/8 blur-[120px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
    </div>
  );
}
