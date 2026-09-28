import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Sparkles, Send, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { formatRelative } from '@/lib/utils';
import { loadList, saveList, uid, nowISO, STORAGE_KEYS } from '@/lib/storage';
import { generateAssistantResponse } from '@/lib/assistantEngine';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
};

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;
  let codeBlock: string[] | null = null;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (codeBlock === null) {
        codeBlock = [];
      } else {
        elements.push(
          <pre key={`code-${i}`} className="bg-ink-900 text-cream-100 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">
            <code>{codeBlock.join('\n')}</code>
          </pre>
        );
        codeBlock = null;
      }
      i++;
      continue;
    }

    if (codeBlock !== null) {
      codeBlock.push(line);
      i++;
      continue;
    }

    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
      continue;
    }
    if (trimmed.startsWith('### '))
      elements.push(<h4 key={i} className="font-semibold text-ink-800 mt-2 mb-1 text-sm">{trimmed.slice(4)}</h4>);
    else if (trimmed.startsWith('## '))
      elements.push(<h3 key={i} className="font-semibold text-ink-800 mt-2 mb-1">{trimmed.slice(3)}</h3>);
    else if (trimmed.startsWith('| '))
      elements.push(<p key={i} className="font-mono text-xs text-ink-600 whitespace-pre overflow-x-auto">{trimmed}</p>);
    else if (/^\d+\.\s/.test(trimmed))
      elements.push(<p key={i} className="ml-4 text-ink-700">{trimmed}</p>);
    else if (trimmed.startsWith('- '))
      elements.push(<p key={i} className="ml-4 text-ink-700">{'• ' + trimmed.slice(2)}</p>);
    else
      elements.push(<p key={i} className="text-ink-700">{trimmed}</p>);
    i++;
  }

  if (codeBlock !== null) {
    elements.push(
      <pre key={`code-end`} className="bg-ink-900 text-cream-100 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">
        <code>{codeBlock.join('\n')}</code>
      </pre>
    );
  }

  return elements;
}

export default function Assistant() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadList<Conversation>(STORAGE_KEYS.chat));
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const messages = activeConv?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const persist = (next: Conversation[]) => {
    setConversations(next);
    saveList(STORAGE_KEYS.chat, next);
  };

  const newConversation = () => {
    const conv: Conversation = { id: uid(), title: 'New Conversation', messages: [], created_at: nowISO(), updated_at: nowISO() };
    persist([conv, ...conversations]);
    setActiveConvId(conv.id);
  };

  const deleteConversation = (id: string) => {
    persist(conversations.filter((c) => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
  };

  const sendMessage = () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    let convId = activeConvId;
    let convList = conversations;

    if (!convId) {
      const conv: Conversation = { id: uid(), title: content.slice(0, 40), messages: [], created_at: nowISO(), updated_at: nowISO() };
      convList = [conv, ...conversations];
      convId = conv.id;
      setActiveConvId(convId);
    }

    const userMsg: ChatMessage = { id: uid(), role: 'user', content, created_at: nowISO() };

    const updatedWithUser = convList.map((c) =>
      c.id === convId
        ? {
            ...c,
            messages: [...c.messages, userMsg],
            title: c.title === 'New Conversation' ? content.slice(0, 40) : c.title,
            updated_at: nowISO(),
          }
        : c
    );
    persist(updatedWithUser);

    const history = (updatedWithUser.find((c) => c.id === convId)?.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setTimeout(() => {
      const result = generateAssistantResponse(content, { history });
      const assistantContent = result.followup ? `${result.content}\n\n${result.followup}` : result.content;
      const assistantMsg: ChatMessage = { id: uid(), role: 'assistant', content: assistantContent, created_at: nowISO() };

      const updatedWithAssistant = (prev: Conversation[]) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg], updated_at: nowISO() }
            : c
        );

      setConversations((prev) => {
        const next = updatedWithAssistant(prev);
        saveList(STORAGE_KEYS.chat, next);
        return next;
      });
      setSending(false);
    }, 600 + Math.random() * 800);
  };

  return (
    <div className="flex gap-4 animate-fade-in md:pt-0 pt-2 h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
      <div className="hidden md:flex w-56 flex-col shrink-0">
        <button onClick={newConversation} className="btn-primary flex items-center gap-2 justify-center mb-3">
          <Plus size={16} /> New Chat
        </button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.map((conv) => (
            <button key={conv.id} onClick={() => setActiveConvId(conv.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all group ${activeConvId === conv.id ? 'bg-cream-100 text-ink-800' : 'text-ink-500 hover:bg-cream-50'}`}>
              <MessageSquare size={14} className="shrink-0" />
              <span className="flex-1 text-left truncate">{conv.title}</span>
              <span onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-blush-500 transition-all">
                <Trash2 size={12} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col card overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-lavender-100 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-lavender-500" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-ink-700 mb-1">AI Assistant</h3>
            <p className="text-sm text-ink-400 text-center max-w-xs mb-4">
              Your personal AI companion. Ask me to plan your day, organize tasks, prepare for exams, or just chat.
            </p>
            <button onClick={newConversation} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Start Conversation
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-ink-800 text-cream-50 rounded-br-md' : 'bg-cream-100 text-ink-700 rounded-bl-md'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="space-y-0.5">{renderContent(msg.content)}</div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-cream-300' : 'text-ink-400'}`}>{formatRelative(msg.created_at)}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-cream-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="border-t border-cream-200 p-3">
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Type your message..." value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              className="input flex-1" disabled={sending} />
            <button onClick={sendMessage} className="btn-primary p-2.5" disabled={!input.trim() || sending}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
