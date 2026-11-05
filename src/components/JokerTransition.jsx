import { forwardRef, memo, useLayoutEffect } from 'react';
import { MenuMotion } from '../lib/motion.js';

// The player owns drawing, image placement, and animation status. React mounts
// these nodes once and never writes frame-by-frame state into the component tree.
export const JokerTransition = memo(forwardRef(function JokerTransition({ initialReduced }, ref) {
  useLayoutEffect(() => {
    const motion = new MenuMotion({ reduced: initialReduced });
    ref.current = motion;
    return () => {
      motion.clear();
      ref.current = null;
      document.body.classList.remove('section-open', 'native-transition', 'motion-paused');
      delete document.body.dataset.section;
    };
  }, [ref, initialReduced]);

  return <>
    <canvas id="flight-canvas" width="1280" height="720" aria-hidden="true" />
    <img id="camp-art" src="assets/native/camp-top.png" alt="" aria-hidden="true" />
    <div id="scene-wipe" aria-hidden="true" />
    <div id="load-status" role="status" />
  </>;
}));
