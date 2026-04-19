interface AnnouncementBannerProps {
  text: string;
}

export default function AnnouncementBanner({ text }: AnnouncementBannerProps) {
  if (!text) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-xl">
      {/* Animated left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-flash-glow rounded-full" />
      
      <div className="flex items-center gap-4 py-3 px-5">
        {/* Badge */}
        <div className="shrink-0 flex items-center gap-1.5 bg-primary/15 border border-primary/25 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
            Live
          </span>
        </div>

        {/* Scrolling text */}
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee-right whitespace-nowrap">
            <span className="inline-block text-sm font-medium text-foreground/90 animate-flash-glow">
              {text}
            </span>
            <span className="inline-block w-40" />
            <span className="inline-block text-sm font-medium text-foreground/90 animate-flash-glow">
              {text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
