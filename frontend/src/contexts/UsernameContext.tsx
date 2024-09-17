import { createContext, useContext } from "react"

// useContext used to keep track of if the user is currently logged in
// and what their username is

interface unContent {
  username: string;
  setUsername:(c: string) => void;
}

export const UsernameContext = createContext<unContent>({
  username: '',
  setUsername: () => {},
})

export const useGlobalContext = () => useContext(UsernameContext)
