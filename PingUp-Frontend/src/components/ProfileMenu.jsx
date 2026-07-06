export default function ProfileMenu({
  showProfileMenu,
  currentUser,
  onOpenProfile,
  setShowProfileMenu,
  muted,
  setMuted,
  deafened,
  setDeafened,
  isOwner,
  onOpenAdmin,
  setShowNewCategory,
  setShowLogoutModal,
}) {
  if (!showProfileMenu) return null;

  return (
    <div className="dm-profile-menu">
      <div className="dm-profile-menu-header">
        <div className={`dm-pm-avatar avatar-${currentUser.role}`}>
          {currentUser.username[0].toUpperCase()}
        </div>
        <div>
          <div className="dm-pm-name">{currentUser.username}</div>
          <div className={`dm-pm-role role-${currentUser.role}`}>{currentUser.role}</div>
          <div className="dm-pm-status">🟢 Online</div>
        </div>
      </div>

      <div className="dm-pm-divider" />

      <button
        className="dm-pm-item"
        onClick={() => { onOpenProfile(); setShowProfileMenu(false); }}
      >👤 View Profile</button>
      <button
        className="dm-pm-item"
        onClick={() => setMuted(v => !v)}
      >{muted ? '🎙️ Unmute' : '🔇 Mute Microphone'}</button>
      <button
        className="dm-pm-item"
        onClick={() => setDeafened(v => !v)}
      >{deafened ? '🎧 Undeafen' : '🔕 Deafen'}</button>

      {isOwner && (
        <>
          <div className="dm-pm-divider" />
          <div className="dm-pm-section-label">👑 Owner Controls</div>

          <button
            className="dm-pm-item"
            onClick={() => {
              onOpenAdmin?.();
              setShowProfileMenu(false);
            }}
          >🛡️ Admin Panel</button>

          <button
            className="dm-pm-item"
            onClick={() => {
              setShowNewCategory(true);
              setShowProfileMenu(false);
            }}
          >📁 New Category</button>
        </>
      )}

      <div className="dm-pm-divider" />

      <button
        className="dm-pm-item danger" onClick={() => {
          setShowLogoutModal(true);
        }} >
        🚪 Log Out
      </button>
    </div>
  );
}
