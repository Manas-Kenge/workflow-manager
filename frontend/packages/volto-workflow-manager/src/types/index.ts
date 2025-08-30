import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import type { WorkflowReduxState } from './workflow';
import type { StateReduxState } from './state';
import type { TransitionReduxState } from './transition';

export interface GlobalRootState {
  workflow: WorkflowReduxState;
  state: StateReduxState;
  transition: TransitionReduxState;
}

export type AppDispatch = any;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<GlobalRootState> =
  useSelector;

export enum HistoryAction {
  AddNode = 'addNode',
  RemoveNode = 'removeNode',
  AddEdge = 'addEdge',
  RemoveEdge = 'removeEdge',
}
