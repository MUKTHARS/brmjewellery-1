'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { categoryApi } from '@/api/category.api';
import PageHeader from '@/components/admin/PageHeader';
import { cn } from '@/lib/cn';
import toast from 'react-hot-toast';

interface AttrField {
  id?: string; name: string; label: string; fieldType: string;
  options: string[]; isRequired: boolean; isFilterable: boolean;
  unit: string; placeholder: string; sortOrder: number;
}

const FIELD_TYPES = ['TEXT', 'NUMBER', 'DECIMAL', 'SELECT', 'BOOLEAN'];

const emptyField = (sortOrder: number): AttrField => ({
  name: '', label: '', fieldType: 'TEXT', options: [],
  isRequired: false, isFilterable: true, unit: '', placeholder: '', sortOrder,
});

export default function CategoryFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isNew = params.id === 'new';
  const categoryId = isNew ? null : params.id as string;
  const initialTab = searchParams.get('tab') === 'attributes' ? 'attributes' : 'details';

  const [tab, setTab] = useState<'details' | 'attributes'>(initialTab as 'details' | 'attributes');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '', isActive: true, sortOrder: 0 });
  const [attrFields, setAttrFields] = useState<AttrField[]>([]);
  const [newOption, setNewOption] = useState<Record<number, string>>({});

  useEffect(() => { categoryApi.getAll(true).then(({ data }) => setCategories(data.data)); }, []);

  useEffect(() => {
    if (!categoryId) return;
    categoryApi.getById(categoryId).then(({ data }) => {
      const c = data.data;
      setForm({ name: c.name, slug: c.slug, description: c.description || '', parentId: c.parentId || '', isActive: c.isActive, sortOrder: c.sortOrder });
      const attrs = c.attributeTemplate?.attributes || [];
      setAttrFields(attrs.map((a: AttrField) => ({ ...a })));
      setLoading(false);
    }).catch(() => { toast.error('Category not found'); router.push('/admin/categories'); });
  }, [categoryId, router]);

  const saveDetails = async () => {
    if (!form.name) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (categoryId) {
        await categoryApi.update(categoryId, { ...form });
        toast.success('Category updated');
      } else {
        await categoryApi.create({ ...form });
        toast.success('Category created');
        router.push('/admin/categories');
      }
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const saveAttributes = async () => {
    if (!categoryId) { toast.error('Save category details first'); return; }
    setSaving(true);
    try {
      await categoryApi.upsertAttributeTemplate(categoryId, attrFields.map((f, i) => ({ ...f, sortOrder: i })));
      toast.success('Attribute template saved');
    } catch { toast.error('Failed to save attributes'); }
    finally { setSaving(false); }
  };

  const addField = () => setAttrFields((prev) => [...prev, emptyField(prev.length)]);

  const removeField = (i: number) => setAttrFields((prev) => prev.filter((_, j) => j !== i));

  const updateField = (i: number, key: keyof AttrField, value: unknown) => {
    setAttrFields((prev) => {
      const next = [...prev];
      (next[i] as Record<string, unknown>)[key] = value;
      // Auto-generate field name from label
      if (key === 'label') next[i].name = (value as string).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      return next;
    });
  };

  const addOption = (i: number) => {
    const opt = newOption[i]?.trim();
    if (!opt) return;
    updateField(i, 'options', [...attrFields[i].options, opt]);
    setNewOption({ ...newOption, [i]: '' });
  };

  const removeOption = (fieldIdx: number, optIdx: number) => {
    updateField(fieldIdx, 'options', attrFields[fieldIdx].options.filter((_, j) => j !== optIdx));
  };

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-64 bg-gray-100 rounded" /></div>;

  return (
    <div className="p-8 max-w-4xl">
      <PageHeader
        title={isNew ? 'Add Category' : form.name || 'Edit Category'}
        action={
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 text-xs"><ArrowLeft size={14} /> Back</button>
            <button onClick={tab === 'details' ? saveDetails : saveAttributes} disabled={saving} className="btn-gold text-xs">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        }
      />

      {/* Tabs */}
      {!isNew && (
        <div className="flex gap-0 mb-6 border-b border-gray-100">
          {(['details', 'attributes'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-5 py-2.5 text-sm capitalize transition-colors border-b-2', tab === t ? 'border-gold text-gold' : 'border-transparent text-ink-muted hover:text-ink')}>
              {t === 'attributes' ? 'Attribute Template' : 'Details'}
            </button>
          ))}
        </div>
      )}

      {tab === 'details' && (
        <div className="card p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-base">Name <span className="text-danger">*</span></label>
              <input className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rings" />
            </div>
            <div>
              <label className="label-base">Slug</label>
              <input className="input-base" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
            </div>
            <div>
              <label className="label-base">Parent Category</label>
              <select className="input-base" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">None (top-level)</option>
                {categories.filter((c) => c.id !== categoryId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label-base">Description</label>
              <textarea rows={3} className="input-base resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label-base">Sort Order</label>
              <input type="number" min="0" className="input-base" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <label className="text-sm text-ink-muted">Active</label>
              <button onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={cn('w-10 h-5 rounded-full relative transition-colors', form.isActive ? 'bg-gold' : 'bg-gray-200')}>
                <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', form.isActive ? 'left-5' : 'left-0.5')} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'attributes' && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">Define the attribute fields for this category. Products assigned to this category will display these fields.</p>

          {attrFields.map((field, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start gap-3">
                <GripVertical size={16} className="text-ink-muted mt-3 cursor-grab" />
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="label-base">Label</label>
                    <input className="input-base text-xs" value={field.label} onChange={(e) => updateField(i, 'label', e.target.value)} placeholder="e.g. Ring Size" />
                  </div>
                  <div>
                    <label className="label-base">Field Name</label>
                    <input className="input-base text-xs bg-cream" value={field.name} readOnly placeholder="auto" />
                  </div>
                  <div>
                    <label className="label-base">Field Type</label>
                    <select className="input-base text-xs" value={field.fieldType} onChange={(e) => updateField(i, 'fieldType', e.target.value)}>
                      {FIELD_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-base">Unit (optional)</label>
                    <input className="input-base text-xs" value={field.unit} onChange={(e) => updateField(i, 'unit', e.target.value)} placeholder="mm, g, inch…" />
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <label className="flex items-center gap-1.5 text-xs text-ink-muted cursor-pointer">
                      <input type="checkbox" checked={field.isRequired} onChange={(e) => updateField(i, 'isRequired', e.target.checked)} className="accent-gold" />
                      Required
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-ink-muted cursor-pointer">
                      <input type="checkbox" checked={field.isFilterable} onChange={(e) => updateField(i, 'isFilterable', e.target.checked)} className="accent-gold" />
                      Filterable
                    </label>
                  </div>

                  {field.fieldType === 'SELECT' && (
                    <div className="col-span-2 md:col-span-3">
                      <label className="label-base">Options</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {field.options.map((opt, oi) => (
                          <span key={oi} className="flex items-center gap-1 px-2 py-0.5 bg-cream border border-gray-100 text-xs">
                            {opt}
                            <button onClick={() => removeOption(i, oi)} className="text-ink-muted hover:text-danger">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input className="input-base text-xs flex-1" value={newOption[i] || ''} onChange={(e) => setNewOption({ ...newOption, [i]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && addOption(i)} placeholder="Type option and press Enter…" />
                        <button onClick={() => addOption(i)} className="btn-outline-gold text-xs px-3 py-1.5">Add</button>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => removeField(i)} className="p-1.5 text-ink-muted hover:text-danger mt-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <button onClick={addField} className="flex items-center gap-2 text-sm text-gold hover:text-gold-dark transition-colors">
            <Plus size={14} /> Add Attribute Field
          </button>
        </div>
      )}
    </div>
  );
}
