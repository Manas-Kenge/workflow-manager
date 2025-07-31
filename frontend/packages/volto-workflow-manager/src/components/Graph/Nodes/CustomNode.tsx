import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import './index.css';

interface WorkflowStateNodeData {
  [key: string]: unknown;
  label: string;
  highlighted?: boolean;
  stateId?: string;
  description?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  permissions?: string[];
}

interface CustomNodeProps extends NodeProps {
  data: WorkflowStateNodeData;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, id, selected }) => {
  return (
    <div
      className={`custom-node ${selected ? 'selected' : ''}`}
      data-node-id={id}
      title={data.description || data.label}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        isConnectable={true}
      />

      <div className="node-content">
        <strong>{data.label}</strong>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        isConnectable={true}
      />
    </div>
  );
};

export default CustomNode;
export type { WorkflowStateNodeData, CustomNodeProps };
