import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Accordion,
  Button,
  Disclosure,
  DisclosureTitle,
  DisclosurePanel,
  View,
  Heading,
  Flex,
  Picker,
  Item,
  ProgressCircle,
  AlertDialog,
  DialogTrigger,
} from '@adobe/react-spectrum';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import deleteIcon from '@plone/volto/icons/delete.svg';
import { listStates, deleteState } from '../../actions/state';
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
  workflow,
  onDataChange,
  isDisabled,
}) => {
  const dispatch = useDispatch();
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [localStateData, setLocalStateData] = useState<StateData | null>(null);
  const [initialStateData, setInitialStateData] = useState<StateData | null>(
    null,
  );

  const { statesInfo, transitionsInfo, isLoadingData, selectedItem } =
    useSelector((state: GlobalRootState) => ({
      statesInfo: state.state.list,
      transitionsInfo: state.transition.list,
      isLoadingData: state.state.list.loading || state.transition.list.loading,
      selectedItem: state.workflow.selectedItem,
    }));

  useEffect(() => {
    if (workflowId) {
      dispatch(listStates(workflowId));
      dispatch(listTransitions(workflowId));
    }
  }, [dispatch, workflowId]);

  // Sync selectedStateId with selectedItem from graph
  useEffect(() => {
    if (selectedItem?.kind === 'state' && selectedItem.id !== selectedStateId) {
      setSelectedStateId(selectedItem.id);
    }
  }, [selectedItem, selectedStateId]);

  useEffect(() => {
    const currentState = statesInfo.data?.states.find(
      (s) => s.id === selectedStateId,
    );
    if (currentState && workflow) {
      const data: StateData = {
        properties: {
          title: currentState.title || '',
          description: currentState.description || '',
          isInitialState: workflow.initial_state === currentState.id,
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
  }, [selectedStateId, statesInfo.data, workflow]);

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

  const handleDeleteState = useCallback(
    (stateId: string) => {
      dispatch(deleteState(workflowId, stateId));
      setSelectedStateId(null);
      setLocalStateData(null);
      setInitialStateData(null);
      onDataChange(null);
    },
    [dispatch, workflowId, onDataChange],
  );

  if (isLoadingData && !statesInfo.loaded) {
    return <ProgressCircle isIndeterminate />;
  }

  const areTabsDisabled = isDisabled || !localStateData;

  return (
    <View>
      <Flex
        direction="column"
        gap="size-200"
        marginY="size-300"
        marginX="size-300"
      >
        <Heading level={3}>Configure a State</Heading>
        <Picker
          placeholder="Choose a state..."
          items={statesInfo.data?.states || []}
          selectedKey={selectedStateId}
          onSelectionChange={(key) => setSelectedStateId(key as string)}
          isDisabled={isDisabled}
          UNSAFE_className="sidebar-picker"
        >
          {(item) => <Item key={item.id}>{item.title}</Item>}
        </Picker>

        {selectedStateId && (
          <Accordion
            defaultExpandedKeys={['properties']}
            key={selectedStateId}
            aria-label="State Configuration"
          >
            <Disclosure id="properties">
              <DisclosureTitle>Properties</DisclosureTitle>
              <DisclosurePanel>
                <PropertiesTab
                  key={`properties-${selectedStateId}`}
                  data={localStateData?.properties}
                  handleDeleteState={handleDeleteState}
                  selectedStateId={selectedStateId}
                  schema={propertiesSchema}
                  onChange={(properties) => handleStateChange({ properties })}
                  isDisabled={areTabsDisabled}
                />
              </DisclosurePanel>
            </Disclosure>
            <Disclosure id="transitions">
              <DisclosureTitle>Transitions</DisclosureTitle>
              <DisclosurePanel>
                <TransitionsTab
                  key={`transitions-${selectedStateId}`}
                  data={localStateData?.transitions}
                  availableTransitions={transitionsInfo.data?.transitions || []}
                  onChange={(transitions) => handleStateChange({ transitions })}
                  isDisabled={areTabsDisabled}
                />
              </DisclosurePanel>
            </Disclosure>
            <Disclosure id="permissions">
              <DisclosureTitle>Permission Roles</DisclosureTitle>
              <DisclosurePanel>
                <PermissionRolesTab
                  key={`permissions-${selectedStateId}`}
                  data={localStateData?.permissions}
                  managedPermissions={
                    workflow?.context_data?.managed_permissions || []
                  }
                  availableRoles={workflow?.context_data?.available_roles || []}
                  onChange={(permissions) => handleStateChange({ permissions })}
                  isDisabled={areTabsDisabled}
                />
              </DisclosurePanel>
            </Disclosure>
            <Disclosure id="group-roles">
              <DisclosureTitle>Group Roles</DisclosureTitle>
              <DisclosurePanel>
                <GroupRolesTab
                  key={`group-roles-${selectedStateId}`}
                  data={localStateData?.groupRoles}
                  groups={workflow?.context_data?.groups || []}
                  availableRoles={workflow?.context_data?.available_roles || []}
                  onChange={(groupRoles) => handleStateChange({ groupRoles })}
                  isDisabled={areTabsDisabled}
                />
              </DisclosurePanel>
            </Disclosure>
          </Accordion>
        )}
      </Flex>
    </View>
  );
};

export default State;
