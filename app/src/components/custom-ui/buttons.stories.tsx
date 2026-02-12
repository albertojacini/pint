import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Heart, Star, Share, Download, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LoadingButton,
  IconButton,
  FilterButton,
  ButtonGroup,
  ToggleButtonGroup,
} from './buttons'

const meta: Meta = {
  title: 'Custom-UI/Buttons',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// LoadingButton stories
export const Loading: StoryObj<typeof LoadingButton> = {
  render: () => (
    <div className="flex gap-4">
      <LoadingButton>Not Loading</LoadingButton>
      <LoadingButton loading>Loading</LoadingButton>
      <LoadingButton loading loadingText="Saving...">
        Save
      </LoadingButton>
    </div>
  ),
}

// IconButton stories
export const IconButtons: StoryObj<typeof IconButton> = {
  render: () => (
    <div className="flex gap-4 items-center">
      <IconButton icon={<Heart className="h-4 w-4" />} />
      <IconButton icon={<Star className="h-4 w-4" />} />
      <IconButton icon={<Share className="h-4 w-4" />} label="Share" />
      <IconButton icon={<Download className="h-4 w-4" />} label="Download" />
    </div>
  ),
}

// FilterButton stories
export const FilterButtons: StoryObj<typeof FilterButton> = {
  render: () => (
    <div className="flex gap-2">
      <FilterButton selected>Selected</FilterButton>
      <FilterButton>Not Selected</FilterButton>
      <FilterButton>Another</FilterButton>
      <FilterButton selected>Also Selected</FilterButton>
    </div>
  ),
}

// ButtonGroup stories
export const ButtonGroups: StoryObj<typeof ButtonGroup> = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Horizontal</p>
        <ButtonGroup>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Vertical</p>
        <ButtonGroup orientation="vertical">
          <Button variant="outline">Top</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
}

// ToggleButtonGroup stories
export const ToggleButtonGroups: StoryObj<typeof ToggleButtonGroup<string>> = {
  render: function Render() {
    const [view, setView] = useState('grid')

    return (
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          value={view}
          onChange={setView}
          options={[
            { value: 'grid', label: 'Grid', icon: <Grid className="h-4 w-4" /> },
            { value: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
          ]}
        />
        <p className="text-sm text-muted-foreground">Selected: {view}</p>
      </div>
    )
  },
}
