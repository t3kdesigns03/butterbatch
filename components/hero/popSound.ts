/**
 * Tiny synthesized "pop" — Web Audio only, no audio files.
 * A short band-passed noise click plus a quick low "thump". Starts muted; the AudioContext is
 * only created after the visitor turns sound on (a user gesture, so browsers allow it).
 */
export class PopSound {
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private muted = true;

  get isMuted() {
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) return;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      const len = Math.floor(this.ctx.sampleRate * 0.08);
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    void this.ctx.resume();
  }

  pop(delay = 0) {
    const ctx = this.ctx;
    if (this.muted || !ctx || !this.noise) return;
    const t = ctx.currentTime + delay;

    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1400 + Math.random() * 1400;
    band.Q.value = 1.4;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.35, t + 0.003);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    src.connect(band).connect(ng).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.08);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(260 + Math.random() * 80, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.05);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.18, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(og).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
  }
}
