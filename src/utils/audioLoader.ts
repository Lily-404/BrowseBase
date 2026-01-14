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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const loadAudio = async (file: string, retry = 2): Promise<void> => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // 移动端使用更宽松的加载事件，PC端使用 canplaythrough
        const loadEvent = isMobile ? 'canplay' : 'canplaythrough';
        let timeoutId: NodeJS.Timeout | null = null;
        let resolved = false;

        const onLoad = () => {
          if (resolved) return;
          resolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          this.audioCache[file].loaded = true;
          resolve();
        };
        
        const onError = async () => {
          if (resolved) return;
          if (timeoutId) clearTimeout(timeoutId);
          
          if (retry > 0) {
            // 重试
            await loadAudio(file, retry - 1);
            resolve();
          } else {
            resolved = true;
            this.audioCache[file].error = true;
            resolve();
          }
        };

        // 设置超时，避免无限等待（移动端网络可能较慢，给更长时间）
        const timeout = isMobile ? 10000 : 5000;
        timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            // 超时不算错误，标记为已加载（可能已经部分加载）
            this.audioCache[file].loaded = true;
            resolve();
          }
        }, timeout);

        audio.addEventListener(loadEvent, onLoad, { once: true });
        audio.addEventListener('error', onError, { once: true });
        
        // 移动端也监听 canplaythrough，如果触发了更好
        if (isMobile) {
          audio.addEventListener('canplaythrough', onLoad, { once: true });
        }

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
      let cache = this.audioCache[soundFile];
      
      // 如果音频未加载或加载失败，尝试立即加载
      if (!cache || cache.error) {
        await this.loadAudioOnDemand(soundFile);
        cache = this.audioCache[soundFile];
      }
      
      if (cache && !cache.error) {
        // 移动端：如果音频未完全加载，直接使用原音频对象播放（避免克隆问题）
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        let audioToPlay: HTMLAudioElement;
        
        if (isMobile && !cache.loaded) {
          // 移动端如果未完全加载，直接使用原音频对象
          audioToPlay = cache.audio;
          audioToPlay.currentTime = 0; // 重置播放位置
        } else {
          // PC端或已加载完成，使用克隆
          audioToPlay = cache.audio.cloneNode() as HTMLAudioElement;
        }
        
        audioToPlay.volume = this.volume;
        
        audioToPlay.addEventListener('error', (error) => {
          console.warn(`Error playing sound: ${soundFile}`, error);
        }, { once: true });

        await audioToPlay.play();
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
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const audio = new Audio();
      audio.volume = this.volume;
      audio.preload = 'auto';
      
      const loadEvent = isMobile ? 'canplay' : 'canplaythrough';
      let timeoutId: NodeJS.Timeout | null = null;
      let resolved = false;

      const onLoad = () => {
        if (resolved) return;
        resolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        this.audioCache[file].loaded = true;
        resolve();
      };
      
      const onError = async () => {
        if (resolved) return;
        if (timeoutId) clearTimeout(timeoutId);
        
        if (retry > 0) {
          await this.preloadSingleAudio(file, retry - 1);
          resolve();
        } else {
          resolved = true;
          this.audioCache[file].error = true;
          resolve();
        }
      };

      // 设置超时
      const timeout = isMobile ? 10000 : 5000;
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.audioCache[file].loaded = true;
          resolve();
        }
      }, timeout);

      audio.addEventListener(loadEvent, onLoad, { once: true });
      audio.addEventListener('error', onError, { once: true });
      
      if (isMobile) {
        audio.addEventListener('canplaythrough', onLoad, { once: true });
      }

      audio.src = file;
      audio.load();
      this.audioCache[file] = { audio, loaded: false, error: false };
    });
  }
}

// 立即创建实例并开始预加载
export const audioLoader = AudioLoader.getInstance(); 