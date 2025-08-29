import React, { useCallback } from 'react';

import type { PropertiesTabProps } from '../../../types/transition';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import {
  View,
  Text,
  Flex,
  DialogTrigger,
  AlertDialog,
  Button,
} from '@adobe/react-spectrum';

import Icon from '@plone/volto/components/theme/Icon/Icon';
import deleteIcon from '@plone/volto/icons/delete.svg';

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  data,
  schema,
  onChange,
  isDisabled,
  handleDeleteTransition,
  selectedTransitionId,
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
            onPrimaryAction={() => handleDeleteTransition(selectedTransitionId)}
          >
            Are you sure you want to delete this transition? This action cannot
            be undone.
          </AlertDialog>
        </DialogTrigger>
      </Flex>
      <BlockDataForm
        formData={data}
        schema={schema}
        onChangeField={handleChangeField}
      />
      {/* <Form
        key={JSON.stringify(data)}
        schema={schema}
        formData={data}
        onChangeField={handleChangeField}
        editable={!isDisabled}
        hideActions
      /> */}
    </View>
  );
};

export default PropertiesTab;
