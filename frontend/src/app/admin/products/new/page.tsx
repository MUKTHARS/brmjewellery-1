'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { productApi } from '@/api/product.api';
import { categoryApi } from '@/api/category.api';
import PageHeader from '@/components/admin/PageHeader';
import toast from 'react-hot-toast';
import { cn } from '@/lib/cn';

interface AttributeField {
  name: string; label: string; fieldType: string;
  options: string[]; isRequired: boolean; unit?: string;
}

interface Category { id: string; name: string; }

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attrFields, setAttrFields] = useState<AttributeField[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: '', slug: '', sku: '', description: '', story: '', brand: '',
    categoryId: '', metalType: '', carat: '', weightGrams: '',
    baseCost: '', stockQty: '0', isActive: true,
  });
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    categoryApi.getAll(true).then(({ data }) => setCategories(data.data));
  }, []);

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
      toast.error('Title, SKU, category, and base cost are required');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
      const attrsArr = attrFields
        .map((f) => ({ fieldName: f.name, fieldLabel: f.label, value: attributes[f.name] || '' }))
        .filter((a) => a.value);
      formData.append('attributes', JSON.stringify(attrsArr));
      newFiles.forEach((file) => formData.append('images', file));
      await productApi.create(formData);
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create product');
    } finally { setSaving(false); }
  };

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Add Product"
        subtitle="Create a new jewellery listing"
        action={
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 text-xs">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-gold text-xs">
              {saving ? 'Creating…' : 'Create Product'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                <label className="label-base">Slug (auto if blank)</label>
                <input className="input-base" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="18k-gold-solitaire-ring" />
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
                <textarea rows={3} className="input-base resize-none" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} placeholder="Crafting story and heritage…" />
              </div>
            </div>
          </div>

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
                  {form.metalType === 'GOLD' && ['9k','14k','18k','22k','24k'].map((c) => <option key={c}>{c}</option>)}
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

          {attrFields.length > 0 && (
            <div className="card p-6">
              <h3 className="font-cormorant text-lg font-light text-ink mb-1">Category Attributes</h3>
              <p className="text-xs text-ink-muted mb-4">Fields specific to this category</p>
              <div className="grid grid-cols-2 gap-4">
                {attrFields.map((field) => (
                  <div key={field.name}>
                    <label className="label-base">
                      {field.label} {field.unit && <span className="text-ink-muted normal-case">({field.unit})</span>}
                      {field.isRequired && <span className="text-danger"> *</span>}
                    </label>
                    {field.fieldType === 'SELECT' || field.fieldType === 'BOOLEAN' ? (
                      <select className="input-base" value={attributes[field.name] || ''} onChange={(e) => setAttributes({ ...attributes, [field.name]: e.target.value })}>
                        <option value="">Select…</option>
                        {field.fieldType === 'BOOLEAN'
                          ? ['Yes', 'No'].map((o) => <option key={o}>{o}</option>)
                          : field.options.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={['NUMBER', 'DECIMAL'].includes(field.fieldType) ? 'number' : 'text'}
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

        <div className="space-y-6">
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
                <label className="text-sm text-ink-muted">Active listing</label>
                <button onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={cn('w-10 h-5 rounded-full transition-colors relative', form.isActive ? 'bg-gold' : 'bg-gray-200')}>
                  <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', form.isActive ? 'left-5' : 'left-0.5')} />
                </button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-4">Images</h3>
            {newFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {newFiles.map((file, i) => (
                  <div key={i} className="relative border border-dashed border-gold/30">
                    <div className="aspect-square relative overflow-hidden bg-cream">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button onClick={() => setNewFiles((p) => p.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-0.5 bg-white/90 text-danger">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div {...getRootProps()} className={cn('border-2 border-dashed p-6 text-center cursor-pointer transition-colors', isDragActive ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold')}>
              <input {...getInputProps()} />
              <Plus size={20} className="mx-auto text-ink-muted mb-2" />
              <p className="text-xs text-ink-muted">Drop images here or click</p>
              <p className="text-[10px] text-ink-muted mt-1">JPEG, PNG, WebP · max 10MB each</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
