import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to add coordinator signature to a session
 * This will enable the signature to appear on BLI01 PDFs
 */

// Sample signature - a simple transparent PNG signature image (base64)
// You should replace this with an actual signature image
const SAMPLE_SIGNATURE = `iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAYAAAA16j4lAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuYjBmOGJlOSwgMjAyMS8xMi8wOC0xOToxMDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wMS0xNVQxMDowMDowMCswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDEtMTVUMTA6MzA6MDBaIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTAxLTE1VDEwOjMwOjAwWiIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YWJjZGVmMTIzNDU2Nzg5MCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDphYmNkZWYxMjM0NTY3ODkwIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YWJjZGVmMTIzNDU2Nzg5MCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YWJjZGVmMTIzNDU2Nzg5MCIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xNVQxMDowMDowMCswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKFdpbmRvd3MpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv3S2fQAAAOCSURBVHic7Zq9bhNBEMd/a8dxHBKHEIkIiQZRUFBQ0VHxCjwBT0BLR0dJQUNDQwMNDQ0tUvIKvAJPQENBRUVBRUFEiUKCCCGBP+I4vr3dpeB2vXu+s+/WvoRfspLlm9nZ/e/M7M4dGEwc4AXwHvgEfAe+Af+AJtAC2kAH6Kbv24AHdNPPHaAFNIBvwE/gO/AJ+AC8BF4A+eEOcgw4AE4Dp4CjwEHgADABjANjQBaQdLIeUAOqwB/gN/AL+A6cA84DRwZ9EBlgN7AX2AfsBfYAu4CdQBHIp/0ywChgA1Z6jQE7gMPAYeAQcAA4CuwH9gC7gQLQBqrAb+AH8BX4ApwFzgCnRjHQYbEd2AccB44BJ4ATwGFgF5ADRoCRtG8e2AkcSa+TwAngOHAU2JO+bwNV4CdwCbgMXAGuAteAG8BN4BZwG7gD3AXuAfeB+8AD4CHwCHgMPAGeAs+A58AL4CXwCngNvAHeAm+Bd8B74APwEfgEfAa+AF+Bb+k1aNrAX+APcAG4CFwCLgPXgRvATeBW+v4OcBe4B9wHHgCPgCfAM+A58AJ4CbwCXgNvgLfAO+A98AH4CHwCPgNfgK/AN+A78AP4CfwC/gDVdBxDZQT4BfwGzgPngAvAReBSel0BrgI3gFvA7fT9XeAecB94ADwEngBPgefAC+Al8Ap4DbwB3gLvgPfAB+Aj8An4DHwBvgLfgO/AD+An8Av4A1TTcQwNB6gA54BzwFngDHAaOAWcBE4AJ4HjwDHgKHAEOAwcAg4CB4H9wD5gL7AH2A3sAnYCO4DtwDZgK7AF2AxsAjYCG4D1wDpgLbAGWA2sAlYCK4DlwDJgKbAEWAwsAhYCC4AFwHxgHjAXmAPMBmYBM4GZwAxgOjANmApMAaYCk4HJwCRgIjABGA+MA8YCY4DRwChgJDACGJ6OYyjkgKPAMeA4cAI4CRwCDgIHgP3APmAvsAfYDewCdgI7gO3ANmArsAXYDGwCNgIbgPXAOmAtsAZYDawCVgIrgOXAMmApsARYDCwCFgILgPnAPGAuMAeYDcwCZgIzgOnANGAqMAWYCkwGJgOTgInABGA8MA4YC4wBRgOjgJHACGA4MOwxjgKjgZHACGAEMBwYBowFxgDjgfHABGACMBGYBEwGJgNTgKnANGAaMA2YCkwBpgCTgUnAJGAiMAGYAIwHxgFjgTHAaGAUMBIYAQwHhv0HsEYnWq3FcDkAAAAASUVORK5CYII=`;

async function main() {
  console.log('🔍 Finding sessions...\n');

  // Get all sessions
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
    console.log('❌ No sessions found. Please create a session first.');
    return;
  }

  console.log(`Found ${sessions.length} session(s):\n`);
  sessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.name} (${session.year}/Semester ${session.semester})`);
    console.log(`   Coordinator: ${session.coordinator?.name || 'Not assigned'}`);
    console.log(`   Has signature: ${session.coordinatorSignature ? '✅ Yes' : '❌ No'}`);
    console.log('');
  });

  // Update the first session with a signature
  const sessionToUpdate = sessions[0];
  
  console.log(`\n📝 Adding signature to: ${sessionToUpdate.name}`);
  console.log(`   Coordinator: ${sessionToUpdate.coordinator?.name || 'Not assigned'}\n`);

  const updatedSession = await prisma.session.update({
    where: { id: sessionToUpdate.id },
    data: {
      coordinatorSignature: SAMPLE_SIGNATURE,
      coordinatorSignatureType: 'image/png',
      coordinatorSignedAt: new Date(),
    },
  });

  console.log('✅ Signature added successfully!');
  console.log(`   Session ID: ${updatedSession.id}`);
  console.log(`   Signed at: ${updatedSession.coordinatorSignedAt}`);
  console.log('\n📄 The signature will now appear on all BLI01 PDFs generated for this session.');
  console.log('\n💡 To use a real signature:');
  console.log('   1. Convert your signature image to base64');
  console.log('   2. Update the session via API: PATCH /api/sessions/:id');
  console.log('   3. Send: { "coordinatorSignature": "base64_data", "coordinatorSignatureType": "image/png" }');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
