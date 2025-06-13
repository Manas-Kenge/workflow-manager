import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import {
  Heading,
  Text,
  ProgressCircle,
  AlertDialog,
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
import MoreSmallList from '@spectrum-icons/workflow/MoreSmallList';

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
  const dispatch = useDispatch();
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
    dispatch(renameWorkflow(workflowToRename.id, newTitle));
    setRenameDialogOpen(false);
  };

  return (
    <>
      <TableView
        flex
        aria-label="Example table with dynamic content"
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
                    <MoreSmallList />
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

      {renameDialogOpen && (
        <DialogTrigger isOpen isDismissable>
          <></>
          <AlertDialog
            title="Rename Workflow"
            primaryActionLabel="Rename"
            secondaryActionLabel="Cancel"
            onPrimaryAction={handleRename}
            onSecondaryAction={() => setRenameDialogOpen(false)}
          >
            <Flex direction="column" gap="size-150">
              <Text>
                Enter a new name for workflow "{workflowToRename?.title}"
              </Text>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </Flex>
          </AlertDialog>
        </DialogTrigger>
      )}
    </>
  );
};

const WorkflowControlPanel = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedWorkflow = searchParams.get('workflow');

  const {
    items: workflows,
    loading,
    error,
  } = useSelector((state) => state.workflow.workflows);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getWorkflows());
  }, [dispatch]);

  const handleCreateWorkflow = async (cloneFromWorkflow, workflowName) => {
    const result = dispatch(addWorkflow(cloneFromWorkflow, workflowName));
    if (result?.workflow_id) {
      dispatch(getWorkflows());
      history.push(
        `/controlpanel/workflowmanager?workflow=${result.workflow_id}`,
      );
    }
    setModalOpen(false);
  };

  const handleWorkflowClick = (workflowId) => {
    history.push(`/controlpanel/workflowmanager?workflow=${workflowId}`);
  };

  if (selectedWorkflow) {
    return <WorkflowView workflowId={selectedWorkflow} />;
  }

  return (
    <View width="100%" padding="size-400">
      <Form width="100%">
        <Well>
          <Heading level={1}>Workflow Manager</Heading>
        </Well>

        <Well marginTop="size-300">
          <CreateWorkflow
            workflows={workflows || []}
            onCreate={handleCreateWorkflow}
          />

          {loading && (
            <Flex alignItems="center" gap="size-200" marginTop="size-300">
              <ProgressCircle
                aria-label="Loading workflows..."
                isIndeterminate
              />
              <Text>Loading Workflows...</Text>
            </Flex>
          )}

          {/* Error State */}
          {error && (
            <DialogTrigger>
              <ActionButton marginTop="size-300">
                Error Loading Workflows
              </ActionButton>
              {(close) => (
                <AlertDialog
                  title="Error"
                  variant="error"
                  primaryActionLabel="Close"
                  onPrimaryAction={close}
                >
                  {error.message}
                </AlertDialog>
              )}
            </DialogTrigger>
          )}

          <Heading level={2} marginBottom="size-200">
            Please select your workflow
          </Heading>
          <WorkflowTable
            workflows={workflows.filter(
              (workflow) => !plone_shipped_workflows.includes(workflow.id),
            )}
            handleWorkflowClick={handleWorkflowClick}
            isClickable={true}
          />
        </Well>
      </Form>
    </View>
  );
};

export default ThemeProvider(WorkflowControlPanel);
