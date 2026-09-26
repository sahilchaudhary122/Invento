import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiResponseError, ApiNotAvailableError } from '../api/client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      onClose();
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setError(err.detail || 'Authentication failed. Please verify your credentials.');
      } else if (err instanceof ApiNotAvailableError) {
        setError('Backend API is not reachable. Ensure the server is running on port 8000.');
      } else {
        setError('An unexpected error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="modal-title">Sign In to Invento</h2>
              <p className="modal-subtitle">Enter your warehouse credentials to authenticate</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="form-error-banner">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="form-input-wrapper">
              <Mail size={16} className="form-input-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input with-icon"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div className="form-input-wrapper">
              <Lock size={16} className="form-input-icon" />
              <input
                id="login-password"
                type="password"
                className="form-input with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
