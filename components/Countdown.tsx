interface Props {
  value: number;
}

export default function Countdown({ value }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/35">
      <p
        key={value}
        className="anim-pop title-glow font-mono text-8xl font-black sm:text-9xl"
        aria-hidden="true"
      >
        {value}
      </p>
      <p className="max-w-xs rounded-lg bg-black/60 px-4 py-2 text-center text-sm font-semibold">
        Move: WASD / arrow keys, or drag on touch. Dodge everything for 60
        seconds.
      </p>
    </div>
  );
}
