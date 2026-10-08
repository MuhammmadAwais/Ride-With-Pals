import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Locale, locales } from '@/lib/i18n';

interface LanguageState {
  locale: Locale;
}

const getBrowserLocale = (): Locale => {
  const supported = Object.keys(locales) as Locale[];
  const browserLang = navigator.language.split('-')[0] as Locale;
  return supported.includes(browserLang) ? browserLang : 'en';
};

const initialState: LanguageState = {
  locale: (localStorage.getItem('rwp-locale') as Locale) || getBrowserLocale(),
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
      localStorage.setItem('rwp-locale', action.payload);
    },
  },
});

export const { setLocale } = languageSlice.actions;
export default languageSlice.reducer;
