/**
 * fanfare.ts
 * Plays a short trumpet-like victory fanfare using the Web Audio API.
 */

export function playFanfare() {
  try {
    const ctx = new AudioContext();

    // Notes: C5, E5, G5, C6
    const notes = [
      { freq: 523.25, start: 0,    dur: 0.18 },
      { freq: 659.25, start: 0.18, dur: 0.18 },
      { freq: 783.99, start: 0.36, dur: 0.18 },
      { freq: 1046.5, start: 0.54, dur: 0.55 },
    ];

    for (const note of notes) {
      const osc      = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start);

      const t = ctx.currentTime + note.start;
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.22, t + 0.08);
      gainNode.gain.linearRampToValueAtTime(0, t + note.dur);

      osc.start(t);
      osc.stop(t + note.dur);
    }

    setTimeout(() => ctx.close(), 1500);
  } catch {
    // AudioContext not available — silently skip
  }
}