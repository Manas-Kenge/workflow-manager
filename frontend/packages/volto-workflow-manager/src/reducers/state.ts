import type { AnyAction } from 'redux';
import {
  ADD_STATE,
  UPDATE_STATE,
  DELETE_STATE,
  LIST_STATES,
} from '../constants';
import type { StateReduxState } from '../types/state';

const initialState: StateReduxState = {
  get: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  list: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  add: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  update: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  delete: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
};

export default function state(
  state: StateReduxState = initialState,
  action: AnyAction,
): StateReduxState {
  switch (action.type) {
    case `${LIST_STATES}_PENDING`:
      return { ...state, list: { ...initialState.list, loading: true } };
    case `${LIST_STATES}_SUCCESS`:
      return {
        ...state,
        list: { ...initialState.list, loaded: true, data: action.result },
      };
    case `${LIST_STATES}_FAIL`:
      return { ...state, list: { ...initialState.list, error: action.error } };

    case `${ADD_STATE}_PENDING`:
      return { ...state, add: { ...initialState.add, loading: true } };
    case `${ADD_STATE}_SUCCESS`:
      return {
        ...state,
        add: { ...initialState.add, loaded: true, data: action.result },
        list: state.list.data
          ? {
              ...state.list,
              data: {
                ...state.list.data,
                states: [...state.list.data.states, action.result.state],
              },
            }
          : state.list,
      };
    case `${ADD_STATE}_FAIL`:
      return { ...state, add: { ...initialState.add, error: action.error } };

    case `${UPDATE_STATE}_PENDING`:
      return { ...state, update: { ...initialState.update, loading: true } };
    case `${UPDATE_STATE}_SUCCESS`:
      return {
        ...state,
        update: { ...initialState.update, loaded: true, data: action.result },
        get:
          state.get.data?.id === action.result.state.id
            ? {
                ...state.get,
                data: action.result.state,
              }
            : state.get,
        list: state.list.data
          ? {
              ...state.list,
              data: {
                ...state.list.data,
                states: state.list.data.states.map((s) =>
                  s.id === action.result.state.id ? action.result.state : s,
                ),
              },
            }
          : state.list,
      };
    case `${UPDATE_STATE}_FAIL`:
      return {
        ...state,
        update: { ...initialState.update, error: action.error },
      };

    case `${DELETE_STATE}_PENDING`:
      return { ...state, delete: { ...initialState.delete, loading: true } };
    case `${DELETE_STATE}_SUCCESS`:
      return {
        ...state,
        delete: { ...initialState.delete, loaded: true, data: action.result },
        get:
          state.get.data?.id === action.meta?.stateId
            ? {
                ...state.get,
                data: null,
              }
            : state.get,
        list: state.list.data
          ? {
              ...state.list,
              data: {
                ...state.list.data,
                states: state.list.data.states.filter(
                  (s) => s.id !== action.meta?.stateId,
                ),
              },
            }
          : state.list,
      };
    case `${DELETE_STATE}_FAIL`:
      return {
        ...state,
        delete: { ...initialState.delete, error: action.error },
      };

    default:
      return state;
  }
}
