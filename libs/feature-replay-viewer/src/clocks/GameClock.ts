export interface GameClock {
  // Should return the time of the game in milliseconds.
  getCurrentTime: () => number;
  start: () => void;
  pause: () => void;
  togglePlaying: () => void;
  seekTo: (time: number) => void;

  currentSpeed: number;
  setSpeed(speed: number): void;
}