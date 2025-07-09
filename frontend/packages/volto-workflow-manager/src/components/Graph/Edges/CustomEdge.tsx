import React from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

interface WorkflowTransitionEdgeData {
  [key: string]: unknown;
  label?: string;
  highlighted?: boolean;
  transitionId?: string;
  description?: string;
  conditions?: string[];
  permissions?: string[];
  automatic?: boolean;
}

interface CustomEdgeProps extends EdgeProps {
  data?: WorkflowTransitionEdgeData;
}

const CustomEdge: React.FC<CustomEdgeProps> = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
    markerEnd,
    style,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: data?.highlighted
            ? '#ff6b6b'
            : selected
              ? '#0078d4'
              : '#b1b1b7',
          strokeWidth: data?.highlighted ? 3 : selected ? 2 : 1,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              fontWeight: 700,
              background: 'white',
              padding: '2px 6px',
              borderRadius: 3,
              border: '1px solid #ccc',
              color: data.highlighted ? '#ff6b6b' : '#333',
              pointerEvents: 'none',
            }}
            className="nodrag nopan"
            title={data.description || data.label}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
export type { WorkflowTransitionEdgeData, CustomEdgeProps };
