import React, { useState, useEffect, useRef } from 'react';
import { validateWorkflow, clearValidation } from '../../actions';
import { useAppDispatch, useAppSelector } from '../../types';
import {
  Button,
  ButtonGroup,
  Flex,
  ProgressCircle,
} from '@adobe/react-spectrum';
import { toast } from 'react-toastify';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { useIntl, defineMessages } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import add from '@plone/volto/icons/add.svg';
import contentexisting from '@plone/volto/icons/content-existing.svg';
import checkboxChecked from '@plone/volto/icons/checkbox-checked.svg';
import blank from '@plone/volto/icons/blank.svg';
import CreateState from '../States/CreateState';
import CreateTransition from '../Transitions/CreateTransition';
import WorkflowValidation from './WorkflowValidation';
import AssignWorkflow from './AssignWorkflow';

const messages = defineMessages({
  validationSuccessTitle: {
    id: 'Validation Successful',
    defaultMessage: 'Validation Successful',
  },
  validationSuccessContent: {
    id: 'No errors found in the workflow.',
    defaultMessage: 'No errors found in the workflow.',
  },
  validationErrorTitle: {
    id: 'Validation Failed',
    defaultMessage: 'Validation Failed',
  },
  validationErrorContent: {
    id: 'Errors were found. Click "View Results" for details.',
    defaultMessage: 'Errors were found. Click "View Results" for details.',
  },
});
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const ActionsToolbar = ({ workflowId }: { workflowId: string }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [isCreateStateOpen, setCreateStateOpen] = useState(false);
  const [isCreateTransitionOpen, setCreateTransitionOpen] = useState(false);
  const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
  const workflow = useAppSelector(
    (state) => state.workflow.workflow.currentWorkflow,
  );
  const validation = useAppSelector((state) => state.workflow.validation);
  const wasLoading = usePrevious(validation.loading);

  useEffect(() => {
    dispatch(clearValidation());
  }, [dispatch, workflowId]);

  useEffect(() => {
    if (wasLoading && !validation.loading) {
      const errors = validation.errors;
      const hasErrors =
        errors &&
        (errors.state_errors.length > 0 ||
          errors.transition_errors.length > 0 ||
          errors.initial_state_error);

      if (hasErrors) {
        toast.error(
          <Toast
            error
            title={intl.formatMessage(messages.validationErrorTitle)}
            content={intl.formatMessage(messages.validationErrorContent)}
          />,
        );
      } else {
        toast.success(
          <Toast
            success
            title={intl.formatMessage(messages.validationSuccessTitle)}
            content={intl.formatMessage(messages.validationSuccessContent)}
          />,
        );
      }
    }
  }, [validation, wasLoading, intl]);

  const handleSanityCheck = () => {
    dispatch(validateWorkflow(workflowId));
  };

  return (
    <>
      <Flex justifyContent="start" alignItems="center" gap="size-100">
        <ButtonGroup>
          <Button variant="accent" onPress={() => setCreateStateOpen(true)}>
            <Icon name={add} size="20px" />
            Add State
          </Button>
          <Button
            variant="secondary"
            onPress={() => setCreateTransitionOpen(true)}
          >
            <Icon name={blank} size="20px" />
            Add Transition
          </Button>
          <Button
            variant="secondary"
            onPress={handleSanityCheck}
            isDisabled={validation.loading}
          >
            {validation.loading ? (
              <ProgressCircle
                aria-label="Running sanity check..."
                size="S"
                isIndeterminate
              />
            ) : (
              <Icon name={checkboxChecked} size="20px" />
            )}
            {validation.loading ? 'Checking...' : 'Sanity Check'}
          </Button>
          <Button variant="secondary" onPress={() => setAssignDialogOpen(true)}>
            <Icon name={contentexisting} size="20px" />
            Assign
          </Button>
        </ButtonGroup>

        <WorkflowValidation
          validationErrors={validation.errors}
          workflowId={workflowId}
        />
      </Flex>

      <CreateState
        workflowId={workflowId}
        isOpen={isCreateStateOpen}
        onClose={() => setCreateStateOpen(false)}
      />
      <CreateTransition
        workflowId={workflowId}
        isOpen={isCreateTransitionOpen}
        onClose={() => setCreateTransitionOpen(false)}
      />
      <AssignWorkflow
        workflow={workflow}
        isOpen={isAssignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
      />
    </>
  );
};

export default ActionsToolbar;
