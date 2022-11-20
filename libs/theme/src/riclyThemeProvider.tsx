import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Flip, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LanguageContextProvider, {
  useLanguage,
} from './contexts/language/LanguageContextProvider';
import enMessages from './languages/en-us';
import frMessages from './languages/fr';
import { theme } from './theme';

const TempApp = ({ children }: { children: React.ReactNode }) => {
  const { activeLanguage } = useLanguage();
  const activeMessages = activeLanguage === 'Fr' ? frMessages : enMessages;
  return (
    <IntlProvider
      messages={activeMessages}
      locale={activeLanguage}
      defaultLocale="Fr"
    >
      {children}
    </IntlProvider>
  );
};

export function RiclyThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
        <TempApp>{children}</TempApp>
      </ThemeProvider>
    </LanguageContextProvider>
  );
}

export default RiclyThemeProvider;
