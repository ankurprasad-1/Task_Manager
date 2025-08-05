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
          <div class="card" :style="{ backgroundColor: card.color }">


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
            <!--assigning values for card based on priorty, defaults to lower case and none if nothing selected -->
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

<script>
import draggable from 'vuedraggable';

export default {
  name: 'Column',
  components: {
    draggable,
  },
  props: {//declaring types
    title: String,
    initialCards: {
      type: Array,
      required: true,
    },
    columnIndex: Number,
  },

  //default is false unless changed 
  emits: ['update-cards', 'update-column-title', 'delete-list', 'show-card-detail'],
  data() {
    return {
      isTitleEditing: false,
      editedTitle: '',
      isAdding: false,
      newCardTitle: '',
      newCardText: '',
      newCardColor: 'white',
      newCardImage: null,
      newImagePreviewUrl: null,
      isDragOver: false,//no dragging 
      newCardTime: null,
      newCardPriority: null,
      filter: { open: false },
      sortFilter: null,
      availableColors: ['white', 'orange', 'lightblue', 'lightgreen', 'plum'],
      priorityOptions: [
        { text: 'None', value: null },
        { text: 'Low', value: 'Low' },
        { text: 'Medium', value: 'Medium' },
        { text: 'High', value: 'High' },
        //converting text options into values for prioirty sorting 
      ],
    };
  },
  computed: {
    sortedCards() {
      if (!this.sortFilter) {
        return this.initialCards;
      }
      return [...this.initialCards].sort((a, b) => {
        if (this.sortFilter === 'time') { // Renamed for clarity
          const timeA = a.time;
          const timeB = b.time;
            if (!timeA && !timeB) return 0; // only if they are equal
            if (!timeA) return 1;          //if A does not exist than B is grater
            if (!timeB) return -1;      // if B does not exist then A is greater

           return timeA.localeCompare(timeB);
}
        if (this.sortFilter === 'priority') {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0, null: 0 };
          const priorityA = priorityOrder[a.priority] || 0;
          const priorityB = priorityOrder[b.priority] || 0;
          //defaults to 0 if no perioity is assinged in the case of "null"
          return priorityB - priorityA;
        }
        return 0;
      });
    },
  },
  watch: {//watching for chagnes in title
    title: {
      handler(newTitle) {
        this.editedTitle = newTitle;
      },
      immediate: true,
    },
  },
  methods: {
    async enableTitleEdit() {
      this.isTitleEditing = true;
      await this.$nextTick();
      //await for DOM to update
      const inputtitle = document.querySelector('.column-title-input');
      //query for input title
      if (inputtitle) {
        inputtitle.focus();
      }
    },
    saveTitle() {
      if (this.editedTitle.trim() !== '' && this.editedTitle !== this.title) {
        this.$emit('update-column-title', this.editedTitle.trim());
      }
      //event to update column title
      this.isTitleEditing = false;
    },
    sortByDueDate() {
      this.sortFilter = 'dueDate';
      this.filter.open = false;
      //closes after sorting 
    },
    sortByPriority() {
      this.sortFilter = 'priority';
      this.filter.open = false;
      //closes after sorting
    },
    formatTime(timeString) {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
      //converting time from string to AM/PM format using dorp down
    },
    addCard() {//defaults to nothing
      if (!this.newCardTitle.trim()) return;
      const newCards = [...this.initialCards];
      newCards.push({
        title: this.newCardTitle.trim(),
        text: this.newCardText.trim() || '',
        image: this.newCardImage ? this.newCardImage : null,
        color: this.newCardColor,
        time: this.newCardTime,
        priority: this.newCardPriority,
        isEditing: false,
        editedTitle: '',
        editedText: '',
      });
      //adding new card to the column
      this.emitUpdateCards(newCards);
      this.newCardTitle = '';
      this.newCardText = '';
      this.newCardColor = 'white';
      this.newCardImage = null;
      this.newImagePreviewUrl = null;
      this.newCardTime = null;
      this.newCardPriority = null;
      this.isAdding = false;
    },
    //if user clicks cancel nothing chnages
    cancelAdd() {
      this.newCardTitle = '';
      this.newCardText = '';
      this.newCardColor = 'white';
      this.newCardImage = null;
      this.newImagePreviewUrl = null;
      this.newCardTime = null;
      this.newCardPriority = null;
      this.isAdding = false;
    },
    //enables the edit mode for the card
    enableEdit(card) {
      card.isEditing = true;
      card.editedTitle = card.title;
      card.editedText = card.text;
    },
    saveEdit(card) {
      //if nothing in thte tilte or card thean can't save
      card.title = card.editedTitle.trim();
      card.text = card.editedText.trim();
      card.isEditing = false;
      this.emitUpdateCards(this.initialCards);
    },
    cancelEdit(card) {
      card.isEditing = false;
    },// if user clicks cancel then nothing is saved

    deleteCard(index) {
      const newCards = [...this.initialCards];
      newCards.splice(index, 1);
      this.emitUpdateCards(newCards);
    },
    //elte card updates the index values 
    NewImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.newCardImage = URL.createObjectURL(file);
        this.newImagePreviewUrl = URL.createObjectURL(file);
      }// creates a preview of the image, simple
    },
    imageDrop(event) {
      this.isDragOver = false;
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.NewImageUpload({ target: { files: [file] } });
      }
    },
    clearImage() {
      this.newCardImage = null;
      this.newImagePreviewUrl = null;
    },
    //if image is uploaded then shown else nothing
    getImagePath(image) {
      return image;
    },

    //truncate text so that only 100 characters are shown
    truncatedText(text) {
      const maxLength = 100;
      if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      return text;
    },
    emitUpdateCards(newCards) {
      this.$emit('update-cards', newCards);
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/column.scss";
</style>