import { CleanBlog, ParsedBlogPost, TextEntities } from "../types/blog.types";

export const getLinks = (content: string): TextEntities[] => {
    const regex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'](?:[^>]*?)>(.*?)<\/a>/gi;
    const links: TextEntities[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        links.push({
            type: "link",
            text: match[2],
            href: match[1]
        });
    }
    return links;
}

export function cleanBlog(data: ParsedBlogPost): CleanBlog {
    const links = getLinks(data.content);
    const textEntitites = links.length > 0 ? [
        ...links,
    ] : []

    data.coverImage && textEntitites.push({
        text: "Cover Image",
        type: "image_url",
        href: data.coverImage
    })

    if (data.tags != null || data.tags != "") {
        data.tags.split(",").forEach((tag) => {
            textEntitites.push({
                text: tag.trim(),
                type: "hashtag",
            })
        })
    }

    return {
        id: data.id,
        slug: data.slug,
        excerpt: data.excerpt,
        content: `${data.title}\n\n\n${data.excerpt}\n\n\n${data.content}`,
        published: data.published,
        publishedAt: data.publishedAt,
        readingTime: data.readingTime,
        author: data.author,
        createdAt: data.createdAt,
        type: data.type,
        textEntities: textEntitites ?? [],
    };
}