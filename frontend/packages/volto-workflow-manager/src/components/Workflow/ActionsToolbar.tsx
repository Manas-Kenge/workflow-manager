import { useState } from 'react';
import { validateWorkflow } from '../../actions';
import { useAppDispatch } from '../../types';
import { Button, ButtonGroup, Flex } from '@adobe/react-spectrum';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import add from '@plone/volto/icons/add.svg';
import adduser from '@plone/volto/icons/add-user.svg';
import checkboxChecked from '@plone/volto/icons/checkbox-checked.svg';
import blank from '@plone/volto/icons/blank.svg';
import CreateState from '../States/CreateState';

const ActionsToolbar = ({ workflowId }: { workflowId: string }) => {
  const dispatch = useAppDispatch();
  const [isCreateStateOpen, setCreateStateOpen] = useState(false);

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <ButtonGroup>
          <Button variant="accent" onPress={() => setCreateStateOpen(true)}>
            <Icon name={add} size="20px" />
            Add State
          </Button>
          <Button variant="secondary">
            <Icon name={blank} size="20px" />
            Add Transition
          </Button>
          <Button
            variant="secondary"
            onPress={() => dispatch(validateWorkflow(workflowId))}
          >
            <Icon name={checkboxChecked} size="20px" />
            Sanity Check
          </Button>
          <Button variant="secondary">
            <Icon name={adduser} size="20px" />
            Assign
          </Button>
        </ButtonGroup>
      </Flex>

      <CreateState
        workflowId={workflowId}
        isOpen={isCreateStateOpen}
        onClose={() => setCreateStateOpen(false)}
      />
    </>
  );
};

export default ActionsToolbar;
