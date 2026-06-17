import React from 'react';
import { Star, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { mockReviews } from '../mockData';

interface DashboardViewProps {
  orders: any[];
  isLoading: boolean;
  currentRestaurantId: string;
  onNavigateToTab: (tab: string) => void;
  onViewOrder: (order: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  isLoading,
  currentRestaurantId,
  onNavigateToTab,
  onViewOrder,
}) => {
  // Date helpers
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const completedOrders = orders.filter(
    o => o.orderStatus !== 'cancelled' && (o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
  );

  // Revenue calculations
  const todayRevenue = completedOrders
    .filter(o => new Date(o.createdAt) >= startOfToday)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const weekRevenue = completedOrders
    .filter(o => new Date(o.createdAt) >= startOfWeek)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const monthRevenue = completedOrders
    .filter(o => new Date(o.createdAt) >= startOfMonth)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeOrdersCount = orders.filter(
    o => o.orderStatus === 'placed' || o.orderStatus === 'preparing' || o.orderStatus === 'out_for_delivery'
  ).length;

  // Filter reviews for current restaurant
  const reviews = mockReviews.filter(r => r.restaurantId === currentRestaurantId);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '4.5';

  // Last 7 days sales breakdown for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    return {
      label: d.toLocaleDateString([], { weekday: 'short' }),
      dateStr: d.toDateString(),
      amount: 0
    };
  }).reverse();

  completedOrders.forEach(o => {
    const oDateStr = new Date(o.createdAt).toDateString();
    const day = last7Days.find(d => d.dateStr === oDateStr);
    if (day) {
      day.amount += o.totalAmount || 0;
    }
  });

  const maxChartVal = Math.max(...last7Days.map(d => d.amount), 500);

  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="rotate-loader" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(16, 185, 129, 0.1)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards (Today / Week / Month revenue) */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-card">
          <div className="stat-header">
            <span className="stat-title">Today's Revenue</span>
            <div className="stat-icon-wrapper primary">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">₹{todayRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-trend up">
            <TrendingUp size={14} />
            <span>Orders placed today</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="stat-header">
            <span className="stat-title">Weekly Revenue</span>
            <div className="stat-icon-wrapper info">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">₹{weekRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-trend up">
            <TrendingUp size={14} />
            <span>Last 7 days sales</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="stat-header">
            <span className="stat-title">Monthly Revenue</span>
            <div className="stat-icon-wrapper primary">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">₹{monthRevenue.toLocaleString('en-IN')}</div>
          <div className="stat-trend up">
            <TrendingUp size={14} />
            <span>Last 30 days sales</span>
          </div>
        </div>

        <div className="glass-card" onClick={() => onNavigateToTab('orders')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-title">Live Queue</span>
            <div className="stat-icon-wrapper warning">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value pulse-red" style={{ display: 'inline-block' }}>{activeOrdersCount}</div>
          <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>
            <span>Orders in kitchen/delivery</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="stat-header">
            <span className="stat-title">Rating / Reviews</span>
            <div className="stat-icon-wrapper warning">
              <Star size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {averageRating}
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400 }}>({reviews.length} reviews)</span>
          </div>
          <div className="stat-trend" style={{ color: 'var(--primary)' }}>
            <span>Positive feedback</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Activity Feed */}
      <div className="dashboard-layout">
        {/* Sales Trend Chart */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <h3 style={{ fontSize: '18px', color: '#ffffff' }}>7-Day Sales Trend</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Daily Earnings</span>
          </div>

          <div className="bar-chart-container">
            {last7Days.map((d, idx) => {
              const percentage = (d.amount / maxChartVal) * 100;
              return (
                <div key={idx} className="bar-wrapper">
                  <div 
                    className="bar-column" 
                    style={{ height: `${Math.max(percentage, 5)}%` }}
                  >
                    <div className="bar-tooltip">₹{d.amount.toLocaleString()}</div>
                  </div>
                  <span className="bar-label">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Order Activity Feed */}
        <div className="glass-card activity-feed-card">
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px' }}>Live Order Queue Ticker</h3>
          
          <div className="activity-list">
            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                No active orders recorded yet.
              </div>
            ) : (
              recentOrders.map((o) => {
                const timeString = new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={o._id} className="activity-item">
                    <div className={`activity-dot ${o.orderStatus}`} />
                    <div className="activity-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="activity-title" style={{ fontWeight: 600 }}>
                          Order #{o._id.substring(0, 8)}
                        </span>
                        <button 
                          onClick={() => onViewOrder(o)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          View
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          ₹{o.totalAmount} • {o.items.length} items
                        </span>
                        <span className="activity-time">{timeString}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {/* Customer Reviews Section */}
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px' }}>Customer Reviews & Ratings</h3>
        
        {reviews.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No reviews received yet for this restaurant.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {reviews.map(rev => (
              <div key={rev.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={rev.avatar} alt={rev.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{rev.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
                    <Star size={12} fill="var(--warning)" />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{rev.rating}</span>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>"{rev.comment}"</p>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>{rev.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
