import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, UtensilsCrossed } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: { email: string; role: 'superadmin' | 'admin'; restaurantId?: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrim = email.trim().toLowerCase();

    // Direct credentials validation
    if (emailTrim === 'superadmin@vegdash.com' && password === 'superadmin') {
      onLogin({ email: emailTrim, role: 'superadmin' });
    } else if (emailTrim === 'ishtaa@vegdash.com' && password === 'admin') {
      onLogin({ email: emailTrim, role: 'admin', restaurantId: 'res_1' });
    } else if (emailTrim === 'jain@vegdash.com' && password === 'admin') {
      onLogin({ email: emailTrim, role: 'admin', restaurantId: 'res_2' });
    } else if (emailTrim === 'sattvik@vegdash.com' && password === 'admin') {
      onLogin({ email: emailTrim, role: 'admin', restaurantId: 'res_3' });
    } else {
      setError('Invalid email or password. Try using the demo login buttons below.');
    }
  };

  const handleDemoLogin = (role: 'superadmin' | 'admin', email: string, restaurantId?: string) => {
    onLogin({ email, role, restaurantId });
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
              <Mail size={14} style={{ color: 'var(--text-secondary)' }} /> Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@vegdash.com"
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

          <button type="submit" className="btn-primary" style={{ marginTop: '8px', justifyContent: 'center', padding: '12px' }}>
            Log In to Console
          </button>
        </form>

        {/* Demo Fast Login Bypass Panel */}
        <div className="demo-accounts-panel">
          <div className="demo-title">Demo Fast Access Accounts</div>
          <div className="demo-buttons-grid">
            <button 
              className="demo-login-btn"
              onClick={() => handleDemoLogin('superadmin', 'superadmin@vegdash.com')}
            >
              <span>Platform Superadmin</span>
              <span className="demo-login-badge superadmin">Superadmin</span>
            </button>
            
            <button 
              className="demo-login-btn"
              onClick={() => handleDemoLogin('admin', 'ishtaa@vegdash.com', 'res_1')}
            >
              <span>Ishtaa Pure Veg</span>
              <span className="demo-login-badge">res_1 partner</span>
            </button>

            <button 
              className="demo-login-btn"
              onClick={() => handleDemoLogin('admin', 'jain@vegdash.com', 'res_2')}
            >
              <span>Jain Bhoj Kitchen</span>
              <span className="demo-login-badge">res_2 partner</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
