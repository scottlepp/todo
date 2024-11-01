<script lang="ts">
import TodoList from './components/TodoList.svelte';
import { SvelteUIProvider } from '@svelteuidev/core';
</script>

<SvelteUIProvider themeObserver="dark">
  <main>
    <TodoList />
  </main>
</SvelteUIProvider>

<style>
  main {
    text-align: center;
    margin-top: 2rem;
    width: 100%;
  }
</style>



