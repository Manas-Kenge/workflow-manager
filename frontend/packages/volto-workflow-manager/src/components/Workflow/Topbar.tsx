import {
  Flex,
  Heading,
  Picker,
  Item,
  Button,
  Text,
  View,
} from '@adobe/react-spectrum';
import AddCircle from '@spectrum-icons/workflow/AddCircle';

const TopBar = ({
  workflows,
  selectedWorkflowId,
  onSelectWorkflow,
  onCreateWorkflow,
}) => {
  const currentWorkflow = workflows.find((w) => w.id === selectedWorkflowId);

  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      alignItems="start"
      wrap
    >
      <View>
        <Heading level={2}>Workflow Manager</Heading>
        <Text>
          You are currently working on the "
          <strong>{currentWorkflow?.title || 'Unknown'}</strong>" workflow.
        </Text>
      </View>

      <Flex direction="row" gap="size-200" alignItems="end">
        <Picker
          aria-label="Select Workflow"
          selectedKey={selectedWorkflowId}
          onSelectionChange={onSelectWorkflow}
        >
          {workflows.map((wf) => (
            <Item key={wf.id}>{wf.title}</Item>
          ))}
        </Picker>

        <Button variant="accent" onPress={onCreateWorkflow}>
          <AddCircle size="S" />
          Create a new workflow
        </Button>
      </Flex>
    </Flex>
  );
};

export default TopBar;
