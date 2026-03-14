import React, { useState, useEffect, useCallback } from 'react';
import styles from './HomePage.module.css';
import Header from '../components/Header';
import DishCard from '../components/DishCard';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import OrderConfirmation from '../components/OrderConfirmation';
import { UtensilsCrossed, ShoppingBag } from 'lucide-react';

const API_BASE = '/api';

export default function HomePage() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart state
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('abuhisham_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // UI state
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  const [confirmedOrderType, setConfirmedOrderType] = useState('pickup');

  // Persist cart
  useEffect(() => {
    localStorage.setItem('abuhisham_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch dishes
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await fetch(`${API_BASE}/dishes`);
        if (!res.ok) throw new Error('فشل في تحميل القائمة');
        const data = await res.json();
        setDishes(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchDishes();
  }, []);

  // Cart helpers
  const addToCart = useCallback((dish) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.dish_id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.dish_id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        dish_id: dish.id,
        dish_name: dish.name,
        price: parseFloat(dish.price),
        quantity: 1,
        image_url: dish.image_url,
      }];
    });
  }, []);

  const updateCartQty = useCallback((dishId, newQty) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(item => item.dish_id !== dishId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.dish_id === dishId ? { ...item, quantity: newQty } : item
        )
      );
    }
  }, []);

  const removeFromCart = useCallback((dishId) => {
    setCartItems(prev => prev.filter(item => item.dish_id !== dishId));
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Submit order
  const handleSubmitOrder = async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('فشل في إرسال الطلب');
    const result = await res.json();
    setConfirmedOrderId(result.id);
    setConfirmedOrderType(orderData.order_type || 'pickup');
    setCartItems([]);
    setShowCheckout(false);
    setShowCart(false);
  };

  const handleConfirmationClose = () => {
    setConfirmedOrderId(null);
    setConfirmedOrderType('pickup');
  };

  return (
    <div className={styles.page}>
      <Header cartCount={cartCount} onCartClick={() => setShowCart(true)} />

      

      {/* Dishes */}
      <main className={styles.container}>
        <h2 className={styles.sectionTitle}>
          <UtensilsCrossed size={28} />
          <span>القائمة</span>
          <UtensilsCrossed size={28} />
        </h2>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>جاري تحميل القائمة...</span>
          </div>
        )}

        {error && <div className={styles.errorMsg}>⚠️ {error}</div>}

        {!loading && !error && (
          <div className={styles.grid}>
            {dishes.map((dish, index) => (
              <div key={dish.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <DishCard
                  dish={dish}
                  cartItem={cartItems.find(item => item.dish_id === dish.id)}
                  onAdd={addToCart}
                  onUpdateQty={updateCartQty}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button (mobile) */}
      {cartCount > 0 && (
        <button
          className={styles.floatingCart}
          onClick={() => setShowCart(true)}
          id="floating-cart-btn"
        >
          <ShoppingBag size={20} />
          <span className={styles.floatingBadge}>{cartCount}</span>
          <span>({cartTotal.toFixed(2)} ₪)</span>
        </button>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <Cart
          items={cartItems}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClose={() => setShowCart(false)}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
          total={cartTotal}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          items={cartItems}
          total={cartTotal}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleSubmitOrder}
        />
      )}

      {/* Order Confirmation */}
      {confirmedOrderId && (
        <OrderConfirmation
          orderId={confirmedOrderId}
          orderType={confirmedOrderType}
          onClose={handleConfirmationClose}
        />
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>مطبخ أبو هشام © {new Date().getFullYear()} — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
