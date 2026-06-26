let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// ─── Volume settings (persisted to localStorage) ─────────────
const STORAGE_KEY = "0gbomber_audio_settings";

interface AudioSettings {
  master: number;
  music: number;
  sfx: number;
  ui: number;
  musicMuted: boolean;
  sfxMuted: boolean;
}

function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSettings };
}

function saveSettings(s: AudioSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

const defaultSettings: AudioSettings = {
  master: 0.35,
  music: 0.8,
  sfx: 1.0,
  ui: 1.0,
  musicMuted: false,
  sfxMuted: false,
};

let settings = loadSettings();

// ─── Master gain node ──────────────────────────────────────
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let uiGain: GainNode | null = null;

function ensureMaster() {
  const c = ctx();
  if (!masterGain) {
    masterGain = c.createGain();
    masterGain.gain.setValueAtTime(settings.master, c.currentTime);
    masterGain.connect(c.destination);

    musicGain = c.createGain();
    musicGain.gain.setValueAtTime(settings.music, c.currentTime);
    musicGain.connect(masterGain);

    sfxGain = c.createGain();
    sfxGain.gain.setValueAtTime(settings.sfx, c.currentTime);
    sfxGain.connect(masterGain);

    uiGain = c.createGain();
    uiGain.gain.setValueAtTime(settings.ui, c.currentTime);
    uiGain.connect(masterGain);
  }
  return c;
}

// ─── Audio pools (pre-generated noise buffers) ─────────────
let _noiseBuffer128: AudioBuffer | null = null;
let _noiseBuffer300: AudioBuffer | null = null;
let _noiseBuffer400: AudioBuffer | null = null;
let _clickBuffer: AudioBuffer | null = null;

function getNoiseBuffer(durMs: number): AudioBuffer {
  const c = ctx();
  const len = Math.floor(c.sampleRate * durMs / 1000);
  let buf: AudioBuffer | null = null;
  if (durMs === 128) { if (!_noiseBuffer128) { _noiseBuffer128 = c.createBuffer(1, len, c.sampleRate); const d = _noiseBuffer128.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; } buf = _noiseBuffer128; }
  else if (durMs === 300) { if (!_noiseBuffer300) { _noiseBuffer300 = c.createBuffer(1, len, c.sampleRate); const d = _noiseBuffer300.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; } buf = _noiseBuffer300; }
  else if (durMs === 400) { if (!_noiseBuffer400) { _noiseBuffer400 = c.createBuffer(1, len, c.sampleRate); const d = _noiseBuffer400.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; } buf = _noiseBuffer400; }
  if (!buf) { buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; }
  return buf;
}

function getClickBuffer(): AudioBuffer {
  if (!_clickBuffer) {
    const c = ctx();
    const len = Math.floor(c.sampleRate * 0.02);
    _clickBuffer = c.createBuffer(1, len, c.sampleRate);
    const d = _clickBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / c.sampleRate;
      d[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 80) * (Math.random() * 0.3 + 0.7);
    }
  }
  return _clickBuffer;
}

// ─── Volume API ─────────────────────────────────────────────
export function setMasterVolume(v: number) { settings.master = Math.max(0, Math.min(1, v)); if (masterGain) masterGain.gain.setValueAtTime(settings.master, ctx().currentTime); saveSettings(settings); }
export function setMusicVolume(v: number) { settings.music = Math.max(0, Math.min(1, v)); if (musicGain) musicGain.gain.setValueAtTime(settings.music, ctx().currentTime); saveSettings(settings); }
export function setSfxVolume(v: number) { settings.sfx = Math.max(0, Math.min(1, v)); if (sfxGain) sfxGain.gain.setValueAtTime(settings.sfx, ctx().currentTime); saveSettings(settings); }
export function setUiVolume(v: number) { settings.ui = Math.max(0, Math.min(1, v)); if (uiGain) uiGain.gain.setValueAtTime(settings.ui, ctx().currentTime); saveSettings(settings); }
export function setMusicEnabled(v: boolean) { settings.musicMuted = !v; if (!v) stopMusic(); else if (!seqRunning) startMusic(); saveSettings(settings); }
export function setSfxEnabled(v: boolean) { settings.sfxMuted = !v; saveSettings(settings); }
export function isMusicEnabled() { return !settings.musicMuted; }
export function isSfxEnabled() { return !settings.sfxMuted; }
export function getMasterVolume() { return settings.master; }
export function getMusicVolume() { return settings.music; }
export function getSfxVolume() { return settings.sfx; }
export function getUiVolume() { return settings.ui; }

