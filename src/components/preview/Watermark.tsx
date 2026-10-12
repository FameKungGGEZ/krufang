import React from 'react';

export function Watermark() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div className="absolute inset-[-50%] flex rotate-[-24deg] flex-wrap content-center gap-x-24 gap-y-20 opacity-[0.07]">
        {Array.from({ length: 60 }).map((_, i) =>
        <span key={i} className="font-mono text-sm font-semibold tracking-[0.3em] text-foreground">
            KRU.FANG STUDIO
          </span>
        )}
      </div>
      <span className="absolute bottom-3 right-3 rounded-md bg-background/85 px-2 py-1 font-mono text-[10px] font-medium tracking-widest text-muted-foreground shadow-sm ring-1 ring-border">
        © KRU.FANG STUDIO
      </span>
    </div>);

}