// src/components/Workflow/CreateWorkflow.tsx

import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogTrigger,
  Divider,
  Heading,
  Item,
  Picker,
  Text,
  TextField,
  View,
} from '@adobe/react-spectrum';
import ThemeProvider from '../../Provider';

interface Workflow {
  id: string;
  title?: string;
}

interface CreateWorkflowProps {
  workflows: Workflow[];
  onCreate: (cloneFrom: string, name: string) => void;
}

const CreateWorkflow: React.FC<CreateWorkflowProps> = ({
  workflows,
  onCreate,
}) => {
  const [workflowName, setWorkflowName] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Set a default "clone from" selection when workflows are loaded
  useEffect(() => {
    if (!selectedWorkflow && workflows && workflows.length > 0) {
      setSelectedWorkflow(workflows[0].id);
    }
  }, [workflows, selectedWorkflow]);

  const handleCreate = (close: () => void) => {
    if (workflowName && selectedWorkflow && onCreate) {
      onCreate(selectedWorkflow, workflowName);
      setWorkflowName('');
      close();
    }
  };

  return (
    <div>
      <DialogTrigger isDismissable>
        <Button variant="accent">Create New Workflow</Button>
        {(close) => (
          <Dialog>
            <Content>
              <Heading level={1}>Create New Workflow</Heading>
              <Text slot="description" marginBottom="size-300">
                Create a new workflow by cloning an existing one.
              </Text>
              <Divider marginTop="size-200" marginBottom="size-200" />

              <View marginBottom="size-300">
                <Heading level={3} marginBottom="size-100">
                  Clone From
                </Heading>
                <Text marginBottom="size-200">
                  Select the workflow to use as a template.
                </Text>

                <Picker
                  aria-label="Select a workflow to clone"
                  selectedKey={selectedWorkflow}
                  onSelectionChange={(key) =>
                    setSelectedWorkflow(key as string)
                  }
                  width="100%"
                  isRequired
                  necessityIndicator="icon"
                >
                  {workflows?.map((workflow) => (
                    <Item key={workflow.id}>{workflow.title}</Item>
                  ))}
                </Picker>
              </View>

              <View marginBottom="size-300">
                <Heading level={3} marginBottom="size-100">
                  New Workflow Name
                </Heading>
                <Text marginBottom="size-200">
                  An ID will be generated automatically from this title.
                </Text>
                <TextField
                  aria-label="New workflow name"
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
                  onPress={() => handleCreate(close)}
                  isDisabled={!workflowName || !selectedWorkflow}
                >
                  Add
                </Button>
              </ButtonGroup>
            </Content>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
};

export default ThemeProvider(CreateWorkflow);
