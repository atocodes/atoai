export interface CleanBlog {
    id: string;
    slug: string;
    excerpt: string;
    content: string;
    published: boolean;
    publishedAt: Date | null;
    readingTime: string | null;
    type: string;
    author: string;
    createdAt: Date;
    textEntities: TextEntities[]
}


export interface TextEntities {
    type: string;
    text: string;
    href?: string;
}

export interface ParsedBlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    tags: string;
    published: boolean;
    publishedAt: Date | null;
    readingTime: string | null;
    views: number;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    author: string;
}