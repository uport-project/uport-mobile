import * as React from 'react'
import { Container, Button } from '@kancha'

interface NavBarProps {
  leftButtonType?: Kancha.BrandPropOptions
  leftButtonBlock?: Kancha.BlockPropsOptions
  leftButttonText?: string
  leftButtonAction: () => void
  leftButtonDisabled?: boolean

  rightButtonType?: Kancha.BrandPropOptions
  rightButtonBlock?: Kancha.BlockPropsOptions
  rightButttonText?: string
  rightButtonAction: () => void
  rightButtonDisabled?: boolean
}

const NavBar: React.FC<NavBarProps> = props => {
  return (
    <Container h={60} b={0} flexDirection={'row'} justifyContent={'space-between'} paddingLeft paddingRight>
      <Button
        type={props.leftButtonType}
        block={props.leftButtonBlock}
        buttonText={props.leftButttonText}
        onPress={props.leftButtonAction}
        disabled={props.leftButtonDisabled}
      />
      <Button
        type={props.rightButtonType}
        block={props.rightButtonBlock}
        buttonText={props.rightButttonText}
        onPress={props.rightButtonAction}
        disabled={props.rightButtonDisabled}
      />
    </Container>
  )
}

NavBar.defaultProps = {
  leftButtonType: Button.Types.Primary,
  leftButtonBlock: Button.Block.Clear,
  leftButttonText: 'Back',
  leftButtonDisabled: false,

  rightButtonType: Button.Types.Primary,
  rightButtonBlock: Button.Block.Clear,
  rightButttonText: 'Next',
  rightButtonDisabled: false,
}

export default NavBar
