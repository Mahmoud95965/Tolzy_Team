import type { Metadata } from 'next';
import ChangelogFeature from './ChangelogFeature';

export const metadata: Metadata = {
    title: 'تفاصيل التحديث | Tolzy Changelog',
    description: 'عرض تفاصيل التحديثات والميزات الجديدة في منصة Tolzy.',
};

export async function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

export default function Page() {
    return <ChangelogFeature />;
}
