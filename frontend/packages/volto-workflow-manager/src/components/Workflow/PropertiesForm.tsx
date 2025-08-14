import React, { useState, useEffect, useCallback } from 'react';
import { View, ProgressCircle } from '@adobe/react-spectrum';
import Form from '@plone/volto/components/manage/Form/Form';

interface PropertiesFormProps {
  schema: any;
  item: { [key: string]: any } | null | undefined;
  onDataChange: (payload: any | null) => void;
  isDisabled: boolean;
}

const PropertiesForm: React.FC<PropertiesFormProps> = ({
  schema,
  item,
  onDataChange,
  isDisabled,
}) => {
  const [formData, setFormData] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
      });
    }
  }, [item]);

  useEffect(() => {
    if (!formData || !item) return;

    const hasUnsavedChanges = !(
      formData.title === item.title && formData.description === item.description
    );

    if (hasUnsavedChanges) {
      const payload = item.id ? { id: item.id, ...formData } : formData;
      onDataChange(payload);
    } else {
      onDataChange(null);
    }
  }, [formData, onDataChange, item]);

  const handleFormChange = useCallback(
    (newFormData: { [key: string]: any }) => {
      setFormData(newFormData);
    },
    [],
  );

  if (!item || !formData) {
    return <ProgressCircle isIndeterminate aria-label="Loading item..." />;
  }

  return (
    <View padding="size-200">
      <Form
        schema={schema}
        formData={formData}
        onChangeFormData={handleFormChange}
        editable={!isDisabled}
        hideActions
      />
    </View>
  );
};

export default PropertiesForm;
