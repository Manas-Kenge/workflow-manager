import React from 'react';
import { Checkbox, Flex, View, Text } from '@adobe/react-spectrum';
import type { TransitionsTabProps } from '../../../types/state';

const TransitionsTab: React.FC<TransitionsTabProps> = ({
  data,
  availableTransitions,
  onChange,
  isDisabled,
}) => {
  const handleToggleTransition = (toggledId: string) => {
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
    return <Text>Select a state to configure its transitions.</Text>;
  }

  return (
    <View>
      <Text>Select the transitions that can be triggered from this state.</Text>
      <Flex direction="column" gap="size-150" marginTop="size-200">
        {availableTransitions.map((transition) => (
          <Checkbox
            key={transition.id}
            isSelected={data.selected?.includes(transition.id) || false}
            onChange={() => handleToggleTransition(transition.id)}
            isDisabled={isDisabled}
          >
            {transition.title}
          </Checkbox>
        ))}
      </Flex>
    </View>
  );
};

export default TransitionsTab;
