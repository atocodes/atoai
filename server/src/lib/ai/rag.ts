import { KnowledgeSearchRepoImpl } from "../db/knowledge/repo/knowledge.search.repo.impl";
import { chatProvider } from "./chat";
import { embeddingProvider } from "./embeddings";
import { AnswerService } from "./rag/answer.service";
import { ContextBuilder } from "./rag/context.builder";
import { RetrievalService } from "./rag/retrieval.service";

export const knowledgeSearchRepo = new KnowledgeSearchRepoImpl();
export const retrievalService = new RetrievalService(
  knowledgeSearchRepo,
  embeddingProvider,
);
export const contextBuilder = new ContextBuilder();

export const answerService = new AnswerService(
  retrievalService,
  contextBuilder,
  chatProvider,
);

export const ragService = answerService;

export { AnswerService, RetrievalService, ContextBuilder };
