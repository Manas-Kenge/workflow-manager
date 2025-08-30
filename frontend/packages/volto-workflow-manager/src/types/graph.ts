export interface WorkflowState {
  id: string;
  title: string;
  description?: string;
  transitions: string[];
}

export interface WorkflowTransition {
  id: string;
  title: string;
  description?: string;
  new_state_id: string;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  initial_state: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface NodeData {
  [key: string]: unknown;
  label: string;
  description?: string;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface EdgeData {
  [key: string]: unknown;
  label?: string;
  description?: string;
  transitionId?: string;
}
