import React from 'react';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTitle,
} from '@adobe/react-spectrum';
import PropertiesTab, { type PropertiesData } from './Tabs/PropertiesTab';
import TransitionsTab, { type TransitionsData } from './Tabs/TransitionsTab';

export interface StateData {
  properties: PropertiesData;
  transitions: TransitionsData;
}

interface StateTabProps {
  stateData: StateData;
  onStateChange: (newState: Partial<StateData>) => void;
  isDisabled: boolean;
  propertiesSchema: any;
  stateId: string;
  availableTransitions: { id: string; title: string }[];
}

const StateTab: React.FC<StateTabProps> = ({
  stateData,
  onStateChange,
  isDisabled,
  propertiesSchema,
  stateId,
  availableTransitions,
}) => {
  const handlePropertiesChange = (newPropertiesData: PropertiesData) => {
    onStateChange({ properties: newPropertiesData });
  };

  const handleTransitionsChange = (newTransitionsData: TransitionsData) => {
    onStateChange({ transitions: newTransitionsData });
  };

  return (
    <Accordion defaultExpandedKeys={['properties']}>
      <Disclosure id="properties">
        <DisclosureTitle>Properties</DisclosureTitle>
        <DisclosurePanel>
          <PropertiesTab
            data={stateData.properties}
            schema={propertiesSchema}
            onChange={handlePropertiesChange}
            isDisabled={isDisabled}
            stateId={stateId}
          />
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="transitions">
        <DisclosureTitle>Transitions</DisclosureTitle>
        <DisclosurePanel>
          <TransitionsTab
            data={stateData.transitions}
            availableTransitions={availableTransitions}
            onChange={handleTransitionsChange}
            isDisabled={isDisabled}
          />
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
};

export default StateTab;
