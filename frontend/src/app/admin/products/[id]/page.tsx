'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Star } from 'lucide-react';
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
