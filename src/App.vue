<script setup>
import CommentBoard from './components/CommentBoard.vue'
</script>

<template>
  <div class="app">
    <header class="app__header">
      <p class="app__eyebrow">Vue.js lab</p> <!-- header -->
      <h1 class="app__title">Поток комментариев</h1>
      <p class="app__subtitle">
        Пишите комментарии.
      </p>
    </header>

    <main class="app__main">
      <CommentBoard />
    </main>
  </div>
</template>
