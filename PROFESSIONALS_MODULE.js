// ============================================================================
// TABLAS Y ENDPOINTS PARA MÓDULO DE PROFESIONALES/AGENDA
// ============================================================================

// Insertar después de initDb() - Antes de app.listen()

const initProfessionalsModule = () => {
  // CREATE TABLES
  db.run(`
    CREATE TABLE IF NOT EXISTS clinic_professionals (
      id TEXT PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      specialties TEXT,
      bio TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clinic_specialties (
      id TEXT PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clinic_professional_schedules (
      id TEXT PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      professional_id TEXT NOT NULL,
      day_of_week INTEGER,
      start_time TEXT,
      end_time TEXT,
      break_start TEXT,
      break_end TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(professional_id) REFERENCES clinic_professionals(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clinic_professional_availability (
      id TEXT PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      professional_id TEXT NOT NULL,
      date TEXT,
      start_time TEXT,
      end_time TEXT,
      available INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(professional_id) REFERENCES clinic_professionals(id)
    )
  `);

  console.log('✅ Tablas de Profesionales inicializadas');
};

// ============================================================================
// ENDPOINTS PROFESIONALES
// ============================================================================

// GET - Obtener todos los profesionales
app.get('/api/professionals', (req, res) => {
  const userId = req.query.user_id || 1;
  
  try {
    const stmt = db.prepare('SELECT * FROM clinic_professionals WHERE owner_id = ? AND active = 1 ORDER BY name');
    stmt.bind([userId]);
    
    const professionals = [];
    while (stmt.step()) professionals.push(stmt.getAsObject());
    stmt.free();
    
    res.json(professionals);
  } catch (err) {
    console.error('Error fetching professionals:', err);
    res.status(500).json({ error: 'Error fetching professionals' });
  }
});

// GET - Obtener un profesional específico
app.get('/api/professionals/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id || 1;
  
  try {
    const stmt = db.prepare('SELECT * FROM clinic_professionals WHERE id = ? AND owner_id = ?');
    stmt.bind([id, userId]);
    
    if (stmt.step()) {
      const professional = stmt.getAsObject();
      stmt.free();
      res.json(professional);
    } else {
      stmt.free();
      res.status(404).json({ error: 'Professional not found' });
    }
  } catch (err) {
    console.error('Error fetching professional:', err);
    res.status(500).json({ error: 'Error fetching professional' });
  }
});

