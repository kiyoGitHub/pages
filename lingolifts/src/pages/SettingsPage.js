import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as storageService from '../services/storageService';
import { useNotification } from '../contexts/NotificationContext';

// --- Styled Components ---
// SettingsWrapper: 設定ページ全体のラッパー
const SettingsWrapper = styled.div`
  padding: 20px 30px;
  max-width: 800px;
  margin: 20px auto;
  h2 { text-align: center; margin-bottom: 30px; }
  h3 {
    color: ${({ theme }) => theme.text};
    margin-top: 25px;
    margin-bottom: 20px;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding-bottom: 10px;
  }
  // ページ説明用のpタグ
  & > p {
    text-align: center;
    margin-bottom: 40px;
    font-size: 1.05rem;
    color: ${({ theme }) => theme.secondary};
  }
`;

// StyledSection: 各設定セクションのラッパー
const StyledSection = styled.section`
  background-color: ${({ theme }) => theme.card.background};
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 4px 8px ${({ theme }) => theme.card.shadow};
  border: 1px solid ${({ theme }) => theme.card.border};
`;

// StyledForm: 各設定フォーム
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// FormGroup: ラベルと入力フィールドのグループ
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
  }
  // チェックボックスなど、ラベルと入力要素を横並びにする場合
  &.row {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    label { margin-bottom: 0; }
  }
`;

// 各ページ固有の入力要素 (GlobalStyleのデフォルトを継承・利用)
const PageInput = styled.input``;
const PageSelect = styled.select``;
const PageTextarea = styled.textarea`
  min-height: 100px;
`;

// ButtonGroup: 複数のボタンをまとめるラッパー
const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 15px;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

// StyledButton: カスタムボタンスタイル
const StyledButton = styled.button`
  // GlobalStyleのbuttonデフォルトを継承しつつ、variantでスタイルを分岐
  background-color: ${({ theme, variant }) => {
    if (variant === 'secondary') return theme.button.secondaryBg;
    if (variant === 'outline') return theme.body; // アウトラインボタンの背景はボディ色
    return theme.button.primaryBg; // デフォルトはプライマリボタン
  }};
  color: ${({ theme, variant }) => {
    if (variant === 'secondary') return theme.button.secondaryText;
    if (variant === 'outline') return theme.button.primaryBg; // アウトラインボタンのテキストはプライマリ色
    return theme.button.primaryText;
  }};
  border: 1px solid ${({ theme, variant }) => (variant === 'outline' ? theme.button.primaryBg : 'transparent')};

  &:hover {
    background-color: ${({ theme, variant }) => {
      if (variant === 'secondary') return theme.button.secondaryHoverBg;
      if (variant === 'outline') return theme.primary + '1A'; // アウトラインボタンホバー時の薄い背景
      return theme.button.primaryHoverBg;
    }};
  }
`;

// PromptList: 保存済みプロンプトのリスト
const PromptList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;

// PromptListItem: プロンプト一覧の各アイテム
const PromptListItem = styled.li`
  padding: 12px 15px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  background-color: ${({ theme, selected }) => selected ? theme.primary + '2A' : theme.card.background};
  color: ${({ theme }) => theme.text};
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    border-color: ${({ theme }) => theme.primary}70;
    background-color: ${({ theme }) => theme.primary}1A;
  }
