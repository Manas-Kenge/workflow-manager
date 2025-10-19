import React, { useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useStore,
} from '@xyflow/react';
import type { EdgeProps, ReactFlowState } from '@xyflow/react';
import type { EdgeData } from '../../../types/graph';

interface CustomEdgeProps extends EdgeProps {
  data?: EdgeData;
  pathOptions?: {
    borderRadius?: number;
  };
}

type SpecialPathParams = Pick<
  EdgeProps,
  'sourceX' | 'sourceY' | 'targetX' | 'targetY'
>;

const getBidirectionalOffset = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: SpecialPathParams) => {
  const horizontalDistance = Math.abs(sourceX - targetX);
  const verticalDistance = Math.abs(sourceY - targetY);
  const distance = Math.hypot(horizontalDistance, verticalDistance);
  const baseOffset = Math.min(Math.max(distance * 0.25, 30), 100);

  if (horizontalDistance >= verticalDistance) {
    return sourceX <= targetX ? baseOffset : -baseOffset;
  }

  return sourceY <= targetY ? -baseOffset : baseOffset;
};

const getBidirectionalControlPoint = (
  { sourceX, sourceY, targetX, targetY }: SpecialPathParams,
  offset: number,
) => {
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;
  const horizontalDistance = Math.abs(sourceX - targetX);
  const verticalDistance = Math.abs(sourceY - targetY);

  if (horizontalDistance >= verticalDistance) {
    return { x: centerX, y: centerY + offset };
  }

  return { x: centerX + offset, y: centerY };
};

const getSpecialPath = (
  { sourceX, sourceY, targetX, targetY }: SpecialPathParams,
  offset: number,
) => {
  const controlPoint = getBidirectionalControlPoint(
    { sourceX, sourceY, targetX, targetY },
    offset,
  );

  return `M ${sourceX} ${sourceY} Q ${controlPoint.x} ${controlPoint.y} ${targetX} ${targetY}`;
};

const getBidirectionalLabelPosition = (
  { sourceX, sourceY, targetX, targetY }: SpecialPathParams,
  offset: number,
) => {
  const controlPoint = getBidirectionalControlPoint(
    { sourceX, sourceY, targetX, targetY },
    offset,
  );
  const t = 0.5;
  const oneMinusT = 1 - t;

  const x =
    oneMinusT * oneMinusT * sourceX +
    2 * oneMinusT * t * controlPoint.x +
    t * t * targetX;
  const y =
    oneMinusT * oneMinusT * sourceY +
    2 * oneMinusT * t * controlPoint.y +
    t * t * targetY;

  return { x, y };
};

const CustomEdge: React.FC<CustomEdgeProps> = (props) => {
  const {
    id,
    source,
    target,
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

  const { isBidirectional, shouldCurve } = useStore((state: ReactFlowState) => {
    const partner = state.edges.find(
      (edge) =>
        edge.id !== id && edge.source === target && edge.target === source,
    );

    if (!partner) {
      return { isBidirectional: false, shouldCurve: false };
    }

    const shouldCurve = id.localeCompare(partner.id) > 0;

    return { isBidirectional: true, shouldCurve };
  });

  const [defaultPath, defaultLabelX, defaultLabelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: pathOptions?.borderRadius ?? 10,
  });

  let edgePath = defaultPath;
  let labelX = defaultLabelX;
  let labelY = defaultLabelY;

  if (shouldCurve) {
    const offset = getBidirectionalOffset({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
    edgePath = getSpecialPath({ sourceX, sourceY, targetX, targetY }, offset);
    const labelPosition = getBidirectionalLabelPosition(
      { sourceX, sourceY, targetX, targetY },
      offset,
    );
    labelX = labelPosition.x;
    labelY = labelPosition.y;
  } else if (isBidirectional) {
    // keep default smooth step path for the partner edge
  }

  const truncatedLabel = useMemo(() => {
    if (!data?.label) return '';
    const words = data.label.split(' ');
    if (words.length > 2) {
      return `${words.slice(0, 2).join(' ')}...`;
    }
    return data.label;
  }, [data?.label]);

  const labelStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
      fontSize: 10,
      fontWeight: 600,
      padding: '5px 10px',
      borderRadius: 12,
      pointerEvents: 'all',
      maxWidth: '140px',
      textAlign: 'center',
      boxShadow: '0 1px 2px rgba(30, 58, 138, 0.18)',
      transition:
        'background-color 140ms ease, border-color 140ms ease, color 140ms ease, box-shadow 140ms ease',
    };

    if (selected) {
      return {
        ...baseStyle,
        background: '#dbe6ff',
        border: '1px solid #3b6ef5',
        color: '#102349',
        boxShadow: '0 3px 8px rgba(59, 110, 245, 0.28)',
      };
    }

    return {
      ...baseStyle,
      background: '#f5f8ff',
      border: '1px solid #c4d4ff',
      color: '#1e3a8a',
    };
  }, [labelX, labelY, selected]);

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
            style={labelStyle}
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
