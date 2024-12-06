import React from 'react';
import MoodsComponent from './MoodsComponent';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Moods',
  description: 'Moods',
};
export default function Moods() {
  return <MoodsComponent></MoodsComponent>;
}
