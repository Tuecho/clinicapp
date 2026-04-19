/**
 * Example: Using Redis with Clinic Application
 * 
 * This file demonstrates how to use Redis caching,
 * rate limiting, and queue management in the clinic app.
 */

// ============================================
// BASIC CACHE USAGE
// ============================================

// Example 1: Caching clinic clients
async function getClinicClientsWithCache(userId) {
  const cacheKey = `clinic:clients:${userId}`;
  
  // Try to get from cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    console.log('✅ Returning cached clients');
    return cached;
  }
  
  // If no cache, query database
  console.log('💾 Querying database for clients');
  const stmt = db.prepare('SELECT * FROM clinic_clients WHERE owner_id = ? ORDER BY name ASC');
  stmt.bind([userId]);
  const clients = [];
  while (stmt.step()) clients.push(stmt.getAsObject());
  stmt.free();
  
  // Store in cache for 5 minutes
  await cache.set(cacheKey, clients, 300);
  
  return clients;
}

// ============================================
// CACHE INVALIDATION PATTERNS
// ============================================

// Example 2: Invalidate cache after data changes
async function updateClientAndInvalidateCache(userId, clientId, updates) {
  try {
    // Update database
    const stmt = db.prepare('UPDATE clinic_clients SET name = ?, email = ? WHERE id = ? AND owner_id = ?');
    stmt.run([updates.name, updates.email, clientId, userId]);
    stmt.free();
    saveDb();
    
    // Invalidate related cache
    const cacheKey = `clinic:clients:${userId}`;
    await cache.del(cacheKey);
    
    console.log('✅ Data updated and cache invalidated');
    return { success: true };
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

// Example 3: Invalidate multiple related caches
async function deleteServiceAndInvalidateCaches(userId, serviceId) {
  try {
    // Delete from database
    db.run('DELETE FROM clinic_appointments WHERE service_id = ? AND owner_id = ?', [serviceId, userId]);
    db.run('DELETE FROM clinic_services WHERE id = ? AND owner_id = ?', [serviceId, userId]);
    saveDb();
    
    // Invalidate multiple cache patterns
    await cache.del(`clinic:services:${userId}`);
    await cache.delPattern(`clinic:appointments:${userId}:*`);
    await cache.del(`clinic:dashboard:${userId}`);
    
    console.log('✅ Service deleted and all related caches invalidated');
    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

// ============================================
// RATE LIMITING
// ============================================

// Example 4: Rate limiting is automatically applied
// The middleware is already configured in server.js:
// app.use('/api/', limiter);

// Configuration used:
// - 100 requests per 15 minutes per IP
// - Returns 429 (Too Many Requests) when limit exceeded
// - Headers include rate limit information

// To test rate limiting:
// curl -X GET http://localhost:3000/api/clinic/clients \
//   -H "user-id: 1" \
//   -H "RateLimit-Limit: 100" \
//   -H "RateLimit-Remaining: 99"

// ============================================
// QUEUE MANAGEMENT (Future Use)
// ============================================

// Example 5: Adding items to a queue
async function addEmailToQueue(email) {
  const emailData = {
    to: email.to,
    subject: email.subject,
    body: email.body,
    createdAt: new Date().toISOString()
  };
  
  await cache.queueAdd('queue:emails', emailData);
  console.log('📧 Email added to queue');
}

// Example 6: Processing queue items
async function processEmailQueue() {
  let processed = 0;
  
  while (true) {
    const emailData = await cache.queueGet('queue:emails');
    
    if (!emailData) {
      console.log(`✅ Processed ${processed} emails from queue`);
      break;
    }
    
    // Send email
    try {
      await sendEmail(emailData);
      processed++;
      console.log(`📬 Email sent to ${emailData.to}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${emailData.to}:`, error);
      // Re-queue the email for retry
      await cache.queueAdd('queue:emails', emailData);
      break;
    }
  }
}

// Example 7: Checking queue status
async function getQueueStatus() {
  const emailQueueLength = await cache.queueLength('queue:emails');
  const reminderQueueLength = await cache.queueLength('queue:reminders');
  
  console.log('📊 Queue Status:');
  console.log(`  - Email queue: ${emailQueueLength} items`);
  console.log(`  - Reminder queue: ${reminderQueueLength} items`);
  
  return {
    emails: emailQueueLength,
    reminders: reminderQueueLength
  };
}

// ============================================
// CACHE MONITORING
// ============================================

// Example 8: Get cache statistics
async function getCacheStats() {
  const stats = await cache.getStats();
  
  console.log('📈 Cache Statistics:');
  console.log(`  - Total keys: ${stats.totalKeys}`);
  console.log(`  - Database size: ${stats.dbSize}`);
  console.log(`  - Info: ${stats.info}`);
  
  return stats;
}

// Example 9: Monitor cache performance
async function monitorCacheHealth() {
  setInterval(async () => {
    const stats = await cache.getStats();
    
    if (stats.totalKeys > 10000) {
      console.warn('⚠️  High number of cache keys:', stats.totalKeys);
      // Consider clearing old cache or optimizing TTL
    }
    
    console.log(`🔍 Cache Health - Keys: ${stats.totalKeys}, Size: ${stats.dbSize} bytes`);
  }, 60000); // Check every minute
}

// ============================================
// COUNTER/SEQUENCE GENERATION
// ============================================

// Example 10: Using Redis for counters
async function generateAppointmentNumber(userId) {
  const today = new Date().toISOString().split('T')[0];
  const counterKey = `appointments:counter:${userId}:${today}`;
  
  // Increment counter
  const count = await cache.increment(counterKey, 1);
  
  // Generate appointment number
  const appointmentNumber = `APT-${today}-${String(count).padStart(4, '0')}`;
  
  // Set expiration to next day (86400 seconds)
  await cache.expire(counterKey, 86400);
  
  return appointmentNumber;
}

// ============================================
// PATTERN-BASED CACHE OPERATIONS
// ============================================

// Example 11: Bulk invalidate all user's cache
async function clearUserCache(userId) {
  await cache.delPattern(`clinic:clients:${userId}`);
  await cache.delPattern(`clinic:services:${userId}`);
  await cache.delPattern(`clinic:appointments:${userId}:*`);
  await cache.del(`clinic:dashboard:${userId}`);
  await cache.del(`session:${userId}`);
  
  console.log(`✅ All cache cleared for user ${userId}`);
}

// Example 12: Clear all cache (use with caution!)
async function clearAllCache() {
  await cache.clear();
  console.log('🗑️  All cache cleared');
}

// ============================================
// TTL AND EXPIRATION MANAGEMENT
// ============================================

// Example 13: Managing cache expiration
async function setCacheWithDynamicTTL(key, value, priority = 'normal') {
  let ttl = 300; // Default 5 minutes
  
  if (priority === 'high') {
    ttl = 3600; // 1 hour for frequently accessed data
  } else if (priority === 'low') {
    ttl = 60; // 1 minute for rarely accessed data
  }
  
  await cache.set(key, value, ttl);
  console.log(`💾 Cached with TTL: ${ttl}s (Priority: ${priority})`);
}

// Example 14: Check cache expiration
async function checkCacheExpiration(key) {
  const ttl = await cache.ttl(key);
  
  if (ttl === -1) {
    console.log(`🔑 Key "${key}" exists but has no expiration (persistent)`);
  } else if (ttl === -2) {
    console.log(`❌ Key "${key}" does not exist`);
  } else {
    console.log(`⏱️  Key "${key}" expires in ${ttl} seconds`);
  }
  
  return ttl;
}

// ============================================
// ERROR HANDLING
// ============================================

// Example 15: Graceful cache error handling
async function getSafeWithCache(key, fallbackFn) {
  try {
    // Try cache first
    const cached = await cache.get(key);
    if (cached) return cached;
    
    // Fallback to function
    const result = await fallbackFn();
    
    // Try to cache, but don't fail if Redis is down
    try {
      await cache.set(key, result, 300);
    } catch (cacheError) {
      console.warn('⚠️  Cache write failed, continuing without cache:', cacheError.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error in getSafeWithCache:', error);
    return await fallbackFn(); // Fallback to database
  }
}

// ============================================
// API ENDPOINT EXAMPLE
// ============================================

// Example 16: Complete endpoint with caching
app.get('/api/clinic/appointments/optimized', async (req, res) => {
  const userId = getCurrentUserId(req.headers);
  if (!userId) return res.status(401).json({ error: 'No autorizado' });
  
  const { from, to } = req.query;
  const cacheKey = `clinic:appointments:${userId}:${from}:${to}`;
  
  try {
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached appointments (${cached.length} items)`);
      return res.json({ source: 'cache', data: cached });
    }
    
    // Query database
    console.log('💾 Querying database for appointments');
    const appointments = getAppointmentsFromDb(userId, from, to);
    
    // Cache results
    await cache.set(cacheKey, appointments, 300);
    
    res.json({ source: 'database', data: appointments });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ error: 'Error obteniendo citas' });
  }
});

// ============================================
// EXPORT EXAMPLES
// ============================================

export {
  getClinicClientsWithCache,
  updateClientAndInvalidateCache,
  deleteServiceAndInvalidateCaches,
  addEmailToQueue,
  processEmailQueue,
  getQueueStatus,
  getCacheStats,
  monitorCacheHealth,
  generateAppointmentNumber,
  clearUserCache,
  clearAllCache,
  setCacheWithDynamicTTL,
  checkCacheExpiration,
  getSafeWithCache
};
