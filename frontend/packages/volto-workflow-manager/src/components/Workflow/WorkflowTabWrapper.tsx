import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Flex, ProgressCircle, View } from '@adobe/react-spectrum';
import { getWorkflows, updateWorkflow } from '../../actions/workflow';
import WorkflowTab from './WorkflowTab';
import type { WorkflowReduxState } from '../../reducers/workflow';
import type { StateReduxState } from '../../reducers/state';
import type { TransitionReduxState } from '../../reducers/transition';

interface GlobalRootState {
  workflow: WorkflowReduxState;
  state: StateReduxState;
  transition: TransitionReduxState;
}

const workflowSchema = {
  title: 'Workflow Properties',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title', 'description'],
    },
  ],
  properties: {
    title: {
      title: 'Title',
      type: 'string',
    },
    description: {
      title: 'Description',
      type: 'string',
      widget: 'textarea',
    },
  },
  required: ['title'],
};

const WorkflowTabWrapper: React.FC = () => {
  const dispatch = useDispatch();
  const { workflowId } = useParams<{ workflowId: string }>();

  const { workflow, isLoading, isSaving } = useSelector(
    (state: GlobalRootState) => {
      return {
        workflow: state.workflow.workflows.items.find(
          (w) => w.id === workflowId,
        ),
        isLoading: state.workflow.workflows.loading,
        isSaving: state.workflow.operation.loading,
      };
    },
  );

  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    dispatch(getWorkflows());
  }, [dispatch]);

  useEffect(() => {
    if (workflow) {
      setFormData({
        title: workflow.title,
        description: workflow.description,
      });
    }
  }, [workflow]);

  const handleBlockChange = useCallback((blockId, newData) => {
    setFormData(newData);
  }, []);

  const handleSave = () => {
    if (workflowId) {
      dispatch(updateWorkflow(workflowId, formData));
    }
  };

  if (isLoading && !workflow) {
    return (
      <Flex alignItems="center" justifyContent="center" height="size-2000">
        <ProgressCircle isIndeterminate aria-label="Loading workflow..." />
      </Flex>
    );
  }

  return (
    <View>
      <WorkflowTab
        schema={workflowSchema}
        formData={formData}
        onChangeBlock={handleBlockChange}
        workflowId={workflowId}
      />
      <Flex
        direction="row"
        justifyContent="end"
        marginTop="size-200"
        paddingX="size-200"
      >
        <Button variant="cta" onPress={handleSave} isPending={isSaving}>
          Save
        </Button>
      </Flex>
    </View>
  );
};

export default WorkflowTabWrapper;
