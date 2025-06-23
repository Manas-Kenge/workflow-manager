import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { deleteWorkflow, getWorkflows, validateWorkflow } from '../../actions';
import { useAppDispatch } from '../../types';
import { Button, ButtonGroup, Flex, Switch } from '@adobe/react-spectrum';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import save from '@plone/volto/icons/save.svg';
import add from '@plone/volto/icons/add.svg';
import adduser from '@plone/volto/icons/add-user.svg';
import deleteIcon from '@plone/volto/icons/delete.svg';
import checkboxChecked from '@plone/volto/icons/checkbox-checked.svg';
import blank from '@plone/volto/icons/blank.svg';
import CreateState from '../State/CreateState';

const ActionsToolbar = ({ workflowId }: { workflowId: string }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [isCreateStateOpen, setCreateStateOpen] = useState(false);

  const handleDeleteWorkflow = async () => {
    const result = await dispatch(deleteWorkflow(workflowId));
    if (result && !result.error) {
      dispatch(getWorkflows());
      history.push(`/controlpanel/workflowmanager`);
    }
  };

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
          <Button
            variant="negative"
            style="fill"
            onPress={handleDeleteWorkflow}
          >
            <Icon name={deleteIcon} size="20px" />
            Delete
          </Button>
        </ButtonGroup>

        <Switch isSelected={advancedMode} onChange={setAdvancedMode}>
          Advanced mode
        </Switch>
        <Button variant="secondary">
          <Icon name={save} size="20px" />
          Save
        </Button>
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
