import { useState, useRef } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

export function TagInput({ tags, onChange, suggestions = [], placeholder = 'Add tag...' }: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = suggestions
    .filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s))
    .slice(0, 5)

  const isExpanded = showSuggestions && filtered.length > 0

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
    setShowSuggestions(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && isExpanded) {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % filtered.length)
    } else if (e.key === 'ArrowUp' && isExpanded) {
      e.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        addTag(filtered[activeIndex])
      } else if (input.trim()) {
        addTag(input)
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setShowSuggestions(true)
    setActiveIndex(-1)
  }

  return (
    <div className="relative" role="combobox" aria-expanded={isExpanded} aria-haspopup="listbox">
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[38px] items-center">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`} className="p-1 hover:text-emerald-900 dark:hover:text-emerald-200">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          role="combobox"
          aria-autocomplete="list"
          aria-controls="tag-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `tag-suggestion-${activeIndex}` : undefined}
          className="flex-1 min-w-[80px] text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
        />
      </div>
      {isExpanded && (
        <div
          id="tag-suggestions"
          role="listbox"
          className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
        >
          {filtered.map((s, index) => (
            <button
              key={s}
              type="button"
              role="option"
              id={`tag-suggestion-${index}`}
              aria-selected={index === activeIndex}
              onMouseDown={() => addTag(s)}
              className={`w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 ${
                index === activeIndex
                  ? 'bg-slate-100 dark:bg-slate-700'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
