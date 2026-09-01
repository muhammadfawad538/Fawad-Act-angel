"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RevealText } from "./reveal-text";
import { MeetYourAngelForm } from "./meet-your-angel-form";

interface MeetYourAngelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Kept fully intact and working, even though nothing currently triggers it (the site's CTAs
// now link to /get-started instead) — the client may want it reactivated later. Its actual
// form content lives in MeetYourAngelForm (components/meet-your-angel-form.tsx), shared with
// that page so the OTP/API logic can't drift into two copies.
export function MeetYourAngelModal({
  open,
  onOpenChange,
}: MeetYourAngelModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[26rem] bg-[#F5F4F0] border-black/[0.08] p-0 overflow-hidden max-h-[92vh] max-h-[92dvh] flex flex-col gap-0">
        <DialogHeader className="px-4 pt-4 shrink-0">
          <DialogTitle className="sr-only">Meet Your Angel</DialogTitle>
          <RevealText
            as="span"
            className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]"
          >
            Meet Your Angel
          </RevealText>
          <DialogDescription className="sr-only">
            Start a demo trial and get contacted by Act Angel AI.
          </DialogDescription>
        </DialogHeader>

        {/* Scrolls internally (themed scrollbar, not the native one) only as a fallback on
            unusually short/narrow viewports — spacing below is tuned so every step fits within
            max-h without that scrollbar engaging on mainstream phone sizes. */}
        <div className="flex-1 min-h-0 overflow-y-auto themed-scrollbar">
          <div className="px-4 pb-4 pt-2">
            {/* resetOn={open}: Radix keeps DialogContent mounted between opens, so without
                this, reopening the modal would show whatever step/values were left over from
                the previous visit instead of starting fresh. */}
            <MeetYourAngelForm resetOn={open} onDone={() => onOpenChange(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
