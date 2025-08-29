import React from 'react';
import {
  Button,
  AlertDialog,
  DialogTrigger,
  Text,
} from '@adobe/react-spectrum';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import deleteIcon from '@plone/volto/icons/delete.svg';

const Buttons = (props) => {
  const {
    isDisabled,
    buttonTitle = 'Delete',
    variant = 'negative',
    icon = deleteIcon,
    dialogTitle = 'Confirm Action',
    dialogText = 'Are you sure you want to proceed? This action cannot be undone.',
    onPrimaryAction,
  } = props;

  if (!onPrimaryAction) {
    return null;
  }

  return (
    <FormFieldWrapper {...props} wrapped={false}>
      <DialogTrigger>
        <Button variant={variant} isDisabled={isDisabled}>
          <Icon name={icon} size="20px" />
          <Text>{buttonTitle}</Text>
        </Button>
        <AlertDialog
          title={dialogTitle}
          variant="destructive"
          primaryActionLabel={buttonTitle}
          cancelLabel="Cancel"
          onPrimaryAction={onPrimaryAction}
        >
          {dialogText}
        </AlertDialog>
      </DialogTrigger>
    </FormFieldWrapper>
  );
};

export default Buttons;
