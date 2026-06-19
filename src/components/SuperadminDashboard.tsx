import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  DollarSign,
  Users,
  RefreshCw,
  X,
  Plus,
  Edit2,
  Shield,
  Percent,
  Gift,
  LogOut,
  Ban,
  CheckCircle,
  LayoutDashboard,
  UtensilsCrossed,
  Truck,
  Sun,
  Moon
} from 'lucide-react';
import { getRestaurantDetails, popularRestaurants } from '../mockData';
import supabase from '../supabaseClient';

interface SuperadminDashboardProps {
  orders: any[];
  foodItems: any[];
  customers: any[];
  onLogout: () => void;
  onRefresh: () => Promise<void>;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = ({
  orders,
  foodItems,
  customers,
  onLogout,
  onRefresh,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'users' | 'riders' | 'coupons' | 'payouts' | 'overrides'>('overview');
  const [loading, setLoading] = useState(false);

  // Commission and Payout states
  const [commissionRate, setCommissionRate] = useState(15); // Default 15%
  const [payoutStatus, setPayoutStatus] = useState<{ [key: string]: 'unpaid' | 'transferred' }>({
    res_1: 'unpaid',
    res_2: 'unpaid',
    res_3: 'unpaid',
    res_4: 'unpaid',
  });

  // Coupons state (Simulated)
  const [coupons, setCoupons] = useState<any[]>([
    { code: 'VEGDASH50', discount: 50, desc: '50% off on all restaurants', isActive: true },
    { code: 'SUPER100', discount: 30, desc: '30% off above ₹400', isActive: true },
    { code: 'JAINFREE', discount: 15, desc: '15% off Jain cuisines', isActive: false },
  ]);

  // Delivery Partners state (Simulated)
  const riders = [
    { id: 'rider_1', name: 'Rohan Sharma', status: 'active', rating: 4.8, earnings: 1250, ordersDelivered: 14 },
    { id: 'rider_2', name: 'Amit Singh', status: 'active', rating: 4.7, earnings: 980, ordersDelivered: 11 },
    { id: 'rider_3', name: 'Vikram Rao', status: 'offline', rating: 4.9, earnings: 1800, ordersDelivered: 20 },
    { id: 'rider_4', name: 'Sunny Gupta', status: 'active', rating: 4.5, earnings: 620, ordersDelivered: 7 },
  ];

  // User wallet and status modifications (Simulated overlay on DB)
  const [userWallets, setUserWallets] = useState<{ [key: string]: number }>({
    'fea0ab58-4795-4b57-b4c5-b8b1554ed887': 750, // Pandu
    'cad5a479-aad4-4f28-a107-befb415faf84': 300, // Harshini
  });
  const [userStatuses, setUserStatuses] = useState<{ [key: string]: 'active' | 'suspended' }>({});

  // CRUD Modals state
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRestId, setSelectedRestId] = useState<string | null>(null);
  const [selectedRestStats, setSelectedRestStats] = useState<any | null>(null);

  // Form states (Restaurant)
  const [restName, setRestName] = useState('');
  const [restCuisine, setRestCuisine] = useState('');
  const [restAddress, setRestAddress] = useState('');
  const [restDeliveryTime, setRestDeliveryTime] = useState('');
  const [restDiscount, setRestDiscount] = useState('');
  const [restCoverImage, setRestCoverImage] = useState('');

  // Wallet Form states
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Coupon Form state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // --- Aggregate Platform Stats ---
  const globalCompletedOrders = orders.filter(
    o => o.orderStatus !== 'cancelled' && (o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
  );
  
  const platformRevenue = globalCompletedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const platformCommissionEarned = platformRevenue * (commissionRate / 100);

  // Group revenue by restaurant
  const getRestaurantRevenue = (restaurantId: string) => {
    return globalCompletedOrders
      .filter(o => o.restaurant === restaurantId)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  };

  // --- Selected Restaurant Detail Calculations ---
  const selectedRestOrders = selectedRestStats 
    ? orders.filter(o => o.restaurant === selectedRestStats.id) 
    : [];
  const selectedRestCompleted = selectedRestOrders.filter(
    o => o.orderStatus !== 'cancelled' && (o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
  );
  const selectedRestRevenue = selectedRestCompleted.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const selectedRestCommission = selectedRestRevenue * (commissionRate / 100);
  const selectedRestPayout = selectedRestRevenue - selectedRestCommission;
  
  const selectedRestMenu = selectedRestStats 
    ? foodItems.filter(item => item.restaurant === selectedRestStats.id) 
    : [];

  const getCustomerName = (userId: string) => {
    if (!userId) return 'Guest Customer';
    const cust = customers.find(c => c._id === userId);
    return cust ? cust.name || cust.email : `User (${userId.substring(0, 8)}...)`;
  };


  // --- Restaurant Management Operations ---
  const handleOpenAddRestModal = () => {
    setModalMode('add');
    setRestName('');
    setRestCuisine('South Indian, Fast Food');
    setRestAddress('Bangalore, India');
    setRestDeliveryTime('25-35 mins');
    setRestDiscount('10% off');
    setRestCoverImage('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop');
    setIsRestModalOpen(true);
  };

  const handleOpenEditRestModal = (rest: any) => {
    setModalMode('edit');
    setSelectedRestId(rest.id);
    setRestName(rest.name || '');
    setRestCuisine(rest.cuisine || '');
    setRestAddress(rest.address || 'Bangalore, India');
    setRestDeliveryTime(rest.time || '25-35 mins');
    setRestDiscount(rest.discount || '');
    setRestCoverImage(rest.image || '');
    setIsRestModalOpen(true);
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modalMode === 'add') {
        const nextId = `res_${popularRestaurants.length + Date.now().toString().slice(-3)}`;
        
        // Push mock credentials simulation print
        console.log(`[Superadmin Credentials Creator] Account email created: ${restName.replace(/\s+/g, '').toLowerCase()}@vegdash.com / Password: admin`);

        const { error } = await supabase
          .from('restaurants')
          .insert({
            _id: nextId,
            name: restName,
            address: restAddress,
            coverImage: restCoverImage,
            deliveryTime: restDeliveryTime,
            discountText: restDiscount,
            categories: restCuisine.split(',').map(s => s.trim()),
            isOpen: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

        if (error) throw error;
        
        // Push into our mock metadata list
        popularRestaurants.push({
          id: nextId,
          name: restName,
          image: restCoverImage,
          rating: '4.5',
          time: restDeliveryTime,
          price: '₹200 for one',
          discount: restDiscount,
          cuisine: restCuisine
        });

        alert(`Restaurant Added! Login Credentials: \nEmail: ${restName.replace(/\s+/g, '').toLowerCase()}@vegdash.com\nPassword: admin`);
      } else {
        const { error } = await supabase
          .from('restaurants')
          .update({
            name: restName,
            address: restAddress,
            coverImage: restCoverImage,
            deliveryTime: restDeliveryTime,
            discountText: restDiscount,
            categories: restCuisine.split(',').map(s => s.trim()),
            updatedAt: new Date().toISOString()
          })
          .eq('_id', selectedRestId);

        if (error) throw error;

        // Sync local lookups
        const idx = popularRestaurants.findIndex(r => r.id === selectedRestId);
        if (idx !== -1) {
          popularRestaurants[idx] = {
            ...popularRestaurants[idx],
            name: restName,
            image: restCoverImage,
            time: restDeliveryTime,
            discount: restDiscount,
            cuisine: restCuisine
          };
        }

        alert('Restaurant profile updated successfully.');
      }
      setIsRestModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      alert('Error updating restaurant database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspendRestaurant = async (restId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ isOpen: !currentStatus })
        .eq('_id', restId);

      if (error) throw error;
      await onRefresh();
      alert(`Restaurant operational status toggled successfully.`);
    } catch (err: any) {
      alert('Operational toggle failed: ' + err.message);
    }
  };

  // --- User Modifications ---
  const handleOpenWalletModal = (userId: string) => {
    setSelectedUserId(userId);
    setWalletAmount('');
    setIsWalletModalOpen(true);
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || !selectedUserId) return;

    setUserWallets(prev => ({
      ...prev,
      [selectedUserId]: (prev[selectedUserId] || 0) + amount
    }));

    setIsWalletModalOpen(false);
    alert(`Wallet adjusted by ₹${amount}.`);
  };

  const handleToggleDeactivateUser = (userId: string) => {
    const currentStatus = userStatuses[userId] || 'active';
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    setUserStatuses(prev => ({
      ...prev,
      [userId]: nextStatus
    }));

    alert(`Customer account status changed to: ${nextStatus.toUpperCase()}`);
  };

  // --- Coupon Allocation ---
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const discNum = parseInt(newCouponDiscount);
    if (!newCouponCode || isNaN(discNum)) return;

    setCoupons(prev => [
      ...prev,
      { code: newCouponCode.toUpperCase(), discount: discNum, desc: newCouponDesc, isActive: true }
    ]);

    setIsCouponModalOpen(false);
    alert(`Global coupon ${newCouponCode.toUpperCase()} created.`);
  };

  // --- Payout Transfers ---
  const handleReleasePayout = (restId: string) => {
    setPayoutStatus(prev => ({
      ...prev,
      [restId]: 'transferred'
    }));
    alert('Payout transferred successfully!');
  };

  // --- Analytics Chart calculations ---
  const maxChartVal = Math.max(platformRevenue, 1000);

  return (
    <div className="app-container" style={{ marginLeft: 0 }}>
      {/* Superadmin Sidebar navigation */}
      <aside className="sidebar" style={{ position: 'fixed', left: 0 }}>
        <div className="logo-container">
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, var(--info) 0%, #1d4ed8 100%)', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <span className="logo-text">VegDash</span>
            <span className="logo-badge superadmin" style={{ marginLeft: '6px' }}>SuperAdmin</span>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSelectedRestStats(null); }}>
                <LayoutDashboard size={18} /> Platform Analytics
              </div>
            </li>
            <li>
              <div className={`nav-item ${activeTab === 'restaurants' ? 'active' : ''}`} onClick={() => { setActiveTab('restaurants'); setSelectedRestStats(null); }}>
                <UtensilsCrossed size={18} /> Restaurants CRUD
              </div>
            </li>
            <li>
              <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setSelectedRestStats(null); }}>
                <Users size={18} /> Customer Wallets
              </div>
            </li>
            <li>
              <div className={`nav-item ${activeTab === 'riders' ? 'active' : ''}`} onClick={() => { setActiveTab('riders'); setSelectedRestStats(null); }}>
                <Truck size={18} /> Live Delivery Fleet
              </div>
            </li>
            <li>
              <div className={`nav-item ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => { setActiveTab('coupons'); setSelectedRestStats(null); }}>
                <Gift size={18} /> Global Coupons
              </div>
            </li>
            <li>
              <div className={`nav-item ${activeTab === 'payouts' ? 'active' : ''}`} onClick={() => { setActiveTab('payouts'); setSelectedRestStats(null); }}>
                <Percent size={18} /> Payouts & Commission
              </div>
            </li>
            <li>
              <div className={`nav-item ${activeTab === 'overrides' ? 'active' : ''}`} onClick={() => { setActiveTab('overrides'); setSelectedRestStats(null); }}>
                <Shield size={18} /> System Order Overrides
              </div>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={14} style={{ color: 'var(--primary)' }} />
            <span>Root Authentication</span>
          </div>

          {onToggleTheme && (
            <button 
              className="theme-toggle-btn"
              onClick={onToggleTheme}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          )}

          <button 
            className="btn-secondary" 
            style={{ marginTop: '8px', width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }} 
            onClick={onLogout}
          >
            <LogOut size={12} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content container */}
      <div style={{ marginLeft: '260px', padding: '40px', width: 'calc(100% - 260px)' }}>

        {selectedRestStats ? (
          <div>
            {/* Header / Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setSelectedRestStats(null)}
              >
                ← Back to Restaurants
              </button>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: '#ffffff', fontWeight: 500 }}>{selectedRestStats.name} Inspector</span>
            </div>

            {/* Restaurant Hero Banner */}
            <div className="glass-card" style={{ padding: '0px', overflow: 'hidden', marginBottom: '30px', border: '1px solid var(--panel-border)' }}>
              <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                <img 
                  src={selectedRestStats.image} 
                  alt={selectedRestStats.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} 
                />
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 10 }}>
                  <span className={`badge ${selectedRestStats.isOpen ?? true ? 'out_for_delivery' : 'cancelled'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                    {selectedRestStats.isOpen ?? true ? 'Open / Active' : 'Suspended'}
                  </span>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{selectedRestStats.name}</h1>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', marginTop: '6px', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    {selectedRestStats.cuisine} • Average Delivery: {selectedRestStats.time} • Located: {selectedRestStats.address || 'Bangalore, India'}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Dashboard Grid */}
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
              <div className="glass-card">
                <div className="stat-header">
                  <span className="stat-title">Total Orders</span>
                  <div className="stat-icon-wrapper primary"><ShoppingBag size={20} /></div>
                </div>
                <div className="stat-value">{selectedRestOrders.length}</div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>All-time orders placed</span>
              </div>

              <div className="glass-card">
                <div className="stat-header">
                  <span className="stat-title">Total Revenue (Gross)</span>
                  <div className="stat-icon-wrapper info"><DollarSign size={20} /></div>
                </div>
                <div className="stat-value">₹{selectedRestRevenue.toLocaleString()}</div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From completed sales</span>
              </div>

              <div className="glass-card">
                <div className="stat-header">
                  <span className="stat-title">Platform Cut ({commissionRate}%)</span>
                  <div className="stat-icon-wrapper danger"><Percent size={20} /></div>
                </div>
                <div className="stat-value" style={{ color: 'var(--danger)' }}>₹{selectedRestCommission.toLocaleString()}</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deducted commission</span>
              </div>

              <div className="glass-card">
                <div className="stat-header">
                  <span className="stat-title">Partner Payout (Net)</span>
                  <div className="stat-icon-wrapper success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} /></div>
                </div>
                <div className="stat-value" style={{ color: 'var(--primary)' }}>₹{selectedRestPayout.toLocaleString()}</div>
                <span style={{ fontSize: '11px', color: 'var(--primary)' }}>Release due amount</span>
              </div>
            </div>

            {/* Detailed Multi-Column Log */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '30px', marginBottom: '40px' }}>
              
              {/* Left Column: Orders History */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingBag size={18} color="var(--primary)" /> Complete Order Log
                </h3>
                
                <div style={{ overflowX: 'auto' }}>
                  {selectedRestOrders.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No orders recorded for this restaurant.
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items Detail</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRestOrders.map((o: any) => (
                          <tr key={o._id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--info)' }}>
                              #{o._id.substring(0, 8)}
                            </td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{getCustomerName(o.user)}</div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ID: {o.user?.substring(0, 8)}...</span>
                            </td>
                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              {o.items && o.items.map((item: any, idx: number) => {
                                const food = foodItems.find(f => f._id === item.foodItem);
                                return (
                                  <div key={idx} style={{ margin: '2px 0' }}>
                                    • {item.quantity}x {food?.name || `Dish (${item.foodItem.substring(0, 5)}...)`} <span style={{ color: 'var(--text-muted)' }}>(₹{item.price})</span>
                                  </div>
                                );
                              })}
                            </td>
                            <td style={{ fontWeight: 600, color: '#ffffff' }}>₹{o.totalAmount}</td>
                            <td>
                              <span className={`badge ${o.orderStatus}`}>
                                {o.orderStatus.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Right Column: Menu / Dishes Directory */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UtensilsCrossed size={18} color="var(--info)" /> Store Menu & Dishes
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedRestMenu.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No food items configured for this restaurant.
                    </div>
                  ) : (
                    selectedRestMenu.map((item: any) => (
                      <div 
                        key={item._id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '16px', 
                          padding: '12px', 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          borderRadius: '8px', 
                          border: '1px solid rgba(255, 255, 255, 0.04)' 
                        }}
                      >
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150"} 
                          alt={item.name} 
                          style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150';
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                            {item.description || 'No description available'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>₹{item.price}</div>
                        </div>
                        <div>
                          <span className={`badge ${item.isAvailable ? 'out_for_delivery' : 'cancelled'}`} style={{ fontSize: '10px' }}>
                            {item.isAvailable ? 'Available' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Platform-wide Analytics</h2>
                <p className="page-subtitle">Aggregate data metrics across all partner operations</p>
              </div>
              <button className="btn-secondary" onClick={onRefresh}>
                <RefreshCw size={14} /> Sync Live Data
              </button>
            </div>

            <div className="stats-grid">
              <div className="glass-card">
                <div className="stat-header">
                  <span className="stat-title">Platform Revenue (GMV)</span>
                  <div className="stat-icon-wrapper primary"><DollarSign size={20} /></div>
                </div>
                <div className="stat-value">₹{platformRevenue.toLocaleString('en-IN')}</div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Aggregated order values</span>
              </div>

              <div className="glass-card">
                <div className="stat-header">
                  <span className="stat-title">Estimated Commission</span>
                  <div className="stat-icon-wrapper info"><Percent size={20} /></div>
                </div>
                <div className="stat-value">₹{platformCommissionEarned.toLocaleString('en-IN')}</div>
                <span style={{ fontSize: '11px', color: 'var(--primary)' }}>{commissionRate}% take rate</span>
              </div>

              <div className="glass-card">
                <div className="stat-header">
                  <span className="stat-title">Total Orders</span>
                  <div className="stat-icon-wrapper warning"><ShoppingBag size={20} /></div>
                </div>
                <div className="stat-value">{orders.length}</div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pending & completed</span>
              </div>

              <div className="glass-card">
                <div className="stat-header">
                  <span className="stat-title">Operational Outlets</span>
                  <div className="stat-icon-wrapper danger"><UtensilsCrossed size={20} /></div>
                </div>
                <div className="stat-value">{popularRestaurants.length}</div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Integrated restaurants</span>
              </div>
            </div>

            {/* Dynamic Charts */}
            <div className="dashboard-layout">
              <div className="glass-card chart-card">
                <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '20px' }}>Earning Performance</h3>
                <div className="bar-chart-container">
                  {popularRestaurants.map((r, idx) => {
                    const rev = getRestaurantRevenue(r.id);
                    const percentage = (rev / maxChartVal) * 100;
                    return (
                      <div key={idx} className="bar-wrapper">
                        <div className="bar-column" style={{ height: `${Math.max(percentage, 5)}%`, background: 'linear-gradient(to top, #1d4ed8, var(--info))' }}>
                          <div className="bar-tooltip">₹{rev.toLocaleString()}</div>
                        </div>
                        <span className="bar-label" style={{ maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px' }}>Live Platform Feed</h3>
                <div className="activity-list">
                  {orders.slice(0, 5).map(o => {
                    const rest = getRestaurantDetails(o.restaurant);
                    return (
                      <div key={o._id} className="activity-item">
                        <div className={`activity-dot ${o.orderStatus}`} />
                        <div className="activity-content">
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>
                            Order #{o._id.substring(0, 8)} • {rest.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Total: ₹{o.totalAmount} • Status: {o.orderStatus.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESTAURANTS CRUD */}
        {activeTab === 'restaurants' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Platform Restaurants Manager</h2>
                <p className="page-subtitle">Add, edit, or toggle availability of partner storefronts</p>
              </div>
              <button className="btn-primary" onClick={handleOpenAddRestModal}>
                <Plus size={16} /> Register New Outlet
              </button>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cover Photo & Name</th>
                    <th>Cuisines / Tags</th>
                    <th>Avg Delivery</th>
                    <th>Deals text</th>
                    <th>Store Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {popularRestaurants.map((r: any) => {
                    const isOpen = r.isOpen ?? true;

                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={r.image} alt={r.name} style={{ width: '48px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 600 }}>{r.name}</div>
                              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>ID: {r.id}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{r.cuisine}</td>
                        <td style={{ fontSize: '13px' }}>{r.time}</td>
                        <td style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>{r.discount || 'No active offer'}</td>
                        <td>
                          <span className={`badge ${isOpen ? 'out_for_delivery' : 'cancelled'}`}>
                            {isOpen ? 'Open' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--primary)', boxShadow: 'none' }}
                              onClick={() => setSelectedRestStats(r)}
                            >
                              Open
                            </button>
                            <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleOpenEditRestModal(r)}>
                              <Edit2 size={12} /> Edit
                            </button>
                            <button 
                              className="btn-secondary" 
                              style={{ 
                                padding: '6px 10px',
                                color: isOpen ? 'var(--danger)' : 'var(--primary)',
                                borderColor: isOpen ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                background: isOpen ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
                              }}
                              onClick={() => handleToggleSuspendRestaurant(r.id, isOpen)}
                            >
                              <Ban size={12} /> {isOpen ? 'Suspend' : 'Resume'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMERS & WALLETS */}
        {activeTab === 'users' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">User Account Controller</h2>
                <p className="page-subtitle">Adjust simulated wallets and deactivate accounts</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Wallet Balance</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const balance = userWallets[c._id] || 0;
                    const status = userStatuses[c._id] || 'active';

                    return (
                      <tr key={c._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.name || 'Anonymous User'}</div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c._id}</span>
                        </td>
                        <td style={{ fontSize: '13px' }}>{c.email}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.phone || 'N/A'}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{balance}</td>
                        <td>
                          <span className={`badge ${status === 'active' ? 'out_for_delivery' : 'cancelled'}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button className="btn-secondary" style={{ padding: '6px 10px', color: 'var(--primary)', borderColor: 'rgba(16, 185, 129, 0.2)' }} onClick={() => handleOpenWalletModal(c._id)}>
                              + Wallet
                            </button>
                            <button 
                              className="btn-secondary"
                              style={{ 
                                padding: '6px 10px',
                                color: status === 'active' ? 'var(--danger)' : 'var(--primary)',
                                borderColor: status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                              }}
                              onClick={() => handleToggleDeactivateUser(c._id)}
                            >
                              {status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RIDERS LOGISTICS */}
        {activeTab === 'riders' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Delivery Fleet Operations</h2>
                <p className="page-subtitle">Track rider coordinates and platform earnings</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rider Name</th>
                    <th>Current Status</th>
                    <th>Average Rating</th>
                    <th>Total Deliveries</th>
                    <th>Earnings (Weekly)</th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map((rider) => (
                    <tr key={rider.id}>
                      <td style={{ fontWeight: 600 }}>{rider.name}</td>
                      <td>
                        <span className={`badge ${rider.status === 'active' ? 'out_for_delivery' : 'cancelled'}`}>
                          {rider.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>⭐ {rider.rating}</td>
                      <td>{rider.ordersDelivered} orders</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{rider.earnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS */}
        {activeTab === 'coupons' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Platform Coupons</h2>
                <p className="page-subtitle">Create and distribute platform coupons across all restaurants</p>
              </div>
              <button className="btn-primary" onClick={() => setIsCouponModalOpen(true)}>
                <Plus size={16} /> Create Coupon
              </button>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount Percent</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c, idx) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--info)' }}>{c.code}</td>
                      <td style={{ fontWeight: 600 }}>{c.discount}% OFF</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.desc}</td>
                      <td>
                        <span className={`badge ${c.isActive ? 'out_for_delivery' : 'cancelled'}`}>
                          {c.isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: PAYOUTS */}
        {activeTab === 'payouts' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">Payouts & Commission Settings</h2>
                <p className="page-subtitle">Distribute operational shares to restaurant partners</p>
              </div>
            </div>

            {/* Commission setup config */}
            <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: '#ffffff' }}>Global Commission Rate</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Default percentage deducted from every completed restaurant transaction</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="number" 
                  value={commissionRate}
                  onChange={e => setCommissionRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  style={{ width: '80px', padding: '10px', textAlign: 'center' }}
                  className="form-input"
                />
                <span style={{ fontSize: '18px', fontWeight: 600 }}>%</span>
              </div>
            </div>

            {/* Payouts list */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Restaurant Name</th>
                    <th>Total Sales</th>
                    <th>Platform Share ({commissionRate}%)</th>
                    <th>Due Payout (Partner)</th>
                    <th>Payout Status</th>
                    <th style={{ textAlign: 'right' }}>Transfer Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {popularRestaurants.map((r) => {
                    const sales = getRestaurantRevenue(r.id);
                    const commission = sales * (commissionRate / 100);
                    const due = sales - commission;
                    const status = payoutStatus[r.id] || 'unpaid';

                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                        <td style={{ fontWeight: 500 }}>₹{sales.toLocaleString()}</td>
                        <td style={{ color: 'var(--danger)' }}>-₹{commission.toLocaleString()}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{due.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${status}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-primary"
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                background: status === 'transferred' ? 'rgba(255,255,255,0.03)' : 'var(--primary)',
                                color: status === 'transferred' ? 'var(--text-muted)' : '#ffffff',
                                border: status === 'transferred' ? '1px solid var(--panel-border)' : 'none',
                                boxShadow: 'none'
                              }}
                              disabled={status === 'transferred' || sales === 0}
                              onClick={() => handleReleasePayout(r.id)}
                            >
                              Release Payout
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: SYSTEM ORDER OVERRIDES */}
        {activeTab === 'overrides' && (
          <div>
            <div className="page-header">
              <div>
                <h2 className="page-title">System Order Overrides</h2>
                <p className="page-subtitle">Elevated admin panel to override status, reassign riders, or cancel orders</p>
              </div>
              <button className="btn-secondary" onClick={onRefresh}>
                <RefreshCw size={14} /> Refresh Orders
              </button>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Restaurant</th>
                      <th>Customer</th>
                      <th>Rider Email</th>
                      <th>OTP Code</th>
                      <th>Status</th>
                      <th>Transitions</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      let itemDriver: any = null;
                      if (o.driver) {
                        try {
                          itemDriver = typeof o.driver === 'string' ? JSON.parse(o.driver) : o.driver;
                        } catch (_) {}
                      }
                      return (
                        <tr key={o._id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            #{o._id.substring(0, 8)}
                          </td>
                          <td style={{ fontWeight: 600 }}>{o.restaurant}</td>
                          <td>{getCustomerName(o.customer)}</td>
                          <td>{itemDriver ? itemDriver.email : 'Unassigned'}</td>
                          <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{o.pickup_otp || 'None'}</td>
                          <td>
                            <span className={`badge ${o.status || o.orderStatus}`}>
                              {(o.status || o.orderStatus || '').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {o.placed_at && <div>Placed: {new Date(o.placed_at).toLocaleTimeString()}</div>}
                            {o.ready_for_pickup_at && <div>Ready: {new Date(o.ready_for_pickup_at).toLocaleTimeString()}</div>}
                            {o.delivered_at && <div>Delivered: {new Date(o.delivered_at).toLocaleTimeString()}</div>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              {(o.status !== 'cancelled' && o.status !== 'delivered' && o.orderStatus !== 'cancelled' && o.orderStatus !== 'delivered') && (
                                <>
                                  <button
                                    className="btn-primary"
                                    style={{ padding: '6px 10px', fontSize: '11px', background: 'var(--danger)', borderColor: 'transparent' }}
                                    onClick={async () => {
                                      if (window.confirm('Force cancel this order?')) {
                                        const { error } = await supabase.rpc('super_admin_cancel_order', { p_order_id: o._id });
                                        if (error) alert(error.message);
                                        else onRefresh();
                                      }
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    style={{ padding: '6px 10px', fontSize: '11px' }}
                                    onClick={async () => {
                                      const emailInput = window.prompt('Enter new rider email (e.g. rohan@vegdash.com):');
                                      if (!emailInput) return;
                                      
                                      let riderUuid = '55555555-5555-5555-5555-555555555555'; // Rohan's seed ID
                                      let riderName = 'Rohan Sharma';
                                      if (emailInput.includes('amit')) {
                                        riderUuid = '66666666-6666-6666-6666-666666666666'; // Amit's seed ID
                                        riderName = 'Amit Singh';
                                      }

                                      const driverJSON = {
                                        name: riderName,
                                        email: emailInput,
                                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
                                        phone: '9876543210',
                                        pickupCode: o.pickup_otp || '1234',
                                        location: { lat: 17.4483, lng: 78.3741, progress: 0, stage: 'to_store' }
                                      };

                                      const { error } = await supabase.rpc('super_admin_reassign_rider', {
                                        p_order_id: o._id,
                                        p_rider_id: riderUuid,
                                        p_driver_json: driverJSON
                                      });
                                      if (error) alert(error.message);
                                      else onRefresh();
                                    }}
                                  >
                                    Reassign Rider
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUDIT LOG REPORTING */}
            <div style={{ marginTop: '40px' }}>
              <div className="page-header" style={{ marginBottom: '20px' }}>
                <div>
                  <h3 style={{ color: '#ffffff', fontSize: '18px' }}>Auditable Order Status History Logs</h3>
                  <p className="page-subtitle">Platform-wide transitions from order_status_history table</p>
                </div>
              </div>
              <AuditLogsList />
            </div>
          </div>
        )}
          </>
        )}

      </div>

      {/* MODALS */}
      {/* Restaurant Add/Edit Modal */}
      {isRestModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRestModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#ffffff' }}>{modalMode === 'add' ? 'Register New Restaurant' : 'Edit Restaurant Profile'}</h3>
              <button className="close-btn" onClick={() => setIsRestModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveRestaurant} className="modal-body">
              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input type="text" value={restName} onChange={e => setRestName(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Cuisines (comma separated)</label>
                <input type="text" value={restCuisine} onChange={e => setRestCuisine(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" value={restAddress} onChange={e => setRestAddress(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Average Delivery Time</label>
                <input type="text" value={restDeliveryTime} onChange={e => setRestDeliveryTime(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Deals Discount Text</label>
                <input type="text" value={restDiscount} onChange={e => setRestDiscount(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input type="text" value={restCoverImage} onChange={e => setRestCoverImage(e.target.value)} className="form-input" />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsRestModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Restaurant'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <div className="modal-overlay" onClick={() => setIsWalletModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#ffffff' }}>Adjust Wallet Balance</h3>
              <button className="close-btn" onClick={() => setIsWalletModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveWallet} className="modal-body">
              <div className="form-group">
                <label className="form-label">Add / Remove Balance (₹)</label>
                <input 
                  type="number" 
                  value={walletAmount} 
                  onChange={e => setWalletAmount(e.target.value)} 
                  required 
                  placeholder="e.g. 100 or -50" 
                  className="form-input" 
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsWalletModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Apply adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCouponModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#ffffff' }}>Create Global Coupon</h3>
              <button className="close-btn" onClick={() => setIsCouponModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCoupon} className="modal-body">
              <div className="form-group">
                <label className="form-label">Coupon Code</label>
                <input type="text" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} required placeholder="e.g. VEG50" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Percent (%)</label>
                <input type="number" value={newCouponDiscount} onChange={e => setNewCouponDiscount(e.target.value)} required placeholder="e.g. 50" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" value={newCouponDesc} onChange={e => setNewCouponDesc(e.target.value)} placeholder="e.g. 50% discount on first delivery order" className="form-input" />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCouponModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const AuditLogsList: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .order('changed_at', { ascending: false });
      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading audit logs...</div>;

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Changed Status</th>
            <th>Timestamp</th>
            <th>Changed By Role</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>#{h.order_id?.substring(0, 8)}</td>
              <td>
                <span className={`badge ${h.status}`}>
                  {h.status}
                </span>
              </td>
              <td>{new Date(h.changed_at).toLocaleString()}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{h.changed_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
