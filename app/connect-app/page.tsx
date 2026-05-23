import type { Metadata } from 'next';
import ConnectAppPage from '@/src/views/ConnectAppPage';

export const metadata: Metadata = {
    title: 'ربط التطبيقات | Tolzy',
    description: 'مزامنة وتكامل حساباتك وتطبيقاتك الذكية مباشرة مع TOLZY Copilot لأتمتة سير العمل بالكامل.',
};

export default function Page() {
    return <ConnectAppPage />;
}
