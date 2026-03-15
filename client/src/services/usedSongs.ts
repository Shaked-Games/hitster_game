/**
 * usedSongs.ts
 * Tracks which songs have been played, stored in localStorage per playlist.
 * Key format: `hitster:used:{playlistName}`
 * Value: JSON array of "name|artist" strings.
 */

const PREFIX = 'hitster:used:';

function storageKey(playlist: string): string {
  return `${PREFIX}${playlist}`;
}

export function getUsedSongs(playlist: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(playlist));
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function markSongUsed(playlist: string, name: string, artist: string): void {
  try {
    const used = getUsedSongs(playlist);
    used.add(`${name}|${artist}`);
    localStorage.setItem(storageKey(playlist), JSON.stringify([...used]));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function isSongUsed(playlist: string, name: string, artist: string): boolean {
  return getUsedSongs(playlist).has(`${name}|${artist}`);
}