import * as React from 'react'

interface RequestTransformProps {}

const RequestTransform = <P extends object>(RequestComponent: React.ComponentType<P>) => {
  return class extends React.Component<P & RequestTransformProps> {
    render() {
      return <RequestComponent {...this.props as P} />
    }
  }
}

export default RequestTransform
