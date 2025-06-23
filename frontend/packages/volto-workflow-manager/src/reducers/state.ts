import type { AnyAction } from 'redux';
import { GET_STATE, ADD_STATE, UPDATE_STATE, DELETE_STATE } from '../constants';

// Represents the detailed data for a single state from the API
export interface StateDetails {
  state: {
    id: string;
    title: string;
    description: string;
    transitions: string[];
    permission_roles: Record<string, string[]>;
    group_roles: Record<string, string[]>;
  };
  is_initial_state: boolean;
  available_transitions: { id: string; title: string }[];
  available_states: { id: string; title: string }[];
  managed_permissions: { perm: string; name: string }[];
  available_roles: string[];
  groups: { id: string; title: string }[];
}

// Define the shape of this reducer's state slice
export interface StateReduxState {
  get: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: StateDetails | null;
  };
  add: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
  };
  update: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
  };
  delete: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
  };
}

const initialState: StateReduxState = {
  get: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  add: {
    loading: false,
    loaded: false,
    error: null,
  },
  update: {
    loading: false,
    loaded: false,
    error: null,
  },
  delete: {
    loading: false,
    loaded: false,
    error: null,
  },
};

export default function state(
  state: StateReduxState = initialState,
  action: AnyAction,
): StateReduxState {
  switch (action.type) {
    // GET STATE
    case `${GET_STATE}_PENDING`:
      return { ...state, get: { ...initialState.get, loading: true } };
    case `${GET_STATE}_SUCCESS`:
      return {
        ...state,
        get: { ...initialState.get, loaded: true, data: action.result },
      };
    case `${GET_STATE}_FAIL`:
      return { ...state, get: { ...initialState.get, error: action.error } };

    // ADD STATE
    case `${ADD_STATE}_PENDING`:
      return { ...state, add: { ...initialState.add, loading: true } };
    case `${ADD_STATE}_SUCCESS`:
      return { ...state, add: { ...initialState.add, loaded: true } };
    case `${ADD_STATE}_FAIL`:
      return { ...state, add: { ...initialState.add, error: action.error } };

    // UPDATE STATE
    case `${UPDATE_STATE}_PENDING`:
      return { ...state, update: { ...initialState.update, loading: true } };
    case `${UPDATE_STATE}_SUCCESS`:
      return { ...state, update: { ...initialState.update, loaded: true } };
    case `${UPDATE_STATE}_FAIL`:
      return {
        ...state,
        update: { ...initialState.update, error: action.error },
      };

    // DELETE STATE
    case `${DELETE_STATE}_PENDING`:
      return { ...state, delete: { ...initialState.delete, loading: true } };
    case `${DELETE_STATE}_SUCCESS`:
      return { ...state, delete: { ...initialState.delete, loaded: true } };
    case `${DELETE_STATE}_FAIL`:
      return {
        ...state,
        delete: { ...initialState.delete, error: action.error },
      };

    default:
      return state;
  }
}
