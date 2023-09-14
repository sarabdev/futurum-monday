import { IconClearAll, IconSettings } from '@tabler/icons-react';
import React, {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

import { useTranslation } from 'next-i18next';

import { getEndpoint } from '@/utils/app/api';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { throttle } from '@/utils/data/throttle';

import { ChatBody, Conversation, Message } from '@/types/chat';
import { Plugin } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';
import { AuthContext } from '@/contexts/authContext';
import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { ModelSelect } from './ModelSelect';
import { SystemPrompt } from './SystemPrompt';
import { TemperatureSlider } from './Temperature';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import Image from 'next/image';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      lightMode,
      selectedConversation,
      conversations,
      models,
      apiKey,
      pluginKeys,
      serverSideApiKeyIsSet,
      messageIsStreaming,
      modelError,
      loading,
      prompts,
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const { user, login, logout,userRole ,setUser,setToken, authReady} = useContext(AuthContext);
  const [showSignin,setShowSignin]=useState(false)
  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [toggleAction,setToggleAction]=useState('login')
  const [inputValues,setInputValues]=useState({
     username:'',
     email:'',
     password:''
  })
  const [loadingResponse,setLoadingResponse]=useState(false)
  const [error,setError]=useState('')

  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const key=e.target.name;
    const value=e.target.value;
    setError('')

    setInputValues({
      ...inputValues,
      [key]:value
    })
  }
  function test(email:string){
    const config = {
      method: 'get',
      url: `${process.env.NEXT_PUBLIC_MANAGE_SUBSCRIPTION}?email=${email}`,
      body:{
        email
      }
    };
    return axios(config).then(response => {
      return {
        statusCode: 200,
        body: JSON.stringify(response.data)
      }
    }).catch(error => {
      return {
        statusCode: 422,
        body: `Error: ${error}`,
      }
    })
  }
  // const manage=async()=>{
  //   if(user && process.env.NEXT_PUBLIC_MANAGE_SUBSCRIPTION){
  //     const {email}=user;
  //     const response=await test(email)
  //     const result=JSON.parse(response.body);
  //     window.location.href=result?.link?.url
  //   }
  // }
  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      if (selectedConversation) {
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: updatedConversation.messages,
          key: apiKey,
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
        };
        const endpoint = getEndpoint(plugin);
        let body;
        if (!plugin) {
          body = JSON.stringify(chatBody);
        } else {
          body = JSON.stringify({
            ...chatBody,
            googleAPIKey: pluginKeys
              .find((key) => key.pluginId === 'google-search')
              ?.requiredKeys.find((key) => key.key === 'GOOGLE_API_KEY')?.value,
            googleCSEId: pluginKeys
              .find((key) => key.pluginId === 'google-search')
              ?.requiredKeys.find((key) => key.key === 'GOOGLE_CSE_ID')?.value,
          });
        }
        const controller = new AbortController();
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body,
        });
        if (!response.ok) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          toast.error(response.statusText);
          return;
        }
        const data = response.body;
        if (!data) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          return;
        }
        if (!plugin) {
          if (updatedConversation.messages.length === 1) {
            const { content } = message;
            const customName =
              content.length > 30 ? content.substring(0, 30) + '...' : content;
            updatedConversation = {
              ...updatedConversation,
              name: customName,
            };
          }
          homeDispatch({ field: 'loading', value: false });
          const reader = data.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let isFirst = true;
          let text = '';
          while (!done) {
            if (stopConversationRef.current === true) {
              controller.abort();
              done = true;
              break;
            }
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            text += chunkValue;
            if (isFirst) {
              isFirst = false;
              const updatedMessages: Message[] = [
                ...updatedConversation.messages,
                { role: 'assistant', content: chunkValue },
              ];
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
            } else {
              const updatedMessages: Message[] =
                updatedConversation.messages.map((message, index) => {
                  if (index === updatedConversation.messages.length - 1) {
                    return {
                      ...message,
                      content: text,
                    };
                  }
                  return message;
                });
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
            }
          }
          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'messageIsStreaming', value: false });
        } else {
          const { answer } = await response.json();
          const updatedMessages: Message[] = [
            ...updatedConversation.messages,
            { role: 'assistant', content: answer },
          ];
          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };
          homeDispatch({
            field: 'selectedConversation',
            value: updateConversation,
          });
          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
        }
      }
    },
    [
      apiKey,
      conversations,
      pluginKeys,
      selectedConversation,
      stopConversationRef,
    ],
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

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

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };

  const handleLogin=async(e:React.SyntheticEvent)=>{
   e.preventDefault()
   setError('')

    setLoadingResponse(true)
    const controller = new AbortController();
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body:JSON.stringify({
        email:inputValues.email,
        password:inputValues.password
      })

      
    });
    const result=await response.json()
    setInputValues({
      username:'', 
      email:'',
      password:''
    })
    if(result.error){
      setLoadingResponse(false)
      setError(result.message)

    }
    else{
      setError('')
      setUser(result.user)
      setToken(result.token)
      localStorage.setItem('user',JSON.stringify(result.user))
      localStorage.setItem('token',JSON.stringify(result.token))
      setLoadingResponse(false)
    }
  }

  const handleReset=async(e:React.SyntheticEvent)=>{
    e.preventDefault()
    setError('')

    setLoadingResponse(true)
    const controller = new AbortController();
    const response = await fetch('/api/passwordReset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body:JSON.stringify({
        email:inputValues.email,
      })

      
    });
    const result=await response.json()
    setInputValues({
      username:'', 
      email:'',
      password:''
    })
    if(result.error){
      setLoadingResponse(false)
      setError(result.message)

    }
    else{
      setError(result.message)
      setLoadingResponse(false)
    }
  }
  const handleSignup=async(e:React.SyntheticEvent)=>{
    e.preventDefault()
    setError('')

    setLoadingResponse(true)
    const controller = new AbortController();
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body:JSON.stringify({
        ...inputValues
      })

      
    });
    const result=await response.json()
    setInputValues({
      username:'', 
      email:'',
      password:''
    })
    if(result.error){
      setLoadingResponse(false)
      setError(result.message)

    }
    else{
      setError('')
      setToggleAction('login')
      setLoadingResponse(false)
    }
  }
  const throttledScrollDown = throttle(scrollDown, 250);

  // useEffect(() => {
  //   console.log('currentMessage', currentMessage);
  //   if (currentMessage) {
  //     handleSend(currentMessage);
  //     homeDispatch({ field: 'currentMessage', value: undefined });
  //   }
  // }, [currentMessage]);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  useEffect(()=>{
   if(user){
    homeDispatch({ field: 'apiKey', value: process.env.NEXT_PUBLIC_API_KEY });
   }
   else{
    homeDispatch({ field: 'apiKey', value:'' });
   }
  },[user])

  return (
    <>
    <div style={{
      backgroundColor: lightMode=="light" ? "white" : "black",
      color: lightMode=="light" ? "black" : "white",
      borderColor: lightMode=="light" ? "black" : "white"
    }}  className="relative flex-1 overflow-hidden bg-black dark:bg-[#343541]">
      {!(apiKey || serverSideApiKeyIsSet)  ? (
        <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center text-4xl font-bold text-black dark:text-white">
          Futurum One

          </div>
          <div style={{display:"flex",justifyContent:"center"}}>
            <Image width={100} style={{background:'transparent'}} height={100} src={lightMode=="light"?"/gif-black.gif":"/gif-white.gif"} alt="gif"/>
            </div>
          <div className="text-center text-lg text-black dark:text-white">
            <div className="mb-8">{`Powering the Future of Innovation`}</div>
            <div className="mb-2 font-bold">
            Embrace Futurum One, where deep AI intersects with strategic operations. We triumph in catalyzing efficiency, bolstering productivity, while preserving the human aspect.
            </div>
          </div>
          <div style={{
      backgroundColor: lightMode=="light" ? "white" : "black",
      color: lightMode=="light" ? "black" : "white",
      borderColor: lightMode=="light" ? "black" : "white"
    }} className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-2">
            We’re paving the path to the Future of Innovation, underscored by staunch adherence to HIPAA, SOP compliance, and stringent data privacy regulations.

            </div>
            <div className="mb-2">
            "Futurum One — Revolutionizing today. Shaping tomorrow."
            </div>
             {/* {user && userRole=="free" &&
            <div className=''>
            <button className='bg-gradient-to-l from-pink-500 via-blue-300 to-orange-400 text-white text-bold mt-3 bg-clip-text text-transparent text-[15px] bg-white' style={{backgroundColor:"white",padding:'10px', border:"1px solid white", borderRadius:'10px', fontWeight:'bold'}} onClick={manage}>Manage Subscription</button>
            <button className='bg-gradient-to-l from-pink-500 via-blue-300 to-orange-400 text-white text-bold mt-3 bg-clip-text text-transparent text-[15px] bg-white' style={{backgroundColor:"white",padding:'10px', border:"1px solid white", borderRadius:'10px', fontWeight:'bold'}} onClick={logout}>Logout</button>

            </div>}  */}
            
            {!user && authReady && <div className=''>
              <button className='bg-gradient-to-l from-pink-500 via-blue-300 to-orange-400 text-white text-bold mt-3 bg-clip-text text-transparent text-[15px] bg-white' style={{backgroundColor:"white",padding:'10px', border:"1px solid white", borderRadius:'10px', fontWeight:'bold'}} onClick={()=>setShowSignin(true)}>Signup / Login</button>
              </div>}
            {/* <div className="mb-2">
              {t(
                'Please set your OpenAI API key in the bottom left of the sidebar.',
              )}
            </div>
            <div>
              {t("If you don't have an OpenAI API key, you can get one here: ")}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                openai.com
              </a>
            </div> */}
          </div>
        </div>
      ) : modelError ? (
        <ErrorMessageDiv error={modelError} />
      ) : (
        <>
          <div
            className="max-h-full overflow-x-hidden"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {selectedConversation?.messages.length === 0 ? (
              <>
                {/* <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
                  <div className="text-center text-5xl font-bold text-gray-800 dark:text-gray-100">
                    {models.length === 0 ? (
                      <div>
                        <Spinner size="16px" className="mx-auto" />
                      </div>
                    ) : (
                      'Futurum One'
                    )}
                  </div>

                  {models.length > 0 && (
                    <div className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
                      <ModelSelect />

                      <SystemPrompt
                        conversation={selectedConversation}
                        prompts={prompts}
                        onChangePrompt={(prompt) =>
                          handleUpdateConversation(selectedConversation, {
                            key: 'prompt',
                            value: prompt,
                          })
                        }
                      />

                      <TemperatureSlider
                        label={t('Communication Style')}
                        onChangeTemperature={(temperature) =>
                          handleUpdateConversation(selectedConversation, {
                            key: 'temperature',
                            value: temperature,
                          })
                        }
                      />
                    </div>
                  )}
                </div> */}
              </>
            ) : (
              <>
                {/* <div style={{
      backgroundColor: lightMode=="light" ? "white" : "black",
      color: lightMode=="light" ? "black" : "white",
    }} className="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                  {t('Model')}: {selectedConversation?.model.name} | {t('Temp')}
                  : {selectedConversation?.temperature} |
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={handleSettings}
                  >
                    <IconSettings size={18} />
                  </button>
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={onClearAll}
                  >
                    <IconClearAll size={18} />
                  </button>
                </div> */}
                {showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                      <ModelSelect />
                    </div>
                  </div>
                )}

                {selectedConversation?.messages.map((message, index) => (
                  <MemoizedChatMessage
                    key={index}
                    message={message}
                    messageIndex={index}
                    onEdit={(editedMessage) => {
                      setCurrentMessage(editedMessage);
                      // discard edited message and the ones that come after then resend
                      handleSend(
                        editedMessage,
                        selectedConversation?.messages.length - index,
                      );
                    }}
                  />
                ))}

                {loading && <ChatLoader />}

                <div
                 style={{
                  backgroundColor: lightMode=="light" ? "white" : "black",
                  color: lightMode=="light" ? "black" : "white",
                }} 
                  className="h-[162px] bg-white dark:bg-[#343541]"
                  ref={messagesEndRef}
                />
              </>
            )}
          </div>

          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            onSend={(message, plugin) => {
              setCurrentMessage(message);
              handleSend(message, 0, plugin);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={() => {
              if (currentMessage) {
                handleSend(currentMessage, 2, null);
              }
            }}
            showScrollDownButton={showScrollDownButton}
          />
        </>
      )}
    </div>
 {showSignin && !user &&
    <div  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
style={{
  backgroundColor: lightMode=="light" ? "white" : "black",
  color: lightMode=="light" ? "black" : "white",
  borderColor: lightMode=="light" ? "black" : "white"
}}              
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-lg pb-4 font-bold text-center text-black dark:text-neutral-200">
            {toggleAction=='login' && t('Login')}
              {toggleAction=='signup' && t('Signup')}
              {toggleAction=='reset' && t('Forgot Password')}
            </div>
            <div className='flex justify-center'>
            <form className='w-4/5'  onSubmit={toggleAction=='login'?handleLogin:toggleAction=='signup'?handleSignup:handleReset} style={{
  backgroundColor: lightMode=="light" ? "white" : "black",
  color: lightMode=="light" ? "white" : "black",
  borderColor: lightMode=="light" ? "black" : "white"
}} >
              {toggleAction=='signup' &&  <><label>Username:</label><br/>
              <input required minLength={6} placeholder='enter username' name='username' value={inputValues.username} onChange={handleChange} className='p-2 rounded mb-2 w-full' type="text" /><br/></>}
              <label>Email:</label><br/>
              <input required minLength={2} placeholder='enter email' name="email" value={inputValues.email} onChange={handleChange} className='p-2 rounded mb-2 w-full' type="email" /><br/>
             {(toggleAction=='login' || toggleAction=='signup') && <> <label>Password:</label><br/>
              <input required minLength={6} placeholder='enter password' name="password" value={inputValues.password} onChange={handleChange} className='p-2 rounded w-full' type='password'/></>}
              {loadingResponse && <div className="h-4 w-4 mt-5 mx-auto animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>}
              {error.length>0 && <p className='pt-3 w-full text-center' style={{
                backgroundColor: lightMode=="light" ? "white" : "black",
                color: lightMode=="light" ? "black" : "white",
                borderColor: lightMode=="light" ? "black" : "white"
              }}>{error}</p>}
                 <div style={{
                  flexDirection:toggleAction=='reset'?'row':'column',
                  justifyContent:toggleAction=='reset'?'space-evenly':'center',
                  alignItems:'center'
                 }} className='w-full flex items-center flex-col justify-center '>
            <button
              type="submit"
              className="w-2/5 text-center px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
             
            >
              {toggleAction=='login' && t('Login')}
              {toggleAction=='signup' && t('Signup')}
              {toggleAction=='reset' && t('Forgot Password')}


            </button>
            <div style={{
              width:toggleAction=='reset'?'15%':'60%'
            }} className='w-3/5 flex justify-around mt-3 '>
            <button
            style={{
              backgroundColor: lightMode=="light" ? "white" : "black",
              color: lightMode=="light" ? "black" : "white",
              borderColor: lightMode=="light" ? "black" : "white"
            }} 
            onClick={(e)=>{
              e.preventDefault()
              if(toggleAction=='login'){
                setToggleAction('signup')
              }
              else{
                setToggleAction('login')

              }
            }} className='ml-5 underline'>
              {toggleAction=='login'?'Signup':'Login'}
            </button>
          {toggleAction!='reset' &&  <button
            style={{
              backgroundColor: lightMode=="light" ? "white" : "black",
              color: lightMode=="light" ? "black" : "white",
              borderColor: lightMode=="light" ? "black" : "white"
            }} 
            onClick={(e)=>{
              e.preventDefault()
              setToggleAction('reset')
            }} className='ml-5 underline'>
              {'Forgot Password?'}
            </button>}
            </div>
            </div>
            </form>

            </div>
            

          
          </div>
        </div>
      </div>
    </div>}
    </>

  );
});
Chat.displayName = 'Chat';
