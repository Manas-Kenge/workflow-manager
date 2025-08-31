import React from 'react';
import {
  View,
  Heading,
  Text,
  Flex,
  ListView,
  Item,
} from '@adobe/react-spectrum';
import type { GuardsTabProps } from '../../../types/transition';

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
