import { useCallback, useEffect, useState } from 'react'

export type ReadingStatus = 'want-to-read' | 'reading' | 'finished'

export interface Book {
  id: string
  title: string
  status: ReadingStatus
  addedAt: number
}

const STORAGE_KEY = 'reading-list-books'

const STATUS_LABELS: Record<ReadingStatus, string> = {
  'want-to-read': 'Want to Read',
  reading: 'Reading',
  finished: 'Finished',
}

const STATUS_ORDER: ReadingStatus[] = ['want-to-read', 'reading', 'finished']

export const MAX_TITLE_LENGTH = 60

export type AddBookResult =
  | { ok: true }
  | { ok: false; error: 'duplicate' | 'too-long' }

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (b): b is Book =>
        b &&
        typeof b.id === 'string' &&
        typeof b.title === 'string' &&
        typeof b.status === 'string' &&
        STATUS_ORDER.includes(b.status),
    )
  } catch {
    return []
  }
}

export function useReadingList() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
    } catch {
      /* storage full or unavailable — silently ignore */
    }
  }, [books])

  const addBook = useCallback(
    (title: string, status: ReadingStatus): AddBookResult => {
      const trimmed = title.trim().replace(/\s+/g, ' ')
      if (!trimmed) return { ok: false, error: 'too-long' }

      const exists = books.some(
        (b) => b.title.trim().replace(/\s+/g, ' ').toLowerCase() === trimmed.toLowerCase(),
      )
      if (exists) return { ok: false, error: 'duplicate' }

      setBooks((prev) => [
        {
          id: crypto.randomUUID(),
          title: trimmed,
          status,
          addedAt: Date.now(),
        },
        ...prev,
      ])
      return { ok: true }
    },
    [books],
  )

  const updateStatus = useCallback((id: string, status: ReadingStatus) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    )
  }, [])

  const removeBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return { books, addBook, updateStatus, removeBook, STATUS_LABELS, STATUS_ORDER }
}
