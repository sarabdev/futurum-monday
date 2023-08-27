import { IconClearAll, IconFileExport, IconSettings, IconSettings2 } from '@tabler/icons-react';
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
      models
    },
    dispatch: homeDispatch,
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
      overflowY:"scroll",
      overflowX:"hidden"
    }} 
    className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      
      {
      isOptionOpen && 
      (<>
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} lightMode={lightMode} />
      ) : null}

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
        <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} lightMode={lightMode} />
      ) : null}

      {!serverSidePluginKeysSet ? <PluginKeys  /> : null}
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
