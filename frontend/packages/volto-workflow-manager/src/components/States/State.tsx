import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Heading,
  Flex,
  Picker,
  Item,
  Tabs,
  TabList,
  TabPanels,
  ProgressCircle,
} from '@adobe/react-spectrum';
import { listStates } from '../../actions/state';
import { listTransitions } from '../../actions/transition';
import PropertiesTab from './Tabs/PropertiesTab';
import TransitionsTab from './Tabs/TransitionsTab';
import PermissionRolesTab from './Tabs/PermissionRolesTab';
import GroupRolesTab from './Tabs/GroupRolesTab';
import type { GlobalRootState } from '../../types';
import type { StateData, StateProps } from '../../types/state';

const propertiesSchema = {
  title: 'State Properties',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title', 'description', 'isInitialState'],
    },
  ],
  properties: {
    title: {
      title: 'Title',
      type: 'string',
    },
    description: {
      title: 'Description',
      type: 'string',
      widget: 'textarea',
    },
    isInitialState: {
      title: 'Initial State',
      description: 'Should this state be the initial state of the workflow?',
      type: 'boolean',
    },
  },
  required: ['title'],
};

const State: React.FC<StateProps> = ({
  workflowId,
  onDataChange,
  isDisabled,
}) => {
  const dispatch = useDispatch();
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [localStateData, setLocalStateData] = useState<StateData | null>(null);
  const [initialStateData, setInitialStateData] = useState<StateData | null>(
    null,
  );

  const { statesInfo, currentWorkflow, transitionsInfo, isLoadingData } =
    useSelector((state: GlobalRootState) => ({
      statesInfo: state.state.list,
      currentWorkflow: state.workflow.workflows.items.find(
        (w) => w.id === workflowId,
      ),
      transitionsInfo: state.transition.list,
      isLoadingData: state.state.list.loading || state.transition.list.loading,
    }));

  useEffect(() => {
    if (workflowId) {
      dispatch(listStates(workflowId));
      dispatch(listTransitions(workflowId));
    }
  }, [dispatch, workflowId]);

  useEffect(() => {
    const currentState = statesInfo.data?.states.find(
      (s) => s.id === selectedStateId,
    );
    if (currentState && currentWorkflow) {
      const data: StateData = {
        properties: {
          title: currentState.title || '',
          description: currentState.description || '',
          isInitialState: currentWorkflow.initial_state === currentState.id,
        },
        transitions: { selected: currentState.transitions || [] },
        permissions: currentState.permission_roles || {},
        groupRoles: currentState.group_roles || {},
      };
      setLocalStateData(data);
      setInitialStateData(data);
    } else {
      setLocalStateData(null);
      setInitialStateData(null);
    }
  }, [selectedStateId, statesInfo.data, currentWorkflow]);

  useEffect(() => {
    if (
      localStateData &&
      selectedStateId &&
      JSON.stringify(localStateData) !== JSON.stringify(initialStateData)
    ) {
      const { properties, transitions, permissions, groupRoles } =
        localStateData;
      const payload = {
        id: selectedStateId,
        title: properties.title,
        description: properties.description,
        is_initial_state: properties.isInitialState,
        transitions: transitions.selected,
        permission_roles: permissions,
        group_roles: groupRoles,
      };
      onDataChange(payload);
    } else {
      onDataChange(null);
    }
  }, [localStateData, initialStateData, selectedStateId, onDataChange]);

  const handleStateChange = useCallback((newState: Partial<StateData>) => {
    setLocalStateData((prevState) => {
      if (!prevState) return null;
      return { ...prevState, ...newState };
    });
  }, []);

  if (isLoadingData && !statesInfo.loaded) {
    return <ProgressCircle isIndeterminate />;
  }

  const areTabsDisabled = isDisabled || !localStateData;

  return (
    <View>
      <Flex direction="column" gap="size-200" marginY="size-300">
        <Heading level={3}>Configure a State</Heading>
        <Picker
          label="Select a state to edit"
          placeholder="Choose a state..."
          items={statesInfo.data?.states || []}
          selectedKey={selectedStateId}
          onSelectionChange={(key) => setSelectedStateId(key as string)}
          isDisabled={isDisabled}
        >
          {(item) => <Item key={item.id}>{item.title}</Item>}
        </Picker>
      </Flex>

      <Tabs
        key={selectedStateId}
        aria-label="State Configuration"
        marginTop="size-300"
      >
        <TabList>
          <Item key="properties">Properties</Item>
          <Item key="transitions">Transitions</Item>
          <Item key="permissions">Permission Roles</Item>
          <Item key="group-roles">Group Roles</Item>
        </TabList>
        <TabPanels>
          <Item key="properties">
            <PropertiesTab
              data={localStateData?.properties}
              schema={propertiesSchema}
              onChange={(properties) => handleStateChange({ properties })}
              isDisabled={areTabsDisabled}
            />
          </Item>
          <Item key="transitions">
            <TransitionsTab
              data={localStateData?.transitions}
              availableTransitions={transitionsInfo.data?.transitions || []}
              onChange={(transitions) => handleStateChange({ transitions })}
              isDisabled={areTabsDisabled}
            />
          </Item>
          <Item key="permissions">
            <PermissionRolesTab
              data={localStateData?.permissions}
              managedPermissions={
                currentWorkflow?.context_data?.managed_permissions || []
              }
              availableRoles={
                currentWorkflow?.context_data?.available_roles || []
              }
              onChange={(permissions) => handleStateChange({ permissions })}
              isDisabled={areTabsDisabled}
            />
          </Item>
          <Item key="group-roles">
            <GroupRolesTab
              data={localStateData?.groupRoles}
              groups={currentWorkflow?.context_data?.groups || []}
              availableRoles={
                currentWorkflow?.context_data?.available_roles || []
              }
              onChange={(groupRoles) => handleStateChange({ groupRoles })}
              isDisabled={areTabsDisabled}
            />
          </Item>
        </TabPanels>
      </Tabs>
    </View>
  );
};

export default State;
