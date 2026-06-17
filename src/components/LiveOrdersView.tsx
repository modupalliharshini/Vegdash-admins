import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, X, Shield, MapPin, Truck, RefreshCw, User, Calendar, CheckSquare } from 'lucide-react';

import supabase from '../supabaseClient';

const LeafletMap: React.FC<{
  restaurantLat: number;
  restaurantLng: number;
  customerLat: number;
  customerLng: number;
  riderLat: number | null;
  riderLng: number | null;
  stage: 'to_store' | 'to_customer' | null;
  orderStatus: string;
}> = ({ restaurantLat, restaurantLng, customerLat, customerLng, riderLat, riderLng, stage, orderStatus }) => {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const leafletMapInstance = React.useRef<any>(null);
  const riderMarkerRef = React.useRef<any>(null);
  const pathPolylineRef = React.useRef<any>(null);
  const [mapLibLoaded, setMapLibLoaded] = React.useState(typeof window !== 'undefined' && !!(window as any).L);

  React.useEffect(() => {
    if (mapLibLoaded) return;
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).L) {
        setMapLibLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [mapLibLoaded]);

  React.useEffect(() => {
    if (!mapLibLoaded) return;
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (!leafletMapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([restaurantLat, restaurantLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      leafletMapInstance.current = map;

      // Add Restaurant marker
      const restIcon = L.divIcon({
        className: 'custom-rest-icon',
        html: `<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 10px; font-weight: bold;">R</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([restaurantLat, restaurantLng], { icon: restIcon }).addTo(map);

      // Add Customer marker
      const custIcon = L.divIcon({
        className: 'custom-cust-icon',
        html: `<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 10px; font-weight: bold;">C</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([customerLat, customerLng], { icon: custIcon }).addTo(map);

      // Add Rider marker if available
      if (riderLat !== null && riderLng !== null) {
        const riderIcon = L.divIcon({
          className: 'custom-rider-icon',
          html: `<div style="background-color: #10B981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><span style="color: white; font-size: 12px; display: block; text-align: center; line-height: 22px;">🏍️</span></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        riderMarkerRef.current = L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map);

        const pathPoints = stage === 'to_store' 
          ? [[riderLat, riderLng], [restaurantLat, restaurantLng]]
          : [[restaurantLat, restaurantLng], [customerLat, customerLng]];

        pathPolylineRef.current = L.polyline(pathPoints, {
          color: stage === 'to_store' ? '#3B82F6' : '#10B981',
          weight: 5,
          opacity: 0.8,
          dashArray: stage === 'to_store' ? '5, 10' : undefined
        }).addTo(map);

        try {
          map.fitBounds(pathPolylineRef.current.getBounds(), { padding: [40, 40] });
        } catch (_) {}
      } else {
        // Just fit bounds restaurant and customer
        const bounds = L.latLngBounds([restaurantLat, restaurantLng], [customerLat, customerLng]);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } else {
      const map = leafletMapInstance.current;
      // Update rider marker position
      if (riderLat !== null && riderLng !== null) {
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([riderLat, riderLng]);
        } else {
          const riderIcon = L.divIcon({
            className: 'custom-rider-icon',
            html: `<div style="background-color: #10B981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><span style="color: white; font-size: 12px; display: block; text-align: center; line-height: 22px;">🏍️</span></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          riderMarkerRef.current = L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map);
        }

        // Update polyline path
        const pathPoints = stage === 'to_store'
          ? [[riderLat, riderLng], [restaurantLat, restaurantLng]]
          : [[restaurantLat, restaurantLng], [customerLat, customerLng]];

        if (pathPolylineRef.current) {
          pathPolylineRef.current.setLatLngs(pathPoints);
          pathPolylineRef.current.setStyle({
            color: stage === 'to_store' ? '#3B82F6' : '#10B981',
            dashArray: stage === 'to_store' ? '5, 10' : null
          });
        } else {
          pathPolylineRef.current = L.polyline(pathPoints, {
            color: stage === 'to_store' ? '#3B82F6' : '#10B981',
            weight: 5,
            opacity: 0.8,
            dashArray: stage === 'to_store' ? '5, 10' : undefined
          }).addTo(map);
        }
      } else {
        if (riderMarkerRef.current) {
          map.removeLayer(riderMarkerRef.current);
          riderMarkerRef.current = null;
        }
        if (pathPolylineRef.current) {
          map.removeLayer(pathPolylineRef.current);
          pathPolylineRef.current = null;
        }
      }
    }
  }, [riderLat, riderLng, stage, restaurantLat, restaurantLng, customerLat, customerLng, orderStatus, mapLibLoaded]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '12px' }} />;
};

interface LiveOrdersViewProps {
  orders: any[];
  foodItems: any[];
  customers: any[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export const LiveOrdersView: React.FC<LiveOrdersViewProps> = ({
  orders,
  foodItems,
  customers,
  isLoading,
  onRefresh,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [queueTab, setQueueTab] = useState<'pending' | 'preparing' | 'ready' | 'history'>('pending');

  const getCustomerName = (customerId: string) => {
    const cust = customers.find(c => c._id === customerId);
    return cust ? cust.name : `Customer (${customerId.substring(0, 8)}...)`;
  };



  // Split orders into queues
  const pendingOrders = orders.filter(o => o.orderStatus === 'placed');
  const preparingOrders = orders.filter(o => o.orderStatus === 'preparing');
  const readyOrders = orders.filter(o => o.orderStatus === 'ready_for_pickup' || o.orderStatus === 'out_for_delivery');
  const historyOrders = orders.filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'cancelled');

  const getActiveList = () => {
    switch (queueTab) {
      case 'pending': return pendingOrders;
      case 'preparing': return preparingOrders;
      case 'ready': return readyOrders;
      case 'history': return historyOrders;
      default: return pendingOrders;
    }
  };

  const displayedOrders = getActiveList();



  const updateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const targetOrder = orders.find(o => o._id === orderId);
      const now = new Date().toISOString();
      const statusHistoryUpdate = [
        ...targetOrder.statusHistory,
        { status: nextStatus, timestamp: now }
      ];

      const updatePayload: any = {
        orderStatus: nextStatus,
        statusHistory: statusHistoryUpdate,
        updatedAt: now
      };

      if (nextStatus === 'ready_for_pickup') {
        const randomCode = String(Math.floor(1000 + Math.random() * 9000));
        updatePayload.driver = JSON.stringify({
          name: 'Assigning partner...',
          pickupCode: randomCode
        });
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('_id', orderId);

      if (error) throw error;
      
      await onRefresh();
      
      // Update currently open modal if active
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev: any) => ({
          ...prev,
          orderStatus: nextStatus,
          statusHistory: statusHistoryUpdate,
          driver: updatePayload.driver || prev.driver
        }));
      }
    } catch (err: any) {
      console.error('Failed to update order status:', err.message);
      alert('Error updating order: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to reject/cancel this order?')) return;
    updateStatus(orderId, 'cancelled');
  };



  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Live Order Queue</h2>
          <p className="page-subtitle">Accept incoming orders and manage the kitchen queue</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'rotate-loader' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="tabs-container" style={{ marginBottom: '24px' }}>
        <button 
          className={`tab-btn ${queueTab === 'pending' ? 'active' : ''}`}
          onClick={() => setQueueTab('pending')}
        >
          Pending Orders ({pendingOrders.length})
        </button>
        <button 
          className={`tab-btn ${queueTab === 'preparing' ? 'active' : ''}`}
          onClick={() => setQueueTab('preparing')}
        >
          Preparing ({preparingOrders.length})
        </button>
        <button 
          className={`tab-btn ${queueTab === 'ready' ? 'active' : ''}`}
          onClick={() => setQueueTab('ready')}
        >
          Ready for Pickup ({readyOrders.length})
        </button>
        <button 
          className={`tab-btn ${queueTab === 'history' ? 'active' : ''}`}
          onClick={() => setQueueTab('history')}
        >
          History ({historyOrders.length})
        </button>
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
      ) : displayedOrders.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>No orders in this queue</h3>
          <p style={{ color: 'var(--text-secondary)' }}>There are no orders currently in the {queueTab} state.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer (Name Only)</th>
                  <th>Total Amount</th>
                  <th>Payment Type</th>
                  <th>Status</th>
                  <th>Placed At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((o) => {
                  const dateString = new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
                    ' ' + new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  
                  return (
                    <tr key={o._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        #{o._id.substring(0, 8)}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {/* Only show Name - user private information is strictly hidden */}
                        {getCustomerName(o.customer)}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        ₹{o.totalAmount}
                      </td>
                      <td>
                        <span className={`badge ${o.paymentStatus}`}>
                          {o.paymentMethod} • {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${o.orderStatus}`}>
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {dateString}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setSelectedOrder(o)}
                          >
                            <Eye size={12} />
                            Details
                          </button>

                          {/* Accept / Reject CTA inside Queue */}
                          {o.orderStatus === 'placed' && (
                            <>
                              <button
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--primary)', boxShadow: 'none' }}
                                onClick={() => updateStatus(o._id, 'preparing')}
                                disabled={updatingId === o._id}
                              >
                                <Check size={12} />
                                Accept
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                                onClick={() => cancelOrder(o._id)}
                                disabled={updatingId === o._id}
                              >
                                <X size={12} />
                                Reject
                              </button>
                            </>
                          )}

                          {/* Preparing status controls */}
                          {o.orderStatus === 'preparing' && (
                            <button
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--warning)', boxShadow: 'none' }}
                              onClick={() => updateStatus(o._id, 'ready_for_pickup')}
                              disabled={updatingId === o._id}
                            >
                              <CheckSquare size={12} />
                              Mark Ready (Ready for Pickup)
                            </button>
                          )}

                          {/* Ready for Pickup status controls */}
                          {o.orderStatus === 'ready_for_pickup' && (() => {
                            let itemDriver: any = null;
                            if (o.driver) {
                              try {
                                itemDriver = typeof o.driver === 'string' ? JSON.parse(o.driver) : o.driver;
                              } catch (_) {}
                            }
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                  Waiting for rider...
                                </span>
                                {itemDriver && itemDriver.pickupCode && (
                                  <span style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 'bold', marginTop: '2px' }}>
                                    Code: {itemDriver.pickupCode}
                                  </span>
                                )}
                              </div>
                            );
                          })()}


                          {/* Out for Delivery status controls */}
                          {o.orderStatus === 'out_for_delivery' && (
                            <button
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--primary)', boxShadow: 'none' }}
                              onClick={() => updateStatus(o._id, 'delivered')}
                              disabled={updatingId === o._id}
                            >
                              <Check size={12} />
                              Mark Delivered
                            </button>
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
      )}

      {/* Details Modal */}
      {selectedOrder && (() => {
        let modalDriver: any = null;
        if (selectedOrder.driver) {
          if (typeof selectedOrder.driver === 'string') {
            try {
              modalDriver = JSON.parse(selectedOrder.driver);
            } catch (_) {}
          } else {
            modalDriver = selectedOrder.driver;
          }
        }
        return (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', color: '#ffffff' }}>
                  Order Queue Details
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ID: {selectedOrder._id}
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Live Status Tracker Map Panel */}
              <div className="modal-section-title" style={{ marginTop: 0 }}>
                Live Delivery Route Tracker
              </div>
              
              <div className="tracking-map" style={{ height: '220px', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                <LeafletMap
                  restaurantLat={17.4483}
                  restaurantLng={78.3741}
                  customerLat={17.4435}
                  customerLng={78.3812}
                  riderLat={modalDriver?.location?.lat ?? null}
                  riderLng={modalDriver?.location?.lng ?? null}
                  stage={modalDriver?.location?.stage ?? null}
                  orderStatus={selectedOrder.orderStatus}
                />
                
                {/* Status HUD overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '30px',
                    padding: '6px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 1000
                  }}
                >
                  <span className={`badge ${selectedOrder.orderStatus}`} style={{ padding: '2px 6px', fontSize: '9px' }}>
                    {selectedOrder.orderStatus.replace(/_/g, ' ')}
                  </span>
                  {selectedOrder.orderStatus === 'placed' && 'Preparing start sequence'}
                  {selectedOrder.orderStatus === 'preparing' && 'Chef cooking food'}
                  {selectedOrder.orderStatus === 'ready_for_pickup' && 'Rider heading to restaurant'}
                  {selectedOrder.orderStatus === 'out_for_delivery' && 'Rider heading to customer'}
                  {selectedOrder.orderStatus === 'delivered' && 'Order safely delivered'}
                  {selectedOrder.orderStatus === 'cancelled' && 'Delivery sequence halted'}
                </div>
              </div>

              {/* General Order Specs */}
              <div className="modal-section-title">Order Specs</div>
              <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="detail-row">
                  <span className="detail-label"><User size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Customer Name</span>
                  {/* Privacy: Customer contact details (email/phone) are hidden. Only show name */}
                  <span className="detail-value">{getCustomerName(selectedOrder.customer)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Order Date</span>
                  <span className="detail-value">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Shield size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Payment Mode</span>
                  <span className="detail-value">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><MapPin size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Delivery Location</span>
                  {/* Privacy: Show street address + city only, hide zip code or specific coordinates */}
                  <span className="detail-value" style={{ maxWidth: '300px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOrder.deliveryAddress 
                      ? `${selectedOrder.deliveryAddress.street}, ${selectedOrder.deliveryAddress.city}`
                      : 'N/A'
                    }
                  </span>
                </div>
                {/* Platform delivery notice */}
                <div className="detail-row" style={{ color: 'var(--text-muted)' }}>
                  <span className="detail-label"><Truck size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Delivery Assignment</span>
                  <span className="detail-value" style={{ fontStyle: 'italic' }}>Platform Assigned Rider</span>
                </div>
                {modalDriver && modalDriver.pickupCode && (
                  <div className="detail-row" style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                    <span className="detail-label"><Shield size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Pickup Verification Code</span>
                    <span className="detail-value" style={{ fontSize: '15px', color: 'var(--warning)', letterSpacing: '1px' }}>{modalDriver.pickupCode}</span>
                  </div>
                )}
                {modalDriver && modalDriver.review && (
                  <div className="glass-card" style={{ padding: '12px', marginTop: '12px', borderLeft: '3px solid var(--primary)', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⭐ {modalDriver.review.rating}/5 Customer Rating</span>
                    </div>
                    <div style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      "{modalDriver.review.comment || 'No comment'}"
                    </div>
                  </div>
                )}

              </div>

              {/* Items List */}
              <div className="modal-section-title">Items Ordered</div>
              <div className="order-items-list">
                {selectedOrder.items && selectedOrder.items.map((item: any, index: number) => {
                  const dbFood = foodItems.find(f => f._id === item.foodItem);
                  return (
                    <div key={index} className="order-item-row">
                      <div className="order-item-info">
                        <img 
                          src={dbFood?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150"} 
                          alt={dbFood?.name || "food item"} 
                          className="order-item-img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150';
                          }}
                        />
                        <div>
                          <div className="order-item-name">{dbFood?.name || `Food ID: ${item.foodItem}`}</div>
                          <div className="order-item-qty">Qty: {item.quantity} x ₹{item.price}</div>
                        </div>
                      </div>
                      <div className="order-item-price">
                        ₹{item.quantity * item.price}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary - NO Platform commission is displayed */}
              <div className="modal-section-title">Total Cost Breakdown</div>
              <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="detail-row">
                  <span className="detail-label">Subtotal</span>
                  <span className="detail-value">₹{selectedOrder.subtotal}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Fee</span>
                  <span className="detail-value">₹{selectedOrder.deliveryFee || 25}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Discount Applied</span>
                  <span className="detail-value" style={{ color: 'var(--danger)' }}>-₹{selectedOrder.discount || 0}</span>
                </div>
                <div className="detail-row" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', marginTop: '4px' }}>
                  <span className="detail-label" style={{ fontWeight: 600, color: '#ffffff' }}>Grand Total</span>
                  <span className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>
                  Close Details
                </button>
                
                {selectedOrder.orderStatus === 'placed' && (
                  <button 
                    className="btn-primary"
                    onClick={() => updateStatus(selectedOrder._id, 'preparing')}
                  >
                    Accept & Prepare
                  </button>
                )}

                {selectedOrder.orderStatus === 'preparing' && (
                  <button 
                    className="btn-primary"
                    style={{ background: 'var(--warning)', boxShadow: 'none' }}
                    onClick={() => updateStatus(selectedOrder._id, 'ready_for_pickup')}
                  >
                    Mark Ready
                  </button>
                )}

                {selectedOrder.orderStatus === 'ready_for_pickup' && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 12px' }}>
                    Waiting for rider acceptance...
                  </span>
                )}

                {selectedOrder.orderStatus === 'out_for_delivery' && (
                  <button 
                    className="btn-primary"
                    onClick={() => updateStatus(selectedOrder._id, 'delivered')}
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};
