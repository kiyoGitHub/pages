import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaHistory, FaCog } from 'react-icons/fa'; // ナビゲーション用アイコン

// SidebarWrapper: サイドバー全体のコンテナ。
// position: sticky と top: 60px でヘッダー下に固定 (ヘッダーの高さが60pxの場合)。
// メディアクエリで画面幅768px以下の場合のレスポンシブスタイルを定義。
const SidebarWrapper = styled.aside`
  width: 230px;
  background-color: ${({ theme }) => theme.sidebarBg};
  padding: 25px 15px;
  height: calc(100vh - 60px); // ヘッダーの高さを引いたビューポートの高さ
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px ${({ theme }) => theme.card.shadow};
  border-right: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 60px;
  flex-shrink: 0; // コンテンツが広い場合にサイドバーが縮まないようにする

  @media (max-width: 768px) { // Layout.jsのブレークポイントと合わせる
    width: 100%; // フル幅に
    height: auto; // 高さは自動調整
    position: static; // 固定解除
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.border}; // 積み重ね時の区切り線
    box-shadow: 0 2px 5px ${({ theme }) => theme.card.shadow};
  }
`;

// AppLogoText: サイドバー上部のアプリアイコン/テキスト表示部分。
const AppLogoText = styled.h3`
  margin-top: 0;
  margin-bottom: 30px;
  color: ${({ theme }) => theme.primary};
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 15px;
    font-size: 1.4rem;
  }
`;

// NavList: ナビゲーションリンクのリスト(ul)。
// メディアクエリでレスポンシブ対応 (横並びなど)。
const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around; // 要素を均等に配置
    align-items: center;
  }
`;

// NavItem: 各ナビゲーションリンクのリストアイテム(li)。
const NavItem = styled.li`
  margin-bottom: 8px;

  @media (max-width: 768px) {
    margin-bottom: 0;
    flex-grow: 1; // 利用可能なスペースを分け合う
  }
`;

// StyledNavLink: NavLinkコンポーネントをラップしたスタイル付きリンク。
// アイコンとテキストを横並びに配置。アクティブ時のスタイルも定義。
// メディアクエリでレスポンシブ対応 (アイコンとテキストを縦積みなど)。
const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px; // アイコンとテキストの間隔
  padding: 12px 18px;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.primary}20;
    color: ${({ theme }) => theme.primary};
  }

  // NavLinkが自動的に付与する 'active' クラスに対するスタイル
  &.active {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.button.primaryText};
    box-shadow: 0 2px 4px ${({ theme }) => theme.primary}50;

    svg { // アクティブ時のアイコン色
      color: ${({ theme }) => theme.button.primaryText};
    }
  }

  svg { // デフォルトのアイコンスタイル
    font-size: 1.2rem;
    min-width: 20px;
    transition: color 0.2s ease-in-out;
    color: ${({ theme }) => theme.secondary};
  }

  &.active svg { // アクティブ時のアイコン色が確実に上書きされるように
     color: ${({ theme }) => theme.button.primaryText};
  }

  @media (max-width: 768px) {
    padding: 10px;
    flex-direction: column; // アイコンとテキストを縦積みに
    gap: 4px;
    font-size: 0.8rem;
    svg { font-size: 1.5rem; } // タッチしやすくアイコンを少し大きく
    justify-content: center;
    text-align: center;
    height: 70px; // タッチターゲットの高さを確保
  }
`;

/**
 * Sidebarコンポーネント: ナビゲーションリンクを持つサイドバー。
 * レスポンシブ対応で、小さい画面では表示方法が変わる。
 */
const Sidebar = () => {
  return (
    <SidebarWrapper>
      <AppLogoText>LingoLifts</AppLogoText>
      <nav>
        <NavList>
          <NavItem>
            <StyledNavLink to="/">
              <FaHome /> Home
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/history">
              <FaHistory /> History
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/settings">
              <FaCog /> Settings
            </StyledNavLink>
          </NavItem>
        </NavList>
      </nav>
    </SidebarWrapper>
  );
};

export default Sidebar;
// ファイル末尾に改行を保証します
