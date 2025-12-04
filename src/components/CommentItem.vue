<script setup>
import { computed } from 'vue'
import { formatDate } from '../utils/comments'

defineOptions({
  name: 'CommentItem',
})

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['reply'])

const reactionLabel = computed(() => {
  const value = props.comment.reaction

  if (value === 1) {
    return 'Положительная реакция'
  }

  if (value === -1) {
    return 'Негативная реакция'
  }

  return 'Нейтральная реакция'
})

const accentClass = computed(() => {
  if (!props.comment.replies?.length) {
    return ''
  }

  if (props.comment.repliesReactionSum > 0) {
    return 'comment-card--positive'
  }

  if (props.comment.repliesReactionSum < 0) {
    return 'comment-card--negative'
  }

  return 'comment-card--neutral'
})

const createdAtLabel = computed(() => formatDate(props.comment.createdAt))

const indentationStyle = computed(() => ({
  '--indent-level': props.level,
}))

const handleReply = () => {
  emit('reply', props.comment)
}
</script>

<template>
  <article class="comment-card" :class="accentClass" :style="indentationStyle">
    <header class="comment-card__header">
      <div>
        <p class="comment-card__author">{{ props.comment.author }}</p>
        <p class="comment-card__date">{{ createdAtLabel }}</p>
      </div>
      <span class="comment-card__badge">{{ reactionLabel }}</span>
    </header>

    <p class="comment-card__text">{{ props.comment.text }}</p>

    <footer class="comment-card__footer">
      <p v-if="props.comment.replies?.length" class="comment-card__replies">
        Ответов: {{ props.comment.replies.length }}
      </p>
      <button class="comment-card__reply" type="button" @click="handleReply">Ответить</button>
    </footer>
  </article>

  <div v-if="props.comment.replies?.length" class="comment-card__children">
    <CommentItem
      v-for="reply in props.comment.replies"
      :key="reply.id"
      :comment="reply"
      :level="props.level + 1"
      @reply="emit('reply', $event)"
    />
  </div>
</template>
