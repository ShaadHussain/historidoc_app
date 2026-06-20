import { useEffect, RefObject } from 'react';

export const useScrollBounce = (ref: RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let accumulated = 0;
    let bounceTimer: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop <= 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

      if (atTop || atBottom) {
        e.preventDefault();
        accumulated += e.deltaY;
        accumulated = Math.max(-100, Math.min(100, accumulated));

        el.style.transition = 'none';
        el.style.transform = `translateY(${-accumulated * 0.2}px)`;

        clearTimeout(bounceTimer);
        bounceTimer = setTimeout(() => {
          el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          el.style.transform = '';
          accumulated = 0;
        }, 80);
      } else if (accumulated !== 0) {
        el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        el.style.transform = '';
        accumulated = 0;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(bounceTimer);
    };
  }, []);
};
