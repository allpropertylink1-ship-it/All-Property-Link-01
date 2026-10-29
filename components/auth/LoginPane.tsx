"use client"

import { LoginForm } from "./LoginForm"

interface LoginPaneProps {
  returnUrl?: string
}

export function LoginPane({ returnUrl }: LoginPaneProps) {
  return <LoginForm returnUrl={returnUrl} />
}
