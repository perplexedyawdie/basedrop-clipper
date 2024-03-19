import React from 'react'

interface LinkData {
    content: string;
    image: string;
    description: string;
    title: string;
}
function LinkPreview({ content, description, image, title }: LinkData) {
    return (
        <div className="relative w-full mx-auto overflow-hidden bg-gray-200 rounded-md shadow sm:max-w-lg ring-1">
            <div className="flex flex-col space-y-2">
                <a href={content} className="w-full">
                    <img
                        className="object-cover w-full h-60"
                        src={image}
                        alt="Preview" />
                </a>

                <div className="flex flex-col p-3 space-y-1">
                    <a href={content} className="m-0 text-lg leading-tight text-gray-900 no-underline hover:no-underline hover:text-gray-900 sm:text-xl text-left">{title}</a>
                    <p className="text-gray-500 text-left">{content}</p>
                    <p className="text-sm text-left">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LinkPreview