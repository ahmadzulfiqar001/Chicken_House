import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeLocalImageKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, " plus ")
    .replace(/\//g, " ")
    .replace(/_/g, " ")
    .replace(/shwarma/g, "shawarma")
    .replace(/karahai/g, "karahi")
    .replace(/behari/g, "behari")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeCategoryKey = (value: string) => slugify(value);

const LOCAL_MENU_IMAGE_ROOT = path.resolve(__dirname, "..", "public", "menu-library");

const LOCAL_CATEGORY_FOLDERS: Record<string, string[]> = {
  pizza: ["pizza"],
  burgers: ["burger"],
  sandwiches: ["sandwich"],
  pasta: ["pasta"],
  "wraps-shawarma": ["wraps"],
  "arabic-broast": ["arabic broast"],
  "nuggets-wings": ["nuggets and wings"],
  fries: ["fries"],
  "pakistani-specials": ["pakistani specials"],
  "continental-karahi": ["continental"],
  shinwari: ["shinwari"],
  bbq: ["bbq"],
  "bbq-platters": ["bbq platter"],
  chinese: ["bbq platter"],
  "rice-biryani": ["rice and biryani"],
  fish: ["fish"],
  "tawa-specials": ["tawa specials"],
  soup: ["soups"],
  "tandoor-bread": ["tandoor bread"],
  "salad-raita": ["raita and salad"],
  desserts: ["deserts"],
};

const LOCAL_IMAGE_ALIASES: Record<string, string> = {
  "pizza::crown crust": "pizza/Crown Crust pizza.jpg",
  "pizza::behari kabab": "pizza/Behari Kabab pizza.jpg",
  "pizza::kabab stuffer with malai boti": "pizza/Kabab Stuffer with Malai Boti pizza.png",
  "pizza::thin crust": "pizza/Thin Crust pizza.jpg",
  "burgers::mag 60": "Burger/Mag 60 burger.png",
  "burgers::pizza zinger": "Burger/Chicken Burger.jpg",
  "wraps-shawarma::zinger shawarma": "wraps/zinger shwarma.png",
  "wraps-shawarma::chicken shawarma": "wraps/chicken shwarma.png",
  "arabic-broast::full broast": "Arabic Broast/full arabic broast.png",
  "nuggets-wings::5 pcs nuggets": "Nuggets and wings/nuggets.jpg",
  "nuggets-wings::10 pcs nuggets": "Nuggets and wings/nuggets.jpg",
  "nuggets-wings::5 pcs wings": "Nuggets and wings/bbq wings.jpg",
  "nuggets-wings::10 pcs wings": "Nuggets and wings/bbq wings.jpg",
  "nuggets-wings::spicy wings deal plus drink": "Nuggets and wings/spicy wings _ drinks.png",
  "nuggets-wings::spicy wings deal drink": "Nuggets and wings/spicy wings _ drinks.png",
  "fries::plain fries": "Fries/fries.png",
  "fries::loaded fries": "Fries/fries.png",
  "fries::dip sauce": "Fries/dip sauces.jpg",
  "continental-karahi::chicken achari karahi": "Continental/chicken achari karahai.png",
  "continental-karahi::kabab masala": "Continental/Kabab Masala (4 Kabab).jpg",
  "bbq::malai boti": "BBQ/Shish Tawook Boti.jpg",
  "chinese::shashlik manchurian": "bbq platter/Manchurian.jpg",
};

type LocalImageEntry = {
  relPath: string;
  normalizedFolder: string;
  normalizedName: string;
};

const LOCAL_IMAGE_INDEX: LocalImageEntry[] = (() => {
  if (!fs.existsSync(LOCAL_MENU_IMAGE_ROOT)) {
    return [];
  }

  const entries: LocalImageEntry[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      entries.push({
        relPath: path.relative(LOCAL_MENU_IMAGE_ROOT, fullPath).replace(/\\/g, "/"),
        normalizedFolder: normalizeLocalImageKey(path.basename(path.dirname(fullPath))),
        normalizedName: normalizeLocalImageKey(path.parse(entry.name).name),
      });
    }
  };

  walk(LOCAL_MENU_IMAGE_ROOT);
  return entries;
})();

const toLocalImageUrl = (relativePath: string) =>
  `/menu-library/${relativePath.split("/").map((segment) => encodeURIComponent(segment)).join("/")}`;

