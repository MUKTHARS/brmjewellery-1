'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus } from 'lucide-react';

interface Message {
  id: string;
  from: 'user' | 'agent';
  text: string;
  time: string;
}

const AUTO_REPLIES: Record<string, string> = {
  default: "Thank you for reaching out to BRM Jewellery. Our team is available Mon–Sat 10am–6pm GMT. We'll respond shortly — or email us at hello@brmjewellery.co.uk.",
  bespoke: "We'd love to discuss a bespoke commission with you. Our master goldsmiths can bring any vision to life. Please book a consultation at /appointments or share your ideas here.",
  delivery: "We offer free tracked delivery on all UK orders. Standard delivery takes 1–2 business days for in-stock pieces. All packages are fully insured.",
  returns: "You may return unworn, unaltered items within 14 days of delivery. Bespoke and engraved pieces are exempt. Contact us at hello@brmjewellery.co.uk to arrange a return.",
  price: "Our prices reflect the live metal spot rate and are updated daily. All pieces include UK VAT and are hallmarked by the London Assay Office.",
};

function getAutoReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('bespoke') || lower.includes('custom') || lower.includes('commission')) return AUTO_REPLIES.bespoke;
  if (lower.includes('deliver') || lower.includes('shipping') || lower.includes('postage')) return AUTO_REPLIES.delivery;
  if (lower.includes('return') || lower.includes('refund') || lower.includes('cancel')) return AUTO_REPLIES.returns;
  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) return AUTO_REPLIES.price;
  return AUTO_REPLIES.default;
}

function now() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      from: 'agent',
      text: 'Welcome to BRM Jewellery. How can we help you today?',
      time: now(),
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !minimised) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimised]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        from: 'agent',
        text: getAutoReply(text),
        time: now(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 900);
  };

  return (
    <>
      {/* Bubble */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimised(false); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-ink rounded-full flex items-center justify-center shadow-lg hover:bg-gold transition-colors group"
          aria-label="Open live chat"
        >
          <MessageCircle size={22} className="text-gold group-hover:text-ink transition-colors" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 shadow-2xl flex flex-col rounded-sm overflow-hidden border border-gold/20">
          {/* Header */}
          <div className="bg-ink flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                  <span className="font-cormorant text-gold text-sm font-light">B</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-ink" />
              </div>
              <div>
                <p className="text-white text-xs font-medium">BRM Jewellery</p>
                <p className="text-white/40 text-[10px]">Typically replies in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMinimised(!minimised)} className="text-white/40 hover:text-white transition-colors p-1">
                <Minus size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Messages */}
              <div className="bg-white flex-1 h-72 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.from === 'user' ? 'bg-ink text-white' : 'bg-cream text-ink'} px-3 py-2 rounded-sm`}>
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-white/40' : 'text-ink-muted/60'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              <div className="bg-cream border-t border-gold/10 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {['Bespoke enquiry', 'Delivery info', 'Returns'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="flex-shrink-0 text-[10px] uppercase tracking-wider border border-gold/30 text-ink-muted hover:border-gold hover:text-gold transition-colors px-2 py-1"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gold/10 flex items-center gap-2 px-3 py-2.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message…"
                  className="flex-1 text-xs text-ink outline-none placeholder:text-ink-muted/50 bg-transparent"
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="w-7 h-7 bg-ink rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-gold transition-colors"
                >
                  <Send size={12} className="text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
