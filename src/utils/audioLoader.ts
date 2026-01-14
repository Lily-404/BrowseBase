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
    const loadAudio = async (file: string, retry = 3): Promise<void> => {
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

        let isResolved = false;
        const resolveOnce = () => {
          if (isResolved) return;
          isResolved = true;
          if (this.audioCache[file]) {
            this.audioCache[file].loaded = true;
          }
          resolve();
        };

        // 设置超时（国内网络可能需要更长时间）
        const timeout = setTimeout(() => {
          // 即使超时，如果音频已经可以播放，也标记为已加载
          if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
            resolveOnce();
          } else if (retry > 0) {
            clearTimeout(timeout);
            // 重试
            loadAudio(file, retry - 1).then(resolve).catch(() => {
              if (this.audioCache[file]) {
                this.audioCache[file].error = true;
              }
              resolve();
            });
          } else {
            // 最后一次重试失败，标记为错误但继续
            if (this.audioCache[file]) {
              this.audioCache[file].error = true;
            }
            resolve();
          }
        }, 10000); // 10秒超时

        const onLoad = () => {
          clearTimeout(timeout);
          resolveOnce();
        };
        const onError = async () => {
          clearTimeout(timeout);
          if (retry > 0) {
            // 延迟重试，避免立即重试
            setTimeout(async () => {
              await loadAudio(file, retry - 1);
            }, 1000);
          } else {
            if (this.audioCache[file]) {
              this.audioCache[file].error = true;
            }
            resolve();
          }
        };

        // 优先使用 canplay，更快响应（适合慢网络）
        const onCanPlay = () => {
          if (!isResolved && audio.readyState >= 2) {
            clearTimeout(timeout);
            audio.removeEventListener('canplaythrough', onCanPlayThrough);
            onLoad();
          }
        };
        const onCanPlayThrough = () => {
          if (!isResolved) {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', onCanPlay);
            onLoad();
          }
        };

        // 同时监听 canplay 和 canplaythrough
        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
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
      // 如果音频未加载，立即加载它（带超时）
      if (!this.audioCache[soundFile] || (!this.audioCache[soundFile].loaded && !this.audioCache[soundFile].error)) {
        // 使用 Promise.race 添加超时，避免长时间等待
        await Promise.race([
          this.loadAudioOnDemand(soundFile),
          new Promise<void>((resolve) => setTimeout(resolve, 3000)) // 3秒超时
        ]);
      }

      const cache = this.audioCache[soundFile];
      if (cache && !cache.error) {
        // 即使未完全加载，如果 readyState >= 2 也可以尝试播放
        if (cache.loaded || cache.audio.readyState >= 2) {
          const audioClone = cache.audio.cloneNode() as HTMLAudioElement;
          audioClone.volume = this.volume;
          
          // 如果音频还没准备好，等待一小段时间（但不超过500ms）
          if (audioClone.readyState < 2) {
            await Promise.race([
              new Promise<void>((resolve) => {
                const onCanPlay = () => {
                  audioClone.removeEventListener('canplay', onCanPlay);
                  resolve();
                };
                audioClone.addEventListener('canplay', onCanPlay, { once: true });
              }),
              new Promise<void>((resolve) => setTimeout(resolve, 500)) // 500ms 超时
            ]);
          }
          
          audioClone.addEventListener('error', (error) => {
            console.warn(`Error playing sound: ${soundFile}`, error);
          }, { once: true });

          try {
            await audioClone.play();
          } catch (playError) {
            // 播放失败时静默处理，不阻塞用户操作
            console.warn('Failed to play sound:', playError);
          }
        }
      } else if (!cache || cache.error) {
        // 如果加载失败，尝试最后一次即时加载
        try {
          await Promise.race([
            this.loadAudioOnDemand(soundFile),
            new Promise<void>((resolve) => setTimeout(resolve, 2000)) // 2秒超时
          ]);
          const retryCache = this.audioCache[soundFile];
          if (retryCache && (retryCache.loaded || retryCache.audio.readyState >= 2) && !retryCache.error) {
            const audioClone = retryCache.audio.cloneNode() as HTMLAudioElement;
            audioClone.volume = this.volume;
            await audioClone.play().catch(() => {
              // 静默处理播放失败
            });
          }
        } catch {
          // 静默处理，不影响用户体验
        }
      }
    } catch (error) {
      // 静默处理所有错误，不影响用户体验
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
  private async preloadSingleAudio(file: string, retry = 3): Promise<void> {
    return new Promise((resolve) => {
      // 如果已经加载过，直接返回
      if (this.audioCache[file]?.loaded) {
        resolve();
        return;
      }

      const audio = new Audio();
      audio.volume = this.volume;
      audio.preload = 'auto';

      let isResolved = false;
      const resolveOnce = () => {
        if (isResolved) return;
        isResolved = true;
        if (this.audioCache[file]) {
          this.audioCache[file].loaded = true;
        }
        resolve();
      };

      // 设置超时
      const timeout = setTimeout(() => {
        if (audio.readyState >= 2) {
          resolveOnce();
        } else if (retry > 0) {
          clearTimeout(timeout);
          this.preloadSingleAudio(file, retry - 1).then(resolve).catch(() => {
            if (this.audioCache[file]) {
              this.audioCache[file].error = true;
            }
            resolve();
          });
        } else {
          if (this.audioCache[file]) {
            this.audioCache[file].error = true;
          }
          resolve();
        }
      }, 8000); // 8秒超时

      const onLoad = () => {
        clearTimeout(timeout);
        resolveOnce();
      };
      const onError = async () => {
        clearTimeout(timeout);
        if (retry > 0) {
          setTimeout(async () => {
            await this.preloadSingleAudio(file, retry - 1);
          }, 1000);
        } else {
          if (this.audioCache[file]) {
            this.audioCache[file].error = true;
          }
          resolve();
        }
      };

      // 优先使用 canplay，更快响应
      const onCanPlay = () => {
        if (!isResolved && audio.readyState >= 2) {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', onCanPlayThrough);
          onLoad();
        }
      };
      const onCanPlayThrough = () => {
        if (!isResolved) {
          clearTimeout(timeout);
          audio.removeEventListener('canplay', onCanPlay);
          onLoad();
        }
      };

      audio.addEventListener('canplay', onCanPlay, { once: true });
      audio.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
      audio.addEventListener('error', onError, { once: true });

      audio.src = file;
      audio.load();
      if (!this.audioCache[file]) {
        this.audioCache[file] = { audio, loaded: false, error: false };
      }
    });
  }
}

// 立即创建实例并开始预加载
export const audioLoader = AudioLoader.getInstance(); 