const resolveLocalMenuImage = (category: string, name: string) => {
  const normalizedCategory = normalizeCategoryKey(category);
  const normalizedName = normalizeLocalImageKey(name);
  const aliasKey = `${normalizedCategory}::${normalizedName}`;
  const aliasedPath = LOCAL_IMAGE_ALIASES[aliasKey];

  if (aliasedPath) {
    return toLocalImageUrl(aliasedPath);
  }

  const allowedFolders = new Set(
    (LOCAL_CATEGORY_FOLDERS[normalizedCategory] ?? []).map((folder) => normalizeLocalImageKey(folder)),
  );
  const scopedEntries = allowedFolders.size
    ? LOCAL_IMAGE_INDEX.filter((entry) => allowedFolders.has(entry.normalizedFolder))
    : LOCAL_IMAGE_INDEX;

  const exactMatch = scopedEntries.find((entry) => entry.normalizedName === normalizedName);
  if (exactMatch) {
    return toLocalImageUrl(exactMatch.relPath);
  }

  const relaxedMatch = scopedEntries.find(
    (entry) =>
      entry.normalizedName.includes(normalizedName) || normalizedName.includes(entry.normalizedName),
  );

  return relaxedMatch ? toLocalImageUrl(relaxedMatch.relPath) : null;
};

const IMAGE_LIBRARY = {
  pizza: "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1600&auto=format&fit=crop",
  sandwich: "https://images.unsplash.com/photo-1528736235302-52922df5c122?q=80&w=1600&auto=format&fit=crop",
  pasta: "https://cdn.pixabay.com/photo/2024/02/15/09/30/pasta-8574430_1280.jpg",
  shawarma: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1600&auto=format&fit=crop",
  broast: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1600&auto=format&fit=crop",
  wings: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=1600&auto=format&fit=crop",
  fries: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1600&auto=format&fit=crop",
  handi: "https://cdn.pixabay.com/photo/2022/06/10/05/20/chicken-karahi-7253714_1280.jpg",
  karahi: "https://cdn.pixabay.com/photo/2022/06/10/05/20/chicken-karahi-7253714_1280.jpg",
  bbq: "https://cdn.pixabay.com/photo/2016/10/25/13/42/kebab-1768422_1280.jpg",
  platter: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1600&auto=format&fit=crop",
  chinese: "https://cdn.pixabay.com/photo/2018/05/07/14/00/chicken-chowmein-3380834_1280.jpg",
  rice: "https://cdn.pixabay.com/photo/2022/07/01/07/13/chicken-biryani-7292658_1280.jpg",
  fish: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1600&auto=format&fit=crop",
  soup: "https://cdn.pixabay.com/photo/2018/11/09/15/39/hot-and-sour-soup-3804724_1280.jpg",
  bread: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=1600&auto=format&fit=crop",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
  dessert: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1600&auto=format&fit=crop",
  beverage: "https://cdn.pixabay.com/photo/2017/05/19/20/32/lemonade-2328925_1280.jpg",
  defaultFood: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
} as const;

const KEYWORD_IMAGES: Array<{ keyword: string; image: (typeof IMAGE_LIBRARY)[keyof typeof IMAGE_LIBRARY] }> = [
  { keyword: "pizza", image: IMAGE_LIBRARY.pizza },
  { keyword: "burger", image: IMAGE_LIBRARY.burger },
  { keyword: "sandwich", image: IMAGE_LIBRARY.sandwich },
  { keyword: "stacker", image: IMAGE_LIBRARY.sandwich },
  { keyword: "pasta", image: IMAGE_LIBRARY.pasta },
  { keyword: "lasania", image: IMAGE_LIBRARY.pizza },
  { keyword: "wrap", image: IMAGE_LIBRARY.shawarma },
  { keyword: "shawarma", image: IMAGE_LIBRARY.shawarma },
  { keyword: "broast", image: IMAGE_LIBRARY.broast },
  { keyword: "nugget", image: IMAGE_LIBRARY.wings },
  { keyword: "wing", image: IMAGE_LIBRARY.wings },
  { keyword: "fries", image: IMAGE_LIBRARY.fries },
  { keyword: "handi", image: IMAGE_LIBRARY.handi },
  { keyword: "karahi", image: IMAGE_LIBRARY.karahi },
  { keyword: "shinwari", image: IMAGE_LIBRARY.karahi },
  { keyword: "bbq", image: IMAGE_LIBRARY.bbq },
  { keyword: "bar-b-q", image: IMAGE_LIBRARY.bbq },
  { keyword: "tikka", image: IMAGE_LIBRARY.bbq },
  { keyword: "kabab", image: IMAGE_LIBRARY.bbq },
  { keyword: "boti", image: IMAGE_LIBRARY.bbq },
  { keyword: "platter", image: IMAGE_LIBRARY.platter },
  { keyword: "thaal", image: IMAGE_LIBRARY.platter },
  { keyword: "rice", image: IMAGE_LIBRARY.rice },
  { keyword: "biryani", image: IMAGE_LIBRARY.rice },
  { keyword: "pulao", image: IMAGE_LIBRARY.rice },
  { keyword: "chowmein", image: IMAGE_LIBRARY.chinese },
  { keyword: "manchurian", image: IMAGE_LIBRARY.chinese },
  { keyword: "shashlik", image: IMAGE_LIBRARY.chinese },
  { keyword: "dhaka", image: IMAGE_LIBRARY.chinese },
  { keyword: "black pepper", image: IMAGE_LIBRARY.chinese },
  { keyword: "cashewnut", image: IMAGE_LIBRARY.chinese },
  { keyword: "fish", image: IMAGE_LIBRARY.fish },
  { keyword: "soup", image: IMAGE_LIBRARY.soup },
  { keyword: "naan", image: IMAGE_LIBRARY.bread },
  { keyword: "roti", image: IMAGE_LIBRARY.bread },
  { keyword: "paratha", image: IMAGE_LIBRARY.bread },
  { keyword: "salad", image: IMAGE_LIBRARY.salad },
  { keyword: "raita", image: IMAGE_LIBRARY.salad },
  { keyword: "pastry", image: IMAGE_LIBRARY.dessert },
  { keyword: "brownie", image: IMAGE_LIBRARY.dessert },
  { keyword: "cake", image: IMAGE_LIBRARY.dessert },
  { keyword: "ice cream", image: IMAGE_LIBRARY.dessert },
  { keyword: "gulab", image: IMAGE_LIBRARY.dessert },
  { keyword: "coke", image: IMAGE_LIBRARY.beverage },
  { keyword: "sprite", image: IMAGE_LIBRARY.beverage },
  { keyword: "water", image: IMAGE_LIBRARY.beverage },
];

