// Ergonomic and WCAG-inspired color palettes

export const lightTheme = {
  body: '#F8F9FA', // Off-white, very light grey
  text: '#212529', // Dark grey, almost black for high contrast
  primary: '#007BFF', // Vibrant blue for primary actions and highlights
  secondary: '#6C757D', // Muted grey for secondary text or elements
  accent: '#17A2B8', // Teal for accents or tertiary actions (info, success messages)

  headerBg: '#FFFFFF', // White for header
  footerBg: '#FFFFFF', // White for footer
  sidebarBg: '#E9ECEF', // Light grey for sidebar/cards

  // UI elements
  button: {
    primaryBg: '#007BFF',
    primaryText: '#FFFFFF',
    primaryHoverBg: '#0056b3',
    secondaryBg: '#6C757D',
    secondaryText: '#FFFFFF',
    secondaryHoverBg: '#545b62',
    disabledBg: '#CED4DA',
    disabledText: '#6C757D',
  },
  input: {
    background: '#FFFFFF',
    text: '#495057',
    border: '#CED4DA',
    focusBorder: '#80BDFF',
    placeholder: '#6C757D',
  },
  card: {
    background: '#FFFFFF',
    border: '#DEE2E6',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  border: '#DEE2E6', // General border color
  error: '#DC3545', // Red for error messages/icons
  success: '#28A745', // Green for success messages/icons
  warning: '#FFC107', // Yellow for warnings
};

export const darkTheme = {
  body: '#1A1A2E', // Deep dark blue/purple
  text: '#EAEAEA', // Light grey for good readability
  primary: '#5E88FF', // Lighter, vibrant blue for dark mode
  secondary: '#A9B4C2', // Lighter grey for secondary text
  accent: '#3DCCC7', // Teal accent for dark mode

  headerBg: '#161625', // Slightly lighter dark for header
  footerBg: '#161625', // Slightly lighter dark for footer
  sidebarBg: '#202036', // Darker element background

  // UI elements
  button: {
    primaryBg: '#5E88FF',
    primaryText: '#FFFFFF',
    primaryHoverBg: '#4A6ECC',
    secondaryBg: '#6C757D', // Can remain similar or be adjusted
    secondaryText: '#FFFFFF',
    secondaryHoverBg: '#545b62',
    disabledBg: '#495057',
    disabledText: '#6C757D',
  },
  input: {
    background: '#2C2C44', // Darker input background
    text: '#EAEAEA',
    border: '#495057', // Muted border
    focusBorder: '#5E88FF',
    placeholder: '#A9B4C2',
  },
  card: {
    background: '#202036',
    border: '#343A40',
    shadow: 'rgba(0, 0, 0, 0.15)',
  },
  border: '#343A40', // Darker general border color
  error: '#F87171', // Lighter red for dark mode errors
  success: '#4ADE80', // Lighter green
  warning: '#FBBF24', // Lighter yellow
};
