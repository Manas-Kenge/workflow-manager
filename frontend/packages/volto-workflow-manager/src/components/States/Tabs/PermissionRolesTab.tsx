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
import { cloneDeep } from 'lodash';

export interface PermissionRolesData {
  [permissionName: string]: string[];
}

interface PermissionInfo {
  name: string;
  perm: string;
  description: string;
}

interface PermissionRolesTabProps {
  data: PermissionRolesData;
  managedPermissions: PermissionInfo[];
  availableRoles: string[];
  onChange: (newData: PermissionRolesData) => void;
  isDisabled: boolean;
}

const PermissionRolesTab: React.FC<PermissionRolesTabProps> = ({
  data,
  managedPermissions,
  availableRoles,
  onChange,
  isDisabled,
}) => {
  if (isDisabled) {
    return <Text>Select a state to configure permission roles.</Text>;
  }

  const tableRows = availableRoles.map((roleName) => ({
    id: roleName,
    name: roleName,
  }));

  const tableColumns = [
    { key: 'role', name: 'Role' },
    ...managedPermissions.map((p) => ({ key: p.perm, name: p.name })),
  ];

  const handleToggleRolePermission = (permissionName: string, role: string) => {
    const newData = cloneDeep(data);
    if (!newData[permissionName]) {
      newData[permissionName] = [];
    }
    const roles = newData[permissionName];
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
      <Heading level={3}>Permission Roles</Heading>
      <Text>Select the permissions that each role has in this state.</Text>

      <TableView
        aria-label="Permission Roles Matrix"
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
                const permissionName = columnKey as string;
                return (
                  <Cell>
                    <Checkbox
                      isSelected={
                        data[permissionName]?.includes(item.id) || false
                      }
                      onChange={() =>
                        handleToggleRolePermission(permissionName, item.id)
                      }
                      aria-label={`${item.name} has permission ${permissionName}`}
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

export default PermissionRolesTab;
