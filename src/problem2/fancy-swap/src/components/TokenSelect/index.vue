<template>
  <div class="token-select">
    <select v-model="selected" @change="updateIcon">
      <option v-for="token in tokens" :key="token" :value="token">{{ token }}</option>
    </select>
    <img v-if="iconSrc" :src="iconSrc" class="token-icon" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { TokenSelectProps } from '../../type/tokenSelect.type';

const props = defineProps<TokenSelectProps>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();

const selected = ref(props.modelValue || '');
const iconSrc = ref('');

const updateIcon = () => {
  if (!selected.value) return;
  iconSrc.value = `/src/assets/tokens/${selected.value}.svg`;
  emit('update:modelValue', selected.value);
};

watch(() => props.modelValue, (newVal) => {
  selected.value = newVal;
  updateIcon();
}, { immediate: true });

updateIcon();
</script>

<style scoped>
.token-select {
  display: flex;
  align-items: center;
}

select {
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-right: 8px;
  cursor: pointer;
}

.token-icon {
  width: 28px;
  height: 28px;
}
</style>