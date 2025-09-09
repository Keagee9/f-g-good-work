import type { Service } from './types';

export const services: Service[] = [
  {
    id: 'bob-braids',
    name: 'Bob Braids',
    description:
      'Chic and timeless, our bob braids offer a stylish, low-maintenance look perfect for any occasion.',
    duration: '3 hours',
    price: 150.0,
    image: 'https://picsum.photos/600/400?random=1',
  },
  {
    id: 'knotless-braids',
    name: 'Knotless Braids',
    description:
      'Enjoy a lighter, tension-free braiding experience that protects your natural hair while looking fabulous.',
    duration: '4 hours',
    price: 200.0,
    image: 'https://picsum.photos/600/400?random=2',
  },
  {
    id: 'bohemian-braids',
    name: 'Bohemian Braids',
    description:
      'Embrace a free-spirited vibe with these effortlessly cool braids, featuring curly ends and a relaxed feel.',
    duration: '5 hours',
    price: 250.0,
    image: 'https://picsum.photos/600/400?random=3',
  },
  {
    id: 'box-braids',
    name: 'Box Braids',
    description:
      'A classic and versatile protective style. Get neat, box-parted braids that can be styled in numerous ways.',
    duration: '4 hours 30 mins',
    price: 180.0,
    image: 'https://picsum.photos/600/400?random=4',
  },
    {
    id: 'butterfly-locs',
    name: 'Butterfly Locs',
    description:
      'A distressed, bohemian style of faux locs with a unique, butterfly-like loop pattern.',
    duration: '5 hours',
    price: 220.0,
    image: 'https://picsum.photos/600/400?random=7',
  },
  {
    id: 'crochet-braids',
    name: 'Crochet Braids',
    description:
      'A quick and easy way to get a new look by crocheting hair extensions into your cornrowed hair.',
    duration: '2 hours 30 mins',
    price: 130.0,
    image: 'https://picsum.photos/600/400?random=8',
  },
  {
    id: 'stitch-braids',
    name: 'Stitch Braids',
    description:
      'A modern take on cornrows, these braids feature a unique "stitch" pattern for a sharp, clean look.',
    duration: '2 hours',
    price: 120.0,
    image: 'https://picsum.photos/600/400?random=5',
  },
  {
    id: 'cornrows',
    name: 'Cornrows',
    description:
      'A traditional and durable braided style, done close to the scalp for a sleek and lasting appearance.',
    duration: '1 hour 30 mins',
    price: 80.0,
    image: 'https://picsum.photos/600/400?random=6',
  },
];

export const availableTimes: string[] = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '04:00 PM',
];
