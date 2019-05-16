import * as React from 'react'
import { connect } from 'react-redux'

/**
 * The only request related component that needs to be connected to Redux
 * This HOC should take data from redux and format it in the typed Request shape
 */
interface RequestTransformProps {}

const RequestTransform = <P extends object>(RequestComponent: React.ComponentType<P>) => {
  return class extends React.Component<P & RequestTransformProps> {
    render() {
      return <RequestComponent {...this.props as P} />
    }
  }
}

export default RequestTransform
