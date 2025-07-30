import {
  Button,
  ProgressCircle,
  Text,
  Form,
  View,
  Flex,
  Grid,
} from '@adobe/react-spectrum';
import WorkflowHeader from './WorkflowHeader';
import WorkflowGraph from '../Graph/WorkflowGraph';
import '@xyflow/react/dist/style.css';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../types';
import ActionsToolbar from './ActionsToolbar';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import save from '@plone/volto/icons/save.svg';
import back from '@plone/volto/icons/back.svg';
import settings from '@plone/volto/icons/settings.svg';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import { createPortal } from 'react-dom';
import { useClient } from '@plone/volto/hooks/client/useClient';

interface WorkflowViewProps {
  workflowId: string;
}

const WorkflowView: React.FC<WorkflowViewProps> = ({ workflowId }, props) => {
  const isClient = useClient();
  const workflows = useAppSelector((state) => state.workflow.workflows.items);
  const workflow = useAppSelector((state) =>
    state.workflow.workflows.items.find((w) => w.id === workflowId),
  );

  if (!workflow) {
    return (
      <Form>
        <View padding="size-400">
          <Flex alignItems="center" gap="size-200">
            <ProgressCircle aria-label="Loading workflow..." isIndeterminate />
            <Text>Loading workflow...</Text>
          </Flex>
        </View>
      </Form>
    );
  }

  return (
    <View width="100%" padding="size-400" margin="0">
      <View
        padding="size-200"
        borderColor="gray-300"
        borderWidth="thin"
        borderRadius="medium"
      >
        <WorkflowHeader
          workflows={workflows}
          selectedWorkflowId={workflow.id}
        />
      </View>
      <View padding="size-300" marginBottom="size-300">
        <ActionsToolbar workflowId={workflow.id} />
      </View>

      <View borderRadius="medium">
        <Grid
          areas={['content']}
          columns={['1fr']}
          gap="size-300"
          height="500px"
        >
          <View gridArea="content" height="100%">
            {workflow ? (
              <WorkflowGraph workflow={workflow} />
            ) : (
              <Flex alignItems="center" justifyContent="center" height="100%">
                <Flex alignItems="center" gap="size-200">
                  <ProgressCircle
                    aria-label="Loading workflow graph..."
                    isIndeterminate
                  />
                  <Text>Loading workflow graph...</Text>
                </Flex>
              </Flex>
            )}
          </View>
        </Grid>
      </View>
      {isClient &&
        createPortal(
          <Toolbar
            pathname={props.pathname}
            hideDefaultViewButtons
            inner={
              <>
                <Link to="/controlpanel/workflowmanager" className="item">
                  <Icon
                    name={back}
                    className="circled"
                    size="30px"
                    title="back"
                  />
                </Link>
                <Link
                  to={`/controlpanel/workflowmanager/${workflowId}/settings`}
                  className="settings"
                >
                  <Icon
                    name={settings}
                    className="circled"
                    aria-label="Workflow Settings"
                    size="30px"
                    title="Workflow Settings"
                  />
                </Link>
                <Button
                  id="toolbar-saving-workflow"
                  className="saving-workflow"
                  aria-label="Save workflow"
                >
                  <Icon
                    name={save}
                    className="circled"
                    size="30px"
                    title="Save workflow"
                  />
                </Button>
              </>
            }
          />,
          document.getElementById('toolbar'),
        )}
    </View>
  );
};

export default WorkflowView;
