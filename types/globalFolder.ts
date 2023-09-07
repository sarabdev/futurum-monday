export interface GlobalFolderInterface {
    id: string;
    name: string;
    type: FolderType;
    downloadCount:number;
  }
  
  export type FolderType = 'chat' | 'prompt';
  