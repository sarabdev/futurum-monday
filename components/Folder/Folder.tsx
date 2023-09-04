import {
  IconCaretDown,
  IconCaretRight,
  IconCheck,
  IconPalette,
  IconPencil,
  IconTrash,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import {TwitterPicker} from 'react-color'
import ColorCodes from "../ColorCodes"
import {
  KeyboardEvent,
  MouseEventHandler,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import axios from 'axios';
import { FolderInterface } from '@/types/folder';

import HomeContext from '@/pages/api/home/home.context';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';
import PromptbarContext from '../Promptbar/PromptBar.context';
import { Prompt } from '@/types/prompt';

interface Props {
  currentFolder: FolderInterface;
  searchTerm: string;
  handleDrop: (e: any, folder: FolderInterface) => void;
  folderComponent: (ReactElement | undefined)[];
}

const Folder = ({
  currentFolder,
  searchTerm,
  handleDrop,
  folderComponent,
}: Props) => {
  const { state:{isGlobal, globalFolders,prompts,folderColors},handleDeleteFolder, handleUpdateFolder, dispatch:homeDispatch } = useContext(HomeContext);
  // const {
  //   state,
  //   handleUpdatePrompt,
  // } = useContext(PromptbarContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [background,setBackground]= useState('')
  const [renameValue, setRenameValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isChangeColor,setIsChangeColor]=useState(false)

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    }
  };

  const handleRename = () => {
    handleUpdateFolder(currentFolder.id, renameValue);
    setRenameValue('');
    setIsRenaming(false);
  };

  const dropHandler = (e: any) => {
    if (e.dataTransfer) {
      setIsOpen(true);

      handleDrop(e, currentFolder);

      e.target.style.background = 'none';
    }
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };
  function test(){
    const config = {
      method: 'post',
      url: `https://dev.futurum.one/.netlify/functions/addFolders`,
      data: {
        folder:currentFolder
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
  function addFolderPrompts(myPrompts:Prompt[]){
    const config = {
      method: 'post',
      url: `https://dev.futurum.one/.netlify/functions/addFolderPrompts`,
      data: {
        prompts:myPrompts
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
      const myPrompts=prompts.filter((prompt)=>prompt.folderId==currentFolder.id)
      console.log(myPrompts)
      console.log(currentFolder)
    localStorage.setItem('globalFolders', JSON.stringify([...globalFolders,currentFolder]));

    homeDispatch({ field: 'globalFolders', value: [...globalFolders,currentFolder] });
    await test()
    await addFolderPrompts(myPrompts)

    }

  }

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  useEffect(() => {
    if (searchTerm) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm]);

  const handleChangeComplete = (color:any) => {
    setBackground(color.hex)
    let item = folderColors.find(obj => obj.folderId == currentFolder.id)
    if(item) {
    item.colorCode = color.hex;
    item.folderId=currentFolder.id;
    homeDispatch({ field: 'folderColors', value: [...folderColors], });
    localStorage.setItem('folderColors',JSON.stringify([...folderColors]))

    }
    else{
      let newColor={
        colorCode:color.hex,
        folderId:currentFolder.id
      }
      homeDispatch({ field: 'folderColors', value: [...folderColors,newColor], });
      localStorage.setItem('folderColors',JSON.stringify([...folderColors,newColor]))

    }
    setIsChangeColor(false)
    


  };

  useEffect(()=>{
    let newColor=folderColors.find((color)=>color.folderId==currentFolder.id)
    if(newColor){
      setBackground(newColor.colorCode)
    }
  },[])
  return (
    <>

      <div className="relative flex items-center" style={{backgroundColor:background}}>
        {isRenaming ? (
          <div className="flex w-full items-center gap-3  p-3">
            {isOpen ? (
              <IconCaretDown size={18} />
            ) : (
              <IconCaretRight size={18} />
            )}
            <input
              className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleEnterDown}
              autoFocus
            />
          </div>
        ) : (
          <button
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200`}
            onClick={() => setIsOpen(!isOpen)}
            onDrop={(e) => dropHandler(e)}
            onDragOver={allowDrop}
            onDragEnter={highlightDrop}
            onDragLeave={removeHighlight}
          >
            {isOpen ? (
              <IconCaretDown size={18} />
            ) : (
              <IconCaretRight size={18} />
            )}

            <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3">
              {currentFolder.name}
            </div>
          </button>
        )}

        {(isDeleting || isRenaming) && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            <SidebarActionButton
              handleClick={(e) => {
                
                e.stopPropagation();

                if (isDeleting) {
                  handleDeleteFolder(currentFolder.id);
                } else if (isRenaming) {
                  handleRename();
                }

                setIsDeleting(false);
                setIsRenaming(false);
              
              setIsDeleting(false)
              }}
            >
              <IconCheck size={18} />
            </SidebarActionButton>
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();
                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconX size={18} />
            </SidebarActionButton>
          </div>
        )}

        {!isDeleting && !isRenaming && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            {currentFolder.type=="chat" && <SidebarActionButton
              handleClick={(e) => {

                setIsChangeColor((old)=>!old)
                //e.stopPropagation();
                //setIsRenaming(true);
                //setRenameValue(currentFolder.name);
              }}
            >
              <IconPalette size={18} />
            </SidebarActionButton>
}
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setRenameValue(currentFolder.name);
              }}
            >
              <IconPencil size={18} />
            </SidebarActionButton>
            <SidebarActionButton
              handleClick={(e) => {
                let response=confirm("Are you sure you want to delete folder and all of its content?")
                if(response){
                e.stopPropagation();
                setIsDeleting(true);
                }
              }}
            >
              <IconTrash size={18} />
            </SidebarActionButton>
          {!isGlobal && currentFolder.type=="prompt" &&  <SidebarActionButton
              handleClick={(e) => {
                // e.stopPropagation();
                // setIsDeleting(true);
                handleMakeGlobal(e);
              }}
            >
              <IconWorld size={18}/>
            </SidebarActionButton>}
          </div>
        )}
      </div>

      {isOpen ? folderComponent : null}
      {isChangeColor && <TwitterPicker colors={ColorCodes} onChangeComplete={handleChangeComplete} width={'210px'}/>}

    </>
  );
};

export default Folder;
