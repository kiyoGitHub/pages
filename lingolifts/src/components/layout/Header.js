import React from 'react';
import styled from 'styled-components';
import { FaSun, FaMoon } from 'react-icons/fa'; // テーマ切り替え用アイコン

// HeaderWrapper: ヘッダー全体を包むコンテナ。
// position: sticky と top: 0 で画面上部に固定。
// z-index で他の要素より手前に表示。
const HeaderWrapper = styled.header`
  background-color: ${({ theme }) => theme.headerBg};
  color: ${({ theme }) => theme.text};
  padding: 0 25px; // 左右パディングを少し増やす
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between; // 要素間を均等に配置
  box-shadow: 0 2px 4px ${({ theme }) => theme.card.shadow};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

// AppTitle: アプリケーションのタイトル/ロゴ表示部分。
const AppTitle = styled.h1`
  font-size: 1.6rem; // サイズ調整
  color: ${({ theme }) => theme.primary};
  margin: 0;
  font-weight: 700; // やや太めに
`;

// ThemeToggleButton: テーマ切り替えボタン。
const ThemeToggleButton = styled.button`
  background: none; // 背景なし
  border: 1px solid transparent; // 初期状態ではボーダーなし、ホバー/フォーカスで表示も可
  color: ${({ theme }) => theme.primary};
  padding: 8px; // アイコン周りのパディング
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem; // アイコンサイズ調整
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.primary}20;
    border-color: ${({ theme }) => theme.primary}50; // ホバー時に薄いボーダー
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}50; // フォーカスリング
  }
`;

/**
 * Headerコンポーネント: アプリケーションヘッダー。
 * アプリタイトルとテーマ切り替えスイッチを表示。
 * @param {object} props - コンポーネントのプロパティ。
 * @param {string} props.theme - 現在のテーマ名 ('light' or 'dark')。
 * @param {Function} props.toggleTheme - テーマを切り替える関数。
 */
const Header = ({ theme, toggleTheme }) => {
  return (
    <HeaderWrapper>
      <AppTitle>LingoLifts</AppTitle>
      {/* 将来的には現在のページタイトルなどをここに表示することも可能 */}
      <ThemeToggleButton
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </ThemeToggleButton>
    </HeaderWrapper>
  );
};

export default Header;
// ファイル末尾に改行を保証します
