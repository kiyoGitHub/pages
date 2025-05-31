import React, { useState, useEffect } from 'react'; // useEffectを追加
import styled from 'styled-components';
import Turn from './Turn';

// SceneWrapper: 1つのシーン全体を包むコンテナ。アコーディオンの枠組み。
const SceneWrapper = styled.div`
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.card.border}; // テーマのカード境界色を使用
  border-radius: 8px; // 角丸を少し大きく
  background-color: ${({ theme }) => theme.card.background}; // テーマのカード背景色を使用
  overflow: hidden; // アコーディオンアニメーションのため
  box-shadow: 0 2px 4px ${({ theme }) => theme.card.shadow}50; // やや薄めの影
`;

// SceneTitleButton: シーンタイトル表示兼アコーディオン開閉ボタン。
const SceneTitleButton = styled.button`
  background-color: ${({ theme }) => theme.primary}1A; // プライマリ色の薄いバリエーション
  color: ${({ theme }) => theme.text};
  padding: 12px 18px; // パディング調整
  width: 100%;
  text-align: left;
  border: none;
  // 開いている時は下に境界線を表示、閉じてる時は透明
  border-bottom: 1px solid ${({ theme, isOpen }) => isOpen ? theme.border : 'transparent'};
  cursor: pointer;
  font-size: 1.15rem; // フォントサイズ調整
  font-weight: 700; // やや太め
  transition: background-color 0.2s ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.primary}30; // ホバー時にもう少し濃く
  }
  // 開閉状態を示すインジケータ（+/-）
  span {
    float: right;
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.15rem; // ボタンのテキストと高さを合わせる
  }
`;

// TurnsContainer: 会話ターンを格納するコンテナ。アコーディオンで開閉する部分。
const TurnsContainer = styled.div`
  padding: ${({ isOpen }) => isOpen ? '15px 18px' : '0 18px'}; // 開閉でパディング変更
  max-height: ${({ isOpen }) => isOpen ? '1200px' : '0'}; // 十分な高さを確保、または0で非表示
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s cubic-bezier(0.4, 0, 0.2, 1); // イージング調整
`;

/**
 * Sceneコンポーネント: 会話の一つのシーンを表示。
 * シーンタイトルと、それに続く複数の会話ターンから構成される。
 * アコーディオン形式で会話ターンの表示/非表示を切り替え可能。
 * @param {object} props - コンポーネントのプロパティ。
 * @param {object} props.scene - 表示するシーンのデータ。
 * @param {boolean} props.showJapanese - 日本語訳を表示するかどうか。
 * @param {boolean} props.initiallyOpen - 初期状態でシーンを開いておくか。
 * @param {string | null} props.activePlayerId - 現在再生中のTurnのID。
 * @param {Function} props.setActivePlayerId - 再生中のTurnのIDをセットする関数。
 * @param {string} props.turnIdPrefix - このシーン内のTurnにユニークなIDを付与するためのプレフィックス。
 */
const Scene = ({ scene, showJapanese, initiallyOpen = false, activePlayerId, setActivePlayerId, turnIdPrefix }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen); // アコーディオンの開閉状態

  // initiallyOpen propの変更（例: 親からの全展開/全折りたたみ指示）に応じて開閉状態を更新
  useEffect(() => {
    setIsOpen(initiallyOpen);
  }, [initiallyOpen]);

  if (!scene) return null;

  // タイトルクリックで開閉状態をトグル
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <SceneWrapper>
      {scene.sceneTitle && (
        <SceneTitleButton onClick={toggleOpen} isOpen={isOpen}>
          {scene.sceneTitle}
          <span>{isOpen ? '(-)' : '(+)'}</span>
        </SceneTitleButton>
      )}
      <TurnsContainer isOpen={isOpen}>
        {scene.turns && scene.turns.map((turn, index) => (
          <Turn
            key={index}
            turn={turn}
            showJapanese={showJapanese}
            turnId={`${turnIdPrefix}-turn-${index}`}
            activePlayerId={activePlayerId}
            setActivePlayerId={setActivePlayerId}
          />
        ))}
      </TurnsContainer>
    </SceneWrapper>
  );
};

export default Scene;
// ファイル末尾に改行を保証します
