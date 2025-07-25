import React, { useCallback } from 'react';
import { View, Text } from '@adobe/react-spectrum';
import Form from '@plone/volto/components/manage/Form/Form';

export interface PropertiesData {
  title: string;
  description: string;
  new_state_id: string | null;
  trigger_type: boolean;
}

interface PropertiesTabProps {
  data: PropertiesData;
  schema: any;
  onChange: (newData: PropertiesData) => void;
  isDisabled: boolean;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  data,
  schema,
  onChange,
  isDisabled,
}) => {
  const handleChangeField = useCallback(
    (id: string, value: any) => {
      onChange({
        ...data,
        [id]: value,
      });
    },
    [data, onChange],
  );

  if (isDisabled) {
    return <Text>Select a transition to edit its properties.</Text>;
  }

  return (
    <View>
      <Form
        schema={schema}
        formData={data}
        onChangeField={handleChangeField}
        hideActions
      />
    </View>
  );
};

export default PropertiesTab;
