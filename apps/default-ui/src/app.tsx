import { RiclyThemeProvider } from '@ricly/theme';
import { useRoutes } from 'react-router';
import UserContextProvider from './contexts/UserContextProvider';
import { routes } from './routes';

export function App() {
  const routing = useRoutes(routes);
  return (
    <RiclyThemeProvider>
      <UserContextProvider>{routing}</UserContextProvider>
    </RiclyThemeProvider>
  );
}

export default App;
