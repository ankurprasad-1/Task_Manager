APP Vue

<template>
  <div class="app-container">
    <TopBar
      :search-text="searchText"
      :board-title="boards[currentBoardIndex] ? boards[currentBoardIndex].title : ''"
      :boards="boards"
      :current-board-index="currentBoardIndex"
      @update-board-title="updateBoardTitle"
      @update:searchText="updateSearchText"
      @create-board="createBoard"
      @switch-board="switchBoard"
      @delete-board="deleteBoard"
      @add-list="addList"
    />
    <!--displaying current board options and contents-->
    <div v-if="boards[currentBoardIndex] && boards[currentBoardIndex].columns.length > 0" class="board">
      <Column
        v-for="(column, index) in filteredColumns"
        :key="index"
        :initial-cards="column.cards"
        :title="column.title"
        :column-index="index"
        @update-cards="(newCards) => updateColumnCards(index, newCards)"
        @update-column-title="(newTitle) => updateColumnTitle(index, newTitle)"
        @delete-list="deleteList"
      />
      <!-- displaying columns with cards-->
    </div>

    <CardDetail
      v-if="isDetailViewVisible"
      :card="selectedCard"
      @close="isDetailViewVisible = false"
    />
  </div>
</template>

<script>
import Column from './components/Column.vue';
import TopBar from './components/TopBar.vue';
import CardDetail from './components/CardDetail.vue';
//defualting contents if nothing else in local storage
const initialBoardData = {
  title: 'Kanban Template',
  columns: [
    {
      title: 'Monday, September 8',
      cards: [
        { title: 'Outreach', text: 'Client Outreach: Email 3 prospective clients with firm updates', time: '09:00', image: '/images/card1.png', dueDate: '2025-08-05', priority: 'High' },
        { title: 'Morning Call', text: 'Summarize insights from trading desk call', time: '14:00', dueDate: '2025-08-05', priority: 'Medium' },
        { title: 'Travel', text: 'Travel Prep: Book train to Boston for Thursday meetings', time: '16:45', dueDate: '2025-08-08', priority: 'Low' }
      ]
    },
    {
      title: 'Tuesday, Sept 9',
      cards: [
        { title: 'Town Hall', text: 'Lead the session', time: '09:00', dueDate: null, priority: null },
        { title: 'Meeting', text: 'Take notes', time: '10:00', dueDate: '2025-08-06', priority: 'High' },
        { title: 'Discuss', text: 'Icebreaker and updates', time: '11:00', dueDate: null, priority: 'Medium' }
      ]
    },
    {
      title: 'Wednesday, Sept 10',
      cards: [
        { title: 'Kickstarter', text: 'Lead the session', time: '09:00', dueDate: '2025-08-07', priority: 'High' },
        { title: 'Meeting', text: 'Take notes', time: '10:00', dueDate: null, priority: null },
        { title: 'Icebreaker', text: 'Optional if time permits', time: '11:00', image: '/images/card2.png', dueDate: null, priority: 'Low' },
        { title: 'Lunch', text: '2 mins per team', time: '12:00', dueDate: '2025-08-09', priority: 'Medium' }
      ]
    },
    {
      title: 'Thursday, Sept 11',
      cards: [
        { title: 'Interview', text: 'Lead the session', time: '09:00', dueDate: null, priority: 'High' },
        { title: 'Consulting Session', text: 'Take notes', time: '10:00', dueDate: '2025-08-08', priority: null },
        { title: 'Coffee', text: 'Optional if time permits', time: '11:00', image: '/images/card3.png', dueDate: null, priority: 'Low' },
        { title: 'Team meeting', text: '2 mins per team', time: '12:00', dueDate: '2025-08-10', priority: 'High' }
      ]
    },
    {
      title: 'Friday, Sept 12',
      cards: [
        { title: 'Meeting Lead', text: 'Lead the session', time: '09:00', dueDate: '2025-08-11', priority: 'Medium' },
        { title: 'Scribe', text: 'Take notes', time: '10:00', dueDate: null, priority: null },
        { title: 'Lunch', text: 'Optional if time permits', time: '11:00', dueDate: null, priority: 'Low' },
        { title: 'Options', text: '2 mins per team', time: '12:00', dueDate: '2025-08-12', priority: 'High' }
      ]
    }
  ]
};

