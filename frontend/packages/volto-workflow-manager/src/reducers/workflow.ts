import type { AnyAction } from 'redux';

import {
  GET_WORKFLOWS,
  ADD_WORKFLOW,
  DELETE_WORKFLOW,
  UPDATE_WORKFLOW,
  GET_WORKFLOW,
  UPDATE_WORKFLOW_SECURITY,
  ASSIGN_WORKFLOW,
  VALIDATE_WORKFLOW,
  CLEAR_LAST_CREATED_WORKFLOW,
} from '../constants';

export interface Workflow {
  id: string;
  title: string;
  description: string;
  assigned_types: string[];
  initial_state: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface WorkflowState {
  id: string;
  title: string;
  description?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  permissions?: string[];
  transitions?: string[];
}

export interface WorkflowTransition {
  id: string;
  title: string;
  new_state: string;
}

export interface ValidationError {
  id?: string;
  title?: string;
  error: string;
}

export interface ValidationErrors {
  state_errors: ValidationError[];
  transition_errors: ValidationError[];
  initial_state_error: boolean;
}

interface WorkflowReduxState {
  workflow: {
    currentWorkflow: Workflow;
    error: string | null;
    loaded: boolean;
    loading: boolean;
  };
  workflows: {
    error: string | null;
    items: Workflow[];
    loaded: boolean;
    loading: boolean;
  };
  validation: {
    errors: ValidationErrors | null;
    loading: boolean;
  };
  operation: {
    error: string | null;
    loading: boolean;
    result: any;
  };
  lastCreatedWorkflowId: string | null;
}

const initialState: WorkflowReduxState = {
  workflow: {
    currentWorkflow: null,
    error: null,
    loaded: false,
    loading: false,
  },
  workflows: {
    error: null,
    items: [],
    loaded: false,
    loading: false,
  },
  validation: {
    errors: null,
    loading: false,
  },
  operation: {
    error: null,
    loading: false,
    result: null,
  },
  lastCreatedWorkflowId: null,
};

export default function workflow(
  state: WorkflowReduxState = initialState,
  action: AnyAction,
): WorkflowReduxState {
  switch (action.type) {
    // Get Workflows
    case `${GET_WORKFLOWS}_PENDING`:
      return {
        ...state,
        workflows: {
          ...state.workflows,
          error: null,
          loading: true,
          loaded: false,
        },
      };
    case `${GET_WORKFLOWS}_SUCCESS`:
      return {
        ...state,
        workflows: {
          ...state.workflows,
          error: null,
          items: action.result?.workflows || [],
          loaded: true,
          loading: false,
        },
      };
    case `${GET_WORKFLOWS}_FAIL`:
      return {
        ...state,
        workflows: {
          ...state.workflows,
          error: action.error || 'Failed to load workflows',
          items: [],
          loading: false,
          loaded: false,
        },
      };

    // Add Workflow
    case `${ADD_WORKFLOW}_PENDING`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: true,
          error: null,
          result: null,
        },
        lastCreatedWorkflowId: null,
      };
    case `${ADD_WORKFLOW}_SUCCESS`:
      // Backend returns { status, workflow_id, message }
      const workflowId = action.result?.workflow_id;
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: false,
          error: null,
          result: action.result,
        },
        lastCreatedWorkflowId: workflowId || null,
        // Clear loaded state to force refresh after creation
        workflows: {
          ...state.workflows,
          loaded: false,
        },
      };
    case `${ADD_WORKFLOW}_FAIL`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: false,
          error: action.error || 'Failed to create workflow',
          result: null,
        },
        lastCreatedWorkflowId: null,
      };

    // Delete Workflow
    case `${DELETE_WORKFLOW}_PENDING`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: true,
          error: null,
          result: null,
        },
      };
    case `${DELETE_WORKFLOW}_SUCCESS`:
      // Use meta.workflowId from action creator instead of parsing path
      const deletedWorkflowId =
        action.meta?.workflowId || action.request?.path?.split('/').pop();
      return {
        ...state,
        workflows: {
          ...state.workflows,
          items: deletedWorkflowId
            ? state.workflows.items.filter((wf) => wf.id !== deletedWorkflowId)
            : state.workflows.items,
        },
        operation: {
          ...state.operation,
          loading: false,
          error: null,
          result: action.result,
        },
      };
    case `${DELETE_WORKFLOW}_FAIL`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: false,
          error: action.error || 'Failed to delete workflow',
          result: null,
        },
      };

    // Get Workflow
    case `${GET_WORKFLOW}_PENDING`:
      return {
        ...state,
        workflow: {
          ...state.workflow,
          error: null,
          loading: true,
          loaded: false,
        },
      };
    case `${GET_WORKFLOW}_SUCCESS`:
      return {
        ...state,
        workflow: {
          ...state.workflow,
          currentWorkflow: action.result,
          error: null,
          loaded: true,
          loading: false,
        },
      };
    case `${GET_WORKFLOW}_FAIL`:
      return {
        ...state,
        workflow: {
          ...state.workflow,
          error: action.error || 'Failed to load workflows',
          currentWorkflow: null,
          loading: false,
          loaded: false,
        },
      };

    // Update Workflow
    case `${UPDATE_WORKFLOW}_PENDING`:
      return {
        ...state,
        operation: { ...state.operation, loading: true, error: null },
      };
    case `${UPDATE_WORKFLOW}_SUCCESS`:
      const updatedWorkflow = action.result;
      return {
        ...state,
        operation: { ...state.operation, loading: false },
        workflows: {
          ...state.workflows,
          items: state.workflows.items.map((wf) =>
            wf.id === updatedWorkflow.id ? updatedWorkflow : wf,
          ),
        },
      };
    case `${UPDATE_WORKFLOW}_FAIL`:
      return {
        ...state,
        operation: { ...state.operation, loading: false, error: action.error },
      };
    // Update Workflow Security
    case `${UPDATE_WORKFLOW_SECURITY}_PENDING`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: true,
          error: null,
          result: null,
        },
      };
    case `${UPDATE_WORKFLOW_SECURITY}_SUCCESS`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: false,
          error: null,
          result: action.result,
        },
      };
    case `${UPDATE_WORKFLOW_SECURITY}_FAIL`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: false,
          error: action.error || 'Failed to update workflow security',
          result: null,
        },
      };

    // Assign Workflow
    case `${ASSIGN_WORKFLOW}_PENDING`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: true,
          error: null,
          result: null,
        },
      };
    case `${ASSIGN_WORKFLOW}_SUCCESS`:
      // Backend returns { status, workflow, type, message }
      const assignResult = action.result;
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: false,
          error: null,
          result: assignResult,
        },
        // Update the assigned_types in the workflow items
        workflows: {
          ...state.workflows,
          items: state.workflows.items.map((workflow) => {
            if (workflow.id === assignResult?.workflow) {
              // Only add if not already present
              const newType = assignResult.type;
              const alreadyAssigned = workflow.assigned_types.includes(newType);
              return {
                ...workflow,
                assigned_types: alreadyAssigned
                  ? workflow.assigned_types
                  : [...workflow.assigned_types, newType],
              };
            }
            return workflow;
          }),
        },
      };
    case `${ASSIGN_WORKFLOW}_FAIL`:
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: false,
          error: action.error || 'Failed to assign workflow',
          result: null,
        },
      };

    // Validation (Sanity Check)
    case `${VALIDATE_WORKFLOW}_PENDING`:
      return {
        ...state,
        validation: {
          ...state.validation,
          loading: true,
          errors: null,
          error: null,
        },
      };
    case `${VALIDATE_WORKFLOW}_SUCCESS`:
      // Backend returns { status, workflow, errors, message }
      return {
        ...state,
        validation: {
          ...state.validation,
          loading: false,
          errors: action.result?.errors || null,
          error: null,
        },
      };
    case `${VALIDATE_WORKFLOW}_FAIL`:
      return {
        ...state,
        validation: {
          ...state.validation,
          loading: false,
          errors: null,
          error: action.error || 'Failed to validate workflow',
        },
      };

    // Clear last created workflow ID
    case CLEAR_LAST_CREATED_WORKFLOW:
      return {
        ...state,
        lastCreatedWorkflowId: null,
      };

    default:
      return state;
  }
}

export type { WorkflowReduxState };
