import React, { useState } from 'react';
import {
  Heading,
  Picker,
  Button,
  ButtonGroup,
  Item,
  View,
  Text,
  Switch,
  Divider,
  Flex,
  DialogTrigger,
} from '@adobe/react-spectrum';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import save from '@plone/volto/icons/save.svg';
import nav from '@plone/volto/icons/nav.svg';

import StateEditDialog from '../State/StateEditDialog';

const Toolbox = ({
  workflow,
  onHighlightState,
  onHighlightTransition,
  onSaveState,
}) => {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [designMode, setDesignMode] = useState(true);

  const handleFindState = () => {
    if (selectedState) onHighlightState(selectedState);
  };

  const handleFindTransition = () => {
    if (selectedTransition) onHighlightTransition(selectedTransition);
  };

  if (!workflow) return null;

  return (
    <View
      padding="size-200"
      borderWidth="thin"
      borderColor="gray-300"
      borderRadius="medium"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={4}>Toolbox</Heading>
        <Switch isSelected={designMode} onChange={setDesignMode}>
          Design mode
        </Switch>
      </Flex>

      <View marginTop="size-200">
        <Button variant="primary" width="100%">
          <Icon name={nav} size="20px" />
          Reorder Graph
        </Button>
      </View>

      <View marginTop="size-200">
        <Button variant="primary" width="100%">
          <Icon name={save} size="20px" />
          Save Layout
        </Button>
      </View>

      <Divider
        marginTop="size-200"
        marginBottom="size-200"
        UNSAFE_style={{ height: '1px', backgroundColor: '#gray-300' }}
      />

      <Text UNSAFE_style={{ fontWeight: 600 }}>States</Text>
      <Picker
        placeholder="Select state"
        selectedKey={selectedState}
        onSelectionChange={setSelectedState}
        width="100%"
        marginTop="size-100"
      >
        {workflow.states.map((state) => (
          <Item key={state.id}>{state.title}</Item>
        ))}
      </Picker>

      <View marginTop="size-200">
        <ButtonGroup>
          <DialogTrigger>
            <Button variant="secondary" isDisabled={!selectedState}>
              Edit
            </Button>
            {(close) => (
              <StateEditDialog
                onClose={close}
                selectedState={workflow.states.find(
                  (s) => s.id === selectedState,
                )}
                onSave={onSaveState} // Pass the handler to the dialog
              />
            )}
          </DialogTrigger>
          <Button
            variant="accent"
            onPress={handleFindState}
            isDisabled={!selectedState}
          >
            Find
          </Button>
          <Button variant="secondary" onPress={() => setSelectedState(null)}>
            Clear
          </Button>
        </ButtonGroup>
      </View>

      <Divider
        marginTop="size-200"
        marginBottom="size-200"
        UNSAFE_style={{ height: '1px', backgroundColor: '#gray-300' }}
      />

      <Text UNSAFE_style={{ fontWeight: 600 }}>Transitions</Text>
      <Picker
        placeholder="Select transition"
        selectedKey={selectedTransition}
        onSelectionChange={setSelectedTransition}
        width="100%"
        marginTop="size-100"
      >
        {workflow.transitions.map((trans) => (
          <Item key={trans.id}>{trans.title}</Item>
        ))}
      </Picker>

      <View marginTop="size-200">
        <ButtonGroup>
          <Button variant="secondary">Edit</Button>
          <Button
            variant="accent"
            onPress={handleFindTransition}
            isDisabled={!selectedTransition}
          >
            Find
          </Button>
          <Button
            variant="secondary"
            onPress={() => setSelectedTransition(null)}
          >
            Clear
          </Button>
        </ButtonGroup>
      </View>
    </View>
  );
};

export default Toolbox;
