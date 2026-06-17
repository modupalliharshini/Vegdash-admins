import React from 'react';
import { Users, Calendar } from 'lucide-react';

interface CustomersViewProps {
  customers: any[];
  orders: any[];
  isLoading: boolean;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  isLoading,
}) => {
  // Filter customers who have placed at least 1 order at this restaurant
  const myCustomers = customers.filter(c => 
    orders.some(o => o.customer === c._id)
  );

  // Count orders per customer (at this restaurant)
  const getCustomerOrderCount = (customerId: string) => {
    return orders.filter(o => o.customer === customerId).length;
  };

  // Sum total spend per customer (at this restaurant)
  const getCustomerTotalSpend = (customerId: string) => {
    return orders
      .filter(o => o.customer === customerId && o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Customers</h2>
          <p className="page-subtitle">Customers who have ordered from your restaurant</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div className="rotate-loader" style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(16, 185, 129, 0.1)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : myCustomers.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>No customers registered</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any customer orders recorded yet.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Total Orders (With You)</th>
                  <th>Total Spend (With You)</th>
                  <th>First Order Date</th>
                </tr>
              </thead>
              <tbody>
                {myCustomers.map((c) => {
                  const orderCount = getCustomerOrderCount(c._id);
                  const totalSpend = getCustomerTotalSpend(c._id);
                  
                  // Find first order date
                  const customerOrders = orders.filter(o => o.customer === c._id);
                  const firstOrderDate = customerOrders.length > 0
                    ? new Date(Math.min(...customerOrders.map(o => new Date(o.createdAt).getTime())))
                    : new Date(c.createdAt);

                  const dateString = firstOrderDate.toLocaleDateString([], { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });

                  return (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '14px'
                          }}>
                            {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            {/* Privacy: Customer contact details (email/phone) are strictly hidden */}
                            <div>{c.name || 'Anonymous User'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Partner Reference ID</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        ₹{totalSpend.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} />
                          {dateString}
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
    </div>
  );
};