`;
// --- End Styled Components ---

/**
 * SettingsPageコンポーネント: アプリケーション設定（LLM, TTS, プロンプト）を管理するページ。
 */
const SettingsPage = () => {
  const { addNotification } = useNotification(); // 通知フック

  // State Hooks for LLM Settings
  const [llmServiceState, setLlmServiceState] = useState('Gemini'); // LLMサービス名 (将来の拡張用)
  const [llmApiKey, setLlmApiKey] = useState(''); // LLM APIキー
  const [llmModelName, setLlmModelName] = useState('gemini-1.5-flash'); // LLMモデル名

  // State Hooks for TTS Settings
  const [ttsServiceState, setTtsServiceState] = useState('BrowserSpeechSynthesis'); // TTSサービス名
  const [ttsApiKey, setTtsApiKey] = useState(''); // TTS APIキー (クラウドTTS用)
  const [ttsEnabled, setTtsEnabled] = useState(true); // TTS機能の有効/無効フラグ

  // State Hooks for Prompt Settings
  const [prompts, setPrompts] = useState([]); // 保存済みプロンプトのリスト
  const [currentPromptName, setCurrentPromptName] = useState(''); // 現在編集中のプロンプト名
  const [currentPromptContent, setCurrentPromptContent] = useState(''); // 現在編集中のプロンプト内容
  const [selectedPromptId, setSelectedPromptId] = useState(null); // 編集・削除対象として選択されたプロンプトID

  // 副作用フック: マウント時にローカルストレージから各種設定を読み込む
  useEffect(() => {
    const loadedLlmSettings = storageService.loadLLMSettings();
    if (loadedLlmSettings) {
      setLlmServiceState(loadedLlmSettings.llmService || 'Gemini');
      setLlmApiKey(loadedLlmSettings.llmApiKey || '');
      setLlmModelName(loadedLlmSettings.llmModelName || 'gemini-1.5-flash');
    }
    const loadedTtsSettings = storageService.loadTTSSettings(); // デフォルト値含む
    setTtsServiceState(loadedTtsSettings.ttsService);
    setTtsApiKey(loadedTtsSettings.ttsApiKey);
    setTtsEnabled(loadedTtsSettings.ttsEnabled);
    const loadedPrompts = storageService.loadPrompts();
    setPrompts(loadedPrompts);
  }, []); // 空の依存配列でマウント時にのみ実行

  // LLM設定保存ハンドラ
  const handleLlmSettingsSave = () => {
    const settings = { llmService: llmServiceState, llmApiKey, llmModelName };
    storageService.saveLLMSettings(settings);
    addNotification('LLM設定を保存しました。', 'success');
  };

  // TTS設定保存ハンドラ
  const handleTtsSettingsSave = () => {
    const settings = { ttsService: ttsServiceState, ttsApiKey, ttsEnabled };
    storageService.saveTTSSettings(settings);
    addNotification('TTS設定を保存しました。', 'success');
  };

  // 新規プロンプト作成準備ハンドラ (フォームをクリア)
  const handleNewPrompt = () => {
    setCurrentPromptName('');
    setCurrentPromptContent('');
    setSelectedPromptId(null);
  };

  // プロンプト保存/更新ハンドラ
  const handleSavePrompt = () => {
    if (!currentPromptName.trim() || !currentPromptContent.trim()) {
      addNotification('プロンプト名と内容は必須です。', 'error');
      return;
    }
    let updatedPrompts;
    const type = selectedPromptId ? '更新' : '保存';
    if (selectedPromptId) { // 更新の場合
      updatedPrompts = prompts.map(p =>
        p.id === selectedPromptId ? { ...p, name: currentPromptName, content: currentPromptContent } : p
      );
    } else { // 新規保存の場合
      const newPrompt = { id: Date.now(), name: currentPromptName, content: currentPromptContent };
      updatedPrompts = [...prompts, newPrompt];
    }
    setPrompts(updatedPrompts);
    storageService.savePrompts(updatedPrompts);
    addNotification(`プロンプトを${type}しました。`, 'success');
    handleNewPrompt(); // フォームをクリア
  };

  // プロンプトを編集対象として選択するハンドラ
  const handleSelectPromptToEdit = (prompt) => {
    setCurrentPromptName(prompt.name);
    setCurrentPromptContent(prompt.content);
    setSelectedPromptId(prompt.id);
  };

  // プロンプト削除ハンドラ
  const handleDeletePrompt = () => {
    if (!selectedPromptId) {
      addNotification("削除するプロンプトが選択されていません。", 'error');
      return;
    }
    const updatedPrompts = prompts.filter(p => p.id !== selectedPromptId);
    setPrompts(updatedPrompts);
    storageService.savePrompts(updatedPrompts);
    addNotification('プロンプトを削除しました。', 'success');
    handleNewPrompt(); // フォームと選択状態をクリア
  };

  return (
    <SettingsWrapper>
      <h2>設定</h2>
      <p>アプリケーションの動作やAPIキーなどを管理します。</p>
      {/* LLM設定セクション */}
      <StyledSection>
        <h3>LLM 設定</h3>
        <StyledForm onSubmit={(e) => {e.preventDefault(); handleLlmSettingsSave();}}>
          <FormGroup>
            <label htmlFor="llmService">LLM サービス:</label>
            <PageSelect id="llmService" value={llmServiceState} onChange={(e) => setLlmServiceState(e.target.value)} >
              <option value="Gemini">Gemini</option>
            </PageSelect>
          </FormGroup>
          <FormGroup>
            <label htmlFor="llmApiKey">API キー:</label>
            <PageInput type="password" id="llmApiKey" value={llmApiKey} onChange={(e) => setLlmApiKey(e.target.value)} placeholder="APIキーを入力" />
          </FormGroup>
          <FormGroup>
            <label htmlFor="llmModelName">モデル名:</label>
            <PageInput type="text" id="llmModelName" value={llmModelName} onChange={(e) => setLlmModelName(e.target.value)} placeholder="例: gemini-1.5-flash" />
          </FormGroup>
          <StyledButton type="submit">LLM設定を保存</StyledButton>
        </StyledForm>
      </StyledSection>
      {/* TTS設定セクション */}
      <StyledSection>
        <h3>TTS 設定</h3>
        <StyledForm onSubmit={(e) => {e.preventDefault(); handleTtsSettingsSave();}}>
          <FormGroup className="row">
            <label htmlFor="ttsEnabled">読み上げ機能を有効にする:</label>
            <PageInput type="checkbox" id="ttsEnabled" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} style={{width: 'auto', height: 'auto'}} />
          </FormGroup>
          <FormGroup>
            <label htmlFor="ttsService">TTS サービス:</label>
            <PageSelect id="ttsService" value={ttsServiceState} onChange={(e) => setTtsServiceState(e.target.value)} disabled={!ttsEnabled}>
              <option value="BrowserSpeechSynthesis">ブラウザ音声合成</option>
              <option value="GeminiTTS">Gemini TTS (クラウド)</option>
            </PageSelect>
          </FormGroup>
          <FormGroup>
            <label htmlFor="ttsApiKey">API キー (クラウドTTS用):</label>
            <PageInput type="password" id="ttsApiKey" value={ttsApiKey} onChange={(e) => setTtsApiKey(e.target.value)} placeholder="APIキーを入力" disabled={!ttsEnabled || ttsServiceState !== 'GeminiTTS'} />
          </FormGroup>
          <StyledButton type="submit">TTS設定を保存</StyledButton>
        </StyledForm>
      </StyledSection>
      {/* プロンプト設定セクション */}
      <StyledSection>
        <h3>プロンプト設定</h3>
        <StyledForm onSubmit={(e) => {e.preventDefault(); handleSavePrompt();}}>
          <FormGroup>
            <label htmlFor="promptName">プロンプト名:</label>
            <PageInput type="text" id="promptName" value={currentPromptName} onChange={(e) => setCurrentPromptName(e.target.value)} placeholder="プロンプトの名称" />
          </FormGroup>
          <FormGroup>
            <label htmlFor="promptContent">プロンプト内容:</label>
            <PageTextarea id="promptContent" value={currentPromptContent} onChange={(e) => setCurrentPromptContent(e.target.value)} placeholder="LLMへの指示内容" rows="5" />
          </FormGroup>
          <ButtonGroup>
            <StyledButton type="button" onClick={handleNewPrompt} variant="outline">新規作成/クリア</StyledButton>
            <StyledButton type="submit">
              {selectedPromptId ? '選択中プロンプトを更新' : '新規プロンプトを保存'}
            </StyledButton>
          </ButtonGroup>
        </StyledForm>
        <h4 style={{marginTop: '30px', color: ({ theme }) => theme.secondary }}>保存済みプロンプト一覧</h4>
        {prompts.length === 0 ? (
          <p style={{color: ({ theme }) => theme.secondary, fontStyle: 'italic'}}>保存されているプロンプトはありません。</p>
        ) : (
          <PromptList>
            {prompts.map((prompt) => (
              <PromptListItem key={prompt.id} onClick={() => handleSelectPromptToEdit(prompt)} selected={selectedPromptId === prompt.id} >
                {prompt.name}
              </PromptListItem>
            ))}
          </PromptList>
        )}
        {selectedPromptId && prompts.length > 0 && (
          <ButtonGroup>
            <StyledButton type="button" onClick={handleDeletePrompt} variant="outline" style={{borderColor: ({ theme }) => theme.error, color: ({ theme }) => theme.error}}>選択中プロンプトを削除</StyledButton>
          </ButtonGroup>
        )}
      </StyledSection>
    </SettingsWrapper>
  );
};

export default SettingsPage;
// ファイル末尾に改行を保証します
