interface AudioCache {
  [key: string]: HTMLAudioElement;
}

class AudioLoader {
  private static instance: AudioLoader;
  private audioCache: AudioCache = {};
  private audioFiles = [
    '/click.wav',
    '/pressed.wav'
  ];

  private constructor() {
    this.preloadAudios();
  }

  public static getInstance(): AudioLoader {
    if (!AudioLoader.instance) {
      AudioLoader.instance = new AudioLoader();
    }
    return AudioLoader.instance;
  }

  private preloadAudios() {
    this.audioFiles.forEach(file => {
      const audio = new Audio(file);
      audio.volume = 0.4;
      audio.load();
      this.audioCache[file] = audio;
    });
  }

  public playSound(soundFile: string) {
    const audio = this.audioCache[soundFile];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }
}

export const audioLoader = AudioLoader.getInstance(); 