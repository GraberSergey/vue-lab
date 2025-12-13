<script setup>
import CommentItem from './CommentItem.vue'

const props = defineProps({ // массив комментариев
  comments: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['reply']) // вызов события ответ на комментарий
</script>

<template>
  <ul class="comment-list" v-if="props.comments.length">
    <li v-for="comment in props.comments" :key="comment.id" class="comment-list__item"><!-- цикл по комментариям для отрисовки каждого комментария из массива -->
      <CommentItem :comment="comment" :level="0" @reply="emit('reply', $event)" /> <!--  один комментарий отрисовывается -->
    </li>
  </ul>
</template>
