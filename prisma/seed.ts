import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "極簡無線耳機",
    description:
      "輕巧舒適的真無線藍牙耳機，支援主動降噪與長效續航，適合通勤與日常使用。",
    price: 2490,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    stock: 32,
    category: "electronics",
  },
  {
    name: "機械鍵盤",
    description:
      "熱插拔軸體、RGB 背光與鋁合金上蓋，打字手感扎實回饋清晰。",
    price: 3290,
    imageUrl:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=600&fit=crop",
    stock: 8,
    category: "electronics",
  },
  {
    name: "智慧手錶",
    description: "心率監測、睡眠追蹤與防水設計，全天候健康管理好夥伴。",
    price: 4590,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    stock: 15,
    category: "electronics",
  },
  {
    name: "有機棉圓領 T 恤",
    description: "100% 有機棉材質，親膚透氣，簡約版型適合日常穿搭。",
    price: 690,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    stock: 60,
    category: "clothing",
  },
  {
    name: "休閒連帽外套",
    description: "厚實刷毛內裡，鬆緊袖口設計，秋冬保暖又好搭。",
    price: 1580,
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
    stock: 28,
    category: "clothing",
  },
  {
    name: "經典皮革錢包",
    description: "義大利頭層牛皮手工縫製，多卡層設計，兼具質感與實用性。",
    price: 1280,
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop",
    stock: 18,
    category: "accessories",
  },
  {
    name: "帆布托特包",
    description: "厚磅帆布材質，內建筆電隔層，容量充足適合通勤與週末出遊。",
    price: 980,
    imageUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop",
    stock: 22,
    category: "accessories",
  },
  {
    name: "極簡金屬項鍊",
    description: "925 純銀鍍金材質，低調曲線設計，日常與正式場合皆宜。",
    price: 1120,
    imageUrl:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
    stock: 35,
    category: "accessories",
  },
];

async function main() {
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: products });
  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
