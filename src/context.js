import { createContext, useContext } from 'react';

export const I18n = createContext(null);
export const useI18n = () => useContext(I18n);
