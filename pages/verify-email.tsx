"use client"
import React, {useContext, useEffect,useState} from 'react'
import { useRouter } from 'next/router'
import HomeContext from './api/home/home.context';
import { useTranslation } from 'react-i18next';

function VerifyEmail(){
    const { t } = useTranslation('sidebar');

    let lightMode = 'dark'; // Define a default theme
      const [loadingResponse,setLoadingResponse]=useState(true)
      const [error,setError]=useState('')
    const router = useRouter();
    let { token } = router.query;
   
 async function verifyYourEmail(){
    setLoadingResponse(true)
    const controller = new AbortController();
    const response = await fetch('/api/verifyEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body:JSON.stringify({
        token:router.query.token
      })

      
    });
    const result=await response.json()
    console.log(result)
    if(result.error){
        setLoadingResponse(false)
        setError("Token is expired or invalid.")
    }
    else{
        setLoadingResponse(false)
        setError("Email Verified! Redirecting to login page...")
        setTimeout(()=>{
            router.push('/')
        }, 2000);

    }
 }   

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
 useEffect(()=>{
    
   
    if(router.query.token)
    verifyYourEmail() 
    

 },[router.query.token])



 return (
    <div  style={{
        backgroundColor: lightMode=="light" ? "white" : "black",
        color: lightMode=="light" ? "black" : "white",
        borderColor: lightMode=="light" ? "black" : "white"
      }}  className='w-full text-center mt-4'>
    {(loadingResponse || !token)?<p>Verifying...</p>:<p>{error}</p>}
    </div>
 )
}

export default VerifyEmail