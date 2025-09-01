import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../types';
import { useLocation, useHistory, Link } from 'react-router-dom';
import { useIntl, defineMessages } from 'react-intl';
import {
  Button,
  Heading,
  Text,
  ProgressCircle,
  DialogContainer,
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
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import add from '@plone/volto/icons/add.svg';
import back from '@plone/volto/icons/back.svg';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import { toast } from 'react-toastify';
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

const messages = defineMessages({
  workflowManager: {
    id: 'Workflow Manager',
    defaultMessage: 'Workflow Manager',
  },
});

const WorkflowControlPanel = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isClient = useClient();
  const searchParams = new URLSearchParams(location.search);
  const [isCreateWorkflowOpen, setCreateWorkflowOpen] = useState(false);

  const selectedWorkflow = searchParams.get('workflow');

  const {
    items: workflows,
    loading,
    error,
    loaded,
  } = useAppSelector((state) => state.workflow.workflows);

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

  useEffect(() => {
    if (lastCreatedWorkflowId && isProcessingCreation) {
      history.push(
        `/controlpanel/workflowmanager?workflow=${lastCreatedWorkflowId}`,
      );
      setIsProcessingCreation(false);
    }
  }, [lastCreatedWorkflowId, isProcessingCreation, history]);

  useEffect(() => {
    if (error) {
      toast.error(
        <Toast
          error
          title="Error"
          content={`Error loading workflows: ${error}`}
        />,
      );
    }
  }, [error]);

  useEffect(() => {
    if (operationError && isProcessingCreation) {
      toast.error(
        <Toast
          error
          title="Error Creating Workflow"
          content={operationError}
        />,
      );
      setIsProcessingCreation(false);
    }
  }, [operationError, isProcessingCreation]);

  const handleCreateWorkflow = (cloneFromWorkflow, workflowName) => {
    setIsProcessingCreation(true);
    dispatch(addWorkflow(cloneFromWorkflow, workflowName));
    setCreateWorkflowOpen(false);
  };

  const handleWorkflowClick = (workflowId) => {
    history.push(`/controlpanel/workflowmanager?workflow=${workflowId}`);
  };

  if (selectedWorkflow) {
    return (
      <WorkflowView workflowId={selectedWorkflow} pathname={props.pathname} />
    );
  }

  const showLoading = (operationLoading && isProcessingCreation) || loading;
  const loadingText =
    operationLoading && isProcessingCreation
      ? 'Creating Workflow...'
      : 'Loading Workflows...';

  return (
    <div id="page-controlpanel" className="ui container">
      <View width="100%" padding="size-400">
        <Helmet title={intl.formatMessage(messages.workflowManager)} />
        <Form width="100%">
          <Well>
            <Heading level={1}>Workflow Manager</Heading>
          </Well>

          <Well marginTop="size-300">
            {showLoading ? (
              <Flex alignItems="center" gap="size-200" marginTop="size-300">
                <ProgressCircle aria-label={loadingText} isIndeterminate />
                <Text>{loadingText}</Text>
              </Flex>
            ) : (
              workflows && (
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
              )
            )}
          </Well>
        </Form>

        {isCreateWorkflowOpen && (
          <DialogContainer onDismiss={() => setCreateWorkflowOpen(false)}>
            <CreateWorkflow
              workflows={workflows || []}
              onCreate={handleCreateWorkflow}
              onClose={() => setCreateWorkflowOpen(false)}
            />
          </DialogContainer>
        )}

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
                    variant="primary"
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
    </div>
  );
};

export default ThemeProvider(WorkflowControlPanel);
