import type { WorkflowState } from '../reducers/workflow';
import {
  GET_WORKFLOWS,
  ADD_WORKFLOW,
  DELETE_WORKFLOW,
  UPDATE_WORKFLOW_STATE,
  ASSIGN_WORKFLOW,
  UPDATE_WORKFLOW_SECURITY,
  VALIDATE_WORKFLOW,
  RENAME_WORKFLOW,
} from '../constants';

export function getWorkflows() {
  return {
    type: GET_WORKFLOWS,
    request: {
      op: 'get',
      path: '/@workflows',
    },
  };
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
        'form.actions.add': true,
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
      data: {
        'selected-workflow': workflowId,
      },
    },
  };
}

export function updateWorkflowState(workflowId: string, state: WorkflowState) {
  return {
    type: UPDATE_WORKFLOW_STATE,
    request: {
      op: 'put',
      path: `/api/@workflow/${workflowId}/states/${state.id}`,
      data: state,
    },
    workflowId,
    state,
  };
}

export function updateWorkflowSecurity(workflowId: string) {
  return {
    type: UPDATE_WORKFLOW_SECURITY,
    request: {
      op: 'post',
      path: '/@workflow-security-update',
      data: {
        'selected-workflow': workflowId,
        'form.actions.confirm': true,
      },
    },
  };
}

export function assignWorkflow(workflowId: string, contentType: string) {
  return {
    type: ASSIGN_WORKFLOW,
    request: {
      op: 'post',
      path: '/@workflow-assign',
      data: {
        'selected-workflow': workflowId,
        type_id: contentType,
      },
    },
  };
}

export function validateWorkflow(workflowId: string) {
  return {
    type: VALIDATE_WORKFLOW,
    request: {
      op: 'get',
      path: '/@workflow-validate',
      params: {
        'selected-workflow': workflowId,
      },
    },
  };
}

export function renameWorkflow(workflowId: string, newTitle: string) {
  return {
    type: RENAME_WORKFLOW,
    request: {
      op: 'post',
      path: '/@workflow-rename',
      data: {
        'selected-workflow': workflowId,
        'new-title': newTitle,
        'form.actions.rename': true,
      },
    },
  };
}
