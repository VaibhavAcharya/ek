import { useCallback, useEffect, useRef, useState } from "react"

interface UseIndexedDBOptions {
  dbName: string
  storeName: string
  debounceMs: number
  initialValue?: string
}

function useDebounce<T extends (...args: never[]) => void>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  ) as T
}

export function useIndexedDB(key: string, options: UseIndexedDBOptions) {
  const { dbName, storeName, debounceMs, initialValue = "" } = options
  const [content, setContent] = useState<string>(initialValue)
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const request = indexedDB.open(dbName, 1)

    request.onerror = (event) => {
      console.error("IndexedDB error:", event)
      setError(new Error("Failed to open database"))
      setIsFetching(false)
    }

    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      db.createObjectStore(storeName, { keyPath: "key" })
    }

    return () => {
      if (db) {
        db.close()
      }
    }
  }, [dbName, storeName])

  useEffect(() => {
    if (db) {
      setIsFetching(true)
      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = (event) => {
        console.error("Error fetching data:", event)
        setError(new Error("Failed to fetch data"))
        setIsFetching(false)
      }

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result
        if (result) {
          setContent(result.content)
        } else {
          setContent(initialValue)
        }
        setIsFetching(false)
      }
    }
  }, [db, key, storeName, initialValue])

  const saveToIndexedDB = useCallback(
    (newContent: string) => {
      if (db) {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        store.put({ key, content: newContent })
      }
    },
    [db, key, storeName],
  )

  const debouncedSave = useDebounce(saveToIndexedDB, debounceMs)

  const setContentAndSave = useCallback(
    (newContent: string) => {
      setContent(newContent)
      debouncedSave(newContent)
    },
    [debouncedSave],
  )

  return { content, setContent: setContentAndSave, isFetching, error }
}
