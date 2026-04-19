interface AnnouncementBannerProps {
  text: string;
}

export default function AnnouncementBanner({ text }: AnnouncementBannerProps) {
  const displayText = text || "NO ACTIVE ALERTS - STANDBY FOR UPDATES";

  return (
    <div className="relative overflow-hidden bg-black border-y-4 border-destructive/80 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-red-600 animate-flash-glow z-20" />
      
      <div className="flex items-center gap-4 py-2 sm:py-3 px-4 sm:px-6">
        <div className="shrink-0 flex items-center gap-2 bg-destructive text-white px-3 sm:px-5 py-1 sm:py-1.5 font-extrabold uppercase tracking-widest text-[10px] sm:text-xs z-10 shadow-[0_0_20px_rgba(220,38,38,0.8)] border border-red-500/50">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          BREAKING NEWS
        </div>

        <div className="overflow-hidden flex-1">
          <div className="animate-marquee-right whitespace-nowrap">
            <span className="inline-block text-base sm:text-lg font-bold text-white uppercase tracking-[0.1em] animate-flash-glow">
              {displayText}
            </span>
            <span className="inline-block w-[50vw]" />
            <span className="inline-block text-base sm:text-lg font-bold text-white uppercase tracking-[0.1em] animate-flash-glow">
              {displayText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
