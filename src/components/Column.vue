<template>
  <div class="column">
    <!--same logic as editing title in TopBar.Vue-->
    <div class="column-header">
      <h2 v-if="!isTitleEditing" class="column-title" @click="enableTitleEdit">{{ title }}</h2>
      <input
        v-else
        v-model="editedTitle"
        class="column-title-input"
        @blur="saveTitle"
        @keydown.enter="saveTitle"
      />
      <!-- if click off save the title
       if click enter then title is saved-->

      
      <div class="column-actions">
        <button class="filter-button" @click="filter.open = !filter.open">
          <!--enbling the filter button-->
          <img src="/images/filter-icon.png" alt="Filter" class="filter-icon" />
        </button>
        <div v-if="filter.open" class="filter-menu">
          <button @click="sortByDueDate">Sort by Due Date</button>
          <button @click="sortByPriority">Sort by Priority</button>
          <!--calling function for sorting-->



        </div>
        <button class="delete-list-button" @click="emit('delete-list', columnIndex)">
          <img src="/images/icon-delete.png" alt="Delete" class="delete-icon-img" />
        </button>
      </div>
    </div>


    <draggable :model-value="sortedCards" group="cards" item-key="title" @update:model-value="emitUpdateCards">
      
      <template #item="{ element: card, index: i }">
        <div class="card-wrapper" @click="emit('show-card-detail', card)">
          <div class="card" :style="{ backgroundColor: card.color || 'white' }">


            <div v-if="card.priority" class="priority-indicator" :class="card.priority.toLowerCase()"></div>
            <!--defautling for he sorting ot be sorted via value assigned-->
            <div v-if="!card.isEditing" class="card-content">

              <div class="card-header">
                <h1 class="card-title">{{ card.title }}</h1>
                <div class="card-actions">

                  <button class="icon-button" @click="enableEdit(card)" title="Edit">
                    <img src="/images/edit-icon.png" class="icon-img" />
                  </button>
                </div>
              </div>

              <p class="card-note">{{ truncatedText(card.text) }}</p>
              <!-- only allows for 100 lenght character to uploaded for later click on teh card-->
              <img v-if="card.image" :src="getImagePath(card.image)" alt="Uploaded image" class="uploaded-image" />
              <!--allows for path of image to be preserved-->
              <div class="card-details">
                <span v-if="card.time" class="due-date">Due: {{ formatTime(card.time) }}</span>
              </div>
            </div>

            <div v-else class="edit-form">
              <input v-model="card.editedTitle" placeholder="Title" class="edit-input" />
              <textarea v-model="card.editedText" placeholder="Note" class="edit-textarea" />
              <div class="edit-actions">
                <button class="icon-button" @click="deleteCard(i)" title="Delete">
                  <img src="/images/icon-delete.png" class="icon-img" />
                </button>
                <button class="icon-button" @click="saveEdit(card)" title="Save">
                  <img src="/images/icon-save.png" class="icon-img" />
                </button>
                <button class="icon-button" @click="cancelEdit(card)" title="Cancel">
                  <img src="/images/icon-cancel.png" class="icon-img" />
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </template>
    </draggable>




    <div v-if="isAdding" class="add-card-form">
      <input v-model="newCardTitle" class="add-input" placeholder="Enter card title" />
      <!-- default then "add-card-form"-->
      <textarea v-model="newCardText" class="add-textarea" placeholder="Enter card contents"></textarea>

      <!--default color while adding, leads to options of-->
      <div class="color-palette">
        <div
          v-for="color in availableColors"
          :key="color"
          class="color-switch"
          :class="{ 'is-selected': newCardColor === color }"
          :style="{ backgroundColor: color }"
          @click="newCardColor = color"
        ></div>
      </div>



      <input type="time" v-model="newCardTime" class="add-input" />
      <div class="priority-palette">
        <button
          v-for="option in priorityOptions"
          :key="option.value"
          class="priority-button"
          :class="[
            `priority-${option.value ? option.value.toLowerCase() : 'none'}`,
            { 'is-selected': newCardPriority === option.value }
          ]"
          @click="newCardPriority = option.value"
        >
            <!--assigning values for card based on priorty -->
          {{ option.text }}
        </button>
      </div>
      
      <div 
        class="image-upload-zone"
        :class="{ 'is-dragover': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop.prevent="imageDrop">
        
        <div v-if="!newImagePreviewUrl" class="upload-prompt">
          <label for="image-upload-input" class="upload-label">
            <img src="/images/add-image.png" alt="Upload Icon" class="upload-icon" />
            <span>Drag & drop an image or click to upload</span>
          </label>
          <input id="image-upload-input" type="file" @change="NewImageUpload" class="hidden-file-input" />
          <!--allows for draggability to mantained during files-->
        </div>
        <div v-else class="image-preview-container">
          <!-- image stored until assinged to larger card, quite simple-->
          <img :src="newImagePreviewUrl" alt="Image preview" class="image-preview" />
          <button @click="clearImage" class="remove-image-button">
            <img src="/images/icon-trash.png" alt="Remove" class="remove-icon" />
          </button>
        </div>
      </div>

      <div class="icon-row">
        <button class="icon-button add-button" @click="addCard" title="Add">
          <img src="/images/icon-send.svg" class="icon-img" />
        </button>
        <button class="icon-button cancel-button" @click="cancelAdd" title="Cancel">
          <img src="/images/icon-trash.png" class="icon-img" />
        </button>
      </div>
    </div>

    <button v-else class="add-card" @click="isAdding = true">  + Add a card
    </button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import draggable from 'vuedraggable'
