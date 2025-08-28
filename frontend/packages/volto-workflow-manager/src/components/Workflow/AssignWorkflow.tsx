import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogContainer,
  Heading,
  Item,
  Picker,
  ProgressCircle,
} from '@adobe/react-spectrum';
import { toast } from 'react-toastify';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { useIntl, defineMessages } from 'react-intl';
import { assignWorkflow, getWorkflow } from '../../actions';
import { useAppDispatch } from '../../types';
import type { AssignWorkflowProps } from '../../types/workflow';

const messages = defineMessages({
  title: { id: 'Assign Workflow', defaultMessage: 'Assign Workflow' },
  label: {
    id: 'Select the content type you would like to assign this workflow to.',
    defaultMessage:
      'Select the content type you would like to assign this workflow to.',
  },
  placeholder: {
    id: 'Select a content type...',
    defaultMessage: 'Select a content type...',
  },
  assign: {
    id: 'Assign',
    defaultMessage: 'Assign',
  },
  assigning: {
    id: 'Assigning...',
    defaultMessage: 'Assigning...',
  },
  cancel: {
    id: 'Cancel',
    defaultMessage: 'Cancel',
  },
  success: {
    id: 'Workflow Assigned',
    defaultMessage: 'Workflow Assigned',
  },
  successContent: {
    id: 'The workflow has been assigned successfully.',
    defaultMessage: 'The workflow has been assigned successfully.',
  },
  error: { id: 'Assignment Failed', defaultMessage: 'Assignment Failed' },
});

const AssignWorkflow: React.FC<AssignWorkflowProps> = ({
  workflow,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTypeId(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedTypeId || !workflow?.id) return;

    setIsSubmitting(true);
    try {
      await dispatch(assignWorkflow(workflow.id, selectedTypeId));
      toast.success(
        <Toast
          success
          title={intl.formatMessage(messages.success)}
          content={intl.formatMessage(messages.successContent)}
        />,
      );
      await dispatch(getWorkflow(workflow.id));
      onClose();
    } catch (error: any) {
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.error)}
          content={error.message || 'An unknown error occurred.'}
        />,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !workflow) {
    return null;
  }

  const assignableTypes = workflow.context_data?.assignable_types || [];

  return (
    <DialogContainer onDismiss={onClose}>
      <Dialog>
        <Heading>{intl.formatMessage(messages.title)}</Heading>
        <Content>
          <Picker
            label={intl.formatMessage(messages.label)}
            placeholder={intl.formatMessage(messages.placeholder)}
            items={assignableTypes}
            selectedKey={selectedTypeId}
            onSelectionChange={(key) => setSelectedTypeId(key as string)}
            isDisabled={isSubmitting || assignableTypes.length === 0}
            marginTop="size-200"
            width="100%"
          >
            {(item) => <Item key={item.id}>{item.title}</Item>}
          </Picker>
        </Content>
        <ButtonGroup>
          <Button
            variant="secondary"
            onPress={onClose}
            isDisabled={isSubmitting}
          >
            {intl.formatMessage(messages.cancel)}
          </Button>
          <Button
            variant="accent"
            onPress={handleAssign}
            isDisabled={!selectedTypeId || isSubmitting}
          >
            {isSubmitting && (
              <ProgressCircle
                aria-label="Assigning workflow"
                size="S"
                isIndeterminate
              />
            )}
            {isSubmitting
              ? intl.formatMessage(messages.assigning)
              : intl.formatMessage(messages.assign)}
          </Button>
        </ButtonGroup>
      </Dialog>
    </DialogContainer>
  );
};

export default AssignWorkflow;
