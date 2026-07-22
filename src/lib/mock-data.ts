import type { Product } from "./types";

export const products: Product[] = [
  {
    id: "1",
    name: "極簡無線耳機",
    price: 2490,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    description: "輕巧舒適的真無線藍牙耳機，支援主動降噪與長效續航，適合通勤與日常使用。",
    stock: 32,
  },
  {
    id: "2",
    name: "經典皮革錢包",
    price: 1280,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop",
    description: "義大利頭層牛皮手工縫製，多卡層設計，兼具質感與實用性。",
    stock: 18,
  },
  {
    id: "3",
    name: "不鏽鋼保溫瓶",
    price: 890,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
    description: "雙層真空保溫設計，保冷保熱長達 12 小時，容量 500ml。",
    stock: 45,
  },
  {
    id: "4",
    name: "北歐風格檯燈",
    price: 1680,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop",
    description: "溫潤木質底座搭配亞麻燈罩，營造柔和居家氛圍，適合書桌與床頭。",
    stock: 12,
  },
  {
    id: "5",
    name: "有機棉圓領 T 恤",
    price: 690,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    description: "100% 有機棉材質，親膚透氣，簡約版型適合日常穿搭。",
    stock: 60,
  },
  {
    id: "6",
    name: "機械鍵盤",
    price: 3290,
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=600&fit=crop",
    description: "熱插拔軸體、RGB 背光與鋁合金上蓋，打字手感扎實回饋清晰。",
    stock: 8,
  },
  {
    id: "7",
    name: "陶瓷馬克杯組",
    price: 520,
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop",
    description: "霧面釉彩雙杯組，容量 350ml，微波爐與洗碗機可用。",
    stock: 25,
  },
  {
    id: "8",
    name: "帆布托特包",
    price: 980,
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop",
    description: "厚磅帆布材質，內建筆電隔層，容量充足適合通勤與週末出遊。",
    stock: 22,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}
