<template>
  <div class="detail-overlay" @click.self="emit('close')">
    <div class="detail-content">
      <div class="detail-header">
        <h1 class="detail-title">{{ card.title }}</h1>
      </div>

      <div class="detail-body">
        <p class="detail-description">{{ card.text }}</p>
        
        <div class="detail-info">
          <div v-if="card.priority" class="detail-priority">
            <span class="priority-label-text">Priority:</span>
            <span class="priority-label" :class="card.priority.toLowerCase()">{{ card.priority }}</span>
            <!--defaults the prioirty to be lowercase for comparison later-->
          </div>
          <div v-if="card.time" class="detail-due-time">
            <span class="time-label">Due Time:</span>
            <span class="time-value">{{ formattedTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);


const formattedTime = computed(() => {
  if (!props.card.time) return '';
  const [hours, minutes] = props.card.time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
});
</script>

<style lang="scss" scoped>
@import '@/assets/CardDetail.scss';
</style>