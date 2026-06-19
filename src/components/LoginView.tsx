import React, { useState } from 'react';
import { Lock, User, ShieldAlert, UtensilsCrossed } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../config/adminCredentials';

interface LoginViewProps {
  onLogin: (user: { email: string; role: 'superadmin' | 'admin'; restaurantId?: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = ADMIN_CREDENTIALS.find(c => c.id === adminId && c.password === password);
      
      if (user) {
        // We use adminId as "email" for backward compatibility in App state
        onLogin({ email: user.id, role: user.role, restaurantId: user.restaurantId });
      } else {
        setError('Invalid Admin ID or password.');
      }
    } catch (err: any) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        
        {/* Logo and Header */}
        <div className="login-logo">
          <div className="logo-icon" style={{ width: '42px', height: '42px' }}>
            <UtensilsCrossed size={22} color="#ffffff" />
          </div>
          <span className="logo-text" style={{ fontSize: '26px' }}>VegDash</span>
        </div>
        
        <h2 style={{ textAlign: 'center', fontSize: '18px', color: '#ffffff', marginBottom: '24px', fontWeight: 500 }}>
          Partner & Admin Portal
        </h2>

        {error && (
          <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'var(--danger-glow)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '12px', color: '#fca5a5', marginBottom: '16px' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} style={{ color: 'var(--text-secondary)' }} /> Admin ID
            </label>
            <input 
              type="text" 
              value={adminId}
              onChange={e => setAdminId(e.target.value)}
              placeholder="e.g., admin_ishtaa"
              required
              className="form-input" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} style={{ color: 'var(--text-secondary)' }} /> Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="form-input" 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Logging in...' : 'Log In to Console'}
          </button>
        </form>

      </div>
    </div>
  );
};
