import React, { useCallback } from 'react';
import { View, Text } from '@adobe/react-spectrum';
import Form from '@plone/volto/components/manage/Form/Form';
import type { PropertiesTabProps } from '../../../types/transition';

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
        key={JSON.stringify(data)}
        schema={schema}
        formData={data}
        onChangeField={handleChangeField}
        editable={!isDisabled}
        hideActions
      />
    </View>
  );
};

export default PropertiesTab;
