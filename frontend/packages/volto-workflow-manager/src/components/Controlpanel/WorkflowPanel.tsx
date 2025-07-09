import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../types';
import { useLocation, useHistory, Link } from 'react-router-dom';
import {
  Button,
  Heading,
  Text,
  ProgressCircle,
  DialogTrigger,
  ActionButton,
  Flex,
  Form,
  Well,
  View,
} from '@adobe/react-spectrum';
import { getWorkflows, addWorkflow } from '../../actions';
import CreateWorkflow from '../Workflow/CreateWorkflow';
import WorkflowView from '../Workflow/WorkflowView';
import WorkflowTable from './WorkflowTable';
import ThemeProvider from '../../Provider';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import add from '@plone/volto/icons/add.svg';
import back from '@plone/volto/icons/back.svg';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { createPortal } from 'react-dom';
import { useClient } from '@plone/volto/hooks/client/useClient';

const plone_shipped_workflows = [
  'folder_workflow',
  'intranet_folder_workflow',
  'intranet_workflow',
  'one_state_workflow',
  'plone_workflow',
  'simple_publication_workflow',
  'comment_review_workflow',
  'comment_one_state_workflow',
];

const WorkflowControlPanel = (props) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isClient = useClient();
  const searchParams = new URLSearchParams(location.search);
  const [isCreateWorkflowOpen, setCreateWorkflowOpen] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedWorkflow = searchParams.get('workflow');

  const {
    items: workflows,
    loading,
    error,
    loaded,
  } = useAppSelector((state) => state.workflow.workflows);

  // Add selector for workflow creation state
  const { loading: operationLoading, error: operationError } = useAppSelector(
    (state) => state.workflow.operation,
  );

  const lastCreatedWorkflowId = useAppSelector(
    (state) => state.workflow.lastCreatedWorkflowId,
  );

  const [isProcessingCreation, setIsProcessingCreation] = useState(false);

  useEffect(() => {
    if (!loaded) {
      dispatch(getWorkflows());
    }
  }, [dispatch, loaded]);

  // Handle successful workflow creation
  useEffect(() => {
    if (lastCreatedWorkflowId && isProcessingCreation) {
      // Navigate to the new workflow
      history.push(
        `/controlpanel/workflowmanager?workflow=${lastCreatedWorkflowId}`,
      );

      // Reset the processing flag
      setIsProcessingCreation(false);
    }
  }, [lastCreatedWorkflowId, isProcessingCreation, history]);

  // Show error toast when workflow loading fails
  useEffect(() => {
    if (error) {
      setErrorMessage('Error loading workflows: ' + error.message);
      setShowErrorToast(true);
    }
  }, [error]);

  // Show error toast when operation fails
  useEffect(() => {
    if (operationError) {
      setErrorMessage('Error creating workflow: ' + operationError.message);
      setShowErrorToast(true);
    }
  }, [operationError]);

  const handleCreateWorkflow = (cloneFromWorkflow, workflowName) => {
    setIsProcessingCreation(true);
    dispatch(addWorkflow(cloneFromWorkflow, workflowName));
    setCreateWorkflowOpen(false); // Close the dialog immediately
  };

  const handleWorkflowClick = (workflowId) => {
    history.push(`/controlpanel/workflowmanager?workflow=${workflowId}`);
  };

  if (selectedWorkflow) {
    return <WorkflowView workflowId={selectedWorkflow} />;
  }

  // Show loading if we're creating a workflow or loading initial workflows
  const showLoading = (operationLoading && isProcessingCreation) || loading;
  const loadingText =
    operationLoading && isProcessingCreation
      ? 'Creating Workflow...'
      : 'Loading Workflows...';

  return (
    <div id="page-controlpanel" className="ui container">
      <View width="100%" padding="size-400">
        <Form width="100%">
          <Well>
            <Heading level={1}>Workflow Manager</Heading>
          </Well>

          <Well marginTop="size-300">
            {/* Show loading state */}
            {showLoading && (
              <Flex alignItems="center" gap="size-200" marginTop="size-300">
                <ProgressCircle aria-label={loadingText} isIndeterminate />
                <Text>{loadingText}</Text>
              </Flex>
            )}

            {!showLoading && workflows && (
              <>
                <Heading level={2} marginBottom="size-200">
                  Please select your workflow
                </Heading>
                <WorkflowTable
                  workflows={workflows.filter(
                    (workflow) =>
                      !plone_shipped_workflows.includes(workflow.id),
                  )}
                  handleWorkflowClick={handleWorkflowClick}
                  isClickable={true}
                />
              </>
            )}
          </Well>
        </Form>

        <DialogTrigger
          isOpen={isCreateWorkflowOpen}
          onOpenChange={setCreateWorkflowOpen}
          isDismissable
        >
          <ActionButton isHidden>Hidden Trigger</ActionButton>
          {(close) => (
            <CreateWorkflow
              workflows={workflows || []}
              onCreate={(cloneFromWorkflow, workflowName) => {
                handleCreateWorkflow(cloneFromWorkflow, workflowName);
                // Dialog will close via state change above
              }}
              close={close}
            />
          )}
        </DialogTrigger>

        {isClient &&
          createPortal(
            <Toolbar
              pathname={props.pathname}
              hideDefaultViewButtons
              inner={
                <>
                  <Link to="/controlpanel" className="item">
                    <Icon
                      name={back}
                      className="circled"
                      size="30px"
                      title="Back"
                    />
                  </Link>
                  <Button
                    id="toolbar-add-workflow"
                    className="add-workflow"
                    aria-label="Add workflow"
                    onPress={() => setCreateWorkflowOpen(true)}
                  >
                    <Icon
                      name={add}
                      className="circled"
                      size="30px"
                      title="Add workflow"
                    />
                  </Button>
                </>
              }
            />,
            document.getElementById('toolbar'),
          )}
      </View>

      {showErrorToast && (
        <Toast
          error
          title="Error"
          content={errorMessage}
          onDismiss={() => setShowErrorToast(false)}
        />
      )}
    </div>
  );
};

export default ThemeProvider(WorkflowControlPanel);
