import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as storageService from '../services/storageService';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaTrashAlt, FaSave, FaTimesCircle } from 'react-icons/fa';
import { useNotification } from '../contexts/NotificationContext';

// --- Styled Components ---
// HistoryPageWrapper: ページ全体のラッパー
const HistoryPageWrapper = styled.div`
  padding: 20px 30px;
  max-width: 900px;
  margin: 20px auto;
  h2 { text-align: center; margin-bottom: 30px; }
`;

// ConversationList: 会話履歴のリスト (ul)
const ConversationList = styled.ul`
  list-style: none;
  padding: 0;
`;

// ConversationListItem: 各履歴アイテム (li)
const ConversationListItem = styled.li`
  background-color: ${({ theme }) => theme.card.background};
  border: 1px solid ${({ theme }) => theme.card.border};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px ${({ theme }) => theme.card.shadow};
  display: flex;
  justify-content: space-between;
  align-items: flex-start; // 上揃え（情報部とボタン群）
  gap: 15px;
`;

// ConversationInfo: 会話情報（テーマ、プロンプト名、作成日時）表示部
const ConversationInfo = styled.div`
  flex-grow: 1;
  h4 {
    margin: 0 0 8px 0;
    color: ${({ theme }) => theme.text};
    font-size: 1.15rem;
  }
  p {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.secondary};
    margin: 0 0 4px 0;
    line-height: 1.5;
  }
  p:last-child { margin-bottom: 0; }
`;

// EditThemeForm: テーマ名編集時のフォームコンテナ
const EditThemeForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 10px;

  @media (min-width: 480px) {
    flex-direction: row;
    align-items: center;
  }
`;

// EditThemeInput: テーマ名編集用入力フィールド
const EditThemeInput = styled.input`
  flex-grow: 1;
  padding: 8px 10px;
  width: 100%;
  @media (min-width: 480px) {
    width: auto;
  }
`;

// ActionButtons: 「表示」「編集」「削除」ボタンのコンテナ
const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;

  @media (min-width: 480px) {
    flex-direction: row;
  }
`;

// EditActionButtons: テーマ編集時の「保存」「キャンセル」ボタンのコンテナ
const EditActionButtons = styled(ActionButtons)`
   @media (min-width: 480px) {
    flex-direction: row;
  }
`;

// IconButton: アイコン付きボタンの汎用スタイル
const IconButton = styled.button`
  background-color: ${({ theme, variant }) => {
    if (variant === 'delete') return theme.error + '1A';
    if (variant === 'edit') return theme.primary + '1A';
    if (variant === 'save') return theme.success + '1A';
    if (variant === 'cancel') return theme.secondary + '2A';
    return theme.button.secondaryBg; // 「表示」ボタンのデフォルト
  }};
  color: ${({ theme, variant }) => {
    if (variant === 'delete') return theme.error;
    if (variant === 'edit') return theme.primary;
    if (variant === 'save') return theme.success;
    if (variant === 'cancel') return theme.secondary;
    return theme.button.secondaryText;
  }};
  border: 1px solid transparent;
  padding: 8px 10px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: currentColor;
    filter: brightness(1.2);
  }
`;

// NoHistoryMessage: 履歴がない場合に表示するメッセージ
const NoHistoryMessage = styled.p`
  text-align: center;
  font-style: italic;
  color: ${({ theme }) => theme.secondary};
  margin-top: 30px;
  font-size: 1.05rem;
`;
// --- End Styled Components ---

/**
 * ConversationHistoryPageコンポーネント: 保存された会話の履歴を表示・管理するページ。
 */
