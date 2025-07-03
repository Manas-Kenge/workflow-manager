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

interface GroupInfo {
  id: string;
}

interface GroupRolesMatrix {
  [groupId: string]: {
    [role: string]: boolean;
  };
}

interface GroupRolesTabProps {
  availableRoles: string[];
  groups: GroupInfo[];
  groupRoles: GroupRolesMatrix;
  onToggleGroupRole: (groupId: string, role: string) => void;
}

const GroupRolesTab: React.FC<GroupRolesTabProps> = ({
  availableRoles,
  groups,
  groupRoles,
  onToggleGroupRole,
}) => {
  return (
    <View>
      <Heading level={3}>Group Roles</Heading>
      <Text color="gray-500" marginBottom="size-200">
        The local roles that are assigned to these groups in this state.
      </Text>

      <TableView aria-label="Group Roles Matrix" density="compact">
        <TableHeader>
          <Column key="role" allowsResizing>
            Role
          </Column>
          {groups.map((group) => (
            <Column key={group.id} allowsResizing>
              {group.id}
            </Column>
          ))}
        </TableHeader>

        <TableBody>
          {availableRoles.map((role) => (
            <Row key={role}>
              <Cell>{role}</Cell>
              {groups.map((group) => (
                <Cell key={`${group.id}-${role}`}>
                  <Checkbox
                    isSelected={groupRoles[group.id]?.[role] || false}
                    onChange={() => onToggleGroupRole(group.id, role)}
                    aria-label={`${group.id} has role ${role}`}
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

export default GroupRolesTab;
