import React, { useEffect, useState } from 'react'
import { Handle, Position } from 'reactflow';
import { MetaTags } from '../utils/gmeta';
import LinkPreview from './LinkPreview';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote, lightDefaultTheme } from "@blocknote/react";
import "@blocknote/react/style.css";
import MarkdownPreview from '@uiw/react-markdown-preview';

export interface MediaData {
    contentType: string;
    content: string;
}
//TODO save notes to node data
function MediaDisplay({ data }: { data: MediaData }) {
    const [componentToRender, setComponentToRender] = useState<JSX.Element | null>(null);
    const editor = useCreateBlockNote();
    useEffect(() => {
        
        switch (data.contentType.split("/")[0]) {
            case 'text': {
                // Special handling for HTML content that might be a video URL playable by ReactPlayer
                //TODO: parse meta tag
                switch (data.contentType.split("/")[1]) {
                    case "html": {
                        chrome.runtime.sendMessage({ url: data.content, action: "getMetaTagsFromURL" })
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .then(({ data: meta, error }: { data: MetaTags, error: any }) => {
                            if (meta && !error) {
                                setComponentToRender(<LinkPreview
                                    content={data.content}
                                    description={meta.description}
                                    image={meta.image}
                                    title={meta.title} />)
                            } else {
                                setComponentToRender(<div>nothing to see :( </div>)
                            }
                        })
                    break;
                    }
                    case "plain": {
                        setComponentToRender(<MarkdownPreview source={`${data.content}`} className="nodrag w-full p-4 text-left max-h-96 overflow-scroll" />)
                        break
                    } 
                     
                
                    default:
                        break;
                }
                break;
            }
            case 'image':
                setComponentToRender(<img src={data.content} alt="content" />)
                break;
            case 'video':
                setComponentToRender(<video src={data.content} controls/>)
                break;
            case 'audio': {
                setComponentToRender(<audio src={data.content} controls />)
                break;
            }
            case 'application':
                setComponentToRender(<div>hello</div>)
                break;
            default:
                setComponentToRender(<div>Unsupported content type</div>)
        }



    }, [data]);

    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="rounded-lg nopan nodrag nowheel">
                    {componentToRender}
                </div>
                <div className="card-body px-0">
                    <span className="label-text text-left">Notes</span>
                    <BlockNoteView editor={editor} className="w-full text-left nodrag" theme={lightDefaultTheme} />;
                </div>
            </div>
        </>
    )
}

export default MediaDisplay