const ConversationHistoryPage = () => {
  // State Hooks
  const [conversations, setConversations] = useState([]); // 会話履歴リスト
  const [editingConversationId, setEditingConversationId] = useState(null); // 編集中会話のID
  const [newThemeName, setNewThemeName] = useState(''); // 編集中テーマ名

  const navigate = useNavigate();
  const { addNotification } = useNotification(); // 通知フック

  // 副作用フック: マウント時に会話履歴を読み込み、ソートしてセット
  useEffect(() => {
    loadAndSetConversations();
  }, []);

  /**
   * ローカルストレージから会話履歴を読み込み、作成日時の降順でソートしてstateにセットする。
   */
  const loadAndSetConversations = () => {
    const loadedConversations = storageService.loadConversations();
    loadedConversations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setConversations(loadedConversations);
  };

  // 「表示」ボタンハンドラ: HomePageに遷移して該当会話を表示
  const handleViewConversation = (conversationId) => {
    navigate('/', { state: { conversationIdToLoad: conversationId } });
  };

  // 「編集」ボタンハンドラ: テーマ名編集モードを開始
  const handleStartEditConversation = (conversation) => {
    setEditingConversationId(conversation.id);
    setNewThemeName(conversation.theme || ''); // 現在のテーマ名をフォームにプリセット
  };

  // テーマ名編集キャンセルハンドラ
  const handleCancelEdit = () => {
    setEditingConversationId(null);
    setNewThemeName('');
  };

  // テーマ名保存ハンドラ
  const handleSaveTheme = (conversationId) => {
    if (!newThemeName.trim()) {
      addNotification("テーマ名は空にできません。", 'error');
      return;
    }
    if (storageService.updateConversationTheme(conversationId, newThemeName.trim())) {
      addNotification('テーマ名を更新しました。', 'success');
      loadAndSetConversations(); // リストを再読み込みして表示を更新
    } else {
      addNotification('テーマ名の更新に失敗しました。', 'error');
    }
    setEditingConversationId(null); // 編集モードを終了
    setNewThemeName('');
  };

  // 会話削除ハンドラ
  const handleDeleteConversation = (conversationId) => {
    if (window.confirm('この会話を削除してもよろしいですか？この操作は元に戻せません。')) {
      storageService.deleteConversation(conversationId);
      loadAndSetConversations(); // リストを再読み込み
      addNotification('会話を削除しました。', 'success');
    }
  };

  return (
    <HistoryPageWrapper>
      <h2>会話履歴</h2>
      {conversations.length === 0 ? (
        <NoHistoryMessage>会話の履歴はありません。ホームページで新しい会話を生成しましょう！</NoHistoryMessage>
      ) : (
        <ConversationList>
          {conversations.map((conv) => (
            <ConversationListItem key={conv.id}>
              <ConversationInfo>
                {editingConversationId === conv.id ? ( // 編集中UI
                  <EditThemeForm>
                    <EditThemeInput
                      type="text"
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                      autoFocus
                    />
                    <EditActionButtons>
                      <IconButton variant="save" onClick={() => handleSaveTheme(conv.id)} title="テーマを保存">
                        <FaSave /> 保存
                      </IconButton>
                      <IconButton variant="cancel" onClick={handleCancelEdit} title="キャンセル">
                        <FaTimesCircle /> 中止
                      </IconButton>
                    </EditActionButtons>
                  </EditThemeForm>
                ) : ( // 通常表示UI
                  <h4>{conv.theme || '無題の会話'}</h4>
                )}
                <p><strong>プロンプト:</strong> {conv.promptName || 'N/A'}</p>
                <p><strong>作成日時:</strong> {new Date(conv.createdAt).toLocaleString()}</p>
              </ConversationInfo>
              {editingConversationId !== conv.id && ( // 通常時のアクションボタン
                <ActionButtons>
                    <IconButton onClick={() => handleViewConversation(conv.id)} title="会話を表示">
                        <FaEye /> 表示
                    </IconButton>
                    <IconButton variant="edit" onClick={() => handleStartEditConversation(conv)} title="テーマを編集">
                        <FaEdit /> 編集
                    </IconButton>
                    <IconButton variant="delete" onClick={() => handleDeleteConversation(conv.id)} title="会話を削除">
                        <FaTrashAlt /> 削除
                    </IconButton>
                </ActionButtons>
              )}
            </ConversationListItem>
          ))}
        </ConversationList>
      )}
    </HistoryPageWrapper>
  );
};

export default ConversationHistoryPage;
// ファイル末尾に改行を保証します
