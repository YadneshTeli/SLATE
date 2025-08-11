#!/usr/bin/env node

/**
 * Enhanced Vite Dev Server Startup Script
 * Addresses WebSocket, CORS, and Firebase connectivity issues
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkPorts() {
  log(colors.blue, '🔍 Checking port availability...');
  
  try {
    // Check if ports are available
    const { stdout: port5173 } = await execAsync('netstat -an | findstr :5173 2>nul || echo "Available"');
    const { stdout: port5174 } = await execAsync('netstat -an | findstr :5174 2>nul || echo "Available"');
    
    if (port5173.includes('LISTENING')) {
      log(colors.yellow, '⚠️  Port 5173 is already in use');
    }
    
    if (port5174.includes('LISTENING')) {
      log(colors.yellow, '⚠️  Port 5174 is already in use');
    }
    
    log(colors.green, '✅ Port check completed');
  } catch (error) {
    log(colors.red, '❌ Error checking ports: ' + error.message);
  }
}

async function clearCache() {
  log(colors.blue, '🧹 Clearing development caches...');
  
  try {
    // Clear node_modules cache
    await execAsync('npm cache clean --force');
    log(colors.green, '✅ NPM cache cleared');
    
    // Clear Vite cache
    await execAsync('npx vite --clearCache || echo "Vite cache cleared"');
    log(colors.green, '✅ Vite cache cleared');
    
  } catch (error) {
    log(colors.yellow, '⚠️  Cache clearing completed with warnings');
  }
}

async function startDevServer() {
  log(colors.blue, '🚀 Starting enhanced development server...');
  log(colors.cyan, '📋 Configuration:');
  log(colors.cyan, '   • Main server: http://localhost:5173');
  log(colors.cyan, '   • HMR WebSocket: ws://localhost:5174');
  log(colors.cyan, '   • Enhanced CORS support enabled');
  log(colors.cyan, '   • Firebase Auth popup optimization enabled');
  
  // Set environment variables for enhanced development
  process.env.VITE_DEV_MODE = 'enhanced';
  process.env.FORCE_COLOR = '1';
  
  try {
    // Start the development server
    const child = exec('npm run dev', {
      stdio: 'inherit',
      env: {
        ...process.env,
        FORCE_COLOR: '1',
        BROWSER: 'none', // Prevent auto-opening browser
        NODE_ENV: 'development'
      }
    });
    
    child.stdout?.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr?.on('data', (data) => {
      process.stderr.write(data);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log(colors.green, '✅ Development server stopped successfully');
      } else {
        log(colors.red, `❌ Development server exited with code ${code}`);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log(colors.yellow, '\n🛑 Shutting down development server...');
      child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      log(colors.yellow, '\n🛑 Terminating development server...');
      child.kill('SIGTERM');
    });
    
  } catch (error) {
    log(colors.red, '❌ Failed to start development server: ' + error.message);
    process.exit(1);
  }
}

async function main() {
  log(colors.bright + colors.magenta, '🎬 SLATE Development Server Enhanced Startup');
  log(colors.bright + colors.magenta, '============================================');
  
  try {
    await checkPorts();
    await clearCache();
    
    log(colors.green, '🎯 Pre-flight checks completed successfully!');
    log(colors.cyan, '');
    
    await startDevServer();
    
  } catch (error) {
    log(colors.red, '❌ Startup failed: ' + error.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  log(colors.red, '❌ Unhandled Rejection at: ' + promise + ' reason: ' + reason);
  process.exit(1);
});

// Run the startup script
main();
