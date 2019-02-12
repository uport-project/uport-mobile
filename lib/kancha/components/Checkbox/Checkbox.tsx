import * as React from 'react'
import { Button, Icon, Theme } from '@kancha'

interface CheckboxProps {
  selected?: boolean
  toggleSelect?: (selected: boolean) => void
}

const Checkbox: React.FC<CheckboxProps> = ({ selected, toggleSelect }) => {
  return (
    <Button
      icon={
        <Icon
          size={40}
          color={selected ? Theme.colors.primary.brand : Theme.colors.primary.accessories}
          name={selected ? 'checkbox_checked' : 'checkbox_empty'}
        />
      }
      block={Button.Block.Clear}
      onPress={toggleSelect ? () => toggleSelect(!selected) : () => ''}
    />
  )
}

export default Checkbox
