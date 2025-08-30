import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogContainer,
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
import { createAndLinkTransition } from '../../actions/transition';
import { getWorkflow } from '../../actions/workflow';
import {
  type GlobalRootState,
  useAppDispatch,
  useAppSelector,
} from '../../types';

export interface CreateTransitionProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
  initialSourceStateId?: string | null;
  initialDestinationStateId?: string | null;
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
  initialSourceStateId,
  initialDestinationStateId,
}: CreateTransitionProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [cloneFromTransitionId, setCloneFromTransitionId] = useState<
    string | null
  >(null);
  const [newTransitionTitle, setNewTransitionTitle] = useState('');
  const [newTransitionDescription, setNewTransitionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [destinationStateId, setDestinationStateId] = useState<string | null>(
    null,
  );

  const currentWorkflow = useAppSelector(
    (state: GlobalRootState) => state.workflow.workflow.currentWorkflow,
  );

  useEffect(() => {
    if (isOpen) {
      setDestinationStateId(initialDestinationStateId || null);
    } else {
      setCloneFromTransitionId(null);
      setNewTransitionTitle('');
      setNewTransitionDescription('');
      setIsSubmitting(false);
      setDestinationStateId(null);
    }
  }, [isOpen, initialDestinationStateId]);

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
    if (!newTransitionTitle || !destinationStateId || !currentWorkflow) return;
    const sourceStateId = initialSourceStateId;
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

    const transitionId = newTransitionTitle
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase();

    const payload = {
      title: newTransitionTitle.trim(),
      new_state_id: destinationStateId,
      description: newTransitionDescription.trim() || undefined,
      clone_from_id: cloneFromTransitionId || undefined,
    };

    const result = await dispatch(
      createAndLinkTransition(workflowId, transitionId, payload, sourceStateId),
    );

    setIsSubmitting(false);

    if (result && !result.error) {
      toast.success(
        <Toast
          success
          title={intl.formatMessage(messages.creationSuccessTitle)}
          content={intl.formatMessage(messages.creationSuccessContent)}
        />,
      );
      await dispatch(getWorkflow(workflowId));
      onClose();
    }
  };

  if (!isOpen || !currentWorkflow) {
    return null;
  }

  const titleError = newTransitionTitle
    ? validateTransitionTitle(newTransitionTitle)
    : null;
  const isFormValid =
    newTransitionTitle.trim() &&
    destinationStateId &&
    !titleError &&
    !isSubmitting;

  return (
    <DialogContainer onDismiss={onClose}>
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
              Destination State *
            </Heading>
            <Picker
              aria-label="Select the destination state for the transition"
              selectedKey={destinationStateId}
              onSelectionChange={(selected) =>
                setDestinationStateId(selected as string)
              }
              width="100%"
              items={currentWorkflow.states || []}
              placeholder="Select a destination state..."
              isDisabled={isSubmitting || !!initialDestinationStateId}
              isRequired
            >
              {(state) => <Item key={state.id}>{state.title}</Item>}
            </Picker>
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
        </Content>
        <ButtonGroup>
          <Button
            variant="secondary"
            onPress={onClose}
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
      </Dialog>
    </DialogContainer>
  );
};

export default CreateTransition;
