export default function AdminRolesTab({ loadingUsers, allUsers, handleSetRole }) {
  return (
    <div className="admin-section">
      <p className="admin-hint">
        Assign roles to users. Members can only read. Moderators can delete and pin messages.
      </p>

      <div className="admin-role-legend">
        <div className="role-legend-item">
          <span className="role-badge-sm role-owner">👑 Owner</span>
          <span>Full control — channel management, banning, all permissions</span>
        </div>
        <div className="role-legend-item">
          <span className="role-badge-sm role-moderator">🛡️ Moderator</span>
          <span>Delete & pin messages, kick members</span>
        </div>
        <div className="role-legend-item">
          <span className="role-badge-sm role-member">👤 Member</span>
          <span>Send messages in unlocked, non-read-only channels</span>
        </div>
      </div>

      {loadingUsers ? (
        <div className="admin-loading">Loading users…</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Current Role</th>
              <th>Assign Role</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.filter(u => u.role !== 'owner').map(u => (
              <tr key={u.id}>
                <td className="admin-user-cell">
                  <div className={`admin-user-avatar avatar-${u.role}`}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <span>{u.username}</span>
                </td>
                <td>
                  <span className={`role-badge-sm role-${u.role}`}>{u.role}</span>
                </td>
                <td className="admin-role-btns">
                  <button
                    className={`admin-role-btn ${u.role === 'moderator' ? 'active' : ''}`}
                    onClick={() => handleSetRole(u.id, 'moderator')}
                    disabled={u.role === 'moderator'}
                  >🛡️ Moderator</button>
                  <button
                    className={`admin-role-btn ${u.role === 'member' ? 'active' : ''}`}
                    onClick={() => handleSetRole(u.id, 'member')}
                    disabled={u.role === 'member'}
                  >👤 Member</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
