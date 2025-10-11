#!/usr/bin/env node

/**
 * WebSocket Test Script for ICT AI Knowledge System
 * Tests real-time features and Supabase integration
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3000';

class WebSocketTester {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.messagesReceived = 0;
  }

  async testConnection() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Testing WebSocket connection to:', WS_URL);
      
      this.ws = new WebSocket(WS_URL);
      
      const timeout = setTimeout(() => {
        if (!this.connected) {
          console.log('❌ WebSocket connection timeout');
          this.ws.close();
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      this.ws.on('open', () => {
        this.connected = true;
        clearTimeout(timeout);
        console.log('✅ WebSocket connected successfully');
        
        // Test subscription to real-time updates
        this.subscribeToUpdates();
        
        // Wait for some messages then resolve
        setTimeout(() => {
          console.log(`📊 Received ${this.messagesReceived} messages`);
          this.ws.close();
          resolve();
        }, 5000);
      });

      this.ws.on('message', (data) => {
        this.messagesReceived++;
        try {
          const message = JSON.parse(data);
          console.log(`📡 WebSocket Event: ${message.event || 'unknown'}`);
          if (message.data) {
            console.log(`   Data:`, JSON.stringify(message.data, null, 2));
          }
        } catch (error) {
          console.log(`📡 Raw message: ${data.toString().substring(0, 100)}...`);
        }
      });

      this.ws.on('error', (error) => {
        clearTimeout(timeout);
        console.log('❌ WebSocket error:', error.message);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
      });
    });
  }

  subscribeToUpdates() {
    if (!this.ws || !this.connected) return;

    console.log('📡 Subscribing to real-time updates...');
    
    // Subscribe to various update types
    this.ws.send(JSON.stringify({
      event: 'subscribe_updates',
      data: ['knowledge-updates', 'training-progress', 'system-status']
    }));

    // Request current system status
    this.ws.send(JSON.stringify({
      event: 'request_status'
    }));
  }
}

async function main() {
  console.log('🧪 Starting WebSocket Real-time Features Test\n');
  
  const tester = new WebSocketTester();
  
  try {
    await tester.testConnection();
    console.log('\n✅ WebSocket real-time features test completed successfully');
  } catch (error) {
    console.log('\n❌ WebSocket test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = WebSocketTester;