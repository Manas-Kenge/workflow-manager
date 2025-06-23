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
} from '@adobe/react-spectrum';
import { addState, getWorkflows } from '../../actions';
import { useAppDispatch, useAppSelector } from '../../types';
import type { RootState } from '../../types';

// The props remain the same: the parent controls visibility.
interface CreateStateProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CreateState = ({ workflowId, isOpen, onClose }: CreateStateProps) => {
  const dispatch = useAppDispatch();
  const [cloneFromStateId, setCloneFromStateId] = useState<string | null>(null);
  const [newStateTitle, setNewStateTitle] = useState('');

  const currentWorkflow = useAppSelector((state: RootState) =>
    state.workflow.workflows.items.find((wf) => wf.id === workflowId),
  );

  // When the dialog is instructed to close, reset the internal form state.
  useEffect(() => {
    if (!isOpen) {
      setCloneFromStateId(null);
      setNewStateTitle('');
    }
  }, [isOpen]);

  const handleCreate = (closeDialog: () => void) => {
    if (newStateTitle && currentWorkflow) {
      dispatch(
        addState(currentWorkflow.id, {
          title: newStateTitle,
          clone_from_id: cloneFromStateId || undefined,
        }),
      ).then(() => {
        dispatch(getWorkflows());
      });
      // We call the close function provided by DialogTrigger's render prop,
      // which will in turn trigger our parent's onClose handler.
      closeDialog();
    }
  };

  if (!currentWorkflow) {
    return null;
  }

  // This is the key change. We wrap the Dialog in a DialogTrigger and
  // control the DialogTrigger's state.
  return (
    <DialogTrigger
      isOpen={isOpen}
      // onOpenChange is called when the user dismisses the dialog (e.g., with ESC).
      // We ensure our parent's state is updated.
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      {/*
        This is a hidden trigger element. Since our real button is in the
        ActionsToolbar, this one is never seen or used by the user.
        It's a standard pattern for programmatically controlled dialogs.
      */}
      <div style={{ display: 'none' }} />

      {/* The Dialog is now a child of DialogTrigger, which provides a `close` function */}
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
              UNSAFE_style={{ height: '1px', backgroundColor: '#gray-300' }}
            />
            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                Clone from
              </Heading>
              <Picker
                selectedKey={cloneFromStateId}
                onSelectionChange={(selected) =>
                  setCloneFromStateId(selected as string)
                }
                width="100%"
                items={currentWorkflow.states}
              >
                {(state) => <Item key={state.id}>{state.title}</Item>}
              </Picker>
            </View>
            <View marginBottom="size-300">
              <Heading level={3} marginBottom="size-100">
                State Name
              </Heading>
              <TextField
                label="New state name"
                hideLabel
                value={newStateTitle}
                onChange={setNewStateTitle}
                isRequired
                width="100%"
              />
            </View>
            <ButtonGroup>
              {/* The buttons now use the `close` function from the DialogTrigger */}
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onPress={() => handleCreate(close)}
                isDisabled={!newStateTitle}
              >
                Add
              </Button>
            </ButtonGroup>
          </Content>
        </Dialog>
      )}
    </DialogTrigger>
  );
};

export default CreateState;
