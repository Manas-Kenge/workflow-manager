import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Flex,
  Picker,
  View,
  Tabs,
  TabList,
  TabPanels,
  Item,
  Heading,
  ProgressCircle,
} from '@adobe/react-spectrum';
import { listTransitions } from '../../actions/transition';
import { listStates } from '../../actions/state';
import PropertiesTab, { type PropertiesData } from './Tabs/PropertiesTab';
import GuardsTab, { type GuardsData } from './Tabs/GuardsTab';
import SourceStatesTab, { type SourceStatesData } from './Tabs/SourceStatesTab';
import ActionsTab from './Tabs/ActionsTab';
import type { WorkflowReduxState } from '../../reducers/workflow';
import type { StateReduxState } from '../../reducers/state';
import type { TransitionReduxState } from '../../reducers/transition';

export interface TransitionData {
  properties: PropertiesData;
  guards: GuardsData;
  sourceStates: SourceStatesData;
}

interface GlobalRootState {
  workflow: WorkflowReduxState;
  state: StateReduxState;
  transition: TransitionReduxState;
}

interface TransitionProps {
  workflowId: string;
  onDataChange: (payload: any | null) => void;
  isDisabled: boolean;
}

const Transition: React.FC<TransitionProps> = ({
  workflowId,
  onDataChange,
  isDisabled,
}) => {
  const dispatch = useDispatch();
  const [selectedTransitionId, setSelectedTransitionId] = useState<
    string | null
  >(null);
  const [localTransitionData, setLocalTransitionData] =
    useState<TransitionData | null>(null);
  const [initialTransitionData, setInitialTransitionData] =
    useState<TransitionData | null>(null);

  const { transitionsInfo, statesInfo, currentWorkflow, isLoading } =
    useSelector((state: GlobalRootState) => ({
      transitionsInfo: state.transition.list,
      statesInfo: state.state.list,
      currentWorkflow: state.workflow.workflows.items.find(
        (w) => w.id === workflowId,
      ),
      isLoading: state.transition.list.loading || state.state.list.loading,
    }));

  useEffect(() => {
    if (workflowId) {
      dispatch(listTransitions(workflowId));
      dispatch(listStates(workflowId));
    }
  }, [dispatch, workflowId]);

  useEffect(() => {
    const currentTransition = transitionsInfo.data?.transitions.find(
      (t) => t.id === selectedTransitionId,
    );
    const allStates = statesInfo.data?.states;

    if (currentTransition && allStates) {
      const sourceStateIds = allStates
        .filter((state) => state.transitions.includes(currentTransition.id))
        .map((state) => state.id);

      const data: TransitionData = {
        properties: {
          title: currentTransition.title || '',
          description: currentTransition.description || '',
          new_state_id: currentTransition.new_state_id || null,
          trigger_type: currentTransition.trigger_type === 0,
        },
        guards: {
          roles: currentTransition.guard?.roles || [],
          groups: currentTransition.guard?.groups || [],
          permissions: currentTransition.guard?.permissions || [],
          expr: currentTransition.guard?.expr || '',
        },
        sourceStates: {
          selected: sourceStateIds,
        },
      };
      setLocalTransitionData(data);
      setInitialTransitionData(data);
    } else {
      setLocalTransitionData(null);
      setInitialTransitionData(null);
    }
  }, [selectedTransitionId, transitionsInfo.data, statesInfo.data]);

  useEffect(() => {
    if (
      localTransitionData &&
      selectedTransitionId &&
      JSON.stringify(localTransitionData) !==
        JSON.stringify(initialTransitionData)
    ) {
      const { properties, guards, sourceStates } = localTransitionData;
      const payload = {
        id: selectedTransitionId,
        title: properties.title,
        description: properties.description,
        new_state_id: properties.new_state_id,
        trigger_type: properties.trigger_type ? 0 : 1,
        guard: {
          roles: guards.roles,
          groups: guards.groups,
          permissions: guards.permissions,
          expr: guards.expr,
        },
        states_with_this_transition: sourceStates.selected,
      };
      onDataChange(payload);
    } else {
      onDataChange(null);
    }
  }, [
    localTransitionData,
    initialTransitionData,
    selectedTransitionId,
    onDataChange,
  ]);

  const handleTransitionChange = useCallback(
    (newState: Partial<TransitionData>) => {
      setLocalTransitionData((prevState) => {
        if (!prevState) return null;
        return { ...prevState, ...newState };
      });
    },
    [],
  );

  const handleSelectionChange = (key: React.Key) => {
    setSelectedTransitionId(key as string);
  };

  const propertiesSchema = useMemo(
    () => ({
      title: 'Transition Properties',
      fieldsets: [
        {
          id: 'default',
          title: 'Default',
          fields: ['title', 'description', 'new_state_id', 'trigger_type'],
        },
      ],
      properties: {
        title: { title: 'Title', type: 'string' },
        description: {
          title: 'Description',
          type: 'string',
          widget: 'textarea',
        },
        new_state_id: {
          title: 'Destination State',
          choices: (statesInfo.data?.states || []).map((state) => [
            state.id,
            state.title,
          ]),
        },
        trigger_type: { title: 'Auto Trigger', type: 'boolean' },
      },
      required: ['title', 'new_state_id'],
    }),
    [statesInfo.data?.states],
  );

  if (isLoading && !transitionsInfo.loaded) {
    return <ProgressCircle isIndeterminate />;
  }

  const isPickerDisabled = isDisabled || !transitionsInfo.loaded;
  const isTabDisabled = isDisabled || !localTransitionData;

  return (
    <View>
      <Flex direction="column" gap="size-200" marginY="size-300">
        <Heading level={3}>Configure a Transition</Heading>
        <Picker
          label="Select a transition to edit"
          placeholder="Choose a transition..."
          items={transitionsInfo.data?.transitions || []}
          selectedKey={selectedTransitionId}
          onSelectionChange={handleSelectionChange}
          isDisabled={isPickerDisabled}
        >
          {(item) => <Item key={item.id}>{item.title}</Item>}
        </Picker>
      </Flex>

      <Tabs
        key={selectedTransitionId}
        aria-label="Transition Configuration"
        marginTop="size-300"
      >
        <TabList>
          <Item key="properties">Properties</Item>
          <Item key="guards">Guards</Item>
          <Item key="source-states">Source States</Item>
          <Item key="actions">Actions</Item>
        </TabList>
        <TabPanels>
          <Item key="properties">
            <PropertiesTab
              data={localTransitionData?.properties}
              schema={propertiesSchema}
              onChange={(properties) => handleTransitionChange({ properties })}
              isDisabled={isTabDisabled}
            />
          </Item>
          <Item key="guards">
            <GuardsTab
              data={localTransitionData?.guards}
              availableRoles={
                currentWorkflow?.context_data?.available_roles || []
              }
              availableGroups={currentWorkflow?.context_data?.groups || []}
              availablePermissions={
                currentWorkflow?.context_data?.managed_permissions || []
              }
              onChange={(guards) => handleTransitionChange({ guards })}
              isDisabled={isTabDisabled}
            />
          </Item>
          <Item key="source-states">
            <SourceStatesTab
              data={localTransitionData?.sourceStates}
              availableStates={statesInfo.data?.states || []}
              onChange={(sourceStates) =>
                handleTransitionChange({ sourceStates })
              }
              isDisabled={isTabDisabled}
            />
          </Item>
          <Item key="actions">
            <ActionsTab />
          </Item>
        </TabPanels>
      </Tabs>
    </View>
  );
};

export default Transition;
