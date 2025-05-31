import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap');

  /* Basic CSS Reset */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px; /* Base font size */
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Roboto', 'Noto Sans JP', sans-serif;
    font-weight: 400;
    line-height: 1.6;
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: background-color 0.25s linear, color 0.25s linear;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 700; // Bolder headings
    color: ${({ theme }) => theme.primary}; // Use primary color for headings by default
    margin-bottom: 0.75em;
  }

  h1 { font-size: 2.25rem; line-height: 1.2; }
  h2 { font-size: 1.75rem; line-height: 1.25; }
  h3 { font-size: 1.5rem; line-height: 1.3; }
  h4 { font-size: 1.25rem; line-height: 1.35; }


  p {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text};
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.primary};
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.button.primaryHoverBg}; // Darken primary on hover for links
    }
  }

  ul {
    list-style: none;
  }

  ol { // Keep ordered list styling if needed
    padding-left: 20px;
  }

  button {
    font-family: 'Roboto', 'Noto Sans JP', sans-serif;
    cursor: pointer;
    border: none;
    border-radius: 4px; // Default border radius for buttons
    padding: 0.6em 1.2em; // Default padding
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    // Default button styling (can be overridden by specific StyledButton components)
    // background-color: ${({ theme }) => theme.button.primaryBg};
    // color: ${({ theme }) => theme.button.primaryText};

    // &:hover {
    //   background-color: ${({ theme }) => theme.button.primaryHoverBg};
    // }
    // &:disabled {
    //   background-color: ${({ theme }) => theme.button.disabledBg};
    //   color: ${({ theme }) => theme.button.disabledText};
    //   cursor: not-allowed;
    // }
  }

  input, select, textarea {
    font-family: 'Roboto', 'Noto Sans JP', sans-serif;
    font-size: 1rem;
    padding: 0.5em 0.75em;
    border: 1px solid ${({ theme }) => theme.input.border};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.input.background};
    color: ${({ theme }) => theme.input.text};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.input.focusBorder};
      box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.primary}40; // Focus glow
    }
    &::placeholder {
      color: ${({ theme }) => theme.input.placeholder};
    }
  }

  // Utility classes (optional, but can be handy)
  .text-center { text-align: center; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 1rem; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 1rem; }

`;

export default GlobalStyle;
