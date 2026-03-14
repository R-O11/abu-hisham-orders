import React, { useState, useEffect, useCallback } from 'react';
import styles from './AdminDashboard.module.css';
import { 
  Lock, RefreshCw, LogOut, Settings, ClipboardList, Utensils, 
  Calendar, User, Phone, Car, Store, MapPin, 
  CheckCircle2, XCircle, Trash2, Edit, Plus, PackageOpen 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const STATUS_LABELS = {
  new: 'חדש',
  completed: 'הושלם',
  cancelled: 'בוטל',
};

const STATUS_STYLES = {
  new: 'statusNew',
  completed: 'statusCompleted',
  cancelled: 'statusCancelled',
};

// ========================================
// LOGIN SCREEN
// ========================================
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('נא להזין שם משתמש וסיסמה');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        sessionStorage.setItem('admin_logged_in', 'true');
        onLogin();
      } else {
        const data = await res.json();
        setError(data.error || 'ההתחברות נכשלה');
      }
    } catch {
      setError('אירעה שגיאה בחיבור');
    }
    setLoading(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginIcon}><Lock size={48} /></div>
          <h1 className={styles.loginTitle}>לוח בקרה</h1>
          <p className={styles.loginSubtitle}>מטבח אבו הישאם</p>
        </div>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.loginField}>
            <label className={styles.loginLabel}>שם משתמש</label>
            <input
              className={styles.loginInput}
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="admin-username"
              autoFocus
            />
          </div>
          <div className={styles.loginField}>
            <label className={styles.loginLabel}>סיסמה</label>
            <input
              className={styles.loginInput}
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="admin-password"
            />
          </div>
          {error && <div className={styles.loginError}>{error}</div>}
          <button className={styles.loginBtn} type="submit" disabled={loading} id="admin-login-btn">
            {loading ? 'מתחבר...' : 'התחברות'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ========================================
// ORDER DETAIL MODAL
// ========================================
function OrderDetailModal({ order, onClose, onStatusChange }) {
  if (!order) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span className={styles.modalTitleIcon}><ClipboardList size={22} /></span> פרטי הזמנה #{order.id}
          </h2>
          <button className={styles.modalClose} onClick={onClose}><XCircle size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          {/* Status Badge */}
          <div className={styles.detailStatusRow}>
            <span className={styles.detailLabel}>סטטוס נוכחי</span>
            <span className={`${styles.statusBadge} ${styles[STATUS_STYLES[order.status]]}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          {/* Info Grid */}
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
               <span className={styles.detailIcon}><Calendar size={20} /></span>
              <div>
                <span className={styles.detailLabel}>תאריך ושעה</span>
                <span className={styles.detailValue}>{formatDate(order.created_at)}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}><User size={20} /></span>
              <div>
                <span className={styles.detailLabel}>שם לקוח</span>
                <span className={styles.detailValue}>{order.customer_name}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}><Phone size={20} /></span>
              <div>
                <span className={styles.detailLabel}>מספר טלפון</span>
                <span className={styles.detailValue} dir="ltr">{order.customer_phone}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>{order.order_type === 'delivery' ? <Car size={20} /> : <Store size={20} />}</span>
              <div>
                <span className={styles.detailLabel}>סוג הזמנה</span>
                <span className={styles.detailValue}>
                  {order.order_type === 'delivery' ? 'משלוח' : 'איסוף מהמטבח'}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>פריטים שהוזמנו</h3>
            <div className={styles.detailItems}>
              {order.items && order.items.map((item, idx) => (
                <div className={styles.detailItemRow} key={idx}>
                  <div className={styles.detailItemName}>
                    <span className={styles.detailItemQty}>{item.quantity}×</span>
                    {item.dish_name}
                  </div>
                  <span className={styles.detailItemPrice}>
                    {(item.price * item.quantity).toFixed(2)} ₪
                  </span>
                </div>
              ))}
              <div className={styles.detailTotalRow}>
                <span>סך הכל</span>
                <span>{parseFloat(order.total).toFixed(2)} ₪</span>
              </div>
            </div>
          </div>

          {/* Address */}
          {order.order_type === 'delivery' && order.address && (
            <div className={styles.detailAddress}>
              <span className={styles.detailIcon}><MapPin size={20} /></span>
              <div>
                <span className={styles.detailLabel}>כתובת למשלוח</span>
                <span className={styles.detailValue}>{order.address}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className={styles.detailNotes}>
              <span className={styles.detailLabel}>📝 הערות לקוח</span>
              <p>{order.notes}</p>
            </div>
          )}

          {/* Status Update */}
          <div className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>עדכון סטטוס</h3>
            <div className={styles.statusActions}>
              {['new', 'completed', 'cancelled'].map(s => (
                <button
                  key={s}
                  className={`${styles.statusBtn} ${order.status === s ? styles.statusBtnActive : ''}`}
                  onClick={() => onStatusChange(order.id, s)}
                  disabled={order.status === 'completed'}
                  style={order.status === 'completed' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// EDIT DISH MODAL
// ========================================
function EditDishModal({ dish, onClose, onSave }) {
  const [form, setForm] = useState({
    name: dish.name || '',
    description: dish.description || '',
    price: dish.price || '',
    available: dish.available ? '1' : '0',
    sort_order: dish.sort_order || '0',
  });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('available', form.available);
      formData.append('sort_order', form.sort_order);
      if (image) formData.append('image', image);

      await fetch(`${API_URL}/api/dishes/${dish.id}`, {
        method: 'PUT',
        body: formData,
      });
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving dish:', err);
    }
    setSaving(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span className={styles.modalTitleIcon}><Edit size={22} /></span> עריכת מנה
          </h2>
          <button className={styles.modalClose} onClick={onClose}><XCircle size={20} /></button>
        </div>
        <div className={styles.modalBody}>
          <form onSubmit={handleSave}>
            <div className={styles.editRow}>
              <div className={styles.editGroup}>
                <label className={styles.formLabel}>שם המנה *</label>
                <input
                  className={styles.formInput}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.editGroup}>
                <label className={styles.formLabel}>מחיר (₪) *</label>
                <input
                  className={styles.formInput}
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className={styles.editGroup}>
              <label className={styles.formLabel}>תיאור</label>
              <textarea
                className={`${styles.formInput} ${styles.formTextarea}`}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className={styles.editRow}>
              <div className={styles.editGroup}>
                <label className={styles.formLabel}>עדכון תמונה</label>
                <input
                  className={styles.formInput}
                  type="file"
                  accept="image/*"
                  onChange={e => setImage(e.target.files[0])}
                />
              </div>
              <div className={styles.editGroup}>
                <label className={styles.formLabel}>סדר תצוגה</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.editGroup}>
              <label className={styles.formLabel}>סטטוס</label>
              <div className={styles.availToggle}>
                <button
                  type="button"
                  className={`${styles.availBtn} ${form.available === '1' ? styles.availActive : ''}`}
                  onClick={() => setForm({ ...form, available: '1' })}
                >
                  <CheckCircle2 size={16} /> זמין
                </button>
                <button
                  type="button"
                  className={`${styles.availBtn} ${form.available === '0' ? styles.unavailActive : ''}`}
                  onClick={() => setForm({ ...form, available: '0' })}
                >
                  <XCircle size={16} /> לא זמין
                </button>
              </div>
            </div>
            <div className={styles.editActions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>ביטול</button>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? 'שומר...' : '✓ שמירת שינויים'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ========================================
// MAIN ADMIN DASHBOARD
// ========================================
export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('admin_logged_in') === 'true');
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [filter, setFilter] = useState('new');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingDish, setEditingDish] = useState(null);

  // New dish form
  const [newDish, setNewDish] = useState({ name: '', description: '', price: '', sort_order: '0' });
  const [newDishImage, setNewDishImage] = useState(null);
  const [addingDish, setAddingDish] = useState(false);

  useEffect(() => {
    // We remove the dark theme setting to use the new light theme
    document.documentElement.removeAttribute('data-theme');
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchDishes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/dishes/all`);
      const data = await res.json();
      setDishes(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrders();
    fetchDishes();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchOrders, fetchDishes]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
      // Update selected order if we're viewing it
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (err) { console.error(err); }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!newDish.name || !newDish.price) return;
    setAddingDish(true);
    try {
      const formData = new FormData();
      formData.append('name', newDish.name);
      formData.append('description', newDish.description);
      formData.append('price', newDish.price);
      formData.append('available', '1');
      formData.append('sort_order', newDish.sort_order);
      if (newDishImage) formData.append('image', newDishImage);
      await fetch(`${API_URL}/api/dishes`, { method: 'POST', body: formData });
      setNewDish({ name: '', description: '', price: '', sort_order: '0' });
      setNewDishImage(null);
      fetchDishes();
    } catch (err) { console.error(err); }
    setAddingDish(false);
  };

  const deleteDish = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מנה זו?')) return;
    try {
      await fetch(`${API_URL}/api/dishes/${id}`, { method: 'DELETE' });
      fetchDishes();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
  };

  const filteredOrders = orders.filter(o => o.status === filter);
  const newOrdersCount = orders.filter(o => o.status === 'new').length;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ======= LOGIN SCREEN =======
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className={styles.dashboard} dir="rtl">
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          
          <span>לוח בקרה </span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={() => { fetchOrders(); fetchDishes(); }}>
            <RefreshCw size={16} /> רענן
          </button>
          <a href="/" className={styles.linkBtn}>← דף הזמנות</a>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} /> יציאה
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ClipboardList size={18} />
          <span>הזמנות</span>
          {newOrdersCount > 0 && <span className={styles.tabBadge}>{newOrdersCount}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'dishes' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('dishes')}
        >
          <Utensils size={18} />
          <span>ניהול מנות</span>
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>

        {/* ====== ORDERS TAB ====== */}
        {activeTab === 'orders' && (
          <>
            <div className={styles.orderFilters}>
              {['new', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {`${STATUS_LABELS[f]}${f === 'new' && newOrdersCount > 0 ? ` (${newOrdersCount})` : ''}`}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><PackageOpen size={48} /></span>
                <p>אין הזמנות בסטטוס "{STATUS_LABELS[filter]}"</p>
              </div>
            )}

            {filteredOrders.map(order => (
              <div
                className={styles.orderCard}
                key={order.id}
                onClick={() => setSelectedOrder(order)}
              >
                <div className={styles.orderHeader}>
                  <div className={styles.orderIdGroup}>
                    <span className={styles.orderId}>הזמנה #{order.id}</span>
                    <span className={styles.orderTime}>{formatDate(order.created_at)}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[STATUS_STYLES[order.status]]}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                <div className={styles.orderCardBody}>
                  <div className={styles.orderCardInfo}>
                    <span className={styles.infoItem}>
                      <span className={styles.infoItemIcon}><User size={16} /></span> {order.customer_name}
                    </span>
                    <span className={styles.infoItem}>
                      <span className={styles.infoItemIcon}><Phone size={16} /></span> {order.customer_phone}
                    </span>
                    <span className={styles.infoItem}>
                      <span className={styles.infoItemIcon}>
                        {order.order_type === 'delivery' ? <Car size={16} /> : <Store size={16} />}
                      </span>
                      {order.order_type === 'delivery' ? 'משלוח' : 'איסוף'}
                    </span>
                  </div>
                  <div className={styles.orderCardTotal}>
                    <span className={styles.totalAmount}>{parseFloat(order.total).toFixed(2)} ₪</span>
                    <span className={styles.itemCount}>
                      {order.items ? order.items.reduce((sum, i) => sum + i.quantity, 0) : 0} פריטים
                    </span>
                  </div>
                </div>

                <div className={styles.orderCardFooter}>
                  <div className={styles.quickStatus}>
                    {['new', 'completed', 'cancelled'].map(s => (
                      <button
                        key={s}
                        className={`${styles.quickStatusBtn} ${order.status === s ? styles.quickStatusActive : ''}`}
                        onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, s); }}
                        title={STATUS_LABELS[s]}
                        disabled={order.status === 'completed'}
                        style={order.status === 'completed' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                  <button
                    className={styles.viewDetailBtn}
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                  >
                    הצג פרטים ←
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ====== DISHES TAB ====== */}
        {activeTab === 'dishes' && (
          <>
            {/* Add Dish Form */}
            <div className={styles.addDishSection}>
              <h3 className={styles.addDishTitle}>
                <span className={styles.addDishIcon}><Plus size={20} /></span>
                <span>הוספת מנה חדשה</span>
              </h3>
              <form onSubmit={handleAddDish}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>שם המנה *</label>
                    <input
                      className={styles.formInput}
                      placeholder="לדוגמה: מנדי בשר"
                      value={newDish.name}
                      onChange={e => setNewDish({ ...newDish, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>מחיר (₪) *</label>
                    <input
                      className={styles.formInput}
                      type="number"
                      step="0.01"
                      placeholder="45.00"
                      value={newDish.price}
                      onChange={e => setNewDish({ ...newDish, price: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel}>תיאור</label>
                    <textarea
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      placeholder="תיאור קצר של המנה..."
                      value={newDish.description}
                      onChange={e => setNewDish({ ...newDish, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>תמונת מנה</label>
                    <input
                      className={styles.formInput}
                      type="file"
                      accept="image/*"
                      onChange={e => setNewDishImage(e.target.files[0])}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>סדר תצוגה</label>
                    <input
                      className={styles.formInput}
                      type="number"
                      placeholder="0"
                      value={newDish.sort_order}
                      onChange={e => setNewDish({ ...newDish, sort_order: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className={styles.addDishBtn}
                  disabled={addingDish || !newDish.name || !newDish.price}
                >
                  {addingDish ? 'מוסיף...' : '✓ הוספת מנה'}
                </button>
              </form>
            </div>

            {/* Dish List */}
            <div className={styles.dishList}>
              {dishes.map(dish => (
                <div className={styles.dishRow} key={dish.id}>
                  <img
                    src={dish.image_url || '/placeholder-dish.jpg'}
                    alt={dish.name}
                    className={styles.dishImage}
                  />
                  <div className={styles.dishInfo}>
                    <div className={styles.dishName}>{dish.name}</div>
                    <div className={styles.dishPrice}>{parseFloat(dish.price).toFixed(2)} ₪</div>
                    {dish.description && <div className={styles.dishDesc}>{dish.description}</div>}
                  </div>
                  <div className={styles.dishStatus}>
                    <span className={`${styles.dishAvailBadge} ${dish.available ? styles.dishAvail : styles.dishUnavail}`}>
                      {dish.available ? <CheckCircle2 size={14} /> : <XCircle size={14} />} 
                      {dish.available ? 'זמין' : 'לא זמין'}
                    </span>
                  </div>
                  <div className={styles.dishActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => setEditingDish(dish)}
                      title="עריכה"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteDish(dish.id)}
                      title="מחיקה"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
        />
      )}

      {/* Edit Dish Modal */}
      {editingDish && (
        <EditDishModal
          dish={editingDish}
          onClose={() => setEditingDish(null)}
          onSave={fetchDishes}
        />
      )}
    </div>
  );
}
