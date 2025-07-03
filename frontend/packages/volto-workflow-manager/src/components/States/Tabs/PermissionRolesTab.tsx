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
  Flex,
} from '@adobe/react-spectrum';

interface PermissionInfo {
  name: string;
  perm: string;
  description: string;
}

interface StatePermissionMatrix {
  [permName: string]: {
    acquired: boolean;
    roles: string[];
  };
}

interface PermissionRolesTabProps {
  managedPermissions: PermissionInfo[];
  availableRoles: string[];
  permissions: StatePermissionMatrix;
  onTogglePermissionAcquire: (permName: string) => void;
  onToggleRolePermission: (permName: string, role: string) => void;
}

const PermissionRolesTab: React.FC<PermissionRolesTabProps> = ({
  managedPermissions,
  availableRoles,
  permissions,
  onTogglePermissionAcquire,
  onToggleRolePermission,
}) => {
  return (
    <View>
      <Heading level={3}>Permission Roles</Heading>
      <Text color="gray-500" marginBottom="size-200">
        Permissions these roles have in this state.
      </Text>

      <TableView aria-label="Permission Role Matrix" density="compact">
        <TableHeader>
          <Column key="role" allowsResizing>
            Role
          </Column>
          {managedPermissions.map((perm) => (
            <Column key={perm.name} allowsResizing>
              {perm.name}
            </Column>
          ))}
        </TableHeader>

        <TableBody>
          {/* Acquired row */}
          <Row key="acquired">
            <Cell>Acquired</Cell>
            {managedPermissions.map((perm) => (
              <Cell key={perm.name}>
                <Checkbox
                  isSelected={permissions[perm.name]?.acquired || false}
                  onChange={() => onTogglePermissionAcquire(perm.name)}
                  aria-label={`Acquire ${perm.name}`}
                />
              </Cell>
            ))}
          </Row>

          {/* Role rows */}
          {availableRoles.map((role) => (
            <Row key={role}>
              <Cell>{role}</Cell>
              {managedPermissions.map((perm) => (
                <Cell key={`${role}-${perm.name}`}>
                  <Checkbox
                    isSelected={permissions[perm.name]?.roles.includes(role)}
                    onChange={() => onToggleRolePermission(perm.name, role)}
                    aria-label={`${role} can ${perm.name}`}
                  />
                </Cell>
              ))}
            </Row>
          ))}
        </TableBody>
      </TableView>
    </View>
  );
};

export default PermissionRolesTab;
