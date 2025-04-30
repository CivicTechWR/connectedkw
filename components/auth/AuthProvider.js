"use client"
import Validate from "utils/auth/validate"
import { SessionProvider } from "next-auth/react"

export default function AuthProvider({
  session,
  children,
}) {
  return (
    <SessionProvider session={session}>
      <Validate>
        {children}
      </Validate>
    </SessionProvider>
  )
}