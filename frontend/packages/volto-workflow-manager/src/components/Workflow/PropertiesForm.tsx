import React, { useState, useEffect, useCallback } from 'react';
import { View, ProgressCircle } from '@adobe/react-spectrum';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';

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
      onDataChange(formData);
    } else {
      onDataChange(null);
    }
  }, [formData, item, onDataChange]);

  const handleChangeField = useCallback((id: string, value: any) => {
    setFormData((prevData) => ({
      ...(prevData ?? {}),
      [id]: value,
    }));
  }, []);

  const handleBlockChange = useCallback(
    (blockId: string, newFormData: { [key: string]: any }) => {
      setFormData(newFormData);
    },
    [],
  );

  if (!item || !formData) {
    return <ProgressCircle isIndeterminate aria-label="Loading item..." />;
  }

  return (
    <View padding="size-200">
      <BlockDataForm
        schema={schema}
        formData={formData}
        block={item.id}
        onChangeBlock={handleBlockChange}
        onChangeField={handleChangeField}
        editable={!isDisabled}
        hideActions
      />
    </View>
  );
};

export default PropertiesForm;
