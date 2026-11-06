import { ParsedBlogPost } from "../types/blog.types";

export function parseBlogContent(raw: any): ParsedBlogPost | null {

    if (!raw) return null;
    return {
        author: raw.user.name,
        content: raw.content,
        coverImage: raw.coverImage,
        slug: raw.slug,
        title: raw.title,
        excerpt: raw.excerpt,
        tags: raw.tags,
        published: raw.published,
        publishedAt: new Date(raw.publishedAt),
        readingTime: raw.readingTime,
        views: raw.views,
        order: raw.order,
        createdAt: new Date(raw.createdAt),
        updatedAt: new Date(raw.updatedAt),
        type: raw.type,
        id: raw.id
    }
}