// ─── SFX helpers ────────────────────────────────────────────
function sfxNoise(durMs: number, vol: number, lowpass: number) {
  if (settings.sfxMuted) return;
  const c = ensureMaster();
  if (!sfxGain) return;
  const buf = getNoiseBuffer(durMs);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(lowpass, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + durMs / 1000);
  src.connect(filter).connect(gain).connect(sfxGain);
  src.start(c.currentTime);
  src.stop(c.currentTime + durMs / 1000 + 0.05);
}

function sfxTone(freq: number, durMs: number, vol: number, type: OscillatorType = "square") {
  if (settings.sfxMuted) return;
  const c = ensureMaster();
  if (!sfxGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + durMs / 1000);
  osc.connect(gain).connect(sfxGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + durMs / 1000 + 0.05);
}

function sfxNoiseTone(noiseDur: number, noiseVol: number, lowpass: number, toneFreq: number, toneDur: number, toneVol: number, toneType: OscillatorType = "square") {
  sfxNoise(noiseDur, noiseVol, lowpass);
  sfxTone(toneFreq, toneDur, toneVol, toneType);
}

function uiTone(freq: number, durMs: number, vol: number, type: OscillatorType = "sine") {
  if (settings.sfxMuted) return;
  const c = ensureMaster();
  if (!uiGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + durMs / 1000);
  osc.connect(gain).connect(uiGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + durMs / 1000 + 0.05);
}

// ─── Public SFX API ────────────────────────────────────────
let _lastExplosion = 0;
export function playExplosion() {
  const now = Date.now();
  if (now - _lastExplosion < 80) return;
  _lastExplosion = now;
  sfxNoiseTone(300, 0.15, 800, 60, 300, 0.1, "sawtooth");
}

let _lastBombPlace = 0;
export function playBombPlace() {
  const now = Date.now();
  if (now - _lastBombPlace < 120) return;
  _lastBombPlace = now;
  sfxTone(520, 60, 0.05, "square");
  setTimeout(() => sfxTone(440, 40, 0.04, "square"), 40);
}

export function playKill() {
  sfxTone(880, 80, 0.07, "square");
  setTimeout(() => sfxTone(1100, 100, 0.05, "triangle"), 60);
}

export function playLootPickup() {
  sfxTone(1047, 50, 0.05, "triangle");
  setTimeout(() => sfxTone(1319, 60, 0.04, "triangle"), 50);
}

export function playRareLoot() {
  [1047, 1319, 1568, 2093].forEach((f, i) => setTimeout(() => sfxTone(f, 100, 0.06, "triangle"), i * 80));
}

export function playLegendaryLoot() {
  [784, 988, 1175, 1568, 1976, 2350].forEach((f, i) => setTimeout(() => sfxTone(f, 120, 0.07, "sine"), i * 70));
}

export function playVictory() {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => sfxTone(f, 180, 0.08, "triangle"), i * 120));
}

export function playDefeat() {
  [400, 350, 300, 200].forEach((f, i) => setTimeout(() => sfxTone(f, 200, 0.07, "sawtooth"), i * 180));
}

export function playHeroDeath() {
  sfxNoiseTone(400, 0.12, 400, 200, 250, 0.08, "sawtooth");
  setTimeout(() => sfxTone(120, 300, 0.05, "sawtooth"), 150);
}

export function playHeroLevelUp() {
  [600, 800, 1000, 1200].forEach((f, i) => setTimeout(() => sfxTone(f, 100, 0.06, "triangle"), i * 60));
}

