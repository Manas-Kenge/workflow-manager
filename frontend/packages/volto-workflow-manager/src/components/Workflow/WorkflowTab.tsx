import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, ProgressCircle } from '@adobe/react-spectrum';
import Form from '@plone/volto/components/manage/Form/Form';
import { getWorkflow } from '../../actions/workflow';
import type { WorkflowReduxState } from '../../reducers/workflow';

interface GlobalRootState {
  workflow: WorkflowReduxState;
}

interface WorkflowTabProps {
  workflowId: string;
  onDataChange: (
    payload: { title: string; description: string } | null,
  ) => void;
  isDisabled: boolean;
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

const WorkflowTab: React.FC<WorkflowTabProps> = ({
  workflowId,
  onDataChange,
  isDisabled,
}) => {
  const dispatch = useDispatch();

  const currentWorkflow = useSelector(
    (state: GlobalRootState) => state.workflow.workflow.data,
  );
  const loading = useSelector(
    (state: GlobalRootState) => state.workflow.workflow.loading,
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (workflowId) {
      dispatch(getWorkflow(workflowId));
    }
  }, [workflowId, dispatch]);

  useEffect(() => {
    if (currentWorkflow) {
      const initialData = {
        title: currentWorkflow.title || '',
        description: currentWorkflow.description || '',
      };
      setFormData(initialData);
    }
  }, [currentWorkflow]);

  const handleChangeField = useCallback((id: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  }, []);

  useEffect(() => {
    if (
      currentWorkflow &&
      (formData.title !== currentWorkflow.title ||
        formData.description !== currentWorkflow.description)
    ) {
      onDataChange(formData);
    } else {
      onDataChange(null);
    }
  }, [formData, currentWorkflow, onDataChange]);

  if (loading && !currentWorkflow) {
    return <ProgressCircle isIndeterminate />;
  }

  return (
    <View padding="size-200">
      <Form
        key={workflowId}
        schema={workflowSchema}
        formData={formData}
        onChangeField={handleChangeField}
        hideActions
      />
    </View>
  );
};

export default WorkflowTab;
