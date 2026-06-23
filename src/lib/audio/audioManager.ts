let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let reverbNode: ConvolverNode | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

let musicEnabled = true;
let sfxEnabled = true;
let seqInterval: ReturnType<typeof setInterval> | null = null;
let stepIndex = 0;

export function setMusicEnabled(v: boolean) {
  musicEnabled = v;
  if (!v) stopMusic();
  else if (musicEnabled) startMusic();
}
export function setSfxEnabled(v: boolean) { sfxEnabled = v; }
export function isMusicEnabled() { return musicEnabled; }
export function isSfxEnabled() { return sfxEnabled; }

// === Music sequencer — extended space theme ===
const BPM = 145;
const STEP = 60000 / BPM / 4; // 16th note ~103ms
const STEPS = 128; // ~13s loop

// Bass line — 32 quarter notes (8 measures)
const BASS_NOTES = [
  // m1: Cm
  65.41, 65.41, 98.00, 98.00,
  // m2: Ab - G
  103.83, 103.83, 98.00, 98.00,
  // m3: Fm - C
  87.31, 87.31, 65.41, 65.41,
  // m4: G - G (build)
  98.00, 98.00, 98.00, 98.00,
  // m5: Cm
  65.41, 65.41, 98.00, 98.00,
  // m6: Bb - Ab (sequence)
  116.54, 116.54, 103.83, 103.83,
  // m7: Fm - C
  87.31, 87.31, 65.41, 65.41,
  // m8: G - C (resolve)
  98.00, 98.00, 65.41, 65.41,
];

const BASS_ACCENTS = [
  false, true, false, true, false, true, false, true,
  false, true, false, true, false, true, false, true,
  false, true, false, true, false, true, false, true,
  false, true, false, true, false, true, false, true,
];

// Pad chords — 16 half-note changes
const PAD_CHORDS: [number, number, number][] = [
  [130.81, 155.56, 196.00], // Cm
  [207.65, 261.63, 311.13], // Ab
  [174.61, 207.65, 261.63], // Fm
  [196.00, 246.94, 293.66], // G
  [130.81, 155.56, 196.00], // Cm
  [233.08, 293.66, 349.23], // Bb
  [207.65, 261.63, 311.13], // Ab
  [196.00, 246.94, 293.66], // G
  [174.61, 207.65, 261.63], // Fm
  [130.81, 155.56, 196.00], // Cm
  [196.00, 246.94, 293.66], // G
  [207.65, 261.63, 311.13], // Ab
  [174.61, 207.65, 261.63], // Fm
  [233.08, 293.66, 349.23], // Bb
  [196.00, 246.94, 293.66], // G
  [130.81, 155.56, 196.00], // Cm
];

// Arpeggio — 128 notes per pattern
const ARP_NOTES = [
  // Phrase 1 (Cm-Ab-Fm-G)
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 415.30,
  622.25, 783.99, 932.33, 1244.51, 932.33, 783.99, 622.25, 523.25,
  659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99, 659.25, 523.25,
  587.33, 739.99, 880.00, 1174.66, 880.00, 739.99, 587.33, 493.88,
  // Phrase 2 (Cm-Bb-Ab-G)
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 415.30,
  622.25, 739.99, 880.00, 1174.66, 880.00, 739.99, 622.25, 523.25,
  698.46, 880.00, 1046.50, 1396.91, 1046.50, 880.00, 698.46, 622.25,
  659.25, 783.99, 932.33, 1244.51, 932.33, 783.99, 659.25, 523.25,
  // Phrase 3 (Fm-Cm-G-Ab) — higher register
  698.46, 880.00, 1046.50, 1396.91, 1046.50, 880.00, 698.46, 622.25,
  783.99, 932.33, 1174.66, 1567.98, 1174.66, 932.33, 783.99, 659.25,
  659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99, 659.25, 523.25,
  698.46, 880.00, 1046.50, 1396.91, 1046.50, 880.00, 698.46, 622.25,
  // Phrase 4 (Fm-Bb-G-Cm) — climax
  587.33, 739.99, 880.00, 1174.66, 880.00, 739.99, 587.33, 493.88,
  659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99, 659.25, 523.25,
  783.99, 932.33, 1174.66, 1567.98, 1174.66, 932.33, 783.99, 659.25,
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 415.30,
];

