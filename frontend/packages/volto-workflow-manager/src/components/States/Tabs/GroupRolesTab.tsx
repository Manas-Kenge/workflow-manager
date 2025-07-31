import React from 'react';
import {
  View,
  Heading,
  Text,
  TableView,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Checkbox,
} from '@adobe/react-spectrum';
import type { GroupRolesTabProps } from '../../../types/state';
import { cloneDeep } from 'lodash';

const GroupRolesTab: React.FC<GroupRolesTabProps> = ({
  data,
  groups,
  availableRoles,
  onChange,
  isDisabled,
}) => {
  if (isDisabled) {
    return <Text>Select a state to configure group roles.</Text>;
  }

  const tableRows = availableRoles.map((roleName) => ({
    id: roleName,
    name: roleName,
  }));

  const tableColumns = [
    { key: 'role', name: 'Role' },
    ...groups.map((g) => ({ key: g.id, name: g.title })),
  ];

  const handleToggleGroupRole = (groupId: string, role: string) => {
    const newData = cloneDeep(data);
    if (!newData[groupId]) {
      newData[groupId] = [];
    }

    const roles = newData[groupId];
    const roleIndex = roles.indexOf(role);

    if (roleIndex > -1) {
      roles.splice(roleIndex, 1);
    } else {
      roles.push(role);
    }
    onChange(newData);
  };

  return (
    <View>
      <Heading level={3}>Group Roles</Heading>
      <Text>
        Select the local roles that are assigned to each group in this state.
      </Text>

      <TableView
        aria-label="Group Roles Matrix"
        density="compact"
        marginTop="size-200"
        flex
      >
        <TableHeader columns={tableColumns}>
          {(column) => <Column key={column.key}>{column.name}</Column>}
        </TableHeader>

        <TableBody items={tableRows}>
          {(item) => (
            <Row key={item.id}>
              {(columnKey) => {
                if (columnKey === 'role') {
                  return <Cell>{item.name}</Cell>;
                }
                const groupId = columnKey as string;
                return (
                  <Cell>
                    <Checkbox
                      isSelected={data[groupId]?.includes(item.id) || false}
                      onChange={() => handleToggleGroupRole(groupId, item.id)}
                      aria-label={`${groupId} has role ${item.name}`}
                      isDisabled={isDisabled}
                    />
                  </Cell>
                );
              }}
            </Row>
          )}
        </TableBody>
      </TableView>
    </View>
  );
};

export default GroupRolesTab;
