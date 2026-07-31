import { useEffect } from "react";

function useTouchScroll(scrollContainerRef) {
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return undefined;
    }

    let activePointerId = null;

    let startX = 0;
    let startY = 0;

    let startScrollTop = 0;
    let startScrollLeft = 0;

    let horizontalContainer = null;
    let scrollDirection = null;

    let hasMoved = false;
    let suppressClick = false;
    let suppressClickTimer = null;

    function handlePointerDown(event) {
      if (!event.isPrimary) {
        return;
      }

      activePointerId = event.pointerId;

      startX = event.clientX;
      startY = event.clientY;

      startScrollTop = scrollContainer.scrollTop;

      horizontalContainer =
        event.target instanceof Element
          ? event.target.closest(
              ".weather-forecast__grid",
            )
          : null;

      startScrollLeft =
        horizontalContainer?.scrollLeft ?? 0;

      scrollDirection = null;
      hasMoved = false;
    }

    function handlePointerMove(event) {
      if (event.pointerId !== activePointerId) {
        return;
      }

      const movedX = startX - event.clientX;
      const movedY = startY - event.clientY;

      /*
       * Wait until the finger has moved enough before
       * deciding whether this is horizontal or vertical.
       */
      if (
        scrollDirection === null &&
        Math.max(
          Math.abs(movedX),
          Math.abs(movedY),
        ) > 5
      ) {
        hasMoved = true;

        if (
          horizontalContainer &&
          Math.abs(movedX) > Math.abs(movedY)
        ) {
          scrollDirection = "horizontal";
        } else {
          scrollDirection = "vertical";
        }
      }

      if (scrollDirection === "horizontal") {
        horizontalContainer.scrollLeft =
          startScrollLeft + movedX;
      }

      if (scrollDirection === "vertical") {
        scrollContainer.scrollTop =
          startScrollTop + movedY;
      }

      if (
        scrollDirection !== null &&
        event.cancelable
      ) {
        event.preventDefault();
      }
    }

    function handlePointerEnd(event) {
      if (event.pointerId !== activePointerId) {
        return;
      }

      activePointerId = null;
      horizontalContainer = null;
      scrollDirection = null;

      if (hasMoved) {
        suppressClick = true;

        window.clearTimeout(
          suppressClickTimer,
        );

        suppressClickTimer = window.setTimeout(
          () => {
            suppressClick = false;
          },
          300,
        );
      }
    }

    function handleClick(event) {
      if (!suppressClick) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      suppressClick = false;
    }

    scrollContainer.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: false,
      },
    );

    window.addEventListener(
      "pointerup",
      handlePointerEnd,
    );

    window.addEventListener(
      "pointercancel",
      handlePointerEnd,
    );

    scrollContainer.addEventListener(
      "click",
      handleClick,
      true,
    );

    return () => {
      scrollContainer.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      window.removeEventListener(
        "pointerup",
        handlePointerEnd,
      );

      window.removeEventListener(
        "pointercancel",
        handlePointerEnd,
      );

      scrollContainer.removeEventListener(
        "click",
        handleClick,
        true,
      );

      window.clearTimeout(
        suppressClickTimer,
      );
    };
  }, [scrollContainerRef]);
}

export default useTouchScroll;