"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SignOut() {
  useEffect(() => {
    signOut({ redirect: true, callbackUrl: "/" }); 
  }, []);

  return null;
}