export default {
  name: 'App',
  components: {
    Column,
    TopBar,
    CardDetail
  },
  data() {
    return {
      // intial board data
      searchText: '',
      boards: [],
      currentBoardIndex: 0,
      isDetailViewVisible: false,
      selectedCard: null
    };
  },
  computed: {
    activeBoard() {
      return this.boards[this.currentBoardIndex];
    },

    //filtred columns based on search
    filteredColumns() {
      const currentColumns = this.activeBoard?.columns || [];
      const query = this.searchText.trim();// not whitspace 

      if (!query) {//if no query don't search
        return currentColumns;
      }

      try {
        const regex = new RegExp(query, 'i');// case sensitive esarch
        return currentColumns.map(column => ({
          ...column,// spread operator to column copy
          cards: column.cards.filter(card => regex.test(card.title) || regex.test(card.text))
        }));

      } catch (error) {
        console.error("Invalid regex search query:", error);
        //defaults to no search filtering if error 
        return currentColumns;
      }
    }
  },
  watch: {// watching for changes
    activeBoard: {
      handler: 'saveBoard',
    }
  },
  methods: {
    saveBoard() {
      if (this.activeBoard) {
        localStorage.setItem('trelloBoard', JSON.stringify(this.activeBoard));
      }
    },
    createBoard() {
      const newBoard = {// default contenst for a new board
        title: 'New Board',
        columns: [
          { title: 'List 1', cards: [] }, { title: 'List 2', cards: [] },
          { title: 'List 3', cards: [] }, { title: 'List 4', cards: [] },
          { title: 'List 5', cards: [] }
        ]
      };
      this.boards.push(newBoard);// if new board then the index is latest
      this.currentBoardIndex = this.boards.length - 1;
    },
    addList() {
      if (this.activeBoard?.columns) {// if there is a current board then contenst for a new list
        this.activeBoard.columns.push({ title: 'New List', cards: [] });
      }
    },
    deleteList(columnIndex) {// delete the list if more than one column
      if (this.activeBoard?.columns.length > 1) {
        this.activeBoard.columns.splice(columnIndex, 1);
      }
    },
    switchBoard(index) {// switching to board based on index if only there is a board
      if (index >= 0 && index < this.boards.length) {
        this.currentBoardIndex = index;
      }
    },
    deleteBoard(index) {//updates index if current board if dleted 
      if (this.boards.length > 1) {
        this.boards.splice(index, 1);
        this.currentBoardIndex = 0;
      }
    },
    updateBoardTitle(newTitle) {// updates title of the current board
      if (this.boards[this.currentBoardIndex]) {
        this.boards[this.currentBoardIndex].title = newTitle;
      }
    },
    updateColumnCards(columnIndex, newCards) {
      if (this.activeBoard?.columns[columnIndex]) {
        this.activeBoard.columns[columnIndex].cards = newCards;
      }
      // save updated board to local storage
    },
    updateColumnTitle(columnIndex, newTitle) {
      if (this.activeBoard?.columns[columnIndex]) {
        this.activeBoard.columns[columnIndex].title = newTitle;
      }
      // save updated board to local storage
    },
    updateSearchText(newText) {
      this.searchText = newText;
      // search text to local storage
    }
  },
  mounted() {//lifecycle hook to load initial board data
    const storedBoard = localStorage.getItem('trelloBoard');
    if (storedBoard) {
      try {
        const parsedBoard = JSON.parse(storedBoard);
        this.boards = (parsedBoard?.columns) ? [parsedBoard] : [initialBoardData];
        // current board index is set to 0
      } catch (error) {
        console.error("Error parsing board from localStorage:", error);
        this.boards = [initialBoardData];
      }
    } else {
      this.boards = [initialBoardData];
    }
    this.saveBoard();
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/app.scss';
</style>