//return types
const props = defineProps({
  title: String,
  initialCards: {   type: Array,
    required: true
  },
  columnIndex: Number
})

const emit = defineEmits(['update-cards', 'update-column-title', 'delete-list', 'show-card-detail'])


//all default values are set to false 
const isTitleEditing = ref(false)
const editedTitle = ref('')
const isAdding = ref(false)
const newCardTitle = ref('')
const newCardText = ref('')
const newCardColor = ref('white') //default value for color of card
const newCardImage = ref(null);
const newImagePreviewUrl = ref(null);
const isDragOver = ref(false);
const newCardTime = ref(null);
const newCardPriority = ref(null);
const filter = ref({ open: false });
const sortFilter = ref(null);

const availableColors = ['white', 'orange', 'lightblue', 'lightgreen', 'plum'];
const priorityOptions = [
  { text: 'None', value: null },
  { text: 'Low', value: 'Low' },
  { text: 'Medium', value: 'Medium' },
  { text: 'High', value: 'High' },
];
//assigning values of low,medium and high based on th input text seleted 

// Watch the title prop to keep the local editedTitle in sync
watch(() => props.title, (newTitle) => {
  editedTitle.value = newTitle;
}, { immediate: true });

async function enableTitleEdit() {
  //using async function to only change the function once 
  isTitleEditing.value = true;
  await nextTick();
  const inputtitle = document.querySelector('.column-title-input');
  // query selector to find first element with class column-title-input
  if (inputtitle) {
    inputtitle.focus();
  }
}

function saveTitle() {
  if (editedTitle.value.trim() !== '' && editedTitle.value !== props.title) {
    emit('update-column-title', editedTitle.value.trim());//no whietspace at end
  }
  isTitleEditing.value = false;
}

const sortedCards = computed(() => {
  if (!sortFilter.value) {
    return props.initialCards;
  }

  return [...props.initialCards].sort((a, b) => {
    //using spread operator to create a new array for sorting 
   if (sortFilter.value === 'time') {
      const timeA = a.time;
      const timeB = b.time;
      
      if (!timeA && !timeB) return 0; // If both are null, they are equal
      if (!timeA) return 1;          // not defined goes at the end
      if (!timeB) return -1;         // undefined goes at the end
      
      return timeA.localeCompare(timeB); //
    }

    if (sortFilter.value === 'priority') {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0, null: 0 };
      const priorityA = priorityOrder[a.priority] || 0;
      const priorityB = priorityOrder[b.priority] || 0;
      //need to operate around "no value for priority when selected"
      return priorityB - priorityA;
    }
    
    return 0;
  });
});

function sortByDueDate() {
  sortFilter.value = 'dueDate';
  filter.value.open = false;
}

function sortByPriority() {
  sortFilter.value = 'priority';
  filter.value.open = false;
}

//function for date of the cad
function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  //storing into array
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  //if less than 10 minutes than it will be "0" + X
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

function addCard() {
  if (!newCardTitle.value.trim()) return//string value
  const newCards = [...props.initialCards];//
  newCards.push({//new values
    title: newCardTitle.value.trim(),
    text: newCardText.value.trim() || '',
    image: newCardImage.value ? newCardImage.value : null,
    color: newCardColor.value,
    time: newCardTime.value,
    priority: newCardPriority.value,
    isEditing: false,
    editedTitle: '',
    editedText: ''
  });
  //default false
  emitUpdateCards(newCards);
  newCardTitle.value = ''
  newCardText.value = ''
  newCardColor.value = 'white'
  newCardImage.value = null;
  newImagePreviewUrl.value = null;
  newCardTime.value = null;
  newCardPriority.value = null;
  isEditing.value = false
}

//default false
function cancelAdd() {
  newCardTitle.value = ''
  newCardText.value = ''
  newCardColor.value = 'white'
  newCardImage.value = null;
  newImagePreviewUrl.value = null;
  newCardTime.value = null;
  newCardPriority.value = null;
  isAdding.value = false
}

//default false
function enableEdit(card) {
  card.isEditing = true
  card.editedTitle = card.title
  card.editedText = card.text
}

//default false
function saveEdit(card) {
  card.title = card.editedTitle.trim()
  card.text = card.editedText.trim()
  card.isEditing = false
  emitUpdateCards(props.initialCards);
}

//default false
function cancelEdit(card) {
  card.isEditing = false
}

//delete card, readjusts other cards to fit order
function deleteCard(index) {
  const newCards = [...props.initialCards];
  newCards.splice(index, 1);
  emitUpdateCards(newCards);
}

//handleing new image upload via local preview too
function NewImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    newCardImage.value = URL.createObjectURL(file); 
    newImagePreviewUrl.value = URL.createObjectURL(file);
  }
}

//when card dragged image still remains the same  
function imageDrop(event) {
  isDragOver.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
  NewImageUpload({ target: { files: [file] } });
  }
}

//makes default value false
function clearImage() {
  newCardImage.value = null;
  newImagePreviewUrl.value = null;
}

function getImagePath(image) {
  return image;
}

//truncate text so that only 100 characters are shown
function truncatedText(text) {
  const maxLength = 100;
  if (text && text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

function emitUpdateCards(newCards) {
  emit('update-cards', newCards);
}

</script>

<style lang="scss">
@import "@/assets/column.scss";
</style>