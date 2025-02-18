/* eslint-disable max-len */
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState } from './types';
import { AppDispatch } from './createStore';

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePlatformState = () => useAppSelector(state => state.platform);

export const useSuggestionState = () => useAppSelector(state => ({
  categories: state.suggestions.categories,
  analysis  : state.suggestions.analysis,
  status    : state.suggestions.status
}));

export const useSelectedSuggestions = () => useAppSelector(state => Object.entries(state.suggestions.categories).reduce((acc, [category, data]) => {
  acc[category] = data.selected;

  return acc;
}, {} as Record<string, string[]>));

export const useAvailableSuggestions = () => useAppSelector(state => Object.entries(state.suggestions.categories).reduce((acc, [category, data]) => {
  acc[category] = data.available;

  return acc;
}, {} as Record<string, string[] | null>));

export const useAnalysis = () => useAppSelector(state => state.suggestions.analysis);

export const useStatus = () => useAppSelector(state => state.suggestions.status);