// POST - Crear nuevo profesional
app.post('/api/professionals', (req, res) => {
  const { name, email, phone, specialties, bio, active } = req.body;
  const userId = req.query.user_id || 1;
  const id = crypto.randomUUID();
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const stmt = db.prepare(`
      INSERT INTO clinic_professionals (id, owner_id, name, email, phone, specialties, bio, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([id, userId, name, email || '', phone || '', specialties || '', bio || '', active || 1]);
    stmt.step();
    stmt.free();
    
    db.export();
    saveDatabase();
    
    res.json({ id, name, email, phone, specialties, bio, active: active || 1 });
  } catch (err) {
    console.error('Error creating professional:', err);
    res.status(500).json({ error: 'Error creating professional' });
  }
});

// PUT - Actualizar profesional
app.put('/api/professionals/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, specialties, bio, active } = req.body;
  const userId = req.query.user_id || 1;
  
  try {
    const stmt = db.prepare(`
      UPDATE clinic_professionals 
      SET name = ?, email = ?, phone = ?, specialties = ?, bio = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND owner_id = ?
    `);
    stmt.bind([name, email || '', phone || '', specialties || '', bio || '', active || 1, id, userId]);
    stmt.step();
    stmt.free();
    
    db.export();
    saveDatabase();
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating professional:', err);
    res.status(500).json({ error: 'Error updating professional' });
  }
});

// DELETE - Eliminar profesional
app.delete('/api/professionals/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id || 1;
  
  try {
    const stmt = db.prepare('UPDATE clinic_professionals SET active = 0 WHERE id = ? AND owner_id = ?');
    stmt.bind([id, userId]);
    stmt.step();
    stmt.free();
    
    db.export();
    saveDatabase();
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting professional:', err);
    res.status(500).json({ error: 'Error deleting professional' });
  }
});

// ============================================================================
// ENDPOINTS ESPECIALIDADES
// ============================================================================

// GET - Obtener todas las especialidades
app.get('/api/specialties', (req, res) => {
  const userId = req.query.user_id || 1;
  
  try {
    const stmt = db.prepare('SELECT * FROM clinic_specialties WHERE owner_id = ? ORDER BY name');
    stmt.bind([userId]);
    
    const specialties = [];
    while (stmt.step()) specialties.push(stmt.getAsObject());
    stmt.free();
    
    res.json(specialties);
  } catch (err) {
    console.error('Error fetching specialties:', err);
    res.status(500).json({ error: 'Error fetching specialties' });
  }
});

// POST - Crear nueva especialidad
app.post('/api/specialties', (req, res) => {
  const { name, description } = req.body;
  const userId = req.query.user_id || 1;
  const id = crypto.randomUUID();
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const stmt = db.prepare(`
      INSERT INTO clinic_specialties (id, owner_id, name, description)
      VALUES (?, ?, ?, ?)
    `);
    stmt.bind([id, userId, name, description || '']);
    stmt.step();
    stmt.free();
    
    db.export();
    saveDatabase();
    
    res.json({ id, name, description });
  } catch (err) {
    console.error('Error creating specialty:', err);
    res.status(500).json({ error: 'Error creating specialty' });
  }
});

// DELETE - Eliminar especialidad
app.delete('/api/specialties/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id || 1;
  
  try {
    const stmt = db.prepare('DELETE FROM clinic_specialties WHERE id = ? AND owner_id = ?');
    stmt.bind([id, userId]);
    stmt.step();
    stmt.free();
    
    db.export();
    saveDatabase();
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting specialty:', err);
    res.status(500).json({ error: 'Error deleting specialty' });
  }
});

// ============================================================================
// ENDPOINTS HORARIOS DE PROFESIONALES
// ============================================================================

// GET - Obtener horarios de profesionales
app.get('/api/professional-schedules', (req, res) => {
  const userId = req.query.user_id || 1;
  const professionalId = req.query.professional_id;
  
  try {
    let query = 'SELECT * FROM clinic_professional_schedules WHERE owner_id = ?';
    const params = [userId];
    
    if (professionalId) {
      query += ' AND professional_id = ?';
      params.push(professionalId);
    }
    
    query += ' ORDER BY day_of_week, start_time';
    
    const stmt = db.prepare(query);
    stmt.bind(params);
    
    const schedules = [];
    while (stmt.step()) schedules.push(stmt.getAsObject());
    stmt.free();
    
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Error fetching schedules' });
  }
});

// POST - Crear horario
app.post('/api/professional-schedules', (req, res) => {
  const { professional_id, day_of_week, start_time, end_time, break_start, break_end } = req.body;
  const userId = req.query.user_id || 1;
  const id = crypto.randomUUID();
  
  if (!professional_id || day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const stmt = db.prepare(`
      INSERT INTO clinic_professional_schedules (id, owner_id, professional_id, day_of_week, start_time, end_time, break_start, break_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([id, userId, professional_id, day_of_week, start_time, end_time, break_start || null, break_end || null]);
    stmt.step();
    stmt.free();
    
    db.export();
    saveDatabase();
    
    res.json({ id, professional_id, day_of_week, start_time, end_time, break_start, break_end });
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Error creating schedule' });
  }
});

// DELETE - Eliminar horario
app.delete('/api/professional-schedules/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id || 1;
  
  try {
    const stmt = db.prepare('DELETE FROM clinic_professional_schedules WHERE id = ? AND owner_id = ?');
    stmt.bind([id, userId]);
    stmt.step();
    stmt.free();
    
    db.export();
    saveDatabase();
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ error: 'Error deleting schedule' });
  }
});

// ============================================================================
// ENDPOINTS DISPONIBILIDAD DE PROFESIONALES
// ============================================================================

// GET - Obtener disponibilidad
app.get('/api/professional-availability', (req, res) => {
  const userId = req.query.user_id || 1;
  const { professional_id, date } = req.query;
  
  try {
    let query = 'SELECT * FROM clinic_professional_availability WHERE owner_id = ?';
    const params = [userId];
    
    if (professional_id) {
      query += ' AND professional_id = ?';
      params.push(professional_id);
    }
    
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY date, start_time';
    
    const stmt = db.prepare(query);
    stmt.bind(params);
    
    const availability = [];
    while (stmt.step()) availability.push(stmt.getAsObject());
    stmt.free();
    
    res.json(availability);
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: 'Error fetching availability' });
  }
});

// POST - Crear/actualizar disponibilidad
app.post('/api/professional-availability', (req, res) => {
  const { professional_id, date, start_time, end_time, available } = req.body;
  const userId = req.query.user_id || 1;
  const id = crypto.randomUUID();
  
  if (!professional_id || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const stmt = db.prepare(`
      INSERT INTO clinic_professional_availability (id, owner_id, professional_id, date, start_time, end_time, available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([id, userId, professional_id, date, start_time, end_time, available !== undefined ? available : 1]);
    stmt.step();
    stmt.free();
    
    db.export();
    saveDatabase();
    
    res.json({ id, professional_id, date, start_time, end_time, available });
  } catch (err) {
    console.error('Error creating availability:', err);
    res.status(500).json({ error: 'Error creating availability' });
  }
});

// ============================================================================
// FIN MÓDULO PROFESIONALES/AGENDA
// ============================================================================
