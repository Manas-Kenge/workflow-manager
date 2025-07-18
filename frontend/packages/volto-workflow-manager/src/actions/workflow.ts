import {
  GET_WORKFLOWS,
  ADD_WORKFLOW,
  DELETE_WORKFLOW,
  UPDATE_WORKFLOW,
  ASSIGN_WORKFLOW,
  UPDATE_WORKFLOW_SECURITY,
  VALIDATE_WORKFLOW,
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
      path: '/@workflows',
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
      path: `/@workflows/${workflowId}`,
    },
    meta: {
      workflowId,
    },
  };
}

export function updateWorkflow(
  workflowId: string,
  data: { title?: string; description?: string },
) {
  return {
    type: UPDATE_WORKFLOW,
    request: {
      op: 'patch',
      path: `/@workflows/${workflowId}`,
      data,
    },
  };
}

export function updateWorkflowSecurity(workflowId: string) {
  return {
    type: UPDATE_WORKFLOW_SECURITY,
    request: {
      op: 'post',
      path: `/@workflows/${workflowId}/@update-security`,
      data: {},
    },
  };
}

export function assignWorkflow(workflowId: string, contentType: string) {
  return {
    type: ASSIGN_WORKFLOW,
    request: {
      op: 'post',
      path: `/@workflows/${workflowId}/@assign`, // Fixed path
      data: {
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
      path: `/@workflows/${workflowId}/@sanity-check`,
    },
  };
}
