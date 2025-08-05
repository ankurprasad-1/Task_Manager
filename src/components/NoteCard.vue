<template>
  <div class="card">
    <div v-if="card.image" class="image-container">
      <!-- if there is an uploaded card then image is shown-->
      <img :src="card.image" alt="Uploaded image" class="uploaded-image" />
    </div>
    <div class="card-content">
      <h1>{{ card.title }}</h1>>
      
      <p>{{ card.text }}</p>
    </div>
  </div>
</template>

<!--Javascript-->
<script>
export default {
  props: {
    card: {
      type: Object,
      required: true
    }
  }
};
</script>


<style lang="scss">
@import '../../assets/notecard.scss';
</style>