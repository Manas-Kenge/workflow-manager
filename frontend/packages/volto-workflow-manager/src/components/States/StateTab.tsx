import {
  Accordion,
  Disclosure,
  DisclosureTitle,
  DisclosurePanel,
} from '@adobe/react-spectrum';
import React from 'react';

const StateTab = () => {
  return (
    <Accordion defaultExpandedKeys={['transitions']}>
      <Disclosure id="transitions">
        <DisclosureTitle>Transitions</DisclosureTitle>
        <DisclosurePanel>Transitions this state can use.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="properties">
        <DisclosureTitle>Properties</DisclosureTitle>
        <DisclosurePanel>Properties this state can use.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="permission-roles">
        <DisclosureTitle>Permission Roles</DisclosureTitle>
        <DisclosurePanel>Permission roles this state can use.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="group-roles">
        <DisclosureTitle>Group Roles</DisclosureTitle>
        <DisclosurePanel>Group roles this state can use.</DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
};

export default StateTab;
