import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking coordinator signatures in Session table...\n');

  const sessions = await prisma.session.findMany({
    include: {
      coordinator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (sessions.length === 0) {
    console.log('❌ No sessions found in database.\n');
    return;
  }

  console.log(`Found ${sessions.length} session(s):\n`);
  console.log('='.repeat(80));

  sessions.forEach((session, index) => {
    console.log(`\n${index + 1}. Session: ${session.name}`);
    console.log(`   Year/Semester: ${session.year} / Semester ${session.semester}`);
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Coordinator: ${session.coordinator?.name || 'Not assigned'}`);
    console.log(`   Coordinator Email: ${session.coordinator?.email || 'N/A'}`);
    
    if (session.coordinatorSignature) {
      console.log(`   ✅ HAS SIGNATURE`);
      console.log(`      - Type: ${session.coordinatorSignatureType || 'Unknown'}`);
      console.log(`      - Signed at: ${session.coordinatorSignedAt || 'N/A'}`);
      console.log(`      - Signature length: ${session.coordinatorSignature.length} characters`);
      
      // Check if it's valid base64
      try {
        const buffer = Buffer.from(session.coordinatorSignature, 'base64');
        console.log(`      - Decoded size: ${buffer.length} bytes`);
        console.log(`      - Status: ✅ Valid base64 format`);
      } catch (error) {
        console.log(`      - Status: ❌ Invalid base64 format`);
      }
    } else {
      console.log(`   ❌ NO SIGNATURE`);
    }
    
    console.log('   ' + '-'.repeat(76));
  });

  console.log('\n' + '='.repeat(80));
  
  const withSignature = sessions.filter(s => s.coordinatorSignature).length;
  const withoutSignature = sessions.length - withSignature;
  
  console.log('\n📊 Summary:');
  console.log(`   Total sessions: ${sessions.length}`);
  console.log(`   With signature: ${withSignature}`);
  console.log(`   Without signature: ${withoutSignature}`);
  
  if (withoutSignature > 0) {
    console.log('\n💡 To add signatures to sessions without one:');
    console.log('   1. Run: npx ts-node scripts/add-coordinator-signature.ts');
    console.log('   2. Or use API: PATCH /api/sessions/:id');
    console.log('   3. Or update database directly');
  }
  
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
