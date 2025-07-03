import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Heading,
  Content,
  Tabs,
  TabList,
  TabPanels,
  Item,
  ButtonGroup,
  Button,
} from '@adobe/react-spectrum';
import TransitionsTab from './Tabs/TransitionsTab';
import PropertiesTab from './Tabs/PropertiesTab';
import PermissionRolesTab from './Tabs/PermissionRolesTab';
import GroupRolesTab from './Tabs/GroupRolesTab';
// Assuming your WorkflowState type is available to import
import type { WorkflowState } from '../../types'; // Adjust path as needed

type StateEditDialogProps = {
  onClose: () => void;
  // Use the specific WorkflowState type instead of 'any'
  selectedState: WorkflowState;
  // Add an onSave handler to pass data back to the parent
  onSave: (updatedState: WorkflowState) => void;
};

const StateEditDialog: React.FC<StateEditDialogProps> = ({
  onClose,
  selectedState,
  onSave,
}) => {
  // Local state to manage edits within the dialog
  const [editableState, setEditableState] = useState<WorkflowState | null>(
    null,
  );
  const [selectedTab, setSelectedTab] = useState<React.Key>('properties');

  // Initialize or reset the local state when the selectedState prop changes
  useEffect(() => {
    // Create a deep copy to avoid direct mutation of the prop
    setEditableState(JSON.parse(JSON.stringify(selectedState)));
  }, [selectedState]);

  const handleSave = () => {
    if (editableState) {
      onSave(editableState);
      onClose(); // Close the dialog after saving
    }
  };

  // Handler for the properties tab
  const handlePropertyChange = (key: keyof WorkflowState, value: any) => {
    setEditableState((prevState) => {
      if (!prevState) return null;
      return { ...prevState, [key]: value };
    });
  };

  // If the state hasn't been initialized yet, don't render
  if (!editableState) return null;

  return (
    <Dialog onDismiss={onClose}>
      <Heading>Edit State: {editableState.title}</Heading>
      <Content>
        <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab}>
          <TabList>
            <Item key="properties">Properties</Item>
            <Item key="transitions">Transitions</Item>
            <Item key="permission">Permission Roles</Item>
            <Item key="group">Group Roles</Item>
          </TabList>

          <TabPanels>
            <Item key="properties">
              <PropertiesTab
                title={editableState.title || ''}
                description={editableState.description || ''}
                isInitialState={!!editableState.isInitial}
                onChangeTitle={(value) => handlePropertyChange('title', value)}
                onChangeDescription={(value) =>
                  handlePropertyChange('description', value)
                }
                onToggleInitial={() =>
                  handlePropertyChange('isInitial', !editableState.isInitial)
                }
              />
            </Item>
            <Item key="transitions">
              {/* Wire up this tab next using the same pattern */}
              <TransitionsTab
                availableTransitions={[]}
                selectedTransitions={editableState.transitions || []}
                onToggleTransition={(transitionId) => {
                  // Implement logic to add/remove from editableState.transitions
                  console.log('Toggling transition:', transitionId);
                }}
                onAddTransitionClick={() => {
                  console.log('Add new transition clicked');
                }}
              />
            </Item>
            <Item key="permission">
              {/* Wire up this tab next */}
              <PermissionRolesTab
                managedPermissions={[]}
                availableRoles={[]}
                permissions={undefined}
                onTogglePermissionAcquire={function (permName: string): void {
                  throw new Error('Function not implemented.');
                }}
                onToggleRolePermission={function (
                  permName: string,
                  role: string,
                ): void {
                  throw new Error('Function not implemented.');
                }}
              />
            </Item>
            <Item key="group">
              {/* Wire up this tab next */}
              <GroupRolesTab
                availableRoles={[]}
                groups={[]}
                groupRoles={undefined}
                onToggleGroupRole={function (
                  groupId: string,
                  role: string,
                ): void {
                  throw new Error('Function not implemented.');
                }}
              />
            </Item>
          </TabPanels>
        </Tabs>
      </Content>

      <ButtonGroup>
        <Button variant="secondary" onPress={onClose}>
          Cancel
        </Button>
        <Button variant="accent" onPress={handleSave}>
          Save
        </Button>
      </ButtonGroup>
    </Dialog>
  );
};

export default StateEditDialog;
