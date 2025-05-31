import React from 'react';
import styled from 'styled-components';
import { FaRegSmile } from 'react-icons/fa'; // フッター用アイコン例

// FooterWrapper: フッター全体のコンテナ。
// margin-top: auto により、AppWrapperがflex-direction: column の場合、
// メインコンテンツが短くてもフッターが画面下部に配置される。
const FooterWrapper = styled.footer`
  background-color: ${({ theme }) => theme.footerBg};
  color: ${({ theme }) => theme.secondary};
  padding: 20px;
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin-top: auto; // メインコンテンツがビューポートより短い場合にフッターを一番下にプッシュ
`;

// FooterText: フッター内のテキスト表示用。
const FooterText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; // アイコンとテキストの間隔
`;

/**
 * Footerコンポーネント: アプリケーションフッター。
 * コピーライト情報や簡単なメッセージを表示。
 */
const Footer = () => {
  return (
    <FooterWrapper>
      <FooterText>
        <FaRegSmile /> LingoLifts © {new Date().getFullYear()} - Happy Learning!
      </FooterText>
      {/*
        将来的にネイティブアプリ風のボトムナビゲーションを実装する場合の構想:
        <nav>
          <StyledNavLink to="/"><FaHome /> Home</StyledNavLink>
          <StyledNavLink to="/history"><FaHistory /> History</StyledNavLink>
          // ...
        </nav>
      */}
    </FooterWrapper>
  );
};

export default Footer;
// ファイル末尾に改行を保証します
