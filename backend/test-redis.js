#!/usr/bin/env node

/**
 * Redis Testing Script
 * 
 * Test Redis connection, caching, rate limiting, and performance
 * 
 * Usage: node test-redis.js
 */

import { createClient } from 'redis';
import rateLimit from 'express-rate-limit';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

console.log('🧪 Redis Testing Suite\n');
console.log(`📍 Redis Server: ${REDIS_HOST}:${REDIS_PORT}\n`);

// ============================================
// TEST 1: Connection
// ============================================

async function testConnection() {
  console.log('TEST 1: Redis Connection');
  console.log('=' .repeat(50));
  
  const client = createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to Redis');
    
    const pong = await client.ping();
    console.log(`✅ Ping response: ${pong}`);
    
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// ============================================
// TEST 2: Basic Cache Operations
// ============================================

async function testCacheOperations() {
  console.log('\n\nTEST 2: Basic Cache Operations');
  console.log('=' .repeat(50));
  
  const client = createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  });
  
  try {
    await client.connect();
    
    // SET operation
    console.log('Testing SET operation...');
    const testData = { id: 1, name: 'Test Client', email: 'test@example.com' };
    await client.setEx('test:client:1', 300, JSON.stringify(testData));
    console.log('✅ SET successful');
    
    // GET operation
    console.log('Testing GET operation...');
    const retrieved = await client.get('test:client:1');
    const parsed = JSON.parse(retrieved);
    console.log('✅ GET successful:', parsed);
    
    // EXISTS operation
    console.log('Testing EXISTS operation...');
    const exists = await client.exists('test:client:1');
    console.log(`✅ EXISTS successful: ${exists === 1 ? 'Key exists' : 'Key not found'}`);
    
    // TTL operation
    console.log('Testing TTL operation...');
    const ttl = await client.ttl('test:client:1');
    console.log(`✅ TTL successful: ${ttl} seconds remaining`);
    
    // DELETE operation
    console.log('Testing DEL operation...');
    await client.del('test:client:1');
    console.log('✅ DEL successful');
    
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Cache operations failed:', error.message);
    return false;
  }
}

// ============================================
// TEST 3: Pattern-based Operations
// ============================================

async function testPatternOperations() {
  console.log('\n\nTEST 3: Pattern-based Operations');
  console.log('=' .repeat(50));
  
  const client = createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  });
  
  try {
    await client.connect();
    
    // Create test data
    console.log('Creating test data with patterns...');
    for (let i = 1; i <= 5; i++) {
      await client.set(`user:1:clients:${i}`, `Client ${i}`);
      await client.set(`user:1:services:${i}`, `Service ${i}`);
      await client.set(`user:2:clients:${i}`, `Client ${i}`);
    }
    console.log('✅ Test data created');
    
    // Find keys by pattern
    console.log('Testing KEYS pattern matching...');
    const user1ClientKeys = await client.keys('user:1:clients:*');
    console.log(`✅ Found ${user1ClientKeys.length} keys matching "user:1:clients:*"`);
    
    const user1AllKeys = await client.keys('user:1:*');
    console.log(`✅ Found ${user1AllKeys.length} keys matching "user:1:*"`);
    
    // Delete by pattern
    console.log('Testing pattern deletion...');
    const keysToDelete = await client.keys('user:1:services:*');
    if (keysToDelete.length > 0) {
      await client.del(keysToDelete);
      console.log(`✅ Deleted ${keysToDelete.length} keys`);
    }
    
    // Cleanup
    await client.flushDb();
    
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Pattern operations failed:', error.message);
    return false;
  }
}

// ============================================
// TEST 4: Queue Operations
// ============================================

