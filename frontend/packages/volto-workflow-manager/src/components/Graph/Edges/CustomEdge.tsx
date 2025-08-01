import React, { useMemo } from 'react';
import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { EdgeData } from '../../../types/graph';

interface CustomEdgeProps extends EdgeProps {
  data?: EdgeData;
  pathOptions?: {
    borderRadius?: number;
  };
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
    pathOptions,
  } = props;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: pathOptions?.borderRadius ?? 10,
  });

  const truncatedLabel = useMemo(() => {
    if (!data?.label) return '';
    const words = data.label.split(' ');
    if (words.length > 2) {
      return `${words.slice(0, 2).join(' ')}...`;
    }
    return data.label;
  }, [data?.label]);

  const edgeColor = selected ? '#0078d4' : '#b1b1b7';
  const edgeWidth = selected ? 2 : 1.5;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: edgeWidth,
          strokeDasharray: '5,5',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '4px 8px',
              borderRadius: 10,
              border: `1px solid ${edgeColor}`,
              color: '#333',
              pointerEvents: 'all',
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              maxWidth: '100px',
              textAlign: 'center',
            }}
            className="nodrag nopan"
            title={data.description || data.label}
          >
            {truncatedLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
