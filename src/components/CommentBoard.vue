<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fetchComments, openCommentsStream } from '../api/comments'
import { buildCommentTree, insertCommentSorted } from '../utils/comments'
import CommentList from './CommentList.vue'

const comments = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const liveUpdates = ref(true)
const isStreaming = ref(false)
const streamRef = ref(null)

const commentTree = computed(() => buildCommentTree(comments.value))
const totalComments = computed(() => comments.value.length)

// Load all comments from API
const loadComments = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchComments()
    comments.value = payload
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Не удалось получить комментарии'
  } finally {
    isLoading.value = false
  }
}

const handleIncomingComment = comment => {
  comments.value = insertCommentSorted(comments.value, comment)
}

const startStream = () => {
  stopStream()

  if (!liveUpdates.value) {
    return
  }

  const source = openCommentsStream({
    onComment: handleIncomingComment,
    onError: () => {
      isStreaming.value = false
    },
  })

  if (source) {
    streamRef.value = source
    isStreaming.value = true
  }
}

const stopStream = () => {
  if (streamRef.value) {
    streamRef.value.close()
    streamRef.value = null
  }

  isStreaming.value = false
}

watch(liveUpdates, value => {
  if (value) {
    startStream()
  } else {
    stopStream()
  }
})

onMounted(async () => {
  await loadComments()

  if (liveUpdates.value) {
    startStream()
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

    <p v-if="liveUpdates" class="board__hint" :class="{ 'board__hint--error': liveUpdates && !isStreaming }">
      <span v-if="isStreaming">Поток подключен, новые ответы появятся сразу.</span>
      <span v-else>Поток сообщений недоступен, можно обновить данные вручную.</span>
    </p>

    <div v-if="isLoading" class="board__placeholder">Загрузка комментариев...</div>
    <div v-else-if="errorMessage" class="board__alert">{{ errorMessage }}</div>
    <div v-else-if="!commentTree.length" class="board__placeholder">Пока нет комментариев</div>
    <CommentList v-else :comments="commentTree" />
  </section>
</template>
