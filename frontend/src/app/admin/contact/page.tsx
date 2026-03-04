'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, MailOpen, Trash2, ChevronRight } from 'lucide-react';
import { contactApi } from '@/api/contact.api';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import Badge from '@/components/admin/Badge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { formatUKDateTime } from '@/lib/formatDate';
import toast from 'react-hot-toast';

interface ContactMessage {
  id: string; name: string; email: string; subject: string;
  message: string; isRead: boolean; createdAt: string;
}

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contactApi.getAll({
        page, limit: 25,
        search: search || undefined,
        isRead: readFilter !== '' ? readFilter === 'true' : undefined,
      });
      setMessages(data.data);
      setTotalPages(data.meta?.totalPages ?? 1);
    } finally { setLoading(false); }
  }, [page, search, readFilter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleOpen = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) {
      try {
        await contactApi.markRead(msg.id);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch { /* silent */ }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await contactApi.delete(deleteId);
      toast.success('Message deleted');
      setDeleteId(null);
      if (selected?.id === deleteId) setSelected(null);
      fetchMessages();
    } catch { toast.error('Failed to delete message'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="p-8">
      <PageHeader title="Contact Messages" subtitle="Customer enquiries and support messages" />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search messages…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 h-9 text-xs" />
        </div>
        <select value={readFilter} onChange={(e) => { setReadFilter(e.target.value); setPage(1); }}
          className="input-base w-36 h-9 text-xs">
          <option value="">All Messages</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Message List */}
        <div className="lg:col-span-2 space-y-1.5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-cream rounded animate-pulse" />
            ))
          ) : messages.length === 0 ? (
            <p className="text-xs text-ink-muted p-4">No messages found.</p>
          ) : messages.map((msg) => (
            <button key={msg.id} onClick={() => handleOpen(msg)}
              className={`w-full text-left p-3 rounded transition-colors flex items-start gap-2 ${
                selected?.id === msg.id ? 'bg-gold/10 border border-gold/30' : 'bg-cream hover:bg-gold/5 border border-transparent'
              }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-sm truncate ${!msg.isRead ? 'font-semibold text-ink' : 'font-medium text-ink'}`}>{msg.name}</p>
                  {!msg.isRead && <span className="w-2 h-2 bg-gold rounded-full flex-shrink-0 ml-1" />}
                </div>
                <p className="text-xs text-ink-muted truncate">{msg.subject}</p>
                <p className="text-xs text-ink-muted/70 mt-0.5">{formatUKDateTime(msg.createdAt)}</p>
              </div>
              <ChevronRight size={14} className="text-ink-muted mt-0.5 flex-shrink-0" />
            </button>
          ))}
          <div className="pt-3">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="card p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-ink">{selected.subject}</h3>
                  <p className="text-sm text-ink-muted mt-0.5">
                    From <span className="text-ink font-medium">{selected.name}</span> &lt;{selected.email}&gt;
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">{formatUKDateTime(selected.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={selected.isRead ? 'Read' : 'Unread'} variant={selected.isRead ? 'default' : 'gold'} />
                  <button onClick={() => setDeleteId(selected.id)}
                    className="p-1.5 rounded hover:bg-danger/10 text-ink-muted hover:text-danger transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="bg-cream rounded p-4 text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
              <div className="mt-4 pt-4 border-t border-gold/10">
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="btn-gold h-9 px-5 text-sm inline-flex items-center gap-2">
                  <MailOpen size={14} /> Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="card p-12 flex flex-col items-center justify-center text-center">
              <MailOpen size={40} className="text-gold/30 mb-3" />
              <p className="text-sm text-ink-muted">Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Message"
        message="Permanently delete this contact message?"
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
