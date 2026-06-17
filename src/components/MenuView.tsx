import React, { useState } from 'react';
import { UtensilsCrossed, Edit2, Trash2, RefreshCw, X, Plus, Filter } from 'lucide-react';
import { getRestaurantDetails } from '../mockData';
import supabase from '../supabaseClient';

interface MenuViewProps {
  foodItems: any[];
  isLoading: boolean;
  currentRestaurantId: string;
  onRefresh: () => Promise<void>;
}

export const MenuView: React.FC<MenuViewProps> = ({
  foodItems,
  isLoading,
  currentRestaurantId,
  onRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');

  const categories = ['All', ...new Set(foodItems.map(item => item.category))];

  // Filter food items (already database filtered by currentRestaurantId in App.tsx)
  const filteredItems = foodItems.filter(item => {
    return selectedCategory === 'All' || item.category === selectedCategory;
  });

  const toggleAvailability = async (itemId: string, currentAvailable: boolean) => {
    setUpdatingId(itemId);
    try {
      const { error } = await supabase
        .from('food_items')
        .update({ isAvailable: !currentAvailable })
        .eq('_id', itemId);

      if (error) throw error;
      await onRefresh();
    } catch (err: any) {
      console.error('Error toggling availability:', err.message);
      alert('Error updating availability: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenAddModal = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Main Course');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedItem(item);
    setName(item.name || '');
    setDescription(item.description || '');
    setPrice(String(item.price || ''));
    setCategory(item.category || '');
    setImage(item.image || '');
    setIsEditModalOpen(true);
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!name || isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid name and price');
      return;
    }

    setUpdatingId('adding');
    try {
      // Generate a structured unique ID to match restaurant naming format
      const uniqueId = `food_${currentRestaurantId}_${Date.now().toString().slice(-5)}`;
      
      const { error } = await supabase
        .from('food_items')
        .insert({
          _id: uniqueId,
          name,
          description,
          price: priceNum,
          category,
          image,
          restaurant: currentRestaurantId,
          isAvailable: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

      if (error) throw error;
      
      setIsAddModalOpen(false);
      await onRefresh();
      alert('Dish added successfully!');
    } catch (err: any) {
      console.error('Error adding dish:', err.message);
      alert('Error adding dish: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const priceNum = parseFloat(price);
    if (!name || isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid name and price');
      return;
    }

    setUpdatingId(selectedItem._id);
    try {
      const { error } = await supabase
        .from('food_items')
        .update({
          name,
          description,
          price: priceNum,
          category,
          image,
          updatedAt: new Date().toISOString()
        })
        .eq('_id', selectedItem._id);

      if (error) throw error;
      
      setIsEditModalOpen(false);
      setSelectedItem(null);
      await onRefresh();
      alert('Dish updated successfully!');
    } catch (err: any) {
      console.error('Error editing dish:', err.message);
      alert('Error editing dish: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteDish = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${itemName}" from your menu?`)) return;

    setUpdatingId(itemId);
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('_id', itemId);

      if (error) throw error;
      
      await onRefresh();
      alert('Dish deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting dish:', err.message);
      alert('Error deleting dish: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const restDetails = getRestaurantDetails(currentRestaurantId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Menu Editor</h2>
          <p className="page-subtitle">Configure dishes, pricing, and availability for {restDetails.name}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} /> Add New Dish
          </button>
          <button className="btn-secondary" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'rotate-loader' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>Categories:</span>
          <div className="tabs-container" style={{ margin: 0, paddingBottom: 0 }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {cat}
              </button>
            ))}
          </div>
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
      ) : filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <UtensilsCrossed size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>No items found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Click "Add New Dish" to insert items into your menu.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map(item => {
            return (
              <div key={item._id} className="glass-card food-card" style={{ padding: 0 }}>
                
                {/* Image & Badge */}
                <div className="food-img-container">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150'} 
                    alt={item.name} 
                    className="food-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150';
                    }}
                  />
                  <span className="food-badge">{item.category}</span>
                </div>

                {/* Details */}
                <div className="food-details">
                  <div className="food-title-row">
                    <div className="food-name">{item.name}</div>
                    <div className="food-price">₹{item.price}</div>
                  </div>

                  <div className="food-desc" style={{ minHeight: '36px' }}>{item.description}</div>
                  
                  {/* Availability controls */}
                  <div className="food-footer" style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: item.isAvailable ? '#ffffff' : 'var(--text-muted)' }}>
                      {item.isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={item.isAvailable} 
                        onChange={() => toggleAvailability(item._id, item.isAvailable)}
                        disabled={updatingId === item._id}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '12px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ flex: 1, fontSize: '12px', padding: '6px', justifyContent: 'center' }}
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ 
                        flex: 1, 
                        fontSize: '12px', 
                        padding: '6px', 
                        justifyContent: 'center',
                        color: 'var(--danger)',
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                        background: 'rgba(239, 68, 68, 0.05)'
                      }}
                      onClick={() => handleDeleteDish(item._id, item.name)}
                      disabled={updatingId === item._id}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Dish Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', color: '#ffffff' }}>Add New Dish to Menu</h3>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDish} className="modal-body">
              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                  placeholder="e.g. Special Ghee Masala Dosa"
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  required
                  placeholder="e.g. 150"
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="form-input"
                  style={{ background: '#0f172a' }}
                >
                  <option value="South Indian">South Indian</option>
                  <option value="North Indian">North Indian</option>
                  <option value="Jain Specials">Jain Specials</option>
                  <option value="Satvik Meals">Satvik Meals</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Starters">Starters</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="e.g. Crispy crepe served with hot sambar and fresh coconut chutney"
                  className="form-input"
                  style={{ minHeight: '60px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input 
                  type="text" 
                  value={image} 
                  onChange={e => setImage(e.target.value)} 
                  className="form-input" 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={updatingId === 'adding'}>
                  {updatingId === 'adding' ? 'Adding...' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', color: '#ffffff' }}>Edit Menu Dish</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditDish} className="modal-body">
              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  required
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="form-input"
                  style={{ background: '#0f172a' }}
                >
                  <option value="South Indian">South Indian</option>
                  <option value="North Indian">North Indian</option>
                  <option value="Jain Specials">Jain Specials</option>
                  <option value="Satvik Meals">Satvik Meals</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Starters">Starters</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="form-input"
                  style={{ minHeight: '60px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input 
                  type="text" 
                  value={image} 
                  onChange={e => setImage(e.target.value)} 
                  className="form-input" 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={updatingId === selectedItem?._id}>
                  {updatingId === selectedItem?._id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
