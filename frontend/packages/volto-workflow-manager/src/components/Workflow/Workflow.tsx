import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowInstance,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useData, useUpdateData } from '../api';
// import useHistory from '../../hooks/useHistory';
import CustomEdge from '../Edges/CustomEdge';
// import CustomNode from '../Nodes/CustomNode';
import '@xyflow/react/dist/style.css';

const edgeTypes = {
  custom: CustomEdge,
};

// const nodeTypes = {
//   custom: CustomNode,
// };

export const Workflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  //   const { addNode, removeNode, addEdge, removeEdge, undo, redo } = useHistory();

  //   const onConnect = useCallback(
  //     (connection: Connection) => {
  //       const edge = {
  //         ...connection,
  //         id: generateId(),
  //         type: 'custom',
  //         markerEnd: {
  //           type: MarkerType.ArrowClosed,
  //           width: 20,
  //           height: 20,
  //           color: '#333',
  //         },
  //       };
  //       addEdge(edge);
  //     },
  //     [addEdge],
  //   );

  const isValidConnection = (connection: Edge | Connection) => {
    const { source, target } = connection;
    if (source === target) return false;
    return true;
  };

  const { screenToFlowPosition, setViewport } = useReactFlow();

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Create a custom node
    // const node: Node = {
    //   id: generateId(),
    //   type: 'custom',
    //   position,
    //   data: { label: 'New Node' },
    // };

    // addNode(node);
  };

  const [selectedNode, setSelectedNode] = useState<Node | undefined>();

  const onNodeClick = (event: React.MouseEvent<Element>, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(undefined);
  };

  const edgeReconnectSuccessful = useRef(false);

  const onReconnectStart = () => {
    edgeReconnectSuccessful.current = false;
  };

  const onReconnect = (oldEdge: Edge, newConnection: Connection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((prevEdges) => reconnectEdge(oldEdge, newConnection, prevEdges));
  };

  //   const onReconnectEnd = (_: MouseEvent | TouchEvent, edge: Edge) => {
  //     if (!edgeReconnectSuccessful.current) {
  //       removeEdge(edge);
  //     }
  //   };

  // Key bindings for delete, undo, redo
  //   useEffect(() => {
  //     const handleKeyDown = (event: KeyboardEvent) => {
  //       if (event.key === 'Delete' && selectedNode) {
  //         removeNode(selectedNode);
  //         setSelectedNode(undefined);
  //       }
  //       if (event.ctrlKey || event.metaKey) {
  //         if (event.key === 'z' && !event.shiftKey) {
  //           event.preventDefault();
  //           undo();
  //         }
  //         if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
  //           event.preventDefault();
  //           redo();
  //         }
  //       }
  //     };

  //     document.addEventListener('keydown', handleKeyDown);
  //     return () => document.removeEventListener('keydown', handleKeyDown);
  //   }, [selectedNode, removeNode, undo, redo]);

  const { mutateAsync: saveFlow } = useUpdateData();
  const { data: reactFlowState } = useData();

  useEffect(() => {
    if (reactFlowState) {
      const { x = 0, y = 0, zoom = 1 } = reactFlowState.viewport;
      setNodes(reactFlowState.nodes || []);
      setEdges(reactFlowState.edges || []);
      setViewport({ x, y, zoom });
    }
  }, [reactFlowState, setNodes, setEdges, setViewport]);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    Node,
    Edge
  > | null>(null);

  const onSave = () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      saveFlow(flow);
    }
  };

  // Add a button to manually add nodes
  //   const addNewNode = () => {
  //     const node: Node = {
  //       id: generateId(),
  //       type: 'custom',
  //       position: { x: Math.random() * 500, y: Math.random() * 500 },
  //       data: { label: 'New Node' },
  //     };
  //     addNode(node);
  //   };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        border: '1px solid black',
        position: 'relative',
      }}
    >
      <ReactFlow
        // onInit={setRfInstance}
        nodes={nodes}
        edges={edges}
        // nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onReconnectStart={onReconnectStart}
        onReconnect={onReconnect}
        // onReconnectEnd={onReconnectEnd}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={10}
          color="#f1f1f1"
          id="1"
        />
        <Background
          variant={BackgroundVariant.Lines}
          gap={100}
          color="#ccc"
          id="2"
        />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
