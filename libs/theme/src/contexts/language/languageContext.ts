import { createContext } from "react";

import {Language} from './language.interface'

const LanguageContext = createContext<Language>({
  activeLanguage: "En",
  languageDispatch: () => null,
});

export default LanguageContext;
