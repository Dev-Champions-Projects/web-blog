import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({ success: true, timestamp: Date.now() })
}