export function playFootstep() {
  sfxNoise(30, 0.02, 400);
}

export function playPortal() {
  sfxTone(200, 200, 0.06, "sawtooth");
  setTimeout(() => sfxTone(300, 150, 0.05, "triangle"), 100);
  setTimeout(() => sfxTone(400, 100, 0.04, "sine"), 200);
}

export function playAlien() {
  sfxTone(200, 100, 0.05, "square");
  setTimeout(() => sfxTone(150, 150, 0.04, "square"), 80);
}

export function playEquipItem() {
  sfxTone(600, 50, 0.04, "sine");
  setTimeout(() => sfxTone(900, 60, 0.03, "triangle"), 40);
}

// ─── Public UI API ───────────────────────────────────────────
export function playUIClick() {
  uiTone(600, 30, 0.04, "sine");
}

export function playUIHover() {
  uiTone(400, 20, 0.02, "sine");
}

export function playUINotification() {
  [800, 1000].forEach((f, i) => setTimeout(() => uiTone(f, 60, 0.05, "triangle"), i * 80));
}

export function playUIWalletConnect() {
  [400, 500, 600, 800].forEach((f, i) => setTimeout(() => uiTone(f, 80, 0.05, "sine"), i * 60));
}

// ─── Music System ────────────────────────────────────────────
let seqInterval: ReturnType<typeof setInterval> | null = null;
let seqStep = 0;
let seqRunning = false;
let currentTrack: "landing" | "lobby" | "battle" | "boss" | "victory" | "defeat" = "lobby";

const BPM = 145;
const STEP_MS = 60000 / BPM / 4;
const STEPS = 128;

// Bass line
const BASS_NOTES = [
  65.41, 65.41, 98.00, 98.00, 103.83, 103.83, 98.00, 98.00,
  87.31, 87.31, 65.41, 65.41, 98.00, 98.00, 98.00, 98.00,
  65.41, 65.41, 98.00, 98.00, 116.54, 116.54, 103.83, 103.83,
  87.31, 87.31, 65.41, 65.41, 98.00, 98.00, 65.41, 65.41,
];

const BASS_ACCENTS = [
  false, true, false, true, false, true, false, true,
  false, true, false, true, false, true, false, true,
  false, true, false, true, false, true, false, true,
  false, true, false, true, false, true, false, true,
];

const PAD_CHORDS: [number, number, number][] = [
  [130.81, 155.56, 196.00], [207.65, 261.63, 311.13],
  [174.61, 207.65, 261.63], [196.00, 246.94, 293.66],
  [130.81, 155.56, 196.00], [233.08, 293.66, 349.23],
  [207.65, 261.63, 311.13], [196.00, 246.94, 293.66],
  [174.61, 207.65, 261.63], [130.81, 155.56, 196.00],
  [196.00, 246.94, 293.66], [207.65, 261.63, 311.13],
  [174.61, 207.65, 261.63], [233.08, 293.66, 349.23],
  [196.00, 246.94, 293.66], [130.81, 155.56, 196.00],
];

const ARP_NOTES = [
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 415.30,
  622.25, 783.99, 932.33, 1244.51, 932.33, 783.99, 622.25, 523.25,
  659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99, 659.25, 523.25,
  587.33, 739.99, 880.00, 1174.66, 880.00, 739.99, 587.33, 493.88,
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 415.30,
  622.25, 739.99, 880.00, 1174.66, 880.00, 739.99, 622.25, 523.25,
  698.46, 880.00, 1046.50, 1396.91, 1046.50, 880.00, 698.46, 622.25,
  659.25, 783.99, 932.33, 1244.51, 932.33, 783.99, 659.25, 523.25,
  698.46, 880.00, 1046.50, 1396.91, 1046.50, 880.00, 698.46, 622.25,
  783.99, 932.33, 1174.66, 1567.98, 1174.66, 932.33, 783.99, 659.25,
  659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99, 659.25, 523.25,
  698.46, 880.00, 1046.50, 1396.91, 1046.50, 880.00, 698.46, 622.25,
  587.33, 739.99, 880.00, 1174.66, 880.00, 739.99, 587.33, 493.88,
  659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99, 659.25, 523.25,
  783.99, 932.33, 1174.66, 1567.98, 1174.66, 932.33, 783.99, 659.25,
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 415.30,
];

