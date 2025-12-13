const API_URL = 'http://95.163.242.125' // сервер
const USERNAME = 'GraberSergey' // Юзернейм для сервера с гита

// получение комментариев с сервера
export async function fetchComments() {
  const response = await fetch(`${API_URL}/comments`, { // ручка получения комментариев (адрес обращения)
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load comments') // ошибка при загрузке комментариев
  }

  const payload = await response.json() // достаем комментарии из респонса
  return Array.isArray(payload) ? payload : []
}

// Subscribe to server-sent events with new comments
export function openCommentsStream({ onComment, onError }) { 
    // Проверяем, что мы в браузере и SSE поддерживается
  if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
    return null // Если нет - возвращаем null
  }

  // Создаем новое SSE-подключение к серверу
  const source = new EventSource(`${API_URL}/comments/stream`)

  // Обработчик входящих сообщений
  source.onmessage = event => {
    try {
      const data = JSON.parse(event.data) // Парсим JSON из данных
      onComment?.(data)  // Вызываем переданный обработчик комментариев
    } catch (error) {
      console.error('Failed to parse SSE payload', error)
    }
  }
 // Обработчик ошибок подключения
  source.onerror = error => {
    console.error('SSE connection failed', error)
    onError?.(error) // Вызываем переданный обработчик ошибок
  }

  return source // Возвращаем объект EventSource
}

// Создание комментария
export async function createComment(payload) {
  const response = await fetch(`${API_URL}/comments`, {
    method: 'POST', // отправка комментария на сервер
    headers: {
      'Content-Type': 'application/json',
      Username: USERNAME, //юзернейм с гитхаба авторизуется на сервере
    },
    body: JSON.stringify(payload), //текст, автор и другая полезная нагрузка
  })

  if (!response.ok) {
    throw new Error('Failed to send comment') // ошибка отправки комментария на сервер
  }

  return true //значит, что комментарий создался
}
