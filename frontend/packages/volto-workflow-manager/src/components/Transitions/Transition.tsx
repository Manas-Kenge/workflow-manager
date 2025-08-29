import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Accordion,
  Disclosure,
  DisclosureTitle,
  DisclosurePanel,
  Flex,
  Picker,
  View,
  Item,
  Heading,
  ProgressCircle,
  Button,
  AlertDialog,
  DialogTrigger,
} from '@adobe/react-spectrum';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import deleteIcon from '@plone/volto/icons/delete.svg';
import { listTransitions, deleteTransition } from '../../actions/transition';
import { listStates } from '../../actions/state';
import PropertiesTab from './Tabs/PropertiesTab';
import GuardsTab from './Tabs/GuardsTab';
import SourceStatesTab from './Tabs/SourceStatesTab';
import type { GlobalRootState } from '../../types';
import type { TransitionData, TransitionProps } from '../../types/transition';

const Transition: React.FC<TransitionProps> = ({
  workflowId,
  workflow,
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

  const { transitionsInfo, statesInfo, isLoading, selectedItem } = useSelector(
    (state: GlobalRootState) => ({
      transitionsInfo: state.transition.list,
      statesInfo: state.state.list,
      isLoading: state.transition.list.loading || state.state.list.loading,
      selectedItem: state.workflow.selectedItem,
    }),
  );

  useEffect(() => {
    if (workflowId) {
      dispatch(listTransitions(workflowId));
      dispatch(listStates(workflowId));
    }
  }, [dispatch, workflowId]);

  // Sync selectedTransitionId with selectedItem from graph
  useEffect(() => {
    if (
      selectedItem?.kind === 'transition' &&
      selectedItem.id !== selectedTransitionId
    ) {
      setSelectedTransitionId(selectedItem.id);
    }
  }, [selectedItem, selectedTransitionId]);

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

  const handleDeleteTransition = useCallback(
    (transitionId: string) => {
      dispatch(deleteTransition(workflowId, transitionId));
      setSelectedTransitionId(null);
      setLocalTransitionData(null);
      setInitialTransitionData(null);
      onDataChange(null);
    },
    [dispatch, workflowId, onDataChange],
  );

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
      <Flex
        direction="column"
        gap="size-200"
        marginY="size-300"
        marginX="size-300"
      >
        <Heading level={3}>Configure a Transition</Heading>
        <Picker
          placeholder="Choose a transition..."
          items={transitionsInfo.data?.transitions || []}
          selectedKey={selectedTransitionId}
          onSelectionChange={handleSelectionChange}
          isDisabled={isPickerDisabled}
          UNSAFE_className="sidebar-picker"
        >
          {(item) => <Item key={item.id}>{item.title}</Item>}
        </Picker>

        {selectedTransitionId && (
          <Accordion
            defaultExpandedKeys={['properties']}
            key={selectedTransitionId}
            aria-label="Transition Configuration"
          >
            <Disclosure id="properties">
              <DisclosureTitle>Properties</DisclosureTitle>
              <DisclosurePanel>
                <PropertiesTab
                  key={`properties-${selectedTransitionId}`}
                  data={localTransitionData?.properties}
                  schema={propertiesSchema}
                  onChange={(properties) =>
                    handleTransitionChange({ properties })
                  }
                  isDisabled={isTabDisabled}
                />
              </DisclosurePanel>
              <Flex justifyContent="end" margin="size-100">
                <DialogTrigger>
                  <Button variant="negative" isDisabled={isTabDisabled}>
                    <Icon name={deleteIcon} size="20px" />
                  </Button>
                  <AlertDialog
                    title="Delete Transition"
                    variant="destructive"
                    primaryActionLabel="Delete"
                    cancelLabel="Cancel"
                    onPrimaryAction={() =>
                      handleDeleteTransition(selectedTransitionId)
                    }
                  >
                    Are you sure you want to delete this transition? This action
                    cannot be undone.
                  </AlertDialog>
                </DialogTrigger>
              </Flex>
            </Disclosure>
            <Disclosure id="guards">
              <DisclosureTitle>Guard Configuration</DisclosureTitle>
              <DisclosurePanel>
                <GuardsTab
                  key={`guards-${selectedTransitionId}`}
                  data={localTransitionData?.guards}
                  availableRoles={workflow?.context_data?.available_roles || []}
                  availableGroups={workflow?.context_data?.groups || []}
                  availablePermissions={
                    workflow?.context_data?.managed_permissions || []
                  }
                  onChange={(guards) => handleTransitionChange({ guards })}
                  isDisabled={isTabDisabled}
                />
              </DisclosurePanel>
            </Disclosure>
            <Disclosure id="source-states">
              <DisclosureTitle>Source States</DisclosureTitle>
              <DisclosurePanel>
                <SourceStatesTab
                  key={`source-states-${selectedTransitionId}`}
                  data={localTransitionData?.sourceStates}
                  availableStates={statesInfo.data?.states || []}
                  onChange={(sourceStates) =>
                    handleTransitionChange({ sourceStates })
                  }
                  isDisabled={isTabDisabled}
                />
              </DisclosurePanel>
            </Disclosure>
          </Accordion>
        )}
      </Flex>
    </View>
  );
};

export default Transition;
