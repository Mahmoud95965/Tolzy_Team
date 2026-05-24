import TolzyPathDetailsPage from '@/src/views/TolzyPathDetailsPage';

export async function generateStaticParams() {
    return [{ pathId: 'placeholder' }];
}

export default function PathDetails() {
    return <TolzyPathDetailsPage />;
}
