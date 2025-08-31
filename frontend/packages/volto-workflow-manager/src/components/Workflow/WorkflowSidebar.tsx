import { useState, Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Tab } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { withCookies } from 'react-cookie';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';
import { getCookieOptions } from '@plone/volto/helpers/Cookies/cookies';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import forbiddenSVG from '@plone/volto/icons/forbidden.svg';
import { setSidebarTab } from '@plone/volto/actions/sidebar/sidebar';
import expandSVG from '@plone/volto/icons/left-key.svg';
import collapseSVG from '@plone/volto/icons/right-key.svg';
import { useClient } from '@plone/volto/hooks/client/useClient';
import { createPortal } from 'react-dom';
import WorkflowTab from './WorkflowTab';
import State from '../States/State';
import Transition from '../Transitions/Transition';

const messages = defineMessages({
  workflow: {
    id: 'Workflow',
    defaultMessage: 'Workflow',
  },
  state: {
    id: 'State',
    defaultMessage: 'State',
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
  transitions: {
    id: 'Transitions',
    defaultMessage: 'Transitions',
  },
});

const Sidebar = (props) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const {
    cookies,
    content,
    workflowTab = true,
    stateTab = true,
    transitionsTab = true,
  } = props;
  const [expanded, setExpanded] = useState(
    cookies.get('sidebar_expanded') !== 'false',
  );
  const [size] = useState(0);
  const [showFull, setshowFull] = useState(true);
  const isClient = useClient();
  const tab = useSelector((state) => state.sidebar.tab);
  const toolbarExpanded = useSelector((state) => state.toolbar.expanded);
  const type = useSelector((state) => state.schema?.schema?.title);
  const { currentWorkflow, onDataChange, isDisabled } = props;
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

  const onTabChange = (event, data) => {
    event.nativeEvent.stopImmediatePropagation();
    dispatch(setSidebarTab(data.activeIndex));
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
          type="button"
          aria-label={
            expanded
              ? intl.formatMessage(messages.shrinkSidebar)
              : intl.formatMessage(messages.expandSidebar)
          }
          className={
            content && content.review_state
              ? `${content.review_state} trigger`
              : 'trigger'
          }
          onClick={onToggleExpanded}
        />
        <Button
          type="button"
          className="full-size-sidenav-btn"
          onClick={onToggleFullSize}
          aria-label="full-screen-sidenav"
        >
          <Icon
            className="full-size-icon"
            name={showFull ? expandSVG : collapseSVG}
          />
        </Button>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
            attached: true,
            tabular: true,
            className: 'formtabs',
          }}
          className="tabs-wrapper"
          renderActiveOnly={false}
          activeIndex={tab}
          onTabChange={onTabChange}
          panes={[
            !!workflowTab && {
              menuItem: {
                key: 'workflowTab',
                as: 'button',
                className: 'ui button',
                content: type || intl.formatMessage(messages.workflow),
              },
              pane: (
                <Tab.Pane
                  key="metadata"
                  className="tab-wrapper"
                  id="sidebar-workflow"
                />
              ),
            },
            !!stateTab && {
              menuItem: {
                key: 'stateTab',
                as: 'button',
                className: 'ui button',
                content: intl.formatMessage(messages.state),
              },
              pane: (
                <Tab.Pane
                  key="properties"
                  className="tab-wrapper"
                  id="sidebar-state"
                >
                  <Icon
                    className="tab-forbidden"
                    name={forbiddenSVG}
                    size="48px"
                  />
                </Tab.Pane>
              ),
            },
            !!transitionsTab && {
              menuItem: intl.formatMessage(messages.transitions),
              pane: (
                <Tab.Pane
                  key="transitions"
                  className="tab-wrapper"
                  id="sidebar-transition"
                >
                  <Icon
                    className="tab-forbidden"
                    name={forbiddenSVG}
                    size="48px"
                  />
                </Tab.Pane>
              ),
            },
          ].filter((tab) => tab)}
        />
      </div>
      <div className={expanded ? 'pusher expanded' : 'pusher'} />
      {isClient &&
        createPortal(
          <WorkflowTab
            workflowId={currentWorkflow.id}
            onDataChange={(payload) => {
              onDataChange(payload, 'workflow');
            }}
            isDisabled={isDisabled}
          />,
          document.getElementById('sidebar-workflow'),
        )}
      {isClient &&
        createPortal(
          <State
            workflowId={currentWorkflow.id}
            workflow={currentWorkflow}
            onDataChange={(payload) => onDataChange(payload, 'state')}
            isDisabled={isDisabled}
          />,
          document.getElementById('sidebar-state'),
        )}
      {isClient &&
        createPortal(
          <Transition
            workflowId={currentWorkflow.id}
            workflow={currentWorkflow}
            onDataChange={(payload) => onDataChange(payload, 'transition')}
            isDisabled={isDisabled}
          />,
          document.getElementById('sidebar-transition'),
        )}
    </Fragment>
  );
};

Sidebar.propTypes = {
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
