import { useCallback, useState, useRef, useMemo, useContext } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    BackgroundVariant,
    ReactFlowProvider,
    ReactFlowInstance,
    Node,
    XYPosition,
} from 'reactflow';
import AsyncCreatableSelect from 'react-select/async-creatable';
import 'reactflow/dist/style.css';
import MediaDisplay, { MediaData } from './MediaDisplay';
import { v4 as uuidv4 } from 'uuid';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

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
    const { token, status: authStatus, tableId } = useContext(AuthContext)
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

    function addNode(position: XYPosition, type: string, data: MediaData) {

        const newNode: Node<MediaData> = {
            id: uuidv4(),
            type,
            position,
            data,
        };

        setNodes((nds) => nds.concat(newNode));
    }

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
                const dt = event.dataTransfer;
                    // Check if the drag includes files
                if (dt.types.includes('Files')) {
                    const file = dt.files[0];
                    // console.log(dt)
                    const evtData = dt.getData('text/uri-list')
                    // console.log(evtData)

                    if (evtData !== "") {
                        chrome.runtime.sendMessage({
                            action: "getContentType",
                            url: evtData
                        })
                            .then((data) => {
                                console.log("content type")
                                console.log(data)
                                const mediaData: MediaData = { 
                                    contentType: data.contentType,
                                    content: evtData
                                 }
                                addNode(position, type, mediaData)
                            })
                            .catch(console.error)
                    }

                } else if (dt.types.includes('text/plain')) {
                    // console.log(dt)
                    const evtData = dt.getData('text/plain')

                    if (evtData.startsWith('http://') || evtData.startsWith('https://')) {
                        console.log('Dragging a well-formed URL.');
                        if (evtData !== "") {
                            chrome.runtime.sendMessage({
                                action: "getContentType",
                                url: evtData
                            })
                                .then((data) => {
                                    console.log("content type")
                                    console.log(data)
                                    const mediaData: MediaData = { 
                                        contentType: data.contentType,
                                        content: evtData
                                     }
                                    addNode(position, type, mediaData)
                                })
                                .catch(console.error)
                        }
                    } else {
                        console.log('Dragging generic text.');
                        const mediaData: MediaData = { 
                            contentType: 'text/plain',
                            content: evtData
                         }
                        addNode(position, type, mediaData)
                    }


                }
            }

        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [reactFlowInstance],
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function handleSave(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
        try {
            //TODO handle not logged in & errors
            if (reactFlowInstance && authStatus) {
                const resp = await axios({
                    method: "POST",
                    url: `https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true`,
                    headers: {
                      Authorization: `Token ${token}`,
                      "Content-Type": "application/json"
                    },
                    data: {
                      "data": JSON.stringify(reactFlowInstance.toObject())
                    }
                  })
                  console.log("save status")
                  console.log(resp.data)
            }

        } catch (error) {
            console.error(error)
        }

    }

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
            <button className="btn btn-primary btn-block mt-4" onClick={handleSave}>Save</button>
        </>
    )
}

export default InspoBoard