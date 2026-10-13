/**
 * Audio synthesizers and Web Speech API Voice Narrator for Bingo
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  public speechEnabled: boolean = true;
  public sfxEnabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private initVoices() {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer PT-BR voices
      const ptVoice = voices.find((v) => v.lang.includes('pt-BR') || v.lang.includes('pt_BR') || v.lang.startsWith('pt'));
      if (ptVoice) {
        this.voice = ptVoice;
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // Play a short pleasant click/stamp sound for marking cells
  public playMarkSound() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Play ball drop / spin ping
  public playBallDrawnSound() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Two-tone pop
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(640, now + 0.12);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);
    } catch {
      // Ignore audio block
    }
  }

  // Play fanfare / winning chime
  public playBingoFanfare() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const start = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = start + idx * 0.14;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.25, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.35);
      });
    } catch {
      // Audio error
    }
  }

  // Chat message ping
  public playChatPing() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio error
    }
  }

  // Voice narration for the drawn ball in Brazilian Portuguese
  public speakBall(ballNumber: number, letter?: string) {
    if (!this.speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      // Nicknames for Brazilian bingo culture
      const nicknames: Record<number, string> = {
        1: 'Começo de conversa, número 1',
        11: 'Um atrás do outro, 11',
        13: 'Número do azar, 13',
        22: 'Dois patinhos na lagoa, 22',
        33: 'Idade de Cristo, 33',
        45: 'Fim do primeiro tempo, 45',
        51: 'Uma boa ideia, 51',
        69: 'Um para cima e um para baixo, 69',
        75: 'Última pedra da cartela, 75',
      };

      let textToSay = '';
      if (letter) {
        textToSay = `${letter}, ${ballNumber}!`;
      } else {
        textToSay = `Número ${ballNumber}!`;
      }

      if (nicknames[ballNumber]) {
        textToSay = `${nicknames[ballNumber]}!`;
      }

      const utterance = new SpeechSynthesisUtterance(textToSay);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      if (this.voice) {
        utterance.voice = this.voice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech error
    }
  }

  public speakText(text: string) {
    if (!this.speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      if (this.voice) {
        utterance.voice = this.voice;
      }
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  }
}

export const soundService = new SoundService();
