import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ProgressCircle,
  Button,
  View,
  Content,
  Heading,
  Flex,
  Picker,
  Item,
  Tabs,
  TabList,
  TabPanels,
} from '@adobe/react-spectrum';
import { createPortal } from 'react-dom';
import { useClient } from '@plone/volto/hooks/client/useClient';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import save from '@plone/volto/icons/save.svg';
import back from '@plone/volto/icons/back.svg';
import ThemeProvider from '../../Provider';
import { listStates, updateState } from '../../actions/state';
import { getWorkflows } from '../../actions/workflow';
import { listTransitions } from '../../actions/transition';
import PropertiesTab, {
  type PropertiesData,
} from '../States/Tabs/PropertiesTab';
import TransitionsTab, {
  type TransitionsData,
} from '../States/Tabs/TransitionsTab';
import PermissionRolesTab, {
  type PermissionRolesData,
} from '../States/Tabs/PermissionRolesTab';
import GroupRolesTab, {
  type GroupRolesData,
} from '../States/Tabs/GroupRolesTab';
import type { WorkflowReduxState } from '../../reducers/workflow';
import type { StateReduxState } from '../../reducers/state';
import type { TransitionReduxState } from '../../reducers/transition';

interface GlobalRootState {
  workflow: WorkflowReduxState;
  state: StateReduxState;
  transition: TransitionReduxState;
}

export interface StateData {
  properties: PropertiesData;
  transitions: TransitionsData;
  permissions: PermissionRolesData;
  groupRoles: GroupRolesData;
}

const propertiesSchema = {
  title: 'State Properties',
  fieldsets: [
    { id: 'default', title: 'Default', fields: ['title', 'description'] },
  ],
  properties: {
    title: { title: 'Title', type: 'string' },
    description: { title: 'Description', type: 'string', widget: 'textarea' },
  },
  required: ['title'],
};

