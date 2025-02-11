import { RootState } from './types';

export const checkIsStale = (state: RootState['ui']) => {
  const { firstRewrite, rewrittenPrompt, suggestionsSelected } = state;

  return !(firstRewrite !== rewrittenPrompt
  || Object.values(suggestionsSelected).some(suggestion => suggestion.length > 0));
};
