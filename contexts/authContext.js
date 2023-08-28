import { createContext, useState, useEffect } from "react";
import netlifyIdentity from "netlify-identity-widget";
import axios from 'axios'
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  authReady: false,
  userRole:null
});

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole,setUserRole]=useState(null)

  function test(config){
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
const callFunction=async(email,name)=>{
  try {
    console.log(name)
    console.log(email)
    console.log(process.env.NEXT_PUBLIC_CREATE_SUBSCRIPTION)
    // const response = await axios.post(`${process.env.NEXT_PUBLIC_CREATE_SUBSCRIPTION}`, {
    //   email,
    //   name
  
    // });
    const config = {
      method: 'post',
      url: process.env.NEXT_PUBLIC_CREATE_SUBSCRIPTION,
      body:{
        email, name
      }
    };
    const response=await test(config)

    
      console.log(response);
      setUserRole(response?.data?.userRole)
    
  } catch (error) {
    console.log(error)
    console.log("An error occurred");
  }
}
  useEffect(() => {
      // on login
    netlifyIdentity.on("login", (user) => {
      setUser(user);
      console.log(user)
      callFunction(user.email,user.user_metadata.full_name)
    
      netlifyIdentity.close();
    });

    // on logout
    netlifyIdentity.on("logout", (user) => {
      setUser(null);
    });


    // connect with Netlify Identity
    netlifyIdentity.init();
  }, []);

  const login = () => {
    netlifyIdentity.open();
  };


  const logout = () => {
    netlifyIdentity.logout();
  };


  const context = {
    login,
    logout,
    user,
    userRole
  };


  return (
    <AuthContext.Provider value={context}>
    {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;