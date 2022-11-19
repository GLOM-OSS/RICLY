import { createTheme } from '@mui/material/styles';
import React from 'react';

// thin: 100
// extraLight: 200
// light: 300
// regular: 400
// medium: 500
// semiBold: 600
// bold: 700
// extraBold: 800
// black: 900
// 16px => 1rem

declare module '@mui/material/styles' {
  interface Theme {
    common: {
      lighterPrimary: React.CSSProperties['color'];
      lowerGray: React.CSSProperties['color'];
      white: React.CSSProperties['color'];
      backgroundPrimary: React.CSSProperties['color'];
      CSK200: React.CSSProperties['color'];
      CSK50: React.CSSProperties['color'];
      primaryDark: React.CSSProperties['color'];
    };
  }
  interface ThemeOptions {
    common: {
      lighterPrimary: React.CSSProperties['color'];
      lowerGray: React.CSSProperties['color'];
      white: React.CSSProperties['color'];
      backgroundPrimary: React.CSSProperties['color'];
      CSK200: React.CSSProperties['color'];
      CSK50: React.CSSProperties['color'];
      primaryDark: React.CSSProperties['color'];
    };
  }
  interface TypographyVariants {
    h1: React.CSSProperties;
    h2: React.CSSProperties;
    h3: React.CSSProperties;
    h4: React.CSSProperties;
    h5: React.CSSProperties;
    h6: React.CSSProperties;
    body1: React.CSSProperties;
    body2: React.CSSProperties;
    caption: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h1: React.CSSProperties;
    h2: React.CSSProperties;
    h3: React.CSSProperties;
    h4: React.CSSProperties;
    h5: React.CSSProperties;
    h6: React.CSSProperties;
    body1: React.CSSProperties;
    body2: React.CSSProperties;
    caption: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h1: true;
    h2: true;
    h3: true;
    h4: true;
    h5: true;
    h6: true;
    body1: true;
    body2: true;
    caption: true;
  }
}

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false; // removes the `xs` breakpoint
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true; // adds the `mobile` breakpoint
    tablet: true;
    laptop: true;
    desktop: true;
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0B77DB',
    },
    secondary: {
      main: '#9E4CEB',
    },
    error: {
      main: '#DD0303',
    },
    success: {
      main: '#00BA88',
    },
  },
  common: {
    lighterPrimary: '#80C2FF',
    lowerGray: '#F7F7F7',
    white: '#F0F0F0',
    backgroundPrimary: '#E5F3FF',
    CSK200: '#CCCCCC',
    CSK50: '#F2F2F2',
    primaryDark: '#004280',
  },
  typography: {
    fontFamily: ['Raleway', 'Montserrat', 'Roboto', 'serif'].join(','),
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 300,
    },
  },
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 744,
      laptop: 992,
      desktop: 1200,
    },
  },
});

// export default theme;
