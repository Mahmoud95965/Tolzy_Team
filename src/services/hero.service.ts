import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    setDoc,
    query,
    orderBy,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { HeroSlide } from '../types';

const COLLECTION_NAME = 'hero_slides';

export const getHeroSlides = async (): Promise<HeroSlide[]> => {
    try {
        const slidesRef = collection(db, COLLECTION_NAME);
        const q = query(slidesRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as HeroSlide[];
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        throw error;
    }
};

export const saveHeroSlide = async (slide: Omit<HeroSlide, 'id'> & { id?: string }) => {
    try {
        const slideId = slide.id || doc(collection(db, COLLECTION_NAME)).id;
        const slideRef = doc(db, COLLECTION_NAME, slideId);

        const data = {
            ...slide,
            updatedAt: serverTimestamp(),
            ...(slide.id ? {} : { createdAt: serverTimestamp() })
        };

        await setDoc(slideRef, data, { merge: true });
        return { id: slideId, ...data };
    } catch (error) {
        console.error('Error saving hero slide:', error);
        throw error;
    }
};

export const deleteHeroSlide = async (id: string) => {
    try {
        const slideRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(slideRef);
    } catch (error) {
        console.error('Error deleting hero slide:', error);
        throw error;
    }
};

export const updateSlideOrder = async (slides: HeroSlide[]) => {
    try {
        const batch = writeBatch(db);

        slides.forEach((slide, index) => {
            const slideRef = doc(db, COLLECTION_NAME, slide.id);
            batch.update(slideRef, { order: index });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error updating slide order:', error);
        throw error;
    }
};
