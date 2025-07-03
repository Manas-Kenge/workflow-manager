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

const StateTab = ({ states, onSaveState }) => {
  const [selectedStateId, setSelectedStateId] = useState(null);

  const selectedState = states.find((s) => s.id === selectedStateId);

  return (
    <View>
      <Picker
        label="Select a state"
        selectedKey={selectedStateId}
        onSelectionChange={setSelectedStateId}
        width="100%"
        marginBottom="size-200"
      >
        {states.map((state) => (
          <Item key={state.id}>{state.title}</Item>
        ))}
      </Picker>

      <Flex>
        <DialogTrigger>
          <Button variant="secondary" isDisabled={!selectedState}>
            <Icon name={editing} size="16px" />
            Edit
          </Button>
        </DialogTrigger>
      </Flex>
    </View>
  );
};

export default StateTab;
