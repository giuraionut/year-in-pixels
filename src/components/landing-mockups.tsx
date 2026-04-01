import { cn } from "@/lib/utils";

export const PixelsMockup = () => {
  // Generate a predictable pattern 
  const weeks = 20;
  const days = 7;
  const total = weeks * days;
  
  return (
    <div className="w-full h-full min-h-[300px] bg-background border border-border/50 rounded-xl shadow-xl flex items-center justify-center p-8 overflow-hidden relative">
       {/* Abstract UI Shell */}
       <div className="absolute top-0 left-0 w-full h-8 bg-muted/20 border-b border-border/50 flex items-center px-4 gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
       </div>

       <div className="grid grid-rows-7 grid-flow-col gap-1.5 mt-4">
         {Array.from({ length: total }).map((_, i) => {
            // Deterministic "random" based on index
            const isMuted = (i * 123 + 45) % 10 > 7; 
            const variant = (i * 321 + 12) % 10;
            
            let colorClass = "bg-muted";
            if (!isMuted) {
                if (variant > 6) colorClass = "bg-primary";
                else if (variant > 3) colorClass = "bg-purple-500/70";
                else colorClass = "bg-primary/40";
            }
            
            return (
                <div key={i} className={cn("w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-[2px] transition-all hover:scale-125 hover:shadow-sm", colorClass)} />
            )
         })}
       </div>
    </div>
  )
}

export const DiaryMockup = () => {
  return (
    <div className="w-full h-full min-h-[300px] bg-background border border-border/50 rounded-xl shadow-xl p-8 relative overflow-hidden flex flex-col">
       <div className="w-full flex items-center justify-between mb-6">
          <div className="h-6 w-1/3 bg-muted rounded-md animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-full" />
       </div>
       
       <div className="space-y-3 flex-1">
          <div className="h-3 w-full bg-muted/50 rounded animate-pulse delay-75" />
          <div className="h-3 w-[92%] bg-muted/50 rounded animate-pulse delay-100" />
          <div className="h-3 w-[96%] bg-muted/50 rounded animate-pulse delay-150" />
          <div className="h-3 w-[75%] bg-muted/50 rounded animate-pulse delay-200" />
          <div className="h-4" /> {/* Spacer */}
          <div className="h-3 w-full bg-muted/50 rounded animate-pulse delay-300" />
          <div className="h-3 w-[88%] bg-muted/50 rounded animate-pulse delay-400" />
          <div className="h-3 w-[60%] bg-muted/50 rounded animate-pulse delay-500" />
       </div>

       {/* Editor Toolbar simulation */}
       <div className="absolute bottom-0 left-0 w-full h-10 bg-muted/20 border-t border-border/50 flex items-center px-6 gap-3">
          <div className="w-3 h-3 bg-muted/60 rounded" />
          <div className="w-3 h-3 bg-muted/60 rounded" />
          <div className="w-3 h-3 bg-muted/60 rounded" />
          <div className="ml-auto w-16 h-3 bg-muted/60 rounded" />
       </div>
    </div>
  )
}

export const DashboardMockup = () => {
  return (
    <div className="w-full h-full min-h-[300px] bg-background border border-border/50 rounded-xl shadow-xl p-6 relative overflow-hidden grid grid-cols-2 gap-4">
        {/* Abstract UI Shell header */}
        <div className="col-span-2 flex justify-between items-center mb-2">
             <div className="h-5 w-24 bg-muted rounded" />
             <div className="h-5 w-16 bg-muted/50 rounded" />
        </div>

        {/* Stat Cards */}
        <div className="col-span-2 grid grid-cols-3 gap-3 mb-2">
            <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                <div className="h-2 w-8 bg-muted rounded mb-2" />
                <div className="h-5 w-6 bg-primary/80 rounded" />
            </div>
            <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                <div className="h-2 w-8 bg-muted rounded mb-2" />
                <div className="h-5 w-6 bg-purple-500/70 rounded" />
            </div>
            <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                <div className="h-2 w-8 bg-muted rounded mb-2" />
                <div className="h-5 w-6 bg-pink-500/70 rounded" />
            </div>
        </div>

        {/* Main Chart Area */}
        <div className="col-span-2 sm:col-span-1 bg-muted/10 rounded-lg border border-border/30 p-4 flex items-end justify-between gap-1.5 h-32">
             {/* Bars */}
             <div className="w-full bg-primary/30 rounded-t-[2px] h-[30%]" />
             <div className="w-full bg-primary/50 rounded-t-[2px] h-[60%]" />
             <div className="w-full bg-primary rounded-t-[2px] h-[80%]" />
             <div className="w-full bg-primary/70 rounded-t-[2px] h-[45%]" />
             <div className="w-full bg-primary/40 rounded-t-[2px] h-[35%]" />
        </div>

        {/* Secondary Area */}
        <div className="col-span-2 sm:col-span-1 bg-muted/10 rounded-lg border border-border/30 p-4 flex items-center justify-center h-32">
             <div className="w-20 h-20 rounded-full border-[6px] border-purple-500/20 border-t-purple-500 border-r-purple-500/70 rotate-[-45deg]" />
        </div>
    </div>
  )
}

export const MoodsEventsMockup = () => {
  const items = [
    { color: "bg-green-400", name: "Happy", width: "w-16" },
    { color: "bg-blue-400", name: "Relaxed", width: "w-20" },
    { color: "bg-yellow-400", name: "Productive", width: "w-24" },
    { color: "bg-red-400", name: "Anxious", width: "w-14" },
  ]

  return (
    <div className="w-full h-full min-h-[300px] bg-background border border-border/50 rounded-xl shadow-xl p-6 relative overflow-hidden flex flex-col">
       <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-7 w-7 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold shadow-sm">+</div>
       </div>

       <div className="space-y-3">
          {items.map((m, i) => (
             <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/40 shadow-xs hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-3">
                   <div className={`w-3.5 h-3.5 rounded-full ${m.color} ring-2 ring-background`} />
                   <div className={`h-3 bg-muted-foreground/30 rounded ${m.width}`} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-3 h-3 bg-muted rounded-[1px]" />
                    <div className="w-3 h-3 bg-muted rounded-[1px]" />
                </div>
             </div>
          ))}
          
          {/* Skeleton items */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-transparent opacity-40">
             <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-muted" />
                <div className="h-3 w-12 bg-muted rounded" />
             </div>
          </div>
       </div>
    </div>
  )
}
