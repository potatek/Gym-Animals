require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit'); 
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads/') });


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log(' AUTH HEADER:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log(' Brak tokena');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(' Błąd weryfikacji JWT:', err.message);
      return res.sendStatus(403);
    }
    console.log(' JWT zweryfikowany, payload:', user);
    req.user = user;
    next();
  });
}
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }
  next();
}



//uploadu obrazka
app.post('/api/products/:id/image',
  authenticateToken, requireAdmin,
  upload.single('image'),
  async (req, res) => {
    const productId = req.params.id;
    
    const imageUrl = `/uploads/${req.file.filename}`;
    
    await pool.query(
      'UPDATE Products SET imageUrl = ? WHERE id = ?',
      [imageUrl, productId]
    );
    res.json({ imageUrl });
  }
);


// REJESTRACJA
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Brakuje danych' });
  const [exists] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
  if (exists.length) return res.status(400).json({ error: 'Użytkownik już istnieje' });
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
   'INSERT INTO Users (email, password) VALUES (?, ?)',
   [email, hash]
 );
 const newUserId = result.insertId;
 
 const token = jwt.sign(
   { userId: newUserId, email, role: 'user' },
   process.env.JWT_SECRET,
   { expiresIn: process.env.JWT_EXPIRES_IN }
 );
  res.json({ token });
});

//logowanie
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Brakuje danych' });
  const [rows] = await pool.query('SELECT id, password, role FROM Users WHERE email = ?', [email]);
  if (!rows.length) return res.status(400).json({ error: 'Nieprawidłowe dane' });
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Nieprawidłowe dane' });
  const token = jwt.sign(
    { userId: user.id, email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.json({ token });
});


const crypto = require('crypto');

// przypomnienie hasla
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Brakuje email' });
  const [[user]] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
  if (!user) return res.json({});         

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600*1000); // 1h
  await pool.query(
    'INSERT INTO PasswordResetTokens (userId, token, expiresAt) VALUES (?,?,?)',
    [user.id, token, expiresAt]
  );

  //  mail
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Sklep" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset hasła',
    html: `<p>Kliknij, by zresetować hasło:</p>
           <a href="${link}">${link}</a>
           <p>Link ważny 1h.</p>`
  });
  res.json({});
});


