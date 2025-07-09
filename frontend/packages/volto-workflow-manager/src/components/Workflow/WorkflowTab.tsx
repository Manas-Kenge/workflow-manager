import {
  Accordion,
  Disclosure,
  DisclosureTitle,
  DisclosurePanel,
} from '@adobe/react-spectrum';

const WorkflowTab = () => {
  return (
    <Accordion defaultExpandedKeys={['default']}>
      <Disclosure id="default">
        <DisclosureTitle>Default</DisclosureTitle>
        <DisclosurePanel>Title and summary.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="states">
        <DisclosureTitle>States</DisclosureTitle>
        <DisclosurePanel>States this workflow can use.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="transitions">
        <DisclosureTitle>Transitions</DisclosureTitle>
        <DisclosurePanel>Transitions this workflow can use.</DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
};

export default WorkflowTab;