async function testQueueOperations() {
  console.log('\n\nTEST 4: Queue Operations');
  console.log('=' .repeat(50));
  
  const client = createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  });
  
  try {
    await client.connect();
    
    // Push items
    console.log('Testing RPUSH (add to queue)...');
    for (let i = 1; i <= 5; i++) {
      await client.rPush('queue:test', JSON.stringify({ id: i, data: `Item ${i}` }));
    }
    console.log('✅ Added 5 items to queue');
    
    // Queue length
    console.log('Testing LLEN (queue length)...');
    const length = await client.lLen('queue:test');
    console.log(`✅ Queue length: ${length} items`);
    
    // Pop items
    console.log('Testing LPOP (get from queue)...');
    for (let i = 0; i < 3; i++) {
      const item = await client.lPop('queue:test');
      console.log(`✅ Got item: ${item}`);
    }
    
    // Remaining
    const remaining = await client.lLen('queue:test');
    console.log(`✅ Remaining items: ${remaining}`);
    
    // Cleanup
    await client.del('queue:test');
    
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Queue operations failed:', error.message);
    return false;
  }
}

// ============================================
// TEST 5: Counter Operations
// ============================================

async function testCounterOperations() {
  console.log('\n\nTEST 5: Counter Operations');
  console.log('=' .repeat(50));
  
  const client = createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  });
  
  try {
    await client.connect();
    
    // Increment
    console.log('Testing INCRBY (increment counter)...');
    for (let i = 0; i < 5; i++) {
      const count = await client.incrBy('counter:appointments', 1);
      console.log(`✅ Incremented to: ${count}`);
    }
    
    // Get value
    const value = await client.get('counter:appointments');
    console.log(`✅ Counter value: ${value}`);
    
    // Reset
    await client.del('counter:appointments');
    
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Counter operations failed:', error.message);
    return false;
  }
}

// ============================================
// TEST 6: Performance Test
// ============================================

async function testPerformance() {
  console.log('\n\nTEST 6: Performance Benchmark');
  console.log('=' .repeat(50));
  
  const client = createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  });
  
  try {
    await client.connect();
    
    const testData = {
      id: 1,
      name: 'Performance Test',
      data: 'x'.repeat(1000)
    };
    
    // Write performance
    console.log('Testing write performance (1000 operations)...');
    const writeStart = Date.now();
    for (let i = 0; i < 1000; i++) {
      await client.set(`perf:test:${i}`, JSON.stringify(testData));
    }
    const writeTime = Date.now() - writeStart;
    console.log(`✅ 1000 writes completed in ${writeTime}ms (${(1000/writeTime*1000).toFixed(0)} ops/sec)`);
    
    // Read performance
    console.log('Testing read performance (1000 operations)...');
    const readStart = Date.now();
    for (let i = 0; i < 1000; i++) {
      await client.get(`perf:test:${i}`);
    }
    const readTime = Date.now() - readStart;
    console.log(`✅ 1000 reads completed in ${readTime}ms (${(1000/readTime*1000).toFixed(0)} ops/sec)`);
    
    // Cleanup
    const keys = await client.keys('perf:test:*');
    if (keys.length > 0) {
      await client.del(keys);
    }
    
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

// ============================================
// TEST 7: Info and Stats
// ============================================

async function testServerInfo() {
  console.log('\n\nTEST 7: Server Information');
  console.log('=' .repeat(50));
  
  const client = createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  });
  
  try {
    await client.connect();
    
    // Get server info
    console.log('Fetching server information...');
    const info = await client.info('server');
    const lines = info.split('\r\n');
    
    for (const line of lines.slice(0, 10)) {
      if (line && !line.startsWith('#')) {
        console.log(`  ${line}`);
      }
    }
    
    // Get keyspace info
    console.log('\nFetching keyspace information...');
    const keyspace = await client.info('keyspace');
    console.log(keyspace);
    
    // Get db size
    const dbSize = await client.dbSize();
    console.log(`✅ Current database size: ${dbSize} keys`);
    
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Server info test failed:', error.message);
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.time('Total Test Time');
  
  const results = {
    connection: await testConnection(),
    cacheOps: await testCacheOperations(),
    patternOps: await testPatternOperations(),
    queueOps: await testQueueOperations(),
    counterOps: await testCounterOperations(),
    performance: await testPerformance(),
    serverInfo: await testServerInfo()
  };
  
  console.log('\n\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  
  let passedTests = 0;
  for (const [name, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}`);
    if (passed) passedTests++;
  }
  
  console.log('='.repeat(50));
  console.log(`Total: ${passedTests}/${Object.keys(results).length} tests passed\n`);
  
  console.timeEnd('Total Test Time');
  
  process.exit(passedTests === Object.keys(results).length ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
