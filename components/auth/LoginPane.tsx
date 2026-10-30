"use client"

import { LoginForm } from "./LoginForm"

interface LoginPaneProps {
  returnUrl?: string
  showRepLink?: boolean
}

export function LoginPane({ returnUrl, showRepLink }: LoginPaneProps) {
  return <LoginForm returnUrl={returnUrl} showRepLink={showRepLink} />
}
