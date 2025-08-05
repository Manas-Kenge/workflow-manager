import {
  TableView,
  ActionButton,
  Item,
  Content,
  ButtonGroup,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  MenuTrigger,
  Menu,
  Dialog,
  Heading,
  Form,
  TextField,
  Button,
  Text,
  DialogContainer,
} from '@adobe/react-spectrum';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { useIntl, defineMessages } from 'react-intl';
import { deleteWorkflow, updateWorkflow } from 'volto-workflow-manager/actions';
import { useAppDispatch, useAppSelector } from 'volto-workflow-manager/types';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import more from '@plone/volto/icons/more.svg';

interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  assignedTypes: string | null;
}

const messages = defineMessages({
  renameSuccess: {
    id: 'Workflow renamed successfully.',
    defaultMessage: 'Workflow renamed successfully.',
  },
  deleteSuccess: {
    id: 'Workflow deleted successfully.',
    defaultMessage: 'Workflow deleted successfully.',
  },
  operationError: {
    id: 'Operation Failed',
    defaultMessage: 'Operation Failed',
  },
});

function usePrevious(value) {
  const ref = React.useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const WorkflowTable = ({ workflows, handleWorkflowClick, isClickable }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [workflowToRename, setWorkflowToRename] = useState<WorkflowItem | null>(
    null,
  );
  const [newTitle, setNewTitle] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<WorkflowItem | null>(
    null,
  );

  const { loading: operationLoading, error: operationError } = useAppSelector(
    (state) => state.workflow.operation,
  );
  const wasLoading = usePrevious(operationLoading);

  useEffect(() => {
    if (wasLoading && !operationLoading) {
      if (operationError) {
        toast.error(
          <Toast
            error
            title={intl.formatMessage(messages.operationError)}
            content={operationError || 'An unknown error occurred.'}
          />,
        );
      }
    }
  }, [operationLoading, wasLoading, operationError, intl]);

  const workflowItems: WorkflowItem[] = workflows.map((workflow) => ({
    id: workflow.id,
    title: workflow.title || workflow.id,
    description: workflow.description || 'No description available',
    assignedTypes:
      workflow.assigned_types?.length > 0
        ? `Assigned to: ${workflow.assigned_types.join(', ')}`
        : null,
  }));

  const handleAction = (key: React.Key, item: WorkflowItem) => {
    if (key === 'edit') {
      handleWorkflowClick(item.id);
    } else if (key === 'delete') {
      setWorkflowToDelete(item);
      setDeleteDialogOpen(true);
    } else if (key === 'rename') {
      setWorkflowToRename(item);
      setNewTitle(item.title);
      setRenameDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (workflowToDelete) {
      dispatch(deleteWorkflow(workflowToDelete.id));
      toast.success(
        <Toast
          success
          title={intl.formatMessage(messages.deleteSuccess)}
          content={`Workflow "${workflowToDelete.title}" was deleted.`}
        />,
      );
    }
    setDeleteDialogOpen(false);
  };

  const handleConfirmRename = () => {
    if (workflowToRename) {
      dispatch(updateWorkflow(workflowToRename.id, { title: newTitle }));
      toast.success(
        <Toast
          success
          title={intl.formatMessage(messages.renameSuccess)}
          content={`Workflow renamed to "${newTitle}".`}
        />,
      );
    }
    setRenameDialogOpen(false);
  };

  return (
    <>
      <TableView
        aria-label="Workflow table"
        onAction={(key) => isClickable && handleWorkflowClick(key)}
      >
        <TableHeader>
          <Column isRowHeader>Title</Column>
          <Column>Description</Column>
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

      <DialogContainer onDismiss={() => setRenameDialogOpen(false)}>
        {renameDialogOpen && (
          <Dialog>
            <Heading>Rename Workflow</Heading>
            <Content>
              <Form>
                <Text>
                  Enter a new name for workflow "
                  <b>{workflowToRename?.title}</b>"
                </Text>
                <TextField
                  label="New workflow name"
                  value={newTitle}
                  onChange={setNewTitle}
                />
              </Form>
            </Content>
            <ButtonGroup>
              <Button
                variant="secondary"
                onPress={() => setRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="accent" onPress={handleConfirmRename}>
                Rename
              </Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogContainer>

      <DialogContainer onDismiss={() => setDeleteDialogOpen(false)}>
        {deleteDialogOpen && (
          <Dialog>
            <Heading>Confirm Deletion</Heading>
            <Content>
              <Text>
                Are you sure you want to delete the workflow "
                <b>{workflowToDelete?.title}</b>"? This action cannot be undone.
              </Text>
            </Content>
            <ButtonGroup>
              <Button
                variant="secondary"
                onPress={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="negative"
                style="fill"
                onPress={handleConfirmDelete}
              >
                Delete
              </Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogContainer>
    </>
  );
};

export default WorkflowTable;
