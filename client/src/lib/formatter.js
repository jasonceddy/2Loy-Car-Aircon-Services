const CURRENCY_FORMATTER = new Intl.NumberFormat("en-PH", {
  currency: "PHP",
  style: "currency",
  minimumFractionDigits: 0,
})

export function formatCurrency(number) {
  return CURRENCY_FORMATTER.format(number)
}

// Basic date formatting
export const formatDate = (date) => {
  if (!date) return "N/A"

  const dateObj = new Date(date)
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// More detailed date formatting
export const formatDateTime = (date) => {
  if (!date) return "N/A"

  const dateObj = new Date(date)
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Relative time formatting (like "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return "N/A"

  const now = new Date()
  const dateObj = new Date(date)
  const diffInMs = now - dateObj
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`

  return formatDate(date)
}

// Philippine-specific date formatting
export const formatDatePH = (date) => {
  if (!date) return "N/A"

  const dateObj = new Date(date)
  return dateObj.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Time only formatting
export const formatTime = (date) => {
  if (!date) return "N/A"

  const dateObj = new Date(date)
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Booking-specific formatting
export const formatScheduledDate = (date) => {
  if (!date) return "Not scheduled"

  const dateObj = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const isToday = dateObj.toDateString() === today.toDateString()
  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString()

  if (isToday) {
    return `Today at ${formatTime(date)}`
  } else if (isTomorrow) {
    return `Tomorrow at ${formatTime(date)}`
  } else {
    return `${formatDate(date)} at ${formatTime(date)}`
  }
}