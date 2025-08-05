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
<script>
import Column from './Column.vue';

export default {
  name: 'TaskBoard',
  components: {
    Column,
  },
  data() {
    const localStorageKey = 'taskBoardData';
    const storedData = localStorage.getItem(localStorageKey);
    
    return {
      localStorageKey: localStorageKey,
      columns: storedData ? JSON.parse(storedData) : [
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
    };
  },
  watch: {
    columns: {
      // when update in the columns 
      handler(updatedColumns) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(updatedColumns));
      },
      deep: true//tracks changes in nested 
    }
  },
  methods: {
    changeColumnColor(columnIndex, newColor) {
      if (this.columns[columnIndex]) {
        this.columns[columnIndex].backgroundColor = newColor;
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/board.scss";
</style>