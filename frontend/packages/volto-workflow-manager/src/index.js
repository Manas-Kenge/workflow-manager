import WorkflowControlPanel from './components/Controlpanel/WorkflowPanel';
import { workflow, state, transition } from './reducers';
import Buttons from './components/Widgets/Buttons';
import './theme/main.scss';

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
  config.widgets.widget.action = Buttons;

  return config;
};

export default applyConfig;
