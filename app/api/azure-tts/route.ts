import { NextRequest, NextResponse } from 'next/server';
import { POST as handleAxiomVoice, GET as handleGetVoices } from '../axiom/voice/route';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    return handleAxiomVoice(req);
}

export async function GET() {
    return handleGetVoices();
}
