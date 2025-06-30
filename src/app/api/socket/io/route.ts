import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.io endpoint - WebSocket upgrade required',
    status: 426 
  }, { status: 426 })
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.io endpoint - WebSocket upgrade required',
    status: 426 
  }, { status: 426 })
}