import { useReducer, useCallback } from 'react';

const MAX_HISTORY = 20;

const ActionTypes = {
  SET: 'SET',
  UNDO: 'UNDO',
  REDO: 'REDO',
  RESET: 'RESET',
};

function historyReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET: {
      const { newState, actionName } = action.payload;

      // Don't push if state hasn't changed
      if (JSON.stringify(state.present) === JSON.stringify(newState)) {
        return state;
      }

      // Add current state to past, limit to MAX_HISTORY
      const newPast = [...state.past, { state: state.present, actionName }];
      if (newPast.length > MAX_HISTORY) {
        newPast.shift(); // Remove oldest entry
      }

      return {
        past: newPast,
        present: newState,
        future: [], // Clear redo stack on new action
        lastAction: null,
      };
    }

    case ActionTypes.UNDO: {
      if (state.past.length === 0) {
        return state;
      }

      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);

      return {
        past: newPast,
        present: previous.state,
        future: [{ state: state.present, actionName: previous.actionName }, ...state.future],
        lastAction: previous.actionName,
      };
    }

    case ActionTypes.REDO: {
      if (state.future.length === 0) {
        return state;
      }

      const next = state.future[0];
      const newFuture = state.future.slice(1);

      return {
        past: [...state.past, { state: state.present, actionName: next.actionName }],
        present: next.state,
        future: newFuture,
        lastAction: null,
      };
    }

    case ActionTypes.RESET: {
      return {
        past: [],
        present: action.payload,
        future: [],
        lastAction: null,
      };
    }

    default:
      return state;
  }
}

export function useUndoRedo(initialState) {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
    lastAction: null,
  });

  const pushState = useCallback((newState, actionName) => {
    dispatch({
      type: ActionTypes.SET,
      payload: { newState, actionName },
    });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: ActionTypes.UNDO });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: ActionTypes.REDO });
  }, []);

  const reset = useCallback((newState) => {
    dispatch({ type: ActionTypes.RESET, payload: newState });
  }, []);

  return {
    state: history.present,
    pushState,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    lastAction: history.lastAction,
  };
}
