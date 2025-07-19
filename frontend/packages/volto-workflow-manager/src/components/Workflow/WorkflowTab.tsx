import React from 'react';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTitle,
  View,
} from '@adobe/react-spectrum';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';

interface WorkflowTabProps {
  schema: any;
  formData: { [key: string]: any };
  onChangeBlock: (id: string, data: any) => void;
  workflowId: string;
}

const WorkflowTab: React.FC<WorkflowTabProps> = ({
  schema,
  formData,
  onChangeBlock,
  workflowId,
}) => {
  return (
    <View padding="size-200">
      <Accordion defaultExpandedKeys={['default']}>
        <Disclosure id="default">
          <DisclosureTitle>Default</DisclosureTitle>
          <DisclosurePanel>
            <BlockDataForm
              key={workflowId}
              schema={schema}
              formData={formData}
              onChangeBlock={onChangeBlock}
              block={workflowId}
            />
          </DisclosurePanel>
        </Disclosure>
      </Accordion>
    </View>
  );
};

export default WorkflowTab;