export const imageFor = (category: string, name: string, subcategory: string) => {
  const localImage = resolveLocalMenuImage(category, name);

  if (localImage) {
    return localImage;
  }

  const haystack = `${name} ${category} ${subcategory}`.toLowerCase();
  const match = KEYWORD_IMAGES.find((entry) => haystack.includes(entry.keyword));

  if (match) {
    return match.image;
  }

  const normalizedCategory = slugify(category);

  if (normalizedCategory.includes("pizza")) return IMAGE_LIBRARY.pizza;
  if (normalizedCategory.includes("burger")) return IMAGE_LIBRARY.burger;
  if (normalizedCategory.includes("sandwich")) return IMAGE_LIBRARY.sandwich;
  if (normalizedCategory.includes("pasta")) return IMAGE_LIBRARY.pasta;
  if (normalizedCategory.includes("shawarma") || normalizedCategory.includes("wrap")) return IMAGE_LIBRARY.shawarma;
  if (normalizedCategory.includes("broast")) return IMAGE_LIBRARY.broast;
  if (normalizedCategory.includes("wings") || normalizedCategory.includes("nuggets")) return IMAGE_LIBRARY.wings;
  if (normalizedCategory.includes("fries")) return IMAGE_LIBRARY.fries;
  if (normalizedCategory.includes("pakistani") || normalizedCategory.includes("karahi") || normalizedCategory.includes("shinwari")) {
    return IMAGE_LIBRARY.karahi;
  }
  if (normalizedCategory.includes("bbq")) return IMAGE_LIBRARY.bbq;
  if (normalizedCategory.includes("chinese")) return IMAGE_LIBRARY.chinese;
  if (normalizedCategory.includes("rice")) return IMAGE_LIBRARY.rice;
  if (normalizedCategory.includes("fish")) return IMAGE_LIBRARY.fish;
  if (normalizedCategory.includes("soup")) return IMAGE_LIBRARY.soup;
  if (normalizedCategory.includes("tandoor") || normalizedCategory.includes("bread")) return IMAGE_LIBRARY.bread;
  if (normalizedCategory.includes("salad")) return IMAGE_LIBRARY.salad;
  if (normalizedCategory.includes("dessert")) return IMAGE_LIBRARY.dessert;
  if (normalizedCategory.includes("beverage")) return IMAGE_LIBRARY.beverage;

  return IMAGE_LIBRARY.defaultFood;
};

const mergeUsage = (...parts: Array<Record<string, number>>) =>
  parts.reduce<Record<string, number>>((acc, part) => {
    Object.entries(part).forEach(([key, value]) => {
      acc[key] = Number(((acc[key] ?? 0) + value).toFixed(2));
    });
    return acc;
  }, {});

