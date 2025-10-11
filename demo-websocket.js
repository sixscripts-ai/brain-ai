#!/usr/bin/env node

/**
 * Live WebSocket Demo for ICT AI Knowledge System
 */

const WebSocket = require('ws');

console.log('🔌 Connecting to WebSocket at ws://localhost:3000...');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
  console.log('✅ Connected to ICT AI Knowledge System WebSocket!');
  console.log('📡 Subscribing to real-time updates...\n');
  
  // Subscribe to updates
  ws.send(JSON.stringify({
    event: 'subscribe_updates',
    data: ['knowledge-updates', 'system-status', 'training-progress']
  }));
  
  // Request system status
  ws.send(JSON.stringify({
    event: 'request_status'
  }));
});

ws.on('message', function message(data) {
  try {
    const msg = JSON.parse(data);
    console.log(`📡 [${new Date().toLocaleTimeString()}] Event: ${msg.event || 'unknown'}`);
    if (msg.data) {
      console.log('   Data:', JSON.stringify(msg.data, null, 2));
    }
    console.log('');
  } catch (error) {
    console.log(`📡 Raw message: ${data.toString()}`);
  }
});

ws.on('error', function error(err) {
  console.log('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
});

// Keep alive for 10 seconds
setTimeout(() => {
  console.log('⏰ Demo complete, closing connection...');
  ws.close();
}, 10000);