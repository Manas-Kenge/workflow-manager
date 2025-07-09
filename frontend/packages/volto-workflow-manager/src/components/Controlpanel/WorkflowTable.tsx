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
  DialogTrigger,
  Dialog,
  Heading,
  Form,
  TextField,
  Button,
  Text,
} from '@adobe/react-spectrum';
import { useState } from 'react';
import { deleteWorkflow, renameWorkflow } from 'volto-workflow-manager/actions';
import { useAppDispatch } from 'volto-workflow-manager/types';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import more from '@plone/volto/icons/more.svg';

interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  assignedTypes: string | null;
}

const WorkflowTable = ({ workflows, handleWorkflowClick, isClickable }) => {
  const dispatch = useAppDispatch();

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

  const handleConfirmDelete = () => {
    if (workflowToDelete) {
      dispatch(deleteWorkflow(workflowToDelete.id));
    }
  };

  const handleConfirmRename = () => {
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
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onPress={() => {
                  handleConfirmRename();
                  close();
                }}
              >
                Rename
              </Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>

      <DialogTrigger
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isDismissable
      >
        <ActionButton isHidden>Hidden Trigger</ActionButton>
        {(close) => (
          <Dialog>
            <Heading>Confirm Deletion</Heading>
            <Content>
              <Text>
                Are you sure you want to delete the workflow "
                <b>{workflowToDelete?.title}</b>"? This action cannot be undone.
              </Text>
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button
                  variant="negative"
                  style="fill"
                  onPress={() => {
                    handleConfirmDelete();
                    close();
                  }}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </Content>
          </Dialog>
        )}
      </DialogTrigger>
    </>
  );
};

export default WorkflowTable;
