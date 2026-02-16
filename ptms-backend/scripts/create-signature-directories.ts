import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to create necessary directories for signature uploads
 */

const directories = [
  './uploads',
  './uploads/signatures',
  './uploads/documents',
];

console.log('🔧 Creating signature upload directories...\n');

directories.forEach((dir) => {
  const fullPath = path.resolve(__dirname, '..', dir);
  
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  } else {
    console.log(`✓ Already exists: ${dir}`);
  }
});

console.log('\n✨ All directories ready for signature uploads!');
console.log('\nYou can now upload signature images via the API endpoints:');
console.log('  - POST /api/applications/:id/upload-signature (Student)');
console.log('  - POST /api/applications/:id/upload-supervisor-signature (Supervisor)');
console.log('  - POST /api/sessions/:id/upload-coordinator-signature (Coordinator)');
