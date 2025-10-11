#!/usr/bin/env node

/**
 * Connection Test Script for ICT AI Knowledge System
 * 
 * This script tests the connection and basic functionality of the system
 * before running more complex examples.
 */

const axios = require('axios');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

class ConnectionTester {
  constructor() {
    this.results = {
      http: false,
      websocket: false,
      database: false,
      services: {}
    };
  }

  async testHTTPConnection() {
    console.log('🔌 Testing HTTP connection...');
    
    try {
      const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log('✅ HTTP connection successful');
        this.results.http = true;
        
        const healthData = response.data;
        console.log(`   Status: ${healthData.status}`);
        console.log(`   Uptime: ${healthData.uptime}s`);
        console.log(`   Memory: ${(healthData.memory.used / 1024 / 1024).toFixed(1)} MB`);
        
        return healthData;
      }
    } catch (error) {
      console.log('❌ HTTP connection failed:', error.message);
      this.results.http = false;
      throw error;
    }
  }

  async testWebSocketConnection() {
    console.log('🔌 Testing WebSocket connection...');
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      let connected = false;
      
      const timeout = setTimeout(() => {
        if (!connected) {
          ws.close();
          console.log('❌ WebSocket connection timeout');
          this.results.websocket = false;
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);

      ws.on('open', () => {
        connected = true;
        clearTimeout(timeout);
        console.log('✅ WebSocket connection successful');
        this.results.websocket = true;
        
        // Test subscription
        ws.send(JSON.stringify({
          event: 'subscribe',
          data: { types: ['system-status'] }
        }));
        
        setTimeout(() => {
          ws.close();
          resolve();
        }, 2000);
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          console.log(`   📡 Received: ${message.event}`);
        } catch (error) {
          console.log(`   📡 Raw message: ${data.toString().substring(0, 50)}...`);
        }
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        console.log('❌ WebSocket connection failed:', error.message);
        this.results.websocket = false;
        reject(error);
      });
    });
  }

  async testDatabaseConnection() {
    console.log('🗄️  Testing database connection...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/status`);
      
      if (response.data.database && response.data.database.connected) {
        console.log('✅ Database connection successful');
        this.results.database = true;
        
        const dbInfo = response.data.database;
        console.log(`   Database: ${dbInfo.type || 'Unknown'}`);
        console.log(`   Tables: ${dbInfo.tables || 'Unknown'}`);
        
        return dbInfo;
      } else {
        throw new Error('Database not connected');
      }
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      this.results.database = false;
      throw error;
    }
  }

  async testServiceEndpoints() {
    console.log('🔧 Testing service endpoints...');
    
    const endpoints = [
      { name: 'Knowledge Graph', path: '/api/knowledge-graph/stats' },
      { name: 'AI Query', path: '/api/ai-query/status' },
      { name: 'Embeddings', path: '/api/embeddings/status' },
      { name: 'Reasoning Engine', path: '/api/reasoning/status' },
      { name: 'Validation System', path: '/api/validation/status' },
      { name: 'Training Data', path: '/api/training-data/status' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint.path}`, { timeout: 3000 });
        
        if (response.status === 200) {
          console.log(`   ✅ ${endpoint.name}: Available`);
          this.results.services[endpoint.name] = true;
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Unavailable'}`);
        this.results.services[endpoint.name] = false;
      }
    }
  }

  async testBasicFunctionality() {
    console.log('⚡ Testing basic functionality...');
    
    try {
      // Test simple query
      console.log('   🤖 Testing AI query...');
      const queryResponse = await axios.post(`${BASE_URL}/api/ai-query/process`, {
        query: "What is ICT?",
        context: { test: true }
      }, { timeout: 10000 });
      
      if (queryResponse.status === 200) {
        console.log('   ✅ AI query processing works');
      }

      // Test knowledge graph search
      console.log('   🔍 Testing knowledge graph search...');
      const searchResponse = await axios.get(`${BASE_URL}/api/knowledge-graph/search?q=liquidity&limit=1`);
      
      if (searchResponse.status === 200) {
        console.log('   ✅ Knowledge graph search works');
      }

      // Test embeddings
      console.log('   🧠 Testing embeddings generation...');
      const embeddingResponse = await axios.post(`${BASE_URL}/api/embeddings/generate`, {
        text: "test embedding"
      });
      
      if (embeddingResponse.status === 200) {
        console.log('   ✅ Embeddings generation works');
      }

    } catch (error) {
      console.log(`   ❌ Functionality test failed: ${error.message}`);
    }
  }

  async testPerformance() {
    console.log('⚡ Testing performance...');
    
    const tests = [
      {
        name: 'Health Check',
        test: () => axios.get(`${BASE_URL}/health`)
      },
      {
        name: 'Simple Query',
        test: () => axios.post(`${BASE_URL}/api/ai-query/process`, {
          query: "What is liquidity?",
          context: { performance_test: true }
        })
      },
      {
        name: 'Knowledge Search',
        test: () => axios.get(`${BASE_URL}/api/knowledge-graph/search?q=order&limit=5`)
      }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        await test.test();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`   ⏱️  ${test.name}: ${duration}ms`);
        
        if (duration > 5000) {
          console.log(`   ⚠️  ${test.name} is slow (>${duration}ms)`);
        }
      } catch (error) {
        console.log(`   ❌ ${test.name}: Failed (${error.message})`);
      }
    }
  }

  printSummary() {
    console.log('\n📊 Connection Test Summary');
    console.log('=' .repeat(40));
    
    console.log(`HTTP Connection: ${this.results.http ? '✅' : '❌'}`);
    console.log(`WebSocket Connection: ${this.results.websocket ? '✅' : '❌'}`);
    console.log(`Database Connection: ${this.results.database ? '✅' : '❌'}`);
    
    console.log('\nService Endpoints:');
    for (const [service, status] of Object.entries(this.results.services)) {
      console.log(`  ${service}: ${status ? '✅' : '❌'}`);
    }
    
    const totalServices = Object.keys(this.results.services).length;
    const workingServices = Object.values(this.results.services).filter(Boolean).length;
    
    console.log(`\nOverall Status: ${workingServices}/${totalServices} services working`);
    
    if (this.results.http && this.results.websocket && this.results.database) {
      console.log('🎉 System is ready for use!');
      return true;
    } else {
      console.log('⚠️  System has connection issues');
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting ICT AI Knowledge System Connection Tests\n');
    
    try {
      await this.testHTTPConnection();
      console.log('');
      
      await this.testWebSocketConnection();
      console.log('');
      
      await this.testDatabaseConnection();
      console.log('');
      
      await this.testServiceEndpoints();
      console.log('');
      
      await this.testBasicFunctionality();
      console.log('');
      
      await this.testPerformance();
      
      return this.printSummary();
      
    } catch (error) {
      console.log(`\n❌ Connection tests failed: ${error.message}`);
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure the server is running on port 3000');
      console.log('   2. Check if the database is connected');
      console.log('   3. Verify all services are initialized');
      console.log('   4. Check server logs for errors');
      
      this.printSummary();
      return false;
    }
  }
}

// Quick connection test function
async function quickTest() {
  console.log('⚡ Quick Connection Test');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    console.log('✅ Server is responding');
    console.log(`   Status: ${response.data.status}`);
    return true;
  } catch (error) {
    console.log('❌ Server is not responding');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    quickTest();
  } else {
    const tester = new ConnectionTester();
    tester.runAllTests().then(success => {
      process.exit(success ? 0 : 1);
    });
  }
}

module.exports = { ConnectionTester, quickTest };