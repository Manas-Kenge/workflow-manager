import React, { useState } from 'react';
import {
  Button,
  Select,
  SelectValue,
  ListBox,
  ListBoxItem,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Separator,
  Label,
  ToggleButton,
} from 'react-aria-components';

export default function ToolboxSection() {
  // Workflow states data
  const workflowStates = [
    { id: 1, name: 'Private', position: { top: '98px', left: 0 } },
    { id: 2, name: 'Pending review', position: { top: 0, left: '316px' } },
    { id: 3, name: 'Published', position: { top: '148px', left: 0 } },
  ];

  // Transitions data
  const transitions = [{ id: 1, name: 'Reviewer approves content' }];

  const [designMode, setDesignMode] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(
    'Simple Publication workflow',
  );
  const [selectedState, setSelectedState] = useState('');
  const [selectedTransition, setSelectedTransition] = useState('');

  return (
    <section className="w-full max-w-[1336px] mx-auto my-8">
      <div className="border border-neutral-100 rounded-lg bg-white">
        <div className="p-0">
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-neutral-100">
              <div>
                <h2 className="text-xl font-bold">Workflow Manager</h2>
                <p className="text-[15.3px] text-[#1e1e1e]">
                  You are currently working on the "Simple Publication workflow"
                  workflow.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select
                  selectedKey={selectedWorkflow}
                  onSelectionChange={setSelectedWorkflow}
                  className="w-[217px]"
                >
                  <Button className="w-full h-[41px] rounded-[12.21px] bg-white shadow-[0px_4px_4px_#0000001a] border border-gray-300 px-3 flex items-center justify-between">
                    <SelectValue />
                    <span className="ml-2">▼</span>
                  </Button>
                  <ListBox className="bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                    <ListBoxItem
                      id="Simple Publication workflow"
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 focus:bg-blue-100 focus:outline-none"
                    >
                      Simple Publication workflow
                    </ListBoxItem>
                  </ListBox>
                </Select>

                <Button className="h-[41px] bg-[#2c2c2c] rounded-[12.21px] text-[12.2px] text-neutral-100 px-4 flex items-center gap-2 hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  <span className="text-white">+</span>
                  Create a new workflow
                </Button>
              </div>
            </div>

            <div className="flex">
              {/* Left sidebar */}
              <div className="w-[214px] border-r border-neutral-100">
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-2">Toolbox</h3>
                    <div className="flex items-center gap-2 text-[12.2px]">
                      <Label>Design mode</Label>
                      <Switch
                        isSelected={designMode}
                        onChange={setDesignMode}
                        className="flex items-center"
                      >
                        <div className="w-8 h-4 bg-gray-200 rounded-full relative transition-colors data-[selected]:bg-blue-500">
                          <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform data-[selected]:translate-x-4" />
                        </div>
                      </Switch>
                    </div>
                  </div>

                  <Button className="w-full h-[49px] mb-4 justify-start gap-2 border border-[#e3e3e3] rounded-[11.8px] bg-white px-3 flex items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="text-[16.3px]">📊 Reorder Graph</span>
                  </Button>

                  <Button className="w-full h-[49px] mb-4 justify-start gap-2 border border-[#e3e3e3] rounded-[11.8px] bg-white px-3 flex items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="text-[16.3px]">💾 Save Layout</span>
                  </Button>

                  <div className="mt-8">
                    <h3 className="text-[17.3px] mb-2">States</h3>
                    <Select
                      selectedKey={selectedState}
                      onSelectionChange={setSelectedState}
                      className="w-full mb-4"
                    >
                      <Button className="w-full h-[41px] rounded-[12.21px] bg-white shadow-[0px_6.11px_21.38px_#0000001a] border border-gray-300 px-3 flex items-center justify-between">
                        <SelectValue placeholder="Select state" />
                        <span className="ml-2">▼</span>
                      </Button>
                      <ListBox className="bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                        {workflowStates.map((state) => (
                          <ListBoxItem
                            key={state.id}
                            id={state.name}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 focus:bg-blue-100 focus:outline-none"
                          >
                            {state.name}
                          </ListBoxItem>
                        ))}
                      </ListBox>
                    </Select>

                    <div className="flex gap-2 mb-8">
                      <Button className="h-[30.54px] rounded-[11.8px] text-[12.2px] border border-[#e3e3e3] bg-white px-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Edit
                      </Button>
                      <Button className="h-[30.54px] rounded-[11.8px] text-[12.2px] bg-[#2c2c2c] text-white px-3 hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Find
                      </Button>
                      <Button className="h-[31px] rounded-[11.8px] text-[12.2px] border border-[#e3e3e3] bg-white px-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Clear
                      </Button>
                    </div>

                    <h3 className="text-[17.3px] mb-2">Transitions</h3>
                    <Select
                      selectedKey={selectedTransition}
                      onSelectionChange={setSelectedTransition}
                      className="w-full mb-4"
                    >
                      <Button className="w-full h-[41px] rounded-[12.21px] bg-white shadow-[0px_6.11px_21.38px_#0000001a] border border-gray-300 px-3 flex items-center justify-between">
                        <SelectValue placeholder="Select transition" />
                        <span className="ml-2">▼</span>
                      </Button>
                      <ListBox className="bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                        {transitions.map((transition) => (
                          <ListBoxItem
                            key={transition.id}
                            id={transition.name}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 focus:bg-blue-100 focus:outline-none"
                          >
                            {transition.name}
                          </ListBoxItem>
                        ))}
                      </ListBox>
                    </Select>

                    <div className="flex gap-2">
                      <Button className="h-[30.54px] rounded-[11.8px] text-[12.2px] border border-[#e3e3e3] bg-white px-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Edit
                      </Button>
                      <Button className="h-[30.54px] rounded-[11.8px] text-[12.2px] bg-[#2c2c2c] text-white px-3 hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Find
                      </Button>
                      <Button className="h-[31px] rounded-[11.8px] text-[12.2px] border border-[#e3e3e3] bg-white px-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 relative">
                <div className="flex items-center p-4 gap-2">
                  <Button className="h-[31px] bg-[#2c2c2c] rounded-[12.21px] text-[12.2px] text-neutral-100 px-3 flex items-center gap-1 hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    <span>+</span>
                    Add State
                  </Button>

                  <Button className="h-[31px] rounded-[12.21px] text-[12.2px] border border-[#767676] bg-neutral-100 px-3 flex items-center gap-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>+</span>
                    Add Transition
                  </Button>

                  <Button className="h-[31px] rounded-[12.21px] text-[12.2px] border border-[#767676] bg-neutral-100 px-3 flex items-center gap-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>✓</span>
                    Sanity Check
                  </Button>

                  <Button className="h-8 rounded-[12.21px] text-[12.2px] border border-[#767676] bg-neutral-100 px-3 flex items-center gap-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>👤+</span>
                    Assign
                  </Button>

                  <Button className="h-[31px] bg-[#e8726f] rounded-[12.21px] text-[12.2px] text-white border border-[#bf0f0c] px-3 flex items-center gap-1 hover:bg-[#d65a57] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <span>🗑️</span>
                    Delete
                  </Button>

                  <div className="flex items-center ml-4 gap-2">
                    <div className="flex items-center gap-2">
                      <ToggleButton
                        isSelected={advancedMode}
                        onChange={setAdvancedMode}
                        className="flex items-center justify-center w-6 h-6 rounded-[6.11px] data-[selected]:bg-[#2c2c2c] bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {advancedMode && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </ToggleButton>
                      <span className="text-[12.2px]">Advanced mode</span>
                    </div>
                  </div>

                  <Button className="h-[29px] ml-auto rounded-[12.21px] text-[12.2px] border border-[#767676] bg-neutral-100 px-3 flex items-center gap-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>💾</span>
                    Save
                  </Button>
                </div>

                <Tabs defaultSelectedKey="transitions" className="ml-auto">
                  <TabList className="ml-auto flex">
                    <Tab
                      id="transitions"
                      className="rounded-t-md border-b-[1.53px] border-[#303030] text-[#303030] text-[12.2px] px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 selected:border-[#303030] selected:text-[#303030]"
                    >
                      Transitions
                    </Tab>
                    <Tab
                      id="properties"
                      className="rounded-t-md border-b-[1.53px] border-[#b1b1b1] text-[#767676] text-[12.2px] px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 selected:border-[#303030] selected:text-[#303030]"
                    >
                      Properties
                    </Tab>
                    <Tab
                      id="permissions"
                      className="rounded-t-md border-b-[1.53px] border-[#b1b1b1] text-[#767676] text-[12.2px] px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 selected:border-[#303030] selected:text-[#303030]"
                    >
                      Permission Roles
                    </Tab>
                  </TabList>

                  <TabPanel id="transitions">
                    {/* Workflow diagram */}
                    <div className="w-[814px] h-[451px] mx-auto mt-4 bg-neutral-100 relative">
                      <div className="absolute w-[423px] h-32 top-[87px] left-[202px]">
                        {workflowStates.map(
                          (state, index) =>
                            index < 2 && (
                              <div
                                key={state.id}
                                className="absolute flex items-center justify-center w-[107px] h-[31px] bg-[#e3e3e3] text-[#1e1e1e] text-[12.2px] rounded-[12.21px] border-[1.53px] border-[#767676]"
                                style={{
                                  top: state.position.top,
                                  left: state.position.left,
                                }}
                              >
                                {state.name}
                              </div>
                            ),
                        )}
                        <div className="absolute w-[210px] h-[89px] top-5 left-[107px] flex items-center justify-center text-2xl">
                          →
                        </div>
                      </div>

                      <div className="absolute w-[107px] h-[179px] top-[118px] left-[518px]">
                        <div className="absolute flex items-center justify-center w-[107px] h-[31px] top-[148px] left-0 bg-[#e3e3e3] text-[#1e1e1e] text-[12.2px] rounded-[12.21px] border-[1.53px] border-[#767676]">
                          Published
                        </div>
                        <div className="absolute w-1.5 h-[148px] top-0 left-[51px] flex items-center justify-center text-2xl">
                          ↓
                        </div>
                      </div>
                    </div>
                  </TabPanel>

                  <TabPanel id="properties">
                    <div className="p-4">Properties content would go here</div>
                  </TabPanel>

                  <TabPanel id="permissions">
                    <div className="p-4">
                      Permission roles content would go here
                    </div>
                  </TabPanel>
                </Tabs>
              </div>

              {/* Right sidebar */}
              <div className="w-[252px] border-l border-neutral-100 p-4">
                <h3 className="text-lg font-semibold mb-2">Transitions</h3>
                <div>
                  <div className="text-[12.2px] text-[#1e1e1e]">
                    Transitions this state can use
                  </div>
                  <Separator className="my-1 h-px bg-gray-200" />
                </div>

                <div className="mt-4 bg-neutral-100 p-2 h-[148px]">
                  {transitions.map((transition) => (
                    <div key={transition.id} className="text-[12.2px] p-1">
                      {transition.name}
                    </div>
                  ))}
                </div>

                <Button className="mt-4 h-[31px] rounded-[12.21px] text-[12.2px] border border-[#767676] bg-white px-3 flex items-center gap-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span>+</span>
                  Add Transition
                </Button>

                <div className="flex justify-end gap-2 mt-auto pt-8">
                  <Button className="h-[29px] rounded-[11.8px] text-[12.2px] border border-[#767676] px-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Cancel
                  </Button>
                  <Button className="h-[27px] rounded-[11.8px] text-[12.2px] border border-[#767676] px-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Ok
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
