import React from 'react';
import {
  Checkbox,
  TextField,
  TextArea,
  Heading,
  View,
  Content,
  Text,
  Flex,
} from '@adobe/react-spectrum';

interface PropertiesTabProps {
  isInitialState: boolean;
  title: string;
  description: string;
  onToggleInitial: () => void;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  isInitialState,
  title,
  description,
  onToggleInitial,
  onChangeTitle,
  onChangeDescription,
}) => {
  return (
    <View
      borderWidth="thin"
      borderColor="dark"
      borderRadius="medium"
      padding="size-200"
    >
      <Heading level={3}>Properties</Heading>

      <Flex direction="column" gap="size-200" marginTop="size-200">
        <Checkbox isSelected={isInitialState} onChange={onToggleInitial}>
          Initial State
        </Checkbox>
        <Text UNSAFE_className="discreet" color="gray-500">
          Should this state be the initial state of the workflow?
        </Text>

        <TextField
          label="The title of this State"
          value={title}
          onChange={onChangeTitle}
        />

        <TextArea
          label="The description of this State"
          value={description}
          onChange={onChangeDescription}
        />
      </Flex>
    </View>
  );
};

export default PropertiesTab;
