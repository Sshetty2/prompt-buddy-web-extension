import { configureStore, Reducer } from '@reduxjs/toolkit';
import platformReducer, {
  updateShortcuts,
  selectShortcuts
} from '../../store/platformSlice';
import { PlatformState } from '../../store/types';

describe('Platform Shortcuts', () => {
  const setupStore = (preloadedState?: Partial<PlatformState>) => configureStore({
    reducer       : { platform: platformReducer as Reducer<PlatformState> },
    preloadedState: preloadedState ? { platform: preloadedState as PlatformState } : undefined
  });

  const initialShortcuts = {
    enabled : true,
    bindings: {
      togglePopover: ['Control', 'Space'],
      applyChanges : ['Control', 'Enter']
    }
  };

  describe('Shortcut Management', () => {
    it('should initialize with default shortcuts', () => {
      const store = setupStore();
      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(initialShortcuts);
    });

    it('should update shortcut enabled state', () => {
      const store = setupStore();

      store.dispatch(updateShortcuts({ enabled: false }));

      const state = store.getState();
      expect(selectShortcuts(state).enabled).toBe(false);
      expect(selectShortcuts(state).bindings).toEqual(initialShortcuts.bindings);
    });

    it('should update shortcut bindings', () => {
      const store = setupStore();
      const newBindings = { togglePopover: ['Alt', 'Space'] };

      store.dispatch(updateShortcuts({ bindings: newBindings }));

      const state = store.getState();
      expect(selectShortcuts(state).bindings.togglePopover).toEqual(['Alt', 'Space']);
      expect(selectShortcuts(state).bindings.applyChanges).toEqual(['Control', 'Enter']);
    });

    it('should handle multiple shortcut updates', () => {
      const store = setupStore();

      // First update
      store.dispatch(updateShortcuts({
        enabled : false,
        bindings: { togglePopover: ['Alt', 'Space'] }
      }));

      // Second update
      store.dispatch(updateShortcuts({ bindings: { applyChanges: ['Alt', 'Enter'] } }));

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual({
        enabled : false,
        bindings: {
          togglePopover: ['Alt', 'Space'],
          applyChanges : ['Alt', 'Enter']
        }
      });
    });
  });

  describe('Shortcut Validation', () => {
    it('should maintain existing bindings when updating partial shortcuts', () => {
      const store = setupStore();
      const partialUpdate = { bindings: { togglePopover: ['Alt', 'Space'] } };

      store.dispatch(updateShortcuts(partialUpdate));

      const state = store.getState();
      expect(selectShortcuts(state).bindings).toEqual({
        togglePopover: ['Alt', 'Space'],
        applyChanges : ['Control', 'Enter']
      });
    });

    it('should handle empty binding arrays', () => {
      const store = setupStore();
      const emptyBindings = {
        bindings: {
          togglePopover: [],
          applyChanges : []
        }
      };

      store.dispatch(updateShortcuts(emptyBindings));

      const state = store.getState();
      expect(selectShortcuts(state).bindings).toEqual({
        togglePopover: [],
        applyChanges : []
      });
    });

    it('should handle undefined shortcut properties', () => {
      const store = setupStore();

      // @ts-expect-error Testing invalid input
      store.dispatch(updateShortcuts({ bindings: { invalidBinding: ['Alt'] } }));

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(initialShortcuts);
    });
  });

  describe('Platform-Specific Shortcuts', () => {
    it('should handle macOS command key equivalent', () => {
      const store = setupStore();
      const macBindings = {
        bindings: {
          togglePopover: ['Command', 'Space'],
          applyChanges : ['Command', 'Enter']
        }
      };

      store.dispatch(updateShortcuts(macBindings));

      const state = store.getState();
      expect(selectShortcuts(state).bindings).toEqual(macBindings.bindings);
    });

    it('should handle multiple modifier keys', () => {
      const store = setupStore();
      const complexBindings = {
        bindings: {
          togglePopover: ['Control', 'Shift', 'Space'],
          applyChanges : ['Control', 'Alt', 'Enter']
        }
      };

      store.dispatch(updateShortcuts(complexBindings));

      const state = store.getState();
      expect(selectShortcuts(state).bindings).toEqual(complexBindings.bindings);
    });
  });

  describe('Shortcut State Persistence', () => {
    it('should maintain shortcut state across store updates', () => {
      const initialState: PlatformState = {
        config: {
          current        : null,
          isInitialized  : false,
          lastInitAttempt: 0
        },
        input: {
          elementSelector: '',
          lastUpdate     : 0
        },
        shortcuts: {
          enabled : false,
          bindings: {
            togglePopover: ['Alt', 'Space'],
            applyChanges : ['Alt', 'Enter']
          }
        }
      };

      const store = setupStore(initialState);

      // Update config without touching shortcuts
      store.dispatch({
        type   : 'platform/updateConfig',
        payload: { someConfig: 'value' }
      });

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(initialState.shortcuts);
    });

    it('should handle shortcut updates with existing state', () => {
      const initialState: PlatformState = {
        config: {
          current        : null,
          isInitialized  : false,
          lastInitAttempt: 0
        },
        input: {
          elementSelector: '',
          lastUpdate     : 0
        },
        shortcuts: {
          enabled : false,
          bindings: {
            togglePopover: ['Alt', 'Space'],
            applyChanges : ['Alt', 'Enter']
          }
        }
      };

      const store = setupStore(initialState);

      // Update only togglePopover binding
      store.dispatch(updateShortcuts({ bindings: { togglePopover: ['Control', 'Space'] } }));

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual({
        enabled : false,
        bindings: {
          togglePopover: ['Control', 'Space'],
          applyChanges : ['Alt', 'Enter']
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid shortcut updates', () => {
      const store = setupStore();
      const updates = [
        { enabled: false },
        { bindings: { togglePopover: ['Alt', 'Space'] } },
        { enabled: true },
        { bindings: { applyChanges: ['Shift', 'Enter'] } }
      ];

      // Dispatch updates in quick succession
      updates.forEach(update => {
        store.dispatch(updateShortcuts(update));
      });

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual({
        enabled : true,
        bindings: {
          togglePopover: ['Alt', 'Space'],
          applyChanges : ['Shift', 'Enter']
        }
      });
    });

    it('should handle invalid shortcut updates gracefully', () => {
      const store = setupStore();

      // @ts-expect-error Testing invalid input
      store.dispatch(updateShortcuts(null));

      // @ts-expect-error Testing invalid input
      store.dispatch(updateShortcuts(undefined));

      // @ts-expect-error Testing invalid input
      store.dispatch(updateShortcuts({ bindings: null }));

      const state = store.getState();
      expect(selectShortcuts(state)).toEqual(initialShortcuts);
    });
  });
});
