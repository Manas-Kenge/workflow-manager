import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import type { WorkflowReduxState } from '../reducers/workflow';
import type { WorkflowState } from '../reducers/workflow';
import type { StateReduxState } from '../reducers/state';
import type { TransitionReduxState } from '../reducers/transition';

export type UpdateStatePayload = Partial<Omit<WorkflowState, 'id'>> & {
  is_initial_state?: boolean;
  states_with_this_transition?: string[];
};

export interface RootState {
  workflow: WorkflowReduxState;
  state: StateReduxState;
  transition: TransitionReduxState;
}

export type AppDispatch = any;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export enum HistoryAction {
  AddNode = 'addNode',
  RemoveNode = 'removeNode',
  AddEdge = 'addEdge',
  RemoveEdge = 'removeEdge',
}
