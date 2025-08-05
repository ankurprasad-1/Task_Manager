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
    <!-- Display the current board's columns -->
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
      <!-- Display the column components -->
    </div>
    <div v-else class="loading-state">
      Loading your board...
    </div>
    <CardDetail
      v-if="isDetailViewVisible"
      :card="selectedCard"
      @close="isDetailViewVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import Column from './components/Column.vue'
import TopBar from './components/TopBar.vue'
import CardDetail from './components/CardDetail.vue'

// reactive variables
const searchText = ref('')
const boards = ref([])
const currentBoardIndex = ref(0)
const isDetailViewVisible = ref(false);
const selectedCard = ref(null);

// default board data w/o local storage
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
}
//acctive board based on current index of board
const activeBoard = computed(() => boards.value[currentBoardIndex.value]);

// function to save the active board to local storage
function saveBoard() {
  if (activeBoard.value) {
    localStorage.setItem('trelloBoard', JSON.stringify(activeBoard.value));
  }
}

// default board when creating a new board
function createBoard() {
  const newBoard = {
    title: 'New Board',
    columns: [
      { title: 'List 1', cards: [] }, { title: 'List 2', cards: [] },
      { title: 'List 3', cards: [] }, { title: 'List 4', cards: [] },
      { title: 'List 5', cards: [] }
    ]
  }
  boards.value.push(newBoard)
  currentBoardIndex.value = boards.value.length - 1
  //board index value becomes last board in array
}

// Function to add a new column
function addList() {
  if (activeBoard.value?.columns) {
    activeBoard.value.columns.push({ title: 'New List', cards: [] });
  }
}

// delete a column
function deleteList(columnIndex) {
  if (activeBoard.value?.columns.length > 1) {
    activeBoard.value.columns.splice(columnIndex, 1);
  }
}

// switch the active board
function switchBoard(index) {
  if (index >= 0 && index < boards.value.length) {
    //if index greater than 0 => valid index
    currentBoardIndex.value = index
  }
}

// Function to delete the current board
function deleteBoard(index) {
  if (boards.value.length > 1) {
    boards.value.splice(index, 1)
    //update current board index
    currentBoardIndex.value = 0
  }
}

// Function to update the title of the current board
function updateBoardTitle(newTitle) {
  if (boards.value[currentBoardIndex.value]) {
    boards.value[currentBoardIndex.value].title = newTitle;
  }
}

// Function to update the cards in a specific column
function updateColumnCards(columnIndex, newCards) {
  if (boards.value[currentBoardIndex.value]?.columns[columnIndex]) {
    boards.value[currentBoardIndex.value].columns[columnIndex].cards = newCards;
  }
}

// Update the title of a specific column
function updateColumnTitle(columnIndex, newTitle) {
  if (boards.value[currentBoardIndex.value]?.columns[columnIndex]) {
    boards.value[currentBoardIndex.value].columns[columnIndex].title = newTitle;
  }
}

function updateSearchText(newText) {
  searchText.value = newText;
}

// Computed property to filter columns based on search text using regex
const filteredColumns = computed(() => {
  const currentColumns = boards.value[currentBoardIndex.value]?.columns || [];
  const query = searchText.value.trim();

  if (!query) {//no query no filtering
    return currentColumns;
  }

  try {//else using regex search
    const regex = new RegExp(query, 'i');//case sensitive search
    return currentColumns.map(column => ({
      ...column,//copying column 
      cards: column.cards.filter(card => regex.test(card.title) || regex.test(card.text))
    }));


  } catch (error) {
    console.error("Invalid regex search query:", error);
    return currentColumns;//retrun the original colums if regex fails
  }
});

// Load the board from local storage when the component is mounted
onMounted(() => {
  const storedBoard = localStorage.getItem('trelloBoard')
  if (storedBoard) {
    try {
      const parsedBoard = JSON.parse(storedBoard);
      boards.value = (parsedBoard?.columns) ? [parsedBoard] : [initialBoardData];
    } 
    catch (error) {//use intial board data if there is an error
      console.error("Error parsing board from localStorage:", error);
      boards.value = [initialBoardData];
    }
  } else {
    boards.value = [initialBoardData]
  }
  saveBoard();// save board to local storage
})

// 
watch(activeBoard, saveBoard, { deep: true });
</script>

<style lang="scss" scoped>
@import '@/assets/app.scss';
</style>
