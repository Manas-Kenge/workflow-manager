import React from 'react';
import { Checkbox, Flex, View } from '@adobe/react-spectrum';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';

export interface PropertiesData {
  isInitialState: boolean;
  title: string;
  description: string;
}

interface PropertiesTabProps {
  data: PropertiesData;
  schema: any;
  onChange: (newData: PropertiesData) => void;
  isDisabled: boolean;
  stateId: string;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  data,
  schema,
  onChange,
  isDisabled,
  stateId,
}) => {
  const handleFormChange = (fieldId: string, value: any) => {
    onChange({
      ...data,
      [fieldId]: value,
    });
  };

  const handleToggleInitial = () => {
    onChange({
      ...data,
      isInitialState: !data.isInitialState,
    });
  };

  return (
    <View>
      <Flex direction="column" gap="size-200">
        <Checkbox
          isSelected={data.isInitialState}
          onChange={handleToggleInitial}
          isDisabled={isDisabled}
        >
          Initial State
        </Checkbox>
        <BlockDataForm
          key={stateId}
          schema={schema}
          formData={data}
          onChangeField={handleFormChange}
          block={stateId}
          isDisabled={isDisabled}
        />
      </Flex>
    </View>
  );
};

export default PropertiesTab;
