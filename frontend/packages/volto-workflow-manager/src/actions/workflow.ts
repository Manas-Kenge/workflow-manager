export const GET_WORKFLOWS = 'GET_WORKFLOWS' as const;
export const ADD_WORKFLOW = 'ADD_WORKFLOW' as const;
export const DELETE_WORKFLOW = 'DELETE_WORKFLOW' as const;
export const UPDATE_WORKFLOW_SECURITY = 'UPDATE_WORKFLOW_SECURITY' as const;
export const ASSIGN_WORKFLOW = 'ASSIGN_WORKFLOW' as const;
export const VALIDATE_WORKFLOW = 'VALIDATE_WORKFLOW' as const;

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
