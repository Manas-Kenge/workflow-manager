import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogTrigger,
  Divider,
  Heading,
  Item,
  Picker,
  Text,
  TextField,
  View,
  ProgressCircle,
} from '@adobe/react-spectrum';
import { toast } from 'react-toastify';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { useIntl, defineMessages } from 'react-intl';
import { addState, getWorkflows } from '../../actions';
import { useAppDispatch, useAppSelector } from '../../types';
import type { GlobalRootState } from '../../types';
import type { CreateStateProps } from '../../types/state';

const messages = defineMessages({
  creationSuccessTitle: {
    id: 'State Created',
    defaultMessage: 'State Created',
  },
  creationSuccessContent: {
    id: 'The new state has been added successfully.',
    defaultMessage: 'The new state has been added successfully.',
  },
  creationErrorTitle: {
    id: 'State Creation Failed',
    defaultMessage: 'State Creation Failed',
  },
});

const CreateState = ({ workflowId, isOpen, onClose }: CreateStateProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [cloneFromStateId, setCloneFromStateId] = useState<string | null>(null);
  const [newStateTitle, setNewStateTitle] = useState('');
  const [newStateDescription, setNewStateDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWorkflow = useAppSelector((state: GlobalRootState) =>
    state.workflow.workflows.items.find((wf) => wf.id === workflowId),
  );

  const addStateStatus = useAppSelector((state: RootState) => state.state?.add);

  useEffect(() => {
    if (!isOpen) {
      setCloneFromStateId(null);
      setNewStateTitle('');
      setNewStateDescription('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (addStateStatus?.loaded && isSubmitting) {
      setIsSubmitting(false);
      setNewStateTitle('');
      toast.success(
        <Toast
          success
          title={intl.formatMessage(messages.creationSuccessTitle)}
          content={intl.formatMessage(messages.creationSuccessContent)}
        />,
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } else if (addStateStatus?.error && isSubmitting) {
      setIsSubmitting(false);
      const errorMessage = addStateStatus.error;
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.creationErrorTitle)}
          content={errorMessage}
        />,
      );
    }
  }, [addStateStatus, isSubmitting, onClose, intl]);

  const validateStateTitle = (title: string): string | null => {
    if (!title.trim()) {
      return 'State title is required';
    }
    if (title.length < 2) {
      return 'State title must be at least 2 characters';
    }

    const stateId = title.trim().replace(/\s+/g, '_').toLowerCase();
    const existingState = currentWorkflow?.states?.find(
      (state) =>
        state.id === stateId ||
        state.title.toLowerCase() === title.toLowerCase(),
    );
    if (existingState) {
      return 'A state with this title already exists';
    }

    return null;
  };

  const handleCreate = async () => {
    if (!newStateTitle || !currentWorkflow) return;

    const titleError = validateStateTitle(newStateTitle);
    if (titleError) {
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.creationErrorTitle)}
          content={titleError}
        />,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const stateData: {
        title: string;
        description?: string;
        clone_from_id?: string;
      } = {
        title: newStateTitle.trim(),
      };

      if (newStateDescription.trim()) {
        stateData.description = newStateDescription.trim();
      }

      if (cloneFromStateId) {
        stateData.clone_from_id = cloneFromStateId;
      }

      const result = await dispatch(addState(currentWorkflow.id, stateData));

      if (result && !result.error) {
        await dispatch(getWorkflows());
      } else {
        setIsSubmitting(false);
        // The useEffect hook will handle the toast for the API error
      }
    } catch (error: any) {
      setIsSubmitting(false);
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.creationErrorTitle)}
          content={errorMessage}
        />,
      );
    }
  };

  if (!currentWorkflow) {
    return null;
  }

  const titleError = newStateTitle ? validateStateTitle(newStateTitle) : null;
  const isFormValid = newStateTitle.trim() && !titleError && !isSubmitting;

  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <div style={{ display: 'none' }} />

      {(close) => (
        <Dialog>
          <Content>
            <Heading level={1}>Create new state</Heading>
            <Text slot="description" marginBottom="size-300">
              This will add a new state to the workflow "{currentWorkflow.title}
              ".
            </Text>

            <Divider
              marginTop="size-200"
              marginBottom="size-200"
              UNSAFE_style={{ height: '1px', backgroundColor: '#e1e1e1' }}
            />

            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                Clone from existing state (optional)
              </Heading>
              <Picker
                selectedKey={cloneFromStateId}
                onSelectionChange={(selected) =>
                  setCloneFromStateId(selected as string)
                }
                width="100%"
                items={currentWorkflow.states || []}
                placeholder="Select a state to clone from..."
                isDisabled={isSubmitting}
              >
                {(state) => <Item key={state.id}>{state.title}</Item>}
              </Picker>
              <Text slot="description" marginTop="size-75">
                Cloning will copy permissions, roles, and transitions from the
                selected state.
              </Text>
            </View>

            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                State Name *
              </Heading>
              <TextField
                value={newStateTitle}
                onChange={setNewStateTitle}
                isRequired
                width="100%"
                validationState={titleError ? 'invalid' : 'valid'}
                errorMessage={titleError}
                isDisabled={isSubmitting}
                description="Enter state name..."
              />
            </View>

            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                Description (optional)
              </Heading>
              <TextField
                value={newStateDescription}
                onChange={setNewStateDescription}
                width="100%"
                isDisabled={isSubmitting}
                description="Enter a brief description of this state..."
              />
            </View>

            <ButtonGroup>
              <Button
                variant="secondary"
                onPress={close}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onPress={handleCreate}
                isDisabled={!isFormValid}
              >
                {isSubmitting && <ProgressCircle size="S" />}
                {isSubmitting ? 'Creating...' : 'Add State'}
              </Button>
            </ButtonGroup>
          </Content>
        </Dialog>
      )}
    </DialogTrigger>
  );
};

export default CreateState;
