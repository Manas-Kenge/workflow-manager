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
import { addTransition, getWorkflows } from '../../actions';
import { useAppDispatch, useAppSelector } from '../../types';
import type { GlobalRootState } from '../../types';

export interface CreateTransitionProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
}

const messages = defineMessages({
  creationSuccessTitle: {
    id: 'Transition Created',
    defaultMessage: 'Transition Created',
  },
  creationSuccessContent: {
    id: 'The new transition has been added successfully.',
    defaultMessage: 'The new transition has been added successfully.',
  },
  creationErrorTitle: {
    id: 'Transition Creation Failed',
    defaultMessage: 'Transition Creation Failed',
  },
});

const CreateTransition = ({
  workflowId,
  isOpen,
  onClose,
}: CreateTransitionProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [cloneFromTransitionId, setCloneFromTransitionId] = useState<
    string | null
  >(null);
  const [newTransitionTitle, setNewTransitionTitle] = useState('');
  const [newTransitionDescription, setNewTransitionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWorkflow = useAppSelector((state: GlobalRootState) =>
    state.workflow.workflows.items.find((wf) => wf.id === workflowId),
  );

  const addTransitionStatus = useAppSelector(
    (state: GlobalRootState) => state.transition?.add,
  );

  useEffect(() => {
    if (!isOpen) {
      setCloneFromTransitionId(null);
      setNewTransitionTitle('');
      setNewTransitionDescription('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (addTransitionStatus?.loaded && isSubmitting) {
      setIsSubmitting(false);
      setNewTransitionTitle('');
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
    } else if (addTransitionStatus?.error && isSubmitting) {
      setIsSubmitting(false);
      const errorMessage = addTransitionStatus.error;
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.creationErrorTitle)}
          content={errorMessage}
        />,
      );
    }
  }, [addTransitionStatus, isSubmitting, onClose, intl]);

  const validateTransitionTitle = (title: string): string | null => {
    if (!title.trim()) {
      return 'Transition title is required';
    }
    if (title.length < 2) {
      return 'Transition title must be at least 2 characters';
    }

    const transitionId = title.trim().replace(/\s+/g, '_').toLowerCase();
    const existingTransition = currentWorkflow?.transitions?.find(
      (trans) =>
        trans.id === transitionId ||
        trans.title.toLowerCase() === title.toLowerCase(),
    );
    if (existingTransition) {
      return 'A transition with this title already exists';
    }

    return null;
  };

  const handleCreate = async () => {
    if (!newTransitionTitle || !currentWorkflow) return;

    const titleError = validateTransitionTitle(newTransitionTitle);
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
      const transitionId = newTransitionTitle
        .trim()
        .replace(/\s+/g, '_')
        .toLowerCase();

      const payload: {
        title: string;
        description?: string;
        clone_from_id?: string;
      } = {
        title: newTransitionTitle.trim(),
      };

      if (newTransitionDescription.trim()) {
        payload.description = newTransitionDescription.trim();
      }

      if (cloneFromTransitionId) {
        payload.clone_from_id = cloneFromTransitionId;
      }

      const result = await dispatch(
        addTransition(currentWorkflow.id, transitionId, payload),
      );

      if (result && !result.error) {
        await dispatch(getWorkflows());
      } else {
        setIsSubmitting(false);
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

  const titleError = newTransitionTitle
    ? validateTransitionTitle(newTransitionTitle)
    : null;
  const isFormValid = newTransitionTitle.trim() && !titleError && !isSubmitting;

  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <div style={{ display: 'none' }} />

      {(close) => (
        <Dialog>
          <Content>
            <Heading level={1}>Create new transition</Heading>
            <Text slot="description" marginBottom="size-300">
              This will add a new transition to the workflow "
              {currentWorkflow.title}".
            </Text>

            <Divider
              marginTop="size-200"
              marginBottom="size-200"
              UNSAFE_style={{ height: '1px', backgroundColor: '#e1e1e1' }}
            />

            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                Clone from existing transition (optional)
              </Heading>
              <Picker
                aria-label="Clone from existing transition"
                selectedKey={cloneFromTransitionId}
                onSelectionChange={(selected) =>
                  setCloneFromTransitionId(selected as string)
                }
                width="100%"
                items={currentWorkflow.transitions || []}
                placeholder="Select a transition to clone from..."
                isDisabled={isSubmitting}
              >
                {(transition) => (
                  <Item key={transition.id}>{transition.title}</Item>
                )}
              </Picker>
              <Text slot="description" marginTop="size-75">
                Cloning will copy the destination, guards, and other properties
                from the selected transition.
              </Text>
            </View>

            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                Transition Name *
              </Heading>
              <TextField
                aria-label="New transition name"
                value={newTransitionTitle}
                onChange={setNewTransitionTitle}
                isRequired
                width="100%"
                validationState={titleError ? 'invalid' : 'valid'}
                errorMessage={titleError}
                isDisabled={isSubmitting}
                description="Enter transition name..."
              />
            </View>

            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                Description (optional)
              </Heading>
              <TextField
                aria-label="Transition description"
                value={newTransitionDescription}
                onChange={setNewTransitionDescription}
                width="100%"
                isDisabled={isSubmitting}
                description="Enter a brief description of this transition..."
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
                {isSubmitting && (
                  <ProgressCircle
                    aria-label="Creating transition..."
                    size="S"
                    isIndeterminate
                  />
                )}
                {isSubmitting ? 'Creating...' : 'Add Transition'}
              </Button>
            </ButtonGroup>
          </Content>
        </Dialog>
      )}
    </DialogTrigger>
  );
};

export default CreateTransition;
