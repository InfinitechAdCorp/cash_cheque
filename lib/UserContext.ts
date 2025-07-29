"use client"

import type React from "react"

import { createContext } from "react"

export const UserContext = createContext<[any, React.Dispatch<React.SetStateAction<any>>] | null>(null)
