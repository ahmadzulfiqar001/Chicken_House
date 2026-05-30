import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useToast } from "./ToastProvider";

type Variant = {
  label: string;
  price: number;
};

type MenuItem = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  image: string;
  status: "Active" | "Coming Soon";
  rating?: number;
  recommended?: boolean;
  featured?: boolean;
  popular?: boolean;
  variants: Variant[];
  startingPrice?: number;
  stockStatus?: string;
  available?: boolean;
};

type AvailabilityFilter = "All" | "Active" | "Coming Soon" | "Low Stock" | "Out of Stock";

const emptyForm = {
  name: "",
  category: "",
  subcategory: "",
  description: "",
  image: "",
  status: "Active" as "Active" | "Coming Soon",
  featured: false,
  popular: false,
  variantLabel: "Moderate",
  variantPrice: "0",
};

const MenuManagement = () => {
  const { showToast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchMenuItems = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/menu");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to load menu.");
      }

      setMenuItems(data);
    } catch (fetchError) {
      console.error(fetchError);
      const message = "Menu items could not be loaded right now.";
      setError(message);
      showToast({
        tone: "error",
        title: "Menu unavailable",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMenuItems();
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean))) as string[];
    return categories.sort((a, b) => a.localeCompare(b));
  }, [menuItems]);

  const subcategoryOptions = useMemo(() => {
    const subcategories = Array.from(
      new Set(
        menuItems
          .filter((item) => !form.category || item.category === form.category)
          .map((item) => item.subcategory ?? "")
          .filter(Boolean),
      ),
    ) as string[];
    return subcategories.sort((a, b) => a.localeCompare(b));
  }, [form.category, menuItems]);

  const filteredItems = useMemo(
    () =>
      menuItems.filter((item) => {
        const matchesSearch = [item.name, item.category, item.subcategory ?? "", item.status]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        if (!matchesSearch) {
          return false;
        }

        if (categoryFilter !== "All" && item.category !== categoryFilter) {
          return false;
        }

        if (availabilityFilter === "All") {
          return true;
        }

        if (availabilityFilter === "Active" || availabilityFilter === "Coming Soon") {
          return item.status === availabilityFilter;
        }

        return item.stockStatus === availabilityFilter;
      }),
    [availabilityFilter, categoryFilter, menuItems, searchTerm],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    const firstVariant = item.variants?.[0];
    setForm({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory ?? "",
      description: item.description,
      image: item.image,
      status: item.status,
      featured: Boolean(item.featured ?? item.recommended),
      popular: Boolean(item.popular),
      variantLabel: firstVariant?.label ?? "Moderate",
      variantPrice: String(firstVariant?.price ?? item.startingPrice ?? 0),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image: typeof reader.result === "string" ? reader.result : current.image,
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveItem = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (form.name.trim().length < 2 || form.category.trim().length < 2 || form.subcategory.trim().length < 2) {
      const message = "Name, category, and subcategory are required.";
      setError(message);
      showToast({ tone: "error", title: "Item not saved", description: message });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        subcategory: form.subcategory.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        status: form.status,
        featured: form.featured,
        popular: form.popular,
        recommended: form.featured || form.popular,
        variants: [{ label: form.variantLabel.trim() || "Moderate", price: Number(form.variantPrice) || 0 }],
      };

      const response = await fetch(editing ? `/api/menu/${editing.id}` : "/api/menu", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to save menu item.");
      }

      await fetchMenuItems();
      closeForm();
      showToast({
        tone: "success",
        title: editing ? "Menu item updated" : "Menu item added",
        description: `${data.name} is now part of the live menu list.`,
      });
    } catch (saveError) {
      console.error(saveError);
      const message = saveError instanceof Error ? saveError.message : "Menu item could not be saved.";
      setError(message);
      showToast({ tone: "error", title: "Save failed", description: message });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    const confirmed = window.confirm("Delete this menu item?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message ?? "Delete failed");
      }

      await fetchMenuItems();
      showToast({
        tone: "success",
        title: "Menu item deleted",
        description: `${id} has been removed from menu management.`,
      });
    } catch (deleteError) {
      console.error(deleteError);
      const message = deleteError instanceof Error ? deleteError.message : "Menu item delete failed.";
      setError(message);
      showToast({ tone: "error", title: "Delete failed", description: message });
    }
  };

  const toggleStatus = async (item: MenuItem) => {
    const nextStatus = item.status === "Active" ? "Coming Soon" : "Active";

    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          subcategory: item.subcategory ?? "Signature",
          description: item.description,
          image: item.image,
          status: nextStatus,
          featured: Boolean(item.featured ?? item.recommended),
          popular: Boolean(item.popular),
          recommended: Boolean(item.recommended ?? item.featured ?? item.popular),
          variants: item.variants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to update availability.");
      }

      await fetchMenuItems();
      showToast({
        tone: "success",
        title: "Availability updated",
        description: `${item.name} is now ${nextStatus}.`,
      });
    } catch (toggleError) {
      console.error(toggleError);
      const message =
        toggleError instanceof Error ? toggleError.message : "Availability could not be updated.";
      setError(message);
      showToast({ tone: "error", title: "Update failed", description: message });
    }
  };

  const toggleBadge = async (item: MenuItem, field: "featured" | "popular") => {
    try {
      const nextValue = !Boolean(item[field]);
      const featured = field === "featured" ? nextValue : Boolean(item.featured ?? item.recommended);
      const popular = field === "popular" ? nextValue : Boolean(item.popular);

      const response = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          subcategory: item.subcategory ?? "Signature",
          description: item.description,
          image: item.image,
          status: item.status,
          featured,
          popular,
          recommended: featured || popular,
          variants: item.variants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to update menu badges.");
      }

      await fetchMenuItems();
      showToast({
        tone: "success",
        title: "Menu badge updated",
        description: `${item.name} ${nextValue ? "now has" : "no longer has"} the ${field} label.`,
      });
    } catch (badgeError) {
      console.error(badgeError);
      const message = badgeError instanceof Error ? badgeError.message : "Menu badge update failed.";
      setError(message);
      showToast({ tone: "error", title: "Badge update failed", description: message });
    }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showForm ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.form
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              onSubmit={saveItem}
              className="relative w-full max-w-5xl rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-dark">{editing ? "Edit Menu Item" : "Add Menu Item"}</h3>
              <p className="mt-2 text-sm text-muted">
                Manage product details, category placement, availability, pricing, and menu highlights from one form.
              </p>

              <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                <div className="grid gap-5 md:grid-cols-2">
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="rounded-2xl bg-surface px-5 py-4 outline-none"
                    placeholder="Item name"
                  />

                  <input
                    list="category-options"
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="rounded-2xl bg-surface px-5 py-4 outline-none"
                    placeholder="Category"
                  />
                  <datalist id="category-options">
                    {categoryOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>

                  <input
                    list="subcategory-options"
                    value={form.subcategory}
                    onChange={(event) => setForm((current) => ({ ...current, subcategory: event.target.value }))}
                    className="rounded-2xl bg-surface px-5 py-4 outline-none"
                    placeholder="Subcategory"
                  />
                  <datalist id="subcategory-options">
                    {subcategoryOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as "Active" | "Coming Soon",
                      }))
                    }
                    className="rounded-2xl bg-surface px-5 py-4 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>

                  <input
                    value={form.variantLabel}
                    onChange={(event) => setForm((current) => ({ ...current, variantLabel: event.target.value }))}
                    className="rounded-2xl bg-surface px-5 py-4 outline-none"
                    placeholder="Variant label"
                  />

                  <input
                    value={form.variantPrice}
                    onChange={(event) => setForm((current) => ({ ...current, variantPrice: event.target.value }))}
                    className="rounded-2xl bg-surface px-5 py-4 outline-none"
                    placeholder="Variant price"
                    type="number"
                    min="0"
                  />

                  <input
                    value={form.image}
                    onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                    className="rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2"
                    placeholder="Paste image URL or upload a file below"
                  />

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface px-5 py-4 text-sm font-medium text-dark md:col-span-2">
                    <ImagePlus size={18} className="text-primary" />
                    Upload image file
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    className="min-h-32 rounded-2xl bg-surface px-5 py-4 outline-none md:col-span-2"
                    placeholder="Description"
                  />

                  <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 text-sm font-medium text-dark">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                      />
                      Featured item
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 text-sm font-medium text-dark">
                      <input
                        type="checkbox"
                        checked={form.popular}
                        onChange={(event) => setForm((current) => ({ ...current, popular: event.target.checked }))}
                      />
                      Popular item
                    </label>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-surface p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Image Preview</p>
                  <div className="mt-4 overflow-hidden rounded-[2rem] border border-gray-100 bg-white">
                    <img
                      src={form.image || "/restaurant-placeholder.svg"}
                      alt={form.name || "Menu item preview"}
                      className="h-72 w-full object-cover"
                    />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    Upload an image file for a direct preview, or leave the field blank to let the system auto-match a dish image from the menu catalog.
                  </p>
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, image: "" }))}
                    className="mt-4 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-dark transition hover:border-primary/30 hover:text-primary"
                  >
                    Use auto-matched image
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-gray-200 px-6 py-3 font-bold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-primary px-7 py-3 font-bold text-white"
                >
                  {saving ? "Saving..." : editing ? "Update Item" : "Create Item"}
                </button>
              </div>
            </motion.form>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-dark">Menu Management</h2>
          <p className="text-muted">
            Add, edit, delete, highlight, and control the live restaurant menu with image preview and availability handling.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-4 xl:w-auto">
          <div className="relative min-w-[18rem] flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by name, category, subcategory, or status"
              className="w-full rounded-xl bg-white py-3 pl-12 pr-4 text-sm shadow-sm outline-none"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)}
            className="rounded-xl bg-white px-4 py-3 text-sm font-medium shadow-sm outline-none"
          >
            <option value="All">All availability</option>
            <option value="Active">Active</option>
            <option value="Coming Soon">Coming Soon</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setCategoryFilter("All")}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
            categoryFilter === "All"
              ? "bg-primary text-white shadow-lg shadow-primary/15"
              : "bg-surface text-dark hover:bg-surface-strong"
          }`}
        >
          All Categories
        </button>
        {categoryOptions.map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              categoryFilter === category
                ? "bg-primary text-white shadow-lg shadow-primary/15"
                : "bg-surface text-dark hover:bg-surface-strong"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

      <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                <th className="pb-6">Item Details</th>
                <th className="pb-6">Category</th>
                <th className="pb-6">Price</th>
                <th className="pb-6">Availability</th>
                <th className="pb-6">Highlights</th>
                <th className="pb-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-surface">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-surface-strong font-bold text-primary">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          item.name[0]
                        )}
                      </div>
                      <div>
                        <span className="block font-bold text-dark">{item.name}</span>
                        <span className="text-xs text-muted">{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full bg-surface-strong px-3 py-1 text-xs font-bold text-dark">
                        {item.category}
                      </span>
                      <p className="text-xs text-muted">{item.subcategory || "General"}</p>
                    </div>
                  </td>
                  <td className="py-6 font-bold text-dark">
                    Rs. {Number(item.startingPrice ?? item.variants?.[0]?.price ?? 0).toLocaleString()}
                  </td>
                  <td className="py-6">
                    <span className={`flex items-center gap-2 text-xs font-bold ${item.status === "Active" ? "text-green-500" : "text-red-500"}`}>
                      {item.status === "Active" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {item.status}
                    </span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-muted">
                      {item.stockStatus ?? "Availability synced"}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-wrap gap-2">
                      {item.featured || item.recommended ? (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Featured</span>
                      ) : null}
                      {item.popular ? (
                        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-primary">Popular</span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                        <Star size={14} fill="currentColor" />
                        {item.rating ?? 4.7}
                      </span>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleStatus(item)}
                        className="rounded-lg bg-surface-strong px-3 py-2 text-xs font-bold text-dark transition hover:bg-primary hover:text-white"
                      >
                        {item.status === "Active" ? "Pause" : "Activate"}
                      </button>
                      <button
                        onClick={() => toggleBadge(item, "featured")}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                          item.featured || item.recommended
                            ? "bg-primary text-white"
                            : "bg-surface-strong text-dark hover:bg-primary hover:text-white"
                        }`}
                      >
                        <Sparkles size={14} className="inline-block" /> Featured
                      </button>
                      <button
                        onClick={() => toggleBadge(item, "popular")}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                          item.popular
                            ? "bg-accent text-dark"
                            : "bg-surface-strong text-dark hover:bg-accent hover:text-dark"
                        }`}
                      >
                        <Star size={14} className="inline-block" /> Popular
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-primary hover:text-white"
                        title="Edit menu item"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="rounded-lg bg-surface-strong p-2 text-dark transition hover:bg-red-500 hover:text-white"
                        title="Delete menu item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredItems.length === 0 ? (
            <div className="p-10 text-center text-muted">No menu items matched the current search or filters.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
