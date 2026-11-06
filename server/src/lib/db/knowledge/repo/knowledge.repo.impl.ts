import { KnowledgeDocument } from "@/knowledge/types/knowledge";
import { KnowledgeRepo } from "../interface/knowledge.repo";
import { prisma } from "@/prisma/db";
import { Prisma } from "@/prisma/generated/prisma/client";

export class KnowledgeRepoImpl implements KnowledgeRepo {
  async findWithSourceId(sourceId: string): Promise<any> {
    return await prisma.knowledgeDocument.findUnique({ where: { sourceId } });
  }
  async create(data: KnowledgeDocument): Promise<any> {
    const { metadata, ...documentData } = data;
    const { ...metadataData } = metadata;

    const document = await prisma.knowledgeDocument.create({
      data: {
        ...documentData,
        metadata: metadata && {
          create: {
            ...metadataData,
            reactions: metadata.reactions as unknown as Prisma.InputJsonValue,
            links: {
              createMany: {
                data: (metadata.links || []).map(
                  (link: { label: string; url: string }) => ({
                    label: link.label,
                    url: link.url,
                  }),
                ),
              },
            },
          },
        },
      },
      include: {
        metadata: {
          include: {
            links: true,
          },
        },
      },
    });

    return document;
  }
}
