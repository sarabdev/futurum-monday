import {
  IconBulbFilled,
  IconCheck,
  IconTrash,
  IconWorld,
  IconWorldDownload,
  IconX,
} from '@tabler/icons-react';
import {
  DragEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';
import axios from 'axios';

import { Prompt } from '@/types/prompt';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';

import PromptbarContext from '../PromptBar.context';
import { PromptModal } from './PromptModal';
import HomeContext from '@/pages/api/home/home.context';
import { GlobalPrompt } from '@/types/globalPrompt';

interface Props {
  prompt: Prompt;
}

export const PromptComponent = ({ prompt }: Props) => {
  const {
    state: {
      apiKey,
      lightMode,
      globalPrompts,
      serverSideApiKeyIsSet,
      serverSidePluginKeysSet,
      conversations,
      prompts,
      isGlobal
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const {
    dispatch: promptDispatch,
    handleUpdatePrompt,
    handleDeletePrompt,
  } = useContext(PromptbarContext);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const handleUpdate = (prompt: Prompt) => {
    handleUpdatePrompt(prompt);
    promptDispatch({ field: 'searchTerm', value: '' });
  };

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
   
    if (isDeleting) {
      handleDeletePrompt(prompt);
      promptDispatch({ field: 'searchTerm', value: '' });
    }

    setIsDeleting(false);
  };
  function test(){
    const config = {
      method: 'post',
      url: `https://chat.futurum.one/.netlify/functions/addPrompts`,
      data: {
        prompt: {...prompt,downloadCount:0}
      },
     
    };
    return axios(config).then(response => {
      return {
        statusCode: 200,
        body: JSON.stringify(response.data)
      }
    }).catch(error => {
      console.log(error)
      return {
        statusCode: 422,
        body: `Error: ${error}`,
      }
    })
  }
  const handleMakeGlobal:MouseEventHandler<HTMLButtonElement>=async(e)=>{
    e.stopPropagation();
    let res=confirm('Are you sure you want to make it global?')
    if(res){
    localStorage.setItem('globalPrompts', JSON.stringify([...globalPrompts,{...prompt,downloadCount:0}]));

    homeDispatch({ field: 'globalPrompts', value: [...globalPrompts,{...prompt,downloadCount:0}] });
    const response=await test()

    }

   

    
    //    const result=JSON.parse(response.body);


  }

  const handleCancelDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(false);
  };

  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, prompt: Prompt) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('prompt', JSON.stringify(prompt));
    }
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);


  const updatePromptCount=(updatedPrompt:GlobalPrompt|undefined)=>{
    const config = {
      method: 'post',
      url: `https://chat.futurum.one/.netlify/functions/updatePrompt`,
      data: {
        prompt: updatedPrompt
      },

    };
    return axios(config).then(response => {
      return {
        statusCode: 200,
        body: JSON.stringify(response.data)
      }
    }).catch(error => {
      console.log(error)
      return {
        statusCode: 422,
        body: `Error: ${error}`,
      }
    })
  }

  const handleDownload=async()=>{

    let foundObject = globalPrompts.find(obj => obj.id == prompt.id);
    if(foundObject){
      foundObject.downloadCount++;
    }

     localStorage.setItem('globalPrompts',JSON.stringify(globalPrompts))
    homeDispatch({ field: 'globalPrompts', value: [...globalPrompts] });


    localStorage.setItem('prompts', JSON.stringify([...prompts,prompt]));

    homeDispatch({ field: 'prompts', value: [...prompts,prompt] });
    await updatePromptCount(foundObject)


  }
  return (
    <div className="relative flex items-center">
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90"
        draggable="true"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        onDragStart={(e) => handleDragStart(e, prompt)}
        onMouseLeave={() => {
          setIsDeleting(false);
          setIsRenaming(false);
          setRenameValue('');
        }}
      >
        <IconBulbFilled size={18} />

        <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all pr-4 text-left text-[12.5px] leading-3">
        {prompt.name} {isGlobal && !prompt.folderId && `(${(prompt as GlobalPrompt).downloadCount})`}        </div>
      </button>

      {(isDeleting || isRenaming) && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={handleDelete}>
            <IconCheck size={18} />
          </SidebarActionButton>

          <SidebarActionButton handleClick={handleCancelDelete}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {!isDeleting && !isRenaming && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          {!isGlobal && <SidebarActionButton handleClick={handleOpenDeleteModal}>
            <IconTrash size={18} />
            
          </SidebarActionButton>}
          {isGlobal && !prompt.folderId && <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();
               handleDownload()
              
              }}
            >
              <IconWorldDownload size={18} />
            </SidebarActionButton>}
          {!isGlobal && !prompt.folderId && <SidebarActionButton handleClick={handleMakeGlobal}>
            <IconWorld size={18} />
          </SidebarActionButton>}
        </div>
      )}

      {showModal && (
        <PromptModal
          prompt={prompt}
          onClose={() => setShowModal(false)}
          onUpdatePrompt={handleUpdate}
          handleDownload={handleDownload}
        />
      )}
    </div>
  );
};
