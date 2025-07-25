import React from 'react';
import {
  View,
  Heading,
  Flex,
  Picker,
  Item,
  Tabs,
  TabList,
  TabPanels,
} from '@adobe/react-spectrum';
import PropertiesTab from '../States/Tabs/PropertiesTab';
import TransitionsTab from '../States/Tabs/TransitionsTab';
import PermissionRolesTab from '../States/Tabs/PermissionRolesTab';
import GroupRolesTab from '../States/Tabs/GroupRolesTab';
import type { StateData } from '../Workflow/WorkflowSettings';

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

interface StateProps {
  states: any[];
  selectedStateId: string | null;
  onStateSelect: (key: string) => void;
  localStateData: StateData | null;
  onStateChange: (newState: Partial<StateData>) => void;
  availableTransitions: any[];
  currentWorkflow: any;
}

const State: React.FC<StateProps> = ({
  states,
  selectedStateId,
  onStateSelect,
  localStateData,
  onStateChange,
  availableTransitions,
  currentWorkflow,
}) => {
  const isDisabled = !localStateData;

  return (
    <View>
      <Flex direction="column" gap="size-200" marginY="size-300">
        <Heading level={3}>Configure a State</Heading>
        <Picker
          label="Select a state to edit"
          placeholder="Choose a state..."
          items={states || []}
          selectedKey={selectedStateId}
          onSelectionChange={(key) => onStateSelect(key as string)}
        >
          {(item) => <Item key={item.id}>{item.title}</Item>}
        </Picker>
      </Flex>

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
                onChange={(newData) => onStateChange({ properties: newData })}
                isDisabled={isDisabled}
                stateId={selectedStateId || 'no-state-selected'}
              />
            </View>
          </Item>
          <Item key="transitions">
            <View padding="size-200">
              <TransitionsTab
                data={localStateData?.transitions || { selected: [] }}
                availableTransitions={availableTransitions || []}
                onChange={(newData) => onStateChange({ transitions: newData })}
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
                onChange={(newData) => onStateChange({ permissions: newData })}
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
                onChange={(newData) => onStateChange({ groupRoles: newData })}
                isDisabled={isDisabled}
              />
            </View>
          </Item>
        </TabPanels>
      </Tabs>
    </View>
  );
};

export default State;
