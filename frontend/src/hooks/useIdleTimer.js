import { useEffect, useState } from "react";

export default function useIdleTimer(timeoutMs = 180000) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timerId;
    let screensaverActive = false;

    function resetTimer(event) {
        // Wait for a completed click/tap or a key press while idle.
        if (
          screensaverActive &&
          event &&
          event.type !== "click" &&
          event.type !== "keydown"
        ) {
          return;
        }
      
        screensaverActive = false;
        setIsIdle(false);
        window.clearTimeout(timerId);
      
        timerId = window.setTimeout(() => {
          screensaverActive = true;
          setIsIdle(true);
        }, timeoutMs);
      }

      const events = [
        "pointerdown",
        "pointermove",
        "keydown",
        "wheel",
        "click",
      ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      window.clearTimeout(timerId);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMs]);

  return isIdle;
}