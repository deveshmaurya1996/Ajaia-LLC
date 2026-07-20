"use client"

import debounce from "lodash/debounce"
import { useEffect, useMemo, useRef } from "react"

export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delayMs: number,
) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debounced = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callbackRef.current(...args)
      }, delayMs),
    [delayMs],
  )

  useEffect(() => () => debounced.cancel(), [debounced])

  return debounced
}
