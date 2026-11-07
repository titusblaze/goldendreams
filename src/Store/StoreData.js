
export const STORE_CATEGORIES = [
  {
    id: "gifts",
    name: "Gifts",
    description: "Personalized gifts for every special moment",
  },
  {
    id: "photo-products",
    name: "Photo Products",
    description: "Turn your memories into beautiful keepsakes",
  },
  {
    id: "combo-packages",
    name: "Combo Packages",
    description: "Beautifully curated packages at special prices",
  },
  {
    id: "customize",
    name: "Customize",
    description: "Create a package made just for you",
  },
];

export const STORE_PRODUCTS = [
  // Gifts
  {
    id: "gift-1",
    name: "Personalized Keychain",
    category: "gifts",
    price: 149,
    description: "A memorable keychain with your favourite photo.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },
  {
    id: "gift-2",
    name: "USB Pouch",
    category: "gifts",
    price: 199,
    description: "A stylish pouch to keep your USB drive safe.",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },
  {
    id: "gift-3",
    name: "Photo Magnet",
    category: "gifts",
    price: 129,
    description: "Beautiful photo magnets for your memories.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },
  {
    id: "gift-4",
    name: "Thank You Cards",
    category: "gifts",
    price: 249,
    description: "Personalized cards for your special occasions.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },

  // Photo Products
  {
    id: "photo-1",
    name: "USB Drive",
    category: "photo-products",
    price: 499,
    description: "Keep your precious photos and videos safe.",
    image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },
  {
    id: "photo-2",
    name: "Photo Album",
    category: "photo-products",
    price: 999,
    description: "A beautiful album to preserve your memories.",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },
  {
    id: "photo-3",
    name: "Photo Frame",
    category: "photo-products",
    price: 399,
    description: "Display your favourite moments beautifully.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },
  {
    id: "photo-4",
    name: "Photo Box",
    category: "photo-products",
    price: 699,
    description: "A special box for storing your photographs.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },

  // Combo Packages
  {
    id: "combo-1",
    name: "Memory Gift Combo",
    category: "combo-packages",
    price: 999,
    description: "A thoughtful combination of personalized photo gifts.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },
  {
    id: "combo-2",
    name: "Premium Photo Combo",
    category: "combo-packages",
    price: 1499,
    description: "A premium collection for your memorable occasions.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    customizable: true,
  },
];

export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  
export const STORE_PACKAGES = [
  {
    id: "mini",
    name: "Mini Memories",
    price: 999,
    description: "A lovely little collection of special memories.",
    includes: [
      { productId: "gift-1", quantity: 1 },
      { productId: "gift-3", quantity: 1 },
    ],
  },
  {
    id: "classic",
    name: "Classic Memories",
    price: 1499,
    description: "A beautiful combination of personalized gifts.",
    includes: [
      { productId: "gift-1", quantity: 1 },
      { productId: "photo-3", quantity: 1 },
      { productId: "gift-4", quantity: 1 },
    ],
  },
  {
    id: "premium",
    name: "Premium Memories",
    price: 2499,
    description: "A premium collection for unforgettable occasions.",
    includes: [
      { productId: "photo-2", quantity: 1 },
      { productId: "photo-3", quantity: 1 },
      { productId: "gift-1", quantity: 1 },
      { productId: "photo-1", quantity: 1 },
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate Memories",
    price: 3999,
    description: "A complete personalized gifting experience.",
    includes: [
      { productId: "photo-2", quantity: 1 },
      { productId: "photo-3", quantity: 1 },
      { productId: "photo-4", quantity: 1 },
      { productId: "photo-1", quantity: 1 },
      { productId: "gift-1", quantity: 2 },
    ],
  },
];

// GOOGLE SHEETS API

export const STORE_API_URL =
  "https://script.google.com/macros/s/AKfycbzbM3JMUv178dbZaScLqO6LKjZ_pODszzNXcTVk1yWUKLp4xTTk9tNKZmYAyPzfHel_CQ/exec";

const normalizeStoreId = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, "-");

export const fetchStoreData = async () => {
  const response = await fetch(STORE_API_URL);

  if (!response.ok) {
    throw new Error("Unable to load Google Sheets store data.");
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error("Invalid store API response.");
  }

  const data = result.data;

  const categories = (data.categories || []).map((category) => ({
    ...category,
    id: normalizeStoreId(category.id),
  }));

  // Customize is a built-in package builder section.
  if (!categories.some((category) => category.id === "customize")) {
    categories.push({
      id: "customize",
      name: "Customize",
      description: "Create a package made just for you",
    });
  }

  const activeCategoryIds = new Set(
    categories.map((category) => category.id)
  );

  // Products belonging to inactive categories won't be displayed.
  const products = (data.products || [])
    .map((product) => ({
      ...product,
      category: normalizeStoreId(product.category),
      price: Number(product.price) || 0,
    }))
    .filter((product) => activeCategoryIds.has(product.category));

  const activeProductIds = new Set(
    products.map((product) => String(product.id))
  );

  const packages = (data.packages || []).map((pkg) => ({
    ...pkg,
    category: normalizeStoreId(pkg.category || "Combo Packages"),
    price: Number(pkg.price) || 0,
    includes: (pkg.items || [])
      .filter((item) =>
        activeProductIds.has(String(item.productId))
      )
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity) || 1,
      })),
  }));

  return { categories, products, packages };
};