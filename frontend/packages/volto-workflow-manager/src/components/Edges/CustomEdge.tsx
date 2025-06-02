import React from 'react';
import { X } from 'lucide-react';
import {
  BezierEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { Button } from 'react-aria-components';

export default function CustomEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;

  const { setEdges } = useReactFlow();

  const [labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BezierEdge {...props} />
      <EdgeLabelRenderer>
        <Button
          className="nodrag nopan"
          onPress={onEdgeClick}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            background: 'transparent',
            border: 'none',
            color: 'red',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            pointerEvents: 'all',
          }}
          aria-label="Delete Edge"
        >
          <X size={16} />
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}
