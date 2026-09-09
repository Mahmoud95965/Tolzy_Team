import { NextResponse } from 'next/server';
import { getToolsCountFromFirebase, getCategoryToolsCountFromFirebase } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache on edge for 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (category) {
      const count = await getCategoryToolsCountFromFirebase(category);
      return NextResponse.json(
        { category, count },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
          }
        }
      );
    }

    const total = await getToolsCountFromFirebase();

    return NextResponse.json(
      { total },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching tool counts:', error);
    return NextResponse.json(
      { total: 1000, error: 'Failed to fetch counts' },
      { status: 500 }
    );
  }
}
