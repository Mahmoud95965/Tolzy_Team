import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    // Fetch from Supabase promotions table
    const { data, error } = await supabase
      .from('promotions')
      .select('mofathy_promo_count')
      .eq('id', 1)
      .single();

    if (error || !data) {
      // Return default if table doesn't exist yet
      console.log('Promotions table not found, returning default:', error?.message);
      return NextResponse.json({
        mofathy_promo_count: 0,
        is_available: true,
        remaining_seats: 10,
        promo_code: 'MOFATHY10'
      });
    }

    const count = data.mofathy_promo_count || 0;
    const isAvailable = count < 10;
    const remainingSeats = Math.max(0, 10 - count);

    return NextResponse.json({
      mofathy_promo_count: count,
      is_available: isAvailable,
      remaining_seats: remainingSeats,
      promo_code: 'MOFATHY10',
      original_price: 299,
      promo_price: 209,
      discount_percentage: 30
    });
  } catch (error: any) {
    console.error('Error fetching promo status:', error);
    // Return safe default
    return NextResponse.json({
      mofathy_promo_count: 0,
      is_available: true,
      remaining_seats: 10,
      promo_code: 'MOFATHY10'
    });
  }
}
