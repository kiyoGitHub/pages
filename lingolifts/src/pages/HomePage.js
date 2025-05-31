import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import * as storageService from '../services/storageService';
import * as llmService from '../services/llmService';
import ConversationView from '../components/conversation/ConversationView';

// --- Styled Components ---
// HomePageWrapper: ページ全体のラッパー
const HomePageWrapper = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  h2 { text-align: center; margin-bottom: 20px; }
`;

// ThemeInputSection: 会話テーマ入力とプロンプト選択、生成ボタンのセクション
const ThemeInputSection = styled.section`
  margin-bottom: 25px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  input[type="text"] { flex-grow: 1; flex-basis: 200px; }
  select { flex-grow: 1; flex-basis: 150px; }
  button {
    flex-shrink: 0;
    background-color: ${({ theme }) => theme.button.primaryBg};
    color: ${({ theme }) => theme.button.primaryText};
    &:hover { background-color: ${({ theme }) => theme.button.primaryHoverBg}; }
    &:disabled {
      background-color: ${({ theme }) => theme.button.disabledBg};
      color: ${({ theme }) => theme.button.disabledText};
      cursor: not-allowed;
    }
  }
`;

// ConversationDisplayArea: 生成された会話を表示するエリア
const ConversationDisplayArea = styled.section`
  margin-top: 20px;
  border: 1px solid ${({ theme }) => theme.card.border};
  border-radius: 8px;
  padding: 20px;
  min-height: 300px;
  background-color: ${({ theme }) => theme.card.background};
  color: ${({ theme }) => theme.text};
  overflow-y: auto;
  max-height: calc(100vh - 250px); // ヘッダーや入力エリアを考慮した最大高
  box-shadow: 0 2px 4px ${({ theme }) => theme.card.shadow};
`;

// LoadingMessage: ローディング中のメッセージ表示
const LoadingMessage = styled.p`
  font-style: italic;
  color: ${({ theme }) => theme.secondary};
  text-align: center;
  padding: 20px;
`;

// ErrorMessage: エラーメッセージ表示
const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.error};
  background-color: ${({ theme }) => theme.error}1A;
  padding: 10px 15px;
  border: 1px solid ${({ theme }) => theme.error};
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
`;

// InitialMessage: 初期表示メッセージ (会話未生成時)
const InitialMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.secondary};
  font-style: italic;
  margin-top: 20px;
