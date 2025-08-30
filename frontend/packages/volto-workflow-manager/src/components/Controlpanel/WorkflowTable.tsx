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
  DialogContainer,
  Dialog,
  Heading,
  Form,
  TextField,
  Button,
  Text,
} from '@adobe/react-spectrum';
import { useState } from 'react';
import { deleteWorkflow, updateWorkflow } from 'volto-workflow-manager/actions';
import { useAppDispatch } from 'volto-workflow-manager/types';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import more from '@plone/volto/icons/more.svg';
import { toast } from 'react-toastify';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { useIntl, defineMessages } from 'react-intl';

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
  renameError: {
    id: 'Failed to rename workflow.',
    defaultMessage: 'Failed to rename workflow.',
  },
  deleteSuccess: {
    id: 'Workflow deleted successfully.',
    defaultMessage: 'Workflow deleted successfully.',
  },
  deleteError: {
    id: 'Failed to delete workflow.',
    defaultMessage: 'Failed to delete workflow.',
  },
});

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

  const handleConfirmDelete = async () => {
    if (workflowToDelete) {
      const result = await dispatch(deleteWorkflow(workflowToDelete.id));
      setDeleteDialogOpen(false);

      if (result?.error) {
        toast.error(
          <Toast
            error
            title="Deletion Failed"
            content={
              result.error.message || intl.formatMessage(messages.deleteError)
            }
          />,
        );
      } else {
        toast.success(
          <Toast
            success
            title="Success"
            content={intl.formatMessage(messages.deleteSuccess)}
          />,
        );
      }
    }
  };

  const handleConfirmRename = async () => {
    if (workflowToRename && newTitle) {
      const result = await dispatch(
        updateWorkflow(workflowToRename.id, { title: newTitle }),
      );
      setRenameDialogOpen(false);

      if (result?.error) {
        toast.error(
          <Toast
            error
            title="Rename Failed"
            content={
              result.error.message || intl.formatMessage(messages.renameError)
            }
          />,
        );
      } else {
        toast.success(
          <Toast
            success
            title="Success"
            content={intl.formatMessage(messages.renameSuccess)}
          />,
        );
      }
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

      {renameDialogOpen && (
        <DialogContainer onDismiss={() => setRenameDialogOpen(false)}>
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
              <Button
                variant="accent"
                onPress={handleConfirmRename}
                isDisabled={!newTitle || newTitle === workflowToRename?.title}
              >
                Rename
              </Button>
            </ButtonGroup>
          </Dialog>
        </DialogContainer>
      )}

      {deleteDialogOpen && (
        <DialogContainer onDismiss={() => setDeleteDialogOpen(false)}>
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
              <Button variant="negative" onPress={handleConfirmDelete}>
                Delete
              </Button>
            </ButtonGroup>
          </Dialog>
        </DialogContainer>
      )}
    </>
  );
};

export default WorkflowTable;
