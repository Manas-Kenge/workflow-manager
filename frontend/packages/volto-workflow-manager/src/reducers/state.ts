import type { AnyAction } from 'redux';
import {
  ADD_STATE,
  UPDATE_STATE,
  DELETE_STATE,
  LIST_STATES,
} from '../constants';

// Represents a single state object as returned by the backend
export interface StateObject {
  id: string;
  title: string;
  description: string;
  transitions: string[];
  permission_roles: Record<string, string[]>;
  group_roles: Record<string, string[]>;
}

// Response from LIST_STATES endpoint (GET /@states/{workflow_id})
export interface ListStatesResponse {
  workflow_id: string;
  workflow_title: string;
  initial_state: string | null;
  states: StateObject[];
}

// Response from ADD_STATE and UPDATE_STATE endpoints
export interface StateActionResponse {
  status: string;
  state: StateObject;
  message: string;
}

// Response from DELETE_STATE endpoint
export interface DeleteStateResponse {
  status: string;
  message: string;
}

// Define the shape of this reducer's state slice
export interface StateReduxState {
  get: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: StateObject | null;
  };
  list: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: ListStatesResponse | null;
  };
  add: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: StateActionResponse | null;
  };
  update: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: StateActionResponse | null;
  };
  delete: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: DeleteStateResponse | null;
  };
}

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
    // LIST STATES
    case `${LIST_STATES}_PENDING`:
      return { ...state, list: { ...initialState.list, loading: true } };
    case `${LIST_STATES}_SUCCESS`:
      return {
        ...state,
        list: { ...initialState.list, loaded: true, data: action.result },
      };
    case `${LIST_STATES}_FAIL`:
      return { ...state, list: { ...initialState.list, error: action.error } };

    // ADD STATE
    case `${ADD_STATE}_PENDING`:
      return { ...state, add: { ...initialState.add, loading: true } };
    case `${ADD_STATE}_SUCCESS`:
      return {
        ...state,
        add: { ...initialState.add, loaded: true, data: action.result },
        // Optionally update the list data if it exists
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

    // UPDATE STATE
    case `${UPDATE_STATE}_PENDING`:
      return { ...state, update: { ...initialState.update, loading: true } };
    case `${UPDATE_STATE}_SUCCESS`:
      return {
        ...state,
        update: { ...initialState.update, loaded: true, data: action.result },
        // Update the individual state data if it matches
        get:
          state.get.data?.id === action.result.state.id
            ? {
                ...state.get,
                data: action.result.state,
              }
            : state.get,
        // Update the list data if it exists
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

    // DELETE STATE
    case `${DELETE_STATE}_PENDING`:
      return { ...state, delete: { ...initialState.delete, loading: true } };
    case `${DELETE_STATE}_SUCCESS`:
      return {
        ...state,
        delete: { ...initialState.delete, loaded: true, data: action.result },
        // Clear individual state data if it was the deleted state
        get:
          state.get.data?.id === action.meta?.stateId
            ? {
                ...state.get,
                data: null,
              }
            : state.get,
        // Remove from list data if it exists
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
