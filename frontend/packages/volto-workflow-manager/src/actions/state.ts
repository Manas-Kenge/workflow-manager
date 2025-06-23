import { GET_STATE, ADD_STATE, UPDATE_STATE, DELETE_STATE } from '../constants';
import type { UpdateStatePayload } from '../types';

/**
 * Get the detailed configuration of a single state.
 * @param {string} workflowId The ID of the parent workflow.
 * @param {string} stateId The ID of the state to fetch.
 */
export function getState(workflowId: string, stateId: string) {
  return {
    type: GET_STATE,
    request: {
      op: 'get',
      path: `/@workflows/${workflowId}/@states/${stateId}`,
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
  stateData: { title: string; clone_from_id?: string },
) {
  return {
    type: ADD_STATE,
    request: {
      op: 'post',
      path: `/@workflows/${workflowId}/@states`,
      data: stateData,
    },
  };
}

/**
 * Update (save) an existing state's properties.
 * @param {string} workflowId The ID of the parent workflow.
 *  @param {string} stateId The ID of the state to update.
 * @param {UpdateStatePayload} stateData An object containing the properties to update.
 */
export function updateState(
  workflowId: string,
  stateId: string,
  stateData: UpdateStatePayload,
) {
  return {
    type: UPDATE_STATE,
    request: {
      op: 'patch',
      path: `/@workflows/${workflowId}/@states/${stateId}`,
      data: stateData,
    },
  };
}

/**
 * Delete a state from a workflow.
 * @param {string} workflowId The ID of the parent workflow.
 * @param {string} stateId The ID of the state to delete.
 * @param {Object} [data] Optional data payload. Required if a replacement is needed.
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
      path: `/@workflows/${workflowId}/@states/${stateId}`,
      data,
    },
  };
}
