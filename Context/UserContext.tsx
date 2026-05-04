import React, { createContext, useContext, useState, useEffect } from "react"
import { generateUUID } from "../src/lib/uuid"

type UserContextType = {
  userID: string
  userName: string
  setUserName: (name: string) => void
  userColor: string
  setUserColor: (color: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userID, setUserID] = useState("")
  const [userName, setUserName] = useState("")
  const [userColor, setUserColor] = useState("") // was "false"

  useEffect(() => {
    let id = localStorage.getItem("userID")
    if (!id) {
      id = generateUUID()
      localStorage.setItem("userID", id)
    }
    setUserID(id)

    setUserName(localStorage.getItem("userName") ?? "")
    setUserColor(localStorage.getItem("userColor") ?? "")
  }, [])

  useEffect(() => {
    localStorage.setItem("userName", userName) 
  }, [userName])

  useEffect(() => {
    localStorage.setItem("userColor", userColor) 
  }, [userColor])

  return (
    <UserContext.Provider value={{ userID, userName, setUserName, userColor, setUserColor }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserContextProvider")
  return ctx
}