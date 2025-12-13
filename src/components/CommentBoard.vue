<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createComment, fetchComments, openCommentsStream } from '../api/comments'
import { buildCommentTree, insertCommentSorted } from '../utils/comments' //иморт из файла
import CommentForm from './CommentForm.vue'
import CommentList from './CommentList.vue'

const comments = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const liveUpdates = ref(true) //ссылки
const isStreaming = ref(false)
const streamRef = ref(null)
const isFormVisible = ref(false)
const replyingTo = ref(null)
const isSubmitting = ref(false)
const formError = ref('')

const commentTree = computed(() => buildCommentTree(comments.value)) 
const totalComments = computed(() => comments.value.length)

// Load all comments from API
const loadComments = async () => { // Получаем комментарии от пользователей 
  isLoading.value = true  //начало загрузки 
  errorMessage.value = ''

  try {
    const payload = await fetchComments() //Загрузка комментариев
    comments.value = payload
  } catch (error) {
    console.error(error) //ошибка
    errorMessage.value = 'Не удалось получить комментарии'
  } finally {
    isLoading.value = false //конец загрузки 
  }
}

const handleIncomingComment = comment => {
  comments.value = insertCommentSorted(comments.value, comment)
}

const startStream = () => {
  stopStream() // Останавливаем предыдущий поток (если был)

  if (!liveUpdates.value) { // Проверяем, включены ли live-обновления
    return //Если нет выходим
  }
  // Создаем новый SSE-поток
  const source = openCommentsStream({
    onComment: handleIncomingComment,  // Функция-обработчик новых комментариев
    onError: () => {
      isStreaming.value = false // При ошибке помечаем, что поток остановлен
    },
  })

  if (source) {  // Если поток успешно создан
    streamRef.value = source // Сохраняем ссылку на поток
    isStreaming.value = true // Помечаем, что поток активен
  }
}

const stopStream = () => {
  if (streamRef.value) { // Если поток существует
    streamRef.value.close()  // Закрываем соединение SSE
    streamRef.value = null // Очищаем ссылку
  }

  isStreaming.value = false // Помечаем, что поток неактивен
}

const openForm = target => {
  replyingTo.value = target ?? null // открыть форму заполнения комментариев 
  isFormVisible.value = true
  formError.value = ''
}

const closeForm = () => {
  replyingTo.value = null
  isFormVisible.value = false //закрыть форму заполнения комментариев 
  formError.value = ''
}

const handleFormSubmit = async payload => {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  formError.value = ''

  try {
    const body = {
      author: payload.author, // данные из формы имя
      text: payload.text, //данные из формы комментарий
      reaction: payload.reaction, //данные из формы реакция
    }

    if (replyingTo.value) {
      body.parentId = replyingTo.value.id //ответь на комментарий другой
    }

    await createComment(body) //отправка комментария на сервер
    closeForm()

    if (!liveUpdates.value) {
      await loadComments()
    }
  } catch (error) {
    console.error(error)
    formError.value = 'Не удалось отправить комментарий' 
  } finally {
    isSubmitting.value = false
  }
}

watch(liveUpdates, value => {
  if (value) {
    startStream() //начало потока при подписке
  } else {
    stopStream() //конец потока при отписке
  }
})

onMounted(async () => {
  await loadComments() //загрузка комментариев в первый раз

  if (liveUpdates.value) {
    startStream() // если я включил обновление комментариев, тогда будет работать поток
  }
})

onBeforeUnmount(() => {
  stopStream() 
})
</script>

<template>
  <section class="board">
    <div class="board__header">
      <div>
        <h2 class="board__title">Комментарии</h2>
        <p class="board__meta">Всего: {{ totalComments }}</p>
      </div>

      <label class="toggle"> 
        <input v-model="liveUpdates" class="toggle__input" type="checkbox" />
        <span class="toggle__text">Получать новые комментарии автоматически</span>
      </label>
    </div>

    <div class="board__actions">
      <button class="button button--primary" type="button" @click="openForm()">Создать новый комментарий</button>
    </div>

    <p v-if="liveUpdates" class="board__hint" :class="{ 'board__hint--error': liveUpdates && !isStreaming }">
      <span v-if="isStreaming">Поток подключен, новые ответы появятся сразу.</span>
      <span v-else>Поток сообщений недоступен, можно обновить данные вручную.</span>
    </p>

    <CommentForm
      v-if="isFormVisible"
      :parent="replyingTo"
      :pending="isSubmitting" 
      @submit="handleFormSubmit"
      @cancel="closeForm"
    />

    <p v-if="formError" class="board__alert board__alert--inline">{{ formError }}</p> <!-- ошибка в форме -->

    <div v-if="isLoading" class="board__placeholder">Загрузка комментариев...</div>
    <div v-else-if="errorMessage" class="board__alert">{{ errorMessage }}</div>
    <div v-else-if="!commentTree.length" class="board__placeholder">Пока нет комментариев</div>
    <CommentList v-else :comments="commentTree" @reply="openForm" /> <!-- комментарии всех пользователей -->
  </section>
</template>
