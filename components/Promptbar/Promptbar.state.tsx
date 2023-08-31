import { Prompt } from '@/types/prompt';

export interface PromptbarInitialState {
  searchTerm: string;
  filteredPrompts: Prompt[];
  filteredGlobalPrompts:Prompt[];
}

export const initialState: PromptbarInitialState = {
  searchTerm: '',
  filteredPrompts: [],
  filteredGlobalPrompts:[]
};
