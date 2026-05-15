"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface TrendingPrompt {
  id: string;
  title: string;
  author_name: string;
  upvotes_count: number;
  views_count: number;
  remixes_count: number;
}

export interface DashboardCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  studentsCount: number;
  rating: number;
  instructor: string;
}

export interface DashboardStats {
  totalPrompts: number;
  totalMembers: number;
  totalCourses: number;
}

export function useDashboardData() {
  const [trending, setTrending] = useState<TrendingPrompt[]>([]);
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalPrompts: 0, totalMembers: 0, totalCourses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        // 1. Trending prompts from Supabase
        const { data: prompts } = await supabase
          .from('community_prompts')
          .select('id, title, author_name, upvotes_count, views_count, remixes_count')
          .eq('status', 'published')
          .order('engagement_score', { ascending: false })
          .limit(5);

        if (prompts) setTrending(prompts as TrendingPrompt[]);

        // 2. Stats count
        const { count: promptCount } = await supabase
          .from('community_prompts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published');

        // 3. Courses from Firestore
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'), limit(3));
        const snap = await getDocs(q);
        const fetchedCourses = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DashboardCourse[];
        setCourses(fetchedCourses);

        setStats({
          totalPrompts: promptCount || 0,
          totalMembers: 12400,
          totalCourses: snap.size,
        });
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { trending, courses, stats, loading };
}
