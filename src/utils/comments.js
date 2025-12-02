const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

// Convert incoming ISO string to readable label
export function formatDate(value) {
  if (!value) {
    return ''
  }

  try {
    return dateFormatter.format(new Date(value))
  } catch (error) {
    console.error('Invalid date value', value)
    return ''
  }
}

// Ensure comments stay ordered from oldest to newest
export function insertCommentSorted(list, comment) {
  const next = list.filter(item => item.id !== comment.id)
  const createdAt = Date.parse(comment.createdAt)
  const index = next.findIndex(item => Date.parse(item.createdAt) > createdAt)

  if (index === -1) {
    next.push(comment)
  } else {
    next.splice(index, 0, comment)
  }

  return next
}

// Build tree with reaction sums for direct replies
export function buildCommentTree(source) {
  const sorted = [...source].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  )

  const map = new Map()

  sorted.forEach(item => {
    map.set(item.id, {
      ...item,
      replies: [],
      repliesReactionSum: 0,
    })
  })

  const roots = []

  map.forEach(node => {
    if (node.parentId !== null && node.parentId !== undefined && map.has(node.parentId)) {
      map.get(node.parentId).replies.push(node)
    } else {
      roots.push(node)
    }
  })

  map.forEach(node => {
    node.repliesReactionSum = node.replies.reduce((sum, reply) => sum + (reply.reaction ?? 0), 0)
  })

  return roots
}
