import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Flex, ProgressCircle, View } from '@adobe/react-spectrum';
import {
  getWorkflow,
  getWorkflows,
  updateWorkflow,
} from '../../actions/workflow';
import WorkflowTab from './WorkflowTab';
import type { WorkflowReduxState } from '../../reducers/workflow';
import type { StateReduxState } from '../../reducers/state';
import type { TransitionReduxState } from '../../reducers/transition';
import workflow from '../../reducers/workflow';
import { useAppSelector, useAppDispatch } from '../../types';

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

const WorkflowTabWrapper: React.FC = (workflowId: { workflowId: string }) => {
  const dispatch = useDispatch();
  const currentWorkflow = useAppSelector(
    (state) => state.workflow?.workflow?.currentWorkflow,
  );
  console.log(currentWorkflow);
  const [formData, setFormData] = useState({
    title: currentWorkflow?.title || '',
    description: currentWorkflow?.description || '',
  });
  useEffect(() => {
    if (workflowId.workflowId) dispatch(getWorkflow(workflowId.workflowId));
  }, [workflowId.workflowId, dispatch]);

  useEffect(() => {
    if (currentWorkflow) {
      setFormData({
        title: currentWorkflow?.title || '',
        description: currentWorkflow?.description || '',
      });
    }
  }, [currentWorkflow]);

  //can use useCallback
  const handleChangeField = (fieldId: string, value: any) => {
    console.log('Field changed:', fieldId, value);
    setFormData((prevData) => ({
      ...prevData,
      [fieldId]: value,
    }));
  };

  const handleSave = useCallback(async () => {
    if (workflowId.workflowId && formData?.title) {
      try {
        await dispatch(updateWorkflow(workflowId.workflowId, formData));
      } catch (error) {
        return error;
      }
    }
  }, [dispatch, workflowId.workflowId, formData]);

  return (
    <View>
      <WorkflowTab
        schema={workflowSchema}
        formData={formData}
        workflowId={workflowId.workflowId}
        onChangeField={handleChangeField}
      />

      <Flex
        direction="row"
        justifyContent="end"
        marginTop="size-200"
        paddingX="size-200"
      >
        {/* Add isPending */}
        <Button variant="cta" onPress={handleSave}>
          Save
        </Button>
      </Flex>
    </View>
  );
};

export default WorkflowTabWrapper;
