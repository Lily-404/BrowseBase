interface AudioCache {
  [key: string]: HTMLAudioElement;
}

class AudioLoader {
  private static instance: AudioLoader;
  private audioCache: AudioCache = {};
  private audioFiles = [
    '/click.wav',
    '/pressed.wav',
    '/to.wav',
    '/click.mp3'
  ];
  private loadingPromises: Promise<void>[] = [];

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
      const audio = new Audio();
      audio.volume = 0.4;
      audio.preload = 'auto';
      
      // 创建一个加载Promise
      const loadPromise = new Promise<void>((resolve) => {
        audio.addEventListener('canplaythrough', () => {
          resolve();
        }, { once: true });
        
        audio.addEventListener('error', () => {
          console.warn(`Failed to load audio: ${file}`);
          resolve(); // 即使加载失败也resolve，避免阻塞
        }, { once: true });
      });

      this.loadingPromises.push(loadPromise);
      audio.src = file;
      audio.load();
      this.audioCache[file] = audio;
    });
  }

  public async playSound(soundFile: string) {
    try {
      // 等待所有音频加载完成
      await Promise.all(this.loadingPromises);
      
      const audio = this.audioCache[soundFile];
      if (audio) {
        // 克隆音频元素以实现重叠播放
        const audioClone = audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = 0.4;
        audioClone.play().catch(() => {});
      } else {
        // 如果音频文件不在缓存中，尝试加载并播放
        const newAudio = new Audio(soundFile);
        newAudio.volume = 0.4;
        newAudio.play().catch(() => {});
        this.audioCache[soundFile] = newAudio;
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }
}

export const audioLoader = AudioLoader.getInstance(); 