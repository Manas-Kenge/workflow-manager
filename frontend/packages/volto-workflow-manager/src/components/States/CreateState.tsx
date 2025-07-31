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
  StatusLight,
} from '@adobe/react-spectrum';
import { addState, getWorkflows } from '../../actions';
import { useAppDispatch, useAppSelector } from '../../types';
import type { GlobalRootState } from '../../types';
import type { CreateStateProps } from '../../types/state';

const CreateState = ({ workflowId, isOpen, onClose }: CreateStateProps) => {
  const dispatch = useAppDispatch();
  const [cloneFromStateId, setCloneFromStateId] = useState<string | null>(null);
  const [newStateTitle, setNewStateTitle] = useState('');
  const [newStateDescription, setNewStateDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const currentWorkflow = useAppSelector((state: GlobalRootState) =>
    state.workflow.workflows.items.find((wf) => wf.id === workflowId),
  );

  const addStateStatus = useAppSelector(
    (state: GlobalRootState) => state.state?.add,
  );

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCloneFromStateId(null);
      setNewStateTitle('');
      setNewStateDescription('');
      setIsSubmitting(false);
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  // Handle add state response
  useEffect(() => {
    if (addStateStatus?.loaded && isSubmitting) {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Auto-close after success (optional)
      setTimeout(() => {
        onClose();
      }, 1500);
    } else if (addStateStatus?.error && isSubmitting) {
      setIsSubmitting(false);
      setSubmitError(addStateStatus.error);
    }
  }, [addStateStatus, isSubmitting, onClose]);

  const validateStateTitle = (title: string): string | null => {
    if (!title.trim()) {
      return 'State title is required';
    }
    if (title.length < 2) {
      return 'State title must be at least 2 characters';
    }
    if (title.length > 50) {
      return 'State title must be less than 50 characters';
    }

    // Check if state with similar ID might already exist
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

  const handleCreate = async (closeDialog: () => void) => {
    if (!newStateTitle || !currentWorkflow) return;

    const titleError = validateStateTitle(newStateTitle);
    if (titleError) {
      setSubmitError(titleError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

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
        // Refresh workflows to get updated state list
        await dispatch(getWorkflows());
        // Don't close immediately - let the useEffect handle it after success state
      } else {
        setIsSubmitting(false);
        setSubmitError(result?.error || 'Failed to create state');
      }
    } catch (error: any) {
      setIsSubmitting(false);
      setSubmitError(error?.message || 'An unexpected error occurred');
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

            {/* Success Message */}
            {submitSuccess && (
              <View marginBottom="size-300">
                <StatusLight variant="positive">
                  State created successfully! Closing dialog...
                </StatusLight>
              </View>
            )}

            {/* Error Message */}
            {submitError && (
              <View marginBottom="size-300">
                <StatusLight variant="negative">{submitError}</StatusLight>
              </View>
            )}

            {/* Clone From Section */}
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

            {/* State Name Section */}
            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                State Name *
              </Heading>
              <TextField
                label="New state name"
                hideLabel
                value={newStateTitle}
                onChange={setNewStateTitle}
                isRequired
                width="100%"
                validationState={titleError ? 'invalid' : 'valid'}
                errorMessage={titleError}
                isDisabled={isSubmitting}
                placeholder="Enter state name..."
              />
            </View>

            {/* State Description Section */}
            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                Description (optional)
              </Heading>
              <TextField
                label="State description"
                hideLabel
                value={newStateDescription}
                onChange={setNewStateDescription}
                width="100%"
                isDisabled={isSubmitting}
                placeholder="Enter a brief description of this state..."
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
                onPress={() => handleCreate(close)}
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
