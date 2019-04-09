import * as React from 'react'
import { TouchableHighlight } from 'react-native'
import { Icon, Theme } from '@kancha'

interface CheckboxProps {
  /**
   * The item is selected
   */
  selected?: boolean

  /**
   * A function to toggle the selected value
   */
  toggleSelect?: (selected: boolean) => void

  /**
   * A testID for the button
   */
  testID?: string
}

const Checkbox: React.FC<CheckboxProps> = ({ selected, toggleSelect, testID }) => {
  return (
    <TouchableHighlight
      underlayColor={'transparent'}
      onPress={toggleSelect ? () => toggleSelect(!selected) : () => ''}
      testID={testID}
    >
      <Icon
        size={40}
        color={selected ? Theme.colors.primary.brand : Theme.colors.primary.accessories}
        name={selected ? 'checkbox_checked' : 'checkbox_empty'}
      />
    </TouchableHighlight>
  )
}

export default Checkbox
