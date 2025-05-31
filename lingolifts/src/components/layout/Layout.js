import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

// AppWrapper: アプリケーション全体の基本ラッパー。flex-direction: column でヘッダー、メインコンテンツ、フッターを縦に並べる。
// min-height: 100vh で、コンテンツが少なくてもフッターが画面下部に留まるようにする。
const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// MainContentWrapper: サイドバーとメインページコンテンツ（children）を内包するラッパー。
// flex-grow: 1 で利用可能な垂直方向のスペースを埋める。
// メディアクエリで画面幅が768px以下の場合、flex-direction: column に変更し、サイドバーとコンテンツを縦積みするレスポンシブ対応。
const MainContentWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  background-color: ${({ theme }) => theme.body};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// PageContent: 実際のページコンポーネント(children)がレンダリングされるメイン領域。
// flex-grow: 1 で利用可能な水平方向のスペースを埋める。
// overflow-y: auto で、コンテンツがはみ出す場合に垂直スクロールバーを表示。
const PageContent = styled.main`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.body};
`;

/**
 * Layoutコンポーネント: アプリケーション全体の骨格となるレイアウトを提供。
 * Header, Sidebar, Footer とメインコンテンツ(children)を配置する。
 * @param {object} props - コンポーネントのプロパティ。
 * @param {React.ReactNode} props.children - PageContentに表示される子要素。
 * @param {string} props.theme - 現在のテーマ名 ('light' or 'dark')。Headerに渡される。
 * @param {Function} props.toggleTheme - テーマを切り替える関数。Headerに渡される。
 */
const Layout = ({ children, theme, toggleTheme }) => {
  return (
    <AppWrapper>
      {/* Headerコンポーネントにテーマ情報と切り替え関数を渡す */}
      <Header theme={theme} toggleTheme={toggleTheme} />
      <MainContentWrapper>
        <Sidebar /> {/* サイドバーコンポーネント */}
        <PageContent>
          {children} {/* 各ページコンポーネントがここにレンダリングされる */}
        </PageContent>
      </MainContentWrapper>
      <Footer /> {/* フッターコンポーネント */}
    </AppWrapper>
  );
};

export default Layout;
// ファイル末尾に改行を保証します
