import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
import MoreSmallList from '@spectrum-icons/workflow/MoreSmallList';
import ThemeProvider from '../../Provider';
import { useAppDispatch, useAppSelector } from '../../hooks';

// Import action creators
import {
  getWorkflows,
  addWorkflow,
  deleteWorkflow,
  renameWorkflow,
} from '../../actions/workflow';

// Import selectors
import {
  selectAllWorkflows,
  selectWorkflowsLoading,
  selectWorkflowsError,
  selectOperationLoading,
  clearError,
} from '../../features/workflow/workflowSlice';

import CreateWorkflow from '../Workflow/CreateWorkflow';
import WorkflowView from '../Workflow/WorkflowView';

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

interface WorkflowTableItem {
  id: string;
  title: string;
  description: string;
}

const WorkflowTable: React.FC<{
  workflows: WorkflowTableItem[];
  onAction: (key: string, item: WorkflowTableItem) => void;
}> = ({ workflows, onAction }) => {
  return (
    <TableView flex aria-label="Table of user-defined workflows">
      <TableHeader>
        <Column isRowHeader>Title</Column>
        <Column isRowHeader>Description</Column>
        <Column align="end" width={100}>
          Actions
        </Column>
      </TableHeader>
      <TableBody items={workflows}>
        {(item) => (
          <Row key={item.id}>
            <Cell>{item.title}</Cell>
            <Cell>{item.description}</Cell>
            <Cell>
              <MenuTrigger>
                <ActionButton aria-label="Workflow actions" isQuiet>
                  <MoreSmallList />
                </ActionButton>
                <Menu onAction={(key) => onAction(key as string, item)}>
                  <Item key="edit">Edit</Item>
                  <Item key="rename">Rename</Item>
                  <Item key="delete" textValue="Delete">
                    <Text>
                      <span style={{ color: 'red' }}>Delete</span>
                    </Text>
                  </Item>
                </Menu>
              </MenuTrigger>
            </Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};

const ControlPanel = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedWorkflowId = searchParams.get('workflow');

  const workflows = useAppSelector(selectAllWorkflows);
  const loading = useAppSelector(selectWorkflowsLoading);
  const error = useAppSelector(selectWorkflowsError);
  const operationLoading = useAppSelector(selectOperationLoading);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [workflowToRename, setWorkflowToRename] =
    useState<WorkflowTableItem | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    dispatch(getWorkflows());
  }, [dispatch]);

  // Refresh workflows after operations complete
  useEffect(() => {
    // If an operation just completed successfully (was loading, now not loading, no error)
    if (!operationLoading && !error) {
      // Small delay to ensure backend is updated
      const timeoutId = setTimeout(() => {
        dispatch(getWorkflows());
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [operationLoading, error, dispatch]);

  const handleCreateWorkflow = (cloneFrom: string, name: string) => {
    dispatch(addWorkflow(cloneFrom, name));
  };

  const handleTableAction = (key: string, item: WorkflowTableItem) => {
    switch (key) {
      case 'edit':
        history.push(`/controlpanel/workflowmanager?workflow=${item.id}`);
        break;
      case 'delete':
        dispatch(deleteWorkflow(item.id));
        break;
      case 'rename':
        setWorkflowToRename(item);
        setNewTitle(item.title);
        setRenameDialogOpen(true);
        break;
    }
  };

  const handleRenameConfirm = () => {
    if (workflowToRename && newTitle.trim()) {
      // Fixed: Pass separate parameters, not an object
      dispatch(renameWorkflow(workflowToRename.id, newTitle.trim()));
    }
    setRenameDialogOpen(false);
    setWorkflowToRename(null);
    setNewTitle('');
  };

  const handleRenameCancel = () => {
    setRenameDialogOpen(false);
    setWorkflowToRename(null);
    setNewTitle('');
  };

  // Clear errors when component unmounts or when user dismisses them
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [error, dispatch]);

  if (selectedWorkflowId) {
    return <WorkflowView workflowId={selectedWorkflowId} />;
  }

  const userWorkflows = (workflows || [])
    .filter((wf) => !plone_shipped_workflows.includes(wf.id))
    .map((wf) => ({
      id: wf.id,
      title: wf.title || wf.id,
      description: wf.description || 'No description available.',
    }));

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

          {(loading || operationLoading) && (
            <Flex alignItems="center" gap="size-200" marginTop="size-300">
              <ProgressCircle
                aria-label={loading ? 'Loading workflows...' : 'Processing...'}
                isIndeterminate
              />
              <Text>{loading ? 'Loading Workflows...' : 'Processing...'}</Text>
            </Flex>
          )}

          {error && (
            <Flex alignItems="center" gap="size-200" marginTop="size-300">
              <Text>
                <span style={{ color: 'red' }}>
                  Error: {error.message || 'Operation failed.'}
                </span>
              </Text>
              <ActionButton onPress={() => dispatch(clearError())}>
                Dismiss
              </ActionButton>
            </Flex>
          )}

          <Heading level={2} marginTop="size-400" marginBottom="size-200">
            Your Workflows ({userWorkflows.length})
          </Heading>

          <WorkflowTable
            workflows={userWorkflows}
            onAction={handleTableAction}
          />
        </Well>
      </Form>

      <DialogTrigger
        isOpen={renameDialogOpen}
        isDismissable
        onOpenChange={setRenameDialogOpen}
      >
        <div />
        <AlertDialog
          title="Rename Workflow"
          primaryActionLabel="Rename"
          secondaryActionLabel="Cancel"
          onPrimaryAction={handleRenameConfirm}
          onSecondaryAction={handleRenameCancel}
        >
          <Flex direction="column" gap="size-150">
            <Text>
              Enter a new name for workflow "{workflowToRename?.title}"
            </Text>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameConfirm();
                }
                if (e.key === 'Escape') {
                  handleRenameCancel();
                }
              }}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </Flex>
        </AlertDialog>
      </DialogTrigger>
    </View>
  );
};

export default ThemeProvider(ControlPanel);
