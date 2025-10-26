// ═══════════════════════════════════════════════════
// Health Check Endpoint for Kamal Deployment
// ═══════════════════════════════════════════════════
// Context7: https://context7.com/basecamp/kamal-site
// Pattern: Health check for zero-downtime deployments
// ═══════════════════════════════════════════════════

import { NextResponse } from 'next/server';

export async function GET() {
  // Basic health check - returns 200 if app is running
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'koperasichain',
    },
    { status: 200 }
  );
}

// Kamal will call this endpoint every 3-10 seconds
// If it returns non-200, container is considered unhealthy
