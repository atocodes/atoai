import { knowledgeQuery } from "../validator/output.validator";

export interface ChatGenerateInput {
  question: string;
  context: string;
}

export interface ClassifierResponse {
  category: string;
  confidence: number;
  reason: string;
}

export interface ChatProvider {
  generate({ question, context }: ChatGenerateInput): Promise<any>;
  generateAnswerForUser({ question, context }: ChatGenerateInput): Promise<any>;
  classifier(content: string): Promise<ClassifierResponse>;
  analyzeQuery(content: string): Promise<any>;
  smartChuncker(content: string): Promise<any>;
}
