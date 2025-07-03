import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../types';
import { useLocation, useHistory, Link } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Heading,
  Text,
  ProgressCircle,
  DialogTrigger,
  ActionButton,
  Flex,
  Form,
  Well,
  Item,
  View,
  Column,
  TableHeader,
  Cell,
  Row,
  TableBody,
  TableView,
  MenuTrigger,
  Menu,
  Dialog,
  TextField,
  Content,
} from '@adobe/react-spectrum';
import {
  getWorkflows,
  addWorkflow,
  deleteWorkflow,
  renameWorkflow,
} from '../../actions';
import CreateWorkflow from '../Workflow/CreateWorkflow';
import WorkflowView from '../Workflow/WorkflowView';
import ThemeProvider from '../../Provider';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import add from '@plone/volto/icons/add.svg';
import back from '@plone/volto/icons/back.svg';
import more from '@plone/volto/icons/more.svg';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { createPortal } from 'react-dom';
import { useClient } from '@plone/volto/hooks/client/useClient';

const plone_shipped_workflows = [
  'folder_workflow',
  'intranet_folder_workflow',
  'intranet_workflow',
  'one_state_workflow',
  'plone_workflow',
  'simple_publication_workflow',
  'comment_review_workflow',
  'comment_one_state_workflow',
];

interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  assignedTypes: string | null;
}