const LEAD_NOTES = [
  -1, 783.99, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25,
  659.25, 523.25, 415.30, 523.25, 659.25, 783.99, 659.25, 523.25,
  -1, 932.33, 783.99, 659.25, 783.99, 1046.50, 932.33, 783.99,
  1046.50, 783.99, 659.25, 783.99, 1046.50, 1174.66, 1046.50, 783.99,
];

// Boss track — darker, heavier bass
const BOSS_BASS_NOTES = [
  55.00, 55.00, 73.42, 73.42, 65.41, 65.41, 55.00, 55.00,
  49.00, 49.00, 65.41, 65.41, 73.42, 73.42, 65.41, 65.41,
  55.00, 55.00, 73.42, 73.42, 65.41, 65.41, 55.00, 55.00,
  49.00, 49.00, 65.41, 65.41, 58.27, 58.27, 55.00, 55.00,
];

function kick(vol: number) {
  const c = ensureMaster();
  if (!musicGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.12);
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  osc.connect(gain).connect(musicGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.15);
}

function snare(vol: number) {
  const c = ensureMaster();
  if (!musicGain) return;
  const buf = getNoiseBuffer(120);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2000, c.currentTime);
  filter.Q.setValueAtTime(1, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
  src.connect(filter).connect(gain).connect(musicGain);
  src.start(c.currentTime);
}

function hihat(vol: number) {
  const c = ensureMaster();
  if (!musicGain) return;
  const buf = getNoiseBuffer(40);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(8000, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.03);
  src.connect(filter).connect(gain).connect(musicGain);
  src.start(c.currentTime);
}

function playBass(freq: number, accent: boolean) {
  const c = ensureMaster();
  if (!musicGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  const vol = accent ? 0.14 : 0.09;
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(600, c.currentTime);
  filter.frequency.setValueAtTime(300, c.currentTime + 0.15);
  osc.connect(filter).connect(gain).connect(musicGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.25);
  const sub = c.createOscillator();
  const subG = c.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(freq / 2, c.currentTime);
  subG.gain.setValueAtTime(vol * 0.5, c.currentTime);
  subG.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  sub.connect(subG).connect(musicGain);
  sub.start(c.currentTime);
  sub.stop(c.currentTime + 0.22);
}

function playPad(notes: [number, number, number]) {
  const c = ensureMaster();
  if (!musicGain) return;
  for (let i = 0; i < 2; i++) {
    const detune = i === 0 ? -5 : 5;
    for (const freq of notes) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, c.currentTime);
      osc.detune.setValueAtTime(detune, c.currentTime);
      gain.gain.setValueAtTime(0, c.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, c.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0.02, c.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0.001, c.currentTime + 1.8);
      osc.connect(gain).connect(musicGain);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 1.9);
    }
  }
}

