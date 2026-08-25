import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('tolzy2030_promo_count')
      .eq('id', 1)
      .single();

    const count = data?.tolzy2030_promo_count || 0;
    const remainingSeats = Math.max(0, 100 - count);

    return NextResponse.json({
      promo_count: count,
      is_available: true,
      remaining_seats: remainingSeats > 0 ? remainingSeats : 50,
      promo_code: 'TOLZY2030',
      discount_percentage: 50,
      pro_original_price: 650,
      pro_promo_price: 325,
      max_original_price: 1950,
      max_promo_price: 975
    });
  } catch (error: any) {
    console.error('Error fetching promo status:', error);
    return NextResponse.json({
      promo_count: 0,
      is_available: true,
      remaining_seats: 50,
      promo_code: 'TOLZY2030',
      discount_percentage: 50,
      pro_original_price: 650,
      pro_promo_price: 325,
      max_original_price: 1950,
      max_promo_price: 975
    });
  }
}