app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Brakuje danych' });

  const [[row]] = await pool.query(
    'SELECT userId, expiresAt FROM PasswordResetTokens WHERE token = ?',
    [token]
  );
  if (!row || new Date(row.expiresAt) < new Date()) {
    return res.status(400).json({ error: 'Token nieprawidłowy lub wygasł' });
  }

  const hash = await bcrypt.hash(password, 10);
  await pool.query('UPDATE Users SET password = ? WHERE id = ?', [hash, row.userId]);
  await pool.query('DELETE FROM PasswordResetTokens WHERE token = ?', [token]);

  res.json({ message: 'Hasło zresetowane' });
});

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM Products WHERE deletedAt IS NULL');
    res.json(rows.map(r => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// produkty wedlug filtrow
app.get('/api/products', async (req, res) => {
  //console.log(' GET /api/products →', req.query);
  try {
    let { search, category, sort } = req.query;
    const conditions = [], params = [];

    if (search) {
      conditions.push('p.name LIKE ?');
      params.push(`%${search}%`);
    }
    if (category) {
      conditions.push('p.category = ?');
      params.push(category);
    }

    const where = conditions.length
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    let orderBy = 'p.name ASC';
    if (sort === 'price_asc')  orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    if (sort === 'name_desc')  orderBy = 'p.name DESC';

    const query = `
      SELECT 
        p.id, p.name, p.description, p.category,
        p.price, p.imageUrl,
        COALESCE(AVG(r.rating),0) AS avgRating,
        COUNT(r.id)            AS reviewCount
      FROM Products p
      LEFT JOIN Reviews r ON p.id = r.productId
      WHERE p.deletedAt IS NULL
       ${where ? 'AND ' + where.replace(/^WHERE\s*/, '') : ''}
      GROUP BY p.id
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
//konkretny produkt
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Products WHERE id = ? AND deletedAt IS NULL`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Nie znaleziono produktu' });
    const product = rows[0];

    
    const [stockRows] = await pool.query(
      'SELECT size, quantity FROM Stock WHERE productId = ?',
      [req.params.id]
    );
    product.stock = stockRows;      

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});




// komentarze dla produktu
app.get('/api/products/:id/comments', async (req, res) => {
  try {
    const { q } = req.query;
    let sql = `
      SELECT r.id, r.rating, r.text, r.imageUrl, u.email AS userEmail
      FROM Reviews r
      JOIN Users u ON r.userId = u.id
      WHERE r.productId = ?
    `;
    const params = [req.params.id];

    if (q) {
      //sql += ` AND MATCH(r.text) AGAINST(? IN NATURAL LANGUAGE MODE)`; wersja z pelnymi slowami
      sql += ` AND MATCH(r.text) AGAINST(? IN BOOLEAN MODE)`;
      //params.push(q);
      params.push(q+'*');
    }

    sql += ` ORDER BY r.createdAt DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// dodawanie komentarza
app.post(
  '/api/products/:id/comments',
  authenticateToken,
  upload.single('image'),      
  async (req, res) => {
    const productId = req.params.id;
    const userId    = req.user.userId;
    const { rating, text } = req.body;

    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    
    const [exists] = await pool.query(
      'SELECT id FROM Reviews WHERE productId = ? AND userId = ?',
      [productId, userId]
    );
    if (exists.length) {
      return res.status(400).json({ error: 'Już wystawiłeś opinię' });
    }

    
    await pool.query(
      `INSERT INTO Reviews (productId, userId, rating, text, imageUrl)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, userId, rating, text || null, imageUrl]
    );
    res.status(201).json({ message: 'Opinia dodana' });
  }
);

// pomocnicza funkcja do obliczania odległości (Haversine w km) uzywana dla paczkomatow
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// pobranie paczkomatow
app.get('/api/pickup-locations', async (req, res) => {
  try {
    let { lat, lng, radius } = req.query;
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    radius = parseFloat(radius) || 5; 

    
    const [rows] = await pool.query('SELECT * FROM PickupLocations');
    
    const nearby = rows
      .map(r => {
        const distance = haversine(lat, lng, r.lat, r.lng);
        return { ...r, distance };
      })
      .filter(r => r.distance <= radius)
      .sort((a,b) => a.distance - b.distance);

    res.json(nearby);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// nowe zamowienie
app.post('/api/orders', async (req, res) => {
  const { items, contact, shipping, paymentMethod } = req.body;
  let userId = null;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    try {
      userId = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET).userId;
    } catch {}
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const [orderResult] = await pool.query(
    `INSERT INTO Orders
       (userId, contactName, contactEmail, contactPhone,
        shipType, shipLocationId, shipAddress, shipLat, shipLng,
        total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      userId,
      contact.name, contact.email, contact.phone,
      shipping.type,
      shipping.type === 'pickup' ? shipping.location.id : null,
      shipping.type === 'delivery' ? shipping.address   : null,
      shipping.type === 'delivery' ? shipping.lat       : null,
      shipping.type === 'delivery' ? shipping.lng       : null,
      total
    ]
  );
  const orderId = orderResult.insertId;

  
  for (let i of items) {
    await pool.query(
      `INSERT INTO OrderItems (orderId, productId, quantity, price, size)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, i.id, i.quantity, i.price, i.size]
    );
  }

  res.status(201).json({ orderId });
});



// symuluje platność, zmniejsza stock, generuje PDF z rozmiarem i wysyła mail
app.post('/api/orders/:id/pay', async (req, res) => {
  const orderId = req.params.id;
  const conn = await pool.getConnection();

  try {
    
    await conn.beginTransaction();

    
    await conn.query(
      'UPDATE Orders SET status = ? WHERE id = ?',
      ['paid', orderId]
    );

    
    const [items] = await conn.query(
      `SELECT productId, size, quantity
         FROM OrderItems
        WHERE orderId = ?`,
      [orderId]
    );

    
    for (let { productId, size, quantity } of items) {
      const [result] = await conn.query(
        `UPDATE Stock
            SET quantity = quantity - ?
          WHERE productId = ?
            AND size = ?
            AND quantity >= ?`,
        [quantity, productId, size, quantity]
      );
      if (result.affectedRows === 0) {
        throw new Error(
          `Brak wystarczającego stanu dla produktu ID=${productId}, rozmiar "${size}"`
        );
      }
    }

    
    await conn.commit();

    

    //generowanie maila i pdf
    const [[order]] = await pool.query(
      'SELECT * FROM Orders WHERE id = ?',
      [orderId]
    );

    
    const [details] = await pool.query(
      `SELECT oi.quantity, oi.price, oi.size, p.name
         FROM OrderItems oi
         JOIN Products p ON oi.productId = p.id
        WHERE oi.orderId = ?`,
      [orderId]
    );

    
    let shippingHtml;
    if (order.shipType === 'pickup') {
      const [[loc]] = await pool.query(
        'SELECT name FROM PickupLocations WHERE id = ?',
        [order.shipLocationId]
      );
      shippingHtml = `<p><strong>Punkt odbioru:</strong> ${loc.name}</p>`;
    } else {
      shippingHtml = `<p><strong>Adres dostawy:</strong> ${order.shipAddress}</p>`;
    }

    // generuj PDF
    const doc = new PDFDocument({ margin: 50 });
    doc.registerFont('Roboto', path.join(__dirname, 'fonts/Roboto-Regular.ttf'));
    doc.font('Roboto');
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      await transporter.sendMail({
        from: `"Sklep" <${process.env.SMTP_USER}>`,
        to: order.contactEmail,
        subject: `Potwierdzenie zamówienia #${orderId}`,
        html: `
          <p>Dziękujemy za zamówienie!</p>
          <p><strong>Numer zamówienia:</strong> ${orderId}</p>
          <p><strong>Kwota:</strong> ${parseFloat(order.total).toFixed(2)} PLN</p>
          ${shippingHtml}
          <p>Faktura w załączniku.</p>
        `,
        attachments: [{
          filename: `faktura-${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      });
      res.json({ message: 'Zapłacono, stock zaktualizowany i wysłano fakturę.' });
    });

    
    doc.fontSize(20).text(`Faktura VAT #${orderId}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12)
       .text(`Data: ${new Date().toLocaleDateString()}`)
       .text(`Klient: ${order.contactName}`)
       .text(`Email: ${order.contactEmail}`)
       .text(`Telefon: ${order.contactPhone}`);
    doc.moveDown();
    doc.fontSize(14).text('Pozycje zamówienia:');
    details.forEach(i => {
      const lineTotal = (i.quantity * parseFloat(i.price)).toFixed(2);
      doc.fontSize(12).text(
        `• ${i.name} (${i.size}) × ${i.quantity} @ ${parseFloat(i.price).toFixed(2)} PLN = ${lineTotal} PLN`
      );
    });
    doc.moveDown();
    doc.fontSize(14).text(
      `Razem do zapłaty: ${parseFloat(order.total).toFixed(2)} PLN`,
      { align: 'right' }
    );
    doc.end();

  } catch (err) {
    
    await conn.rollback();
    console.error('Błąd podczas płatności i aktualizacji stocku:', err);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});
//pobranie wszystkich zamowien
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [orders] = await pool.query(`
        SELECT
          o.id,
          o.total,
          o.status,
          o.createdAt,
          u.email AS userEmail
        FROM Orders o
        LEFT JOIN Users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
      `);
      return res.json(orders);
    } else {
      const [orders] = await pool.query(`
        SELECT
          id,
          total,
          status,
          createdAt
        FROM Orders
        WHERE userId = ?
        ORDER BY createdAt DESC
      `, [req.user.userId]);
      return res.json(orders);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

//  zwraca detale zamowienia
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId  = req.user.userId;
  const role = req.user.role;

  let order;
  if (role === 'admin') {
    [[order]] = await pool.query(
      `SELECT * FROM Orders WHERE id = ?`,
      [orderId]
    );
  } else {
    [[order]] = await pool.query(
      `SELECT * FROM Orders WHERE id = ? AND userId = ?`,
      [orderId, userId]
    );
  }
  if (!order) return res.status(404).json({ error: 'Nie znaleziono zamówienia' });

  const [items] = await pool.query(
    `SELECT oi.quantity, oi.price, oi.size, p.name
       FROM OrderItems oi
       JOIN Products p ON oi.productId = p.id
      WHERE oi.orderId = ?`,
    [orderId]
  );

  res.json({
    id:           order.id,
    createdAt:    order.createdAt,
    status:       order.status,
    total:        order.total,
    contactName:  order.contactName,
    contactEmail: order.contactEmail,
    contactPhone: order.contactPhone,
    shipType:     order.shipType,
    shipLocationId: order.shipLocationId,
    shipAddress:  order.shipAddress,
    shipLat:      order.shipLat,
    shipLng:      order.shipLng,
    items
  });
});


// aktualizoawnie recenzji
app.put(
  '/api/comments/:id',
  authenticateToken,
  upload.single('image'),
  async (req, res) => {
    const commentId = req.params.id;
    const userId    = req.user.userId;
    const { rating, text } = req.body;

    
    const [rows] = await pool.query(
      'SELECT userId FROM Reviews WHERE id = ?',
      [commentId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Nie znaleziono recenzji' });
    if (rows[0].userId !== userId) return res.sendStatus(403);

    
    const params = [rating, text || null];
    let sql = `UPDATE Reviews
                  SET rating = ?, text = ?`;

    
    if (req.file) {
      sql += `, imageUrl = ?`;
      params.push(`/uploads/${req.file.filename}`);
    }
    
    else if (req.body.imageUrl !== undefined) {
      sql += `, imageUrl = ?`;
      params.push(req.body.imageUrl);  
    }

    sql += ` WHERE id = ?`;
    params.push(commentId);

    await pool.query(sql, params);
    res.json({ message: 'Recenzja zaktualizowana' });
  }
);


//  usunięcie recenzji
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  const commentId = req.params.id;
  const userId    = req.user.userId;
  const role      = req.user.role;

  
  const [rows] = await pool.query(
    'SELECT userId FROM Reviews WHERE id = ?',
    [commentId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Nie znaleziono recenzji' });
  if (rows[0].userId !== userId && role !=='admin') return res.sendStatus(403);//wlasnosc usera lub admin

  
  await pool.query('DELETE FROM Reviews WHERE id = ?', [commentId]);
  res.sendStatus(204);
});

// dodanie produktu
app.post(
  '/api/products',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    const { name, description, category, price } = req.body;
    
    let stockArr = [];
    try {
      stockArr = JSON.parse(req.body.stock);
    } catch (e) {
      
    }

    
    if (!name || !category || price == null || !Array.isArray(stockArr)) {
      return res.status(400).json({ error: 'Brakuje wymaganych pól lub stock nie jest tablicą' });
    }

    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    
    const [result] = await pool.query(
      `INSERT INTO Products (name, description, category, price, imageUrl)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, category, price, imageUrl]
    );
    const productId = result.insertId;

    
    for (const { size, quantity } of stockArr) {
      await pool.query(
        `INSERT INTO Stock (productId, size, quantity) VALUES (?, ?, ?)`,
        [productId, size, quantity]
      );
    }

    res.status(201).json({ id: productId });
  }
);

// aktualizacja produktu
app.put(
  '/api/products/:id',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    const productId = req.params.id;
    
    const { name, description, category, price } = req.body;

    
    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      imageUrl = req.body.imageUrl;
    }

    
    let stockArr = [];
    if (req.body.stock) {
      if (typeof req.body.stock === 'string') {
        try {
          stockArr = JSON.parse(req.body.stock);
        } catch (e) {
          return res
            .status(400)
            .json({ error: 'Pole stock musi być poprawnym JSON-em' });
        }
      } else if (Array.isArray(req.body.stock)) {
        stockArr = req.body.stock;
      }
    }

    if (!Array.isArray(stockArr)) {
      return res
        .status(400)
        .json({ error: 'Pole stock musi być tablicą' });
    }

    
    const fields = [
      'name = ?',
      'description = ?',
      'category = ?',
      'price = ?'
    ];
    const params = [name, description, category, price];
    if (imageUrl !== undefined) {
      fields.push('imageUrl = ?');
      params.push(imageUrl);
    }
    params.push(productId);

    await pool.query(
      `UPDATE Products
         SET ${fields.join(', ')}
       WHERE id = ?`,
      params
    );

    
    await pool.query('DELETE FROM Stock WHERE productId = ?', [
      productId
    ]);
    for (const entry of stockArr) {
      const { size, quantity } = entry;
      await pool.query(
        `INSERT INTO Stock (productId, size, quantity)
         VALUES (?, ?, ?)`,
        [productId, size, quantity]
      );
    }

    res.json({ message: 'Zaktualizowano produkt i stock' });
  }
);


//  usuń produkt
app.delete('/api/products/:id', authenticateToken,requireAdmin, async (req, res) => {
  const pid = req.params.id;
    await pool.query(
      'UPDATE Products SET deletedAt = NOW() WHERE id = ?',
      [pid]
    );
    res.sendStatus(204);
});


// czy uzytkownik kupile ten podukt -> do opini
app.get(
  '/api/products/:id/has-purchased',
  authenticateToken,           
  async (req, res) => {
    const userId    = req.user.userId;
    const productId = req.params.id;

    try {
      
      const [rows] = await pool.query(
        `SELECT 1
           FROM OrderItems oi
           JOIN Orders o ON oi.orderId = o.id
          WHERE o.userId    = ?
            AND oi.productId = ?
          LIMIT 1`,
        [userId, productId]
      );

      res.json({ hasPurchased: rows.length > 0 });
    } catch (err) {
      console.error('Błąd w has-purchased:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// konkretny punkt oddbioru
app.get('/api/pickup-locations/:id', async (req, res) => {
  try {
    const [[loc]] = await pool.query(
      'SELECT id, name, lat, lng FROM PickupLocations WHERE id = ?',
      [req.params.id]
    );
    if (!loc) return res.status(404).json({ error: 'Nie znaleziono paczkomatu' });
    res.json(loc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Uruchom serwer
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});
