import {
  Accordion,
  Disclosure,
  DisclosureTitle,
  DisclosurePanel,
} from '@adobe/react-spectrum';
import React from 'react';

const TransitionTab = () => {
  return (
    <Accordion defaultExpandedKeys={['properties']}>
      <Disclosure id="properties">
        <DisclosureTitle>Properties</DisclosureTitle>
        <DisclosurePanel>Properties this transition can use.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="guards">
        <DisclosureTitle>Guards</DisclosureTitle>
        <DisclosurePanel>Guards this transition can use.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="source-states">
        <DisclosureTitle>Source States</DisclosureTitle>
        <DisclosurePanel>
          Source states this transition can use.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="actions">
        <DisclosureTitle>Actions</DisclosureTitle>
        <DisclosurePanel>Actions this transition can use.</DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
};

export default TransitionTab;
