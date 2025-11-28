import React, { CSSProperties } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import { Case } from '../../types'
import { CardPoster } from './CardPoster'

interface VirtualizedGridProps {
  items: Case[]
  onItemClick: (item: Case) => void
  columns?: number
  itemHeight?: number
  containerHeight?: number
  containerWidth?: number
  gap?: number
  renderItem?: (item: Case, style: CSSProperties) => React.ReactNode
}

/**
 * Виртуализированная сетка для отображения больших списков кейсов
 * Рендерит только видимые элементы, что значительно улучшает производительность
 */
export const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({
  items,
  onItemClick,
  columns = 3,
  itemHeight = 200,
  containerHeight = 600,
  containerWidth = window.innerWidth,
  gap = 12,
  renderItem,
}) => {
  const rowCount = Math.ceil(items.length / columns)
  const actualItemWidth = (containerWidth - gap * (columns + 1)) / columns

  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: CSSProperties }) => {
    const index = rowIndex * columns + columnIndex
    const item = items[index]

    if (!item) {
      return <div style={style} />
    }

    const cellStyle: CSSProperties = {
      ...style,
      left: typeof style.left === 'number' ? style.left + gap : style.left,
      top: typeof style.top === 'number' ? style.top + gap : style.top,
      width: actualItemWidth,
      height: itemHeight - gap,
    }

    if (renderItem) {
      return (
        <div style={cellStyle}>
          {renderItem(item, cellStyle)}
        </div>
      )
    }

    // Default render with CardPoster
    return (
      <div style={cellStyle} className="cursor-pointer">
        <CardPoster
          movie={item}
          onClick={() => onItemClick(item)}
          size="sm"
        />
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <Grid
      columnCount={columns}
      columnWidth={actualItemWidth + gap}
      height={containerHeight}
      rowCount={rowCount}
      rowHeight={itemHeight}
      width={containerWidth}
      style={{ overflowX: 'hidden' }}
    >
      {Cell}
    </Grid>
  )
}

