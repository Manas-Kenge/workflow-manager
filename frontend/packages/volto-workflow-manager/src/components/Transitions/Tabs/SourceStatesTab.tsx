import React from 'react';
import { Checkbox, Flex, View, Text, Heading } from '@adobe/react-spectrum';
import type { SourceStatesTabProps } from '../../../types/transition';

const SourceStatesTab: React.FC<SourceStatesTabProps> = ({
  data,
  availableStates,
  onChange,
  isDisabled,
}) => {
  const handleToggleState = (toggledId: string) => {
    const currentlySelected = data.selected || [];
    const isSelected = currentlySelected.includes(toggledId);

    let newSelected: string[];
    if (isSelected) {
      newSelected = currentlySelected.filter((id) => id !== toggledId);
    } else {
      newSelected = [...currentlySelected, toggledId];
    }

    onChange({ selected: newSelected });
  };

  if (isDisabled) {
    return <Text>Select a transition to configure its source states.</Text>;
  }

  return (
    <View>
      <Heading level={3}>Source States</Heading>
      <Text>
        Select the states from which this transition can be triggered.
      </Text>
      <Flex direction="column" gap="size-150" marginTop="size-200">
        {availableStates.map((state) => (
          <Checkbox
            key={state.id}
            isSelected={data.selected?.includes(state.id) || false}
            onChange={() => handleToggleState(state.id)}
            isDisabled={isDisabled}
          >
            {state.title}
          </Checkbox>
        ))}
      </Flex>
    </View>
  );
};

export default SourceStatesTab;
