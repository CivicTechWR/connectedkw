import { getServerSession } from "next-auth/next"

import { options } from "./options"

export async function getUser() {
  const session = await getServerSession(options)

  if (session?.expires < Date.now()) {
    return null
  }

  if (session?.error) {
    return null
  }

  return session?.user
}
