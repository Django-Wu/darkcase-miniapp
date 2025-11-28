import React, { CSSProperties } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Case } from '../../types'
import { CardPoster } from './CardPoster'

interface VirtualizedListProps {
  items: Case[]
  onItemClick: (item: Case) => void
  itemWidth?: number
  itemHeight?: number
  containerHeight?: number
  containerWidth?: number
  gap?: number
  direction?: 'horizontal' | 'vertical'
  renderItem?: (item: Case, style: CSSProperties) => React.ReactNode
}

/**
 * Виртуализированный список для отображения больших горизонтальных или вертикальных списков
 * Рендерит только видимые элементы
 */
export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  onItemClick,
  itemWidth = 128,
  itemHeight = 192,
  containerHeight = 200,
  containerWidth = window.innerWidth,
  gap = 12,
  direction = 'horizontal',
  renderItem,
}) => {
  const isHorizontal = direction === 'horizontal'

  const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const item = items[index]

    if (!item) {
      return <div style={style} />
    }

    const itemStyle: CSSProperties = {
      ...style,
      ...(isHorizontal
        ? {
            width: itemWidth,
            marginRight: gap,
          }
        : {
            height: itemHeight,
            marginBottom: gap,
          }),
    }

    if (renderItem) {
      return (
        <div style={itemStyle}>
          {renderItem(item, itemStyle)}
        </div>
      )
    }

    // Default render with CardPoster
    return (
      <div style={itemStyle} className="cursor-pointer flex-shrink-0">
        <CardPoster
          movie={item}
          onClick={() => onItemClick(item)}
          size="md"
        />
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <List
      height={isHorizontal ? containerHeight : containerHeight}
      itemCount={items.length}
      itemSize={isHorizontal ? itemWidth + gap : itemHeight + gap}
      layout={isHorizontal ? 'horizontal' : 'vertical'}
      width={containerWidth}
      style={{ overflowX: isHorizontal ? 'auto' : 'hidden', overflowY: isHorizontal ? 'hidden' : 'auto' }}
    >
      {Row}
    </List>
  )
}

