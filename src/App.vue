<script setup>
import CommentBoard from './components/CommentBoard.vue'
</script>

<template>
  <div class="app">
    <header class="app__header">
      <p class="app__eyebrow">Vue.js lab</p>
      <h1 class="app__title">Поток комментариев</h1>
      <p class="app__subtitle">
        Получайте ответы с сервера, следите за реакциями и простраивайте дерево обсуждения.
      </p>
    </header>

    <main class="app__main">
      <CommentBoard />
    </main>
  </div>
</template>
