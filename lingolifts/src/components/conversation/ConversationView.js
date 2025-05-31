import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Scene from './Scene';

// ConversationWrapper: 会話表示全体のラッパー
const ConversationWrapper = styled.div`
  margin-top: 20px;
`;

// ControlsWrapper: 日本語訳表示/非表示、全シーン展開/折りたたみボタンのコンテナ
const ControlsWrapper = styled.div`
  display: flex;
  justify-content: space-between; // 양쪽 정렬
  align-items: center;
  margin-bottom: 20px; // コントロールと会話内容の間隔を調整
  flex-wrap: wrap; // 画面が狭い場合に折り返す
  gap: 10px;
`;

// ToggleButton: 汎用トグルボタンスタイル (日本語訳表示/非表示、シーン展開/折りたたみ)
const ToggleButton = styled.button`
  // GlobalStyleのbuttonスタイルを継承しつつ、テーマから詳細設定
  background-color: ${({ theme }) => theme.button.secondaryBg}E0; // やや透明度を持たせることも可能
  color: ${({ theme }) => theme.button.secondaryText};
  border: 1px solid ${({ theme }) => theme.button.secondaryBg};
  font-size: 0.85rem; // やや小さめのフォント
  padding: 8px 12px;

  &:hover {
    background-color: ${({ theme }) => theme.button.secondaryHoverBg};
  }
`;

// SceneExpansionButton: シーン展開/折りたたみボタン (ToggleButtonを継承)
const SceneExpansionButton = styled(ToggleButton)``;

/**
 * ConversationViewコンポーネント: 生成された会話全体（複数シーン）を表示。
 * 日本語訳の表示/非表示、全シーンの展開/折りたたみを制御する。
 * @param {object} props - コンポーネントのプロパティ。
 * @param {object} props.conversation - 表示する会話データオブジェクト。
 *   - scenes: Array<object> - シーンの配列。
 */
const ConversationView = ({ conversation }) => {
  // State Hooks
  const [showJapanese, setShowJapanese] = useState(true); // 日本語訳の表示状態 (デフォルトで表示)
  const [expandAll, setExpandAll] = useState(null); // 全シーン展開状態 (null: 個別制御, true: 全展開, false: 全折りたたみ)
  const [activePlayerId, setActivePlayerId] = useState(null); // 現在再生中の音声があるTurnのID

  // 副作用フック: 会話データが変更されたら、全展開状態とアクティブプレイヤーIDをリセット
  useEffect(() => {
    setExpandAll(null);
    setActivePlayerId(null);
  }, [conversation]); // conversationオブジェクトが新しいものに変わったら実行

  // 会話データがない、またはシーンがない場合はメッセージ表示
  if (!conversation || !conversation.scenes || conversation.scenes.length === 0) {
    return <p>表示する会話データがありません。</p>;
  }

  // 日本語訳表示/非表示トグルハンドラ
  const toggleShowJapanese = () => setShowJapanese(prevShow => !prevShow);
  // 全シーン展開ハンドラ
  const handleExpandAll = () => setExpandAll(true);
  // 全シーン折りたたみハンドラ
  const handleCollapseAll = () => setExpandAll(false);

  return (
    <ConversationWrapper>
      <ControlsWrapper>
        <ToggleButton onClick={toggleShowJapanese}>
          {showJapanese ? '日本語訳を隠す' : '日本語訳を表示'}
        </ToggleButton>
        <div>
          <SceneExpansionButton onClick={handleExpandAll} style={{marginRight: '10px'}}>
            全シーン展開
          </SceneExpansionButton>
          <SceneExpansionButton onClick={handleCollapseAll}>
            全シーン折りたたみ
          </SceneExpansionButton>
        </div>
      </ControlsWrapper>
      {conversation.scenes.map((scene, sceneIndex) => (
        <Scene
          key={sceneIndex}
          scene={scene}
          showJapanese={showJapanese}
          // expandAllがnullでない場合はその値を、nullの場合は最初のシーンのみ展開
          initiallyOpen={expandAll !== null ? expandAll : sceneIndex === 0}
          activePlayerId={activePlayerId}
          setActivePlayerId={setActivePlayerId}
          turnIdPrefix={`scene-${sceneIndex}`} // 各TurnにユニークなIDを渡すためのプレフィックス
        />
      ))}
    </ConversationWrapper>
  );
};

export default ConversationView;
// ファイル末尾に改行を保証します
