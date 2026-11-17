// The heavy part of motion (the animation engine). Loaded lazily by <LazyMotion> in App.tsx,
// so it is not part of the first download.
import { domAnimation } from 'motion/react';

export default domAnimation;
