import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Item,
  Tabs,
  TabList,
  TabPanels,
  View,
  ProgressCircle,
} from '@adobe/react-spectrum';
import { createPortal } from 'react-dom';
import { useClient } from '@plone/volto/hooks/client/useClient';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import save from '@plone/volto/icons/save.svg';
import clear from '@plone/volto/icons/clear.svg';
import { updateState } from '../../actions/state';
import { getWorkflow, updateWorkflow } from '../../actions/workflow';
import { updateTransition } from '../../actions/transition';
import State from '../States/State';
import Transition from '../Transitions/Transition';
import ThemeProvider from '../../Provider';
import WorkflowTab from './WorkflowTab';
import WorkflowHeader from './WorkflowHeader';
import type { GlobalRootState } from '../../types';

const WorkflowSettings: React.FC = (props) => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const dispatch = useDispatch();
  const isClient = useClient();

  const [activeTab, setActiveTab] = useState<React.Key>('workflow');
  const [payloadToSave, setPayloadToSave] = useState<any | null>(null);

  useEffect(() => {
    if (workflowId) {
      dispatch(getWorkflow(workflowId));
    }
  }, [dispatch, workflowId]);

  const {
    workflow,
    isLoading,
    isSavingWorkflow,
    isSavingState,
    isSavingTransition,
  } = useSelector((state: GlobalRootState) => ({
    workflow: state.workflow.workflow.currentWorkflow,
    isLoading: state.workflow.workflow.loading,
    isSavingWorkflow: state.workflow.operation.loading,
    isSavingState: state.state.update.loading,
    isSavingTransition: state.transition.update.loading,
  }));

  const handleDataChange = useCallback((payload: any | null) => {
    setPayloadToSave(payload);
  }, []);

  const handleTabChange = (key: React.Key) => {
    setActiveTab(key);
    setPayloadToSave(null);
  };

  const handleSave = () => {
    if (!payloadToSave || !workflowId) return;

    if (activeTab === 'workflow') {
      dispatch(updateWorkflow(workflowId, payloadToSave));
    } else if (activeTab === 'states') {
      dispatch(updateState(workflowId, payloadToSave.id, payloadToSave));
    } else if (activeTab === 'transitions') {
      dispatch(updateTransition(workflowId, payloadToSave.id, payloadToSave));
    }
  };

  const isSaving = isSavingWorkflow || isSavingState || isSavingTransition;
  const isSaveDisabled = !payloadToSave || isSaving;

  if (isLoading || !workflow || workflow.id !== workflowId) {
    return <ProgressCircle isIndeterminate aria-label="Loading workflow..." />;
  }

  return (
    <View padding="size-400">
      <WorkflowHeader workflow={workflow} />
      <Tabs
        aria-label="Workflow Settings"
        marginTop="size-300"
        selectedKey={activeTab}
        onSelectionChange={handleTabChange}
      >
        <TabList>
          <Item key="workflow">Workflow</Item>
          <Item key="states">States</Item>
          <Item key="transitions">Transitions</Item>
        </TabList>
        <TabPanels>
          <Item key="workflow">
            <WorkflowTab
              workflowId={workflowId}
              onDataChange={handleDataChange}
              isDisabled={isSaving}
            />
          </Item>
          <Item key="states">
            <State
              workflowId={workflowId}
              workflow={workflow}
              onDataChange={handleDataChange}
              isDisabled={isSaving}
            />
          </Item>
          <Item key="transitions">
            <Transition
              workflowId={workflowId}
              workflow={workflow}
              onDataChange={handleDataChange}
              isDisabled={isSaving}
            />
          </Item>
        </TabPanels>
      </Tabs>

      {isClient &&
        createPortal(
          <Toolbar
            pathname={props.pathname}
            hideDefaultViewButtons
            inner={
              <>
                <Link
                  to={`/controlpanel/workflowmanager?workflow=${workflowId}`}
                  className="item"
                >
                  <Icon
                    name={clear}
                    className="circled"
                    size="30px"
                    title="Cancel"
                  />
                </Link>
                <Button
                  variant="cta"
                  onPress={handleSave}
                  isPending={isSaving}
                  isDisabled={isSaveDisabled}
                >
                  <Icon
                    name={save}
                    className="circled"
                    size="30px"
                    title="Save Changes"
                  />
                </Button>
              </>
            }
          />,
          document.getElementById('toolbar'),
        )}
    </View>
  );
};

export default ThemeProvider(WorkflowSettings);
