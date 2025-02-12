import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import suggestionsReducer from './suggestionsSlice';
import uiReducer from './uiSlice';
import { rootSaga } from './sagas';

export const createStore = () => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      suggestions: suggestionsReducer,
      ui         : uiReducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware)
  });

  sagaMiddleware.run(rootSaga);

  return store;
};
