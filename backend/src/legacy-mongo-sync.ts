import mongoose from "mongoose";
import { BranchModel, InventoryModel, MenuModel, SiteSettingModel } from "./models";

type LegacyDoc = Record<string, unknown>;

const LEGACY_COLLECTIONS = [
  "categories",
  "ingredients",
  "menuitems",
  "orders",
  "recipes",
  "restaurantsettings",
  "users",
] as const;

const asRecordArray = (value: unknown): LegacyDoc[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is LegacyDoc => Boolean(entry) && typeof entry === "object")
    : [];

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
};

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return fallback;
};

const asObjectIdString = (value: unknown) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null && "toString" in value) {
    return String(value);
  }

  return "";
};

const toIsoString = (value: unknown, fallback = new Date().toISOString()) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  const raw = asString(value);
  if (raw && !Number.isNaN(Date.parse(raw))) {
    return new Date(raw).toISOString();
  }

  return fallback;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildLegacyVariants = (item: LegacyDoc) => {
  const basePrice = Math.max(0, asNumber(item.basePrice ?? item.price, 0));
  const portions = asRecordArray(item.portions);

  const portionVariants = portions
    .map((portion, index) => {
      const label =
        asString(
          portion.label ??
            portion.name ??
            portion.title ??
            portion.size ??
            portion.portion,
        ) || `Variant ${index + 1}`;
      const explicitPrice = asNumber(portion.price, Number.NaN);
      const multiplier = asNumber(portion.multiplier ?? portion.factor, Number.NaN);
      const resolvedPrice =
        Number.isFinite(explicitPrice) && explicitPrice >= 0
          ? explicitPrice
          : Number.isFinite(multiplier) && multiplier > 0
            ? Number((basePrice * multiplier).toFixed(2))
            : basePrice;

      return {
        label,
        price: Math.max(0, resolvedPrice),
      };
    })
    .filter((variant) => variant.label && Number.isFinite(variant.price));

  if (portionVariants.length > 0) {
    return portionVariants;
  }

  return [{ label: "Moderate", price: basePrice }];
};

const buildInventoryUsage = (
  recipe: LegacyDoc | undefined,
  ingredientMap: Map<string, LegacyDoc>,
) => {
  if (!recipe) {
    return {};
  }

  const wasteMultiplier = 1 + Math.max(0, asNumber(recipe.wastePercent, 0)) / 100;
  const usage: Record<string, number> = {};

  asRecordArray(recipe.ingredients).forEach((entry) => {
    const ingredientId = asObjectIdString(
      entry.ingredient ?? entry.ingredientId ?? entry.item ?? entry.ref,
    );
    const ingredientName =
      asString(ingredientMap.get(ingredientId)?.name) || asString(entry.name);
    const quantity = asNumber(
      entry.quantity ?? entry.amount ?? entry.qty ?? entry.value,
      0,
    );

    if (!ingredientName || quantity <= 0) {
      return;
    }

    usage[ingredientName] = Number((quantity * wasteMultiplier).toFixed(2));
  });

  return usage;
};

const buildBusinessHours = (openingHours: unknown) =>
  asRecordArray(openingHours).map((entry, index) => ({
    day:
      asString(entry.day ?? entry.label ?? entry.name ?? entry.weekday) ||
      `Day ${index + 1}`,
    open: asString(entry.open ?? entry.opensAt ?? entry.start ?? entry.from, "11:00"),
    close: asString(entry.close ?? entry.closesAt ?? entry.end ?? entry.to, "23:00"),
    isClosed: asBoolean(entry.isClosed ?? entry.closed, false),
  }));

const buildSocialLinks = (socialLinks: unknown) =>
  asRecordArray(socialLinks).map((entry, index) => ({
    platform:
      asString(entry.platform ?? entry.name ?? entry.label) || `platform-${index + 1}`,
    label: asString(entry.label ?? entry.platform ?? entry.name),
    url: asString(entry.url ?? entry.href ?? entry.link),
    handle: asString(entry.handle ?? entry.username),
  }));

const extractCity = (value: string) => {
  if (!value.trim()) {
    return "Renala Khurd";
  }

  const segments = value
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.at(-1) ?? "Renala Khurd";
};

const buildLegacyInventory = (ingredients: LegacyDoc[]) =>
  ingredients.map((ingredient, index) => ({
    id: index + 1,
    name: asString(ingredient.name, `Ingredient ${index + 1}`),
    category: asString(ingredient.category, "Ingredients"),
    stock: Math.max(0, asNumber(ingredient.currentStock ?? ingredient.stock, 0)),
    unit: asString(ingredient.unit, "pcs"),
    minStock: Math.max(0, asNumber(ingredient.reorderLevel ?? ingredient.minStock, 0)),
    price: Math.max(0, asNumber(ingredient.costPerUnit ?? ingredient.price, 0)),
    supplier: asString(ingredient.supplierName ?? ingredient.supplier, "Chicken House Supplier"),
    costPerUnit: Math.max(0, asNumber(ingredient.costPerUnit ?? ingredient.price, 0)),
    lastUpdated: toIsoString(ingredient.updatedAt ?? ingredient.createdAt),
  }));

