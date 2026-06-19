import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, Bell, Wifi, User, Check, X, LogOut, Sun, Moon } from 'lucide-react';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { LiveOrdersView } from './components/LiveOrdersView';
import { MenuView } from './components/MenuView';
import { CustomersView } from './components/CustomersView';
import { ProfileView } from './components/ProfileView';
import { SuperadminDashboard } from './components/SuperadminDashboard';
import { popularRestaurants } from './mockData';
import supabase from './supabaseClient';

interface UserSession {
  email: string;
  role: 'superadmin' | 'admin';
  restaurantId?: string;
}

interface Toast {
  id: number;
  title: string;
  message: string;
  type?: 'info' | 'order_alert';
  orderData?: any;
}

const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Tone 1 (Ding) - A5 note (880 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Tone 2 (Dong) - E5 note (659.25 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start();
    osc1.stop(ctx.currentTime + 0.5);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.7);
  } catch (error) {
    console.error('Audio playback failed or blocked:', error);
  }
};

export default function App() {
  // Session Authentication State
  const [user, setUser] = useState<UserSession | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [restaurantProfile, setRestaurantProfile] = useState<any | null>(null);
  
  // Loading states
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [foodLoading, setFoodLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Connection status
  const [dbConnected, setDbConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast handler
  const showToast = (title: string, message: string, type: 'info' | 'order_alert' = 'info', orderData?: any) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type, orderData }]);
    
    if (type === 'info') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    }
  };

  // Data fetchers (filtered dynamically by active session role)
  const fetchOrders = async () => {
    if (!user) return;
    try {
      setOrdersLoading(true);
      let query = supabase.from('orders').select('*');
      
      if (user.role === 'admin') {
        query = query.eq('restaurant_id', user.restaurantId);
      }


      const { data, error } = await query.order('createdAt', { ascending: false });
      if (error) throw error;
      
      setOrders(data || []);
      setDbConnected(true);
    } catch (err: any) {
      console.error('Error fetching orders:', err.message);
      showToast('Database Error', 'Could not sync orders: ' + err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchFoodItems = async () => {
    if (!user) return;
    try {
      setFoodLoading(true);
      let query = supabase.from('food_items').select('*');
      
      // Enforce data boundaries - Restaurant partners only fetch THEIR food items
      if (user.role === 'admin') {
        query = query.eq('restaurant', user.restaurantId);
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      setFoodItems(data || []);
    } catch (err: any) {
      console.error('Error fetching food items:', err.message);
    } finally {
      setFoodLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (!user) return;
    try {
      setCustomersLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err.message);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchRestaurantProfile = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('_id', user.restaurantId)
        .single();

      if (error) throw error;
      setRestaurantProfile(data || null);
    } catch (err: any) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshAllData = async () => {
    if (!user) return;
    if (user.role === 'superadmin') {
      await Promise.all([
        fetchOrders(),
        fetchFoodItems(),
        fetchCustomers()
      ]);
    } else {
      await Promise.all([
        fetchOrders(),
        fetchFoodItems(),
        fetchCustomers(),
        fetchRestaurantProfile()
      ]);
    }
  };

  // Re-fetch when user context changes
  useEffect(() => {
    if (user) {
      setActiveTab('dashboard');
      refreshAllData();
    } else {
      setOrders([]);
      setFoodItems([]);
      setCustomers([]);
      setRestaurantProfile(null);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const filter = user.role === 'admin' ? `restaurant_id=eq.${user.restaurantId}` : undefined;
    const ordersChannel = supabase
      .channel('orders-portal-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', ...(filter ? { filter } : {}) },
        (payload: any) => {
          console.log('Real-time order payload:', payload);
          fetchOrders();
          
          if (payload.eventType === 'INSERT') {
            playNotificationSound();
            showToast(
              'New Order Received!',
              `Order #${payload.new._id.substring(0, 8)} needs confirmation.`,
              user.role === 'admin' ? 'order_alert' : 'info',
              payload.new
            );
          } else if (payload.eventType === 'UPDATE') {
            showToast(
              'Order Updated',
              `Order #${payload.new._id.substring(0, 8)} status advanced to ${(payload.new.status || payload.new.orderStatus || '').replace(/_/g, ' ')}.`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [user]);

  // Live order operations (Accept/Reject via RPCs)
  const acceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.rpc('accept_order', { p_order_id: orderId });
      if (error) throw error;
      
      setToasts(prev => prev.filter(t => t.orderData?._id !== orderId));
      showToast('Order Accepted', `Order #${orderId.substring(0, 8)} sent to kitchen.`);
      fetchOrders();
    } catch (err: any) {
      alert('Error accepting order: ' + err.message);
    }
  };

  const rejectOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to reject this order?')) return;
    try {
      const { error } = await supabase.rpc('super_admin_cancel_order', { p_order_id: orderId });
      if (error) throw error;
      
      setToasts(prev => prev.filter(t => t.orderData?._id !== orderId));
      showToast('Order Rejected', `Order #${orderId.substring(0, 8)} cancelled.`);
      fetchOrders();
    } catch (err: any) {
      alert('Error rejecting order: ' + err.message);
    }
  };

  const handleViewOrderFromFeed = () => {
    setActiveTab('orders');
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
  };

  // --- RENDER ROUTING SCENARIOS ---

  // Scene 1: Unauthorized -> show login page
  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  // Scene 2: Platform Superadmin Panel
  if (user.role === 'superadmin') {
    return (
      <>
        <SuperadminDashboard 
          orders={orders}
          foodItems={foodItems}
          customers={customers}
          onLogout={handleLogout}
          onRefresh={refreshAllData}
          theme={theme}
          onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        />
        
        {/* Alerts toast */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 2000 }}>
          {toasts.map(toast => (
            <div key={toast.id} className="toast-notification">
              <div className="logo-icon" style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Bell size={14} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{toast.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{toast.message}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Scene 3: Restaurant Admin Panel (dropdown removed, locked context)
  const currentRestDetails = popularRestaurants.find(r => r.id === user.restaurantId) || { name: 'Restaurant Partner' };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="logo-container" style={{ marginBottom: '24px' }}>
          <div className="logo-icon">
            <UtensilsCrossed size={20} color="#ffffff" />
          </div>
          <div>
            <span className="logo-text">VegDash</span>
            <span className="logo-badge" style={{ marginLeft: '6px' }}>Partner</span>
          </div>
        </div>

        {/* Display Active locked restaurant partner */}
        <div style={{ marginBottom: '28px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--panel-border)', borderRadius: '10px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Outlet Context
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentRestDetails.name}
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <div 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBag size={18} />
                Live Order Queue
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                <UtensilsCrossed size={18} />
                My Menu CRUD
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                <Users size={18} />
                My Customers
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} />
                Restaurant Profile
              </div>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer Status Indicators */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <Wifi size={14} style={{ color: dbConnected ? 'var(--primary)' : 'var(--danger)' }} />
            <span>Server Sync: Active</span>
          </div>

          <button 
            className="theme-toggle-btn"
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button 
            className="btn-secondary" 
            style={{ marginTop: '8px', width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }} 
            onClick={handleLogout}
          >
            <LogOut size={12} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main viewport */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView 
            orders={orders}
            isLoading={ordersLoading}
            currentRestaurantId={user.restaurantId || ''}
            onNavigateToTab={setActiveTab}
            onViewOrder={handleViewOrderFromFeed}
          />
        )}
        
        {activeTab === 'orders' && (
          <LiveOrdersView 
            orders={orders}
            foodItems={foodItems}
            customers={customers}
            isLoading={ordersLoading}
            onRefresh={fetchOrders}
          />
        )}
        
        {activeTab === 'menu' && (
          <MenuView 
            foodItems={foodItems}
            isLoading={foodLoading}
            currentRestaurantId={user.restaurantId || ''}
            onRefresh={fetchFoodItems}
          />
        )}
        
        {activeTab === 'customers' && (
          <CustomersView 
            customers={customers}
            orders={orders}
            isLoading={customersLoading}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView 
            profile={restaurantProfile}
            isLoading={profileLoading}
            onRefresh={fetchRestaurantProfile}
          />
        )}
      </main>

      {/* Toast and Live Order Notifications */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 2000 }}>
        {toasts.map(toast => {
          if (toast.type === 'order_alert') {
            return (
              <div 
                key={toast.id} 
                className="toast-notification" 
                style={{ 
                  flexDirection: 'column', 
                  alignItems: 'stretch',
                  minWidth: '300px', 
                  borderLeft: '4px solid var(--warning)',
                  padding: '16px 20px',
                  gap: '12px' 
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="logo-icon" style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--warning-glow)', color: 'var(--warning)', flexShrink: 0 }}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{toast.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Order Amount: <strong>₹{toast.orderData?.totalAmount}</strong> • {toast.orderData?.items?.length} items
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px', justifyContent: 'center', background: 'var(--primary)', boxShadow: 'none' }}
                    onClick={() => acceptOrder(toast.orderData?._id)}
                  >
                    <Check size={12} /> Accept
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px', justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                    onClick={() => rejectOrder(toast.orderData?._id)}
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={toast.id} className="toast-notification">
              <div className="logo-icon" style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Bell size={14} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{toast.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{toast.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
