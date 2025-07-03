import React from 'react';
import { Checkbox } from '@adobe/react-spectrum';
import {
  ActionButton,
  Heading,
  Content,
  Text,
  View,
  Flex,
} from '@adobe/react-spectrum';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import add from '@plone/volto/icons/add.svg';

type Transition = {
  id: string;
  title: string;
};

interface TransitionsTabProps {
  availableTransitions: Transition[];
  selectedTransitions: string[];
  onToggleTransition: (transitionId: string) => void;
  onAddTransitionClick: () => void;
}

const TransitionsTab: React.FC<TransitionsTabProps> = ({
  availableTransitions,
  selectedTransitions,
  onToggleTransition,
  onAddTransitionClick,
}) => {
  return (
    <View
      borderWidth="thin"
      borderColor="dark"
      borderRadius="medium"
      padding="size-200"
    >
      <Heading level={3}>Transitions</Heading>
      <Content>
        <Text>Transitions this state can use.</Text>
      </Content>

      <Flex
        direction="column"
        gap="size-150"
        marginTop="size-200"
        marginBottom="size-200"
      >
        {availableTransitions.map((transition) => (
          <Checkbox
            key={transition.id}
            isSelected={selectedTransitions.includes(transition.id)}
            onChange={() => onToggleTransition(transition.id)}
            UNSAFE_className="transition-checkbox"
          >
            {transition.title}
          </Checkbox>
        ))}
      </Flex>

      <ActionButton onPress={onAddTransitionClick} aria-label="Add transition">
        <Icon name={add} size="20px" />
        Add transition
      </ActionButton>
    </View>
  );
};

export default TransitionsTab;
