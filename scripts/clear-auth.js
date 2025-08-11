#!/usr/bin/env node

/**
 * Development script to clear authentication state
 * Run with: node scripts/clear-auth.js
 */

const fs = require('fs');
const path = require('path');

function clearAuthState() {
  console.log('🧹 Clearing authentication state...');

  // Clear Next.js cache
  const nextCacheDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextCacheDir)) {
    console.log('📁 Clearing Next.js cache...');
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
  }

  // Clear node_modules cache (optional)
  const nodeModulesCache = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(nodeModulesCache)) {
    console.log('📁 Clearing node_modules cache...');
    fs.rmSync(nodeModulesCache, { recursive: true, force: true });
  }

  console.log('✅ Authentication state cleared!');
  console.log('💡 Tips to prevent refresh token errors:');
  console.log('   - Clear browser cookies for localhost:3000');
  console.log('   - Use incognito/private browsing for testing');
  console.log('   - Restart your development server');
  console.log('   - Check that NEXT_PUBLIC_SITE_URL matches your actual URL');
}

if (require.main === module) {
  clearAuthState();
}

module.exports = { clearAuthState };
