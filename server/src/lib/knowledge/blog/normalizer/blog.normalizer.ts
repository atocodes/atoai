import { KnowledgeDocument } from "../../types/knowledge";
import { CleanBlog } from "../types/blog.types";

export function normalizeBlog(blog: CleanBlog): KnowledgeDocument {
    return {
        author: blog.author,
        content: blog.content,
        contentType: blog.type,
        source: "blog",
        sourceId: blog.id,
        publishedAt: blog.publishedAt || blog.createdAt,
        metadata: {
            hashtags: blog.textEntities.filter((entities) => entities.type == "hashtag").map((entity) => entity.text),
            mentions: [],
            links: blog.textEntities.filter((entities) => entities.type == "link").map((entity) => { return { label: entity.text, url: entity.href || "" } }),
            reactions: [],
            hasMedia: false,
            mediaType: undefined,
            forwarded: false,
            replied: false,
            originalAuthor: undefined
        }
    }
}