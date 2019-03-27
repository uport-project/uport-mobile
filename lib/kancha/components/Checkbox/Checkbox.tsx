import * as React from 'react'
import { TouchableHighlight } from 'react-native'
import { Icon, Theme } from '@kancha'

interface CheckboxProps {
  selected?: boolean
  toggleSelect?: (selected: boolean) => void
}

const Checkbox: React.FC<CheckboxProps> = ({ selected, toggleSelect }) => {
  return (
    <TouchableHighlight underlayColor={'transparent'} onPress={toggleSelect ? () => toggleSelect(!selected) : () => ''}>
      <Icon
        size={40}
        color={selected ? Theme.colors.primary.brand : Theme.colors.primary.accessories}
        name={selected ? 'checkbox_checked' : 'checkbox_empty'}
      />
    </TouchableHighlight>
  )
}

export default Checkbox
