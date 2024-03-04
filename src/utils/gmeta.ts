import _pattern from './patterns';

interface Meta {
    [key: string]: string | boolean;
}

interface Result {
    meta?: Meta;
    error: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    msg?: any;
}

async function fetchMetaData(url: string): Promise<string> {
    //   const response = await got(url, { timeout: {
    //     socket: 3000
    //   }});
    console.log("url: ", url)
    // const response = await axios.get(url)
    const response = await (await fetch(url)).text()
    
    let headContent = response.match(/<head[^>]*>[\s\S]*<\/head>/gi)?.[0] ?? response;
    headContent = headContent.replace(/(<style[\w\W]+style>)/gi, '').replace(/(<script[\w\W]+script>)/gi, '');
    return headContent;
}

function extractMeta(headContent: string, url: string, isHTML: boolean): Meta {
    const meta: Meta = {};
    const source = isHTML ? url : headContent;

    _pattern.forEach((el) => {
        el.KEYS.forEach((key) => {
            const regex = new RegExp(el.pattern.split('{{KEY}}').join(key), 'i');
            const match = source.match(regex);
            if (match) {
                meta[key] = match[1];
            }
        });
    });

    return meta;
}

function validateUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
}

export const gmeta = async (url: string, isHTML: boolean = false): Promise<Result> => {
    try {
        if (!url) {
            throw new Error('URL is required');
        }

        if (!validateUrl(url) && !isHTML) {
            throw new Error('Invalid URL');
        }

        const headContent = isHTML ? url : await fetchMetaData(url);
        const meta = extractMeta(headContent, url, isHTML);

        return {
            meta,
            error: false
        }; // Return the meta data for async/await patterns
    } catch (error) {
        console.error(error)
        return {
            error: true
        }
    }
};
