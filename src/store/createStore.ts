import { configureStore, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import suggestionsReducer from './suggestionsSlice';
import uiReducer from './uiSlice';
import platformReducer, { platformMiddleware } from './platformSlice';
import { rootSaga } from './sagas';

const rootReducer = combineReducers({
  suggestions: suggestionsReducer,
  ui         : uiReducer,
  platform   : platformReducer
});

export const createStore = () => {
  const sagaMiddleware = createSagaMiddleware();

  const ignoredActions = [
    'platform/initializePlatform',
    'platform/cleanupPlatform',

    'suggestions/updateNewState',
    'suggestions/setSelectedSuggestion',
    'suggestions/updateSuggestionStatus'
  ];

  const ignoredPaths = [
    'platform.input.element',
    'platform.input.observer',

    'suggestions.new.categories.*.lastUpdated',
    'suggestions.new.status.lastFetch'
  ];

  const store = configureStore({
    reducer   : rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware({
      serializableCheck: {
        ignoredActions,
        ignoredPaths
      },

      immutableCheck: import.meta.env.DEV,
      thunk         : true
    })
      .concat(sagaMiddleware)
      .concat(platformMiddleware),

    devTools: import.meta.env.DEV
  });

  sagaMiddleware.run(rootSaga);

  return store;
};

type RootReducer = typeof rootReducer;

export type RootState = ReturnType<RootReducer>;

export type AppStore = ReturnType<typeof createStore>;

export type AppDispatch = AppStore['dispatch'];
