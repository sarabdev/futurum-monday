import { createContext, useState, useEffect,useContext } from "react";
import netlifyIdentity from "netlify-identity-widget";
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/clerk-react";

import axios from 'axios'
import { validate } from "uuid";
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  authReady: false,
  userRole:null,
  token:null,
  setToken:(token)=>{},
});

const AuthContextProvider = ({ children }) => {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // const [user, setUser] = useState(null);
  const [authReady,setAuthReady]=useState(true)
  const [token,setToken]=useState(null)
  const [userRole,setUserRole]=useState(null)
  function test(config){
    return axios(config).then(response => {
      return {
        statusCode: 200,
        body: JSON.stringify(response.data)
      }
    }).catch(error => {
      //console.log(error)
      return {
        statusCode: 422,
        body: `Error: ${error}`,
      }
    })
  }

  useEffect(()=>{
    // console.log(userId)
    // console.log(user)
    // if(userId)
    // console.log(user)
    //setUser(true)
  },[userId])
const callFunction=async(email,name)=>{
  try {
  
    // const response = await axios.post(`${process.env.NEXT_PUBLIC_CREATE_SUBSCRIPTION}`, {
    //   email,
    //   name
  
    // });
    const config = {
      method: 'get',
      url: `${process.env.NEXT_PUBLIC_CREATE_SUBSCRIPTION}?email=${email}&name=${name}`,
     
    };
    const response=await test(config)

    
      const result=JSON.parse(response.body);
      setUserRole(result?.userRole)
    
  } catch (error) {
    // console.log("An error occurred");
  }
}

  async function validateUser(){
    // console.log("Validating")
    let tokenExist=JSON.parse(localStorage.getItem('token'))
    let userExist=JSON.parse(localStorage.getItem('user'))

    if(!tokenExist){
    //  setUser(null)
      setToken(null)
      localStorage.removeItem('user')
    localStorage.removeItem('token')
    setAuthReady(true)

    return
    }
    const controller = new AbortController();
    const response = await fetch('/api/validateToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body:JSON.stringify({
        token:tokenExist,
      })

      
    });
    const result=await response.json()
    if(result.error){
      //setUser(null)
      setToken(null)
      localStorage.removeItem('user')
    localStorage.removeItem('token')
    setAuthReady(true)

    return
    }
     //setUser(userExist)
     setToken(tokenExist)
     setAuthReady(true)
   }
  useEffect(() => {
     //validateUser()
  }, []);

  const login = () => {
    netlifyIdentity.open();
  };


  const logout = () => {
  //  setUser(null)
    setToken(null)
    signOut()
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  };


  const context = {
    login,
    logout,
    user,
    userRole,
    //setUser,
    token,
    setToken,
    authReady
  };


  return (
    <AuthContext.Provider value={context}>
    {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;