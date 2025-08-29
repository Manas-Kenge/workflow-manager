import React, { useCallback } from 'react';
import {
  View,
  Text,
  Flex,
  DialogTrigger,
  AlertDialog,
  Button,
} from '@adobe/react-spectrum';
import { BlockDataForm } from '@plone/volto/components/manage/Form';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import deleteIcon from '@plone/volto/icons/delete.svg';

import type { PropertiesTabProps } from '../../../types/state';

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  data,
  schema,
  onChange,
  handleDeleteState,
  selectedStateId,
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
    return <Text>Select a state to edit its properties.</Text>;
  }

  return (
    <View>
      <Flex justifyContent="end" margin="size-100">
        <DialogTrigger>
          <Button variant="negative" isDisabled={isDisabled}>
            <Icon name={deleteIcon} size="20px" />
          </Button>
          <AlertDialog
            title="Delete State"
            variant="destructive"
            primaryActionLabel="Delete"
            cancelLabel="Cancel"
            onPrimaryAction={() => handleDeleteState(selectedStateId)}
          >
            Are you sure you want to delete this state? This action cannot be
            undone.
          </AlertDialog>
        </DialogTrigger>
      </Flex>
      <BlockDataForm
        formData={data}
        schema={schema}
        onChangeField={handleChangeField}
      />
    </View>
  );
};

export default PropertiesTab;
