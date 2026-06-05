import type { Metadata } from 'next';
import PulseFeature from './PulseFeature';

export const metadata: Metadata = {
    title: 'تفاصيل التحديث | TOLZY Pulse',
    description: 'عرض تفاصيل التحديثات والميزات الجديدة في منصة Tolzy AI.',
};

export async function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

export default function Page() {
    return <PulseFeature />;
}
