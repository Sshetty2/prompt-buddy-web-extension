import { ComponentType } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from '../store/sagas';
import suggestionsReducer from '../store/suggestionsSlice';
import uiReducer from '../store/uiSlice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    suggestions: suggestionsReducer,
    ui         : uiReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware)
});

sagaMiddleware.run(rootSaga);

export function withReduxStore<P extends object> (
  WrappedComponent: ComponentType<P>
) {
  return function WithReduxStoreWrapper (props: P) {
    return (
      <Provider store={store}>
        <WrappedComponent {...props} />
      </Provider>
    );
  };
}
