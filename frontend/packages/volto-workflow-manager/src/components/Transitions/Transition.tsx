import React, { useMemo } from 'react';
import {
  View,
  Tabs,
  TabList,
  TabPanels,
  Item,
  Heading,
  Content,
} from '@adobe/react-spectrum';
import PropertiesTab, { type PropertiesData } from './Tabs/PropertiesTab';

export interface TransitionData {
  properties: PropertiesData;
}

interface TransitionProps {
  transitionData: TransitionData | null;
  onTransitionChange: (newState: Partial<TransitionData>) => void;
  isDisabled: boolean;
  availableStates: { id: string; title: string }[];
  availableRoles: string[];
  availableGroups: { id: string; title: string }[];
  availablePermissions: { perm: string; name: string }[];
}

const Transition: React.FC<TransitionProps> = ({
  transitionData,
  onTransitionChange,
  isDisabled,
  availableStates,
  availableRoles,
  availableGroups,
  availablePermissions,
}) => {
  const propertiesSchema = useMemo(() => {
    return {
      title: 'Transition Properties',
      fieldsets: [
        {
          id: 'default',
          title: 'Default',
          fields: ['title', 'description', 'new_state_id', 'trigger_type'],
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
        new_state_id: {
          title: 'Destination State',
          choices: availableStates.map((state) => [state.id, state.title]),
        },
        trigger_type: {
          title: 'Auto Trigger',
          type: 'boolean',
        },
      },
      required: ['title', 'new_state_id'],
    };
  }, [availableStates]);

  const handlePropertiesChange = (newPropertiesData: PropertiesData) => {
    onTransitionChange({ properties: newPropertiesData });
  };

  if (isDisabled) {
    return (
      <View padding="size-200">
        <Heading level={3}>Configure a Transition</Heading>
        <Content>
          Please select a transition from the dropdown to begin editing.
        </Content>
      </View>
    );
  }

  return (
    <Tabs aria-label="Transition Configuration" marginTop="size-300">
      <TabList>
        <Item key="properties">Properties</Item>
      </TabList>
      <TabPanels>
        <Item key="properties">
          <View padding="size-200">
            <PropertiesTab
              data={
                transitionData?.properties || {
                  title: '',
                  description: '',
                  new_state_id: null,
                  trigger_type: 1, // Default to user-triggered
                }
              }
              schema={propertiesSchema}
              onChange={handlePropertiesChange}
              isDisabled={isDisabled}
            />
          </View>
        </Item>
      </TabPanels>
    </Tabs>
  );
};

export default Transition;
