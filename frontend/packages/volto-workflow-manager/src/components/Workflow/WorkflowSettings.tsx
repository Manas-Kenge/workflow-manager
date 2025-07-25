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
  Heading,
  ProgressCircle,
  Flex,
  Content,
  Picker,
} from '@adobe/react-spectrum';
import { createPortal } from 'react-dom';
import { useClient } from '@plone/volto/hooks/client/useClient';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import save from '@plone/volto/icons/save.svg';
import clear from '@plone/volto/icons/clear.svg';
import { updateState, listStates } from '../../actions/state';
import { getWorkflows } from '../../actions/workflow';
import { listTransitions, updateTransition } from '../../actions/transition';
import State from '../States/State';
import Transition, { type TransitionData } from '../Transitions/Transition';
import ThemeProvider from '../../Provider';
import type { WorkflowReduxState } from '../../reducers/workflow';
import type { StateReduxState } from '../../reducers/state';
import type { TransitionReduxState } from '../../reducers/transition';
import type { StateData } from '../States/State';

interface GlobalRootState {
  workflow: WorkflowReduxState;
  state: StateReduxState;
  transition: TransitionReduxState;
}

const WorkflowSettings: React.FC = (props) => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const dispatch = useDispatch();
  const isClient = useClient();

  const [activeTab, setActiveTab] = useState<React.Key>('states');
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [localStateData, setLocalStateData] = useState<StateData | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<
    string | null
  >(null);
  const [localTransitionData, setLocalTransitionData] =
    useState<TransitionData | null>(null);

  const {
    statesInfo,
    isLoadingData,
    currentWorkflow,
    transitionsInfo,
    isSavingState,
    isSavingTransition,
    saveError,
  } = useSelector((state: GlobalRootState) => ({
    statesInfo: state.state.list,
    currentWorkflow: state.workflow.workflows.items.find(
      (w) => w.id === workflowId,
    ),
    transitionsInfo: state.transition.list,
    isLoadingData:
      state.state.list.loading ||
      state.workflow.workflows.loading ||
      state.transition.list.loading,
    isSavingState: state.state.update.loading,
    isSavingTransition: state.transition.update.loading,
    saveError: state.state.update.error || state.transition.update.error,
  }));

  useEffect(() => {
    if (workflowId) {
      dispatch(listStates(workflowId));
      dispatch(getWorkflows());
      dispatch(listTransitions(workflowId));
    }
  }, [dispatch, workflowId]);

  useEffect(() => {
    const currentState = statesInfo.data?.states.find(
      (s) => s.id === selectedStateId,
    );
    if (currentState && currentWorkflow) {
      setLocalStateData({
        properties: {
          title: currentState.title || '',
          description: currentState.description || '',
          isInitialState: currentWorkflow.initial_state === currentState.id,
        },
        transitions: { selected: currentState.transitions || [] },
        permissions: currentState.permission_roles || {},
        groupRoles: currentState.group_roles || {},
      });
    } else {
      setLocalStateData(null);
    }
  }, [selectedStateId, statesInfo.data, currentWorkflow]);

  useEffect(() => {
    const currentTransition = transitionsInfo.data?.transitions.find(
      (t) => t.id === selectedTransitionId,
    );
    if (currentTransition) {
      setLocalTransitionData({
        properties: {
          title: currentTransition.title || '',
          description: currentTransition.description || '',
          new_state_id: currentTransition.new_state_id || null,
          trigger_type: currentTransition.trigger_type === 0,
        },
      });
    } else {
      setLocalTransitionData(null);
    }
  }, [selectedTransitionId, transitionsInfo.data]);

  const handleStateChange = useCallback((newState: Partial<StateData>) => {
    setLocalStateData((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const handleTransitionChange = useCallback(
    (newState: Partial<TransitionData>) => {
      setLocalTransitionData((prevState) => ({ ...prevState, ...newState }));
    },
    [],
  );

  const handleSaveState = () => {
    if (!localStateData || !workflowId || !selectedStateId) return;
    const { properties, transitions, permissions, groupRoles } = localStateData;
    const payload = {
      title: properties.title,
      description: properties.description,
      is_initial_state: properties.isInitialState,
      transitions: transitions.selected,
      permission_roles: permissions,
      group_roles: groupRoles,
    };
    dispatch(updateState(workflowId, selectedStateId, payload));
  };

  const handleSaveTransition = () => {
    if (!localTransitionData || !workflowId || !selectedTransitionId) return;
    const { properties } = localTransitionData;
    const payload = {
      title: properties.title,
      description: properties.description,
      new_state_id: properties.new_state_id,
      trigger_type: properties.trigger_type,
    };
    dispatch(updateTransition(workflowId, selectedTransitionId, payload));
  };

  const handleSave = () => {
    if (activeTab === 'states') {
      handleSaveState();
    } else if (activeTab === 'transitions') {
      handleSaveTransition();
    }
  };

  const isSaving = isSavingState || isSavingTransition;
  const isDisabled =
    activeTab === 'states' ? !localStateData : !localTransitionData;

  if (isLoadingData && !statesInfo.loaded) {
    return <ProgressCircle isIndeterminate />;
  }

  return (
    <View padding="size-400">
      <Heading level={1}>Editing Workflow: "{currentWorkflow?.title}"</Heading>
      <Tabs
        aria-label="Workflow Settings"
        marginTop="size-300"
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
      >
        <TabList>
          <Item key="states">States</Item>
          <Item key="transitions">Transitions</Item>
        </TabList>
        <TabPanels>
          <Item key="states">
            <State
              states={statesInfo.data?.states || []}
              selectedStateId={selectedStateId}
              onStateSelect={setSelectedStateId}
              localStateData={localStateData}
              onStateChange={handleStateChange}
              availableTransitions={transitionsInfo.data?.transitions || []}
              currentWorkflow={currentWorkflow}
            />
          </Item>
          <Item key="transitions">
            <View padding="size-200">
              <Flex direction="column" gap="size-200" marginY="size-300">
                <Heading level={3}>Configure a Transition</Heading>
                <Picker
                  label="Select a transition to edit"
                  placeholder="Choose a transition..."
                  items={transitionsInfo.data?.transitions || []}
                  selectedKey={selectedTransitionId}
                  onSelectionChange={(key) =>
                    setSelectedTransitionId(key as string)
                  }
                >
                  {(item) => <Item key={item.id}>{item.title}</Item>}
                </Picker>
              </Flex>
              <Transition
                transitionData={localTransitionData}
                onTransitionChange={handleTransitionChange}
                isDisabled={!selectedTransitionId}
                availableStates={statesInfo.data?.states || []}
              />
            </View>
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
                  to={`/controlpanel/workflowmanager/${workflowId}`}
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
                  isDisabled={isDisabled || isSaving}
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
