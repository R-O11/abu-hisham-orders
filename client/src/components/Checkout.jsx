import React, { useState } from 'react';
import styles from './Checkout.module.css';
import { ClipboardList, Store, Car, Check } from 'lucide-react';

export default function Checkout({ items, total, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState('pickup');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'يرجى إدخال الاسم';
    if (!phone.trim()) errs.phone = 'يرجى إدخال رقم الهاتف';
    else if (phone.trim().length < 9) errs.phone = 'رقم هاتف غير صالح';
    if (orderType === 'delivery' && !address.trim()) errs.address = 'يرجى إدخال عنوان التوصيل';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await onSubmit({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        order_type: orderType,
        address: orderType === 'delivery' ? address.trim() : '',
        notes: notes.trim(),
        items: items.map(item => ({
          dish_id: item.dish_id,
          dish_name: item.dish_name,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    } catch (err) {
      setErrors({ submit: 'حدث خطأ، يرجى المحاولة مرة أخرى' });
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>
            <ClipboardList size={24} />
            <span>تأكيد الطلب</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} id="close-checkout-btn">✕</button>
        </div>
        <div className={styles.body}>
          {/* Order Summary */}
          <div className={styles.summary}>
            {items.map((item) => (
              <div className={styles.summaryItem} key={item.dish_id}>
                <span>{item.dish_name} × {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} ₪</span>
              </div>
            ))}
            <div className={styles.summaryTotal}>
              <span>المجموع</span>
              <span>{total.toFixed(2)} ₪</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                الاسم الكامل <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="أدخل الاسم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="customer-name-input"
              />
              {errors.name && <div className={styles.error}>{errors.name}</div>}
            </div>

            {/* Phone Number */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                رقم الهاتف <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                className={styles.input}
                placeholder="05XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                id="customer-phone-input"
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
              {errors.phone && <div className={styles.error}>{errors.phone}</div>}
            </div>

            {/* Order Type: Delivery / Pickup */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                نوع الطلب <span className={styles.required}>*</span>
              </label>
              <div className={styles.orderTypeToggle}>
                <button
                  type="button"
                  className={`${styles.orderTypeBtn} ${orderType === 'pickup' ? styles.orderTypeBtnActive : ''}`}
                  onClick={() => setOrderType('pickup')}
                  id="order-type-pickup"
                >
                  <span className={styles.orderTypeIcon}><Store size={20} /></span>
                  <span>استلام من المطبخ</span>
                </button>
                
              </div>
            </div>

            

            {/* Notes */}
            <div className={styles.formGroup}>
              <label className={styles.label}>ملاحظات إضافية</label>
              <textarea
                className={`${styles.input} ${styles.textareaSm}`}
                placeholder="..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                id="customer-notes-input"
              />
            </div>

            {errors.submit && <div className={styles.error}>{errors.submit}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              id="submit-order-btn"
            >
              {loading ? (
                <>
                  <span className={styles.submitSpinner}></span>
                  <span>جاري إرسال الطلب...</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  <span>إرسال الطلب</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
