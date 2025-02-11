import { call, put, takeLatest } from 'typed-redux-saga';
import { SagaIterator } from 'redux-saga';
import { fetchSuggestions, setSuggestions } from './suggestionsSlice';
import { setIsLoading, setError, setIsStale } from './uiSlice';
import { select } from 'redux-saga/effects';

function* fetchSuggestionsSaga (
  { payload }: ReturnType<typeof fetchSuggestions>
): SagaIterator {
  const isStale = yield select(state => state.ui.isStale);

  if (!isStale) {
    return;
  }

  try {
    yield* put(setIsLoading(true));
    yield* put(setError(null));

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
      yield* put(setError(error.message));
    }
  } finally {
    yield* put(setIsLoading(false));
  }
}

export function* rootSaga (): SagaIterator {
  yield* takeLatest(fetchSuggestions.type, fetchSuggestionsSaga);
}
