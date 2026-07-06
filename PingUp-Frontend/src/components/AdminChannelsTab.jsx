import CreateChannelForm from './CreateChannelForm';

export default function AdminChannelsTab({ categories, socket, notify, handleToggleReadOnly, handleToggleLock, handleTogglePrivate, handleRenameChannel, handleDeleteChannel }) {
  return (
    <div className="admin-section">
      <p className="admin-hint">
        Manage all channels — toggle permissions, rename, or delete.
      </p>

      {(categories || []).map(cat => (
        <div key={cat.id} className="admin-cat-block">
          <div className="admin-cat-name">
            <span>📁 {cat.name}</span>
            <button
              className="admin-btn-sm admin-btn-danger"
              onClick={() => {
                if (!confirm(`Delete category "${cat.name}" and all its channels?`)) return;
                socket?.emit('category:delete', { categoryId: cat.id });
                notify(`Deleted category "${cat.name}"`);
              }}
            >Delete Category</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Read-only</th>
                <th>Locked</th>
                <th>Private</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cat.channels.map(ch => (
                <tr key={ch.id}>
                  <td className="admin-ch-name">
                    {ch.emoji} #{ch.name}
                    <span className="admin-ch-desc">{ch.description}</span>
                  </td>
                  <td>
                    <button
                      className={`admin-toggle ${ch.isReadOnly ? 'on' : 'off'}`}
                      onClick={() => handleToggleReadOnly(ch)}
                      title="Toggle read-only"
                    >
                      {ch.isReadOnly ? '🔇 ON' : '✍️ OFF'}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`admin-toggle ${ch.isLocked ? 'on' : 'off'}`}
                      onClick={() => handleToggleLock(ch)}
                      title="Toggle locked"
                    >
                      {ch.isLocked ? '🔒 ON' : '🔓 OFF'}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`admin-toggle ${ch.isPrivate ? 'on' : 'off'}`}
                      onClick={() => handleTogglePrivate(ch)}
                      title="Toggle private"
                    >
                      {ch.isPrivate ? '👁️ ON' : '🌐 OFF'}
                    </button>
                  </td>
                  <td className="admin-actions-cell">
                    <button
                      className="admin-btn-sm"
                      onClick={() => handleRenameChannel(ch)}
                    >✏️ Rename</button>
                    <button
                      className="admin-btn-sm admin-btn-danger"
                      onClick={() => handleDeleteChannel(ch)}
                    >🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Create new channel form */}
      <CreateChannelForm categories={categories} socket={socket} onNotify={notify} />
    </div>
  );
}
