// --- START OF FILE WorkflowView.tsx ---

import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  selectAllWorkflows,
  selectValidationLoading,
  selectValidationResult,
  clearValidationResult,
  type WorkflowState,
} from '../../features/workflow/workflowSlice';
// Import action creators
import {
  deleteWorkflow,
  validateWorkflow,
  updateWorkflowState, // [ADDED]
} from '../../actions/workflow';
import WorkflowGraph from './WorkflowGraph';
import {
  Button,
  ButtonGroup,
  Switch,
  ProgressCircle,
  AlertDialog,
  DialogTrigger,
  ActionButton,
  Text,
  Form,
  View,
  Flex,
  Grid,
} from '@adobe/react-spectrum';
import AddCircle from '@spectrum-icons/workflow/AddCircle';
import LinkOut from '@spectrum-icons/workflow/LinkOut';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import UserAdd from '@spectrum-icons/workflow/UserAdd';
import Delete from '@spectrum-icons/workflow/Delete';
import SaveFloppy from '@spectrum-icons/workflow/SaveFloppy';
import TopBar from './Topbar';
import Toolbox from './Toolbox';
import '@xyflow/react/dist/style.css';

interface WorkflowViewProps {
  workflowId: string;
}

const WorkflowView: React.FC<WorkflowViewProps> = ({ workflowId }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [highlightedState, setHighlightedState] = useState<string | null>(null);
  const [highlightedTransition, setHighlightedTransition] = useState<
    string | null
  >(null);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');

  const workflows = useAppSelector(selectAllWorkflows);
  const validation = useAppSelector(selectValidationResult); // [ADDED]
  const validationLoading = useAppSelector(selectValidationLoading); // [ADDED]
  const workflow = workflows.find((w) => w.id === workflowId);

  useEffect(() => {
    if (workflow) {
      setDescription(workflow.description || '');
    }
  }, [workflow]);

  // [ADDED] Clear validation results when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearValidationResult());
    };
  }, [dispatch]);

  const handleHighlightState = (stateId: string) => {
    setHighlightedState(stateId);
    setTimeout(() => setHighlightedState(null), 3000);
  };

  const handleHighlightTransition = (transitionId: string) => {
    setHighlightedTransition(transitionId);
    setTimeout(() => setHighlightedTransition(null), 3000);
  };

  const handleDeleteWorkflow = async () => {
    await dispatch(deleteWorkflow(workflowId));
    history.push(`/controlpanel/workflowmanager`);
  };

  // [ADDED] Handle saving a state change from the Toolbox
  const handleSaveState = (state: WorkflowState) => {
    dispatch(updateWorkflowState(workflowId, state));
  };

  if (!workflow) {
    return (
      <Form>
        <View padding="size-400">
          <Flex alignItems="center" gap="size-200">
            <ProgressCircle aria-label="Loading workflow..." isIndeterminate />
            <Text>Loading workflow...</Text>
          </Flex>
        </View>
      </Form>
    );
  }

  const validationHasErrors =
    validation &&
    (validation.state_errors.length > 0 ||
      validation.transition_errors.length > 0 ||
      validation.initial_state_error);

  return (
    <View width="100%" padding="size-400" margin="0">
      <View
        padding="size-200"
        backgroundColor="gray-100"
        borderColor="gray-300"
        borderWidth="thin"
        borderRadius="medium"
      >
        <TopBar
          workflows={workflows}
          selectedWorkflowId={workflow.id}
          onSelectWorkflow={(id: string) =>
            history.push(`/controlpanel/workflowmanager?workflow=${id}`)
          }
          onCreateWorkflow={() =>
            history.push(`/controlpanel/workflowmanager/create`)
          }
        />
      </View>

      <View
        backgroundColor="gray-100"
        padding="size-300"
        marginBottom="size-300"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <ButtonGroup>
            <Button variant="accent">
              <AddCircle size="S" />
              Add State
            </Button>
            <Button variant="secondary">
              <LinkOut size="S" />
              Add Transition
            </Button>
            <Button
              variant="secondary"
              onPress={() => dispatch(validateWorkflow(workflowId))} // [MODIFIED]
            >
              <CheckmarkCircle size="S" />
              Sanity Check
            </Button>
            <Button variant="secondary">
              <UserAdd size="S" />
              Assign
            </Button>
            <Button
              variant="negative"
              style="fill"
              onPress={handleDeleteWorkflow}
            >
              <Delete size="S" />
              Delete
            </Button>
          </ButtonGroup>

          <Switch isSelected={advancedMode} onChange={setAdvancedMode}>
            Advanced mode
          </Switch>
          <Button variant="secondary">
            <SaveFloppy size="S" />
            Save
          </Button>
        </Flex>
      </View>

      {/* [MODIFIED] Enabled validation loading indicator */}
      {validationLoading && (
        <View
          backgroundColor="gray-100"
          borderRadius="medium"
          padding="size-300"
          marginBottom="size-300"
        >
          <Flex alignItems="center" gap="size-200">
            <ProgressCircle
              aria-label="Validating workflow..."
              isIndeterminate
            />
            <Text>Validating workflow...</Text>
          </Flex>
        </View>
      )}

      {/* [MODIFIED] Enabled validation results dialog */}
      {validation && (
        <DialogTrigger
          isDismissable
          onOpenChange={() => dispatch(clearValidationResult())}
        >
          <ActionButton
            variant={validationHasErrors ? 'negative' : 'secondary'}
            marginBottom="size-300"
          >
            View Validation Results
          </ActionButton>
          {(close) => (
            <AlertDialog
              title="Validation Results"
              variant={validationHasErrors ? 'warning' : 'information'}
              primaryActionLabel="Close"
              onPrimaryAction={close}
            >
              {!validationHasErrors ? (
                <Text>No validation errors found.</Text>
              ) : (
                <View>
                  {validation.initial_state_error && (
                    <Text>Error: The initial state is invalid.</Text>
                  )}
                  {validation.state_errors.map((err, index) => (
                    <Text key={`state-err-${index}`}>
                      State "{err.title}": {err.error}
                    </Text>
                  ))}
                  {validation.transition_errors.map((err, index) => (
                    <Text key={`trans-err-${index}`}>
                      Transition "{err.title}": {err.error}
                    </Text>
                  ))}
                </View>
              )}
            </AlertDialog>
          )}
        </DialogTrigger>
      )}

      <View backgroundColor="gray-100" borderRadius="medium">
        <Grid
          areas={['sidebar content']}
          columns={['1fr', '3fr']}
          gap="size-300"
          height="500px"
        >
          <View gridArea="sidebar">
            <Toolbox
              workflow={workflow}
              onHighlightState={handleHighlightState}
              onHighlightTransition={handleHighlightTransition}
              onSaveState={handleSaveState} // [MODIFIED] Pass the handler
            />
          </View>
          <View gridArea="content" height="100%">
            {workflow ? (
              <WorkflowGraph
                workflow={workflow}
                highlightedState={highlightedState}
                highlightedTransition={highlightedTransition}
              />
            ) : (
              <Flex alignItems="center" justifyContent="center" height="100%">
                <Flex alignItems="center" gap="size-200">
                  <ProgressCircle
                    aria-label="Loading workflow graph..."
                    isIndeterminate
                  />
                  <Text>Loading workflow graph...</Text>
                </Flex>
              </Flex>
            )}
          </View>
        </Grid>
      </View>
    </View>
  );
};

export default WorkflowView;