// Alternate arpeggio — more syncopated
const ARP_NOTES2 = [
  // Phrase 1
  523.25, 415.30, 523.25, 659.25, 783.99, 659.25, 523.25, 415.30,
  622.25, 523.25, 622.25, 783.99, 932.33, 783.99, 622.25, 523.25,
  659.25, 523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25,
  587.33, 493.88, 587.33, 739.99, 880.00, 739.99, 587.33, 493.88,
  // Phrase 2
  523.25, 415.30, 523.25, 659.25, 783.99, 659.25, 523.25, 415.30,
  622.25, 523.25, 622.25, 783.99, 932.33, 783.99, 622.25, 523.25,
  698.46, 622.25, 698.46, 880.00, 1046.50, 880.00, 698.46, 622.25,
  659.25, 523.25, 659.25, 783.99, 932.33, 783.99, 659.25, 523.25,
  // Phrase 3
  698.46, 622.25, 698.46, 880.00, 1046.50, 880.00, 698.46, 622.25,
  783.99, 659.25, 783.99, 932.33, 1174.66, 932.33, 783.99, 659.25,
  659.25, 523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25,
  698.46, 622.25, 698.46, 880.00, 1046.50, 880.00, 698.46, 622.25,
  // Phrase 4
  587.33, 493.88, 587.33, 739.99, 880.00, 739.99, 587.33, 493.88,
  659.25, 523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25,
  783.99, 659.25, 783.99, 932.33, 1174.66, 932.33, 783.99, 659.25,
  523.25, 415.30, 523.25, 659.25, 783.99, 659.25, 523.25, 415.30,
];

// Lead melody — 16 notes (one per half note)
const LEAD_NOTES = [
  -1, 783.99, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25,
  659.25, 523.25, 415.30, 523.25, 659.25, 783.99, 659.25, 523.25,
  -1, 932.33, 783.99, 659.25, 783.99, 1046.50, 932.33, 783.99,
  1046.50, 783.99, 659.25, 783.99, 1046.50, 1174.66, 1046.50, 783.99,
];

// --- Voice helpers ---

function kick(vol: number) {
  const c = ctx();
  if (!masterGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.12);
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  const dist = c.createWaveShaper();
  const k = 3;
  dist.curve = new Float32Array([-1, -1 + 2 / (k + 1), 1]);
  osc.connect(gain).connect(masterGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.15);
}

function snare(vol: number) {
  const c = ctx();
  if (!masterGain) return;
  const buf = c.createBuffer(1, c.sampleRate * 0.12, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2000, c.currentTime);
  filter.Q.setValueAtTime(1, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
  src.connect(filter).connect(gain).connect(masterGain);
  src.start(c.currentTime);
}

function hihat(vol: number) {
  const c = ctx();
  if (!masterGain) return;
  const buf = c.createBuffer(1, c.sampleRate * 0.04, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(8000, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.03);
  src.connect(filter).connect(gain).connect(masterGain);
  src.start(c.currentTime);
}

function playBass(freq: number, accent: boolean) {
  const c = ctx();
  if (!masterGain) return;
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
  osc.connect(filter).connect(gain).connect(masterGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.25);
  // Sub oscillator
  const sub = c.createOscillator();
  const subG = c.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(freq / 2, c.currentTime);
  subG.gain.setValueAtTime(vol * 0.5, c.currentTime);
  subG.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  sub.connect(subG).connect(masterGain);
  sub.start(c.currentTime);
  sub.stop(c.currentTime + 0.22);
}

function playPad(notes: [number, number, number]) {
  const c = ctx();
  if (!masterGain) return;
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
      osc.connect(gain).connect(masterGain);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 1.9);
    }
  }
}

