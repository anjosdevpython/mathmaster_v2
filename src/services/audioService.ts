
class AudioService {
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  toggle(state?: boolean) {
    this.enabled = state !== undefined ? state : !this.enabled;
  }

  playSuccess(streak: number = 0) {
    if (!this.enabled) return;
    this.init();
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pitch aumenta conforme o streak (máximo 12 semitons / 1 oitava)
    const baseFreq = 523.25; // C5
    const pitchShift = Math.min(12, streak);
    const multiplier = Math.pow(2, pitchShift / 12);
    const finalFreq = baseFreq * multiplier;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(finalFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(finalFreq * 2, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playTimeWarning() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.context!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1); // C#5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
}

export const audioService = new AudioService();
