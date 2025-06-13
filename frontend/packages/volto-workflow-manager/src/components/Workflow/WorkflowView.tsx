import { useEffect, useState } from 'react';
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
import WorkflowGraph from './WorkflowGraph';
import Toolbox from './Toolbox';
import '@xyflow/react/dist/style.css';
import {
  deleteWorkflow,
  getWorkflows,
  validateWorkflow,
  updateWorkflowState,
} from '../../actions';
import { useHistory } from 'react-router-dom';
import type { WorkflowState } from '../../reducers/workflow';
import { useAppSelector, useAppDispatch } from '../../types'; // Adjust path as needed

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

  // Now these will be properly typed!
  const workflows = useAppSelector((state) => state.workflow.workflows.items);
  const workflow = useAppSelector((state) =>
    state.workflow.workflows.items.find((w) => w.id === workflowId),
  );
  const validation = useAppSelector((state) => state.workflow.validation);

  useEffect(() => {
    if (workflow) {
      setDescription(workflow.description || '');
    }
  }, [workflow]);

  const handleHighlightState = (stateId: string) => {
    setHighlightedState(stateId);
    // Clear highlight after animation
    setTimeout(() => setHighlightedState(null), 3000);
  };

  const handleHighlightTransition = (transitionId: string) => {
    setHighlightedTransition(transitionId);
    // Clear highlight after animation
    setTimeout(() => setHighlightedTransition(null), 3000);
  };

  const handleDeleteWorkflow = async () => {
    const result = await dispatch(deleteWorkflow(workflowId));
    // You might need to adjust this condition based on your action structure
    if (result && !result.error) {
      dispatch(getWorkflows());
      history.push(`/controlpanel/workflowmanager`);
    }
  };

  const handleSaveState = (updatedState: WorkflowState) => {
    // Dispatch the action with the current workflow's ID and the new state data
    dispatch(updateWorkflowState(workflowId, updatedState));
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
              onPress={() => dispatch(validateWorkflow(workflowId))}
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

      {validation.loading && (
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

      {validation.errors && (
        <DialogTrigger>
          <ActionButton
            variant={
              validation.errors.state_errors.length > 0
                ? 'negative'
                : 'secondary'
            }
            marginBottom="size-300"
          >
            View Validation Results
          </ActionButton>
          {(close) => (
            <AlertDialog
              title="Validation Results"
              variant={
                validation.errors.state_errors.length > 0
                  ? 'warning'
                  : 'information'
              }
              primaryActionLabel="Close"
              onPrimaryAction={close}
            >
              {validation.errors.state_errors.length > 0 ? (
                <View>
                  {validation.errors.state_errors.map((err, index) => (
                    <Text key={index}>{err.error}</Text>
                  ))}
                </View>
              ) : (
                <Text>No validation errors found.</Text>
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
              onSaveState={handleSaveState}
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
