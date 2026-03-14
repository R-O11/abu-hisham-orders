import React, { useState } from 'react';
import styles from './Cart.module.css';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Cart({ items, onUpdateQty, onRemove, onClose, onCheckout, total }) {
  const [closing, setClosing] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleClose} />
      <div className={`${styles.drawer} ${closing ? styles.drawerClosing : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <ShoppingCart size={24} />
            <span>سلة الطلبات</span>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} id="close-cart-btn">✕</button>
        </div>

        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingCart size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>السلة فارغة</p>
            </div>
          ) : (
            items.map((item) => (
              <div className={styles.cartItem} key={item.dish_id}>
                <img
                  src={item.image_url ? `${API_URL}${item.image_url}` : '/placeholder-dish.jpg'}
                  alt={item.dish_name}
                  className={styles.itemImage}
                />
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.dish_name}</div>
                  <div className={styles.itemPrice}>
                    {(item.price * item.quantity).toFixed(2)} ₪
                  </div>
                </div>
                <div className={styles.itemControls}>
                  {item.quantity <= 1 ? (
                    <button
                      className={`${styles.controlBtn} ${styles.deleteBtn}`}
                      onClick={() => onRemove(item.dish_id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      className={styles.controlBtn}
                      onClick={() => onUpdateQty(item.dish_id, item.quantity - 1)}
                    >
                      −
                    </button>
                  )}
                  <span className={styles.itemQty}>{item.quantity}</span>
                  <button
                    className={styles.controlBtn}
                    onClick={() => onUpdateQty(item.dish_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>المجموع</span>
              <span className={styles.totalValue}>{total.toFixed(2)} ₪</span>
            </div>
            <button className={styles.checkoutBtn} onClick={onCheckout} id="checkout-btn">
              <span>إتمام الطلب</span>
              <ArrowLeft size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
