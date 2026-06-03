'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Star, Pencil, Check, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { productApi } from '@/api/product.api';
import { categoryApi } from '@/api/category.api';
import PageHeader from '@/components/admin/PageHeader';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import { cn } from '@/lib/cn';


interface AttributeField {
  name: string; label: string; fieldType: string;
  options: string[]; isRequired: boolean; unit?: string;
}

interface ProductImage { id: string; url: string; isPrimary: boolean; sortOrder: number; }

interface Category { id: string; name: string; slug: string; }

interface ProductVariant {
  id: string;
  finishName: string;
  badge: string;
  metalType?: string;
  carat?: string;
  isPremium: boolean;
  price: number;
  stockQty: number;
  sku: string;
  sortOrder: number;
  isActive: boolean;
  ringWidth?: string;
  ringProfile?: string;
  ringWeight?: string;
}

const RING_WIDTHS   = ['2mm','3mm','4mm','5mm','6mm','7mm','8mm','10mm','12mm'];
const RING_PROFILES = ['D Shape','Court Shape','Cushion Court Shape','Flat Shape','Flat Comfort Fit'];
const RING_WEIGHTS  = ['Classic Weight','Extra Heavy Weight','Super Heavy Weight'];

const EMPTY_VARIANT = {
  finishName: '', badge: '', metalType: 'GOLD', carat: '', isPremium: false,
  price: '', stockQty: '10', sku: '', sortOrder: '0', isActive: true,
  ringWidth: '', ringProfile: '', ringWeight: '',
};

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const productId = isNew ? null : params.id as string;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attrFields, setAttrFields] = useState<AttributeField[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    title: '', slug: '', sku: '', description: '', story: '', brand: '',
    categoryId: '', metalType: '', carat: '', weightGrams: '',
    baseCost: '', stockQty: '0', isActive: true,
  });
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  // Variant state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantForm, setVariantForm] = useState({ ...EMPTY_VARIANT });
  const [savingVariant, setSavingVariant] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editVariantForm, setEditVariantForm] = useState({ ...EMPTY_VARIANT });

  // Load categories
  useEffect(() => {
    categoryApi.getAll(true).then(({ data }) => setCategories(data.data));
  }, []);

  // Load product if editing
  useEffect(() => {
    if (!productId) return;
    productApi.getById(productId).then(({ data }) => {
      const p = data.data;
      setForm({
        title: p.title, slug: p.slug, sku: p.sku,
        description: p.description || '', story: p.story || '', brand: p.brand || '',
        categoryId: p.categoryId, metalType: p.metalType || '',
        carat: p.carat || '', weightGrams: p.weightGrams ? String(p.weightGrams) : '',
        baseCost: String(p.baseCost), stockQty: String(p.stockQty),
        isActive: p.isActive,
      });
      setImages(p.images || []);
      setVariants(p.variants || []);
      const attrMap: Record<string, string> = {};
      p.attributes?.forEach((a: { fieldName: string; value: string }) => { attrMap[a.fieldName] = a.value; });
      setAttributes(attrMap);
      setLoading(false);
    }).catch(() => { toast.error('Product not found'); router.push('/admin/products'); });
  }, [productId, router]);

  // Load attribute template when category changes
  const loadAttributeTemplate = useCallback(async (catId: string) => {
    if (!catId) { setAttrFields([]); return; }
    try {
      const { data } = await categoryApi.getAttributeTemplate(catId);
      setAttrFields(data.data?.attributes || []);
    } catch { setAttrFields([]); }
  }, []);

  useEffect(() => { if (form.categoryId) loadAttributeTemplate(form.categoryId); }, [form.categoryId, loadAttributeTemplate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 10,
    onDrop: (files) => setNewFiles((prev) => [...prev, ...files]),
  });

  const handleSave = async () => {
    if (!form.title || !form.sku || !form.categoryId || !form.baseCost) {
      toast.error('Please fill in required fields: title, SKU, category, base cost');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));

      // Build attributes array from attrFields
      const attrsArr = attrFields.map((f) => ({
        fieldName: f.name, fieldLabel: f.label, value: attributes[f.name] || '',
      })).filter((a) => a.value);
      formData.append('attributes', JSON.stringify(attrsArr));

      newFiles.forEach((file) => formData.append('images', file));

      if (productId) {
        await productApi.update(productId, formData);
        toast.success('Product updated');
      } else {
        await productApi.create(formData);
        toast.success('Product created');
        router.push('/admin/products');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save product';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleAddVariant = async () => {
    if (!productId) return;
    if (!variantForm.finishName || !variantForm.badge || !variantForm.sku || !variantForm.price) {
      toast.error('Finish name, badge, SKU and price are required');
      return;
    }
    setSavingVariant(true);
    try {
      const { data } = await productApi.createVariant(productId, {
        finishName: variantForm.finishName,
        badge: variantForm.badge,
        metalType: variantForm.metalType || undefined,
        carat: variantForm.carat || undefined,
        isPremium: variantForm.isPremium,
        price: parseFloat(variantForm.price as string),
        stockQty: parseInt(variantForm.stockQty as string) || 0,
        sku: variantForm.sku,
        sortOrder: parseInt(variantForm.sortOrder as string) || 0,
        isActive: variantForm.isActive,
        ringWidth: variantForm.ringWidth || undefined,
        ringProfile: variantForm.ringProfile || undefined,
        ringWeight: variantForm.ringWeight || undefined,
      });
      setVariants((prev) => [...prev, data.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setVariantForm({ ...EMPTY_VARIANT });
      setShowVariantForm(false);
      toast.success('Finish variant added');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add variant';
      toast.error(msg);
    } finally { setSavingVariant(false); }
  };

  const handleEditVariant = (v: ProductVariant) => {
    setEditingVariantId(v.id);
    setEditVariantForm({
      finishName: v.finishName, badge: v.badge,
      metalType: v.metalType || 'GOLD', carat: v.carat || '',
      isPremium: v.isPremium, price: String(v.price),
      stockQty: String(v.stockQty), sku: v.sku,
      sortOrder: String(v.sortOrder), isActive: v.isActive,
      ringWidth: v.ringWidth || '', ringProfile: v.ringProfile || '', ringWeight: v.ringWeight || '',
    });
  };

  const handleSaveVariant = async (variantId: string) => {
    if (!productId) return;
    setSavingVariant(true);
    try {
      await productApi.updateVariant(productId, variantId, {
        finishName: editVariantForm.finishName,
        badge: editVariantForm.badge,
        metalType: editVariantForm.metalType || undefined,
        carat: editVariantForm.carat || undefined,
        isPremium: editVariantForm.isPremium,
        price: parseFloat(editVariantForm.price as string),
        stockQty: parseInt(editVariantForm.stockQty as string) || 0,
        sku: editVariantForm.sku,
        sortOrder: parseInt(editVariantForm.sortOrder as string) || 0,
        isActive: editVariantForm.isActive,
        ringWidth: editVariantForm.ringWidth || undefined,
        ringProfile: editVariantForm.ringProfile || undefined,
        ringWeight: editVariantForm.ringWeight || undefined,
      });
      setVariants((prev) =>
        prev.map((v) => v.id === variantId
          ? { ...v, ...editVariantForm, price: parseFloat(editVariantForm.price as string), stockQty: parseInt(editVariantForm.stockQty as string) || 0, sortOrder: parseInt(editVariantForm.sortOrder as string) || 0 }
          : v
        ).sort((a, b) => a.sortOrder - b.sortOrder)
      );
      setEditingVariantId(null);
      toast.success('Variant updated');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update variant';
      toast.error(msg);
    } finally { setSavingVariant(false); }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!productId) return;
    try {
      await productApi.deleteVariant(productId, variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      toast.success('Variant removed');
    } catch { toast.error('Failed to remove variant'); }
  };

  const handleDeleteImage = async (img: ProductImage) => {
    if (!productId) return;
    try {
      await productApi.deleteImage(productId, img.id);
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      toast.success('Image removed');
    } catch { toast.error('Failed to remove image'); }
  };

  const handleSetPrimary = async (img: ProductImage) => {
    if (!productId) return;
    try {
      await productApi.setPrimaryImage(productId, img.id);
      setImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === img.id })));
    } catch { toast.error('Failed to set primary image'); }
  };

  const isRingsCategory = categories.find((c) => c.id === form.categoryId)?.slug === 'rings';

  if (loading) {
    return <div className="p-8 animate-pulse"><div className="h-8 w-64 bg-gray-100 rounded mb-8" /></div>;
  }

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title={isNew ? 'Add Product' : 'Edit Product'}
        subtitle={isNew ? 'Create a new jewellery listing' : form.title}
        action={
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 text-xs">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-gold text-xs">
              {saving ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label-base">Title <span className="text-danger">*</span></label>
                <input className="input-base" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 18k Yellow Gold Solitaire Ring" />
              </div>
              <div>
                <label className="label-base">SKU <span className="text-danger">*</span></label>
                <input className="input-base" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="BRM-RNG-001" />
              </div>
              <div>
                <label className="label-base">Slug</label>
                <input className="input-base" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if blank" />
              </div>
              <div className="col-span-2">
                <label className="label-base">Description</label>
                <textarea rows={4} className="input-base resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description…" />
              </div>
              <div>
                <label className="label-base">Brand / Maker</label>
                <input className="input-base" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. BRM Jewellery, Cartier…" />
              </div>
              <div className="col-span-2">
                <label className="label-base">Brand Story</label>
                <textarea rows={3} className="input-base resize-none" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} placeholder="Crafting story…" />
              </div>
            </div>
          </div>

          {/* Metal & Pricing */}
          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-4">Metal & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Metal Type</label>
                <select className="input-base" value={form.metalType} onChange={(e) => setForm({ ...form, metalType: e.target.value, carat: '' })}>
                  <option value="">Select…</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </div>
              <div>
                <label className="label-base">Carat</label>
                <select className="input-base" value={form.carat} onChange={(e) => setForm({ ...form, carat: e.target.value })}>
                  <option value="">Select…</option>
                  {form.metalType === 'GOLD' && ['9k', '14k', '18k', '22k', '24k'].map((c) => <option key={c}>{c}</option>)}
                  {form.metalType === 'SILVER' && <option>925</option>}
                  {form.metalType === 'PLATINUM' && <option>950</option>}
                </select>
              </div>
              <div>
                <label className="label-base">Weight (grams)</label>
                <input type="number" step="0.001" min="0" className="input-base" value={form.weightGrams} onChange={(e) => setForm({ ...form, weightGrams: e.target.value })} placeholder="0.000" />
              </div>
              <div>
                <label className="label-base">Base Labour Cost (£) <span className="text-danger">*</span></label>
                <input type="number" step="0.01" min="0" className="input-base" value={form.baseCost} onChange={(e) => setForm({ ...form, baseCost: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="label-base">Stock Quantity</label>
                <input type="number" min="0" className="input-base" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Category Attributes */}
          {attrFields.length > 0 && (
            <div className="card p-6">
              <h3 className="font-cormorant text-lg font-light text-ink mb-4">Category Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                {attrFields.map((field) => (
                  <div key={field.name}>
                    <label className="label-base">
                      {field.label} {field.unit && <span className="text-ink-muted normal-case">({field.unit})</span>}
                      {field.isRequired && <span className="text-danger"> *</span>}
                    </label>
                    {field.fieldType === 'SELECT' ? (
                      <select className="input-base" value={attributes[field.name] || ''}
                        onChange={(e) => setAttributes({ ...attributes, [field.name]: e.target.value })}>
                        <option value="">Select…</option>
                        {field.options.map((opt) => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : field.fieldType === 'BOOLEAN' ? (
                      <select className="input-base" value={attributes[field.name] || ''}
                        onChange={(e) => setAttributes({ ...attributes, [field.name]: e.target.value })}>
                        <option value="">Select…</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    ) : (
                      <input
                        type={field.fieldType === 'NUMBER' || field.fieldType === 'DECIMAL' ? 'number' : 'text'}
                        className="input-base"
                        value={attributes[field.name] || ''}
                        onChange={(e) => setAttributes({ ...attributes, [field.name]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Finish Options (Variants) — only for existing products */}
          {productId && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-cormorant text-lg font-light text-ink">Finish Options</h3>
                  <p className="text-xs text-ink-muted mt-0.5">Add finishes customers can choose from (e.g. 18ct Gold, Sterling Silver). Each gets its own price &amp; stock.</p>
                </div>
                {!showVariantForm && (
                  <button
                    onClick={() => setShowVariantForm(true)}
                    className="btn-gold text-xs flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Add Finish
                  </button>
                )}
              </div>

              {/* Existing variants table */}
              {variants.length > 0 && (
                <div className="mb-4 border border-gold/10 overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_56px_58px_64px_44px_1fr_56px] gap-1 bg-cream px-3 py-2">
                    {['Finish', 'Badge', 'Metal', 'Price', 'Stock', 'SKU', ''].map((h) => (
                      <span key={h} className="text-[10px] uppercase tracking-widest text-ink-muted font-medium">{h}</span>
                    ))}
                  </div>

                  {variants.map((v) => (
                    <div key={v.id} className="border-t border-gold/8">
                      {editingVariantId === v.id ? (
                        /* ── Inline edit row ── */
                        <div className="px-3 py-2 bg-gold/5 space-y-2">
                          <div className="grid grid-cols-[1fr_56px_58px_64px_44px_1fr_56px] gap-1 items-center">
                            <input className="input-base text-xs py-1" value={editVariantForm.finishName}
                              onChange={(e) => setEditVariantForm({ ...editVariantForm, finishName: e.target.value })} placeholder="e.g. 18ct Gold" />
                            <input className="input-base text-xs py-1" value={editVariantForm.badge}
                              onChange={(e) => setEditVariantForm({ ...editVariantForm, badge: e.target.value })} placeholder="18ct" />
                            <select className="input-base text-xs py-1" value={editVariantForm.metalType}
                              onChange={(e) => setEditVariantForm({ ...editVariantForm, metalType: e.target.value })}>
                              <option value="GOLD">Gold</option>
                              <option value="SILVER">Silver</option>
                              <option value="PLATINUM">Platinum</option>
                            </select>
                            <input type="number" step="0.01" className="input-base text-xs py-1" value={editVariantForm.price}
                              onChange={(e) => setEditVariantForm({ ...editVariantForm, price: e.target.value })} placeholder="0.00" />
                            <input type="number" className="input-base text-xs py-1" value={editVariantForm.stockQty}
                              onChange={(e) => setEditVariantForm({ ...editVariantForm, stockQty: e.target.value })} />
                            <input className="input-base text-xs py-1" value={editVariantForm.sku}
                              onChange={(e) => setEditVariantForm({ ...editVariantForm, sku: e.target.value })} />
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleSaveVariant(v.id)} disabled={savingVariant}
                                className="p-1.5 bg-gold text-white hover:bg-gold/80 transition-colors" title="Save">
                                <Check size={13} />
                              </button>
                              <button onClick={() => setEditingVariantId(null)}
                                className="p-1.5 bg-gray-100 text-ink-muted hover:bg-gray-200 transition-colors" title="Cancel">
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                          {isRingsCategory && (
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[9px] uppercase tracking-widest text-ink-muted block mb-0.5">Ring Width</label>
                                <select className="input-base text-xs py-1" value={editVariantForm.ringWidth}
                                  onChange={(e) => setEditVariantForm({ ...editVariantForm, ringWidth: e.target.value })}>
                                  <option value="">None</option>
                                  {RING_WIDTHS.map((w) => <option key={w}>{w}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] uppercase tracking-widest text-ink-muted block mb-0.5">Profile</label>
                                <select className="input-base text-xs py-1" value={editVariantForm.ringProfile}
                                  onChange={(e) => setEditVariantForm({ ...editVariantForm, ringProfile: e.target.value })}>
                                  <option value="">None</option>
                                  {RING_PROFILES.map((p) => <option key={p}>{p}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] uppercase tracking-widest text-ink-muted block mb-0.5">Weight</label>
                                <select className="input-base text-xs py-1" value={editVariantForm.ringWeight}
                                  onChange={(e) => setEditVariantForm({ ...editVariantForm, ringWeight: e.target.value })}>
                                  <option value="">None</option>
                                  {RING_WEIGHTS.map((w) => <option key={w}>{w}</option>)}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* ── Read row ── */
                        <div className="grid grid-cols-[1fr_56px_58px_64px_44px_1fr_56px] gap-1 px-3 py-2.5 items-center hover:bg-cream/50 transition-colors">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* Colour swatch */}
                            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10" style={{
                              background: v.metalType === 'GOLD'
                                ? 'linear-gradient(135deg,#f5d97a,#C9A84C,#a8782a)'
                                : 'linear-gradient(135deg,#e8e8e8,#c8c8c8,#a0a0a0)',
                            }} />
                            <div className="min-w-0">
                              <span className="text-sm text-ink font-medium block truncate">{v.finishName}</span>
                              <div className="flex gap-1 mt-0.5">
                                {v.isPremium && (
                                  <span className="text-[8px] uppercase tracking-wider text-gold bg-gold/10 px-1 py-px">Premium</span>
                                )}
                                {!v.isActive && (
                                  <span className="text-[8px] uppercase tracking-wider text-ink-muted bg-gray-100 px-1 py-px">Hidden</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-ink-muted">{v.badge}</span>
                          <span className="text-xs text-ink-muted">{v.metalType}</span>
                          <span className="text-sm font-semibold text-ink">£{Number(v.price).toFixed(2)}</span>
                          <span className="text-xs text-ink-muted">{v.stockQty}</span>
                          <span className="text-xs text-ink-muted truncate">{v.sku}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleEditVariant(v)}
                              className="p-1.5 text-ink-muted hover:text-gold transition-colors" title="Edit">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDeleteVariant(v.id)}
                              className="p-1.5 text-ink-muted hover:text-danger transition-colors" title="Delete">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {variants.length === 0 && !showVariantForm && (
                <div className="text-center py-8 border border-dashed border-gold/20">
                  <p className="text-xs text-ink-muted mb-3">No finish options yet. Add options like 18ct Gold, Sterling Silver, Vermeil…</p>
                  <button onClick={() => setShowVariantForm(true)} className="btn-ghost text-xs flex items-center gap-1.5 mx-auto">
                    <Plus size={13} /> Add First Finish
                  </button>
                </div>
              )}

              {/* Add variant form */}
              {showVariantForm && (
                <div className="border border-gold/20 bg-gold/5 p-4 space-y-3">
                  <p className="text-xs font-medium text-ink uppercase tracking-widest mb-3">New Finish Option</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-base">Finish Name <span className="text-danger">*</span></label>
                      <input className="input-base" placeholder="e.g. 18ct Gold, Sterling Silver, Vermeil"
                        value={variantForm.finishName}
                        onChange={(e) => setVariantForm({ ...variantForm, finishName: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-base">Badge Text <span className="text-danger">*</span>
                        <span className="text-ink-muted normal-case font-normal ml-1">(shown in circle, e.g. "18ct", "925")</span>
                      </label>
                      <input className="input-base" placeholder="e.g. 18ct"
                        value={variantForm.badge}
                        onChange={(e) => setVariantForm({ ...variantForm, badge: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-base">Metal Type</label>
                      <select className="input-base" value={variantForm.metalType}
                        onChange={(e) => setVariantForm({ ...variantForm, metalType: e.target.value })}>
                        <option value="GOLD">Gold</option>
                        <option value="SILVER">Silver</option>
                        <option value="PLATINUM">Platinum</option>
                      </select>
                    </div>
                    <div>
                      <label className="label-base">Carat / Purity
                        <span className="text-ink-muted normal-case font-normal ml-1">(optional)</span>
                      </label>
                      <input className="input-base" placeholder="e.g. 18ct, 24ct, 925"
                        value={variantForm.carat}
                        onChange={(e) => setVariantForm({ ...variantForm, carat: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-base">Price (£) <span className="text-danger">*</span></label>
                      <input type="number" step="0.01" min="0" className="input-base" placeholder="0.00"
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-base">Stock Quantity</label>
                      <input type="number" min="0" className="input-base"
                        value={variantForm.stockQty}
                        onChange={(e) => setVariantForm({ ...variantForm, stockQty: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-base">SKU <span className="text-danger">*</span></label>
                      <input className="input-base" placeholder="e.g. BRM-RNG-GOLD18-001"
                        value={variantForm.sku}
                        onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })} />
                    </div>
                    <div>
                      <label className="label-base">Sort Order</label>
                      <input type="number" min="0" className="input-base"
                        value={variantForm.sortOrder}
                        onChange={(e) => setVariantForm({ ...variantForm, sortOrder: e.target.value })} />
                    </div>
                    {isRingsCategory && (
                      <>
                        <div>
                          <label className="label-base">Ring Width</label>
                          <select className="input-base" value={variantForm.ringWidth}
                            onChange={(e) => setVariantForm({ ...variantForm, ringWidth: e.target.value })}>
                            <option value="">None</option>
                            {RING_WIDTHS.map((w) => <option key={w}>{w}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label-base">Ring Profile</label>
                          <select className="input-base" value={variantForm.ringProfile}
                            onChange={(e) => setVariantForm({ ...variantForm, ringProfile: e.target.value })}>
                            <option value="">None</option>
                            {RING_PROFILES.map((p) => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label-base">Ring Weight</label>
                          <select className="input-base" value={variantForm.ringWeight}
                            onChange={(e) => setVariantForm({ ...variantForm, ringWeight: e.target.value })}>
                            <option value="">None</option>
                            {RING_WEIGHTS.map((w) => <option key={w}>{w}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={variantForm.isPremium}
                        onChange={(e) => setVariantForm({ ...variantForm, isPremium: e.target.checked })}
                        className="accent-gold w-4 h-4" />
                      <span className="text-sm text-ink-muted">Mark as <strong className="text-gold">Premium</strong> (shows ✦ Premium badge)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={variantForm.isActive}
                        onChange={(e) => setVariantForm({ ...variantForm, isActive: e.target.checked })}
                        className="accent-gold w-4 h-4" />
                      <span className="text-sm text-ink-muted">Active (visible to customers)</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleAddVariant} disabled={savingVariant} className="btn-gold text-xs">
                      {savingVariant ? 'Saving…' : 'Save Finish Option'}
                    </button>
                    <button onClick={() => { setShowVariantForm(false); setVariantForm({ ...EMPTY_VARIANT }); }}
                      className="btn-ghost text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="label-base">Category <span className="text-danger">*</span></label>
                <select className="input-base" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <label className="text-sm text-ink-muted">Active (visible to customers)</label>
                <button
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={cn(
                    'w-10 h-5 rounded-full transition-colors relative',
                    form.isActive ? 'bg-gold' : 'bg-gray-200'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                    form.isActive ? 'left-5' : 'left-0.5'
                  )} />
                </button>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-4">Images</h3>

            {/* Existing images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group border border-gray-100">
                    <div className="aspect-square relative overflow-hidden bg-cream">
                      <img src={resolveImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                    </div>
                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 bg-gold text-white text-[9px] px-1">Primary</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {!img.isPrimary && (
                        <button onClick={() => handleSetPrimary(img)} className="p-1 bg-white/90 text-gold hover:text-gold-dark" title="Set primary">
                          <Star size={12} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteImage(img)} className="p-1 bg-white/90 text-danger hover:text-red-800" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New files preview */}
            {newFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {newFiles.map((file, i) => (
                  <div key={i} className="relative border border-dashed border-gold/30">
                    <div className="aspect-square relative overflow-hidden bg-cream">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-0.5 bg-white/90 text-danger">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold'
              )}
            >
              <input {...getInputProps()} />
              <Plus size={20} className="mx-auto text-ink-muted mb-2" />
              <p className="text-xs text-ink-muted">Drop images here or click to upload</p>
              <p className="text-[10px] text-ink-muted mt-1">JPEG, PNG, WebP · max 10MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
