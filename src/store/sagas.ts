import { call, put, takeLatest, select } from 'typed-redux-saga';
import { SagaIterator } from 'redux-saga';
import { fetchSuggestions, setSuggestions, regenerateSuggestions } from './suggestionsSlice';
import { setIsLoading, setError, setIsStale, setRewrittenPrompt } from './uiSlice';
import { RootState } from './types';

function* fetchSuggestionsSaga (
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

    const response = yield* call(
      fetch,
      `${import.meta.env.VITE_ENDPOINT_URL}/get-prompt-suggestions`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ prompt: payload })
      }
    );

    const data = yield* call([response, 'json']);

    yield* put(setSuggestions(data));
    yield* put(setIsStale(true));
  } catch (error) {
    if (error instanceof Error) {
      yield* put(setError(`${error.name}; ${error.message}`));
    } else {
      yield* put(setError('Failed to generate suggestions. Contact support if this persists.'));
    }
  } finally {
    yield* put(setIsLoading(false));
  }
}

function* regenerateSuggestionsSaga (): SagaIterator {
  try {
    const rewrittenPrompt = yield* select((state: RootState) => state.ui.rewrittenPrompt);
    const currentSuggestions = yield* select((state: RootState) => state.suggestions.suggestions);

    yield* put(setIsLoading(true));
    yield* put(setError(null));

    const response = yield* call(
      fetch,
      `${import.meta.env.VITE_ENDPOINT_URL}/get-prompt-suggestions`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          prompt             : rewrittenPrompt,
          selectedSuggestions: currentSuggestions
        })
      }
    );

    const data = yield* call([response, 'json']);

    if (response.status !== 200) {
      if (data.error) {
        yield* put(setError(`status: ${response.status}, error: ${data.error}`));
      } else {
        yield* put(setError(`status: ${response.status}, Failed to generate suggestions`));
      }
    }

    yield* put(setIsStale(true));
    yield* put(setSuggestions(data));
  } catch (error) {
    if (error instanceof Error) {
      yield* put(setError(`${error.name}; ${error.message}`));
    } else {
      yield* put(setError('Failed to generate suggestions. Contact support if this persists.'));
    }
  } finally {
    yield* put(setIsLoading(true));
  }
}

export function* rootSaga (): SagaIterator {
  yield* takeLatest(fetchSuggestions.type, fetchSuggestionsSaga);
  yield* takeLatest(regenerateSuggestions.type, regenerateSuggestionsSaga);
}
