import { useState, useEffect, useCallback } from 'react';
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

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: false,
  type: 'custom', // Set default edge type to custom
};

const edgeTypes = {
  custom: CustomEdge,
};

const nodeTypes = {
  custom: CustomNode,
};

// Define proper types for your workflow data
interface WorkflowState {
  id: string;
  title: string;
  description?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  permissions?: string[];
  transitions?: string[];
}

interface WorkflowTransition {
  id: string;
  label?: string;
  description?: string;
  new_state: string;
  conditions?: string[];
  permissions?: string[];
  automatic?: boolean;
}

interface Workflow {
  id: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  description?: string;
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

  // Generate nodes from workflow states
  useEffect(() => {
    if (workflow?.states) {
      const newNodes: Node<WorkflowStateNodeData>[] = workflow.states.map(
        (state, index) => ({
          id: state.id,
          type: 'custom', // Use custom node type
          data: {
            label: state.title,
            description: state.description,
            highlighted: state.id === highlightedState,
            stateId: state.id,
            isInitial: state.isInitial,
            isFinal: state.isFinal,
            permissions: state.permissions,
          },
          position: {
            x:
              100 +
              Math.cos(index * ((2 * Math.PI) / workflow.states.length)) * 250,
            y:
              200 +
              Math.sin(index * ((2 * Math.PI) / workflow.states.length)) * 250,
          },
          draggable: true,
        }),
      );
      setNodes(newNodes);
    }
  }, [workflow, highlightedState]);

  // Generate edges from workflow transitions
  useEffect(() => {
    if (!workflow?.transitions || !workflow?.states) {
      setEdges([]);
      return;
    }

    const newEdges: Edge<WorkflowTransitionEdgeData>[] = [];
    // Create maps for efficient lookups
    const transitionsMap = new Map(workflow.transitions.map((t) => [t.id, t]));
    const statesMap = new Map(workflow.states.map((s) => [s.id, s]));

    // Iterate over each state to find its outgoing transitions
    workflow.states.forEach((sourceState) => {
      // Skip if the state has no transitions defined
      if (!sourceState.transitions) {
        return;
      }

      // Iterate over the transitions of the current state
      sourceState.transitions.forEach((transitionId) => {
        const transition = transitionsMap.get(transitionId);

        // Ensure the transition and its target state exist
        if (transition && transition.new_state) {
          const targetState = statesMap.get(transition.new_state);

          if (targetState) {
            newEdges.push({
              // Create a unique ID for each edge to avoid conflicts
              id: `edge-${sourceState.id}-${transition.id}`,
              source: sourceState.id,
              sourceHandle: 'right',
              target: targetState.id,
              targetHandle: 'left',
              type: 'custom',
              animated: highlightedTransition === transition.id,
              data: {
                label: transition.label || `To ${targetState.title}`,
                description: transition.description,
                highlighted: highlightedTransition === transition.id,
                transitionId: transition.id,
                conditions: transition.conditions,
                permissions: transition.permissions,
                automatic: transition.automatic,
              },
              markerEnd: {
                type: 'arrowclosed',
                color:
                  highlightedTransition === transition.id
                    ? '#ff6b6b'
                    : '#b1b1b7',
              },
            });
          }
        }
      });
    });

    setEdges(newEdges);
  }, [workflow, highlightedTransition]);

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
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.highlighted) return '#ff6b6b';
            if (node.selected) return '#0078d4';
            return '#ddd';
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraph;
