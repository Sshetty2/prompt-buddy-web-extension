import { RootState } from './types';

/**
 * Determines if the current state needs new suggestions.
 * State is considered stale when:
 * 1. The original prompt has changed from what generated the first rewrite
 * 3. No suggestions have been selected yet
 *
 * @param state The UI state portion of the root state
 * @returns true if new suggestions should be generated, false otherwise
 */
export const checkIsStale = (state: RootState['ui']): boolean => {
  const {
    firstRewrite,
    suggestionsSelected
  } = state;

  // If there's no first rewrite yet, we need suggestions
  if (!firstRewrite) {
    return true;
  }

  // If any suggestions have been selected, we need new suggestions
  const hasSelectedSuggestions = Object.values(suggestionsSelected)
    .some(suggestions => suggestions.length > 0);

  return hasSelectedSuggestions;
};
