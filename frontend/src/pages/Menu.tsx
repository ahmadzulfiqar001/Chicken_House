import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Clock3,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import PageMeta from "../components/layout/PageMeta";
import { useToast } from "../components/layout/ToastProvider";
import { useCart } from "../context/CartContext";
import { siteConfig } from "../lib/site";

type MenuVariant = {
  label: string;
  price: number;
};

type MenuItem = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  image: string;
  rating: number;
  status: "Active" | "Coming Soon";
  recommended?: boolean;
  variants: MenuVariant[];
  startingPrice: number;
  stockStatus: string;
  available: boolean;
};

type CustomizationOption = {
  label: string;
  value: string;
  price?: number;
};

type MenuCustomizationState = {
  drink: string;
  chutney: string;
  spices: string;
  instructions: string;
  extras: string[];
};

const MENU_CACHE_KEY = "chicken-house-menu-cache";
const GROUPED_SNACK_CARD_NAMES = new Set([
  "5 PCS Nuggets",
  "10 PCS Nuggets",
  "5 PCS Wings",
  "10 PCS Wings",
]);
const SIDEBAR_CATEGORY_BUTTON_HEIGHT = 44;
const SIDEBAR_CATEGORY_BUTTON_GAP = 8;

const fallbackImageFor = (item: Pick<MenuItem, "name" | "category" | "subcategory">) => {
  const value = `${item.name} ${item.category} ${item.subcategory}`.toLowerCase();

  if (value.includes("karahi")) return "https://cdn.pixabay.com/photo/2022/06/10/05/20/chicken-karahi-7253714_1280.jpg";
  if (value.includes("biryani")) return "https://cdn.pixabay.com/photo/2022/07/01/07/13/chicken-biryani-7292658_1280.jpg";
  if (value.includes("nihari")) return "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop";
  if (value.includes("haleem")) return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1600&auto=format&fit=crop";
  if (value.includes("sajji")) return "https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=1600&auto=format&fit=crop";
  if (value.includes("lasagna")) return "https://images.unsplash.com/photo-1619894991209-9f9694be045a?q=80&w=1600&auto=format&fit=crop";
  if (value.includes("risotto")) return "https://images.unsplash.com/photo-1633964913295-ceb43826bd84?q=80&w=1600&auto=format&fit=crop";
  if (value.includes("pizza")) return "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg";
  if (value.includes("burger")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1600&auto=format&fit=crop";
  if (value.includes("pasta") || value.includes("spaghetti") || value.includes("macaroni")) {
    return "https://cdn.pixabay.com/photo/2024/02/15/09/30/pasta-8574430_1280.jpg";
  }
  if (value.includes("fried rice")) return "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1600&auto=format&fit=crop";
  if (value.includes("chowmein") || value.includes("noodles")) return "https://cdn.pixabay.com/photo/2018/05/07/14/00/chicken-chowmein-3380834_1280.jpg";
  if (value.includes("bbq") || value.includes("tikka") || value.includes("kebab")) return "https://cdn.pixabay.com/photo/2016/10/25/13/42/kebab-1768422_1280.jpg";
  if (value.includes("salad")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop";
  if (value.includes("coffee") || value.includes("tea") || value.includes("hot chocolate")) return "https://cdn.pixabay.com/photo/2020/08/08/04/37/coffee-5471023_1280.jpg";
  if (value.includes("lemonade") || value.includes("juice") || value.includes("margarita") || value.includes("drink")) {
    return "https://cdn.pixabay.com/photo/2017/05/19/20/32/lemonade-2328925_1280.jpg";
  }

  return siteConfig.imageFallback;
};

const getCachedMenu = (): MenuItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(MENU_CACHE_KEY);
    return stored ? (JSON.parse(stored) as MenuItem[]) : [];
  } catch (error) {
    console.error("Failed to read cached menu", error);
    return [];
  }
};

const hasCategory = (item: MenuItem, keywords: string[]) =>
  keywords.some((keyword) =>
    `${item.category} ${item.subcategory} ${item.name}`.toLowerCase().includes(keyword),
  );

const getSpiceOptions = (item: MenuItem): CustomizationOption[] => {
  if (hasCategory(item, ["desi", "bbq", "burger", "pizza", "chinese", "macaroni", "spaghetti"])) {
    return [
      { label: "Mild", value: "Mild" },
      { label: "Medium", value: "Medium" },
      { label: "Hot", value: "Hot" },
      { label: "Extra Hot", value: "Extra Hot" },
    ];
  }

  return [];
};

