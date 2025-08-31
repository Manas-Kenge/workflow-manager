import { type Workflow } from './workflow';

export interface GuardsData {
  roles: string[];
  groups: string[];
  permissions: string[];
  expr: string;
}

export interface GroupInfo {
  id: string;
  title: string;
}
export interface PermissionInfo {
  perm: string;
  name: string;
}

export interface GuardsTabProps {
  data: GuardsData;
  availableRoles: string[];
  availableGroups: GroupInfo[];
  availablePermissions: PermissionInfo[];
  onChange: (newData: GuardsData) => void;
  isDisabled: boolean;
}

export interface PropertiesData {
  title: string;
  description: string;
  new_state_id: string | null;
  trigger_type: boolean;
}

export interface PropertiesTabProps {
  data: PropertiesData;
  schema: any;
  onChange: (newData: PropertiesData) => void;
  isDisabled: boolean;
  handleDeleteTransition: (transitionId: string | null) => void;
  selectedTransitionId: string | null;
}

export interface SourceStatesData {
  selected: string[];
}

export interface AvailableState {
  id: string;
  title: string;
}

export interface SourceStatesTabProps {
  data: SourceStatesData;
  availableStates: AvailableState[];
  onChange: (newData: SourceStatesData) => void;
  isDisabled: boolean;
}

export interface TransitionData {
  properties: PropertiesData;
  guards: GuardsData;
  sourceStates: SourceStatesData;
}

export interface TransitionProps {
  workflowId: string;
  workflow: Workflow;
  onDataChange: (payload: any | null) => void;
  isDisabled: boolean;
}

export interface Transition {
  id: string;
  title: string;
  description: string;
  new_state_id: string;
  trigger_type: number;
  guard: {
    permissions: string[];
    roles: string[];
    groups: string[];
    expr: string;
  };
}

export interface ListTransitionsResponse {
  workflow_id: string;
  workflow_title: string;
  transitions: Transition[];
}

export interface GetTransitionResponse {
  workflow_id: string;
  transition: Transition;
  states_with_this_transition: string[];
  available_states: { id: string; title: string }[];
  available_transitions: { id: string; title: string }[];
  guard_options: {
    permissions: string[];
    roles: string[];
    groups: { id: string; title: string }[];
  };
}

export interface TransitionActionResponse {
  status: string;
  transition: Transition;
  message: string;
}

export interface DeleteTransitionResponse {
  status: string;
  message: string;
}

export interface TransitionReduxState {
  list: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: ListTransitionsResponse | null;
  };
  get: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: GetTransitionResponse | null;
  };
  add: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: TransitionActionResponse | null;
  };
  update: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: TransitionActionResponse | null;
  };
  delete: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: DeleteTransitionResponse | null;
  };
}
