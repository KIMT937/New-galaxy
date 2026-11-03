/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  public sfxVolume: number = 0.7;
  public bgmVolume: number = 0.4;
  public isMuted: boolean = false;
  public isBgmEnabled: boolean = true;

  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private currentStep: number = 0;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmVolume;
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureAudio() {
    this.initContext();
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public toggleBgm(): boolean {
    this.isBgmEnabled = !this.isBgmEnabled;
    if (this.isBgmEnabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.isBgmEnabled;
  }

  // --- Sound Effects ---

  public playLaser(isDual = false, isPlasma = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    if (isPlasma) {
      // Piercing futuristic beam sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.18);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.18);
      return;
    }

    // Classic arcade chirp
    const count = isDual ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      const startFreq = 960 + i * 80;
      osc.frequency.setValueAtTime(startFreq, t + i * 0.02);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.12 + i * 0.02);

      gain.gain.setValueAtTime(0.2, t + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12 + i * 0.02);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.02);
      osc.stop(t + 0.13 + i * 0.02);
    }
  }

  public playEnemyLaser() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.1);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playExplosion(isLarge = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const duration = isLarge ? 0.6 : 0.28;

    // White noise generator
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isLarge ? 450 : 800, t);
    filter.frequency.exponentialRampToValueAtTime(30, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isLarge ? 0.45 : 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);

    if (isLarge) {
      // Sub-bass thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(120, t);
      subOsc.frequency.exponentialRampToValueAtTime(25, t + duration * 0.8);

      subGain.gain.setValueAtTime(0.5, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8);

      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(t);
      subOsc.stop(t + duration * 0.8);
    }
  }

  public playEnemyDive() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(300, t + 0.15);
    osc.frequency.linearRampToValueAtTime(550, t + 0.3);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playPowerUp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.18, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.13);
    });
  }

  public playSmartBomb() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Massive electrical EMP blast
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.8);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.8);

    this.playExplosion(true);
  }

  public play1UP() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const melody = [330, 392, 659, 523, 587, 784];
    melody.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.18, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.12);
    });
  }

  public playStageStart() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 440, d: 0.1 },
      { f: 554, d: 0.1 },
      { f: 659, d: 0.15 },
      { f: 880, d: 0.3 }
    ];
    let offset = 0;
    melody.forEach((m) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(m.f, t + offset);

      gain.gain.setValueAtTime(0.2, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + m.d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + offset);
      osc.stop(t + offset + m.d);
      offset += m.d;
    });
  }

  public playBossAlert() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 550 : 440, t + i * 0.25);

      gain.gain.setValueAtTime(0.22, t + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.25 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.25);
      osc.stop(t + i * 0.25 + 0.22);
    }
  }

  // --- Background 8-Bit Chiptune Arcade Music ---

  public startBgm() {
    if (this.isBgmPlaying || !this.isBgmEnabled) return;
    this.initContext();
    this.isBgmPlaying = true;
    this.currentStep = 0;

    const bassScale = [110, 110, 130.8, 146.8, 110, 110, 164.8, 146.8]; // A2, C3, D3, E3
    const leadScale = [440, 0, 523, 659, 587, 0, 659, 880, 783, 659, 587, 523, 659, 0, 440, 0];
    const tempoMs = 140;

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain || this.isMuted || !this.isBgmEnabled) {
        if (this.isBgmPlaying) {
          this.bgmTimer = window.setTimeout(playStep, tempoMs);
        }
        return;
      }

      const t = this.ctx.currentTime;

      // Bass pulse
      const bassFreq = bassScale[this.currentStep % bassScale.length];
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassNode = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        bassNode.gain.setValueAtTime(0.25, t);
        bassNode.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        bassOsc.connect(bassNode);
        bassNode.connect(this.bgmGain);

        bassOsc.start(t);
        bassOsc.stop(t + 0.13);
      }

      // Arpeggio / Lead
      const leadFreq = leadScale[this.currentStep % leadScale.length];
      if (leadFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadNode = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, t);

        leadNode.gain.setValueAtTime(0.12, t);
        leadNode.gain.exponentialRampToValueAtTime(0.005, t + 0.11);

        leadOsc.connect(leadNode);
        leadNode.connect(this.bgmGain);

        leadOsc.start(t);
        leadOsc.stop(t + 0.12);
      }

      this.currentStep++;
      this.bgmTimer = window.setTimeout(playStep, tempoMs);
    };

    playStep();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const audio = new RetroAudioEngine();
