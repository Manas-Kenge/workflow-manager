export interface CreateWorkflowProps {
  workflows: Workflow[];
  onCreate: (cloneFromId: string | null, newName: string) => void;
  close: () => void;
}

export interface WorkflowViewProps {
  workflowId: string;
  pathname?: string;
}

export interface WorkflowHeaderProps {
  workflow: Workflow | null | undefined;
}

export interface WorkflowTabProps {
  workflowId: string;
  onDataChange: (
    payload: { title: string; description: string } | null,
  ) => void;
  isDisabled: boolean;
}

export interface PermissionInfo {
  perm: string;
  name: string;
  description: string;
}

export interface GroupInfo {
  id: string;
  title: string;
}

export interface AssignableType {
  id: string;
  title: string;
}

export interface AssignWorkflowProps {
  workflow: Workflow | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export interface ContextData {
  assignable_types: AssignableType[];
  available_roles: string[];
  groups: GroupInfo[];
  managed_permissions: PermissionInfo[];
}

export type UpdateStatePayload = Partial<Omit<WorkflowState, 'id'>> & {
  is_initial_state?: boolean;
  states_with_this_transition?: string[];
};

export interface Workflow {
  id: string;
  title: string;
  description: string;
  assigned_types: string[];
  initial_state: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  context_data?: ContextData;
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
  new_state_id: string;
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

export interface WorkflowReduxState {
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
    error: string | null;
    errors: ValidationErrors | null;
    loading: boolean;
  };
  operation: {
    error: string | null;
    loading: boolean;
    result: any;
  };
  lastCreatedWorkflowId: string | null;
  selectedItem: { kind: 'state' | 'transition'; id: string } | null;
}
