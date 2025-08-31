import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, ProgressCircle } from '@adobe/react-spectrum';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import { getWorkflow } from '../../actions/workflow';
import type { GlobalRootState } from '../../types';
import type { WorkflowTabProps } from '../../types/workflow';

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
  }, [formData, currentWorkflow, workflowId]);

  const handleChangeField = useCallback(
    (data: any) => {
      setFormData(data);
    },
    [dispatch, workflowId],
  );

  if (!formData) {
    return <ProgressCircle isIndeterminate aria-label="Loading workflow..." />;
  }
  console.log('formData', formData);
  return (
    <View padding="size-200">
      <BlockDataForm
        key={workflowId}
        schema={workflowSchema}
        formData={formData}
        onChangeFormData={handleChangeField} //use onChangeFormData
        editable={!isDisabled}
        hideActions
      />
    </View>
  );
};

export default WorkflowTab;
