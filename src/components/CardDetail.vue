<template>
  <div class="detail-overlay" @click.self="$emit('close')">
    <div class="detail-content">
      <div class="detail-header">
        <h3 class="detail-title">{{ card.title }}</h3>
      </div>

      <div class="detail-body">        
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

<script>
export default {
  name: 'CardDetail',
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],
  computed: {
    formattedTime() {
      if (!this.card.time) return '';
      const [hours, minutes] = this.card.time.split(':').map(Number);
      //map the string to a number
      const ampm = hours >= 12 ? 'PM' : 'AM';
      //makes it into a AM or PM format
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/CardDetail.scss';
</style>