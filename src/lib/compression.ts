'use client';

import pako from 'pako';
import { ReportData } from '@/types/report';

export function compress(data: ReportData): string {
  if (typeof window === 'undefined') {
    return '';
  }
  try {
    const jsonString = JSON.stringify(data);
    const textEncoder = new TextEncoder();
    const bytes = textEncoder.encode(jsonString);
    const compressed = pako.deflate(bytes);
    
    let binaryString = '';
    for (let i = 0; i < compressed.length; i++) {
      binaryString += String.fromCharCode(compressed[i]);
    }
    
    const base64 = btoa(binaryString);
    const urlSafe = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    return encodeURIComponent(urlSafe);
  } catch (error) {
    console.error('Compression error:', error);
    return '';
  }
}

export function decompress(compressed: string): ReportData | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    if (!compressed) return null;
    
    const urlDecoded = decodeURIComponent(compressed);
    let base64 = urlDecoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const decompressed = pako.inflate(bytes);
    const text = new TextDecoder().decode(decompressed);
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Decompression error:', error);
    return null;
  }
}