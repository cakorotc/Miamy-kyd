export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-dots opacity-40" />
      <div className="absolute -left-40 top-[-15%] h-[26rem] w-[26rem] rounded-full bg-main/10 blur-[110px] animate-[drift1_26s_ease-in-out_infinite] sm:h-[32rem] sm:w-[32rem]" />
      <div className="absolute right-[-18%] top-1/4 h-[28rem] w-[28rem] rounded-full bg-info/10 blur-[120px] animate-[drift2_32s_ease-in-out_infinite] sm:h-[34rem] sm:w-[34rem]" />
      <div className="absolute bottom-[-22%] left-1/4 h-[24rem] w-[24rem] rounded-full bg-success/8 blur-[110px] animate-[drift3_36s_ease-in-out_infinite] sm:h-[30rem] sm:w-[30rem]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/70" />
    </div>
  );
}
