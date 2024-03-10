import _pattern from './patterns';

interface Meta {
    [key: string]: string;
}

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

function parseRelevantTags(parsedMetatags: Meta): MetaTags {
    // Define default values
  let description = '', image = '', title = '';

  // Prioritize tags for description
  if (parsedMetatags["og:description"]) {
    description = parsedMetatags["og:description"];
  } else if (parsedMetatags["twitter:description"]) {
    description = parsedMetatags["twitter:description"];
  } else if (parsedMetatags["description"]) {
    description = parsedMetatags["description"];
  }

  // Prioritize tags for image
  if (parsedMetatags["og:image"]) {
    image = parsedMetatags["og:image"];
  } else if (parsedMetatags["twitter:image"]) {
    image = parsedMetatags["twitter:image"];
  } else if (parsedMetatags["image"]) {
    image = parsedMetatags["image"];
  }

  // Prioritize tags for title
  if (parsedMetatags["og:title"]) {
    title = parsedMetatags["og:title"];
  } else if (parsedMetatags["twitter:title"]) {
    title = parsedMetatags["twitter:title"];
  } else if (parsedMetatags["title"]) {
    title = parsedMetatags["title"];
  }
  return { description, image, title };
}

function extractMeta(headContent: string): MetaTags {
    const meta: Meta = {};
    const source = headContent;

    _pattern.forEach((el) => {
        el.KEYS.forEach((key) => {
            const regex = new RegExp(el.pattern.split('{{KEY}}').join(key), 'i');
            const match = source.match(regex);
            if (match) {
                meta[key] = match[1];
            }
        });
    });

    return parseRelevantTags(meta);
}

export const gmeta = (html: string): Result => {
    try {
        const meta = extractMeta(html);

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