const chickenBase = { "Fresh Chicken": 0.28, "Cooking Oil": 0.03, "Spices Mix": 0.02 };
const muttonBase = { "Fresh Mutton": 0.3, "Cooking Oil": 0.03, "Spices Mix": 0.02 };
const beefBase = { "Fresh Beef": 0.28, "Cooking Oil": 0.03, "Spices Mix": 0.02 };
const fishBase = { "Fish Fillet": 0.26, "Cooking Oil": 0.03, "Spices Mix": 0.01 };
const riceBase = { "Basmati Rice": 0.24, "Spices Mix": 0.01 };
const pastaBase = { Pasta: 0.22, Cheese: 0.07, "Sauces Base": 0.05 };
const pizzaBase = { "Pizza Dough Base": 1, Cheese: 0.12, "Sauces Base": 0.04 };
const burgerBase = { "Burger Buns": 1, Lettuce: 0.03, "Sauces Base": 0.03 };
const bbqBase = { "BBQ Marinade": 0.05, "Cooking Oil": 0.02, "Spices Mix": 0.02 };
const breadBase = { Flour: 0.18, "Cooking Oil": 0.01 };
const friesBase = { Potatoes: 0.22, "Cooking Oil": 0.03 };
const saladBase = { "Mixed Vegetables": 0.16, Lettuce: 0.04 };
const yogurtBase = { Yogurt: 0.1 };
const soupBase = { "Soup Stock": 0.28, "Mixed Vegetables": 0.08, "Spices Mix": 0.01 };
const drinkBase = { "Soft Drink Syrup": 0.18 };
const dessertBase = { Milk: 0.12, "Dry Fruits": 0.02 };
const cheeseBase = { Cheese: 0.1 };

const getProteinBase = (name: string) => {
  const normalized = name.toLowerCase();

  if (normalized.includes("mutton")) return muttonBase;
  if (normalized.includes("beef") || normalized.includes("chappli")) return beefBase;
  if (normalized.includes("fish")) return fishBase;
  if (
    normalized.includes("vegetable") ||
    normalized.includes("veg") ||
    normalized.includes("salad") ||
    normalized.includes("raita") ||
    normalized.includes("daal") ||
    normalized.includes("ice cream") ||
    normalized.includes("water") ||
    normalized.includes("coke") ||
    normalized.includes("sprite")
  ) {
    return {};
  }

  return chickenBase;
};

const getInventoryUsage = (category: string, name: string, subcategory: string) => {
  const normalizedCategory = category.toLowerCase();
  const normalizedName = name.toLowerCase();
  const normalizedSubcategory = subcategory.toLowerCase();
  const protein = getProteinBase(name);

  if (normalizedCategory.includes("pizza")) {
    return mergeUsage(pizzaBase, protein, normalizedName.includes("cheese") ? cheeseBase : {});
  }

  if (normalizedCategory.includes("burger")) {
    return mergeUsage(burgerBase, protein, normalizedName.includes("grilled") ? bbqBase : {});
  }

  if (normalizedCategory.includes("sandwich")) {
    return mergeUsage(breadBase, protein, cheeseBase);
  }

  if (normalizedCategory.includes("pasta")) {
    return mergeUsage(pastaBase, protein);
  }

  if (normalizedCategory.includes("wrap") || normalizedCategory.includes("shawarma")) {
    return mergeUsage(breadBase, protein, { "Sauces Base": 0.04 });
  }

  if (normalizedCategory.includes("broast") || normalizedCategory.includes("wings") || normalizedCategory.includes("nuggets")) {
    return mergeUsage(chickenBase, bbqBase);
  }

  if (normalizedCategory.includes("fries")) {
    return friesBase;
  }

  if (normalizedCategory.includes("pakistani") || normalizedCategory.includes("karahi") || normalizedCategory.includes("shinwari")) {
    return mergeUsage(protein, breadBase, normalizedName.includes("daal") ? riceBase : {});
  }

  if (normalizedCategory.includes("bbq")) {
    return mergeUsage(protein, bbqBase);
  }

  if (normalizedCategory.includes("chinese")) {
    if (normalizedName.includes("rice") || normalizedName.includes("biryani") || normalizedName.includes("pulao")) {
      return mergeUsage(protein, riceBase, { "Mixed Vegetables": 0.08 });
    }

    return mergeUsage(protein, pastaBase, { "Mixed Vegetables": 0.08 });
  }

  if (normalizedCategory.includes("rice")) {
    return mergeUsage(protein, riceBase, normalizedName.includes("biryani") ? yogurtBase : {});
  }

  if (normalizedCategory.includes("fish")) {
    return fishBase;
  }

  if (normalizedCategory.includes("soup")) {
    return mergeUsage(soupBase, normalizedName.includes("fish") ? fishBase : protein);
  }

  if (normalizedCategory.includes("tandoor") || normalizedSubcategory.includes("bread")) {
    return mergeUsage(breadBase, normalizedName.includes("chicken") ? chickenBase : {}, normalizedName.includes("cheese") ? cheeseBase : {});
  }

  if (normalizedCategory.includes("salad")) {
    return normalizedName.includes("raita") ? yogurtBase : saladBase;
  }

  if (normalizedCategory.includes("dessert")) {
    return dessertBase;
  }

  if (normalizedCategory.includes("beverage")) {
    return normalizedName.includes("water") ? {} : drinkBase;
  }

  return protein;
};

const toVariants = (entries: Array<[string, number | null | undefined]>) =>
  entries
    .filter(([, price]) => Number.isFinite(price) && Number(price) > 0)
    .map(([label, price]) => ({ label, price: Number(price) }));

