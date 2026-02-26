import { ref, onMounted } from "vue";
import type { Prices, PriceItem } from "../type/swap.type";

const LOCAL_TOKENS = ["SWTH", "BTC", "ETH", "USDT", "USDC", "OSMO", "ATOM"];

const MOCK_PRICES: Prices = {
  SWTH: 0.00403985,
  BTC: 26002.82,
  ETH: 1645.93,
  USDT: 1,
  USDC: 1,
  OSMO: 0.3773,
  ATOM: 7.18,
};

export function usePrices() {
  const prices = ref<Prices>({});
  const tokens = ref<string[]>([]);

  async function fetchPrices() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch("https://interview.switcheo.com/prices.json", {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: PriceItem[] = await res.json();

      // 过滤本地有 svg 的 token，取最新价格
      const filtered: Prices = {};
      const seen: Record<string, PriceItem> = {};

      data.forEach((item) => {
        const token = item.currency;
        if (LOCAL_TOKENS.includes(token)) {
          const prev = seen[token];
          if (!prev || new Date(item.date) > new Date(prev.date))
            seen[token] = item;
        }
      });

      Object.keys(seen).forEach((token) => {
        filtered[token] = seen[token].price;
      });

      prices.value = Object.keys(filtered).length ? filtered : MOCK_PRICES;
      tokens.value = Object.keys(prices.value);
    } catch {
      console.warn("Fetch failed or timeout, using mock prices.");
      prices.value = MOCK_PRICES;
      tokens.value = Object.keys(prices.value);
    }
  }

  onMounted(fetchPrices);

  return { prices, tokens };
}
