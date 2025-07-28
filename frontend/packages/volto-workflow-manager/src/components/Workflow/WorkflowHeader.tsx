import { Flex, Heading, Text, View } from '@adobe/react-spectrum';

const WorkflowHeader = ({ workflows, selectedWorkflowId }) => {
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
    </Flex>
  );
};

export default WorkflowHeader;
