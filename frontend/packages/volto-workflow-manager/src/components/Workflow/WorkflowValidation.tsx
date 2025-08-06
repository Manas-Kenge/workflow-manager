import React from 'react';
import { Link } from 'react-router-dom';
import {
  DialogTrigger,
  ActionButton,
  AlertDialog,
  Heading,
  Content,
  Text,
  Divider,
} from '@adobe/react-spectrum';
import type { ValidationErrors } from '../../types/workflow';

interface WorkflowValidationProps {
  validationErrors: ValidationErrors | null;
  workflowId: string;
}

const WorkflowValidation: React.FC<WorkflowValidationProps> = ({
  validationErrors,
  workflowId,
}) => {
  if (!validationErrors) {
    return null;
  }

  const hasErrors =
    validationErrors.state_errors.length > 0 ||
    validationErrors.transition_errors.length > 0 ||
    validationErrors.initial_state_error;

  return (
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
              {validationErrors.initial_state_error && (
                <Text>
                  <b>Initial State Error:</b> The workflow must have a valid
                  initial state.
                  <br />
                  <br />
                </Text>
              )}
              {validationErrors.state_errors.length > 0 && (
                <>
                  <Heading level={3}>State Errors</Heading>
                  {validationErrors.state_errors.map((err, index) => (
                    <Text key={`state-err-${index}`}>
                      <b>
                        <Link
                          to={`/controlpanel/workflowmanager/${workflowId}/settings`}
                          onClick={close}
                        >
                          {err.title || err.id}
                        </Link>
                      </b>
                      : {err.error}
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
              {validationErrors.transition_errors.length > 0 && (
                <>
                  <Heading level={3}>Transition Errors</Heading>
                  {validationErrors.transition_errors.map((err, index) => (
                    <Text key={`trans-err-${index}`}>
                      <b>
                        <Link
                          to={`/controlpanel/workflowmanager/${workflowId}/settings`}
                          onClick={close}
                        >
                          {err.title || err.id}
                        </Link>
                      </b>
                      : {err.error}
                      <br />
                    </Text>
                  ))}
                </>
              )}
            </Content>
          ) : (
            <Text>No validation errors found.</Text>
          )}
        </AlertDialog>
      )}
    </DialogTrigger>
  );
};

export default WorkflowValidation;
