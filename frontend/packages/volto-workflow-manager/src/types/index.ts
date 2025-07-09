import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import type { WorkflowReduxState } from '../reducers/workflow';
import type { StateReduxState } from '../reducers/state';
import type { WorkflowState } from '../reducers/workflow';

export type UpdateStatePayload = Partial<Omit<WorkflowState, 'id'>> & {
  is_initial_state?: boolean;
  // The frontend will send the complete list of states that should have this transition
  states_with_this_transition?: string[];
};

// Define your root state interface to include both slices
export interface RootState {
  workflow: WorkflowReduxState;
  state: StateReduxState;
}

export type AppDispatch = any; // Replace with your actual dispatch type

// Create typed versions of useSelector and useDispatch hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export enum HistoryAction {
  AddNode = 'addNode',
  RemoveNode = 'removeNode',
  AddEdge = 'addEdge',
  RemoveEdge = 'removeEdge',
}
