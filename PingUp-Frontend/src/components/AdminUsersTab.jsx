export default function AdminUsersTab({ loadingUsers, allUsers, currentUser, handleKick, handleBan }) {
  return (
    <div className="admin-section">
      <p className="admin-hint">
        View all users, their roles and online status.
      </p>
      {loadingUsers ? (
        <div className="admin-loading">Loading users…</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Logins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map(u => (
              <tr key={u.id} className={u.banned ? 'admin-row-banned' : ''}>
                <td className="admin-user-cell">
                  <div className={`admin-user-avatar avatar-${u.role}`}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="admin-user-name">{u.username}</div>
                    {u.displayName !== u.username && (
                      <div className="admin-user-display">{u.displayName}</div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`role-badge-sm role-${u.role}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`admin-status ${u.online ? 'online' : 'offline'}`}>
                    {u.online ? '🟢 Online' : '⚫ Offline'}
                  </span>
                </td>
                <td className="admin-center">{u.loginCount || 0}</td>
                <td className="admin-actions-cell">
                  {u.id !== currentUser.id && u.role !== 'owner' && (
                    <>
                      <button
                        className="admin-btn-sm"
                        disabled={u.banned}
                        onClick={() => handleKick(u.id, u.username)}
                      >👢 Kick</button>
                      <button
                        className="admin-btn-sm admin-btn-danger"
                        disabled={u.banned}
                        onClick={() => handleBan(u.id, u.username)}
                      >{u.banned ? '🔨 Banned' : '🔨 Ban'}</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
