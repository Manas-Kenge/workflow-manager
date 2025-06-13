import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import './index.css';

// Define the shape of data that your workflow state nodes will have
interface WorkflowStateNodeData {
  [key: string]: unknown; // Index signature to satisfy Record<string, unknown>
  label: string;
  highlighted?: boolean;
  stateId?: string;
  // Add other properties your workflow states might have
  description?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  permissions?: string[];
  // You can extend this based on your actual workflow state structure
}

// Type the NodeProps to specify what data structure you expect
interface CustomNodeProps extends NodeProps {
  data: WorkflowStateNodeData;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, id, selected }) => {
  return (
    <div
      className={`custom-node ${data.highlighted ? 'pulse-border' : ''} ${selected ? 'selected' : ''}`}
      data-node-id={id}
      title={data.description || data.label} // Tooltip on hover
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: '#555' }}
      />
      <div className="node-content">
        <strong>{data.label}</strong>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
        {data.isInitial && <div className="node-badge initial">Initial</div>}
        {data.isFinal && <div className="node-badge final">Final</div>}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default CustomNode;
export type { WorkflowStateNodeData, CustomNodeProps };
