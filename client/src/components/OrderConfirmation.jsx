import React from 'react';
import styles from './OrderConfirmation.module.css';
import { CheckCircle2, Car, Store, Clock } from 'lucide-react';

export default function OrderConfirmation({ orderId, orderType, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.checkmark}>
          <CheckCircle2 size={64} className={styles.checkIcon} />
        </div>
        <h2 className={styles.title}>تم استلام طلبك بنجاح!</h2>
        <p className={styles.subtitle}>
          شكراً لك على طلبك من مطبخ أبو هشام.
          <br />سيتم مراجعة طلبك والتواصل معك قريباً.
        </p>

        <div className={styles.orderInfo}>
          <div className={styles.orderNumber}>
            <span className={styles.orderLabel}>رقم الطلب</span>
            <span className={styles.orderId}>#{orderId}</span>
          </div>

          <div className={styles.orderTypeBadge}>
            {orderType === 'delivery' ? <Car size={20} /> : <Store size={20} />}
            <span>{orderType === 'delivery' ? 'توصيل' : 'استلام من المطبخ'}</span>
          </div>
        </div>

        <div className={styles.statusMessage}>
          <Clock size={24} className={styles.statusIcon} />
          <p>سيقوم فريقنا بمراجعة طلبك والبدء في تجهيزه في أقرب وقت</p>
        </div>

        <button className={styles.button} onClick={onClose} id="back-to-menu-btn">
          العودة للقائمة
        </button>
      </div>
    </div>
  );
}
