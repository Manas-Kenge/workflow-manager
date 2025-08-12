import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  type Edge,
  type FitViewOptions,
  type OnReconnect,
  type DefaultEdgeOptions,
  type Connection,
} from '@xyflow/react';
import CustomEdge from './Edges/CustomEdge';
import CustomNode from './Nodes/CustomNode';
import type { Workflow, EdgeData } from '../../types/graph';
import '@xyflow/react/dist/style.css';
import CreateTransition from '../Transitions/CreateTransition';

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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isCreateTransitionOpen, setCreateTransitionOpen] = useState(false);
  const [newTransitionInfo, setNewTransitionInfo] = useState<{
    source: string;
    target: string;
  } | null>(null);

  useEffect(() => {
    if (!workflow) return;

    const nodeCount = workflow.states.length;
    const radius = Math.max(200, nodeCount * 40);
    const newNodes = workflow.states.map((state, idx) => {
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

    const newEdges: Edge<EdgeData>[] = [];
    const transitionsMap = new Map(
      (workflow.transitions || []).map((t) => [t.id, t]),
    );
    workflow.states.forEach((state) => {
      (state.transitions || []).forEach((transitionId) => {
        const transition = transitionsMap.get(transitionId);
        if (!transition) return;

        newEdges.push({
          id: `${state.id}-${transitionId}-${transition.new_state_id}`,
          source: state.id,
          target: transition.new_state_id,
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

    setNodes(newNodes);
    setEdges(newEdges);
  }, [workflow, setNodes, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    setNewTransitionInfo({
      source: connection.source,
      target: connection.target,
    });
    setCreateTransitionOpen(true);
  }, []);

  const handleCloseCreateDialog = () => {
    setCreateTransitionOpen(false);
    setNewTransitionInfo(null);
  };

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newConnection) => {
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges],
  );

  return (
    <>
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
      <CreateTransition
        workflowId={workflow.id}
        isOpen={isCreateTransitionOpen}
        onClose={handleCloseCreateDialog}
        initialSourceStateId={newTransitionInfo?.source}
        initialDestinationStateId={newTransitionInfo?.target}
      />
    </>
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