const buildLegacyMenu = (
  menuItems: LegacyDoc[],
  categoryMap: Map<string, LegacyDoc>,
  recipeMap: Map<string, LegacyDoc>,
  ingredientMap: Map<string, LegacyDoc>,
) =>
  menuItems.map((item) => {
    const category = categoryMap.get(asObjectIdString(item.category));
    const categoryName = asString(category?.name, "House Specials");
    const stringTags = Array.isArray(item.tags)
      ? item.tags.map((entry) => asString(entry)).filter(Boolean)
      : [];
    const subcategory =
      asString(item.subcategory) || stringTags[0] || categoryName;
    const status =
      asBoolean(item.isAvailable, true) && asBoolean(category?.isActive, true)
        ? "Active"
        : "Coming Soon";
    const variants = buildLegacyVariants(item);
    const recipe = recipeMap.get(asObjectIdString(item._id));

    return {
      id: asObjectIdString(item._id) || asString(item.slug) || `MENU-${Date.now()}`,
      name: asString(item.name, "Chicken House Item"),
      category: categoryName,
      subcategory,
      description: asString(item.description, `${categoryName} item at Chicken House.`),
      image: asString(item.imageUrl ?? item.image),
      rating: asBoolean(item.isFeatured, false) ? 4.9 : 4.7,
      status,
      recommended: asBoolean(item.isFeatured, false),
      featured: asBoolean(item.isFeatured, false),
      popular: asBoolean(item.isPopular, false),
      variants,
      inventoryUsage: buildInventoryUsage(recipe, ingredientMap),
    };
  });

const buildSiteSetting = (settings: LegacyDoc) => {
  const businessName = asString(settings.businessName, "Chicken House");
  const tagline = asString(settings.tagline, "A Symbol of Quality & Freshness");
  const theme = (settings.theme as LegacyDoc | undefined) ?? {};
  const hero = (settings.hero as LegacyDoc | undefined) ?? {};
  const addressLine1 = asString(settings.address);

  return {
    key: "default",
    brandName: businessName,
    tagline,
    logoUrl: asString(settings.logoUrl),
    faviconUrl: asString(settings.faviconUrl),
    primaryColor: asString(
      theme.primaryColor ?? theme.primary ?? (theme.colors as LegacyDoc | undefined)?.primary,
      "#7f1215",
    ),
    accentColor: asString(
      theme.accentColor ?? theme.accent ?? (theme.colors as LegacyDoc | undefined)?.accent,
      "#d8a82f",
    ),
    contactEmail: asString(settings.supportEmail),
    contactPhone: asString(settings.contactNumber),
    whatsappNumber: asString(settings.whatsappNumber),
    addressLine1,
    city: asString(settings.city) || extractCity(addressLine1),
    mapEmbedUrl: asString(settings.mapEmbedUrl),
    businessHours: buildBusinessHours(settings.openingHours),
    socialLinks: buildSocialLinks(settings.socialLinks),
    seoTitle: [businessName, tagline].filter(Boolean).join(" | "),
    seoDescription: asString(hero.description) || tagline,
    maintenanceMode: asBoolean(settings.maintenanceMode, false),
    settings: {
      currency: asString(settings.currency, "PKR"),
      theme,
      hero,
      branches: settings.branches,
      sourceCollection: "restaurantsettings",
    },
  };
};

