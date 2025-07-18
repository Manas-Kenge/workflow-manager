import type { AnyAction } from 'redux';
import {
  LIST_TRANSITIONS,
  GET_TRANSITION,
  ADD_TRANSITION,
  UPDATE_TRANSITION,
  DELETE_TRANSITION,
} from '../constants';

export interface Transition {
  id: string;
  title: string;
  description: string;
  new_state_id: string;
  trigger_type: number;
  guard: {
    permissions: string[];
    roles: string[];
    groups: string[];
    expr: string;
  };
}

export interface ListTransitionsResponse {
  workflow_id: string;
  workflow_title: string;
  transitions: Transition[];
}

export interface GetTransitionResponse {
  workflow_id: string;
  transition: Transition;
  states_with_this_transition: string[];
  available_states: { id: string; title: string }[];
  available_transitions: { id: string; title: string }[];
  guard_options: {
    permissions: string[];
    roles: string[];
    groups: { id: string; title: string }[];
  };
}

export interface TransitionActionResponse {
  status: string;
  transition: Transition;
  message: string;
}

export interface DeleteTransitionResponse {
  status: string;
  message: string;
}

export interface TransitionReduxState {
  list: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: ListTransitionsResponse | null;
  };
  get: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: GetTransitionResponse | null;
  };
  add: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: TransitionActionResponse | null;
  };
  update: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: TransitionActionResponse | null;
  };
  delete: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: DeleteTransitionResponse | null;
  };
}

const initialState: TransitionReduxState = {
  list: { loading: false, loaded: false, error: null, data: null },
  get: { loading: false, loaded: false, error: null, data: null },
  add: { loading: false, loaded: false, error: null, data: null },
  update: { loading: false, loaded: false, error: null, data: null },
  delete: { loading: false, loaded: false, error: null, data: null },
};

// --- Reducer Function ---

export default function transition(
  state: TransitionReduxState = initialState,
  action: AnyAction,
): TransitionReduxState {
  switch (action.type) {
    // LIST TRANSITIONS
    case `${LIST_TRANSITIONS}_PENDING`:
      return { ...state, list: { ...initialState.list, loading: true } };
    case `${LIST_TRANSITIONS}_SUCCESS`:
      return {
        ...state,
        list: { ...initialState.list, loaded: true, data: action.result },
      };
    case `${LIST_TRANSITIONS}_FAIL`:
      return { ...state, list: { ...initialState.list, error: action.error } };

    // GET TRANSITION
    case `${GET_TRANSITION}_PENDING`:
      return { ...state, get: { ...initialState.get, loading: true } };
    case `${GET_TRANSITION}_SUCCESS`:
      return {
        ...state,
        get: { ...initialState.get, loaded: true, data: action.result },
      };
    case `${GET_TRANSITION}_FAIL`:
      return { ...state, get: { ...initialState.get, error: action.error } };

    // ADD TRANSITION
    case `${ADD_TRANSITION}_PENDING`:
      return { ...state, add: { ...initialState.add, loading: true } };
    case `${ADD_TRANSITION}_SUCCESS`:
      return {
        ...state,
        add: { ...initialState.add, loaded: true, data: action.result },
        list: state.list.data
          ? {
              ...state.list,
              data: {
                ...state.list.data,
                transitions: [
                  ...state.list.data.transitions,
                  action.result.transition,
                ],
              },
            }
          : state.list,
      };
    case `${ADD_TRANSITION}_FAIL`:
      return { ...state, add: { ...initialState.add, error: action.error } };

    // UPDATE TRANSITION
    case `${UPDATE_TRANSITION}_PENDING`:
      return { ...state, update: { ...initialState.update, loading: true } };
    case `${UPDATE_TRANSITION}_SUCCESS`:
      const updatedTransition = action.result.transition;
      return {
        ...state,
        update: { ...initialState.update, loaded: true, data: action.result },
        get:
          state.get.data?.transition.id === updatedTransition.id
            ? {
                ...state.get,
                data: {
                  ...state.get.data,
                  transition: updatedTransition,
                },
              }
            : state.get,
        list: state.list.data
          ? {
              ...state.list,
              data: {
                ...state.list.data,
                transitions: state.list.data.transitions.map((t) =>
                  t.id === updatedTransition.id ? updatedTransition : t,
                ),
              },
            }
          : state.list,
      };
    case `${UPDATE_TRANSITION}_FAIL`:
      return {
        ...state,
        update: { ...initialState.update, error: action.error },
      };

    // DELETE TRANSITION
    case `${DELETE_TRANSITION}_PENDING`:
      return { ...state, delete: { ...initialState.delete, loading: true } };
    case `${DELETE_TRANSITION}_SUCCESS`:
      const deletedTransitionId = action.meta?.transitionId;
      return {
        ...state,
        delete: { ...initialState.delete, loaded: true, data: action.result },
        get:
          state.get.data?.transition.id === deletedTransitionId
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
                transitions: state.list.data.transitions.filter(
                  (t) => t.id !== deletedTransitionId,
                ),
              },
            }
          : state.list,
      };
    case `${DELETE_TRANSITION}_FAIL`:
      return {
        ...state,
        delete: { ...initialState.delete, error: action.error },
      };

    default:
      return state;
  }
}
