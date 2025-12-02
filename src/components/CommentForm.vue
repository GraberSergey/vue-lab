<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  pending: {
    type: Boolean,
    default: false,
  },
  parent: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  author: '',
  text: '',
  reaction: 0,
})

const touched = reactive({
  author: false,
  text: false,
})

const resetForm = () => {
  form.author = ''
  form.text = ''
  form.reaction = 0
  touched.author = false
  touched.text = false
}

watch(
  () => props.parent,
  () => {
    resetForm()
  },
  { immediate: true },
)

const authorError = computed(() => {
  if (!touched.author) {
    return ''
  }

  return form.author.trim() ? '' : 'Укажите имя'
})

const textError = computed(() => {
  if (!touched.text) {
    return ''
  }

  return form.text.trim() ? '' : 'Напишите текст сообщения'
})

const isFormValid = computed(() => Boolean(form.author.trim() && form.text.trim()))

const handleSubmit = () => {
  touched.author = true
  touched.text = true

  if (!isFormValid.value || props.pending) {
    return
  }

  emit('submit', {
    author: form.author.trim(),
    text: form.text.trim(),
    reaction: Number(form.reaction),
  })
}

const handleCancel = () => {
  if (props.pending) {
    return
  }

  emit('cancel')
}
</script>

<template>
  <form class="comment-form" @submit.prevent="handleSubmit">
    <p class="comment-form__title">{{ props.parent ? 'Ответ на комментарий' : 'Новый комментарий' }}</p>
    <p v-if="props.parent" class="comment-form__context">
      Ответ для <strong>{{ props.parent.author }}</strong>
    </p>

    <label class="comment-form__field">
      <span class="comment-form__label">Имя</span>
      <input
        v-model="form.author"
        name="author"
        class="comment-form__input"
        type="text"
        placeholder="Например, Иван"
        @blur="touched.author = true"
        required
      />
      <span v-if="authorError" class="comment-form__error">{{ authorError }}</span>
    </label>

    <label class="comment-form__field">
      <span class="comment-form__label">Комментарий</span>
      <textarea
        v-model="form.text"
        name="text"
        class="comment-form__textarea"
        rows="4"
        placeholder="Введите текст сообщения"
        @blur="touched.text = true"
        required
      ></textarea>
      <span v-if="textError" class="comment-form__error">{{ textError }}</span>
    </label>

    <label class="comment-form__field">
      <span class="comment-form__label">Реакция</span>
      <select v-model.number="form.reaction" class="comment-form__select" name="reaction">
        <option :value="-1">Положительная (-1)</option>
        <option :value="0">Нейтральная (0)</option>
        <option :value="1">Негативная (1)</option>
      </select>
    </label>

    <div class="comment-form__actions">
      <button class="button button--primary" type="submit" :disabled="props.pending || !isFormValid">
        {{ props.pending ? 'Отправка...' : 'Отправить' }}
      </button>
      <button class="button" type="button" @click="handleCancel" :disabled="props.pending">Отмена</button>
    </div>
  </form>
</template>
