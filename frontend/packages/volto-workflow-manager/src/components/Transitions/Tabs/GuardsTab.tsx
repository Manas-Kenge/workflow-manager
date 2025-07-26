import React from 'react';
import {
  View,
  Heading,
  Text,
  Flex,
  ListView,
  Item,
} from '@adobe/react-spectrum';

export interface GuardsData {
  roles: string[];
  groups: string[];
  permissions: string[];
  expr: string;
}

// Contextual data shapes, passed in as props
interface GroupInfo {
  id: string;
  title: string;
}
interface PermissionInfo {
  perm: string;
  name: string;
}

interface GuardsTabProps {
  data: GuardsData;
  availableRoles: string[];
  availableGroups: GroupInfo[];
  availablePermissions: PermissionInfo[];
  onChange: (newData: GuardsData) => void;
  isDisabled: boolean;
}

const GuardsTab: React.FC<GuardsTabProps> = ({
  data,
  availableRoles,
  availableGroups,
  availablePermissions,
  onChange,
  isDisabled,
}) => {
  const roleItems = availableRoles.map((role) => ({ id: role, name: role }));

  const handleSelectionChange = (
    keys: 'all' | Set<React.Key>,
    property: 'roles' | 'groups' | 'permissions',
  ) => {
    const selectedIds = keys === 'all' ? [] : Array.from(keys).map(String);
    onChange({ ...data, [property]: selectedIds });
  };

  if (isDisabled) {
    return <Text>Select a transition to configure its guards.</Text>;
  }

  return (
    <View>
      <Heading level={3}>Guard Configuration</Heading>
      <Text>
        Guards restrict this transition to being run by only certain people or
        under certain conditions.
      </Text>

      <Flex direction="row" gap="size-300" marginTop="size-300" wrap="wrap">
        <View flex={1} minWidth="200px">
          <Heading level={4}>Roles</Heading>
          <ListView
            aria-label="Guard Roles"
            selectionMode="multiple"
            items={roleItems}
            selectedKeys={new Set(data.roles)}
            onSelectionChange={(keys) => handleSelectionChange(keys, 'roles')}
            isDisabled={isDisabled}
            height="size-2000"
          >
            {(item) => <Item key={item.id}>{item.name}</Item>}
          </ListView>
        </View>

        <View flex={1} minWidth="200px">
          <Heading level={4}>Groups</Heading>
          <ListView
            aria-label="Guard Groups"
            selectionMode="multiple"
            items={availableGroups}
            selectedKeys={new Set(data.groups)}
            onSelectionChange={(keys) => handleSelectionChange(keys, 'groups')}
            isDisabled={isDisabled}
            height="size-2000"
          >
            {(item) => <Item key={item.id}>{item.title}</Item>}
          </ListView>
        </View>

        <View flex={1} minWidth="200px">
          <Heading level={4}>Permissions</Heading>
          <ListView
            aria-label="Guard Permissions"
            selectionMode="multiple"
            items={availablePermissions}
            selectedKeys={new Set(data.permissions)}
            onSelectionChange={(keys) =>
              handleSelectionChange(keys, 'permissions')
            }
            isDisabled={isDisabled}
            height="size-2000"
          >
            {(item) => <Item key={item.perm}>{item.name}</Item>}
          </ListView>
        </View>
      </Flex>
    </View>
  );
};

export default GuardsTab;
