import React from 'react'

// Minimal Dialog primitives used across the app. These are lightweight wrappers
// that provide a backdrop and centered content. They intentionally mimic the
// API shape used in the codebase: <Dialog open onOpenChange>{<DialogContent>...</DialogContent>}</Dialog>

export function Dialog({ open, onOpenChange = () => {}, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-3xl p-4">{children}</div>
    </div>
  )
}

export function DialogContent({ children, className = '' }) {
  return (
    <div className={`bg-white rounded shadow ${className}`}>{children}</div>
  )
}

export function DialogHeader({ children, className = '' }) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>
}

export function DialogTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
}

export default Dialog