const buildBranches = (settings: LegacyDoc) => {
  const openingHours = buildBusinessHours(settings.openingHours);
  const rawBranches = asRecordArray(settings.branches);

  if (rawBranches.length === 0) {
    const businessName = asString(settings.businessName, "Chicken House");
    const address = asString(settings.address);
    const city = asString(settings.city) || extractCity(address);

    return [
      {
        id: "renala-khurd-main",
        name: `${businessName} Main Branch`,
        slug: "renala-khurd-main",
        status: "Active",
        manager: "",
        email: asString(settings.supportEmail),
        phone: asString(settings.contactNumber),
        addressLine1: address,
        addressLine2: "",
        city,
        landmark: "",
        coordinates: { lat: 0, lng: 0 },
        timings: openingHours,
        amenities: [],
        parkingAvailable: true,
        staffCount: 0,
        rating: 0,
        averageDailyOrders: 0,
        averageDailyRevenue: 0,
        gallery: [],
      },
    ];
  }

  return rawBranches.map((branch, index) => {
    const name = asString(branch.name, `Chicken House Branch ${index + 1}`);
    const slug = slugify(asString(branch.slug) || name || `branch-${index + 1}`) || `branch-${index + 1}`;
    const addressLine1 = asString(branch.address ?? branch.location ?? settings.address);
    const city = asString(branch.city) || extractCity(addressLine1);

    return {
      id: slug,
      name,
      slug,
      status: asBoolean(branch.isActive, true) ? "Active" : "Closed",
      manager: asString(branch.manager),
      email: asString(branch.email ?? settings.supportEmail),
      phone: asString(branch.phone ?? settings.contactNumber),
      addressLine1,
      addressLine2: asString(branch.addressLine2),
      city,
      landmark: asString(branch.landmark),
      coordinates: {
        lat: asNumber(branch.lat ?? (branch.coordinates as LegacyDoc | undefined)?.lat, 0),
        lng: asNumber(branch.lng ?? (branch.coordinates as LegacyDoc | undefined)?.lng, 0),
      },
      timings: openingHours,
      amenities: Array.isArray(branch.amenities)
        ? branch.amenities.map((entry) => asString(entry)).filter(Boolean)
        : [],
      parkingAvailable: asBoolean(branch.parkingAvailable, true),
      staffCount: Math.max(0, asNumber(branch.staffCount, 0)),
      rating: Math.max(0, asNumber(branch.rating, 0)),
      averageDailyOrders: Math.max(0, asNumber(branch.averageDailyOrders, 0)),
      averageDailyRevenue: Math.max(0, asNumber(branch.averageDailyRevenue, 0)),
      gallery: [],
    };
  });
};

export const syncLegacyMongoData = async () => {
  const database = mongoose.connection.db;

  if (!database) {
    return;
  }

  const collections = await database.listCollections({}, { nameOnly: true }).toArray();
  const availableCollections = new Set(collections.map((entry) => entry.name));
  const hasLegacyData = LEGACY_COLLECTIONS.some((name) => availableCollections.has(name));

  if (!hasLegacyData) {
    return;
  }

  const [inventoryCount, menuCount, siteSettingCount, branchCount] = await Promise.all([
    InventoryModel.estimatedDocumentCount(),
    MenuModel.estimatedDocumentCount(),
    SiteSettingModel.estimatedDocumentCount(),
    BranchModel.estimatedDocumentCount(),
  ]);

  if (inventoryCount === 0 && availableCollections.has("ingredients")) {
    const ingredients = await database.collection("ingredients").find().toArray();
    const mappedInventory = buildLegacyInventory(ingredients as LegacyDoc[]);

    if (mappedInventory.length > 0) {
      await InventoryModel.insertMany(mappedInventory);
      console.log(`Legacy Mongo sync: imported ${mappedInventory.length} inventory items from ingredients.`);
    }
  }

  if (menuCount === 0 && availableCollections.has("menuitems")) {
    const [menuItems, categories, recipes, ingredients] = await Promise.all([
      database.collection("menuitems").find().toArray(),
      availableCollections.has("categories")
        ? database.collection("categories").find().toArray()
        : Promise.resolve([]),
      availableCollections.has("recipes")
        ? database.collection("recipes").find().toArray()
        : Promise.resolve([]),
      availableCollections.has("ingredients")
        ? database.collection("ingredients").find().toArray()
        : Promise.resolve([]),
    ]);

    const categoryMap = new Map(
      (categories as LegacyDoc[]).map((category) => [
        asObjectIdString(category._id),
        category,
      ]),
    );
    const recipeMap = new Map(
      (recipes as LegacyDoc[]).map((recipe) => [
        asObjectIdString(recipe.menuItem),
        recipe,
      ]),
    );
    const ingredientMap = new Map(
      (ingredients as LegacyDoc[]).map((ingredient) => [
        asObjectIdString(ingredient._id),
        ingredient,
      ]),
    );

    const mappedMenu = buildLegacyMenu(
      menuItems as LegacyDoc[],
      categoryMap,
      recipeMap,
      ingredientMap,
    );

    if (mappedMenu.length > 0) {
      await MenuModel.insertMany(mappedMenu);
      console.log(`Legacy Mongo sync: imported ${mappedMenu.length} menu items from menuitems.`);
    }
  }

  if (siteSettingCount === 0 && availableCollections.has("restaurantsettings")) {
    const settings = ((await database
      .collection("restaurantsettings")
      .find()
      .limit(1)
      .toArray()) as LegacyDoc[])[0];

    if (settings) {
      await SiteSettingModel.create(buildSiteSetting(settings));
      console.log("Legacy Mongo sync: imported restaurant settings into siteSettings.");
    }
  }

  if (branchCount === 0 && availableCollections.has("restaurantsettings")) {
    const settings = ((await database
      .collection("restaurantsettings")
      .find()
      .limit(1)
      .toArray()) as LegacyDoc[])[0];

    if (settings) {
      const branches = buildBranches(settings);
      if (branches.length > 0) {
        await BranchModel.insertMany(branches);
        console.log(`Legacy Mongo sync: imported ${branches.length} branch records.`);
      }
    }
  }
};
