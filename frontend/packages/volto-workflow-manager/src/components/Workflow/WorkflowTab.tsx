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
    (state: GlobalRootState) => state.workflow.workflow.currentWorkflow,
  );

  const loading = useSelector(
    (state: GlobalRootState) => state.workflow.workflow.loading,
  );

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (!currentWorkflow || currentWorkflow.id !== workflowId) {
      dispatch(getWorkflow(workflowId));
      setFormData(null);
      return;
    }
    setFormData({
      title: currentWorkflow.title || '',
      description: currentWorkflow.description || '',
    });
  }, [workflowId, currentWorkflow, dispatch]);

  useEffect(() => {
    if (
      !formData ||
      !currentWorkflow ||
      currentWorkflow.id !== workflowId ||
      (formData.title === currentWorkflow.title &&
        formData.description === currentWorkflow.description)
    ) {
      onDataChange(null);
    } else {
      onDataChange(formData);
    }
  }, [formData, currentWorkflow, workflowId, onDataChange]);

  const handleChangeField = useCallback((id: string, value: any) => {
    setFormData((prevData) => ({
      ...(prevData ?? { title: '', description: '' }),
      [id]: value,
    }));
  }, []);

  if (!formData) {
    return <ProgressCircle isIndeterminate aria-label="Loading workflow..." />;
  }

  return (
    <View padding="size-200">
      <Form
        key={workflowId}
        schema={workflowSchema}
        formData={formData}
        onChangeField={handleChangeField}
        editable={!isDisabled}
        hideActions
      />
    </View>
  );
};

export default WorkflowTab;
