import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ProgressCircle,
  Button,
  View,
  Content,
  Heading,
  Flex,
  Picker,
  Item,
} from '@adobe/react-spectrum';
import { getWorkflows } from '../../actions/workflow';
import { listStates, updateState } from '../../actions/state';
import { listTransitions } from '../../actions/transition';
import StateTab, { type StateData } from './StateTab';
import type { WorkflowReduxState } from '../../reducers/workflow';
import type { StateReduxState } from '../../reducers/state';
import type { TransitionReduxState } from 'volto-workflow-manager/reducers/transition';

interface GlobalRootState {
  workflow: WorkflowReduxState;
  state: StateReduxState;
  transition: TransitionReduxState;
}

interface StateTabWrapperProps {
  workflowId: string;
}

const propertiesSchema = {
  title: 'State Properties',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title', 'description'],
    },
  ],
  properties: {
    title: { title: 'Title', type: 'string' },
    description: { title: 'Description', type: 'string', widget: 'textarea' },
  },
  required: ['title'],
};

const StateTabWrapper: React.FC<StateTabWrapperProps> = ({ workflowId }) => {
  const dispatch = useDispatch();
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  const statesInfo = useSelector((state: GlobalRootState) => state.state.list);
  const allWorkflows = useSelector(
    (state: GlobalRootState) => state.workflow.workflows.items,
  );
  const transitionsInfo = useSelector(
    (state: GlobalRootState) => state.transition.list,
  );
  const isLoading = useSelector(
    (state: GlobalRootState) =>
      state.state.list.loading ||
      state.workflow.workflows.loading ||
      state.transition.list.loading,
  );
  const isSaving = useSelector(
    (state: GlobalRootState) => state.state.update.loading,
  );
  const saveError = useSelector(
    (state: GlobalRootState) => state.state.update.error,
  );
  const [localStateData, setLocalStateData] = useState<StateData | null>(null);

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
    const currentWorkflow = allWorkflows.find((w) => w.id === workflowId);

    if (currentState && currentWorkflow) {
      setLocalStateData({
        properties: {
          title: currentState.title || '',
          description: currentState.description || '',
          isInitialState: currentWorkflow.initial_state === currentState.id,
        },
        transitions: {
          selected: currentState.transitions || [],
        },
      });
    } else {
      setLocalStateData(null);
    }
  }, [selectedStateId, workflowId, statesInfo.data, allWorkflows]);

  const handleStateChange = useCallback((newState: Partial<StateData>) => {
    setLocalStateData((prevState) => {
      if (!prevState) return null;
      return { ...prevState, ...newState };
    });
  }, []);

  const handleSave = () => {
    if (!localStateData || !workflowId || !selectedStateId) return;
    const { properties, transitions } = localStateData;
    const payload = {
      title: properties.title,
      description: properties.description,
      is_initial_state: properties.isInitialState,
      transitions: transitions.selected,
    };
    dispatch(updateState(workflowId, selectedStateId, payload));
  };

  const isDisabled = !localStateData;
  if (isLoading && !statesInfo.loaded) {
    return (
      <Flex alignItems="center" justifyContent="center" height="size-2000">
        <ProgressCircle isIndeterminate />
      </Flex>
    );
  }

  return (
    <View padding="size-200">
      <Flex direction="column" gap="size-200" marginBottom="size-300">
        <Heading level={3}>Configure a State</Heading>
        <Picker
          label="Select a state to edit"
          placeholder="Choose a state..."
          items={statesInfo.data?.states || []}
          selectedKey={selectedStateId}
          onSelectionChange={(key) => setSelectedStateId(key as string)}
          isDisabled={isLoading}
        >
          {(item) => <Item key={item.id}>{item.title}</Item>}
        </Picker>
      </Flex>

      {saveError && (
        <View
          backgroundColor="negative"
          padding="size-100"
          borderRadius="medium"
        >
          <Heading level={4}>Save Failed</Heading>
          <Content>{saveError}</Content>
        </View>
      )}

      <StateTab
        stateData={
          localStateData || {
            properties: { title: '', description: '', isInitialState: false },
            transitions: { selected: [] },
          }
        }
        onStateChange={handleStateChange}
        isDisabled={isDisabled}
        propertiesSchema={propertiesSchema}
        stateId={selectedStateId || 'no-state-selected'}
        availableTransitions={transitionsInfo.data?.transitions || []}
      />

      <Flex direction="row" justifyContent="end" marginTop="size-200">
        <Button
          variant="cta"
          onPress={handleSave}
          isPending={isSaving}
          isDisabled={isDisabled || isSaving}
        >
          Save State
        </Button>
      </Flex>
    </View>
  );
};

export default StateTabWrapper;
