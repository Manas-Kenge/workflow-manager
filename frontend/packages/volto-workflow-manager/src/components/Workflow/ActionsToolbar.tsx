import React, { useState, useEffect, useRef } from 'react';
import { validateWorkflow } from '../../actions';
import { useAppDispatch, useAppSelector } from '../../types';
import {
  Button,
  ButtonGroup,
  Flex,
  DialogTrigger,
  ActionButton,
  AlertDialog,
  Heading,
  Content,
  Text,
  Divider,
  ProgressCircle,
} from '@adobe/react-spectrum';
import { toast } from 'react-toastify';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { useIntl, defineMessages } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import add from '@plone/volto/icons/add.svg';
import adduser from '@plone/volto/icons/add-user.svg';
import checkboxChecked from '@plone/volto/icons/checkbox-checked.svg';
import blank from '@plone/volto/icons/blank.svg';
import CreateState from '../States/CreateState';

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
  const validation = useAppSelector((state) => state.workflow.validation);
  const wasLoading = usePrevious(validation.loading);

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

  const hasErrors =
    validation.errors &&
    (validation.errors.state_errors.length > 0 ||
      validation.errors.transition_errors.length > 0 ||
      validation.errors.initial_state_error);

  const handleSanityCheck = () => {
    dispatch(validateWorkflow(workflowId));
  };

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <ButtonGroup>
          <Button variant="accent" onPress={() => setCreateStateOpen(true)}>
            <Icon name={add} size="20px" />
            Add State
          </Button>
          <Button variant="secondary">
            <Icon name={blank} size="20px" />
            Add Transition
          </Button>
          <Button
            variant="secondary"
            onPress={handleSanityCheck}
            isDisabled={validation.loading}
          >
            {validation.loading ? (
              <ProgressCircle size="S" isIndeterminate />
            ) : (
              <Icon name={checkboxChecked} size="20px" />
            )}
            {validation.loading ? 'Checking...' : 'Sanity Check'}
          </Button>
          <Button variant="secondary">
            <Icon name={adduser} size="20px" />
            Assign
          </Button>
        </ButtonGroup>

        {validation.errors && (
          <DialogTrigger>
            <ActionButton
              variant={hasErrors ? 'negative' : 'primary'}
              UNSAFE_style={{
                borderColor: hasErrors ? undefined : 'green',
                color: hasErrors ? undefined : 'green',
              }}
            >
              {hasErrors ? 'View Validation Errors' : 'View Validation Results'}
            </ActionButton>
            {(close) => (
              <AlertDialog
                title="Validation Results"
                variant={hasErrors ? 'warning' : 'information'}
                primaryActionLabel="Close"
                onPrimaryAction={close}
              >
                {hasErrors ? (
                  <Content>
                    {validation.errors.initial_state_error && (
                      <Text>
                        <b>Initial State Error:</b> The workflow must have a
                        valid initial state.
                        <br />
                        <br />
                      </Text>
                    )}
                    {validation.errors.state_errors.length > 0 && (
                      <>
                        <Heading level={3}>State Errors</Heading>
                        {validation.errors.state_errors.map((err, index) => (
                          <Text key={`state-err-${index}`}>
                            <b>{err.title || err.id}:</b> {err.error}
                            <br />
                          </Text>
                        ))}
                        <Divider
                          size="S"
                          marginTop="size-100"
                          marginBottom="size-100"
                        />
                      </>
                    )}
                    {validation.errors.transition_errors.length > 0 && (
                      <>
                        <Heading level={3}>Transition Errors</Heading>
                        {validation.errors.transition_errors.map(
                          (err, index) => (
                            <Text key={`trans-err-${index}`}>
                              <b>{err.title || err.id}:</b> {err.error}
                              <br />
                            </Text>
                          ),
                        )}
                      </>
                    )}
                  </Content>
                ) : (
                  <Text>No validation errors found.</Text>
                )}
              </AlertDialog>
            )}
          </DialogTrigger>
        )}
      </Flex>

      <CreateState
        workflowId={workflowId}
        isOpen={isCreateStateOpen}
        onClose={() => setCreateStateOpen(false)}
      />
    </>
  );
};

export default ActionsToolbar;
