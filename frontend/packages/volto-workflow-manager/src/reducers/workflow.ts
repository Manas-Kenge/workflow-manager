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
  CLEAR_VALIDATION,
  CLEAR_LAST_CREATED_WORKFLOW,
  SELECT_WORKFLOW_ITEM,
  CLEAR_WORKFLOW_SELECTION,
} from '../constants';
import type { WorkflowReduxState } from '../types/workflow';

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
    error: null,
    errors: null,
    loading: false,
  },
  operation: {
    error: null,
    loading: false,
    result: null,
  },
  lastCreatedWorkflowId: null,
  selectedItem: null,
};

export default function workflow(
  state: WorkflowReduxState = initialState,
  action: AnyAction,
): WorkflowReduxState {
  switch (action.type) {
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

    case `${UPDATE_WORKFLOW}_PENDING`:
      return {
        ...state,
        operation: { ...state.operation, loading: true, error: null },
      };
    case `${UPDATE_WORKFLOW}_SUCCESS`:
      const updatedWorkflow = action.result;
      return {
        ...state,
        operation: { ...state.operation, loading: false, error: null },
        workflow: {
          ...state.workflow,
          currentWorkflow:
            state.workflow.currentWorkflow?.id === updatedWorkflow.id
              ? updatedWorkflow
              : state.workflow.currentWorkflow,
        },
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
      const assignResult = action.result;
      return {
        ...state,
        operation: {
          ...state.operation,
          loading: false,
          error: null,
          result: assignResult,
        },
        workflows: {
          ...state.workflows,
          items: state.workflows.items.map((workflow) => {
            if (workflow.id === assignResult?.workflow) {
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

    case `${VALIDATE_WORKFLOW}_PENDING`:
      return {
        ...state,
        validation: {
          ...initialState.validation,
          loading: true,
        },
      };
    case `${VALIDATE_WORKFLOW}_SUCCESS`:
      return {
        ...state,
        validation: {
          ...state.validation,
          loading: false,
          errors: action.result.errors,
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
    case CLEAR_VALIDATION:
      return {
        ...state,
        validation: {
          ...initialState.validation,
        },
      };
    case CLEAR_LAST_CREATED_WORKFLOW:
      return {
        ...state,
        lastCreatedWorkflowId: null,
      };
    case SELECT_WORKFLOW_ITEM:
      return {
        ...state,
        selectedItem: action.payload,
      };

    case CLEAR_WORKFLOW_SELECTION:
      return {
        ...state,
        selectedItem: null,
      };

    default:
      return state;
  }
}

export type { WorkflowReduxState };
