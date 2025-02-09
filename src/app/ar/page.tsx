import { redirect } from 'next/navigation';

export default function Home() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  redirect(`${base}/ar/grader`);
}