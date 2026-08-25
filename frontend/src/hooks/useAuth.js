import {
  useEffect,
  useState,
} from 'react'

import {
  getAuthProvider,
  isLoggedIn,
  subscribeAuthChange,
} from '../utils/token'


function useAuth() {
  const [
    loggedIn,
    setLoggedIn,
  ] = useState(
    isLoggedIn(),
  )

  const [
    provider,
    setProvider,
  ] = useState(
    getAuthProvider(),
  )


  useEffect(() => {
    const updateAuthState = () => {
      setLoggedIn(
        isLoggedIn(),
      )

      setProvider(
        getAuthProvider(),
      )
    }

    return subscribeAuthChange(
      updateAuthState,
    )
  }, [])


  return {
    loggedIn,
    provider,
  }
}


export default useAuth