const dateFormatter = new Intl.DateTimeFormat('ru-RU', { //ру указывается по форме записи даты (число месяц год)
  dateStyle: 'medium', 
  timeStyle: 'short',
})

// функция формата даты 
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

// вставка в дерево комментариев
export function insertCommentSorted(list, comment) {
  const next = list.filter(item => item.id !== comment.id)
  const createdAt = Date.parse(comment.createdAt)
  const index = next.findIndex(item => Date.parse(item.createdAt) > createdAt)

  if (index === -1) { // индекс если нет комментариев впринципе на сайте
    next.push(comment)
  } else { // вставка в индекс
    next.splice(index, 0, comment)
  }

  return next
}

// Создание дерева комментариев
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
  })//создаём структуру дерева

  const roots = []

  map.forEach(node => {
    if (node.parentId !== null && node.parentId !== undefined && map.has(node.parentId)) {
      map.get(node.parentId).replies.push(node)
    } else {
      roots.push(node)
    }
  }) //вставляем в дерево комментариев ответы

  map.forEach(node => {
    node.repliesReactionSum = node.replies.reduce((sum, reply) => sum + (reply.reaction ?? 0), 0)
  }) // считаем сумму реакций под каждым комментарием

  return roots
}
