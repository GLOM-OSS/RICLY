import { ThemeProvider, CssBaseline } from '@mui/material';
import React from 'react';
import { theme } from './theme';
import { Flip, ToastContainer } from 'react-toastify';
import { IntlProvider } from 'react-intl';
import 'react-toastify/dist/ReactToastify.css';
import LanguageContextProvider, {
  useLanguage,
} from './contexts/language/LanguageContextProvider';
import frMessages from './languages/fr';
import enMessages from './languages/en-us';

export function RiclyThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeLanguage } = useLanguage();
  const activeMessages = activeLanguage === 'Fr' ? frMessages : enMessages;

  return (
    <IntlProvider
      messages={activeMessages}
      locale={activeLanguage}
      defaultLocale="Fr"
    >
      <LanguageContextProvider>
        <ThemeProvider theme={theme}>
          <ToastContainer
            position="top-right"
            autoClose={1000}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            transition={Flip}
          />
          <CssBaseline />
          {children}
        </ThemeProvider>
      </LanguageContextProvider>
    </IntlProvider>
  );
}

export default RiclyThemeProvider;
