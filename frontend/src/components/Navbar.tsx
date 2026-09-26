import React, { useState } from 'react';
import { ChevronRight, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

interface NavbarProps {
  activeLabel: string;
}

export default function Navbar({ activeLabel }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        {/* Breadcrumb path */}
        <div className="topbar-breadcrumb">
          <span>Invento</span>
          <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
          <span>Operations</span>
          <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
          <span className="active">{activeLabel}</span>
        </div>

        {/* User Session Indicator */}
        <div className="topbar-actions">
          {user ? (
            <div className="user-session">
              <div className="user-profile-badge">
                <div className="user-avatar">
                  <UserIcon size={14} />
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={logout}
                title={`Signed in as ${user.email}`}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
