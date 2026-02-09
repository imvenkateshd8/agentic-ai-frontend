const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Vercel Build Script ===');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Check for angular.json
const angularJsonPath = path.join(process.cwd(), 'angular.json');
if (fs.existsSync(angularJsonPath)) {
  console.log('✓ angular.json found at:', angularJsonPath);
} else {
  console.error('✗ angular.json NOT found');
  process.exit(1);
}

// Check for node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✓ node_modules directory exists');
} else {
  console.error('✗ node_modules NOT found');
  process.exit(1);
}

// Check for @angular/cli
const ngCliPath = path.join(process.cwd(), 'node_modules', '@angular', 'cli');
if (fs.existsSync(ngCliPath)) {
  console.log('✓ @angular/cli installed');
} else {
  console.error('✗ @angular/cli NOT found');
  process.exit(1);
}

console.log('\nRunning Angular build...');
try {
  execSync('npx ng build --configuration production', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('\n✓ Build completed successfully');
} catch (error) {
  console.error('\n✗ Build failed');
  process.exit(1);
}
