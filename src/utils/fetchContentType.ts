interface ContentTypeData {
    data: string | null;
    error: string | null;
}
export async function fetchContentType(url: string): Promise<ContentTypeData> {
    try {
        const response = await fetch(url, { method: 'HEAD' }); // Use HEAD to get headers without downloading the body
        const contentType = response.headers.get('Content-Type');
        console.log('Content-Type:', contentType);
        return {
            data: contentType,
            error: null
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return {
            data: null,
            error: JSON.stringify(error)
        }
    }
}