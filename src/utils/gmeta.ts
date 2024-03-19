export interface MetaTags {
  description: string;
  image: string;
  title: string;
}

export interface Result {
  meta?: MetaTags;
  error: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  msg?: any;
}

async function fetchMetaData(url: string): Promise<string | null> {
  try {
    console.log(url)
    const response = await (await fetch(url)).text()
    return response;
  } catch (error) {
    console.error(error)
    return null
  }

}

function extractMetaInfo(html: string): MetaTags {
  // Enhanced regular expressions to match various description, title, and image URL meta tags
  const descriptionRegex = /<meta\s+(?:name|property)=["'](description|og:description)["']\s+content=["'](.*?)["']/i;
  const titleRegex = /<title>(.*?)<\/title>|<meta\s+(?:name|property)=["'](title|og:title)["']\s+content=["'](.*?)["']/i;
  const imageRegex = /<meta\s+(?:name|property)=["'](og:image|image)["']\s+content=["'](.*?)["']/i;
  
  // Extracting content using the regular expressions with adjustments for capturing groups
  const descriptionMatch = html.match(descriptionRegex);
  const titleMatch = html.match(titleRegex) || ['', '', ''];
  const imageMatch = html.match(imageRegex);

  // Adjusting capturing group extraction based on the matched pattern
  const description = descriptionMatch ? descriptionMatch[2] : '';
  const title = titleMatch ? (titleMatch[1] ? titleMatch[1] : titleMatch[3]) : ''; // Considering both <title> and meta variations
  const image = imageMatch ? imageMatch[2] : '';

  // Returning the extracted information as an object
  return {
    description,
    title,
    image
  };
}

export const urlPreviewData = async (url: string): Promise<Result> => {
  try {
    const headContent: string | null = await fetchMetaData(url);
    if (headContent) {
      const meta = extractMetaInfo(headContent);
      return {
        meta,
        error: false
      }
    } else {
      throw Error
    }

  } catch (error) {
    console.error(error)
    return {
      error: true
    }
  }
}

export const gmeta = (html: string): Result => {
  try {
    const meta = extractMetaInfo(html);

    return {
      meta,
      error: false
    };
  } catch (error) {
    console.error(error)
    return {
      error: true
    }
  }
};
