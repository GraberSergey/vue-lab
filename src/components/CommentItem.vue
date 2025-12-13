<script setup>
import { computed } from 'vue'
import { formatDate } from '../utils/comments'

defineOptions({
  name: 'CommentItem',
})

const props = defineProps({
  comment: {
    type: Object, //то что приходит на отрисовку
    required: true,
  },
  level: {
    type: Number, //уровень вложенности, дерево обсуждений
    default: 0,
  },
})

const emit = defineEmits(['reply'])//вызов события реплай 

const reactionLabel = computed(() => { //отрисовка реации пользователя
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
    return 'comment-card--positive' //раскраска комментария в зеленый если сумма положительная
  }

  if (props.comment.repliesReactionSum < 0) { //раскраска комментария в красный если сумма отрицательная
    return 'comment-card--negative'
  }

  return 'comment-card--neutral'//раскраска комментария в желтый если сумма ноль
})

const createdAtLabel = computed(() => formatDate(props.comment.createdAt)) //дата создания комментария

const indentationStyle = computed(() => ({ //отступ в комментариях
  '--indent-level': props.level,
}))

const handleReply = () => { //событие ответа на комментария
  emit('reply', props.comment)
}
</script>

<template>
  <article class="comment-card" :class="accentClass" :style="indentationStyle"> <!-- весь комментарий -->
    <header class="comment-card__header">
      <div>
        <p class="comment-card__author">{{ props.comment.author }}</p> <!-- автория комментария -->
        <p class="comment-card__date">{{ createdAtLabel }}</p> <!-- дата комментария -->
      </div>
      <span class="comment-card__badge">{{ reactionLabel }}</span> <!-- реакция негатив или позитив или нейтральная -->
    </header>

    <p class="comment-card__text">{{ props.comment.text }}</p> <!-- текст комментария -->

    <footer class="comment-card__footer">
      <p v-if="props.comment.replies?.length" class="comment-card__replies"> <!-- количество ответов -->
        Ответов: {{ props.comment.replies.length }}
      </p>
      <button class="comment-card__reply" type="button" @click="handleReply">Ответить</button> <!-- кнопка ответить на комментарий -->
    </footer>
  </article>

  <div v-if="props.comment.replies?.length" class="comment-card__children">
    <CommentItem
      v-for="reply in props.comment.replies"
      :key="reply.id"
      :comment="reply"
      :level="props.level + 1" 
      @reply="emit('reply', $event)"
    /> <!-- ответные комментарии -->
  </div>
</template>
