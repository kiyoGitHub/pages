// ローカルストレージのキーに使用するプレフィックス (他のアプリケーションとの衝突を避けるため)
const LINGO_LIFTS_PREFIX = 'lingolifts_';

// --- LLM 設定 ---

/**
 * LLM設定をローカルストレージに保存します。
 * @param {object} settings - 保存するLLM設定オブジェクト { llmService, llmApiKey, llmModelName }
 */
export const saveLLMSettings = (settings) => {
  try {
    localStorage.setItem(LINGO_LIFTS_PREFIX + 'llmSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('LLM設定のローカルストレージへの保存中にエラーが発生しました:', error);
  }
};

/**
 * ローカルストレージからLLM設定を読み込みます。
 * @returns {object | null} 読み込まれたLLM設定オブジェクト、または見つからない場合はnull。
 */
export const loadLLMSettings = () => {
  try {
    const settings = localStorage.getItem(LINGO_LIFTS_PREFIX + 'llmSettings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('LLM設定のローカルストレージからの読み込み中にエラーが発生しました:', error);
    return null;
  }
};

// --- TTS 設定 ---

/**
 * TTS設定をローカルストレージに保存します。
 * @param {object} settings - 保存するTTS設定オブジェクト { ttsService, ttsApiKey, ttsEnabled }
 */
export const saveTTSSettings = (settings) => {
  try {
    localStorage.setItem(LINGO_LIFTS_PREFIX + 'ttsSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('TTS設定のローカルストレージへの保存中にエラーが発生しました:', error);
  }
};

/**
 * ローカルストレージからTTS設定を読み込みます。
 * @returns {object} 読み込まれたTTS設定オブジェクト。設定が存在しない場合はデフォルト値を返します。
 */
export const loadTTSSettings = () => {
  try {
    const settings = localStorage.getItem(LINGO_LIFTS_PREFIX + 'ttsSettings');
    // TTSが有効であるというデフォルト値と、ブラウザ音声合成をデフォルトサービスとする
    const defaults = { ttsService: 'BrowserSpeechSynthesis', ttsApiKey: '', ttsEnabled: true };
    if (settings) {
      const parsed = JSON.parse(settings);
      // 保存された設定とデフォルト値をマージして、不足している可能性のあるキーを補完
      return { ...defaults, ...parsed };
    }
    return defaults;
  } catch (error) {
    console.error('TTS設定のローカルストレージからの読み込み中にエラーが発生しました:', error);
    // エラー発生時もデフォルト値を返す
    return { ttsService: 'BrowserSpeechSynthesis', ttsApiKey: '', ttsEnabled: true };
  }
};

// --- プロンプト設定 ---

/**
 * プロンプトの配列をローカルストレージに保存します。
 * @param {Array<object>} prompts - 保存するプロンプトオブジェクトの配列 [{ id, name, content }]
 */
export const savePrompts = (prompts) => {
  try {
    localStorage.setItem(LINGO_LIFTS_PREFIX + 'prompts', JSON.stringify(prompts));
  } catch (error) {
    console.error('プロンプトのローカルストレージへの保存中にエラーが発生しました:', error);
  }
};

/**
 * ローカルストレージからプロンプトの配列を読み込みます。
 * @returns {Array<object>} 読み込まれたプロンプトの配列。見つからない場合は空配列。
 */
export const loadPrompts = () => {
  try {
    const prompts = localStorage.getItem(LINGO_LIFTS_PREFIX + 'prompts');
    return prompts ? JSON.parse(prompts) : [];
  } catch (error) {
    console.error('プロンプトのローカルストレージからの読み込み中にエラーが発生しました:', error);
    return [];
  }
};

// --- 会話履歴 ---

/**
 * 生成された会話データをローカルストレージに保存します。
 * 既存の会話リストに追加（またはIDが一致すれば更新）します。
 * @param {object} conversationToSave - 保存する会話データオブジェクト
 */
export const saveConversation = (conversationToSave) => {
  try {
    const existingConversations = loadConversations();
    // 新しい会話をリストに追加（IDが同じものが既にあれば上書きする形でフィルタリング）
    const updatedConversations = [...existingConversations.filter(c => c.id !== conversationToSave.id), conversationToSave];
    localStorage.setItem(LINGO_LIFTS_PREFIX + 'conversations', JSON.stringify(updatedConversations));
  } catch (error) {
    console.error('会話データのローカルストレージへの保存中にエラーが発生しました:', error);
  }
};

/**
 * ローカルストレージから全ての会話履歴を読み込みます。
 * @returns {Array<object>} 読み込まれた会話データの配列。見つからない場合は空配列。
 */
export const loadConversations = () => {
  try {
    const conversations = localStorage.getItem(LINGO_LIFTS_PREFIX + 'conversations');
    return conversations ? JSON.parse(conversations) : [];
  } catch (error) {
    console.error('会話履歴のローカルストレージからの読み込み中にエラーが発生しました:', error);
    return [];
  }
};

/**
 * 指定されたIDに基づいて特定の会話データをローカルストレージから読み込みます。
 * @param {string} id - 読み込む会話データのID。
 * @returns {object | null} 該当する会話データオブジェクト、または見つからない場合はnull。
 */
export const loadConversationById = (id) => {
  try {
    const conversations = loadConversations();
    return conversations.find(conversation => conversation.id === id) || null;
  } catch (error) {
    console.error('IDによる会話データの読み込み中にエラーが発生しました:', error);
    return null;
  }
};

/**
 * 指定されたIDの会話データをローカルストレージから削除します。
 * @param {string} id - 削除する会話データのID。
 */
export const deleteConversation = (id) => {
  try {
    let conversations = loadConversations();
    conversations = conversations.filter(conversation => conversation.id !== id);
    localStorage.setItem(LINGO_LIFTS_PREFIX + 'conversations', JSON.stringify(conversations));
  } catch (error) {
    console.error('会話データの削除中にエラーが発生しました:', error);
  }
};

/**
 * 指定されたIDの会話データのテーマ名を更新します。
 * @param {string} id - 更新する会話データのID。
 * @param {string} newTheme - 新しいテーマ名。
 * @returns {boolean} 更新が成功した場合はtrue、失敗した場合はfalse。
 */
export const updateConversationTheme = (id, newTheme) => {
  try {
    let conversations = loadConversations();
    const conversationIndex = conversations.findIndex(conv => conv.id === id);
    if (conversationIndex !== -1) {
      conversations[conversationIndex].theme = newTheme; // テーマ名を更新
      localStorage.setItem(LINGO_LIFTS_PREFIX + 'conversations', JSON.stringify(conversations));
      return true;
    }
    console.warn(`更新対象の会話 (ID: ${id}) が見つかりませんでした。`);
    return false;
  } catch (error) {
    console.error('会話テーマの更新中にエラーが発生しました:', error);
    return false;
  }
};
// ファイル末尾に改行を保証します
