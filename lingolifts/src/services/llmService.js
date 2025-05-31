import * as storageService from './storageService';

// Gemini APIエンドポイントのテンプレート関数 (実際のエンドポイントはモデルにより異なる場合がある)
// const GEMINI_API_ENDPOINT_TEMPLATE = (modelName) => `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

/**
 * LLM APIを使用して会話文を生成します (現在はモック実装)。
 *
 * @param {string} theme - ユーザーが指定した会話のテーマ。
 * @param {object} userPrompt - 選択されたプロンプトオブジェクト { name: string, content: string }。
 * @param {object} llmSettingsOverride - (オプション) LLM設定のオーバーライド値。指定されない場合はストレージから読み込みます。
 * @returns {Promise<Array<object>>} 生成された会話シーンの配列を解決するPromise。各シーンは { sceneTitle: string, turns: Array<object> } 形式。
 * @throws {Error} APIキー未設定、モデル名未設定、プロンプト未指定、またはAPI/ネットワークエラーの場合。
 */
export const generateConversation = async (theme, userPrompt, llmSettingsOverride = null) => {
  // 使用するLLM設定を決定 (オーバーライドがあればそれを使用、なければストレージからロード)
  const settingsToUse = llmSettingsOverride || storageService.loadLLMSettings();

  // 設定の検証
  if (!settingsToUse || !settingsToUse.llmApiKey) {
    throw new Error('LLM APIキーが設定されていません。設定画面で設定してください。');
  }
  if (!settingsToUse.llmModelName) {
    throw new Error('LLMのモデル名が設定されていません。設定画面で設定してください。');
  }
  if (!userPrompt || !userPrompt.content) {
    throw new Error('会話生成には有効なプロンプトが必要です。');
  }

  const apiKey = settingsToUse.llmApiKey; // APIキー (実際のAPIコール時に使用)
  const modelName = settingsToUse.llmModelName; // モデル名 (実際のAPIコール時に使用)
  // const apiEndpoint = GEMINI_API_ENDPOINT_TEMPLATE(modelName); // APIエンドポイント (実際のAPIコール時に使用)

  // LLMに送信する完全なプロンプトを構築
  const fullPrompt = `
    ${userPrompt.content}
    {/* 上記はユーザー定義の基本プロンプト */}

    Conversation Theme: "${theme}"
    {/* 上記はユーザーが入力した会話テーマ */}

    Please generate a conversation with about 20 scenes. Each scene should have a short title.
    Each scene should contain multiple turns of dialogue between two speakers (Speaker 1 and Speaker 2).
    For each turn, provide the English sentence and its Japanese translation.
    The output should be structured as a JSON object.
    Do not include markdown backticks (\\\`\\\`\\\`json ... \\\`\\\`\\\`) in your response.
    The JSON object should have a single top-level key "conversation" which contains an array of "scenes".
    Each scene object in the "scenes" array should have "sceneTitle" (string) and "turns" (array of objects).
    Each turn object should have "speaker" (string, "Speaker 1" or "Speaker 2"), "english" (string), and "japanese" (string).

    Example of a single scene in the "scenes" array:
    {
      "sceneTitle": "Example Scene Title",
      "turns": [
        { "speaker": "Speaker 1", "english": "Hello there.", "japanese": "こんにちは。" },
        { "speaker": "Speaker 2", "english": "Good morning.", "japanese": "おはようございます。" }
      ]
    }
  `;

  console.log("LLMへの送信情報(モック):", { modelName, theme, userPromptName: userPrompt.name });
  // console.log("LLM用フルプロンプト(デバッグ用):", fullPrompt); // デバッグ時に参照、長大なため通常はコメントアウト

  try {
    // --- ここからモックAPI呼び出し ---
    // 実際のGemini APIリクエストボディの例:
    // const requestBody = {
    //   contents: [{
    //     parts: [{ text: fullPrompt }]
    //   }],
    //   generationConfig: { temperature: 0.7, topK: 40 }, // 生成設定 (オプション)
    //   safetySettings: [ // 安全性設定 (オプション)
    //     { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    //   ]
    // };

    // 実際のAPI呼び出し (fetchを使用):
    // const response = await fetch(\`\${apiEndpoint}?key=\${apiKey}\`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(requestBody),
    // });

    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({ message: response.statusText }));
    //   console.error('LLM APIエラー:', errorData);
    //   throw new Error(\`APIエラー (\${response.status}): \${errorData.error?.message || '会話の取得に失敗しました'}\`);
    // }
    // const responseData = await response.json();
    // Gemini APIの場合、通常 responseData.candidates[0].content.parts[0].text にJSON文字列が含まれる
    // const conversationJsonString = responseData.candidates[0].content.parts[0].text;
    // const parsedConversation = JSON.parse(conversationJsonString);
    // return parsedConversation.conversation; // scenesの配列を返す
    // --- ここまで実際のAPI呼び出し部分 ---

    console.warn("llmService.generateConversation でモックデータを使用しています。");
    await new Promise(resolve => setTimeout(resolve, 1500)); // ネットワーク遅延をシミュレート

    // モックのAPIレスポンス (sceneの配列を直接返す想定)
    const mockApiResponse = {
      "conversation": [
        {
          "sceneTitle": "シーン 1: コーヒーを注文する",
          "turns": [
            { "speaker": "Speaker 1", "english": "I'd like a latte, please.", "japanese": "ラテをください。" },
            { "speaker": "Speaker 2", "english": "Coming right up. Anything else?", "japanese": "かしこまりました。他にご注文は？" }
          ]
        },
        {
          "sceneTitle": "シーン 2: 週末の予定について話す",
          "turns": [
            { "speaker": "Speaker 1", "english": "Any plans for the weekend?", "japanese": "週末の予定は？" },
            { "speaker": "Speaker 2", "english": "I'm thinking of going hiking.", "japanese": "ハイキングに行こうと思っています。" },
            { "speaker": "Speaker 1", "english": "That sounds fun!", "japanese": "楽しそうですね！" }
          ]
        },
        {
          "sceneTitle": "シーン 3: 天気について",
          "turns": [
            { "speaker": "Speaker 1", "english": "It's a beautiful day, isn't it?", "japanese": "いい天気ですね。" },
            { "speaker": "Speaker 2", "english": "Yes, perfect for a picnic.", "japanese": "ええ、ピクニックに最適です。" }
          ]
        }
      ]
    };
    // --- モックAPI呼び出し終了 ---

    return mockApiResponse.conversation; // モックデータを直接使用 (scenes配列)

  } catch (error) {
    console.error('generateConversation内でのエラー:', error);
    // APIエラーとしてスローされたものはそのまま再スロー
    if (error.message.startsWith('APIエラー')) throw error;
    // それ以外の予期せぬエラー
    throw new Error(`ネットワークエラーまたは予期せぬエラーが発生しました: ${error.message}`);
  }
};
// ファイル末尾に改行を保証します
