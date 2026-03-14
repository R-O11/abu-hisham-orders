import React from 'react';
import styles from './Header.module.css';
import logo from '../assets/Logo_AbuHisham.png';
import { ShoppingCart } from 'lucide-react';

export default function Header({ cartCount, onCartClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logo}>
          <img 
            src={logo} 
            alt="مطبخ أبو هشام" 
            className={styles.logoImage}
          />
        </div>

        <button className={styles.cartButton} onClick={onCartClick} id="cart-toggle-btn">
          <ShoppingCart size={20} />
          <span>السلة</span>
          {cartCount > 0 && (
            <span className={styles.cartBadge}>{cartCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}