const createDescription = (
  name: string,
  category: string,
  subcategory: string,
  variantLabels: string[],
) => {
  const sizeText = variantLabels.length ? ` Available in ${variantLabels.join(", ")} servings.` : "";
  return `${name} from our ${category.toLowerCase()} menu, served in the ${subcategory.toLowerCase()} style.${sizeText}`;
};

type RawMenuEntry = {
  category: string;
  subcategory: string;
  name: string;
  variants: Array<[string, number | null | undefined]>;
  recommended?: boolean;
  status?: "Active" | "Coming Soon";
};

const createGroup = (
  category: string,
  subcategory: string,
  items: Array<[string, Record<string, number | null | undefined>]>,
): RawMenuEntry[] =>
  items.map(([name, prices]) => ({
    category,
    subcategory,
    name,
    variants: Object.entries(prices),
  }));

const recommendedItems = new Set([
  "Chicken House Special",
  "Malai Boti Pizza",
  "Kabab Stuffer with Malai Boti",
  "Tower Burger",
  "Chicken Grilled Burger",
  "Chicken House Special Pasta",
  "Zinger Wrap",
  "Loaded Fries",
  "Chicken Boneless Handi",
  "Chicken Special Handi",
  "Mix Bar-B-Q Thaal",
  "Dhaka Chicken",
  "Special Chicken Biryani",
  "Three Milk Pastry",
  "Hot & Sour Soup",
]);

