#!/usr/bin/env ts-node

import { SupabaseDatabaseService } from '../services/supabase-database';
import { TrainingDataGenerator } from '../services/training-data-generator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting ICT Training Data Generation...');
  
  try {
    // Initialize services
    const db = new SupabaseDatabaseService();
    const generator = new TrainingDataGenerator(db);
    
    // Check database health
    const isHealthy = await db.healthCheck();
    if (!isHealthy) {
      throw new Error('Database health check failed. Please ensure the ICT database is properly set up.');
    }
    
    console.log('✅ Database connection verified');
    
    // Generate all training datasets
    await generator.generateAllTrainingData();
    
    // Generate summary report
    await generator.generateSummaryReport();
    
    console.log('🎉 Training data generation completed successfully!');
    console.log('📁 Check the exports/training-data directory for all generated files');
    
    // Close database connection
    await db.close();
    
  } catch (error) {
    console.error('❌ Error generating training data:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { main };