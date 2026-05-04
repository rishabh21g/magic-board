import React, { createContext, useContext, useState, useEffect } from "react"
import { generateUUID } from "../src/lib/uuid"

type UserContextType = {
  userID: string
  userName: string
  setUserName: (name: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userID, setUserID] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    let id = localStorage.getItem("userID")
    if (!id) {
      id = generateUUID()
      localStorage.setItem("userID", id)
    }
    setUserID(id)

    const name = localStorage.getItem("userName") || ""
    setUserName(name)
  }, [])

  // Persist userName changes
  useEffect(() => {
    if (userName) localStorage.setItem("userName", userName)
  }, [userName])

  return (
    <UserContext.Provider value={{ userID, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  )
}

// Custom hook 
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserContextProvider")
  return ctx
}