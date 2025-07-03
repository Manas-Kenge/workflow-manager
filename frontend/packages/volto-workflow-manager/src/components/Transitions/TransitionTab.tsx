import React, { useState } from 'react';
import {
  Picker,
  Item,
  View,
  Button,
  DialogTrigger,
  Flex,
} from '@adobe/react-spectrum';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import editing from '@plone/volto/icons/editing.svg';

const TransitionTab = ({ transitions, onSaveTransition }) => {
  const [selectedTransitionId, setSelectedTransitionId] = useState(null);

  const selectedTransition = transitions.find(
    (t) => t.id === selectedTransitionId,
  );

  return (
    <View>
      <Picker
        label="Select a transition"
        selectedKey={selectedTransitionId}
        onSelectionChange={setSelectedTransitionId}
        width="100%"
        marginBottom="size-200"
      >
        {transitions.map((trans) => (
          <Item key={trans.id}>{trans.title}</Item>
        ))}
      </Picker>

      <Flex>
        <DialogTrigger>
          <Button variant="secondary" isDisabled={!selectedTransition}>
            <Icon name={editing} size="16px" />
            Edit
          </Button>
        </DialogTrigger>
      </Flex>
    </View>
  );
};

export default TransitionTab;
