export interface GroupRolesData {
  [groupId: string]: string[];
}

export interface GroupInfo {
  id: string;
  title: string;
}

export interface GroupRolesTabProps {
  data: GroupRolesData;
  groups: GroupInfo[];
  availableRoles: string[];
  onChange: (newData: GroupRolesData) => void;
  isDisabled: boolean;
}

export interface PermissionRolesData {
  [permissionName: string]: string[];
}

export interface PermissionInfo {
  name: string;
  perm: string;
  description: string;
}

export interface PermissionRolesTabProps {
  data: PermissionRolesData;
  managedPermissions: PermissionInfo[];
  availableRoles: string[];
  onChange: (newData: PermissionRolesData) => void;
  isDisabled: boolean;
}

export interface PropertiesData {
  isInitialState: boolean;
  title: string;
  description: string;
}

export interface PropertiesTabProps {
  data: PropertiesData;
  schema: any;
  onChange: (newData: PropertiesData) => void;
  isDisabled: boolean;
}

export interface TransitionsData {
  selected: string[];
}

export interface AvailableTransition {
  id: string;
  title: string;
}

export interface TransitionsTabProps {
  data: TransitionsData;
  availableTransitions: AvailableTransition[];
  onChange: (newData: TransitionsData) => void;
  isDisabled: boolean;
}

export interface StateData {
  properties: PropertiesData;
  transitions: TransitionsData;
  permissions: PermissionRolesData;
  groupRoles: GroupRolesData;
}

export interface StateProps {
  workflowId: string;
  onDataChange: (payload: any | null) => void;
  isDisabled: boolean;
}

export interface CreateStateProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface StateObject {
  id: string;
  title: string;
  description: string;
  transitions: string[];
  permission_roles: Record<string, string[]>;
  group_roles: Record<string, string[]>;
}

// Response from LIST_STATES endpoint (GET /@states/{workflow_id})
export interface ListStatesResponse {
  workflow_id: string;
  workflow_title: string;
  initial_state: string | null;
  states: StateObject[];
}

// Response from ADD_STATE and UPDATE_STATE endpoints
export interface StateActionResponse {
  status: string;
  state: StateObject;
  message: string;
}

// Response from DELETE_STATE endpoint
export interface DeleteStateResponse {
  status: string;
  message: string;
}

export interface StateReduxState {
  get: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: StateObject | null;
  };
  list: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: ListStatesResponse | null;
  };
  add: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: StateActionResponse | null;
  };
  update: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: StateActionResponse | null;
  };
  delete: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    data: DeleteStateResponse | null;
  };
}
