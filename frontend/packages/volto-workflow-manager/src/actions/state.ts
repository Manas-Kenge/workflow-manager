import {
  ADD_STATE,
  UPDATE_STATE,
  DELETE_STATE,
  LIST_STATES,
} from '../constants';
import type { UpdateStatePayload } from '../types';

/**
 * List all states in a workflow.
 * @param {string} workflowId The ID of the parent workflow.
 */
export function listStates(workflowId: string) {
  return {
    type: LIST_STATES,
    request: {
      op: 'get',
      path: `/@states/${workflowId}`,
    },
  };
}

/**
 * Create a new state within a workflow.
 * @param {string} workflowId The ID of the parent workflow.
 * @param {Object} stateData The data for the new state.
 */
export function addState(
  workflowId: string,
  stateData: {
    title: string;
    description?: string;
    clone_from_id?: string;
    transitions?: string[];
    permission_roles?: Record<string, string[]>;
    group_roles?: Record<string, string[]>;
  },
) {
  return {
    type: ADD_STATE,
    request: {
      op: 'post',
      path: `/@states/${workflowId}`,
      data: stateData,
    },
  };
}

/**
 * Update (save) an existing state's properties.
 * @param {string} workflowId The ID of the parent workflow.
 * @param {string} stateId The ID of the state to update.
 * @param {UpdateStatePayload} stateData An object containing the properties to update.
 */
export function updateState(
  workflowId: string,
  stateId: string,
  stateData: UpdateStatePayload & {
    title?: string;
    description?: string;
    is_initial_state?: boolean;
    transitions?: string[];
    permission_roles?: Record<string, string[]>;
    group_roles?: Record<string, string[]>;
  },
) {
  return {
    type: UPDATE_STATE,
    request: {
      op: 'patch',
      path: `/@states/${workflowId}/${stateId}`,
      data: stateData,
    },
  };
}

/**
 * Delete a state from a workflow.
 * @param {string} workflowId The ID of the parent workflow.
 * @param {string} stateId The ID of the state to delete.
 * @param {Object} [data] Optional data payload. Required if state is used by transitions.
 */
export function deleteState(
  workflowId: string,
  stateId: string,
  data: { replacement_state_id?: string } = {},
) {
  return {
    type: DELETE_STATE,
    request: {
      op: 'del',
      path: `/@states/${workflowId}/${stateId}`,
      data,
    },
  };
}
