import { useState, Fragment, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ActionButton,
  Button,
  Flex,
  Item,
  TabList,
  TabPanels,
  Tabs,
} from '@adobe/react-spectrum';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { withCookies } from 'react-cookie';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';
import { getCookieOptions } from '@plone/volto/helpers/Cookies/cookies';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import { setSidebarTab } from '@plone/volto/actions/sidebar/sidebar';
import expandSVG from '@plone/volto/icons/left-key.svg';
import collapseSVG from '@plone/volto/icons/right-key.svg';
import WorkflowTab from './WorkflowTab';
import State from '../States/State';
import Transition from '../Transitions/Transition';
import type { GlobalRootState } from 'volto-workflow-manager/types';

const messages = defineMessages({
  document: {
    id: 'Document',
    defaultMessage: 'Document',
  },
  block: {
    id: 'Block',
    defaultMessage: 'Block',
  },
  settings: {
    id: 'Settings',
    defaultMessage: 'Settings',
  },
  shrinkSidebar: {
    id: 'Shrink sidebar',
    defaultMessage: 'Shrink sidebar',
  },
  expandSidebar: {
    id: 'Expand sidebar',
    defaultMessage: 'Expand sidebar',
  },
  order: {
    id: 'Order',
    defaultMessage: 'Order',
  },
  workflow: {
    id: 'Workflow',
    defaultMessage: 'Workflow',
  },
  states: {
    id: 'States',
    defaultMessage: 'States',
  },
  transitions: {
    id: 'Transitions',
    defaultMessage: 'Transitions',
  },
});

const Sidebar = (props) => {
  const dispatch = useDispatch();
  const { currentWorkflow, onDataChange, isDisabled } = props;
  const selectedItem = useSelector(
    (state: GlobalRootState) => state.workflow.selectedItem,
  );

  const intl = useIntl();
  const {
    cookies,
    content,
    workflowTab = true,
    statesTab = true,
    transitionsTab = true,
  } = props;
  const [expanded, setExpanded] = useState(
    cookies.get('sidebar_expanded') !== 'false',
  );
  const [size] = useState(0);
  const [showFull, setshowFull] = useState(true);

  const tabIndex = useSelector((state) => state?.sidebar.tab);
  const toolbarExpanded = useSelector((state) => state?.toolbar.expanded);

  const onToggleExpanded = () => {
    cookies.set('sidebar_expanded', !expanded, getCookieOptions());
    setExpanded(!expanded);
    resetFullSizeSidebar();
  };

  const resetFullSizeSidebar = useCallback(() => {
    if (!expanded) {
      const currentResizer = document.querySelector('#sidebar');
      const sidebarContainer =
        currentResizer.getElementsByClassName('sidebar-container')[0];
      sidebarContainer.classList.remove('full-size');
      sidebarContainer.classList.remove('no-toolbar');
      setshowFull(true);
    }
  }, [expanded]);

  const onToggleFullSize = useCallback(() => {
    const currentResizer = document.querySelector('#sidebar');
    const sidebarContainer =
      currentResizer.getElementsByClassName('sidebar-container')[0];

    if (showFull) {
      sidebarContainer.classList.add('full-size');
      if (!toolbarExpanded) {
        sidebarContainer.classList.add('no-toolbar');
      } else {
        sidebarContainer.classList.remove('no-toolbar');
      }
    } else {
      sidebarContainer.classList.remove('full-size');
      sidebarContainer.classList.remove('no-toolbar');
    }
    setshowFull(!showFull);
  }, [showFull, toolbarExpanded]);

  const workflowTabs = useMemo(
    () =>
      [
        workflowTab && {
          key: 'workflow',
          title: intl.formatMessage(messages.workflow),
          content: (
            <WorkflowTab
              workflowId={currentWorkflow.id}
              onDataChange={(payload) => onDataChange(payload, 'workflow')}
              isDisabled={isDisabled}
            />
          ),
        },
        statesTab && {
          key: 'states',
          title: intl.formatMessage(messages.states),
          content: (
            <State
              workflowId={currentWorkflow.id}
              workflow={currentWorkflow}
              onDataChange={(payload) => onDataChange(payload, 'state')}
              isDisabled={isDisabled}
            />
          ),
        },
        transitionsTab && {
          key: 'transitions',
          title: intl.formatMessage(messages.transitions),
          content: (
            <Transition
              workflowId={currentWorkflow.id}
              workflow={currentWorkflow}
              onDataChange={(payload) => onDataChange(payload, 'transition')}
              isDisabled={isDisabled}
            />
          ),
        },
      ].filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      onDataChange,
      workflowTab,
      statesTab,
      transitionsTab,
      intl,
      currentWorkflow,
      isDisabled,
      selectedItem,
    ],
  );

  const selectedKey = workflowTabs[tabIndex]?.key;

  const handleTabChange = (key) => {
    const newIndex = workflowTabs.findIndex((tab) => tab.key === key);
    if (newIndex > -1) {
      dispatch(setSidebarTab(newIndex));
    }
  };

  return (
    <Fragment>
      <BodyClass
        className={expanded ? 'has-sidebar' : 'has-sidebar-collapsed'}
      />
      <div
        className={cx('sidebar-container', { collapsed: !expanded })}
        style={size > 0 ? { width: size } : null}
      >
        <Button
          variant="primary"
          UNSAFE_className={
            content && content.review_state
              ? `${content.review_state} trigger`
              : 'trigger'
          }
          aria-label={
            expanded
              ? intl.formatMessage(messages.shrinkSidebar)
              : intl.formatMessage(messages.expandSidebar)
          }
          onPress={onToggleExpanded}
        />

        <Tabs
          aria-label="Workflow Manager Sidebar"
          selectedKey={selectedKey}
          onSelectionChange={handleTabChange}
          isQuiet
          height="100%"
        >
          <Flex
            direction="row"
            alignItems="center"
            gap="size-100"
            UNSAFE_className="sidebar-tabs-header"
          >
            <ActionButton
              UNSAFE_className="full-size-sidenav-btn"
              aria-label="full-screen-sidenav"
              onPress={onToggleFullSize}
            >
              <Icon
                className="full-size-icon"
                name={showFull ? expandSVG : collapseSVG}
              />
            </ActionButton>

            <TabList flex="1">
              {workflowTabs.map((tab) => (
                <Item key={tab.key}>{tab.title}</Item>
              ))}
            </TabList>
          </Flex>

          <TabPanels flex="1" UNSAFE_className="sidebar-tab-panels">
            {workflowTabs.map((tab) => (
              <Item key={tab.key}>{tab.content}</Item>
            ))}
          </TabPanels>
        </Tabs>
      </div>
      <div className={expanded ? 'pusher expanded' : 'pusher'} />
    </Fragment>
  );
};

Sidebar.propTypes = {
  currentWorkflow: PropTypes.object.isRequired,
  onDataChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  documentTab: PropTypes.bool,
  blockTab: PropTypes.bool,
  settingsTab: PropTypes.bool,
};

Sidebar.defaultProps = {
  documentTab: true,
  blockTab: true,
  settingsTab: false,
};

export default compose(withCookies)(Sidebar);
