"use client"
import React, {useContext, useEffect,useState} from 'react'
import { useRouter } from 'next/router'
import HomeContext from './api/home/home.context';
import { useTranslation } from 'react-i18next';

function PasswordReset(){
    const { t } = useTranslation('sidebar');

    let lightMode = 'dark'; // Define a default theme
   const [inputValues,setInputValues]=useState({
        newPassword:'',
        confirmNewPassword:''
      })

      const [loadingResponse,setLoadingResponse]=useState(false)
      const [error,setError]=useState('')
    const router = useRouter();
    let { token } = router.query;
   
 useEffect(()=>{
    
    const settings = localStorage.getItem('settings');
    
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      
      // Ensure theme is available in parsed settings
      if (parsedSettings && parsedSettings.theme) {
        lightMode = parsedSettings.theme;
      }
    } 
 },[])

const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
     const key=e.target.name;
     const value=e.target.value;
     setInputValues({
      ...inputValues,
      [key]:value
     })
  }

  const handlePasswordChange=async(e:React.SyntheticEvent)=>{
    e.preventDefault()
    setError('')
    if(inputValues.newPassword!==inputValues.confirmNewPassword){
      setError('Both password fields should match.')
      return
    }

    setLoadingResponse(true)
    const controller = new AbortController();
    const response = await fetch('/api/changePassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body:JSON.stringify({
        password:inputValues.newPassword,
        token:token
      })

      
    });
    const result=await response.json()
    setInputValues({
        newPassword:'',
        confirmNewPassword:''
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

    
    return (
         
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
              <div className="text-lg pb-4 font-bold text-center dark:text-neutral-200">
              {t('Change Password')}
              </div>
              <div className='flex justify-center'>
              <form className='w-4/5' onSubmit={handlePasswordChange}   style={{
    backgroundColor: lightMode=="light" ? "white" : "black",
    color: lightMode=="light" ? "white" : "black",
    borderColor: lightMode=="light" ? "black" : "white"
  }} >
                
                <label>New Password:</label><br/>
                <input required minLength={6} placeholder='enter new password' name="newPassword" value={inputValues.newPassword} onChange={handleChange} className='p-2 rounded mb-2 w-full' type="password" /><br/>
                <label>Confirm New Password:</label><br/>
                <input required minLength={6} placeholder='confirm new password' name="confirmNewPassword" value={inputValues.confirmNewPassword} onChange={handleChange} className='p-2 rounded w-full' type='password'/>
                {loadingResponse && <div
                style={{
                  backgroundColor: lightMode=="light" ? "white" : "black",
                  color: lightMode=="light" ? "black" : "white",
                  borderColor: lightMode=="light" ? "black" : "white"
                }} className="h-4 w-4 mt-5 mx-auto animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>}
                {error.length>0 && <p className='pt-3 w-full text-center' style={{
                  backgroundColor: lightMode=="light" ? "white" : "black",
                  color: lightMode=="light" ? "black" : "white",
                  borderColor: lightMode=="light" ? "black" : "white"
                }}>{error}</p>}
                   <div className='w-full flex justify-center items-baseline'>
              <button
                type="submit"
                style={{
                backgroundColor: lightMode=="light" ? "white" : "black",
                color: lightMode=="light" ? "black" : "white",
                borderColor: lightMode=="light" ? "black" : "white"}}
                className="w-3/5 text-center px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
               
              >
                {t('Change Password')}
              </button>
              <button
            style={{
              backgroundColor: lightMode=="light" ? "white" : "black",
              color: lightMode=="light" ? "black" : "white",
              borderColor: lightMode=="light" ? "black" : "white"
            }} 
            onClick={(e)=>{
              e.preventDefault()
             router.push('/')
            }} className='ml-5 underline'>
              {'Login'}
            </button>
            
              </div>
              </form>
  
              </div>
              
  
            
            </div>
          </div>
        </div>
      </div>
    )
    
  
}

export default PasswordReset