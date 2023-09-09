import { OpenAIModel } from './openai';

export interface GlobalPrompt {
  id: string;
  name: string;
  description: string;
  content: string;
  model: OpenAIModel;
  folderId: string | null;
  downloadCount:number;
  userId:string;
}