import {
  LIST_TRANSITIONS,
  GET_TRANSITION,
  ADD_TRANSITION,
  UPDATE_TRANSITION,
  DELETE_TRANSITION,
} from '../constants';
import { updateState } from './state';
import { getWorkflow } from './workflow';

export interface AddTransitionPayload {
  title: string;
  description?: string;
  new_state_id?: string;
  initial_states?: string[];
  clone_from_id?: string | null;
}

export interface UpdateTransitionPayload {
  title?: string;
  description?: string;
  new_state_id?: string;
  trigger_type?: number;
  guard?: {
    permissions?: string[];
    roles?: string[];
    groups?: string[];
    expr?: string;
  };
  states_with_this_transition?: string[];
}

/**
 * Action to fetch a list of all transitions for a given workflow.
 * @param workflowId The ID of the workflow.
 */
export function listTransitions(workflowId: string) {
  return {
    type: LIST_TRANSITIONS,
    request: {
      op: 'get',
      path: `/@transitions/${workflowId}`,
    },
    meta: {
      workflowId,
    },
  };
}

/**
 * Action to fetch the detailed information for a single transition.
 * @param workflowId The ID of the workflow.
 * @param transitionId The ID of the transition.
 */
export function getTransitionDetails(workflowId: string, transitionId: string) {
  return {
    type: GET_TRANSITION,
    request: {
      op: 'get',
      path: `/@transitions/${workflowId}/${transitionId}`,
    },
    meta: {
      workflowId,
      transitionId,
    },
  };
}

/**
 * Action to create a new transition in a workflow.
 * @param workflowId The ID of the workflow.
 * @param transitionId The ID for the new transition.
 * @param payload The data for the new transition.
 */
export function addTransition(
  workflowId: string,
  transitionId: string,
  payload: AddTransitionPayload,
) {
  return {
    type: ADD_TRANSITION,
    request: {
      op: 'post',
      path: `/@transitions/${workflowId}/${transitionId}`,
      data: payload,
    },
    meta: {
      workflowId,
      transitionId,
    },
  };
}

/**
 * Action to update an existing transition.
 * @param workflowId The ID of the workflow.
 * @param transitionId The ID of the transition to update.
 * @param payload The data to update on the transition.
 */
export function updateTransition(
  workflowId: string,
  transitionId: string,
  payload: UpdateTransitionPayload,
) {
  return {
    type: UPDATE_TRANSITION,
    request: {
      op: 'patch',
      path: `/@transitions/${workflowId}/${transitionId}`,
      data: payload,
    },
    meta: {
      workflowId,
      transitionId,
    },
  };
}

/**
 * Action to delete a transition from a workflow.
 * @param workflowId The ID of the workflow.
 * @param transitionId The ID of the transition to delete.
 */
export function deleteTransition(workflowId: string, transitionId: string) {
  return {
    type: DELETE_TRANSITION,
    request: {
      op: 'del',
      path: `/@transitions/${workflowId}/${transitionId}`,
    },
    meta: {
      workflowId,
      transitionId,
    },
  };
}

export const createAndLinkTransition = (
  workflowId: string,
  transitionId: string,
  payload: any,
  sourceStateId: string | null,
) => {
  return async (dispatch, getState) => {
    try {
      const result = await dispatch(
        addTransition(workflowId, transitionId, payload),
      );
      if (result && result.error) {
        return result;
      }

      if (sourceStateId) {
        const { workflow } = getState();
        const currentWorkflow = workflow.workflows.items.find(
          (w) => w.id === workflowId,
        );
        const sourceState = currentWorkflow?.states.find(
          (s) => s.id === sourceStateId,
        );

        if (sourceState) {
          const newTransitionsForState = [
            ...(sourceState.transitions || []),
            transitionId,
          ];
          const updatePayload = {
            id: sourceStateId,
            transitions: newTransitionsForState,
          };
          const updateResult = await dispatch(
            updateState(workflowId, sourceStateId, updatePayload),
          );

          if (updateResult && updateResult.error) {
            return updateResult;
          }
        }
      }

      await dispatch(getWorkflow(workflowId));

      return result;
    } catch (error) {
      return { error: { message: 'An unexpected error occurred.' } };
    }
  };
};
