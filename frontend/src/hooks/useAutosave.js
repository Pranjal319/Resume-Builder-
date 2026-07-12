import { useState, useEffect, useRef, useCallback } from 'react'

export function useAutosave(data, onSave, delay = 1000) {
  const [status, setStatus] = useState('saved') // 'saved', 'unsaved', 'saving', 'error'
  const [lastSaved, setLastSaved] = useState(null)
  const isFirstMount = useRef(true)
  const lastSavedData = useRef(JSON.stringify(data))
  const timeoutRef = useRef(null)

  const executeSave = useCallback(async (dataToSave) => {
    setStatus('saving')
    try {
      await onSave(dataToSave)
      lastSavedData.current = JSON.stringify(dataToSave)
      setStatus('saved')
      setLastSaved(new Date())
    } catch (err) {
      console.error('Autosave failed:', err)
      setStatus('error')
    }
  }, [onSave])

  useEffect(() => {
    // Avoid saving on initial mount
    if (isFirstMount.current) {
      isFirstMount.current = false
      lastSavedData.current = JSON.stringify(data)
      return
    }

    const currentString = JSON.stringify(data)
    if (currentString === lastSavedData.current) {
      return
    }

    setStatus('unsaved')

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      executeSave(data)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, executeSave])

  const saveNow = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await executeSave(data)
  }

  return { status, lastSaved, saveNow }
}