const WorkflowTable = ({ workflows, handleWorkflowClick, isClickable }) => {
  const dispatch = useAppDispatch();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [workflowToRename, setWorkflowToRename] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const workflowItems: WorkflowItem[] = workflows.map((workflow) => ({
    id: workflow.id,
    title: workflow.title || workflow.id,
    description: workflow.description || 'No description available',
    assignedTypes:
      workflow.assigned_types?.length > 0
        ? `Assigned to: ${workflow.assigned_types.join(', ')}`
        : null,
  }));

  const handleAction = (key, item) => {
    if (key === 'edit') {
      handleWorkflowClick(item.id);
    } else if (key === 'delete') {
      dispatch(deleteWorkflow(item.id));
    } else if (key === 'rename') {
      setWorkflowToRename(item);
      setNewTitle(item.title);
      setRenameDialogOpen(true);
    }
  };

  const handleRename = () => {
    if (workflowToRename) {
      dispatch(renameWorkflow(workflowToRename.id, newTitle));
    }
  };

  return (
    <>
      <TableView
        flex
        aria-label="Workflow table"
        onAction={(key) => isClickable && handleWorkflowClick(key)}
      >
        <TableHeader>
          <Column isRowHeader>Title</Column>
          <Column isRowHeader>Description</Column>
          <Column align="end">Actions</Column>
        </TableHeader>
        <TableBody items={workflowItems}>
          {(item) => (
            <Row key={item.id}>
              <Cell>{item.title}</Cell>
              <Cell>{item.description}</Cell>
              <Cell>
                <MenuTrigger>
                  <ActionButton aria-label="Workflow actions" isQuiet>
                    <Icon name={more} size="20px" />
                  </ActionButton>
                  <Menu onAction={(key) => handleAction(key, item)}>
                    <Item key="edit">Edit</Item>
                    <Item key="rename">Rename</Item>
                    <Item key="delete">Delete</Item>
                  </Menu>
                </MenuTrigger>
              </Cell>
            </Row>
          )}
        </TableBody>
      </TableView>

      <DialogTrigger
        isOpen={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        isDismissable
      >
        <ActionButton isHidden>Hidden Trigger</ActionButton>
        {(close) => (
          <Dialog>
            <Heading>Rename Workflow</Heading>
            <Content>
              <Flex direction="column" gap="size-150">
                <Text>
                  Enter a new name for workflow "{workflowToRename?.title}"
                </Text>
                <TextField
                  label="New workflow name"
                  value={newTitle}
                  onChange={setNewTitle}
                />
              </Flex>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onPress={() => {
                  handleRename();
                  close();
                }}
              >
                Rename
              </Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </>
  );
};

const WorkflowControlPanel = (props) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isClient = useClient();
  const searchParams = new URLSearchParams(location.search);
  const [isCreateWorkflowOpen, setCreateWorkflowOpen] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedWorkflow = searchParams.get('workflow');

  const {
    items: workflows,
    loading,
    error,
    loaded,
  } = useAppSelector((state) => state.workflow.workflows);

  // Add selector for workflow creation state
  const { loading: operationLoading, error: operationError } = useAppSelector(
    (state) => state.workflow.operation,
  );

  const lastCreatedWorkflowId = useAppSelector(
    (state) => state.workflow.lastCreatedWorkflowId,
  );

  const [isProcessingCreation, setIsProcessingCreation] = useState(false);

  useEffect(() => {
    if (!loaded) {
      dispatch(getWorkflows());
    }
  }, [dispatch, loaded]);

  // Handle successful workflow creation
  useEffect(() => {
    if (lastCreatedWorkflowId && isProcessingCreation) {
      // Navigate to the new workflow
      history.push(
        `/controlpanel/workflowmanager?workflow=${lastCreatedWorkflowId}`,
      );

      // Reset the processing flag
      setIsProcessingCreation(false);
    }
  }, [lastCreatedWorkflowId, isProcessingCreation, history]);

  // Show error toast when workflow loading fails
  useEffect(() => {
    if (error) {
      setErrorMessage('Error loading workflows: ' + error.message);
      setShowErrorToast(true);
    }
  }, [error]);

  // Show error toast when operation fails
  useEffect(() => {
    if (operationError) {
      setErrorMessage('Error creating workflow: ' + operationError.message);
      setShowErrorToast(true);
    }
  }, [operationError]);

  const handleCreateWorkflow = (cloneFromWorkflow, workflowName) => {
    setIsProcessingCreation(true);
    dispatch(addWorkflow(cloneFromWorkflow, workflowName));
    setCreateWorkflowOpen(false); // Close the dialog immediately
  };

  const handleWorkflowClick = (workflowId) => {
    history.push(`/controlpanel/workflowmanager?workflow=${workflowId}`);
  };

  if (selectedWorkflow) {
    return <WorkflowView workflowId={selectedWorkflow} />;
  }

  // Show loading if we're creating a workflow or loading initial workflows
  const showLoading = (operationLoading && isProcessingCreation) || loading;
  const loadingText =
    operationLoading && isProcessingCreation
      ? 'Creating Workflow...'
      : 'Loading Workflows...';

  return (
    <div id="page-controlpanel" className="ui container">
      <View width="100%" padding="size-400">
        <Form width="100%">
          <Well>
            <Heading level={1}>Workflow Manager</Heading>
          </Well>

          <Well marginTop="size-300">
            {/* Show loading state */}
            {showLoading && (
              <Flex alignItems="center" gap="size-200" marginTop="size-300">
                <ProgressCircle aria-label={loadingText} isIndeterminate />
                <Text>{loadingText}</Text>
              </Flex>
            )}

            {!showLoading && workflows && (
              <>
                <Heading level={2} marginBottom="size-200">
                  Please select your workflow
                </Heading>
                <WorkflowTable
                  workflows={workflows.filter(
                    (workflow) =>
                      !plone_shipped_workflows.includes(workflow.id),
                  )}
                  handleWorkflowClick={handleWorkflowClick}
                  isClickable={true}
                />
              </>
            )}
          </Well>
        </Form>

        <DialogTrigger
          isOpen={isCreateWorkflowOpen}
          onOpenChange={setCreateWorkflowOpen}
          isDismissable
        >
          <ActionButton isHidden>Hidden Trigger</ActionButton>
          {(close) => (
            <CreateWorkflow
              workflows={workflows || []}
              onCreate={(cloneFromWorkflow, workflowName) => {
                handleCreateWorkflow(cloneFromWorkflow, workflowName);
                // Dialog will close via state change above
              }}
              close={close}
            />
          )}
        </DialogTrigger>

        {isClient &&
          createPortal(
            <Toolbar
              pathname={props.pathname}
              hideDefaultViewButtons
              inner={
                <>
                  <Link to="/controlpanel" className="item">
                    <Icon
                      name={back}
                      className="circled"
                      size="30px"
                      title="Back"
                    />
                  </Link>
                  <Button
                    id="toolbar-add-workflow"
                    className="add-workflow"
                    aria-label="Add workflow"
                    onPress={() => setCreateWorkflowOpen(true)}
                  >
                    <Icon
                      name={add}
                      className="circled"
                      size="30px"
                      title="Add workflow"
                    />
                  </Button>
                </>
              }
            />,
            document.getElementById('toolbar'),
          )}
      </View>

      {showErrorToast && (
        <Toast
          error
          title="Error"
          content={errorMessage}
          onDismiss={() => setShowErrorToast(false)}
        />
      )}
    </div>
  );
};

export default ThemeProvider(WorkflowControlPanel);
