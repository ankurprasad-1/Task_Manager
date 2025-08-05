<template>
  <div class="top-bar">
    <div class="left-section">
      <img src="/images/workspace-icon.png" alt="Workspace Icon" class="workspace-icon" />
      <img src="/images/logo.png" alt="Logo" class="logo-img" />
      <span class="logo-text">Trello</span>
    </div>

    <!-- Search Bar w/target value assigned-->
    <div class="search-container"> 
      <input
        type="text"
        class="search"
        placeholder="Search"
        :value="searchText"
        @input="emit('update:searchText', $event.target.value)"
      />

      <!-- Create button (for creating new board upon click)-->
      <button class="create-button" @click="emit('create-board')">Create</button>
    </div>
    <!--links to "create board function" in App.vue-->

    <div class="top-right-section"> <!--Top right sections of icons-->
      <div class="icon-wrapper">
        <img src="/images/settings-icon.png" alt="Settings" class="icon-img" />
      </div>
      <div class="icon-wrapper">
        <img src="/images/speaker-icon.png" alt="Speaker" class="icon-img" />
      </div>
      <div class="icon-wrapper">
        <img src="/images/top-logo3.png" alt="Help" class="icon-img" />
      </div>
      <div class="icon-wrapper">
        <img src="/images/top-logo4.png" alt="Settings" class="icon-img" />
      </div>
      <img src="/images/avatar.png" alt="Avatar" class="avatar" />
    </div>

<!--Second row of icons-->
  </div>
  <div class="second-bar">
    <!--Editing board title-->
    <div class="board-title-group">
      <div v-if="!isTitleEditing" class="board-title" @click="TitleEdit">{{ boardTitle }}</div>
      <input
        v-else
        v-model="editedTitle"
        class="board-title-input"
        @blur="saveTitle"
        @keydown.enter="saveTitle"
      />
      <!--save on enter-->
      <!--save on remove hover-->
      


      <!--Board Menu Option-->
      <div v-if="boards.length > 1" class="board-menu-dropdown" @click="toggleBoardMenu">
        <!-- if index of board is only 1 then do not display menu else show board menu via the "dropdown icon"-->
        <img src="/images/dropdown-icon.png" alt="Boards" class="dropdown-icon" />
        <div v-if="showBoardMenu" class="board-menu">
          <ul class="board-list"> <!--List of boards-->
            <li
              v-for="(board, index) in boards"
              :key="index" 
              @click.stop="CloseMenu(index)"
              :class="{ 'is-active': index === currentBoardIndex }"
            >
              {{ board.title }}
            </li>
            <!--"Board Name" "#"-->
          </ul> 

          <button v-if="boards.length > 1" class="delete-board-button" @click="deleteCurrentBoard">Delete Board</button>
          <!--Delete board button only appears in the menu option - might be reducnant because it will only appear if the menu opiton shos-->
        </div>
      </div>
    </div>


    <div class="right-icons">
      <button class="add-list-button" @click="emit('add-list')">+ Add a list</button>
      <!-- button for adding another list into the columns -->

      <img src="/images/filter-icon.png" alt="Filter" class="icon-img" />
      <img src="/images/star-icon.png" alt="Star" class="icon-img" />
      <img src="/images/more-icon.png" alt="More" class="icon-img" />
    </div>
  </div>
</template>

<!--Javascript setup-->
<script setup>
import { ref, defineProps, defineEmits, watch, nextTick, computed } from 'vue'
//
const props = defineProps({
  boardTitle: String,
  boards: Array,
  currentBoardIndex: Number,
  searchText: String
})

const emit = defineEmits(['update-board-title', 'update:searchText', 'create-board', 'switch-board', 'delete-board', 'add-list'])
const showBoardMenu = ref(false)
const isTitleEditing = ref(false)
const editedTitle = ref('')

const currentBoardTitle = computed(() => {
  return props.boardTitle;
});
//computed property to get board title

watch(() => props.boardTitle, (newTitle) => {
  if (!isTitleEditing.value) {
    editedTitle.value = newTitle;
  }
});
//watch for changes in board title, if so then new title 

async function TitleEdit() {
  isTitleEditing.value = true;
  editedTitle.value = props.boardTitle; // set editedTitle to current boardTitle
  await nextTick();
  //nexttick for DOM updating, allows for input to be updating accordingly
  const input = document.querySelector('.board-title-input');
  if (input) {
    input.focus();
  }
}

function saveTitle() {
  emit('update-board-title', editedTitle.value);
  isTitleEditing.value = false;
}
//allows for current title to be edited

function toggleBoardMenu() {
  showBoardMenu.value = !showBoardMenu.value;
}
//boolean to toggle board menu

function CloseMenu(index) {
  emit('switch-board', index);
  showBoardMenu.value = false;
}

function deleteCurrentBoard() {
  emit('delete-board', props.currentBoardIndex)
  showBoardMenu.value = false;
}
//removes the board from current index selected

</script>

<style lang="scss" scoped>
@import "@/assets/topbar.scss";
</style>