/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState, useRef, useMemo, useContext, useEffect } from 'react';
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
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// import CreateBoardModal from './CreateBoardModal';
import { ActionMeta, SingleValue } from 'react-select';
import AuthContext from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
const initialNodes: Node[] = [];
const BASE_URL_DEV = "https://basedrop.space"

interface Option {
    readonly label: string;
    readonly value: string;
  }
function InspoBoard() {

    const { blockData } = useContext(AuthContext)
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
    const [userBoards, setUserBoards] = useState<Option[]>([])
    const nodeTypes = useMemo(() => ({ mediaDisplay: MediaDisplay }), []);
    const [value, setValue] = useState<Option | null>();
    const [boardId, setBoardId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event: any) => {
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
        (event: any) => {
            event.preventDefault();
            
            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
            // and you don't need to subtract the reactFlowBounds.left/top anymore
            // details: https://reactflow.dev/whats-new/2023-11-10
            
               console.log("dropped")
                if (reactFlowInstance && boardId) {
                    console.log("adding node")
                    const position = reactFlowInstance.screenToFlowPosition({
                        x: event.clientX,
                        y: event.clientY,
                    });
                    const dt = event.dataTransfer;
                        // Check if the drag includes files
                    if (dt.types.includes('Files')) {
                        // console.log(dt)
                        const evtData = dt.getData('text/uri-list')
                        // console.log(evtData)
    
                        if (evtData !== "") {
                            return chrome.runtime.sendMessage({
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
                                return chrome.runtime.sendMessage({
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
        [reactFlowInstance, boardId],
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function handleSave(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
        try {
            //TODO handle not logged in & errors
            //TODO handle updating row with new data
            setIsSaving(true)
            const isAuth = await authCheck()
            if (reactFlowInstance && isAuth) {
                const { edges: edgesData, nodes: nodesData, viewport } = reactFlowInstance.toObject()
                const updatedNodesData = structuredClone(nodesData);
                for (const bd of blockData) {
                    const nodeIdx = nodesData.findIndex((node) => node.id === bd.nodeId)
                    if (nodeIdx !== -1) {
                        updatedNodesData[nodeIdx].data.note = bd.document
                        console.log("updated note for: ", updatedNodesData[nodeIdx].id)
                        console.log(updatedNodesData[nodeIdx].data.note)
                    }
                }
                console.log("updated nodes data")
                console.log(updatedNodesData)
                axios.post(`${BASE_URL_DEV}/api/save-board`, {
                    boardId,
                    data: JSON.stringify({
                        edges: edgesData,
                        nodes: updatedNodesData,
                        viewport
                    })
                })
                //todo react hot toast alert
                toast.success("Board saved!")
            }
            if (!isAuth) {
                toast((t) => (
                    <span>
                      <button className="btn btn-primary" onClick={() => {
                        toast.dismiss(t.id);
                        chrome.tabs.create({ url: BASE_URL_DEV });
                      }}>
                        Click to login!
                      </button>
                    </span>
                  ), {
                    position: "bottom-center"
                  });
            }

        } catch (error) {
            console.error(error)
            toast.error("I'm sorry, try again later")
        } finally {
            setIsSaving(false)
        }

    }

    // Fetch initial board list
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const options = await getBoards(); // this returns an array of options
                setUserBoards(options);
            } catch (error) {
                console.error('Failed to fetch boards:', error);
            }
        };

        fetchBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array means this effect runs once on mount
    
    const loadOptions = useCallback(() => {
        // If there's a case where options need to be fetched asynchronously on demand,
        // you can return a promise here. Otherwise, just return the current state:
        return Promise.resolve(userBoards);
    }, [userBoards]); // Depend on userBoards so it uses the latest state

    async function authCheck(): Promise<boolean | null> {
        const resp = await chrome.runtime.sendMessage({
            action: "authCheck"
        })
        if (resp) {
            return true
        } else {
            return null
        }
    }
    
    async function getBoards(): Promise<any[]> {
        const isAuth = await authCheck()
        if (isAuth) {
            const resp = await axios.get(`${BASE_URL_DEV}/api/list-boards`)
            console.log("boards")
            console.log(resp.data)
            const options = resp.data.boardList.map((data: any) => {
                return {
                    value: data.boardId,
                    label: data.boardName
                }
            })
            return options
        } else {
            return []
        }
    }

    async function handleBoardCreate(inputValue: string): Promise<void> {
        const isAuth = await authCheck()
        if (isAuth) {
            //todo save current board then clear it 
            if (reactFlowInstance && boardId) {
                axios.post(`${BASE_URL_DEV}/api/save-board`, {
                    boardId,
                    data: JSON.stringify(reactFlowInstance.toObject())
                })
                setNodes([]);
                setEdges([]);
            }

            //TODO create new board here
            const resp = await axios.post(`${BASE_URL_DEV}/api/create-board`, {
                boardName: `${inputValue.slice(0, 50).trim()}`,
                boardDesc: ""
            })
            setBoardId(resp.data.boardId)
            setUserBoards((prev) => [...prev, { value: resp.data.boardId, label: resp.data.boardName }])
            setValue({ value: resp.data.boardId, label: resp.data.boardName })
            toast.success("Board created!")
            
        }
        if (!isAuth) {
            toast((t) => (
                <span>
                  <button className="btn btn-primary" onClick={() => {
                    toast.dismiss(t.id);
                    chrome.tabs.create({ url: BASE_URL_DEV });
                  }}>
                    Click to login!
                  </button>
                </span>
              ));
        }
    }

    async function handleSelectChange(newValue: SingleValue<Option>, actionMeta: ActionMeta<Option>): Promise<void> {
        setValue(newValue)
        console.log("new value")
        console.log(newValue)
        //todo get board data
        const isAuth = await authCheck()
        if (reactFlowInstance && isAuth && actionMeta.action =="select-option" && newValue?.value) {
            const resp = await axios.post(`${BASE_URL_DEV}/api/get-board`, {
                boardId: newValue.value
            })
            console.log("setting board id")
            console.log(newValue.value)
            setBoardId(newValue.value)
            if (resp.data.boardData && resp.data.boardData !== "") {
                const flow = JSON.parse(resp.data.boardData)
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);
            }
            // todo try catch handle error react toast alert
        }
        if (!isAuth) {
            toast((t) => (
                <span>
                  <button className="btn btn-primary" onClick={() => {
                    toast.dismiss(t.id);
                    chrome.tabs.create({ url: BASE_URL_DEV });
                  }}>
                    Click to login!
                  </button>
                </span>
              ));
        }
    }

    return (
        <div className="flex flex-col justify-center items-center space-y-4">
            <Toaster/>
        {/* 
        //TODO create board name/desc component
        //TODO create board name/desc input component
        //TODO create add board button 
        // TODO edit btn to the side and when clicked, opens modal with edit form
        */}
            {/* <BoardDetails /> */}
            {/* 
            // TODO for board selector, handle pagination 
            // TODO handle auth status
            */}
            <div className="flex flex-col justify-center items-center w-full max-w-sm space-y-2">
                <AsyncCreatableSelect 
                className="w-full" 
                cacheOptions 
                defaultOptions={true}
                onCreateOption={handleBoardCreate}
                loadOptions={loadOptions}
                onChange={handleSelectChange}
                value={value}/>
                {/* <button onClick={handleCreateBoard} className="btn btn-block">New Board</button> */}
            </div>
            {/* <CreateBoardModal /> */}
            <ReactFlowProvider>
                <div className="w-[80vw] h-[70vh]" ref={reactFlowWrapper}>
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
            <button disabled={isSaving} className="btn btn-primary btn-block mt-4" onClick={handleSave}>Save</button>
        </div>
    )
}

export default InspoBoard