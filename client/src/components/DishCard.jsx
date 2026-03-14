import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './DishCard.module.css';
import { Plus, Check, X } from 'lucide-react';

export default function DishCard({ dish, cartItem, onAdd, onUpdateQty }) {
  const [justAdded, setJustAdded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const quantity = cartItem ? cartItem.quantity : 0;
  const API_URL = import.meta.env.VITE_API_URL || '';
  const imageSrc = dish.image_url ? `${API_URL}${dish.image_url}` : '/placeholder-dish.jpg';

  const handleAdd = () => {
    onAdd(dish);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  return (
    <div className={styles.card}>
      <div 
        className={styles.imageWrapper} 
        onClick={() => setShowImageModal(true)}
        role="button"
        tabIndex="0"
        aria-label={`הגדל תמונה של ${dish.name}`}
      >
        <div className={styles.imageHoverOverlay}>
          <span>הגדל תמונה</span>
        </div>
        <img
          src={imageSrc}
          alt={dish.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.priceBadge}>
          {dish.price} <span className={styles.currency}>₪</span>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{dish.name}</h3>
        <p className={styles.description}>{dish.description}</p>
        {quantity === 0 ? (
          <button
            className={`${styles.addButton} ${justAdded ? styles.addedButton : ''}`}
            onClick={handleAdd}
            id={`add-dish-${dish.id}`}
          >
            {justAdded ? <Check size={18} /> : <Plus size={18} />}
            <span>{justAdded ? 'تمت الإضافة' : 'أضف للسلة'}</span>
          </button>
        ) : (
          <div className={styles.quantityControl}>
            <button
              className={styles.qtyBtn}
              onClick={() => onUpdateQty(dish.id, quantity - 1)}
              id={`decrease-dish-${dish.id}`}
            >
              −
            </button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => onUpdateQty(dish.id, quantity + 1)}
              id={`increase-dish-${dish.id}`}
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && createPortal(
        <div 
          className={styles.modalOverlay} 
          onClick={() => setShowImageModal(false)}
        >
          <div className={styles.modalContent}>
            <button 
              className={styles.closeModalBtn} 
              onClick={(e) => {
                e.stopPropagation();
                setShowImageModal(false);
              }}
            >
              <X size={28} />
            </button>
            <img
              src={imageSrc}
              alt={dish.name}
              className={styles.modalImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