const State: React.FC = (props) => {
  const { workflowId } = useParams<{ workflowId: string }>();
  //   const workflowId = 'intra';
  const dispatch = useDispatch();
  const isClient = useClient();

  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [localStateData, setLocalStateData] = useState<StateData | null>(null);

  const {
    statesInfo,
    isLoadingStates,
    currentWorkflow,
    isLoadingWorkflows,
    transitionsInfo,
    isLoadingTransitions,
    isSaving,
    saveError,
  } = useSelector((state: GlobalRootState) => ({
    statesInfo: state.state.list,
    isLoadingStates: state.state.list.loading,
    currentWorkflow: state.workflow.workflows.items.find(
      (w) => w.id === workflowId,
    ),
    isLoadingWorkflows: state.workflow.workflows.loading,
    transitionsInfo: state.transition.list,
    isLoadingTransitions: state.transition.list.loading,
    isSaving: state.state.update.loading,
    saveError: state.state.update.error,
  }));

  useEffect(() => {
    if (workflowId) {
      dispatch(listStates(workflowId));
      dispatch(getWorkflows());
      dispatch(listTransitions(workflowId));
    }
  }, [dispatch, workflowId]);

  useEffect(() => {
    const currentState = statesInfo.data?.states.find(
      (s) => s.id === selectedStateId,
    );
    if (currentState && currentWorkflow) {
      setLocalStateData({
        properties: {
          title: currentState.title || '',
          description: currentState.description || '',
          isInitialState: currentWorkflow.initial_state === currentState.id,
        },
        transitions: {
          selected: currentState.transitions || [],
        },
        permissions: currentState.permission_roles || {},
        groupRoles: currentState.group_roles || {},
      });
    } else {
      setLocalStateData(null);
    }
  }, [selectedStateId, statesInfo.data, currentWorkflow]);

  const handleStateChange = useCallback((newState: Partial<StateData>) => {
    setLocalStateData((prevState) => {
      if (!prevState) return null;
      return { ...prevState, ...newState };
    });
  }, []);

  const handleSave = () => {
    if (!localStateData || !workflowId || !selectedStateId) return;
    const { properties, transitions } = localStateData;
    const payload = {
      title: properties.title,
      description: properties.description,
      is_initial_state: properties.isInitialState,
      transitions: transitions.selected,
      permission_roles: permissions,
      group_roles: groupRoles,
    };
    dispatch(updateState(workflowId, selectedStateId, payload));
  };

  const isDisabled = !localStateData;
  const isLoading = isLoadingWorkflows || isLoadingStates;

  if (isLoading && !statesInfo.loaded) {
    return <ProgressCircle isIndeterminate />;
  }

  return (
    <View width="100%" padding="size-400">
      <Heading level={1}>Editing States for "{currentWorkflow?.title}"</Heading>

      <Flex direction="column" gap="size-200" marginY="size-300">
        <Heading level={3}>Configure a State</Heading>
        <Picker
          label="Select a state to edit"
          placeholder="Choose a state..."
          items={statesInfo.data?.states || []}
          selectedKey={selectedStateId}
          onSelectionChange={(key) => setSelectedStateId(key as string)}
        >
          {(item) => <Item key={item.id}>{item.title}</Item>}
        </Picker>
      </Flex>

      {saveError && (
        <View
          backgroundColor="negative"
          padding="size-100"
          borderRadius="medium"
        >
          <Heading level={4}>Save Failed</Heading>
          <Content>{saveError}</Content>
        </View>
      )}

      <Tabs aria-label="State Configuration" marginTop="size-300">
        <TabList>
          <Item key="properties">Properties</Item>
          <Item key="transitions">Transitions</Item>
          <Item key="permissions">Permission Roles</Item>
          <Item key="group-roles">Group Roles</Item>
        </TabList>
        <TabPanels>
          <Item key="properties">
            <View padding="size-200">
              <PropertiesTab
                data={
                  localStateData?.properties || {
                    title: '',
                    description: '',
                    isInitialState: false,
                  }
                }
                schema={propertiesSchema}
                onChange={(newData) =>
                  handleStateChange({ properties: newData })
                }
                isDisabled={isDisabled}
                stateId={selectedStateId || 'no-state-selected'}
              />
            </View>
          </Item>
          <Item key="transitions">
            <View padding="size-200">
              <TransitionsTab
                data={localStateData?.transitions || { selected: [] }}
                availableTransitions={transitionsInfo.data?.transitions || []}
                onChange={(newData) =>
                  handleStateChange({ transitions: newData })
                }
                isDisabled={isDisabled}
              />
            </View>
          </Item>
          <Item key="permissions">
            <View padding="size-200">
              <PermissionRolesTab
                data={localStateData?.permissions || {}}
                managedPermissions={
                  currentWorkflow?.context_data?.managed_permissions || []
                }
                availableRoles={
                  currentWorkflow?.context_data?.available_roles || []
                }
                onChange={(newData) =>
                  handleStateChange({ permissions: newData })
                }
                isDisabled={isDisabled}
              />
            </View>
          </Item>
          <Item key="group-roles">
            <View padding="size-200">
              <GroupRolesTab
                data={localStateData?.groupRoles || {}}
                groups={currentWorkflow?.context_data?.groups || []}
                availableRoles={
                  currentWorkflow?.context_data?.available_roles || []
                }
                onChange={(newData) =>
                  handleStateChange({ groupRoles: newData })
                }
                isDisabled={isDisabled}
              />
            </View>
          </Item>
        </TabPanels>
      </Tabs>

      {isClient &&
        createPortal(
          <Toolbar
            pathname={props.pathname}
            hideDefaultViewButtons
            inner={
              <>
                <Link
                  to={`/controlpanel/workflowmanager/${workflowId}`}
                  className="item"
                >
                  <Icon
                    name={back}
                    className="circled"
                    size="30px"
                    title="Back to Workflow"
                  />
                </Link>
                <Button
                  variant="cta"
                  onPress={handleSave}
                  isPending={isSaving}
                  isDisabled={isDisabled || isSaving}
                >
                  <Icon
                    name={save}
                    className="circled"
                    size="30px"
                    title="Save State"
                  />
                </Button>
              </>
            }
          />,
          document.getElementById('toolbar'),
        )}
    </View>
  );
};

export default ThemeProvider(State);
