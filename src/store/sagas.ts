import { call, put, takeLatest, select } from 'typed-redux-saga';
import { SagaIterator } from 'redux-saga';
import {
  fetchSuggestions,
  setSuggestions,
  regenerateSuggestions,
  updateStatus
} from './suggestionsSlice';
import {
  setIsLoading,
  setError,
  setIsStale,
  setRewrittenPrompt
} from './uiSlice';
import { RootState, PromptSuggestionsData } from './types';

export const fetchFromAPI = async (endpoint: string, body: unknown) => {
  const response = await fetch(
    `${import.meta.env.VITE_ENDPOINT_URL}${endpoint}`,
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body)
    }
  );

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
};

export function* fetchSuggestionsSaga (
  { payload }: ReturnType<typeof fetchSuggestions>
): SagaIterator {
  const isStale = yield* select((state: RootState) => state.ui.isStale);

  if (!isStale) {
    return;
  }

  try {
    yield* put(setIsLoading(true));
    yield* put(setError(null));
    yield* put(setRewrittenPrompt(null));
    yield* put(updateStatus({
      isStale   : true,
      error     : null,
      retryCount: 0
    }));

    const data: PromptSuggestionsData = yield* call(fetchFromAPI, '/get-prompt-suggestions', { prompt: payload });

    yield* put(setSuggestions(data));
    yield* put(setIsStale(false));
    yield* put(updateStatus({
      isStale  : false,
      lastFetch: Date.now()
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate suggestions';
    yield* put(setError(message));
    yield* put(updateStatus({
      error     : message,
      retryCount: (yield* select((state: RootState) => state.suggestions.status.retryCount)) + 1
    }));
  } finally {
    yield* put(setIsLoading(false));
  }
}

export function* regenerateSuggestionsSaga (): SagaIterator {
  try {
    const originalPrompt = yield* select((state: RootState) => state.ui.originalPrompt);

    const categories = yield* select((state: RootState) => state.suggestions.categories);

    // Get selected suggestions from categories
    const selectedSuggestions = Object.entries(categories)
      .reduce((acc, [category, data]) => {
        if (data.selected.length > 0) {
          acc[category] = data.selected;
        }

        return acc;
      }, {} as Record<string, string[]>);

    yield* put(setIsLoading(true));
    yield* put(setError(null));
    yield* put(updateStatus({
      isStale   : true,
      error     : null,
      retryCount: 0
    }));

    const data: PromptSuggestionsData = yield* call(fetchFromAPI, '/get-prompt-suggestions', {
      prompt: originalPrompt,
      selectedSuggestions
    });

    yield* put(setSuggestions(data));
    yield* put(setIsStale(false));
    yield* put(updateStatus({
      isStale  : false,
      lastFetch: Date.now()
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to regenerate suggestions';
    yield* put(setError(message));
    yield* put(updateStatus({
      error     : message,
      retryCount: (yield* select((state: RootState) => state.suggestions.status.retryCount)) + 1
    }));
  } finally {
    yield* put(setIsLoading(false));
  }
}

export function* rootSaga (): SagaIterator {
  yield* takeLatest(fetchSuggestions.type, fetchSuggestionsSaga);
  yield* takeLatest(regenerateSuggestions.type, regenerateSuggestionsSaga);
}
