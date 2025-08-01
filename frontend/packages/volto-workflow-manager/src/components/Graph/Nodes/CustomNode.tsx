import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import './index.css';
import type { NodeData } from '../../../types/graph';

interface CustomNodeProps extends NodeProps {
  data: NodeData;
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
