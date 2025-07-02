import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type DefaultEdgeOptions,
} from '@xyflow/react';
import CustomEdge from '../Edges/CustomEdge';
import CustomNode from '../Nodes/CustomNode';
import type { WorkflowStateNodeData } from '../Nodes/CustomNode';
import type { WorkflowTransitionEdgeData } from '../Edges/CustomEdge';
import '@xyflow/react/dist/style.css';

const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: false,
  type: 'custom',
};

const edgeTypes = { custom: CustomEdge };
const nodeTypes = { custom: CustomNode };

interface WorkflowState {
  id: string;
  title: string;
  transitions: string[];
}
interface WorkflowTransition {
  id: string;
  title: string;
  new_state: string;
}
interface Workflow {
  id: string;
  title: string;
  description: string;
  initial_state: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

interface WorkflowGraphProps {
  workflow: Workflow;
  highlightedState?: string | null;
  highlightedTransition?: string | null;
}

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  workflow,
  highlightedState,
  highlightedTransition,
}) => {
  const [nodes, setNodes] = useState<Node<WorkflowStateNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge<WorkflowTransitionEdgeData>[]>([]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds)),
    [],
  );

  // Generate nodes from states with better positioning
  useEffect(() => {
    if (!workflow?.states) return;

    const nodeCount = workflow.states.length;
    const radius = Math.max(200, nodeCount * 40); // Dynamic radius based on node count

    const newNodes = workflow.states.map((state, idx) => {
      const angle = (idx * 2 * Math.PI) / nodeCount;
      return {
        id: `${workflow.id}-${state.id}`,
        type: 'custom',
        data: {
          label: state.title,
          workflow: workflow.title,
          highlighted:
            state.id === highlightedState ||
            `${workflow.id}-${state.id}` === highlightedState,
          stateId: state.id,
          isInitial: state.id === workflow.initial_state,
          isFinal: !state.transitions?.length,
        },
        position: {
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
        },
        draggable: true,
      };
    });
    setNodes(newNodes);
  }, [workflow, highlightedState]);

  // Generate edges with proper source/target and labels
  const processedEdges = useMemo(() => {
    if (!workflow?.states || !workflow?.transitions) return [];

    const edgeList: Edge<WorkflowTransitionEdgeData>[] = [];

    workflow.states.forEach((state) => {
      state.transitions.forEach((transitionId) => {
        const transition = workflow.transitions.find(
          (t) => t.id === transitionId,
        );
        if (!transition || !transition.new_state) return;

        const sourceId = `${workflow.id}-${state.id}`;
        const targetId = `${workflow.id}-${transition.new_state}`;
        const edgeId = `${sourceId}-${transitionId}-${targetId}`;

        const edge: Edge<WorkflowTransitionEdgeData> = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: 'custom',
          animated: highlightedTransition === transitionId,
          data: {
            label: transition.title,
            highlighted: transitionId === highlightedTransition,
            transitionId: transitionId,
          },
          markerEnd: {
            type: 'arrowclosed',
            color:
              highlightedTransition === transitionId ? '#ff6b6b' : '#b1b1b7',
          },
        };

        edgeList.push(edge);
      });
    });

    return edgeList;
  }, [workflow, highlightedTransition]);

  // Sync processed edges into state
  useEffect(() => {
    setEdges(processedEdges);
  }, [processedEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode="loose"
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) =>
            node.data.highlighted
              ? '#ff6b6b'
              : node.selected
                ? '#0078d4'
                : '#ddd'
          }
        />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraph;
