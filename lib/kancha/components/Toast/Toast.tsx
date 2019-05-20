import * as React from 'react'
import { Container, Text, Theme, Toaster } from '@kancha'

enum ToastType {
  info,
  confirm,
  warn,
  default,
}

interface ToastProps {
  message: string
  type: 'info' | 'confirm' | 'warn' | 'default'
  timeout: number
}

const Toast: React.FC<ToastProps> = props => {
  setTimeout(() => {
    Toaster.hide()
  }, 3000)

  return (
    <Container background={'confirm'} h={140} justifyContent={'center'} padding>
      <Text textColor={'white'}>{props.message}</Text>
    </Container>
  )
}

export default Toast