const getDrinkOptions = (item: MenuItem): CustomizationOption[] => {
  if (hasCategory(item, ["burger", "pizza", "pasta", "italian", "chinese", "bbq"])) {
    return [
      { label: "No drink", value: "" },
      { label: "Coke", value: "Coke" },
      { label: "Sprite", value: "Sprite" },
      { label: "Mint Margarita", value: "Mint Margarita" },
    ];
  }

  return [];
};

const getChutneyOptions = (item: MenuItem): CustomizationOption[] => {
  if (hasCategory(item, ["desi", "bbq", "biryani", "nihari", "haleem", "sajji", "kebab", "tikka"])) {
    return [
      { label: "No dip", value: "" },
      { label: "Mint Chutney", value: "Mint Chutney" },
      { label: "Raita", value: "Raita" },
      { label: "Hot Sauce", value: "Hot Sauce" },
    ];
  }

  return [];
};

const getExtraOptions = (item: MenuItem): CustomizationOption[] => {
  if (hasCategory(item, ["pizza"])) {
    return [
      { label: "Extra cheese", value: "Extra cheese", price: 180 },
      { label: "Garlic dip", value: "Garlic dip", price: 90 },
      { label: "Jalapeno topping", value: "Jalapeno topping", price: 120 },
    ];
  }

  if (hasCategory(item, ["burger"])) {
    return [
      { label: "Cheese slice", value: "Cheese slice", price: 100 },
      { label: "Loaded fries", value: "Loaded fries", price: 180 },
      { label: "Soft drink can", value: "Soft drink can", price: 120 },
    ];
  }

  if (hasCategory(item, ["desi", "bbq", "biryani", "nihari", "haleem", "sajji"])) {
    return [
      { label: "Butter naan", value: "Butter naan", price: 60 },
      { label: "Fresh raita", value: "Fresh raita", price: 70 },
      { label: "Mint chutney", value: "Mint chutney", price: 50 },
    ];
  }

  if (hasCategory(item, ["pasta", "italian", "spaghetti", "macaroni", "chinese"])) {
    return [
      { label: "Extra cheese", value: "Extra cheese", price: 140 },
      { label: "Garlic bread", value: "Garlic bread", price: 150 },
      { label: "Soft drink can", value: "Soft drink can", price: 120 },
    ];
  }

  return [];
};

const sanitizeSegment = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const createLineItemId = (
  item: MenuItem,
  variantLabel: string,
  customizationState: MenuCustomizationState,
) =>
  [
    item.id,
    sanitizeSegment(variantLabel),
    sanitizeSegment(customizationState.drink),
    sanitizeSegment(customizationState.chutney),
    sanitizeSegment(customizationState.spices),
    customizationState.extras.map(sanitizeSegment).sort().join("+"),
    sanitizeSegment(customizationState.instructions).slice(0, 36),
  ]
    .filter(Boolean)
    .join("::");

