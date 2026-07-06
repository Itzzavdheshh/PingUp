import { useState } from 'react';

export default function CreateChannelForm({ categories, socket, onNotify }) {
  const [form, setForm] = useState({
    categoryId: '',
    name: '', description: '', emoji: '💬',
    isReadOnly: false, isPrivate: false,
  });
  const EMOJIS = ['💬','🌿','⚙️','📢','🎲','💡','📋','🔒','🌐','🎯','🧪','📌'];

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) return;
    socket?.emit('channel:create', {
      categoryId:  form.categoryId,
      name:        form.name.trim(),
      description: form.description.trim(),
      emoji:       form.emoji,
    });
    onNotify(`Created #${form.name}`);
    setForm({ categoryId: form.categoryId, name: '', description: '', emoji: '💬', isReadOnly: false, isPrivate: false });
  }

  return (
    <div className="admin-create-form">
      <h4 className="admin-create-title">➕ Create New Channel</h4>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <select
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            required
          >
            <option value="">Select category…</option>
            {(categories || []).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            placeholder="channel-name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="admin-emoji-row">
          {EMOJIS.map(em => (
            <button
              key={em} type="button"
              className={`admin-emoji-btn ${form.emoji === em ? 'selected' : ''}`}
              onClick={() => setForm(f => ({ ...f, emoji: em }))}
            >{em}</button>
          ))}
        </div>
        <button type="submit" className="admin-submit-btn">Create Channel</button>
      </form>
    </div>
  );
}
