const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const pool = require('./db');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// Multer config for dish image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `dish-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// ============== DISH ROUTES ==============

// GET /api/dishes - available dishes (customer)
app.get('/api/dishes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM dishes WHERE available = 1 ORDER BY sort_order ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب الأطباق' });
  }
});

// GET /api/dishes/all - all dishes (admin)
app.get('/api/dishes/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM dishes ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب الأطباق' });
  }
});

// POST /api/dishes - create dish (admin)
app.post('/api/dishes', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, available, sort_order } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : '';
    const [result] = await pool.query(
      'INSERT INTO dishes (name, description, price, image_url, available, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', parseFloat(price), image_url, available !== undefined ? parseInt(available) : 1, sort_order || 0]
    );
    const [newDish] = await pool.query('SELECT * FROM dishes WHERE id = ?', [result.insertId]);
    res.status(201).json(newDish[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في إضافة الطبق' });
  }
});

// PUT /api/dishes/:id - update dish (admin)
app.put('/api/dishes/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, available, sort_order } = req.body;
    
    let query = 'UPDATE dishes SET name=?, description=?, price=?, available=?, sort_order=?';
    let params = [name, description || '', parseFloat(price), parseInt(available), sort_order || 0];
    
    if (req.file) {
      query += ', image_url=?';
      params.push(`/images/${req.file.filename}`);
    }
    
    query += ' WHERE id=?';
    params.push(id);
    
    await pool.query(query, params);
    const [updated] = await pool.query('SELECT * FROM dishes WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في تحديث الطبق' });
  }
});

// DELETE /api/dishes/:id - delete dish (admin)
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM dishes WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في حذف الطبق' });
  }
});

// ============== ORDER ROUTES ==============

// POST /api/orders - submit order (customer)
app.post('/api/orders', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { customer_name, customer_phone, order_type, address, notes, items } = req.body;
    
    if (!customer_name || !customer_phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'يرجى تعبئة جميع الحقول المطلوبة' });
    }
    
    if (order_type === 'delivery' && !address) {
      return res.status(400).json({ error: 'يرجى إدخال عنوان التوصيل' });
    }
    
    // Calculate total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    
    // Insert order
    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_name, customer_phone, order_type, address, notes, total) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_name, customer_phone, order_type || 'pickup', address || '', notes || '', total]
    );
    
    const orderId = orderResult.insertId;
    
    // Insert order items
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, dish_id, dish_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.dish_id, item.dish_name, item.quantity, item.price]
      );
    }
    
    await conn.commit();
    res.status(201).json({ id: orderId, total, message: 'تم استلام طلبك بنجاح!' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'خطأ في إرسال الطلب' });
  } finally {
    conn.release();
  }
});

// GET /api/orders - list all orders (admin)
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    
    // Fetch items for each order
    for (let order of orders) {
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب الطلبات' });
  }
});

// PUT /api/orders/:id/status - update status (admin)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['new', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }
    
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const [updated] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في تحديث حالة الطلب' });
  }
});

// ============== AUTH ROUTE ==============

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Simple hardcoded credentials for small business
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  } else {
    res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }
});

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`🚀 Abu Hisham Kitchen API running at http://localhost:${PORT}`);
});
