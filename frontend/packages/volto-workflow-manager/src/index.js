import WorkflowControlPanel from './components/Controlpanel/WorkflowPanel';
import WorkflowSettings from './components/Workflow/WorkflowSettings';
// import State from './components/States/State';
import { workflow, state, transition } from './reducers';

const applyConfig = (config) => {
  config.settings.isMultilingual = false;
  config.settings.supportedLanguages = ['en'];
  config.settings.defaultLanguage = 'en';
  config.settings.controlpanels = [
    ...(config.settings.controlpanels || []),
    {
      '@id': '/workflowmanager',
      group: 'Add-on Configuration',
      title: 'Workflow Manager',
    },
  ];

  config.addonRoutes = [
    ...config.addonRoutes,
    {
      path: '/controlpanel/workflowmanager/:workflowId/settings',
      exact: true,
      component: WorkflowSettings,
    },
    {
      path: '/controlpanel/workflowmanager',
      exact: true,
      component: WorkflowControlPanel,
    },
  ];
  config.addonReducers = {
    ...config.addonReducers,
    workflow,
    state,
    transition,
  };
  config.views = {
    ...config.views,
    contentTypesViews: {},
  };
  return config;
};

export default applyConfig;
