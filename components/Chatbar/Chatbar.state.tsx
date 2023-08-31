import { Conversation } from '@/types/chat';

export interface ChatbarInitialState {
  searchTerm: string;
  filteredConversations: Conversation[];
  filteredGlobalPrompts:Conversation[];
}

export const initialState: ChatbarInitialState = {
  searchTerm: '',
  filteredConversations: [],
  filteredGlobalPrompts:[]
};
