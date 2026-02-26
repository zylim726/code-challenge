<template>
  <div class="swap-container">
    <form @submit.prevent="showModalFn">
      <h2>Token Swap</h2>

      <div class="swap-row">
        <label>From</label>
        <div class="input-group">
          <input type="number" v-model.number="inputAmount" placeholder="Amount" min="0" />
          <TokenSelect v-model="inputToken" :tokens="tokens" />
        </div>
      </div>

      <div class="swap-row">
        <label>To</label>
        <div class="input-group">
          <input type="number" :value="outputAmount" placeholder="Amount" disabled />
          <TokenSelect v-model="outputToken" :tokens="tokens" />
        </div>
      </div>

      <button type="submit" :disabled="loading">{{ loading ? 'Processing...' : swapBtnText }}</button>
    </form>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ modalTitle }}</h3>
        <p class="modal-message" v-html="modalMessage"></p>
        <div class="modal-actions">
          <button 
            class="confirm-btn" 
            v-if="!isError" 
            :disabled="loading"
            @click="swapTokens"
          >
            <span v-if="loading" class="loader"></span>
            <span v-else>Confirm</span>
          </button>
          <button class="cancel-btn" @click="closeModal">{{ isError ? 'Close' : 'Cancel' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import TokenSelect from '../TokenSelect/index.vue';
import { usePrices } from '../../composables/usePrice.script';

const { prices, tokens } = usePrices();

const inputAmount = ref<number>(0);
const outputAmount = ref<string>('');
const inputToken = ref<string>('');
const outputToken = ref<string>('');
const swapBtnText = ref('CONFIRM SWAP');
const loading = ref(false);

const showModal = ref(false);
const isError = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const showModalFn = () => {

  if (!inputAmount.value || inputAmount.value <= 0) {
    isError.value = true;
    modalTitle.value = 'Invalid Amount';
    modalMessage.value = 'Please enter a valid amount.';
  } else if (inputToken.value === outputToken.value) {
    isError.value = true;
    modalTitle.value = 'Invalid Swap';
    modalMessage.value = 'Cannot swap the same token.';
  } else {
    isError.value = false;
    modalTitle.value = 'Confirm Swap';
    modalMessage.value = `Swap <strong>${inputAmount.value}</strong> ${inputToken.value} → <strong>${outputAmount.value}</strong> ${outputToken.value}`;
  }
  showModal.value = true;
};

const closeModal = () => {
  if (!loading.value) showModal.value = false;
};


const computedOutput = computed<string>(() => {
  const fromPrice = prices.value[inputToken.value];
  const toPrice = prices.value[outputToken.value];
  if (!inputAmount.value || !fromPrice || !toPrice) return '';
  return ((inputAmount.value * fromPrice) / toPrice).toFixed(6);
});
watch(computedOutput, val => outputAmount.value = val);


function swapTokens(): void {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    showModal.value = false;
    alert(`Successfully swapped ${inputAmount.value} ${inputToken.value} → ${outputAmount.value} ${outputToken.value}`);
    inputAmount.value = 0;
  }, 1500);
}

// 默认选 token
watch(tokens, list => {
  if (list.length && !inputToken.value) {
    inputToken.value = list[0];
    outputToken.value = list[1] || list[0];
  }
});
</script>

<style scoped>
.swap-container {
  max-width: 440px;
  margin: 80px auto;
  background: #ffffff;
  padding: 36px 32px;
  border-radius: 28px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.15);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  letter-spacing: 1px;
}

.swap-row {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.input-group {
  display: flex;
  align-items: center;
}

input[type='number'] {
  flex: 1;
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px solid #d1d5db;
  margin-right: 14px;
  font-size: 16px;
  outline: none;
  transition: 0.2s;
}

input[type='number']:focus {
  border-color: #6366f1;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.35);
}

button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(90deg,#4e54c8,#8f94fb);
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}

button:hover:not(:disabled) {
  background: linear-gradient(90deg,#6366f1,#a1a8ff);
}

button:disabled {
  opacity: 0.6;
  cursor: default;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top:0; left:0; width:100%; height:100%;
  background: rgba(0,0,0,0.45);
  display: flex; align-items:center; justify-content:center;
  z-index:50;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: linear-gradient(145deg, #f0f4ff, #ffffff);
  padding: 32px;
  border-radius: 24px;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 30px 70px rgba(0,0,0,0.25);
  animation: slideDown 0.3s ease;
}

.modal-content h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 20px;
}

.modal-message {
  margin-bottom: 28px;
  font-size: 16px;
  color: #555;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* confirm btn with loader */
.confirm-btn {
  flex:1;
  padding: 12px;
  background: #6366f1;
  color: white;
  border-radius: 16px;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  transition: 0.3s;
}
.confirm-btn:hover:not(:disabled) {
  background: #4e54c8;
}

.confirm-btn .loader {
  border: 3px solid #fff;
  border-top: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

.cancel-btn {
  flex:1;
  padding:12px;
  background:#e5e7eb;
  color:#555;
  border-radius:16px;
  cursor:pointer;
  font-weight:bold;
}
.cancel-btn:hover {
  background:#d1d5db;
}

@keyframes fadeIn {
  from {opacity:0;}
  to {opacity:1;}
}

@keyframes slideDown {
  from {transform: translateY(-25px); opacity:0;}
  to {transform: translateY(0); opacity:1;}
}

@keyframes spin {
  from { transform: rotate(0deg);}
  to { transform: rotate(360deg);}
}
</style>