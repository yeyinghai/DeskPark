import { settings } from './store';

/** Capacitor 原生桥（只在 Android App 里存在） */
interface CapBridge {
  isPluginAvailable?: (name: string) => boolean;
  nativePromise?: (plugin: string, method: string, options: unknown) => Promise<unknown>;
}

function nativeTts(): CapBridge | null {
  const cap = (globalThis as { Capacitor?: CapBridge }).Capacitor;
  return cap?.nativePromise && cap.isPluginAvailable?.('TextToSpeech') ? cap : null;
}

/**
 * 用系统语音报牌（跟随「音效」开关；不支持时静默）。
 * Android App 的 WebView 没有 speechSynthesis，改用原生 TextToSpeech 插件。
 */
export function speak(text: string, opts: { interrupt?: boolean } = {}) {
  if (!text || !settings.get().sound) return;
  try {
    const cap = nativeTts();
    if (cap) {
      // queueStrategy：0 = 打断当前语音，1 = 排队
      void cap.nativePromise!('TextToSpeech', 'speak', {
        text,
        lang: 'zh-CN',
        rate: 1.15,
        queueStrategy: opts.interrupt === false ? 1 : 0,
      }).catch(() => {});
      return;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang === 'zh-CN') ?? voices.find((v) => v.lang.startsWith('zh'));
    if (opts.interrupt !== false) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 1.15;
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch {
    // 语音不可用时静默
  }
}