function playArp(freq: number) {
  const c = ctx();
  if (!masterGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(0.03, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3000, c.currentTime);
  osc.connect(filter).connect(gain).connect(masterGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.08);
}

function playLead(freq: number) {
  if (freq < 0) return;
  const c = ctx();
  if (!masterGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  // Quick pitch bend for character
  osc.frequency.setValueAtTime(freq * 1.02, c.currentTime + 0.02);
  osc.frequency.setValueAtTime(freq, c.currentTime + 0.05);
  gain.gain.setValueAtTime(0.07, c.currentTime);
  gain.gain.setValueAtTime(0.04, c.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.45);
  osc.connect(gain).connect(masterGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.5);
}

function crash(vol: number) {
  const c = ctx();
  if (!masterGain) return;
  const buf = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4000, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.3);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
  src.connect(filter).connect(gain).connect(masterGain);
  src.start(c.currentTime);
}

function openhh(vol: number) {
  const c = ctx();
  if (!masterGain) return;
  const buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(6000, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  src.connect(filter).connect(gain).connect(masterGain);
  src.start(c.currentTime);
}

// --- Sequencer ---

function tick() {
  if (!musicEnabled) return;
  const c = ctx();
  if (!masterGain) {
    masterGain = c.createGain();
    masterGain.gain.setValueAtTime(0.35, c.currentTime);
    masterGain.connect(c.destination);
  }

  const s = stepIndex % STEPS;
  const beatIdx = Math.floor(s / 4); // 0-31 (quarters)
  const beatPhase = s % 4;

  // Kick
  if (beatPhase === 0) {
    if (beatIdx % 4 === 0) {
      kick(0.18); // Downbeats: 0, 4, 8, 12, 16, 20, 24, 28
    } else if (beatIdx % 4 === 2) {
      kick(0.15); // 3rd beat: 2, 6, 10, 14, 18, 22, 26, 30
    }
    // Fills on 4th beat of even measures
    if (beatIdx % 4 === 3 && (Math.floor(beatIdx / 4) % 2 === 0)) {
      kick(0.12);
    }
  }
  // Extra kick on 16th offbeats in last measure
  if (beatPhase === 2 && beatIdx >= 28) kick(0.08);

  // Snare: beats 2 and 4 (quarter positions 1, 3, 5, 7, ...)
  if (beatPhase === 0) {
    if (beatIdx % 4 === 1 || beatIdx % 4 === 3) snare(0.1);
  }

  // Hi-hat: every 8th note
  if (s % 2 === 0) {
    hl(beatPhase === 0 ? 0.035 : 0.025);
  }

  // Open hi-hat on offbeats of last 2 measures
  if (s % 4 === 2 && beatIdx >= 24) openhh(0.03);

  // Crash: section boundaries
  if (s === 0) crash(0.08);
  if (s === 64) crash(0.06);

  // Bass: every quarter note
  if (s % 4 === 0) {
    const idx = beatIdx % BASS_NOTES.length;
    playBass(BASS_NOTES[idx], BASS_ACCENTS[beatIdx] || false);
  }

  // Pad: every 8 steps
  if (s % 8 === 0) {
    const chordIdx = Math.floor(s / 8) % PAD_CHORDS.length;
    playPad(PAD_CHORDS[chordIdx]);
  }
  if (s % 8 === 4) {
    const chordIdx = (Math.floor(s / 8) + 2) % PAD_CHORDS.length;
    playPad(PAD_CHORDS[chordIdx]);
  }

  // Arp: every step (alternate patterns every 64 steps)
  const arpList = Math.floor(s / 64) % 2 === 0 ? ARP_NOTES : ARP_NOTES2;
  if (s < arpList.length) playArp(arpList[s]);

  // Lead: every 8th step
  const leadIdx = Math.floor(s / 8);
  if (s % 8 === 0 && leadIdx < LEAD_NOTES.length) {
    playLead(LEAD_NOTES[leadIdx]);
  }

  stepIndex++;
}

function hl(vol: number) {
  hihat(vol);
}

export function startMusic() {
  if (!musicEnabled) return;
  stopMusic();
  stepIndex = 0;
  const c = ctx();
  masterGain = c.createGain();
  masterGain.gain.setValueAtTime(0.35, c.currentTime);
  masterGain.connect(c.destination);
  tick();
  seqInterval = setInterval(tick, STEP);
}

export function stopMusic() {
  if (seqInterval) { clearInterval(seqInterval); seqInterval = null; }
  masterGain = null;
  stepIndex = 0;
}

function sfxNoise(dur: number, vol: number, lowpass: number) {
  if (!sfxEnabled) return;
  const c = ctx();
  const bufferSize = c.sampleRate * dur;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(lowpass, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(c.currentTime);
}

function sfxTone(freq: number, dur: number, vol: number, type: OscillatorType = "square") {
  if (!sfxEnabled) return;
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + dur);
}

export function playExplosion() {
  sfxNoise(0.3, 0.15, 800);
  sfxTone(80, 0.3, 0.12, "sawtooth");
}

export function playBombPlace() {
  sfxTone(440, 0.08, 0.06, "square");
}

export function playKill() {
  sfxTone(660, 0.1, 0.08);
  setTimeout(() => sfxTone(880, 0.15, 0.06), 80);
}

export function playLootPickup() {
  sfxTone(880, 0.06, 0.06);
  setTimeout(() => sfxTone(1100, 0.08, 0.05), 60);
}

export function playVictory() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => sfxTone(f, 0.2, 0.1, "triangle"), i * 150));
}

export function playDefeat() {
  [400, 350, 300, 200].forEach((f, i) => setTimeout(() => sfxTone(f, 0.25, 0.08, "sawtooth"), i * 200));
}
