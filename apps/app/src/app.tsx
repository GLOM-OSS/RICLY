import {
    RiclyThemeProvider
} from '@ricly/theme';
import { useRoutes } from 'react-router';
import { routes } from './routes';

export function App() {
  const routing = useRoutes(routes);
  return <RiclyThemeProvider>{routing}</RiclyThemeProvider>;
}

export default App;
