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
    // 立即开始预加载，不等待任何事件
    // 使用微任务确保不阻塞主线程
    Promise.resolve().then(() => {
      this.initialize();
    });
  }

  public static getInstance(): AudioLoader {
    if (!AudioLoader.instance) {
      AudioLoader.instance = new AudioLoader();
    }
    return AudioLoader.instance;
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    // 立即开始预加载，不等待任何 DOM 事件
    // 音频加载不依赖于 DOM，可以立即开始
    this.preloadAudios();
    
    this.isInitialized = true;
  }

  private async preloadAudios() {
    const loadAudio = async (file: string, retry = 2): Promise<void> => {
      return new Promise((resolve) => {
        // 如果已经加载过，直接返回
        if (this.audioCache[file]?.loaded) {
          resolve();
          return;
        }

        const audio = new Audio();
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // 先设置缓存，避免重复加载
        if (!this.audioCache[file]) {
          this.audioCache[file] = { audio, loaded: false, error: false };
        }

        const onLoad = () => {
          if (this.audioCache[file]) {
            this.audioCache[file].loaded = true;
          }
          resolve();
        };
        const onError = async () => {
          if (retry > 0) {
            // 重试
            await loadAudio(file, retry - 1);
          } else {
            if (this.audioCache[file]) {
              this.audioCache[file].error = true;
            }
            resolve();
          }
        };

        // 使用 canplay 而不是 canplaythrough，更快响应
        // 但优先使用 canplaythrough 确保完整加载
        const onCanPlayThrough = () => {
          audio.removeEventListener('canplay', onCanPlay);
          onLoad();
        };
        const onCanPlay = () => {
          // 如果 canplaythrough 还没触发，至少可以开始播放
          if (!this.audioCache[file]?.loaded) {
            audio.removeEventListener('canplaythrough', onCanPlayThrough);
            onLoad();
          }
        };

        audio.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.addEventListener('error', onError, { once: true });

        audio.src = file;
        audio.load();
      });
    };

    const loadPromises = this.audioFiles.map(file => loadAudio(file));
    this.loadingPromises = loadPromises;
    // 不等待所有加载完成，让它们并行加载
    Promise.all(loadPromises).catch(error => {
      console.warn('Some audio files failed to load:', error);
    });
  }

  public async playSound(soundFile: string) {
    if (this.isMuted) return;

    try {
      // 如果音频未加载，立即加载它
      if (!this.audioCache[soundFile] || (!this.audioCache[soundFile].loaded && !this.audioCache[soundFile].error)) {
        await this.loadAudioOnDemand(soundFile);
      }

      const cache = this.audioCache[soundFile];
      if (cache && !cache.error && cache.loaded) {
        // 确保音频已准备好播放
        const audioClone = cache.audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = this.volume;
        
        // 等待音频可以播放
        if (audioClone.readyState < 2) { // HAVE_CURRENT_DATA
          await new Promise<void>((resolve) => {
            const onCanPlay = () => {
              audioClone.removeEventListener('canplay', onCanPlay);
              resolve();
            };
            audioClone.addEventListener('canplay', onCanPlay, { once: true });
            // 设置超时，避免无限等待
            setTimeout(() => {
              audioClone.removeEventListener('canplay', onCanPlay);
              resolve();
            }, 100);
          });
        }
        
        audioClone.addEventListener('error', (error) => {
          console.warn(`Error playing sound: ${soundFile}`, error);
        }, { once: true });

        await audioClone.play();
      } else if (cache && cache.error) {
        console.warn(`Audio failed to load: ${soundFile}`);
      } else {
        // 如果缓存不存在，尝试立即加载并播放
        await this.loadAudioOnDemand(soundFile);
        const retryCache = this.audioCache[soundFile];
        if (retryCache && retryCache.loaded && !retryCache.error) {
          const audioClone = retryCache.audio.cloneNode() as HTMLAudioElement;
          audioClone.volume = this.volume;
          await audioClone.play();
        }
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