// --- START OF FILE workflowSlice.ts ---

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  GET_WORKFLOWS,
  ADD_WORKFLOW,
  DELETE_WORKFLOW,
  RENAME_WORKFLOW,
  VALIDATE_WORKFLOW,
  UPDATE_WORKFLOW_STATE, // Ensure this is imported
} from '../../actions/workflow';
import { type RootState } from '../../types';

export interface WorkflowTransition {
  id: string;
  title: string;
  description: string;
  new_state: string;
}

export interface WorkflowState {
  id: string;
  title: string;
  transitions: string[];
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  initial_state: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  assigned_types: string[];
}

export interface ValidationErrors {
  state_errors: { id: string; title: string; error: string }[];
  transition_errors: { id: string; title: string; error: string }[];
  initial_state_error: boolean;
}

export interface WorkflowSliceState {
  workflows: Workflow[];
  loading: boolean;
  error: any | null;
  validationResult: ValidationErrors | null;
  validationLoading: boolean;
  operationLoading: boolean;
}

const initialState: WorkflowSliceState = {
  workflows: [],
  loading: false,
  error: null,
  validationResult: null,
  validationLoading: false,
  operationLoading: false,
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    // Clear validation result
    clearValidationResult: (state) => {
      state.validationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Get Workflows ---
      .addCase(`${GET_WORKFLOWS}_PENDING` as any, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        `${GET_WORKFLOWS}_SUCCESS` as any,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.workflows = action.payload?.workflows || [];
        },
      )
      .addCase(
        `${GET_WORKFLOWS}_FAIL` as any,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      )

      // --- Add Workflow ---
      .addCase(`${ADD_WORKFLOW}_PENDING` as any, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(`${ADD_WORKFLOW}_SUCCESS` as any, (state) => {
        state.operationLoading = false;
      })
      .addCase(
        `${ADD_WORKFLOW}_FAIL` as any,
        (state, action: PayloadAction<any>) => {
          state.operationLoading = false;
          state.error = action.payload;
        },
      )

      // --- Delete Workflow ---
      .addCase(`${DELETE_WORKFLOW}_PENDING` as any, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(`${DELETE_WORKFLOW}_SUCCESS` as any, (state) => {
        state.operationLoading = false;
      })
      .addCase(
        `${DELETE_WORKFLOW}_FAIL` as any,
        (state, action: PayloadAction<any>) => {
          state.operationLoading = false;
          state.error = action.payload;
        },
      )

      // --- Rename Workflow ---
      .addCase(`${RENAME_WORKFLOW}_PENDING` as any, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(`${RENAME_WORKFLOW}_SUCCESS` as any, (state) => {
        state.operationLoading = false;
      })
      .addCase(
        `${RENAME_WORKFLOW}_FAIL` as any,
        (state, action: PayloadAction<any>) => {
          state.operationLoading = false;
          state.error = action.payload;
        },
      )

      // --- Validate Workflow ---
      .addCase(`${VALIDATE_WORKFLOW}_PENDING` as any, (state) => {
        state.validationLoading = true;
        state.error = null;
        state.validationResult = null; // Clear previous results
      })
      .addCase(
        `${VALIDATE_WORKFLOW}_SUCCESS` as any,
        (state, action: PayloadAction<any>) => {
          state.validationLoading = false;
          state.validationResult = action.payload;
        },
      )
      .addCase(
        `${VALIDATE_WORKFLOW}_FAIL` as any,
        (state, action: PayloadAction<any>) => {
          state.validationLoading = false;
          state.error = action.payload;
        },
      )

      // --- [ADDED] Update Workflow State ---
      .addCase(`${UPDATE_WORKFLOW_STATE}_PENDING` as any, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(
        `${UPDATE_WORKFLOW_STATE}_SUCCESS` as any,
        (state, action: PayloadAction<Workflow>) => {
          state.operationLoading = false;
          const updatedWorkflow = action.payload;
          // Find and replace the entire workflow object in the state
          const index = state.workflows.findIndex(
            (wf) => wf.id === updatedWorkflow.id,
          );
          if (index !== -1) {
            state.workflows[index] = updatedWorkflow;
          }
        },
      )
      .addCase(
        `${UPDATE_WORKFLOW_STATE}_FAIL` as any,
        (state, action: PayloadAction<any>) => {
          state.operationLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearError, clearValidationResult } = workflowSlice.actions;

// Selectors
export const selectAllWorkflows = (state: RootState) =>
  state.workflow.workflows;
export const selectWorkflowsLoading = (state: RootState) =>
  state.workflow.loading;
export const selectWorkflowsError = (state: RootState) => state.workflow.error;
export const selectOperationLoading = (state: RootState) =>
  state.workflow.operationLoading;
export const selectValidationResult = (state: RootState) =>
  state.workflow.validationResult;
export const selectValidationLoading = (state: RootState) =>
  state.workflow.validationLoading;

export default workflowSlice.reducer;
