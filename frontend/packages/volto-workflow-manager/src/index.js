import WorkflowControlPanel from './components/Controlpanel/ControlPanel';
import workflowReducer from './features/workflow/workflowSlice';

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
      path: '/controlpanel/workflowmanager',
      component: WorkflowControlPanel,
    },
  ];
  config.addonReducers = {
    ...config.addonReducers,
    workflow: workflowReducer,
  };

  return config;
};

export default applyConfig;