const rawMenuEntries: RawMenuEntry[] = [
  ...createGroup("Pizza", "Classic Pizza Flavours", [
    ["Chicken Fajita", { Small: 550, Medium: 1120, Large: 1590, Family: 2250 }],
    ["Chicken Tikka", { Small: 550, Medium: 1120, Large: 1590, Family: 2250 }],
    ["Bar-B-Q Pizza", { Small: 690, Medium: 1490, Large: 2050, Family: 2590 }],
    ["Chicken House Special", { Small: 690, Medium: 1490, Large: 2050, Family: 2590 }],
    ["Vegetable Pizza", { Small: 530, Medium: 1050, Large: 1550, Family: 2090 }],
    ["Cheese Lover", { Small: 530, Medium: 1050, Large: 1550, Family: 2090 }],
  ]),
  ...createGroup("Pizza", "New Flavour Pizzas", [
    ["Lazania Pizza", { Medium: 1550, Large: 2150, Family: 2650 }],
    ["Malai Boti Pizza", { Small: 690, Medium: 1550, Large: 2150, Family: 2650 }],
    ["Kabab Stuffer", { Small: 690, Medium: 1490, Large: 2050, Family: 2590 }],
    ["Crown Crust", { Small: 690, Medium: 1490, Large: 2050, Family: 2590 }],
    ["Bonfire Pizza", { Small: 650, Medium: 1250, Large: 1890, Family: 2390 }],
    ["Behari Kabab", { Small: 690, Medium: 1490, Large: 2050, Family: 2590 }],
    ["Supreme Pizza", { Small: 690, Medium: 1250, Large: 1890, Family: 2390 }],
    ["Kabab Stuffer with Malai Boti", { Small: 720, Medium: 1550, Large: 2250, Family: 2750 }],
    ["Thin Crust", { Small: 550, Medium: 1120, Large: 1590, Family: 2250 }],
  ]),
  ...createGroup("Burgers", "Signature Burgers", [
    ["Krizona Burger", { Regular: 480 }],
    ["Chicken Burger", { Regular: 320 }],
    ["Tower Burger", { Regular: 570 }],
    ["Chicken Grilled Burger", { Regular: 480 }],
    ["Mag 60", { Regular: 380 }],
    ["Fish Burger", { Regular: 550 }],
    ["Beef Grilled Burger", { Regular: 550 }],
    ["Twin Burger", { Regular: 590 }],
    ["Pizza Zinger", { Regular: 590 }],
    ["Chappli Kabab Burger", { Regular: 350 }],
  ]),
  ...createGroup("Sandwiches", "Sandwich Favourites", [
    ["Tikka Sandwich", { Regular: 350 }],
    ["Club Sandwich", { Regular: 200 }],
    ["Pizza Sandwich", { Regular: 800 }],
    ["Cheese Stacker", { Regular: 650 }],
  ]),
  ...createGroup("Pasta", "Pasta Bowls", [
    ["Chicken Pasta", { Half: 420, Full: 630 }],
    ["Zinger Pasta", { Half: 490, Full: 750 }],
    ["Creamy Pasta", { Half: 490, Full: 720 }],
    ["Hot & Spicy Pasta", { Half: 450, Full: 650 }],
    ["Chicken House Special Pasta", { Half: 490, Full: 750 }],
  ]),
  ...createGroup("Wraps & Shawarma", "Wraps", [
    ["Grilled Chicken Wrap", { Regular: 490 }],
    ["Malai Boti Wrap", { Regular: 570 }],
    ["Zinger Wrap", { Regular: 490 }],
    ["Twister Wrap", { Regular: 450 }],
  ]),
  ...createGroup("Wraps & Shawarma", "Shawarma", [
    ["Zinger Shawarma", { Small: 320, Large: 480 }],
    ["Chicken Shawarma", { Regular: 260 }],
  ]),
  ...createGroup("Arabic Broast", "Broast Platters", [
    ["Quarter Broast", { "2 pcs": 690 }],
    ["Half Broast", { "4 pcs": 1150 }],
    ["Full Broast", { "8 pcs": 2140 }],
  ]),
  ...createGroup("Nuggets & Wings", "Snacks & Deals", [
    ["5 PCS Nuggets", { Regular: 280 }],
    ["10 PCS Nuggets", { Regular: 530 }],
    ["5 PCS Wings", { Regular: 350 }],
    ["10 PCS Wings", { Regular: 630 }],
    ["BBQ Wings", { Regular: 630 }],
    ["Hot Bites", { Regular: 750 }],
    ["Hot Wings Deal + Drink", { Regular: 740 }],
    ["Spicy Wings Deal + Drink", { Regular: 740 }],
  ]),
  ...createGroup("Fries", "Fries & Dips", [
    ["Plain Fries", { Regular: 280, Large: 380 }],
    ["Loaded Fries", { Regular: 680 }],
    ["Dip Sauce", { Regular: 50 }],
  ]),
  ...createGroup("Pakistani Specials", "Chicken & Veg Specials", [
    ["Chicken Boneless Handi", { Half: 1190, Full: 2350 }],
    ["Chicken Jalfarezi", { Half: 1140 }],
    ["Chicken Ginger", { Half: 1140 }],
    ["Chicken Green Chilli Lime", { Half: 1140 }],
    ["Chicken Boneless Bangali", { Half: 1280, Full: 2550 }],
    ["Chicken Special Handi", { Half: 1280, Full: 2550 }],
    ["Chicken White Handi", { Half: 1280, Full: 2550 }],
    ["Chicken Madarsi Handi", { Half: 1190, Full: 2380 }],
    ["Haiderabadi Handi", { Half: 1190, Full: 2380 }],
    ["Butter Chicken", { Full: 1190 }],
    ["Mint Chilli Chicken", { Full: 1050 }],
    ["Chicken White Jalfarazi", { Full: 1240 }],
    ["Dum Murgh Masala", { Full: 1390 }],
    ["Daal Mash Makhni", { Half: 280, Full: 450 }],
    ["Mix Vegetable", { Full: 450 }],
    ["Shahi Daal", { Full: 600 }],
    ["Mutton Handi", { Half: 1950, Full: 3850 }],
    ["Mutton Green Chilli Lime", { Half: 1850 }],
    ["Mutton Bangali", { Half: 1990, Full: 3950 }],
    ["Chef Special Mutton Kujja", { Full: 3990 }],
    ["Mutton Kujja (Shorba)", { Full: 3850 }],
  ]),
  ...createGroup("Continental / Karahi", "Karahi Classics", [
    ["Chicken Makhni Karahi", { Half: 990, Full: 1890 }],
    ["Chicken Karahi White", { Half: 1090, Full: 2040 }],
    ["Chicken Achari Karahi", { Half: 1050, Full: 1950 }],
    ["Beef Makhni Karahi", { Half: 1280, Full: 2490 }],
    ["Mutton Makhni Karahi", { Half: 1850, Full: 3590 }],
    ["Mutton Karahi White", { Half: 1950, Full: 3690 }],
    ["Kabab Masala", { "4 Kabab": 1290 }],
  ]),
  ...createGroup("Shinwari", "Full Platters", [
    ["Chicken Shinwari", { Full: 1950 }],
    ["Mutton Shinwari", { Full: 3850 }],
    ["Mutton Sulemani Namkeen", { Full: 3850 }],
  ]),
  ...createGroup("BBQ", "Grill Selection", [
    ["Chicken Piece (Leg)", { "Half Plate": 430, "Full Plate": 860 }],
    ["Malai Boti", { "Half Plate": 660, "Full Plate": 1320 }],
    ["Chicken Tikka", { "Half Plate": 520, "Full Plate": 1040 }],
    ["Achari Tikka", { "Half Plate": 540, "Full Plate": 1080 }],
    ["Chicken Kabab", { "Half Plate": 460, "Full Plate": 920 }],
    ["Special Kabab", { "Half Plate": 560, "Full Plate": 1120 }],
    ["Beef Kabab", { "Half Plate": 500, "Full Plate": 1000 }],
    ["Afghani Beef Kabab", { "Half Plate": 550, "Full Plate": 1100 }],
    ["Gola Kabab", { "Half Plate": 580, "Full Plate": 1160 }],
    ["Irani Tikka", { "Half Plate": 460, "Full Plate": 920 }],
    ["Shish Tawook Boti", { "Half Plate": 690, "Full Plate": 1380 }],
  ]),
  ...createGroup("BBQ Platters", "Sharing Platters", [
    ["Bar-B-Q Platter", { Regular: 2550 }],
    ["Mix Bar-B-Q Thaal", { Regular: 5590 }],
  ]),
  ...createGroup("Chinese", "Chinese Specialties", [
    ["Dhaka Chicken", { Regular: 980 }],
    ["Chicken Chilli Dry", { Regular: 980 }],
    ["Shashlik With Rice", { Regular: 780 }],
    ["Shashlik/Manchurian", { Regular: 880 }],
    ["Black Pepper", { Regular: 880 }],
    ["Cashewnut Chicken", { Regular: 1250 }],
    ["Manchurian With Rice", { Regular: 780 }],
    ["Chicken Chowmein", { Regular: 750 }],
    ["Chicken Hot Plate", { Regular: 750 }],
    ["Chicken Garlic Sauce", { Regular: 690 }],
    ["Dhaka Fish", { Regular: 1480 }],
    ["Fish Chilli Dry", { Regular: 1290 }],
  ]),
  ...createGroup("Rice & Biryani", "Rice Bowls", [
    ["Chicken Fried Rice", { Half: 380, Full: 750 }],
    ["Chicken Masala Rice", { Half: 380, Full: 750 }],
    ["Egg Fried Rice", { Half: 350, Full: 650 }],
    ["Vegetable Rice", { Half: 350, Full: 650 }],
    ["Chicken Jungli Pulao", { Full: 1100 }],
    ["Special Chicken Biryani", { Full: 350 }],
    ["Matka Biryani", { Full: 1150 }],
  ]),
  ...createGroup("Fish", "Fish Specials", [
    ["Boneless Fish", { "6 strips": 1480 }],
    ["Grill Fish", { "1kg": 1850 }],
    ["Tawa Taka Tuck Fish", { Regular: 1990 }],
  ]),
  ...createGroup("Tawa Specials", "Tawa Favourites", [
    ["Tawa Mutton Champ", { Regular: 1500 }],
    ["Tawa Chicken Piece", { Regular: 650 }],
    ["Mutton Champ Masala", { Regular: 1500 }],
    ["Mughalai Piece", { Regular: 700 }],
    ["Tawa Makhani Malai", { Regular: 990 }],
    ["Beef Qeema", { Regular: 700 }],
  ]),
  ...createGroup("Soup", "Soup Bar", [
    ["Chicken Special Soup", { Half: 640, Family: 1150 }],
    ["Hot & Sour Soup", { Half: 490, Family: 890 }],
    ["Chicken Corn Soup", { Half: 490, Family: 890 }],
    ["Fish Cracker Soup", { Bowl: 250 }],
  ]),
  ...createGroup("Tandoor / Bread", "Fresh From Tandoor", [
    ["Chicken Cheese Naan", { Regular: 450 }],
    ["Kalwanji Naan", { Regular: 90 }],
    ["Garlic Naan", { Regular: 90 }],
    ["Special Roghni Naan", { Regular: 70 }],
    ["Khamiri Roti", { Regular: 50 }],
    ["Sada Roti", { Regular: 60 }],
    ["Mix Basket", { Regular: 300 }],
    ["Tandoori Paratha", { Regular: 110 }],
  ]),
  ...createGroup("Salad & Raita", "Sides", [
    ["Raita", { Regular: 80 }],
    ["Fresh Salad", { Regular: 120 }],
    ["Kachumar Salad", { Regular: 200 }],
  ]),
  ...createGroup("Desserts", "Sweet Finish", [
    ["Three Milk Pastry", { Regular: 300 }],
    ["Chocolate Brownie with Ice Cream", { Regular: 399 }],
    ["Hot Gulab Jaman", { Regular: 150 }],
    ["Ice Cream", { Regular: 120 }],
    ["Three Milk Cake", { "2 Pound": 1600 }],
  ]),
];

