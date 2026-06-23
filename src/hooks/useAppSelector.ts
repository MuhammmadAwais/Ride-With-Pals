import { useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@/app/store';

/** Typed Redux selector hook — provides full IntelliSense on state shape. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
