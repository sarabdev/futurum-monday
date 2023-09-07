import { Conversation, Message } from '@/types/chat';
import { Color } from '@/types/color';
import { ErrorMessage } from '@/types/error';
import { FolderInterface } from '@/types/folder';
import { GlobalPrompt } from '@/types/globalPrompt';
import { OpenAIModel, OpenAIModelID } from '@/types/openai';
import { PluginKey } from '@/types/plugin';
import { Prompt } from '@/types/prompt';

export interface HomeInitialState {
  apiKey: string;
  isAutoHide:boolean;
  pluginKeys: PluginKey[];
  loading: boolean;
  isGlobal:boolean;
  showPluginSelect:boolean;
  lightMode: 'light' | 'dark';
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  models: OpenAIModel[];
  folders: FolderInterface[];
  globalFolders:FolderInterface[];
  folderColors:Color[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  prompts: Prompt[];
  globalPrompts:GlobalPrompt[];
  filteredGlobalPrompts:Prompt[];
  temperature: number;
  showChatbar: boolean;
  showPromptbar: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  searchTerm: string;
  defaultModelId: OpenAIModelID | undefined;
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
}

export const initialState: HomeInitialState = {
  apiKey: "" ,
  isAutoHide:false,
  loading: false,
  isGlobal: false,
  showPluginSelect:false,
  pluginKeys: [],
  lightMode: 'dark',
  messageIsStreaming: false,
  modelError: null,
  models: [],
  folders: [],
  globalFolders:[],
  conversations: [],
  folderColors:[],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  globalPrompts:[],
  filteredGlobalPrompts:[],
  temperature: 1,
  showPromptbar: false,
  showChatbar: false,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
  defaultModelId: undefined,
  serverSideApiKeyIsSet: false,
  serverSidePluginKeysSet: false,
};
