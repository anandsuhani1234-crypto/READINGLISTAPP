import { useMemo, useState } from 'react'
import { BookPlus, Trash2, Library } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  useReadingList,
  type ReadingStatus,
  MAX_TITLE_LENGTH,
} from '@/hooks/use-reading-list'

type FilterValue = ReadingStatus | 'all'

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
]

const STATUS_DOT: Record<ReadingStatus, string> = {
  'want-to-read': 'bg-amber-500',
  reading: 'bg-sky-500',
  finished: 'bg-emerald-500',
}

export default function ReadingList() {
  const { books, addBook, updateStatus, removeBook, STATUS_LABELS, STATUS_ORDER } =
    useReadingList()

  const [titleInput, setTitleInput] = useState('')
  const [statusInput, setStatusInput] = useState<ReadingStatus>('want-to-read')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [error, setError] = useState<string | null>(null)

  const visibleBooks = useMemo(() => {
    if (filter === 'all') return books
    return books.filter((b) => b.status === filter)
  }, [books, filter])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: books.length }
    for (const s of STATUS_ORDER) {
      map[s] = books.filter((b) => b.status === s).length
    }
    return map
  }, [books, STATUS_ORDER])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = titleInput.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError('Book title must be 60 characters or fewer.')
      return
    }
    const result = addBook(trimmed, statusInput)
    if (!result.ok) {
      setError(
        result.error === 'duplicate'
          ? 'This book is already in your reading list.'
          : 'Book title must be 60 characters or fewer.',
      )
      return
    }
    setError(null)
    setTitleInput('')
    setStatusInput('want-to-read')
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="mx-auto max-w-2xl px-5 pt-16 pb-8 text-center sm:pt-24">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-sand/60">
          <Library className="size-6 text-bark" />
        </div>
        <h1 className="font-display text-3xl font-light text-ink sm:text-4xl">
          Reading List
        </h1>
        <p className="mt-3 text-sm font-light text-bark sm:text-base">
          Track books you want to read, are reading, or have finished.
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24">
        {/* Add book form */}
        <form
          onSubmit={handleAdd}
          className="mb-8 rounded-2xl border border-sand/70 bg-linen/80 p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={titleInput}
              onChange={(e) => {
                setTitleInput(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Enter a book title…"
              aria-label="Book title"
              maxLength={MAX_TITLE_LENGTH}
              className="h-11 flex-1 bg-white/70"
            />
            <Select
              value={statusInput}
              onValueChange={(v) => setStatusInput(v as ReadingStatus)}
            >
              <SelectTrigger
                aria-label="Reading status"
                className="h-11 w-full bg-white/70 sm:w-[170px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      <span className={cn('size-2 rounded-full', STATUS_DOT[s])} />
                      {STATUS_LABELS[s]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="lg" className="h-11 sm:px-5">
              <BookPlus className="size-4" />
              Add
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
          )}
        </form>

        {/* Filter tabs */}
        {books.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                  filter === opt.value
                    ? 'border-ink bg-ink text-paper'
                    : 'border-sand/70 bg-transparent text-bark hover:bg-sand/40',
                )}
              >
                {opt.label}
                <span
                  className={cn(
                    'ml-1.5 tabular-nums',
                    filter === opt.value ? 'text-paper/60' : 'text-mist',
                  )}
                >
                  {counts[opt.value]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Summary */}
        {books.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-sand/70 bg-linen/80 px-4 py-3 text-center shadow-sm">
              <p className="font-display text-2xl font-light text-ink">{books.length}</p>
              <p className="mt-0.5 text-xs font-light text-bark">Total Books</p>
            </div>
            <div className="rounded-xl border border-sand/70 bg-linen/80 px-4 py-3 text-center shadow-sm">
              <p className="font-display text-2xl font-light text-ink">{counts.reading}</p>
              <p className="mt-0.5 text-xs font-light text-bark">Currently Reading</p>
            </div>
            <div className="rounded-xl border border-sand/70 bg-linen/80 px-4 py-3 text-center shadow-sm">
              <p className="font-display text-2xl font-light text-ink">{counts.finished}</p>
              <p className="mt-0.5 text-xs font-light text-bark">Finished</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand/80 bg-linen/50 px-6 py-20 text-center">
            <Library className="mb-4 size-8 text-clay" />
            <p className="max-w-xs text-sm font-light leading-relaxed text-bark">
              Your reading list is empty. Add your first book.
            </p>
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand/80 bg-linen/50 px-6 py-16 text-center">
            <p className="text-sm font-light text-bark">
              No books in this category yet.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibleBooks.map((book) => (
              <li
                key={book.id}
                className="group flex flex-col gap-3 rounded-xl border border-sand/70 bg-linen/80 p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        'mt-1.5 size-2.5 shrink-0 rounded-full',
                        STATUS_DOT[book.status],
                      )}
                    />
                    <h3 className="text-sm font-medium leading-snug text-ink">
                      {book.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => removeBook(book.id)}
                    aria-label={`Remove ${book.title}`}
                    className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-mist transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>

                <Select
                  value={book.status}
                  onValueChange={(v) => updateStatus(book.id, v as ReadingStatus)}
                >
                  <SelectTrigger
                    aria-label={`Status for ${book.title}`}
                    className="h-8 w-full bg-white/60 text-xs"
                    size="sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn('size-2 rounded-full', STATUS_DOT[s])}
                          />
                          {STATUS_LABELS[s]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
