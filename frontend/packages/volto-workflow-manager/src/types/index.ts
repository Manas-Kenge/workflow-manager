import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { WorkflowSliceState } from '../features/workflow/workflowSlice';

// Defines the global state shape for type-safe selectors.
export interface RootState {
  workflow: WorkflowSliceState;
  [key: string]: any;
}

// Defines a dispatch type that understands thunks.
export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;
