// Color utility functions for consistent theming
export const getColorVar = (colorName: string): string => `var(--color-${colorName})`;

// Common color combinations for different UI elements
export const colorStyles = {
  // Panel backgrounds
  panel: {
    backgroundColor: getColorVar('panel'),
    borderColor: getColorVar('panel-border'),
  },
  
  // Input fields
  input: {
    backgroundColor: getColorVar('background-alt'),
    borderColor: getColorVar('panel-border'),
    color: getColorVar('text-main'),
    '--tw-ring-color': getColorVar('primary'),
  },
  
  // Primary button
  primaryButton: (isDisabled = false) => ({
    backgroundColor: isDisabled ? getColorVar('text-muted') : getColorVar('primary'),
    '--tw-ring-color': getColorVar('primary'),
    '--tw-ring-offset-color': getColorVar('panel'),
  }),
  
  // Primary button hover
  primaryButtonHover: {
    backgroundColor: getColorVar('primary-hover'),
  },
  
  // Text colors
  textMain: { color: getColorVar('text-main') },
  textSecondary: { color: getColorVar('text-secondary') },
  textMuted: { color: getColorVar('text-muted') },
  
  // Icon colors
  iconMuted: { color: getColorVar('text-muted') },
  iconSecondary: { color: getColorVar('text-secondary') },
  
  // Background
  background: { backgroundColor: getColorVar('background') },
  backgroundAlt: { backgroundColor: getColorVar('background-alt') },
  
  // Interactive elements
  hover: { backgroundColor: getColorVar('hover') },
  divider: { borderColor: getColorVar('divider') },
  
  // Status colors
  unread: { color: getColorVar('unread') },
  primary: { color: getColorVar('primary') },
  primaryHover: { color: getColorVar('primary-hover') },
};

// Helper function for interactive color changes
export const createInteractiveStyle = (
  baseColor: string, 
  hoverColor: string
) => ({
  style: { color: getColorVar(baseColor) },
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = getColorVar(hoverColor);
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = getColorVar(baseColor);
  },
});

// Helper for button hover effects
export const createButtonHoverStyle = (
  baseColor: string,
  hoverColor: string,
  isDisabled = false
) => ({
  style: {
    backgroundColor: isDisabled ? getColorVar('text-muted') : getColorVar(baseColor),
  },
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.backgroundColor = getColorVar(hoverColor);
    }
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.backgroundColor = getColorVar(baseColor);
    }
  },
});