const MenuImage = ({ item, className }: { item: MenuItem; className?: string }) => {
  const resolvedImage = item.image || fallbackImageFor(item);
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(resolvedImage);

  useEffect(() => {
    setSrc((currentSrc) => {
      if (currentSrc === resolvedImage) {
        return currentSrc;
      }

      setLoaded(false);
      return resolvedImage;
    });
  }, [resolvedImage]);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-br from-surface via-white to-surface-strong transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <img
        src={src}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition-all duration-700 ${
          loaded ? "scale-100 opacity-100 group-hover:scale-[1.06]" : "scale-[1.03] opacity-0"
        }`}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => {
          const fallback = fallbackImageFor(item);
          if (src !== fallback) {
            setSrc(fallback);
            return;
          }

          setSrc("/restaurant-placeholder.svg");
          setLoaded(true);
        }}
      />
    </div>
  );
};

const LoadingCard = () => (
  <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-dark/5">
    <div className="h-64 animate-pulse bg-surface" />
    <div className="space-y-4 p-8">
      <div className="h-3 w-24 animate-pulse rounded-full bg-surface" />
      <div className="h-8 w-2/3 animate-pulse rounded-full bg-surface" />
      <div className="h-16 animate-pulse rounded-[1.5rem] bg-surface" />
      <div className="flex gap-3">
        <div className="h-10 w-24 animate-pulse rounded-full bg-surface" />
        <div className="h-10 w-24 animate-pulse rounded-full bg-surface" />
      </div>
      <div className="h-14 animate-pulse rounded-2xl bg-surface" />
    </div>
  </div>
);

const MenuPage = () => {
  const initialMenu = useMemo(() => getCachedMenu(), []);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenu);
  const [loading, setLoading] = useState(initialMenu.length === 0);
  const [refreshing, setRefreshing] = useState(initialMenu.length > 0);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "recommended" | "coming-soon">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<MenuCustomizationState>({
    drink: "",
    chutney: "",
    spices: "",
    instructions: "",
    extras: [],
  });
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const categoryRailRef = useRef<HTMLDivElement | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const fetchMenu = async () => {
      setError("");
      setLoading(initialMenu.length === 0);
      setRefreshing(initialMenu.length > 0);

      try {
        let response: Response | null = null;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            response = await fetch(new URL("/api/menu", window.location.origin).toString(), {
              headers: {
                Accept: "application/json",
              },
            });

            if (response.ok) break;
            lastError = new Error(`Menu request failed with status ${response.status}`);
          } catch (requestError) {
            lastError =
              requestError instanceof Error
                ? requestError
                : new Error("Unknown menu request error");
          }

          await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
        }

        if (!response) {
          throw lastError ?? new Error("Menu request did not complete.");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Failed to load menu.");
        }

        setMenuItems(data);
        window.localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(data));
      } catch (fetchError) {
        console.error(fetchError);

        if (initialMenu.length > 0) {
          setMenuItems(initialMenu);
          setError("Live menu is temporarily unavailable, so the saved menu is being shown.");
        } else {
          setError("The menu is not loading right now. Please try again shortly.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    void fetchMenu();
  }, [initialMenu]);

  const filteredItems = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    let next = [...menuItems];

    if (query) {
      next = next.filter((item) =>
        [item.name, item.category, item.subcategory, item.description].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }

    if (statusFilter === "available") {
      next = next.filter((item) => item.available);
    }

    if (statusFilter === "recommended") {
      next = next.filter((item) => item.recommended);
    }

    if (statusFilter === "coming-soon") {
      next = next.filter((item) => item.status !== "Active");
    }

    next.sort((left, right) => {
      if (sortBy === "price-low") return left.startingPrice - right.startingPrice;
      if (sortBy === "price-high") return right.startingPrice - left.startingPrice;
      if (sortBy === "rating") return right.rating - left.rating;

      return Number(Boolean(right.recommended)) - Number(Boolean(left.recommended));
    });

    return next;
  }, [deferredSearchQuery, menuItems, sortBy, statusFilter]);

  const categorySections = useMemo(() => {
    const sectionMap = new Map<string, MenuItem[]>();

    filteredItems.forEach((item) => {
      const currentItems = sectionMap.get(item.category);

      if (currentItems) {
        currentItems.push(item);
        return;
      }

      sectionMap.set(item.category, [item]);
    });

    return Array.from(sectionMap.entries()).map(([category, items]) => ({
      category,
      items,
      groupedSnackItems:
        category === "Nuggets & Wings"
          ? items.filter((item) => GROUPED_SNACK_CARD_NAMES.has(item.name))
          : [],
      standardItems:
        category === "Nuggets & Wings"
          ? items.filter((item) => !GROUPED_SNACK_CARD_NAMES.has(item.name))
          : items,
    }));
  }, [filteredItems]);
  const categories = useMemo(
    () => categorySections.map((section) => section.category),
    [categorySections],
  );
  const categoryItemCounts = useMemo(
    () =>
      new Map(
        categorySections.map((section) => [
          section.category,
          section.items.length,
        ]),
      ),
    [categorySections],
  );

  useEffect(() => {
    if (categories.length === 0) {
      setActiveCategory("");
      return;
    }

    if (!activeCategory || !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    if (!categories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute("data-category") ?? "");
          }
        });
      },
      {
        root: null,
        rootMargin: "-120px 0px -65% 0px",
        threshold: 0,
      },
    );

    Object.values(categoryRefs.current).forEach((element) => {
      if (element) observer.observe(element as Element);
    });

    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    if (!selectedItem) return;

    setSelectedVariantLabel(selectedItem.variants[0]?.label ?? "");
    setQuantity(1);
    setCustomizations({
      drink: "",
      chutney: "",
      spices: getSpiceOptions(selectedItem)[1]?.value ?? getSpiceOptions(selectedItem)[0]?.value ?? "",
      instructions: "",
      extras: [],
    });
  }, [selectedItem]);

  const selectedVariant =
    selectedItem?.variants.find((variant) => variant.label === selectedVariantLabel) ??
    selectedItem?.variants[0];

  const extraOptions = selectedItem ? getExtraOptions(selectedItem) : [];
  const drinkOptions = selectedItem ? getDrinkOptions(selectedItem) : [];
  const chutneyOptions = selectedItem ? getChutneyOptions(selectedItem) : [];
  const spiceOptions = selectedItem ? getSpiceOptions(selectedItem) : [];
  const extrasPrice = extraOptions.reduce(
    (sum, option) => sum + (customizations.extras.includes(option.value) ? option.price ?? 0 : 0),
    0,
  );
  const linePrice = (selectedVariant?.price ?? 0) + extrasPrice;

  const scrollToCategory = (category: string) => {
    const element = categoryRefs.current[category];

    if (!element) return;

    const offset = 100;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const position = elementRect - bodyRect - offset;

    window.scrollTo({
      top: position,
      behavior: "smooth",
    });
  };

  const toggleExtra = (value: string) => {
    setCustomizations((current) => ({
      ...current,
      extras: current.extras.includes(value)
        ? current.extras.filter((entry) => entry !== value)
        : [...current.extras, value],
    }));
  };

  const handleAddToCart = () => {
    if (!selectedItem || !selectedVariant || !selectedItem.available) return;

    const itemId = createLineItemId(selectedItem, selectedVariant.label, customizations);

    addToCart({
      id: itemId,
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      category: selectedItem.category,
      variantLabel: selectedVariant.label,
      price: linePrice,
      quantity,
      image: selectedItem.image || fallbackImageFor(selectedItem),
      customizations: {
        variantLabel: selectedVariant.label,
        drink: customizations.drink,
        chutney: customizations.chutney,
        spices: customizations.spices,
        instructions: customizations.instructions.trim(),
        extras: customizations.extras,
      },
    });

    showToast({
      tone: "success",
      title: "Added to cart",
      description: `${quantity} x ${selectedItem.name} is ready for checkout.`,
    });
    setSelectedItem(null);
  };

  const getStatusClasses = (item: MenuItem) => {
    if (item.status !== "Active") return "bg-white text-dark";
    if (item.stockStatus === "Out of Stock") return "bg-red-100 text-red-700";
    if (item.stockStatus === "Low Stock") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const activeCategoryIndex = categories.findIndex((category) => category === activeCategory);
  const activeCategoryProgress =
    categories.length > 0 && activeCategoryIndex >= 0
      ? ((activeCategoryIndex + 1) / categories.length) * 100
      : 0;
  const activeCategoryCount = activeCategory ? categoryItemCounts.get(activeCategory) ?? 0 : 0;
  const activeIndicatorOffset =
    activeCategoryIndex >= 0
      ? activeCategoryIndex * (SIDEBAR_CATEGORY_BUTTON_HEIGHT + SIDEBAR_CATEGORY_BUTTON_GAP)
      : 0;

  useEffect(() => {
    const rail = categoryRailRef.current;
    if (!rail || activeCategoryIndex < 0) return;

    const itemTop = activeIndicatorOffset;
    const itemBottom = itemTop + SIDEBAR_CATEGORY_BUTTON_HEIGHT;
    const viewTop = rail.scrollTop;
    const viewBottom = viewTop + rail.clientHeight;
    const breathingRoom = 12;

    if (itemTop < viewTop + breathingRoom) {
      rail.scrollTo({ top: Math.max(itemTop - breathingRoom, 0), behavior: "smooth" });
      return;
    }

    if (itemBottom > viewBottom - breathingRoom) {
      rail.scrollTo({
        top: itemBottom - rail.clientHeight + breathingRoom,
        behavior: "smooth",
      });
    }
  }, [activeCategoryIndex, activeIndicatorOffset]);

  return (
    <div className="min-h-screen bg-paper">
      <PageMeta
        title="Menu | Chicken House"
        description="Browse the full Chicken House menu with live categories, pricing, and optimized add-to-cart flow."
      />
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(127,18,21,0.18),transparent_48%),radial-gradient(circle_at_top_right,rgba(216,168,47,0.16),transparent_38%)]" />
        <div className="pointer-events-none absolute left-[18%] top-[22rem] h-64 w-64 rounded-full bg-primary/7 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[34rem] h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="mx-auto max-w-[106rem] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[28rem_minmax(0,1fr)]">
          <aside className="hidden xl:block xl:min-w-0 xl:h-full">
            <div className="space-y-4 xl:sticky xl:top-28">
              <div className="flex h-[calc(100vh-8.5rem)] min-h-[34rem] flex-col overflow-hidden rounded-[3rem] border border-[#eadcc8] bg-gradient-to-b from-[#fff9ef] via-white to-[#f8ecdb] shadow-[0_28px_80px_rgba(17,8,5,0.12)]">
                <div className="px-6 py-6">
                  <div className="rounded-[2rem] bg-white/85 p-5 shadow-inner shadow-white/70">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                          Active Position
                        </p>
                        <p className="mt-1 text-lg font-display font-bold text-dark">
                          {categories.length ? `${Math.max(activeCategoryIndex + 1, 1)} / ${categories.length}` : "0 / 0"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Items In View</p>
                        <p className="mt-1 text-lg font-display font-bold text-primary">{activeCategoryCount}</p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe3cf]">
                      <motion.div
                        animate={{ width: `${activeCategoryProgress}%` }}
                        transition={{ type: "spring", stiffness: 140, damping: 22 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      Sticky menu navigator with live section tracking.
                    </p>
                  </div>
                </div>

                <div className="min-h-0 flex-1 px-5 pb-6 pt-0">
                  <div ref={categoryRailRef} className="menu-category-rail relative h-full space-y-2 overflow-y-auto rounded-[2.2rem] bg-white/45 px-3 pb-4 pt-3 shadow-inner shadow-[#f4e8d6]">
                    {categories.length ? (
                      <motion.div
                        aria-hidden="true"
                        animate={{ y: activeIndicatorOffset }}
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                        className="pointer-events-none absolute inset-x-3 top-3 h-[44px] rounded-[1.1rem] bg-[linear-gradient(135deg,rgba(127,18,21,0.96),rgba(151,36,24,0.95),rgba(216,168,47,0.92))] shadow-[0_18px_28px_rgba(127,18,21,0.18)]"
                      />
                    ) : null}
                    {categories.map((category, index) => {
                      const isActive = activeCategory === category;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => scrollToCategory(category)}
                          className={`relative z-10 flex h-[44px] w-full items-center gap-3 overflow-hidden rounded-[1.1rem] border px-4 py-2 text-left leading-none transition-all duration-300 ${
                            isActive
                              ? "border-primary/15 bg-transparent text-white shadow-none"
                              : "border-transparent bg-white/80 text-dark shadow-sm shadow-dark/5 hover:border-[#eadcc8] hover:bg-white"
                          }`}
                        >
                          <span
                            className={`relative inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              isActive ? "bg-white/18 text-white" : "bg-surface text-primary"
                            }`}
                          >
                            {index + 1}
                          </span>

                          <span className="relative min-w-0 flex-1 truncate pr-2 text-[13px] font-bold">
                            {category}
                          </span>

                          <span
                            className={`relative inline-flex h-7 min-w-9 items-center justify-center rounded-full px-2 text-[10px] font-bold ${
                              isActive ? "bg-white/15 text-white" : "bg-surface text-dark"
                            }`}
                          >
                            {categoryItemCounts.get(category) ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-12 xl:border-l xl:border-[#efe0c7] xl:pl-10">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-bold text-dark shadow-lg shadow-dark/5">
              <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-surface px-3 text-primary">
                {filteredItems.length}
              </span>
              dishes visible
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="fixed right-5 top-28 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/25 transition-all duration-300 hover:scale-105 hover:bg-primary-strong"
              aria-label="Open menu filters"
            >
              <SlidersHorizontal size={22} />
            </button>
          </div>

          {!loading && categories.length ? (
            <div className="sticky top-28 z-20 -mt-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#eadcc8] bg-white/95 px-5 py-3 shadow-xl shadow-dark/5 backdrop-blur-sm">
                <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
                  Now Viewing
                </span>
                <span className="text-sm font-bold text-dark">{activeCategory || categories[0]}</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-primary">
                  {activeCategoryCount || (activeCategory ? 0 : categoryItemCounts.get(categories[0]) ?? 0)} items
                </span>
              </div>
            </div>
          ) : null}

          {refreshing ? (
            <div className="inline-flex items-center gap-3 rounded-full bg-amber-50 px-5 py-3 text-sm font-bold text-amber-800 shadow-lg shadow-amber-100/40">
              <Clock3 size={16} />
              Refreshing live menu in the background...
            </div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={`loading-${index}`} />
              ))}
            </div>
          ) : null}

          {!loading && error && categories.length === 0 ? (
            <div className="rounded-[3rem] border border-gray-50 bg-white p-12 text-center shadow-xl shadow-dark/5">
              <p className="text-lg font-bold text-dark">Menu unavailable</p>
              <p className="mt-3 text-muted">{error}</p>
            </div>
          ) : null}

          {!loading && error && categories.length > 0 ? (
            <div className="rounded-[2rem] border border-amber-100 bg-amber-50 px-6 py-4 text-amber-800 shadow-lg shadow-amber-100/30">
              {error}
            </div>
          ) : null}

          {!loading && !filteredItems.length ? (
            <div className="rounded-[3rem] border border-gray-50 bg-white p-12 text-center shadow-xl shadow-dark/5">
              <p className="text-lg font-bold text-dark">No dishes matched your filters</p>
              <p className="mt-3 text-muted">
                Try a broader search, switch the availability filter, or clear your custom sort.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSortBy("featured");
                }}
                className="mt-8 rounded-full bg-primary px-8 py-4 font-bold text-white"
              >
                Reset Menu Filters
              </button>
            </div>
          ) : null}

          {!loading &&
            categorySections.map(({ category, items: categoryItems, groupedSnackItems, standardItems: standardCategoryItems }) => {
              return (
                <section
                  key={category}
                  id={sanitizeSegment(category)}
                  data-category={category}
                  ref={(element) => {
                    categoryRefs.current[category] = element;
                  }}
                  className="scroll-mt-32"
                  style={{ contentVisibility: "auto", containIntrinsicSize: "1px 1400px" }}
                >
                  <div className="mb-10 flex items-center gap-6">
                    <h2 className="text-4xl font-display font-bold text-dark">{category}</h2>
                    <div className="h-px flex-1 bg-gray-100" />
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-muted shadow-lg shadow-dark/5">
                      {categoryItems.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {groupedSnackItems.length ? (
                      <article className="group overflow-hidden rounded-[2.8rem] border border-gray-100 bg-white shadow-2xl shadow-dark/6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
                        <div className="relative h-[25rem] overflow-hidden md:h-[27rem]">
                          <MenuImage item={groupedSnackItems[0]} className="h-full" />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-dark/10 to-transparent opacity-70" />
                          <div className="absolute left-6 top-6 rounded-full bg-accent px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-dark shadow-lg">
                            Snack Favorites
                          </div>
                          <div className="absolute bottom-6 left-6 max-w-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">One hero card</p>
                            <h3 className="mt-2 text-3xl font-bold leading-tight text-white">Nuggets & Wings Quick Picks</h3>
                          </div>
                        </div>

                        <div className="space-y-6 p-7">
                          <p className="text-sm leading-relaxed text-muted">
                            All the quick-bite counts are grouped in one tempting panel, with each option ready to open for selection.
                          </p>

                          <div className="space-y-3">
                            {groupedSnackItems.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                className="flex w-full items-center justify-between gap-4 rounded-[1.6rem] border border-[#f0e3cb] bg-surface/70 px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white"
                              >
                                <span className="min-w-0">
                                  <span className="block text-sm font-bold text-dark">{item.name}</span>
                                  <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                                    {item.variants[0]?.label ?? "Regular serving"}
                                  </span>
                                </span>
                                <span className="flex items-center gap-3">
                                  <span className="text-lg font-display font-bold text-primary">Rs. {item.startingPrice}</span>
                                  <span className="rounded-full bg-primary px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                                    Select
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </article>
                    ) : null}

                    {standardCategoryItems.map((item) => (
                      <article
                        key={item.id}
                        className="group flex flex-col overflow-hidden rounded-[2.8rem] border border-gray-100 bg-white shadow-xl shadow-dark/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
                      >
                        <div className="relative h-[24rem] overflow-hidden sm:h-[25rem] xl:h-[23rem] 2xl:h-[25rem]">
                          <MenuImage item={item} className="h-full" />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-dark/10 to-transparent opacity-55 transition-opacity duration-500 group-hover:opacity-80" />

                          <div className="absolute left-6 top-6 flex flex-col gap-2">
                            {item.recommended ? (
                              <span className="rounded-xl bg-accent px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-dark shadow-lg">
                                Recommended
                              </span>
                            ) : null}
                            <span
                              className={`rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg ${getStatusClasses(item)}`}
                            >
                              {item.status !== "Active" ? item.status : item.stockStatus}
                            </span>
                          </div>

                          <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2 font-bold text-dark shadow-lg backdrop-blur-sm">
                            <Star size={16} fill="#d8a82f" className="text-accent" />
                            {item.rating.toFixed(1)}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-5 p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                                {item.subcategory}
                              </p>
                              <h3 className="text-2xl font-bold text-dark transition-colors group-hover:text-primary">
                                {item.name}
                              </h3>
                            </div>
                            <span className="text-right">
                              <span className="block text-xs uppercase tracking-widest text-muted">
                                Starting
                              </span>
                              <span className="text-2xl font-display font-bold text-primary">
                                Rs. {item.startingPrice}
                              </span>
                            </span>
                          </div>

                          <p className="text-sm leading-relaxed text-muted">{item.description}</p>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {item.variants.map((variant) => (
                              <span
                                key={`${item.id}-${variant.label}`}
                                className="rounded-[1.4rem] border border-[#f0e3cb] bg-surface/75 px-4 py-3 text-xs font-bold text-dark"
                              >
                                <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">
                                  {variant.label}
                                </span>
                                <span className="mt-1 block text-sm font-display font-bold text-primary">
                                  Rs. {variant.price}
                                </span>
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            disabled={!item.available}
                            className={`flex w-full items-center justify-center gap-2 rounded-[1.6rem] py-4 font-bold transition-all duration-300 ${
                              item.available
                                ? "bg-surface-strong text-dark hover:bg-primary hover:text-white"
                                : "cursor-not-allowed bg-gray-100 text-gray-400"
                            }`}
                          >
                            {item.available ? "Customize & Add" : "Unavailable Right Now"}
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </main>
        </div>
      </div>
      </div>

      <AnimatePresence>
        {showFilters ? (
          <div className="fixed inset-0 z-[90]">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
              aria-label="Close menu filters"
            />

            <motion.aside
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Menu Filters</p>
                  <h2 className="mt-2 text-2xl font-bold text-dark">Search, sort, and refine quickly</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-dark transition-all hover:bg-surface-strong"
                  aria-label="Close filters"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <div className="mt-6 rounded-[1.8rem] bg-surface p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Results</p>
                <p className="mt-2 text-3xl font-display font-bold text-primary">{filteredItems.length}</p>
              </div>

              <div className="mt-6 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search items, categories, flavors..."
                  value={searchQuery}
                  onChange={(event) =>
                    startTransition(() => {
                      setSearchQuery(event.target.value);
                    })
                  }
                  className="w-full rounded-[1.7rem] border border-transparent bg-surface px-12 py-4 text-[15px] outline-none transition-all focus:border-primary focus:bg-white"
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { value: "all", label: "All items" },
                  { value: "available", label: "Available now" },
                  { value: "recommended", label: "Recommended" },
                  { value: "coming-soon", label: "Coming soon" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value as typeof statusFilter)}
                    className={`rounded-[1.5rem] px-4 py-4 text-sm font-bold transition-all duration-300 ${
                      statusFilter === filter.value
                        ? "bg-primary text-white shadow-xl shadow-primary/25"
                        : "bg-surface text-dark hover:-translate-y-0.5 hover:bg-surface-strong"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-muted">
                  Sort
                </label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                  className="w-full rounded-[1.6rem] border border-transparent bg-surface px-5 py-4 outline-none transition-all focus:border-primary focus:bg-white"
                >
                  <option value="featured">Featured first</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              <div className="mt-6 rounded-[1.9rem] border border-[#f0e3cb] bg-surface px-5 py-4 text-sm text-muted">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="mt-0.5 text-primary" />
                  <p>
                    Menu loads from cache first, then refreshes in the background so the main page stays responsive.
                  </p>
                </div>
              </div>
            </motion.aside>
          </div>
        ) : null}

        {selectedItem && selectedVariant ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[3rem] bg-white shadow-2xl"
            >
              <div className="relative h-56">
                <MenuImage item={selectedItem} className="h-full" />
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-6 top-6 rounded-full bg-white/20 p-3 text-white backdrop-blur-md transition-all hover:bg-white/40"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 md:p-10">
                <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                      {selectedItem.category} / {selectedItem.subcategory}
                    </p>
                    <h2 className="text-3xl font-bold text-dark">{selectedItem.name}</h2>
                    <p className="mt-3 max-w-2xl text-muted">{selectedItem.description}</p>
                  </div>
                  <div className="inline-flex h-fit items-center gap-2 rounded-2xl bg-surface px-4 py-3 font-bold text-dark">
                    <Clock3 size={18} className="text-accent" />
                    {selectedItem.stockStatus}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="mb-4 font-bold text-dark">Choose Price Tier</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {selectedItem.variants.map((variant) => (
                        <button
                          key={`${selectedItem.id}-${variant.label}`}
                          type="button"
                          onClick={() => setSelectedVariantLabel(variant.label)}
                          className={`rounded-2xl border p-5 text-left transition-all ${
                            selectedVariantLabel === variant.label
                              ? "border-primary bg-primary text-white shadow-xl shadow-primary/20"
                              : "border-transparent bg-surface text-dark hover:border-primary/30"
                          }`}
                        >
                          <span className="mb-2 block text-xs font-bold uppercase tracking-widest">
                            {variant.label}
                          </span>
                          <span className="text-2xl font-display font-bold">Rs. {variant.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {spiceOptions.length ? (
                    <div>
                      <h4 className="mb-4 font-bold text-dark">Spice Level</h4>
                      <div className="flex flex-wrap gap-3">
                        {spiceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setCustomizations((current) => ({ ...current, spices: option.value }))
                            }
                            className={`rounded-full px-4 py-3 text-sm font-bold transition-all ${
                              customizations.spices === option.value
                                ? "bg-dark text-white"
                                : "bg-surface text-dark hover:bg-surface-strong"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {drinkOptions.length ? (
                    <div>
                      <h4 className="mb-4 font-bold text-dark">Pair a Drink</h4>
                      <select
                        value={customizations.drink}
                        onChange={(event) =>
                          setCustomizations((current) => ({ ...current, drink: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-gray-100 bg-surface px-5 py-4 outline-none"
                      >
                        {drinkOptions.map((option) => (
                          <option key={option.label} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {chutneyOptions.length ? (
                    <div>
                      <h4 className="mb-4 font-bold text-dark">Dip or Chutney</h4>
                      <select
                        value={customizations.chutney}
                        onChange={(event) =>
                          setCustomizations((current) => ({ ...current, chutney: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-gray-100 bg-surface px-5 py-4 outline-none"
                      >
                        {chutneyOptions.map((option) => (
                          <option key={option.label} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {extraOptions.length ? (
                    <div>
                      <h4 className="mb-4 font-bold text-dark">Add Extras</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {extraOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleExtra(option.value)}
                            className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
                              customizations.extras.includes(option.value)
                                ? "border-primary bg-primary/5"
                                : "border-gray-100 bg-surface hover:border-primary/30"
                            }`}
                          >
                            <span className="font-bold text-dark">{option.label}</span>
                            <span className="font-bold text-primary">+Rs. {option.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h4 className="mb-4 font-bold text-dark">Special Instructions</h4>
                    <textarea
                      value={customizations.instructions}
                      onChange={(event) =>
                        setCustomizations((current) => ({
                          ...current,
                          instructions: event.target.value.slice(0, 140),
                        }))
                      }
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-gray-100 bg-surface px-5 py-4 outline-none"
                      placeholder="Less oil, serve hot, separate dip, family packing..."
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-3xl bg-surface p-6">
                    <span className="font-bold text-dark">Quantity</span>
                    <div className="flex items-center gap-6">
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-dark shadow-sm transition-all hover:bg-primary hover:text-white"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center font-anton text-2xl">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => current + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-dark shadow-sm transition-all hover:bg-primary hover:text-white"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-6 border-t border-gray-100 pt-8 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted">Selected Total</p>
                    <p className="text-3xl font-display font-bold text-primary">
                      Rs. {(linePrice * quantity).toLocaleString()}
                    </p>
                    {extrasPrice ? (
                      <p className="mt-2 text-sm text-muted">
                        Includes Rs. {extrasPrice.toLocaleString()} in selected extras.
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-4 font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-strong"
                  >
                    Add to Cart
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;
