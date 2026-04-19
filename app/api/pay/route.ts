import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // جلب الـ Token من الهيدر (Authorization: Bearer <token>)
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // نقوم بإرسال الطلب من الخادم لتجنب مشكلة CORS التي تظهر في المتصفح بـ Failed to fetch
        const response = await fetch('https://gateway.tolzy.me/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader, // تمرير التوكن للبوابة
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gateway Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
        
    } catch (error: any) {
        console.error('Payment Proxy Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
