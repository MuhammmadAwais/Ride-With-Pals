import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/store';

/** Typed Redux dispatch hook — use this instead of plain useDispatch(). */
export const useAppDispatch = () => useDispatch<AppDispatch>();
