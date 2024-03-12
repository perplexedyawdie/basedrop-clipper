import { useCallback, useState, useRef, useMemo } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    BackgroundVariant,
    applyEdgeChanges,
    applyNodeChanges,
    NodeChange,
    EdgeChange,
    ReactFlowProvider,
    ReactFlowInstance,
    Node,
} from 'reactflow';

import 'reactflow/dist/style.css';
import MediaDisplay from './MediaDisplay';

const initialNodes: Node[] = [];

const initialEdges = [];

// const initialNodes = [
//     { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
//     { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
// ];

// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
let id = 0;
const getId = () => `dndnode_${id++}`;
function InspoBoard() {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
    const nodeTypes = useMemo(() => ({ mediaDisplay: MediaDisplay }), []);

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            
            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
            // and you don't need to subtract the reactFlowBounds.left/top anymore
            // details: https://reactflow.dev/whats-new/2023-11-10
            if (reactFlowInstance) {
                const position = reactFlowInstance.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });
                const newNode = {
                    id: getId(),
                    type,
                    position,
                    data: { label: `${type} node` },
                };

                setNodes((nds) => nds.concat(newNode));
            }

        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [reactFlowInstance],
    );
    return (
        <>
            <ReactFlowProvider>
                <div className="w-[80vw] h-[80vh]" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={(rfInst) => setReactFlowInstance(rfInst)}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                        nodeTypes={nodeTypes}
                    >
                        <Background
                    variant={BackgroundVariant.Cross}
                    />
                        <Controls />
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
        </>
    )
}

export default InspoBoard