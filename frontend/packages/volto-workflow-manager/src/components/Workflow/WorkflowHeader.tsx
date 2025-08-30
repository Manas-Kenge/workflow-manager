import { Flex, Heading, Text, View } from '@adobe/react-spectrum';
import type { WorkflowHeaderProps } from '../../types/workflow';

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ workflow }) => {
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
          <strong>{workflow?.title || 'Unknown'}</strong>" workflow.
        </Text>
      </View>
    </Flex>
  );
};

export default WorkflowHeader;
