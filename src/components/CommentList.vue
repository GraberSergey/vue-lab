<script setup>
import CommentItem from './CommentItem.vue'

const props = defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['reply'])
</script>

<template>
  <ul class="comment-list" v-if="props.comments.length">
    <li v-for="comment in props.comments" :key="comment.id" class="comment-list__item">
      <CommentItem :comment="comment" :level="0" @reply="emit('reply', $event)" />
    </li>
  </ul>
</template>
