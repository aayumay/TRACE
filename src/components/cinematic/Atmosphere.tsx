/**
 * TRACE cinematic depth backdrop — COSMIC NEBULA VIOLET PALETTE
 * Pure presentation layer: #080611 deep space, violet floor glow, subtle starlight,
 * and delicate film grain. Pointer-events free.
 */
export function Atmosphere({
  className = '',
  fixed = true,
  opaque = true,
}: {
  className?: string;
  fixed?: boolean;
  opaque?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 z-0 overflow-hidden pointer-events-none select-none ${className}`}
    >
      {/* Base depth — #080611 deep space */}
      <div
        className="absolute inset-0"
        style={
          opaque
            ? {
                background:
                  'radial-gradient(120% 90% at 50% 0%, #100c22 0%, #080611 50%, #04030a 100%)',
              }
            : {
                background:
                  'radial-gradient(120% 90% at 50% 0%, rgba(16,12,34,0.85) 0%, rgba(8,6,17,0.75) 50%, rgba(4,3,10,0.65) 100%)',
              }
        }
      />

      {/* Soft starlight light on upper quadrant */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 50% at 18% 8%, rgba(214,196,255,0.06), transparent 60%)',
        }}
      />

      {/* Nebula violet floor glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 75% at 50% 100%, rgba(155,107,255,0.14), transparent 55%)',
        }}
      />

      {/* Thin horizon strata */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, transparent 0%, transparent 38%, rgba(255,255,255,0.06) 38.2%, transparent 38.6%, transparent 62%, rgba(255,255,255,0.05) 62.2%, transparent 62.6%, transparent 88%, rgba(255,255,255,0.07) 88.2%, transparent 88.6%)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(4,3,10,0.6) 100%)',
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}