function playArp(freq: number) {
  const c = ensureMaster();
  if (!musicGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(0.03, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3000, c.currentTime);
  osc.connect(filter).connect(gain).connect(musicGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.08);
}

function playLead(freq: number) {
  if (freq < 0) return;
  const c = ensureMaster();
  if (!musicGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  osc.frequency.setValueAtTime(freq * 1.02, c.currentTime + 0.02);
  osc.frequency.setValueAtTime(freq, c.currentTime + 0.05);
  gain.gain.setValueAtTime(0.07, c.currentTime);
  gain.gain.setValueAtTime(0.04, c.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.45);
  osc.connect(gain).connect(musicGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.5);
}

function crash(vol: number) {
  const c = ensureMaster();
  if (!musicGain) return;
  const buf = getNoiseBuffer(400);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4000, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.3);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
  src.connect(filter).connect(gain).connect(musicGain);
  src.start(c.currentTime);
}

function openhh(vol: number) {
  const c = ensureMaster();
  if (!musicGain) return;
  const buf = getNoiseBuffer(150);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(6000, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  src.connect(filter).connect(gain).connect(musicGain);
  src.start(c.currentTime);
}

function playBossBass(freq: number) {
  const c = ensureMaster();
  if (!musicGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(0.18, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(400, c.currentTime);
  osc.connect(filter).connect(gain).connect(musicGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.4);
  const sub = c.createOscillator();
  const subG = c.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(freq / 2, c.currentTime);
  subG.gain.setValueAtTime(0.12, c.currentTime);
  subG.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  sub.connect(subG).connect(musicGain);
  sub.start(c.currentTime);
  sub.stop(c.currentTime + 0.35);
}

function musicTick() {
  if (settings.musicMuted) return;
  const c = ensureMaster();
  if (!musicGain) return;

  const s = seqStep % STEPS;
  const beatIdx = Math.floor(s / 4);
  const beatPhase = s % 4;

  const isBoss = currentTrack === "boss";

  // Drums
  if (beatPhase === 0) {
    if (beatIdx % 4 === 0) kick(0.18);
    else if (beatIdx % 4 === 2) kick(0.15);
    if (beatIdx % 4 === 3 && (Math.floor(beatIdx / 4) % 2 === 0)) kick(0.12);
  }
  if (beatPhase === 2 && beatIdx >= 28) kick(0.08);
  if (beatPhase === 0 && (beatIdx % 4 === 1 || beatIdx % 4 === 3)) snare(0.1);
  if (s % 2 === 0) hihat(beatPhase === 0 ? 0.035 : 0.025);
  if (s % 4 === 2 && beatIdx >= 24) openhh(0.03);
  if (s === 0) crash(0.08);
  if (s === 64) crash(0.06);

  // Bass
  if (s % 4 === 0) {
    if (isBoss) {
      const bi = beatIdx % BOSS_BASS_NOTES.length;
      playBossBass(BOSS_BASS_NOTES[bi]);
    } else {
      const bi = beatIdx % BASS_NOTES.length;
      playBass(BASS_NOTES[bi], BASS_ACCENTS[beatIdx] || false);
    }
  }

  // Pad - every 8 steps
  if (s % 8 === 0) {
    const ci = Math.floor(s / 8) % PAD_CHORDS.length;
    playPad(PAD_CHORDS[ci]);
  }
  if (s % 8 === 4) {
    const ci = (Math.floor(s / 8) + 2) % PAD_CHORDS.length;
    playPad(PAD_CHORDS[ci]);
  }

  // Arp
  const arp = Math.floor(s / 64) % 2 === 0 ? ARP_NOTES : ARP_NOTES;
  if (s < arp.length) playArp(arp[s]);

  // Lead
  if (!isBoss) {
    const leadIdx = Math.floor(s / 8);
    if (s % 8 === 0 && leadIdx < LEAD_NOTES.length) playLead(LEAD_NOTES[leadIdx]);
  }

  seqStep++;
}

function getTrackBPM(): number {
  if (currentTrack === "boss") return 120;
  if (currentTrack === "victory") return 160;
  if (currentTrack === "defeat") return 80;
  return BPM;
}

export function startMusic(track?: "landing" | "lobby" | "battle" | "boss" | "victory" | "defeat") {
  if (settings.musicMuted) return;
  stopMusic();
  if (track) currentTrack = track;
  seqStep = 0;
  seqRunning = true;
  ensureMaster();
  musicTick();
  const bpms = getTrackBPM();
  const stepMs = 60000 / bpms / 4;
  seqInterval = setInterval(musicTick, stepMs);
}

export function stopMusic() {
  if (seqInterval) { clearInterval(seqInterval); seqInterval = null; }
  seqRunning = false;
  seqStep = 0;
}

export function isPlaying() { return seqRunning; }
export function getCurrentTrack() { return currentTrack; }
