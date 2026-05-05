import { memo } from 'react'
import { useCategoryStore } from '../../store/categoryStore'
import type { CategoryId } from '../../types'

interface CategoryBadgeProps {
  category: CategoryId
  size?: 'sm' | 'md'
}

export const CategoryBadge = memo(function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const categories = useCategoryStore((s) => s.categories)
  const cat = categories.find((c) => c.id === category)
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  if (!cat) {
    return (
      <span className={`inline-flex items-center rounded-full font-medium ${padding} bg-slate-100 dark:bg-slate-800 text-slate-500`}>
        {category}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${padding}`}
      style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
    >
      {cat.label}
    </span>
  )
})
