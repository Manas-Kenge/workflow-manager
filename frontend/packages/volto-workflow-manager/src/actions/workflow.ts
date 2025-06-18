import type { WorkflowState } from '../features/workflow/workflowSlice';

export const GET_WORKFLOWS = 'GET_WORKFLOWS' as const;
export const ADD_WORKFLOW = 'ADD_WORKFLOW' as const;
export const DELETE_WORKFLOW = 'DELETE_WORKFLOW' as const;
export const RENAME_WORKFLOW = 'RENAME_WORKFLOW' as const;
export const VALIDATE_WORKFLOW = 'VALIDATE_WORKFLOW' as const;
export const UPDATE_WORKFLOW_STATE = 'UPDATE_WORKFLOW_STATE';

export function getWorkflows() {
  return { type: GET_WORKFLOWS, request: { op: 'get', path: '/@workflows' } };
}

export function addWorkflow(cloneFromWorkflow: string, workflowName: string) {
  return {
    type: ADD_WORKFLOW,
    request: {
      op: 'post',
      path: '/@workflow-add',
      data: {
        'clone-from-workflow': cloneFromWorkflow,
        'workflow-name': workflowName,
      },
    },
  };
}

export function deleteWorkflow(workflowId: string) {
  return {
    type: DELETE_WORKFLOW,
    request: {
      op: 'del',
      path: '/@workflow-delete',
      data: { 'selected-workflow': workflowId },
    },
  };
}

export function renameWorkflow(workflowId: string, newTitle: string) {
  return {
    type: RENAME_WORKFLOW,
    request: {
      op: 'post',
      path: '/@workflow-rename',
      data: { 'selected-workflow': workflowId, 'new-title': newTitle },
    },
  };
}

export function validateWorkflow(workflowId: string) {
  return {
    type: VALIDATE_WORKFLOW,
    request: {
      op: 'get',
      path: `/@workflow-validate?selected-workflow=${workflowId}`,
    },
  };
}

export function updateWorkflowState(workflowId: string, state: WorkflowState) {
  return {
    type: UPDATE_WORKFLOW_STATE,
    request: {
      op: 'put',
      path: `/@workflows/${workflowId}/states/${state.id}`,
      data: state,
    },
    workflowId,
    state,
  };
}
