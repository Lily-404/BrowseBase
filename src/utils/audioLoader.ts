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
    
    // 立即开始预加载，不等待 window.load 事件
    // 这样可以更早地开始加载音效，避免首次使用时延迟
    this.preloadAudios().catch(error => {
      console.warn('Failed to preload audios:', error);
    });
    
    this.isInitialized = true;
  }

  private async preloadAudios() {
    const loadAudio = async (file: string, retry = 2): Promise<void> => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.volume = this.volume;
        audio.preload = 'auto';

        const onLoad = () => {
          this.audioCache[file].loaded = true;
          resolve();
        };
        const onError = async () => {
          if (retry > 0) {
            // 重试
            await loadAudio(file, retry - 1);
          } else {
            this.audioCache[file].error = true;
            resolve();
          }
        };

        audio.addEventListener('canplaythrough', onLoad, { once: true });
        audio.addEventListener('error', onError, { once: true });

        audio.src = file;
        audio.load();
        this.audioCache[file] = { audio, loaded: false, error: false };
      });
    };

    const loadPromises = this.audioFiles.map(file => loadAudio(file));
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

  // 懒加载音效
  public async loadAudioOnDemand(soundFile: string) {
    if (!this.audioCache[soundFile]) {
      await this.preloadSingleAudio(soundFile);
    }
  }

  // 新增：单个音效预加载
  private async preloadSingleAudio(file: string, retry = 2): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.volume = this.volume;
      audio.preload = 'auto';

      const onLoad = () => {
        this.audioCache[file].loaded = true;
        resolve();
      };
      const onError = async () => {
        if (retry > 0) {
          await this.preloadSingleAudio(file, retry - 1);
        } else {
          this.audioCache[file].error = true;
          resolve();
        }
      };

      audio.addEventListener('canplaythrough', onLoad, { once: true });
      audio.addEventListener('error', onError, { once: true });

      audio.src = file;
      audio.load();
      this.audioCache[file] = { audio, loaded: false, error: false };
    });
  }
}

// 立即创建实例并开始预加载
export const audioLoader = AudioLoader.getInstance(); 