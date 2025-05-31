import * as storageService from './storageService';

// TTS APIエンドポイントのプレースホルダー (実際のAPIに合わせて要変更)
// const GEMINI_TTS_API_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const TTS_CACHE_NAME = 'lingolifts-tts-cache-v1'; // TTS音声データ用キャッシュ名

/**
 * TTSリクエスト用のキャッシュキーを生成します。
 * 現在はテキスト内容のみに基づいています。より堅牢にするには、音声設定（言語、ボイス名など）もキーに含めるべきです。
 * @param {string} text - 音声合成するテキスト。
 * @returns {string} キャッシュキーとして使用する文字列。
 */
const createCacheKey = (text) => {
  // テキストの最初の100文字と空白をアンダースコアに置換したものをキーとする（簡易的な実装）
  return `tts_${text.substring(0, 100).replace(/\s+/g, '_')}`;
};

/**
 * クラウドベースのTTS API（例: Gemini TTS）を使用して音声を合成します。
 * キャッシュ機能を実装し、同じテキストに対する重複したAPIコールを避けます。
 * 現在はモックAPI呼び出しを使用し、テスト用に実際のMP3ファイルをフェッチしてキャッシュします。
 *
 * @param {string} text - 音声合成するテキスト。
 * @param {object} ttsSettingsOverride - (オプション) TTS設定のオーバーライド値。
 * @returns {Promise<string>} 音声BLOBのオブジェクトURLを解決するPromise。
 * @throws {Error} APIキー未設定、空テキスト、またはAPI/ネットワークエラーの場合。
 */
export const synthesizeSpeech = async (text, ttsSettingsOverride = null) => {
  const settingsToUse = ttsSettingsOverride || storageService.loadTTSSettings();

  // クラウドTTSサービス（例: GeminiTTS）でAPIキーが必要な場合の設定チェック
  if (settingsToUse.ttsService === 'GeminiTTS' && !settingsToUse.ttsApiKey) {
    throw new Error('GeminiTTSのAPIキーが設定されていません。設定画面で設定してください。');
  }
  if (!text.trim()) {
    throw new Error('空のテキストは音声合成できません。');
  }

  // const apiKey = settingsToUse.ttsApiKey; // 実際のAPIコール時に使用
  // const voiceSettings = settingsToUse.voice || { languageCode: 'en-US', name: 'en-US-Wavenet-D' }; // 例: 音声設定
  // const audioConfig = settingsToUse.audioConfig || { audioEncoding: 'MP3' }; // 例: オーディオ設定

  const cacheKey = createCacheKey(text /*, voiceSettings */); // キャッシュキーを生成

  // キャッシュストレージの確認
  try {
    const cache = await caches.open(TTS_CACHE_NAME);
    const cachedResponse = await cache.match(cacheKey); // キャッシュに一致するレスポンスがあるか確認

    if (cachedResponse) {
      console.log(`TTSキャッシュHIT: "${text.substring(0, 30)}..."`);
      const audioSrcBlob = await cachedResponse.blob();
      return URL.createObjectURL(audioSrcBlob); // キャッシュから音声を提供
    }
    console.log(`TTSキャッシュMISS: "${text.substring(0, 30)}..."`);
  } catch (cacheError) {
    console.error("TTSキャッシュへのアクセス中にエラー:", cacheError);
    // キャッシュアクセスに失敗しても、ネットワークからの取得を試みる
  }

  console.log('クラウドTTS (モック) で音声を合成中:', text.substring(0, 30) + "...");

  // --- モックAPI呼び出し (キャッシュテストのため実際のMP3 URLをフェッチ) ---
  console.warn("ttsService.synthesizeSpeech でモックデータを使用しています (キャッシュテストのため実際のMP3をフェッチします)。");
  await new Promise(resolve => setTimeout(resolve, 700)); // ネットワーク遅延のシミュレーション

  // テスト用の公開MP3ファイルURL
  const mockAudioUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

  try {
    const audioResponse = await fetch(mockAudioUrl); // モックとして実際のMP3データを取得
    if (!audioResponse.ok) {
      throw new Error(`モック音声のフェッチに失敗: ${audioResponse.statusText}`);
    }
    const audioBlob = await audioResponse.blob(); // レスポンスをBlobとして取得

    // 取得した音声データをキャッシュに保存
    try {
      const cache = await caches.open(TTS_CACHE_NAME);
      // cache.put() するレスポンスは一度しか使えないため、clone() するか新しいResponseオブジェクトを作成する
      await cache.put(cacheKey, new Response(audioBlob.slice(), { headers: audioResponse.headers }));
      console.log(`TTSデータをキャッシュしました: "${text.substring(0, 30)}..."`);
    } catch (cacheError) {
      console.error("TTSデータのキャッシュ中にエラー:", cacheError);
      // キャッシュ保存エラーは致命的ではないため、音声再生は続行
    }

    return URL.createObjectURL(audioBlob); // Blob URLを生成して返す

  } catch (error) {
    console.error('synthesizeSpeech (モックフェッチまたはキャッシュ処理) 内でのエラー:', error);
    throw error; // エラーを再スロー
  }
  // --- モックAPI呼び出し終了 ---
};

/**
 * ブラウザのSpeechSynthesis APIを使用してテキストを読み上げます。
 * @param {string} text - 読み上げるテキスト。
 * @param {string} lang - 言語コード (例: 'en-US', 'ja-JP')。
 * @returns {Promise<void>} 読み上げが完了したかエラー発生時に解決/拒否されるPromise。
 */
export const speakBrowser = (text, lang = 'en-US') => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('ブラウザのSpeechSynthesis APIはサポートされていません。'));
      return;
    }
    if (!text.trim()) {
      reject(new Error('空のテキストは読み上げできません。'));
      return;
    }
    window.speechSynthesis.cancel(); // 既存の読み上げがあればキャンセル
    console.log('ブラウザAPIで読み上げ中:', text.substring(0, 30) + "...");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    // 必要に応じて他の utterance プロパティ (voice, rate, pitch) を設定
    utterance.onend = () => {
      console.log('ブラウザの読み上げが完了しました。');
      resolve();
    };
    utterance.onerror = (event) => {
      console.error('ブラウザSpeechSynthesisエラー:', event.error);
      reject(new Error(`SpeechSynthesisエラー: ${event.error}`));
    };
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * ブラウザのSpeechSynthesis APIによる現在の読み上げをキャンセルします。
 */
export const cancelBrowserSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    console.log('ブラウザの読み上げをキャンセルしました。');
  }
};
// ファイル末尾に改行を保証します
