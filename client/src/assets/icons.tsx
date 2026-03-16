/**
 * icons.tsx
 * Shared inline SVG icon components.
 * CardIcon path from Material Icons (Apache 2.0).
 * ChipIcon hand-crafted to match a poker chip.
 */

import React from "react";

/** Layers icon — MUI LayersIcon path */
export function CardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27z"/>
    </svg>
  );
}

/**
 * Poker chip icon.
 * Structure: thick outer ring with 8 rectangular notches + thin inner ring + white center.
 * Drawn using fill-rule="evenodd" so currentColor works on any background.
 */
export function ChipIcon({ size = 16 }: { size?: number }) {
  // Outer ring: circle r=11, inner boundary r=8
  const outerCircle = 'M12,1 A11,11 0 1,0 12,23 A11,11 0 1,0 12,1 Z';
  const outerRingInner = 'M12,4 A8,8 0 1,0 12,20 A8,8 0 1,0 12,4 Z';

  // 8 notch rectangles cut into the outer ring, evenly spaced
  // Each notch: corners (-1.15, -10.8), (1.15, -10.8), (1.15, -8.2), (-1.15, -8.2)
  // Rotated around center (12,12)
  const notchCorners: [number, number][] = [
    [-1.15, -10.8],
    [ 1.15, -10.8],
    [ 1.15,  -8.2],
    [-1.15,  -8.2],
  ];
  const notches = [0, 45, 90, 135, 180, 225, 270, 315]
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const pts = notchCorners.map(([x, y]) => [
        +(x * cos - y * sin + 12).toFixed(2),
        +(x * sin + y * cos + 12).toFixed(2),
      ]);
      return `M${pts[0].join(',')} L${pts[1].join(',')} L${pts[2].join(',')} L${pts[3].join(',')} Z`;
    })
    .join(' ');

  // Thin inner ring: between r=6.2 and r=7.4
  const innerRingOuter = 'M12,4.6 A7.4,7.4 0 1,0 12,19.4 A7.4,7.4 0 1,0 12,4.6 Z';
  const innerRingInner = 'M12,5.8 A6.2,6.2 0 1,0 12,18.2 A6.2,6.2 0 1,0 12,5.8 Z';

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      {/* Outer ring with notches */}
      <path fillRule="evenodd" d={[outerCircle, outerRingInner, notches].join(' ')} />
      {/* Thin inner ring */}
      <path fillRule="evenodd" d={[innerRingOuter, innerRingInner].join(' ')} />
    </svg>
  );
}