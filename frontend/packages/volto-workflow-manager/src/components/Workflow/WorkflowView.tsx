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
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import { createPortal } from 'react-dom';
import { useClient } from '@plone/volto/hooks/client/useClient';
import type { WorkflowViewProps } from '../../types/workflow';
import WorkflowSidebar from './WorkflowSidebar';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateState } from '../../actions/state';
import { updateTransition } from '../../actions/transition';
import { getWorkflow, updateWorkflow } from '../../actions/workflow';
import { toast } from 'react-toastify';
import Toast from '@plone/volto/components/manage/Toast/Toast';

const WorkflowView: React.FC<WorkflowViewProps> = ({
  workflowId,
  pathname,
}) => {
  const isClient = useClient();
  const dispatch = useDispatch();
  const [payloadToSave, setPayloadToSave] = useState<{
    payload: any;
    kind: 'workflow' | 'state' | 'transition';
  } | null>(null);

  useEffect(() => {
    if (workflowId) {
      dispatch(getWorkflow(workflowId));
    }
  }, [dispatch, workflowId]);

  const workflow = useAppSelector(
    (state) => state.workflow.workflow.currentWorkflow,
  );
  const isLoading = useAppSelector((state) => state.workflow.workflow.loading);
  const isSavingState = useAppSelector((state) => state.state.update.loading);
  const isSavingTransition = useAppSelector(
    (state) => state.transition.update.loading,
  );
  const isSavingWorkflow = useAppSelector(
    (state) => state.workflow.operation.loading,
  );
  const isDeletingState = useAppSelector(
    (state) => state.state.delete?.loading || false,
  );
  const isDeletingTransition = useAppSelector(
    (state) => state.transition.delete?.loading || false,
  );

  const isSaving = isSavingState || isSavingTransition || isSavingWorkflow;
  const isDeleting = isDeletingState || isDeletingTransition;

  const prevIsSaving = useRef(isSaving);
  const prevIsDeleting = useRef(isDeleting);

  useEffect(() => {
    if (prevIsSaving.current && !isSaving) {
      toast.success(<Toast success title="Success" content="Changes saved." />);
      dispatch(getWorkflow(workflowId));
    }
    prevIsSaving.current = isSaving;
  }, [isSaving, dispatch, workflowId]);

  useEffect(() => {
    if (prevIsDeleting.current && !isDeleting) {
      toast.success(<Toast success title="Success" content="Item deleted." />);
      dispatch(getWorkflow(workflowId));
    }
    prevIsDeleting.current = isDeleting;
  }, [isDeleting, dispatch, workflowId]);

  const handleDataChange = useCallback(
    (payload: any | null, kind: 'workflow' | 'state' | 'transition') => {
      if (payload) {
        setPayloadToSave({ payload, kind });
      } else {
        setPayloadToSave(null);
      }
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!payloadToSave || !workflowId) return;

    const { payload, kind } = payloadToSave;

    if (kind === 'workflow') {
      dispatch(updateWorkflow(workflowId, payload));
    } else if (kind === 'state') {
      dispatch(updateState(workflowId, payload.id, payload));
    } else if (kind === 'transition') {
      dispatch(updateTransition(workflowId, payload.id, payload));
    }
  }, [dispatch, payloadToSave, workflowId]);

  if (isLoading || !workflow || workflow.id !== workflowId) {
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
        <WorkflowHeader workflow={workflow} />
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
            <WorkflowGraph workflow={workflow} />
          </View>
        </Grid>
      </View>
      {isClient &&
        createPortal(
          <Toolbar
            pathname={pathname}
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
                <Button
                  id="toolbar-saving-workflow"
                  aria-label="Save changes"
                  variant="primary"
                  onPress={handleSave}
                  isDisabled={!payloadToSave || isSaving}
                >
                  <Icon
                    name={save}
                    className="circled"
                    size="30px"
                    title="Save changes"
                  />
                </Button>
              </>
            }
          />,
          document.getElementById('toolbar'),
        )}
      <div id="sidebar">
        <WorkflowSidebar
          currentWorkflow={workflow}
          onDataChange={handleDataChange}
          isDisabled={isSaving || isDeleting}
        />
      </div>
    </View>
  );
};

export default WorkflowView;
