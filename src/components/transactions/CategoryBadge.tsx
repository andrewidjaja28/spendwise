import { CATEGORY_MAP } from '../../constants/categories'
import type { CategoryId } from '../../types'

interface CategoryBadgeProps {
  category: CategoryId
  size?: 'sm' | 'md'
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const cat = CATEGORY_MAP[category]
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${padding}`}
      style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
    >
      {cat.label}
    </span>
  )
}
