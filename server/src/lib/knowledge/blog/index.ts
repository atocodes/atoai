import { knowledgeService } from "@/module/knowledge";
import { KnowledgeDocument } from "../types/knowledge";
import { cleanBlog } from "./cleaner/blog.cleaner";
import { normalizeBlog } from "./normalizer/blog.normalizer";
import { parseBlogContent } from "./parser/blog.parser";
import { chatProvider } from "@/lib/ai/chat";

interface createBlogKnowledgeOptions {
    content: any
}
export async function createBlogKnowledge(options: createBlogKnowledgeOptions): Promise<KnowledgeDocument | null> {


    try {

        let parsed = parseBlogContent(options.content)
        if (!parsed) {
            throw new Error(`[Blog Parser Error]: Could not parse content: ${options.content}`)
        }

        const cleaned = cleanBlog(parsed)
        const normalized = normalizeBlog(cleaned)


        const exists = await knowledgeService.findWithSourceId(normalized.sourceId)

        if (exists) {
            throw new Error(`[Parser Error]: Document: ${normalized} \n\n Already Exists`)
        }

        const classification = await chatProvider.classifier(normalized.content)
        normalized.contentType = classification.category;

        return normalized;

    } catch (error: any) {
        throw new Error(error.message || `[Parser Error]: Unknown error creating telegram knowledge`)
    }
}