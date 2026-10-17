// Audio System using Web Audio API for Parking BMM_UZ
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
    this.lastBeepTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startEngine() {
    this.init();
    if (this.isEngineRunning || this.isMuted) return;

    try {
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';

      this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);
      this.engineOsc2.frequency.setValueAtTime(22.5, this.ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(400, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn("Audio start error:", e);
    }
  }

  updateEngine(speedKmh, throttle) {
    if (!this.isEngineRunning || !this.ctx || this.isMuted) return;

    const baseFreq = 45;
    const speedFactor = Math.min(Math.abs(speedKmh) / 120, 1.0);
    const throttleBoost = throttle ? 1.4 : 1.0;
    const targetFreq = (baseFreq + speedFactor * 140) * throttleBoost;

    const now = this.ctx.currentTime;
    this.engineOsc1.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.08);

    const filterCutoff = 350 + speedFactor * 900 + (throttle ? 300 : 0);
    this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.08);

    const volume = 0.06 + (throttle ? 0.05 : 0.01) + speedFactor * 0.04;
    this.engineGain.gain.setTargetAtTime(volume, now, 0.08);
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc1) this.engineOsc1.stop();
      if (this.engineOsc2) this.engineOsc2.stop();
    } catch (e) {}
    this.isEngineRunning = false;
  }

  playHorn() {
    this.init();
    if (this.isMuted) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
    osc2.frequency.setValueAtTime(554.37, this.ctx.currentTime); // C#5

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.4);
    osc2.stop(this.ctx.currentTime + 0.4);
  }

  playParkBeep(distance) {
    if (this.isMuted) return;
    this.init();

    const now = Date.now();
    // distance between 0 and 15m
    const interval = Math.max(120, Math.min(800, distance * 60));
    if (now - this.lastBeepTime < interval) return;
    this.lastBeepTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playSuccess() {
    this.init();
    if (this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playClick() {
    this.init();
    if (this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopEngine();
    } else {
      this.startEngine();
    }
    return this.isMuted;
  }
}

window.soundEngine = new SoundEngine();
window.addEventListener('pointerdown', () => window.soundEngine.init(), { passive: true });
window.addEventListener('keydown', () => window.soundEngine.init(), { passive: true });
