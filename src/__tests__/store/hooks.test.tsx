import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { FC, PropsWithChildren } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  usePlatformState
} from '../../store/hooks';
import suggestionsReducer from '../../store/suggestionsSlice';
import uiReducer from '../../store/uiSlice';
import platformReducer from '../../store/platformSlice';
import {
  RootState,
  ESuggestionCategory
} from '../../store/types';

// Create root reducer to match actual store configuration
const rootReducer = combineReducers({
  suggestions: suggestionsReducer,
  ui         : uiReducer,
  platform   : platformReducer
});

// Create a mock store for testing
const createMockStore = (preloadedState?: Partial<RootState>) => configureStore({
  reducer: rootReducer,
  preloadedState
});

// Wrapper component for testing hooks
const TestWrapper: FC<PropsWithChildren> = ({ children }) => {
  const store = createMockStore();

  return <Provider store={store}>{children}</Provider>;
};

describe('Store Hooks', () => {
  describe('useAppSelector', () => {
    it('should select state correctly', () => {
      const initialState: Partial<RootState> = {
        ui: {
          isPopoverOpen      : true,
          isStale            : false,
          isLoading          : false,
          error              : null,
          originalPrompt     : '',
          firstRewrite       : '',
          rewrittenPrompt    : null,
          suggestionsSelected: {
            [ESuggestionCategory.tone]       : [],
            [ESuggestionCategory.clarity]    : [],
            [ESuggestionCategory.specificity]: [],
            [ESuggestionCategory.context]    : [],
            [ESuggestionCategory.format]     : []
          },
          promptSuggestionsByCategory: {
            [ESuggestionCategory.tone]       : null,
            [ESuggestionCategory.clarity]    : null,
            [ESuggestionCategory.specificity]: null,
            [ESuggestionCategory.context]    : null,
            [ESuggestionCategory.format]     : null
          },
          platformConfig: null
        }
      };

      const { result } = renderHook(
        () => useAppSelector(state => state.ui.isPopoverOpen),
        {
          wrapper: ({ children }: PropsWithChildren) => (
            <Provider store={createMockStore(initialState)}>
              {children}
            </Provider>
          )
        }
      );

      expect(result.current).toBe(true);
    });
  });

  describe('usePlatformState', () => {
    it('should provide platform configuration', () => {
      const initialState: Partial<RootState> = {
        platform: {
          config: {
            current: {
              selector    : '#test-input',
              useInnerHTML: false
            },
            isInitialized  : true,
            lastInitAttempt: Date.now()
          },
          input: {
            elementSelector: '#test-input',
            lastUpdate     : Date.now()
          },
          shortcuts: {
            enabled : true,
            bindings: {
              togglePopover: ['Ctrl+Space'],
              applyChanges : ['Enter']
            }
          }
        }
      };

      const { result } = renderHook(() => usePlatformState(), {
        wrapper: ({ children }: PropsWithChildren) => (
          <Provider store={createMockStore(initialState)}>
            {children}
          </Provider>
        )
      });

      expect(result.current.config.current).toBeDefined();
      expect(result.current.config.current?.selector).toBe('#test-input');
      expect(result.current.config.current?.useInnerHTML).toBe(false);
      expect(result.current.config.isInitialized).toBe(true);
    });
  });

  describe('useAppDispatch', () => {
    it('should return a dispatch function', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper: TestWrapper });

      expect(typeof result.current).toBe('function');
    });
  });
});
