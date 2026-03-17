import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vital:', metric)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
