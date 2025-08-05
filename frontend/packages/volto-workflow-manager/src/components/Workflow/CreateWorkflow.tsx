import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  Divider,
  Heading,
  Item,
  Picker,
  Text,
  TextField,
  View,
} from '@adobe/react-spectrum';
import ThemeProvider from '../../Provider';
import type { CreateWorkflowProps } from '../../types/workflow';

const CreateWorkflow: React.FC<CreateWorkflowProps> = ({
  workflows,
  onCreate,
  close,
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('');

  const handleCreate = () => {
    if (workflowName && onCreate) {
      onCreate(selectedWorkflow, workflowName);
      setSelectedWorkflow('');
      setWorkflowName('');
    }
  };

  return (
    <Dialog>
      <Content>
        <Heading level={1}>Create new workflow</Heading>
        <Divider
          marginTop="size-200"
          marginBottom="size-200"
          UNSAFE_style={{ height: '1px', backgroundColor: '#gray-300' }}
        />
        <View marginBottom="size-300">
          <Heading level={3} marginBottom="size-100">
            Clone from
          </Heading>
          <Text marginBottom="size-200">
            Select the workflow you'd like to use as the basis for the new
            workflow you're creating.
          </Text>
          <Picker
            aria-label="Select a workflow to clone from"
            selectedKey={selectedWorkflow}
            onSelectionChange={(selected) => setSelectedWorkflow(selected)}
            width="100%"
          >
            {workflows?.map((workflow) => (
              <Item key={workflow.id}>{workflow.title}</Item>
            ))}
          </Picker>
        </View>

        <View marginBottom="size-300">
          <Heading level={3} marginBottom="size-100">
            Workflow Name
          </Heading>
          <Text marginBottom="size-200">
            An id will be generated from this title.
          </Text>
          <TextField
            aria-label="New workflow name"
            defaultValue="Enter value"
            value={workflowName}
            onChange={setWorkflowName}
            isRequired
            necessityIndicator="icon"
            width="100%"
          />
        </View>

        <ButtonGroup>
          <Button variant="secondary" onPress={close}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onPress={handleCreate}
            isDisabled={!workflowName || !selectedWorkflow}
          >
            Add
          </Button>
        </ButtonGroup>
      </Content>
    </Dialog>
  );
};

export default ThemeProvider(CreateWorkflow);
