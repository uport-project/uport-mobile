import * as React from 'react'
import { Container, Text, Banner, RequestContent } from '@kancha'

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
  createKeys: boolean
  content: RequestContent[]
  currentIdentity: string
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
        {this.props.loading ? (
          /**
           * Main loading screen view when the request is not ready to interact with
           */
          <Container />
        ) : (
          <Container />
        )}
      </Container>
    )
  }
}

export default Request
