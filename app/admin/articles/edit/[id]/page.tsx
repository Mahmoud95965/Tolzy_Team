import type { Metadata } from 'next';
import EditArticleForm from './EditArticleForm';

export const metadata: Metadata = {
    title: 'تعديل المقال | لوحة التحكم',
    description: 'تعديل المقال الحالي على لوحة التحكم.',
};

export async function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

export default function Page() {
    return <EditArticleForm />;
}
