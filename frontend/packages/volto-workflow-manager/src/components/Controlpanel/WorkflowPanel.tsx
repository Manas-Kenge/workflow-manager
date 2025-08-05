import { useEffect, useState, useRef } from 'react';
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
import { toast } from 'react-toastify';
import { useIntl, defineMessages } from 'react-intl';
import {
  getWorkflows,
  addWorkflow,
  clearLastCreatedWorkflow,
} from '../../actions';
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

const messages = defineMessages({
  errorLoading: {
    id: 'Error Loading Workflows',
    defaultMessage: 'Error Loading Workflows',
  },
  errorCreating: {
    id: 'Error Creating Workflow',
    defaultMessage: 'Error Creating Workflow',
  },
});

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const WorkflowControlPanel = (props) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isClient = useClient();
  const intl = useIntl();
  const searchParams = new URLSearchParams(location.search);
  const [isCreateWorkflowOpen, setCreateWorkflowOpen] = useState(false);

  const selectedWorkflow = searchParams.get('workflow');

  const {
    items: workflows,
    loading: workflowsLoading,
    error: workflowsError,
    loaded,
  } = useAppSelector((state) => state.workflow.workflows);

  const { loading: operationLoading, error: operationError } = useAppSelector(
    (state) => state.workflow.operation,
  );

  const lastCreatedWorkflowId = useAppSelector(
    (state) => state.workflow.lastCreatedWorkflowId,
  );

  const prevWorkflowsError = usePrevious(workflowsError);
  const prevOperationError = usePrevious(operationError);

  useEffect(() => {
    if (!loaded) {
      dispatch(getWorkflows());
    }
  }, [dispatch, loaded]);

  useEffect(() => {
    if (lastCreatedWorkflowId) {
      history.push(
        `/controlpanel/workflowmanager?workflow=${lastCreatedWorkflowId}`,
      );
      dispatch(clearLastCreatedWorkflow());
    }
  }, [lastCreatedWorkflowId, history, dispatch]);

  useEffect(() => {
    if (workflowsError && workflowsError !== prevWorkflowsError) {
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.errorLoading)}
          content={workflowsError}
        />,
      );
    }
    if (operationError && operationError !== prevOperationError) {
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.errorCreating)}
          content={operationError}
        />,
      );
    }
  }, [
    workflowsError,
    prevWorkflowsError,
    operationError,
    prevOperationError,
    intl,
  ]);

  const handleCreateWorkflow = (cloneFromWorkflow, workflowName) => {
    dispatch(addWorkflow(cloneFromWorkflow, workflowName));
    setCreateWorkflowOpen(false);
  };

  const handleWorkflowClick = (workflowId) => {
    history.push(`/controlpanel/workflowmanager?workflow=${workflowId}`);
  };

  if (selectedWorkflow) {
    return <WorkflowView workflowId={selectedWorkflow} />;
  }

  const showLoading = operationLoading || workflowsLoading;
  const loadingText = operationLoading
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
              onCreate={handleCreateWorkflow}
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
