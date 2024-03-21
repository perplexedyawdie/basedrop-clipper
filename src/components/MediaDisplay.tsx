import { useEffect, useState, useContext } from 'react'
import { Handle, Position } from 'reactflow';
import { MetaTags } from '../utils/gmeta';
import LinkPreview from './LinkPreview';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote, lightDefaultTheme } from "@blocknote/react";
import "@blocknote/react/style.css";
import MarkdownPreview from '@uiw/react-markdown-preview';
import AuthContext from '../context/AuthContext';

interface ContentTypeSplit {
    primaryType: string;
    subType: string;
}
// Function to extract MIME types
function extractMIME(contentType: string): ContentTypeSplit {
    // Step 1: Isolate MIME type
    const mimeType = contentType.split(';')[0].trim();

    // Step 2: Split into primary and subtype
    const [primaryType, subType] = mimeType.split('/');
    console.log(`Primary Type: ${primaryType}, Subtype: ${subType}`);
    return {
        primaryType,
        subType
    }

}

export interface MediaData {
    contentType: string;
    content: string;
    note?: string;
}
//TODO save notes to node data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MediaDisplay(nodeData: any) {
    console.log("nodedata")
    console.log(nodeData)
    const { setBlockData } = useContext(AuthContext)
    const [componentToRender, setComponentToRender] = useState<JSX.Element | null>(null);
    const editor = useCreateBlockNote({
        initialContent: nodeData.data.note ? JSON.parse(nodeData.data.note) : [{
            type: "paragraph",
            content: "Add your note here :)"
        }]
    });
    useEffect(() => {
        const { primaryType, subType } = extractMIME(nodeData.data.contentType)
        switch (primaryType) {
            case 'text': {
                // console.log("parsing text")
                // console.log(primaryType)
                // Special handling for HTML content that might be a video URL playable by ReactPlayer
                //TODO: parse meta tag
                switch (subType) {
                    case "html": {
                        // console.log("parsing subtype")
                        // console.log("html")
                        chrome.runtime.sendMessage({ url: nodeData.data.content, action: "getMetaTagsFromURL" })
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .then(({ data: meta, error }: { data: MetaTags, error: any }) => {
                            if (meta && !error) {
                                // console.log("rendering html")
                                // console.log(meta)
                                setComponentToRender(<LinkPreview
                                    content={nodeData.data.content}
                                    description={meta.description}
                                    image={meta.image}
                                    title={meta.title} />)
                            } else {
                                setComponentToRender(<div>nothing to see </div>)
                            }
                        })
                        .catch((error) => {
                            console.error(error)
                            console.log("rendering html link preview error")
                        })
                    break;
                    }
                    case "plain": {
                        // console.log("rendering plain")
                        setComponentToRender(<MarkdownPreview source={`${nodeData.data.content}`} className="nodrag w-full p-4 text-left max-h-96 overflow-scroll" />)
                        break
                    } 
                     
                
                    default:
                        break;
                }
                break;
            }
            case 'image':
                setComponentToRender(<img src={nodeData.data.content} alt="content" />)
                break;
            case 'video':
                setComponentToRender(<video src={nodeData.data.content} controls/>)
                break;
            case 'audio': {
                setComponentToRender(<audio src={nodeData.data.content} controls />)
                break;
            }
            case 'application':
                setComponentToRender(<MarkdownPreview source={`${nodeData.data.content}`} className="nodrag w-full p-4 text-left max-h-96 overflow-scroll" />)
                break;
            default:
                setComponentToRender(<div>Unsupported content type</div>)
        }



    }, [nodeData.data]);

    function handleBlockChange(): void {
        console.log("changing ")
        setBlockData(prev => [...prev, {
            nodeId: nodeData.id,
            document: JSON.stringify(editor.document)
        }])
    }

    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="rounded-lg nopan nodrag nowheel">
                    {componentToRender}
                </div>
                <div className="card-body px-4">
                    <span className="label-text text-left">Notes</span>
                    <BlockNoteView editor={editor} onChange={handleBlockChange} className="w-full text-left nodrag" theme={lightDefaultTheme} />;
                </div>
            </div>
        </>
    )
}

export default MediaDisplay