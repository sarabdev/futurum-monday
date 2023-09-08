import { IconClearAll, IconFileExport, IconMist, IconMistOff, IconSettings, IconSettings2 } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'next-i18next';

import HomeContext from '@/pages/api/home/home.context';
import { ModelSelect } from '@/components/Chat/ModelSelect';

import { SettingDialog } from '@/components/Settings/SettingDialog';
import { AuthContext } from "../../../contexts/authContext";

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { PluginKeys } from './PluginKeys';
import axios from "axios"
export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const { user, login, logout } = useContext(AuthContext);

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const [isOptionOpen, setIsOptionOpen]=useState<boolean>(false);
  const {
    state: {
      apiKey,
      lightMode,
      selectedConversation,
      serverSideApiKeyIsSet,
      serverSidePluginKeysSet,
      conversations,
      models,
      isAutoHide
    },
    dispatch,
    handleUpdateConversation
  } = useContext(HomeContext);

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
    handleApiKeyChange,
  } = useContext(ChatbarContext);

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };
  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

 
  return (
    <>
    <div 
    style={{
      borderColor: lightMode=="light" ? "black" : "white",
      maxHeight:"50%",
      minHeight:isOptionOpen?"50%":"0%",
      overflowY:"scroll",
      overflowX:"hidden",
    }} 
    className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
     
      {
      isOptionOpen && 
      (<>
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} lightMode={lightMode} />
      ) : null}
 <button data-tooltip-target="tooltip-default" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Default tooltip</button>
 <div className="group relative m-12 flex justify-center">
  <button className="rounded bg-amber-500 px-4 py-2 text-sm text-white shadow-sm">Hover me!</button>
  <span className="absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">✨ You hover me!</span>
</div>
      <Import onImport={handleImportConversations} lightMode={lightMode} />
      <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
        lightMode={lightMode}

      />

       <SidebarButton
        text={t('Theme settings')}
        icon={<IconSettings2 size={18} />}
        onClick={() => setIsSettingDialog(true)}
        lightMode={lightMode}
      />
      <SidebarButton
        text={t('Delete All Messages')}
        icon={<IconClearAll size={18} />}
        onClick={() => onClearAll()}
        lightMode={lightMode}
      />
             

      {!serverSideApiKeyIsSet ? (
        <Key apiKey={process.env.NEXT_PUBLIC_API_KEY || apiKey} onApiKeyChange={handleApiKeyChange} lightMode={lightMode} />
      ) : null}

      {!serverSidePluginKeysSet ? <PluginKeys  /> : null}
      <SidebarButton
        text={t(isAutoHide?'Disable Autohide Sidebar':'Enable Autohide Sidebar')}
        icon={isAutoHide?<IconMistOff size={18}/>:<IconMist size={18} />}
        onClick={() => {
          dispatch({ field: 'isAutoHide', value: !isAutoHide })
          localStorage.setItem('isAutoHide',JSON.stringify(!isAutoHide))
        }
      }
        lightMode={lightMode}
      />
      {user && <SidebarButton
        text={t('Logout')}
        icon={<IconSettings2 size={18} />}
        onClick={logout}
        lightMode={lightMode}
      />}
      <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false);
        }}
      />

{showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                   {models && models.length>0 && <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                      
                      <ModelSelect />
                    </div>}
                  </div>
                )}

      {/* {t('Temp')}
                  : {selectedConversation?.temperature} */}
   
   {/* <div>
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={onClearAll}
                  >
                    <IconClearAll size={18} />
                  </button>
                  </div> */}
     </>
     ) }


    </div>
    <div style={{
  borderColor: lightMode=="light" ? "black" : "white"
}}    className={isOptionOpen ? "border-t border-white/20 pt-1 space-y-1" : ""}>
  <SidebarButton
    text={t('Settings')}
    icon={<IconSettings size={18} />}
    onClick={() =>{ setIsOptionOpen(!isOptionOpen); setShowSettings(!showSettings);
    }}
    lightMode={lightMode}
  />
  </div>
  </>
  );
};
