import React, { useState } from 'react';
import Sidebar from '@plone/volto/components/manage/Sidebar/Sidebar';
import {
  Tabs,
  TabList,
  TabPanels,
  Item,
  Picker,
  View,
  Text,
} from '@adobe/react-spectrum';

const Toolbox = () => {
  const [selectedTab, setSelectedTab] = useState('states');

  const states = ['Draft', 'Published', 'Archived'];
  const transitions = ['Publish', 'Retract', 'Submit'];

  const toolboxTab = {
    id: 'toolbox',
    title: 'Toolbox',
    sidebarTab: () => (
      <View padding="size-200" overflow="auto" height="100%">
        <Tabs
          aria-label="Workflow Toolbox Tabs"
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
        >
          <TabList>
            <Item key="states">States</Item>
            <Item key="transitions">Transitions</Item>
          </TabList>
          <TabPanels>
            <Item key="states">
              <Text>Manage Workflow States</Text>
              <Picker label="Select a state" width="100%" marginTop="size-200">
                {states.map((s) => (
                  <Item key={s}>{s}</Item>
                ))}
              </Picker>
            </Item>
            <Item key="transitions">
              <Text>Manage Workflow Transitions</Text>
              <Picker
                label="Select a transition"
                width="100%"
                marginTop="size-200"
              >
                {transitions.map((t) => (
                  <Item key={t}>{t}</Item>
                ))}
              </Picker>
            </Item>
          </TabPanels>
        </Tabs>
      </View>
    ),
  };

  return <Sidebar tabs={[toolboxTab]} />;
};

export default Toolbox;
