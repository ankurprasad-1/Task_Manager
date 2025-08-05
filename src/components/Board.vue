<template>
  <div class="board-background">
    <Column
      v-for="(column, index) in columns"
      :key="index"
      :title="column.title"
      :initial-cards="column.cards" 
      @update-storage="LocalStorage"
      @change-column-color="(newColor) => changeColumnColor(index, newColor)"
    />
  </div>
</template>

<!-- javascript Board.vue -->
<script setup>
import { ref, watch } from 'vue'
import Column from './Column.vue'

const localStorageKey = 'taskBoardData';

const storedData = localStorage.getItem(localStorageKey);
const columns = ref(
  //use local storage else defualt columns
  storedData ? JSON.parse(storedData) : [
    {
      title: 'List 1',
      cards: [],
      backgroundColor: ''
    },
    {
      title: 'List 2',
      cards: [],
      backgroundColor: ''
    },
    {
      title: 'List 3',
      cards: [],
      backgroundColor: ''
    },
    {
      title: 'List 4',
      cards: [],
      backgroundColor: ''
    }
  ]
);

watch(columns, (updadtecolumns) => {
  localStorage.setItem(localStorageKey, JSON.stringify(updadtecolumns));
}, { deep: true });
// watch for changes in column and update local storage
function LocalStorage() {
  localStorage.setItem(localStorageKey, JSON.stringify(columns.value));
}
// update local sotrage on column change
function changeColumnColor(columnIndex, newColor) {
  if (columns.value[columnIndex]) {
    columns.value[columnIndex].backgroundColor = newColor;
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/board.scss";
</style>