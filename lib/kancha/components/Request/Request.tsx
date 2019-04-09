import * as React from 'react'
import { Container, Text } from '@kancha'

interface RequestContent {
  /**
   * The main name in the list item
   */
  title: string
  /**
   * The secondary subtitle displayed above the title
   */
  subTitle: string
  /**
   * Not sure yet
   */
  onPress?: any
  /**
   * A source object or URL for the avatar component
   */
  avatarSource?: any
}

interface RequestProps {
  loading: boolean
  activity: string
  type: string
  actions: {
    accept: () => void
    reject: () => void
  }
  createKeys: boolean
  content: RequestContent[]
  self: {
    currentIdentity: string
  }
  initiator: {}
}
interface RequestState {}

/**
 * Request component handles the display of all  requests
 */
class Request extends React.Component<RequestProps, RequestState> {
  render() {
    return (
      <Container>
        <Text>Hello</Text>
      </Container>
    )
  }
}

export default Request
