interface AudioCache {
  [key: string]: {
    audio: HTMLAudioElement;
    loaded: boolean;
    error: boolean;
  };
}

class AudioLoader {
  private static instance: AudioLoader;
  private audioCache: AudioCache = {};
  private audioFiles = [
    '/click.wav',
    '/pressed.wav',
    '/to.wav',
  ];
  private loadingPromises: Promise<void>[] = [];
  private volume: number = 0.4;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  private constructor() {
    // 立即开始预加载
    this.initialize();
  }

  public static getInstance(): AudioLoader {
    if (!AudioLoader.instance) {
      AudioLoader.instance = new AudioLoader();
    }
    return AudioLoader.instance;
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    // 在页面加载完成后立即开始预加载
    if (document.readyState === 'complete') {
      await this.preloadAudios();
    } else {
      window.addEventListener('load', () => {
        this.preloadAudios();
      });
    }
    
    this.isInitialized = true;
  }

  private async preloadAudios() {
    const loadPromises = this.audioFiles.map(file => {
      return new Promise<void>((resolve) => {
        const audio = new Audio();
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        audio.addEventListener('canplaythrough', () => {
          this.audioCache[file].loaded = true;
          resolve();
        }, { once: true });
        
        audio.addEventListener('error', (error) => {
          console.warn(`Failed to load audio: ${file}`, error);
          this.audioCache[file].error = true;
          resolve();
        }, { once: true });

        audio.src = file;
        audio.load();
        this.audioCache[file] = {
          audio,
          loaded: false,
          error: false
        };
      });
    });

    this.loadingPromises = loadPromises;
    await Promise.all(loadPromises);
  }

  public async playSound(soundFile: string) {
    if (this.isMuted) return;

    try {
      const cache = this.audioCache[soundFile];
      if (cache && !cache.error) {
        const audioClone = cache.audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = this.volume;
        
        audioClone.addEventListener('error', (error) => {
          console.warn(`Error playing sound: ${soundFile}`, error);
        }, { once: true });

        await audioClone.play();
      } else {
        console.warn(`Audio not found or failed to load: ${soundFile}`);
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.audioCache).forEach(({ audio }) => {
      audio.volume = this.volume;
    });
  }

  public mute() {
    this.isMuted = true;
  }

  public unmute() {
    this.isMuted = false;
  }

  public isAudioLoaded(soundFile: string): boolean {
    return this.audioCache[soundFile]?.loaded || false;
  }

  public hasAudioError(soundFile: string): boolean {
    return this.audioCache[soundFile]?.error || false;
  }

  public async waitForLoad(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    await Promise.all(this.loadingPromises);
  }

  public getLoadingProgress(): number {
    const total = this.audioFiles.length;
    const loaded = Object.values(this.audioCache).filter(cache => cache.loaded).length;
    return total > 0 ? loaded / total : 0;
  }
}

// 立即创建实例并开始预加载
export const audioLoader = AudioLoader.getInstance(); 