const createItem = (entry: RawMenuEntry, index: number) => {
  const variants = toVariants(entry.variants);
  const recommended = entry.recommended ?? recommendedItems.has(entry.name);

  return {
    id: `MENU-${String(index + 1).padStart(3, "0")}`,
    name: entry.name,
    category: entry.category,
    subcategory: entry.subcategory,
    description: createDescription(entry.name, entry.category, entry.subcategory, variants.map((variant) => variant.label)),
    image: imageFor(entry.category, entry.name, entry.subcategory),
    rating: recommended ? 4.9 : 4.7,
    status: entry.status ?? "Active",
    recommended,
    featured: recommended,
    popular: recommended,
    variants,
    inventoryUsage: getInventoryUsage(entry.category, entry.name, entry.subcategory),
  };
};

export const inventorySeed = [
  { id: 1, name: "Fresh Chicken", category: "Protein", stock: 260, unit: "kg", minStock: 80, price: 650 },
  { id: 2, name: "Fresh Mutton", category: "Protein", stock: 160, unit: "kg", minStock: 45, price: 1300 },
  { id: 3, name: "Fresh Beef", category: "Protein", stock: 220, unit: "kg", minStock: 60, price: 980 },
  { id: 4, name: "Fish Fillet", category: "Protein", stock: 90, unit: "kg", minStock: 25, price: 1200 },
  { id: 5, name: "Basmati Rice", category: "Grains", stock: 320, unit: "kg", minStock: 70, price: 350 },
  { id: 6, name: "Cooking Oil", category: "Ingredients", stock: 190, unit: "liters", minStock: 35, price: 450 },
  { id: 7, name: "Spices Mix", category: "Ingredients", stock: 95, unit: "kg", minStock: 20, price: 1200 },
  { id: 8, name: "Pizza Dough Base", category: "Bakery", stock: 150, unit: "pcs", minStock: 40, price: 180 },
  { id: 9, name: "Burger Buns", category: "Bakery", stock: 220, unit: "pcs", minStock: 50, price: 55 },
  { id: 10, name: "Flour", category: "Bakery", stock: 180, unit: "kg", minStock: 40, price: 160 },
  { id: 11, name: "Pasta", category: "Italian Base", stock: 150, unit: "kg", minStock: 35, price: 420 },
  { id: 12, name: "Cheese", category: "Dairy", stock: 120, unit: "kg", minStock: 25, price: 1450 },
  { id: 13, name: "Milk", category: "Dairy", stock: 140, unit: "liters", minStock: 25, price: 220 },
  { id: 14, name: "Yogurt", category: "Dairy", stock: 110, unit: "kg", minStock: 25, price: 240 },
  { id: 15, name: "Eggs", category: "Dairy", stock: 220, unit: "units", minStock: 60, price: 30 },
  { id: 16, name: "Mixed Vegetables", category: "Produce", stock: 160, unit: "kg", minStock: 35, price: 260 },
  { id: 17, name: "Lettuce", category: "Produce", stock: 60, unit: "kg", minStock: 15, price: 180 },
  { id: 18, name: "Potatoes", category: "Produce", stock: 170, unit: "kg", minStock: 40, price: 120 },
  { id: 19, name: "Fresh Mint", category: "Produce", stock: 45, unit: "kg", minStock: 10, price: 180 },
  { id: 20, name: "Lemons", category: "Produce", stock: 70, unit: "kg", minStock: 18, price: 160 },
  { id: 21, name: "Seasonal Fruits", category: "Produce", stock: 130, unit: "kg", minStock: 25, price: 280 },
  { id: 22, name: "Paneer", category: "Dairy", stock: 75, unit: "kg", minStock: 18, price: 980 },
  { id: 23, name: "Dry Fruits", category: "Premium Add-ons", stock: 35, unit: "kg", minStock: 10, price: 1500 },
  { id: 24, name: "Sauces Base", category: "Condiments", stock: 100, unit: "liters", minStock: 20, price: 260 },
  { id: 25, name: "Soft Drink Syrup", category: "Beverages", stock: 240, unit: "liters", minStock: 50, price: 190 },
  { id: 26, name: "Tea Leaves", category: "Beverages", stock: 28, unit: "kg", minStock: 7, price: 1200 },
  { id: 27, name: "Coffee Beans", category: "Beverages", stock: 40, unit: "kg", minStock: 10, price: 2200 },
  { id: 28, name: "BBQ Marinade", category: "Condiments", stock: 90, unit: "liters", minStock: 20, price: 520 },
  { id: 29, name: "Soup Stock", category: "Prepared Base", stock: 90, unit: "liters", minStock: 20, price: 310 },
];

export const menuSeed = rawMenuEntries.map(createItem);

export const getVariantFactor = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized.includes("family")) return 1.8;
  if (
    normalized.includes("full plate") ||
    normalized === "full" ||
    normalized === "large" ||
    normalized === "1.5l" ||
    normalized === "1kg" ||
    normalized.includes("8 pcs") ||
    normalized === "2 pound"
  ) {
    return 1.5;
  }
  if (
    normalized.includes("half plate") ||
    normalized === "half" ||
    normalized === "medium" ||
    normalized === "1l" ||
    normalized.includes("4 pcs")
  ) {
    return 1.15;
  }
  if (
    normalized === "small" ||
    normalized === "regular" ||
    normalized === "tin" ||
    normalized === "500ml" ||
    normalized.includes("2 pcs") ||
    normalized.includes("5 pcs")
  ) {
    return 0.85;
  }

  return 1;
};
