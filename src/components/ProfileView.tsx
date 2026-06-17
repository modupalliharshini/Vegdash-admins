import React, { useState, useEffect } from 'react';
import { Home, Save, RefreshCw, Clock, Coffee, ShieldAlert } from 'lucide-react';
import supabase from '../supabaseClient';

interface ProfileViewProps {
  profile: any;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  isLoading,
  onRefresh,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [openTime, setOpenTime] = useState('09:00 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');
  
  const [saving, setSaving] = useState(false);

  // Sync state with props when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDescription(profile.description || '');
      setAddress(profile.address || '');
      setDeliveryTime(profile.deliveryTime || '');
      setDiscountText(profile.discountText || '');
      setCoverImage(profile.coverImage || '');
      setIsOpen(profile.isOpen ?? true);
      
      // Parse timings if stored in description or set defaults
      setOpenTime('09:00 AM');
      setCloseTime('10:00 PM');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          description,
          address,
          deliveryTime,
          discountText,
          coverImage,
          isOpen,
          updatedAt: new Date().toISOString()
        })
        .eq('_id', profile._id);

      if (error) throw error;
      
      await onRefresh();
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error saving restaurant profile:', err.message);
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="rotate-loader" style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(16, 185, 129, 0.1)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>Profile not found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Could not load restaurant profile from Supabase.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Restaurant Profile</h2>
          <p className="page-subtitle">Configure timings, cover photo, status, and cuisine tags</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={onRefresh} disabled={saving}>
            <RefreshCw size={14} className={saving ? 'rotate-loader' : ''} />
            Reset Form
          </button>
        </div>
      </div>

      <div className="dashboard-layout" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
        
        {/* Profile Details Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={18} style={{ color: 'var(--primary)' }} />
            Profile Details
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Restaurant Name (Locked by Admin)</label>
              <input 
                type="text" 
                value={name} 
                disabled 
                className="form-input" 
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cuisine Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Brief summary of your menu, e.g., South Indian comfort food, pure veg..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Avg Delivery Time</label>
                <input 
                  type="text" 
                  value={deliveryTime} 
                  onChange={e => setDeliveryTime(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 25-35 min"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discount & Deals Offer</label>
                <input 
                  type="text" 
                  value={discountText} 
                  onChange={e => setDiscountText(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 20% off on first order"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Opening Time</label>
                <input 
                  type="text" 
                  value={openTime} 
                  onChange={e => setOpenTime(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 09:00 AM"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Closing Time</label>
                <input 
                  type="text" 
                  value={closeTime} 
                  onChange={e => setCloseTime(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 10:00 PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input 
                type="text" 
                value={coverImage} 
                onChange={e => setCoverImage(e.target.value)}
                className="form-input"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving changes...' : 'Save Profile Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Operational Status Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card: Operational Toggle */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--warning)' }} />
              Operational Status
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Store Status</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {isOpen ? 'Open for customer orders' : 'Closed - no orders accepted'}
                </div>
              </div>
              
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={isOpen}
                  onChange={e => setIsOpen(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <Coffee size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                Toggling closed will show your restaurant as offline in the customer app, stopping new orders immediately.
              </div>
            </div>
          </div>

          {/* Card: Preview */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '140px', background: '#1e293b', position: 'relative' }}>
              {coverImage ? (
                <img src={coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No cover photo selected
                </div>
              )}
              <span className={`badge ${isOpen ? 'out_for_delivery' : 'cancelled'}`} style={{ position: 'absolute', top: '12px', right: '12px' }}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>

            <div style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '18px', color: '#ffffff' }}>{name}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{address || 'No address configured'}</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>🕒 {openTime} - {closeTime}</span>
                <span>⚡ {deliveryTime || '30 min'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
