import { useContext } from 'react';

import { FolderInterface } from '@/types/folder';

import HomeContext from '@/pages/api/home/home.context';

import Folder from '@/components/Folder';
import { PromptComponent } from '@/components/Promptbar/components/Prompt';

import PromptbarContext from '../PromptBar.context';
import { Prompt } from '@/types/prompt';

export const PromptFolders = () => {
  const {
    state: { folders ,isGlobal,globalFolders,globalPrompts},
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredPrompts, filteredGlobalPrompts },
    handleUpdatePrompt,
  } = useContext(PromptbarContext);

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData('prompt'));

      const updatedPrompt = {
        ...prompt,
        folderId: folder.id,
      };

      handleUpdatePrompt(updatedPrompt);
    }
  };
  
  const PromptGlobalFolders = (currentFolder: FolderInterface) =>{
    const combinedPrompts = filteredGlobalPrompts.concat(globalPrompts);

// const uniquePrompts = combinedPrompts.reduce((accumulator:Prompt[], currentPrompt:Prompt) => {
//   const isPromptAlreadyAdded = accumulator.some((uniquePrompt:Prompt) => uniquePrompt.id === currentPrompt.id);

//   if (!isPromptAlreadyAdded && currentPrompt.folderId === currentFolder.id) {
//     accumulator.push(currentPrompt);
//   }

//   return accumulator;
// }, []);
  return filteredGlobalPrompts
  // .concat(globalPrompts)
  //     .filter((p) => p.folderId)
      .map((prompt, index) => {
        if (prompt.folderId === currentFolder.id) {
          return (
            <div key={index} className="ml-5 gap-2 border-l pl-2">
              <PromptComponent prompt={prompt} />
            </div>
          );
        }
      });
    }

  const PromptFolders = (currentFolder: FolderInterface) =>{
    const combinedPrompts = filteredPrompts.concat(globalPrompts);

// const uniquePrompts = combinedPrompts.reduce((accumulator:Prompt[], currentPrompt:Prompt) => {
//   const isPromptAlreadyAdded = accumulator.some((uniquePrompt:Prompt) => uniquePrompt.id === currentPrompt.id);

//   if (!isPromptAlreadyAdded && currentPrompt.folderId === currentFolder.id) {
//     accumulator.push(currentPrompt);
//   }

//   return accumulator;
// }, []);
  return filteredPrompts
  // .concat(globalPrompts)
  //     .filter((p) => p.folderId)
      .map((prompt, index) => {
        if (prompt.folderId === currentFolder.id) {
          return (
            <div key={index} className="ml-5 gap-2 border-l pl-2">
              <PromptComponent prompt={prompt} />
            </div>
          );
        }
      });
    }

  return (
    <div className="flex w-full flex-col pt-2">
      {isGlobal ? 
      globalFolders && globalFolders
      .filter((folder) => folder.type === 'prompt')
      .sort((a, b) => {
        const downloadCountA = a.downloadCount || 0;
        const downloadCountB = b.downloadCount || 0;
        return downloadCountB - downloadCountA; // Sort in descending order
      })
      .map((folder, index) => (
        <Folder
          key={index}
          searchTerm={searchTerm}
          currentFolder={folder}
          handleDrop={handleDrop}
          folderComponent={PromptGlobalFolders(folder)}
        />
      )) :
      folders
        .filter((folder) => folder.type === 'prompt')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            currentFolder={folder}
            handleDrop={handleDrop}
            folderComponent={PromptFolders(folder)}
          />
        ))}
    </div>
  );
};