`;
// --- End Styled Components ---

/**
 * HomePageコンポーネント: 会話生成のメインページ。
 * テーマ入力、プロンプト選択、会話生成実行、結果表示、履歴からの会話表示を行う。
 */
const HomePage = () => {
  // State Hooks
  const [themeInput, setThemeInput] = useState(''); // 入力された会話テーマ
  const [conversation, setConversation] = useState(null); // 生成または表示中の会話データ
  const [isLoading, setIsLoading] = useState(false); // API通信などのローディング状態
  const [error, setError] = useState(null); // エラーメッセージ
  const [prompts, setPrompts] = useState([]); // 利用可能なプロンプトのリスト
  const [selectedPromptId, setSelectedPromptId] = useState(''); // 選択されたプロンプトのID

  const location = useLocation(); // react-routerのlocationフック
  const navigate = useNavigate(); // react-routerのnavigateフック

  // 副作用フック: プロンプト一覧をマウント時に読み込み、デフォルト選択
  useEffect(() => {
    const loadedPrompts = storageService.loadPrompts();
    setPrompts(loadedPrompts);
    // プロンプトがあり、かつまだ何も選択されていなければ最初のプロンプトを選択状態にする
    if (loadedPrompts.length > 0 && !selectedPromptId) {
      setSelectedPromptId(loadedPrompts[0].id.toString());
    }
  }, [selectedPromptId]); // selectedPromptIdの変更時にも再評価 (通常は初回のみ)

  // 副作用フック: 会話履歴ページから渡されたIDに基づいて会話を読み込む
  useEffect(() => {
    if (location.state?.conversationIdToLoad) {
      const conversationId = location.state.conversationIdToLoad;
      const conversationToDisplay = storageService.loadConversationById(conversationId);
      if (conversationToDisplay) {
        setConversation(conversationToDisplay);
        setThemeInput(conversationToDisplay.theme || ''); // テーマをフォームに反映
        // プロンプトも当時のものを選択状態にする
        const promptUsed = prompts.find(p => p.name === conversationToDisplay.promptName);
        if (promptUsed) {
          setSelectedPromptId(promptUsed.id.toString());
        } else if (prompts.length > 0) {
          // 当時のプロンプトが見つからなければリストの先頭を選択 (フォールバック)
          setSelectedPromptId(prompts[0].id.toString());
        }
      } else {
        setError(`ID ${conversationId} の会話が見つかりませんでした。`);
      }
      // location.stateをクリアして、リフレッシュ時の再読み込みを防ぐ
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, prompts]); // promptsも依存配列に追加

  /**
   * 「会話生成」ボタンのハンドラ。
   * LLMサービスを呼び出し、会話を生成・表示・保存する。
   */
  const handleGenerateConversation = async () => {
    // バリデーション
    if (!themeInput.trim()) {
      setError('会話のテーマを入力してください。');
      return;
    }
    if (!selectedPromptId) {
      setError('使用するプロンプトを選択してください。');
      return;
    }

    setIsLoading(true);
    setError(null); // 既存のエラーをクリア

    try {
      const llmSettings = storageService.loadLLMSettings(); // LLM設定を読み込み
      const selectedPromptObj = prompts.find(p => p.id.toString() === selectedPromptId);

      if (!selectedPromptObj) {
        throw new Error("選択されたプロンプトが見つかりません。設定を確認してください。");
      }

      // llmServiceから会話シーンの配列を取得 (現在はモック)
      const scenes = await llmService.generateConversation(themeInput, selectedPromptObj, llmSettings);

      // 完全な会話オブジェクトを構築
      const newConversation = {
        id: Date.now().toString(), // ユニークID (タイムスタンプ)
        theme: themeInput,
        promptName: selectedPromptObj.name, // 使用したプロンプト名
        createdAt: new Date().toISOString(), // 作成日時
        scenes: scenes
      };

      setConversation(newConversation); // Stateを更新して表示
      storageService.saveConversation(newConversation); // ローカルストレージに保存
      console.log("生成・保存された会話:", newConversation);

    } catch (err) {
      console.error("HomePageでの会話生成エラー:", err);
      setError(err.message || '会話の生成に失敗しました。');
      setConversation(null); // エラー時は会話データをクリア
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HomePageWrapper>
      <h2>{location.state?.conversationIdToLoad ? "保存された会話の表示" : "英会話を生成"}</h2>
      <ThemeInputSection>
        <input
          type="text"
          value={themeInput}
          onChange={(e) => setThemeInput(e.target.value)}
          placeholder="会話のテーマを入力 (例: 食事の注文)"
          disabled={isLoading}
        />
        <select
          value={selectedPromptId}
          onChange={(e) => setSelectedPromptId(e.target.value)}
          disabled={isLoading || prompts.length === 0}
        >
          {prompts.length === 0 && <option value="">利用可能なプロンプトがありません</option>}
          {prompts.map(prompt => (
            <option key={prompt.id} value={prompt.id.toString()}>{prompt.name}</option>
          ))}
        </select>
        <button
          onClick={handleGenerateConversation}
          disabled={isLoading || !themeInput.trim() || prompts.length === 0 || !selectedPromptId}
        >
          {isLoading ? '生成中...' : '新規生成'}
        </button>
      </ThemeInputSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ConversationDisplayArea>
        {/* ローディング中かつ、まだ前の会話データがない場合 */}
        {isLoading && !conversation && <LoadingMessage>新しい会話を生成中です。お待ちください...</LoadingMessage>}
        {/* ローディング中だが、前の会話データがまだ表示されている場合 */}
        {isLoading && conversation && <LoadingMessage>新しい会話を生成中です...</LoadingMessage>}

        {/* ローディング中でなく、会話データもエラーもない初期状態 */}
        {!isLoading && !conversation && !error &&
          <InitialMessage>テーマを入力し、プロンプトを選択して「新規生成」ボタンを押してください。</InitialMessage>
        }

        {/* 会話データがあり、ローディング中でない場合に表示 */}
        {conversation &&
          <ConversationView conversation={conversation} />
        }
      </ConversationDisplayArea>
    </HomePageWrapper>
  );
};

export default HomePage;
// ファイル末尾に改行を保証します
