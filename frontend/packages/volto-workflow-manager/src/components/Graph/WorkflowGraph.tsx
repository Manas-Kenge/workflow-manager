import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnReconnect,
  type DefaultEdgeOptions,
  type Connection,
} from '@xyflow/react';
import CustomEdge from './Edges/CustomEdge';
import CustomNode from './Nodes/CustomNode';
import type { Workflow, EdgeData } from '../../types/graph';
import '@xyflow/react/dist/style.css';

const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: false,
  type: 'custom',
};
const edgeTypes = { custom: CustomEdge };
const nodeTypes = { custom: CustomNode };

interface WorkflowGraphProps {
  workflow: Workflow;
}

const WorkflowGraphInner: React.FC<WorkflowGraphProps> = ({ workflow }) => {
  const initialNodes = useMemo<Node[]>(() => {
    if (!workflow?.states) return [];

    const nodeCount = workflow.states.length;
    const radius = Math.max(200, nodeCount * 40);

    return workflow.states.map((state, idx) => {
      const angle = (idx * 2 * Math.PI) / nodeCount;
      return {
        id: state.id,
        type: 'custom',
        data: {
          label: state.title,
          stateId: state.id,
          isInitial: state.id === workflow.initial_state,
          isFinal: !state.transitions?.length,
        },
        position: {
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
        },
      };
    });
  }, [workflow]);

  const initialEdges = useMemo<Edge<EdgeData>[]>(() => {
    if (!workflow?.states || !workflow?.transitions) return [];

    const edges: Edge<EdgeData>[] = [];
    const transitionsMap = new Map(workflow.transitions.map((t) => [t.id, t]));

    workflow.states.forEach((state) => {
      state.transitions.forEach((transitionId) => {
        const transition = transitionsMap.get(transitionId);
        if (!transition) return;

        const sourceId = state.id;
        const targetId = transition.new_state_id;

        edges.push({
          id: `${sourceId}-${transitionId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'custom',
          data: {
            label: transition.title,
            transitionId: transition.id,
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#b1b1b7',
          },
        });
      });
    });

    return edges;
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds));
    },
    [setEdges],
  );

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newConnection) => {
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode="strict"
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={(node) => (node.selected ? '#0078d4' : '#ddd')} />
      </ReactFlow>
    </div>
  );
};

const WorkflowGraph: React.FC<WorkflowGraphProps> = (props) => {
  if (!props.workflow) {
    return <div>Loading workflow...</div>;
  }
  return (
    <ReactFlowProvider>
      <WorkflowGraphInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowGraph;
