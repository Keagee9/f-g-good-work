import type { ServiceCategory } from './types';

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'bob-braids',
    name: 'Bob Braids',
    image: 'https://v0-hair-salon-website-design-six.vercel.app/images/bob.png',
    variants: [
      { id: 'bob-s', name: 'Bob Braids Small size', duration: '5 hours', price: 350.0, description: 'hair included' },
      { id: 'bob-m', name: 'Bob Braids Medium size', duration: '4 hours', price: 300.0, description: 'hair included.' },
      { id: 'bob-l', name: 'Bob Braids Large size', duration: '3 hours', price: 200.0, description: 'Hair included.' },
    ],
  },
  {
    id: 'bohemian-braids',
    name: 'Bohemian Braids',
    image: 'https://v0-hair-salon-website-design-six.vercel.app/images/boham.png',
    variants: [
      { id: 'bohemian-s', name: 'Bohemian Knotless Braids, Small Size.', duration: '5 hours', price: 350.0, description: 'Hair is Included' },
      { id: 'bohemian-m', name: 'Bohemian Knotless Braids, Medium Size.', duration: '4 hours', price: 280.0, description: 'Hair is Included' },
      { id: 'bohemian-l', name: 'Bohemian Knotless Braids, Large Size.', duration: '3 hours', price: 200.0, description: 'Hair is included.' },
      { id: 'bohemian-bob-s', name: 'Bohemian knotless braids Bob small size', duration: '5 hours', price: 370.0, description: 'hair is concluded' },
      { id: 'bohemian-bob-m', name: 'Bohemian knotless braids Bob medium size', duration: '4 hours', price: 280.0, description: 'hair is concluded' },
    ],
  },
  {
    id: 'box-braids',
    name: 'Box Braids',
    image: 'https://cdn-s.acuityscheduling.com/appointmentType-47890745.jpeg?1695331006',
    variants: [
      { id: 'box-s', name: 'Box Braid, Small Size.', duration: '5 hours', price: 350.0, description: 'Hair is Included' },
      { id: 'box-m', name: 'Box Braid, Medium Size.', duration: '4 hours', price: 280.0, description: 'Hair is Included.' },
      { id: 'box-l', name: 'Box Braid, Large Size, Hair Included.', duration: '3 hours', price: 200.0, description: '' },
    ],
  },
  {
    id: 'butterfly-locs',
    name: 'Butterfly Locs',
    image: 'https://cdn-s.acuityscheduling.com/appointmentType-47892318.jpeg?1695331296',
    variants: [
      { id: 'distressed-s', name: 'Distressed Locks Small Size.', duration: '4 hours 30 minutes', price: 320.0, description: 'Hair is not included.' },
      { id: 'distressed-m', name: 'Distressed Locks Medium Size.', duration: '3 hours 30 minutes', price: 280.0, description: 'Hair is not included' },
      { id: 'butterfly-bob-s', name: 'butterfly locks (bob) Small Size.', duration: '5 hours', price: 350.0, description: 'Hair is not included' },
      { id: 'butterfly-bob-m', name: 'Butterfly locks (bob) Medium Size.', duration: '4 hours', price: 280.0, description: 'Hair is not included' },
      { id: 'butterfly-bob-l', name: 'Butterfly locks (bob) Large Size.', duration: '3 hours', price: 180.0, description: 'Hair is not Included' },
      { id: 'loc-extensions', name: 'Loc extensions', duration: '4 hours', price: 200.0, description: '' },
    ],
  },
  {
    id: 'crochet-braids',
    name: 'Crochet Braids',
    image: 'https://picsum.photos/600/400?random=8',
    variants: [
      { id: 'crochet', name: 'Crochet Braids', duration: '2 hours', price: 150.0, description: 'Hair is not included' },
    ],
  },
  {
    id: 'feed-in-ponytail',
    name: 'Feed In Ponytail',
    image: 'https://picsum.photos/600/400?random=9',
    variants: [
        { id: 'pony-xs', name: 'PonyTail Feed in Braids Extra small', duration: '5 hours 30 minutes', price: 350.0, description: 'hair is included' },
        { id: 'pony-s', name: 'PonyTail Feed in Braids small', duration: '5 hours', price: 350.0, description: 'Hair is Included' },
        { id: 'pony-m', name: 'PonyTail Feed in Braids Medium', duration: '4 hours', price: 280.0, description: 'Hair is Included' },
        { id: 'pony-l', name: 'PonyTail Feed in Braids Large (Stitch)', duration: '3 hours', price: 200.0, description: 'Hair is Included.' },
    ]
  },
  {
    id: 'fulani-braid',
    name: 'Fulani Braid',
    image: 'https://picsum.photos/600/400?random=10',
    variants: [
      { id: 'fulani-m', name: 'Tribe Braids (Fulani braids) medium size', duration: '4 hours 30 minutes', price: 280.0, description: 'Hair Included' },
      { id: 'fulani-s', name: 'Tribe Braids (Fulani braids) small size', duration: '5 hours', price: 350.0, description: 'Hair Included' },
    ],
  },
  {
    id: 'goddess-braids',
    name: 'Goddess Braids',
    image: 'https://picsum.photos/600/400?random=11',
    variants: [
      { id: 'goddess-2', name: 'Goddes Braids (2Braids)', duration: '1 hour', price: 70.0, description: 'hair is included' },
    ],
  },
  {
    id: 'individual-crochet-locs',
    name: 'Individual crochet locs',
    image: 'https://picsum.photos/600/400?random=12',
    variants: [
      { id: 'ind-crochet', name: 'Individual Crochets Locks', duration: '4 hours', price: 280.0, description: 'Hair is not incuded' },
    ],
  },
  {
    id: 'knotless-braids',
    name: 'Knotless Braids',
    image: 'https://picsum.photos/600/400?random=2',
    variants: [
        { id: 'french-braids', name: 'French braids', duration: '6 hours', price: 500.0, description: 'Hair is included' },
        { id: 'knotless-s', name: 'Knotless braids small size', duration: '5 hours', price: 350.0, description: 'Hair is included.' },
        { id: 'knotless-m', name: 'Knotless Braid Medium Size.', duration: '4 hours', price: 280.0, description: 'Hair is Included.' },
        { id: 'knotless-l', name: 'Knotless Braid Large Size', duration: '3 hours 30 minutes', price: 200.0, description: 'Hair included' },
        { id: 'knotless-tri-s', name: 'knotless Braid Triangle part, Small Size', duration: '5 hours', price: 370.0, description: 'Hair Included.' },
        { id: 'knotless-tri-m', name: 'knotless Braid Triangle part, Medium Size', duration: '4 hours', price: 300.0, description: 'Hair Included.' },
        { id: 'knotless-tri-l', name: 'knotless Braid Triangle part, Large Size', duration: '3 hours', price: 200.0, description: 'Hair Included.' },
    ],
  },
  {
    id: 'lemonade-braids',
    name: 'Lemonade Braids',
    image: 'https://picsum.photos/600/400?random=18',
    variants: [
        { id: 'lemonade', name: 'Lemonade braids', duration: '4 hours', price: 250.0, description: 'hair is included' },
    ]
  },
  {
    id: 'senegalese-twist',
    name: 'Senegalese Twist',
    image: 'https://picsum.photos/600/400?random=14',
    variants: [
        { id: 'island-m', name: 'Island twist medium size', duration: '5 hours', price: 300.0, description: 'Hair is included, if you want human hair for the bohemian is $100 extra or you can bring your own hair.' },
        { id: 'island-s', name: 'Island twist small size', duration: '6 hours', price: 400.0, description: 'Hair is included, if you want human hair for the bohemian is $100 extra or you can bring your own hair.' },
        { id: 'island-l', name: 'Island twist large size', duration: '3 hours', price: 250.0, description: 'Hair is included, if you want human hair for the bohemian is $100 extra or you can bring your own hair' },
        { id: 'senegalese-s', name: 'Senegalese Twist Small', duration: '5 hours', price: 350.0, description: 'Hair Included.' },
        { id: 'senegalese-m', name: 'Senegalese Twist Medium', duration: '4 hours', price: 280.0, description: 'Hair Included.' },
        { id: 'senegalese-l', name: 'Senegalese Twist Large.', duration: '3 hours', price: 200.0, description: 'Hair Included' },
        { id: 'micro-twist', name: 'Micro twist', duration: '12 hours', price: 1000.0, description: '' },
    ],
  },
  {
    id: 'sew-in',
    name: 'Sew-In',
    image: 'https://picsum.photos/600/400?random=15',
    variants: [
      { id: 'sew-in-closure', name: 'Sew-in (Closure)', duration: '2 hours', price: 180.0, description: 'Hair is not included' },
      { id: 'sew-in-leave-out', name: 'Sew-in (Leave Out)', duration: '2 hours', price: 150.0, description: 'Hair is not Included.' },
    ],
  },
  {
    id: 'stitch-braids',
    name: 'Stitch Braids',
    image: 'https://picsum.photos/600/400?random=5',
    variants: [
        { id: 'stitch-12', name: 'Stitch Braids (12 Braids)', duration: '3 hours', price: 180.0, description: 'Hair Included' },
        { id: 'stitch-8', name: 'Stitch Braids (8 Braids)', duration: '2 hours', price: 150.0, description: 'Hair Included' },
        { id: 'stitch-6', name: 'Stitch Braids (6 Braids)', duration: '1 hour 30 minutes', price: 135.0, description: 'Hair Included' },
        { id: 'stitch-s', name: 'Stitch Braid Small', duration: '3 hours 30 minutes', price: 250.0, description: 'Hair is included.' },
    ],
  },
  {
    id: 'take-down',
    name: 'Take Down',
    image: 'https://picsum.photos/600/400?random=19',
    variants: [
        { id: 'takedown-s', name: 'Take Downs (small knotless braids/bohemian knotless braids )', duration: '2 hours', price: 100.0, description: '' },
        { id: 'takedown-m', name: 'Take Downs (medium knotless braids/bohemian knotless braids )', duration: '1 hour', price: 70.0, description: '' },
        { id: 'takedown-l', name: 'Take Downs (lager knotless braids)', duration: '30 minutes', price: 50.0, description: '' },
        { id: 'takedown-locs-s', name: 'Take Downs (locs small size)', duration: '1 hour', price: 80.0, description: '' },
        { id: 'takedown-locs-m', name: 'Take Downs (locs medium size)', duration: '30 minutes', price: 60.0, description: '' },
    ]
  },
  {
    id: 'touch-up',
    name: 'Touch up',
    image: 'https://picsum.photos/600/400?random=16',
    variants: [
      { id: 'touch-up', name: 'Touch up', duration: '2 hours', price: 100.0, description: 'only two rolls in the front, and one roll at the back.' },
    ],
  },
  {
    id: 'passion-twists',
    name: 'Passion Twists',
    image: 'https://picsum.photos/600/400?random=13',
    variants: [
      { id: 'passion-s', name: 'passion twists small size', duration: '5 hours', price: 350.0, description: 'Hair is not included' },
      { id: 'passion-m', name: 'passion twists medium size', duration: '4 hours', price: 250.0, description: 'Hair is not included' },
      { id: 'passion-l', name: 'passion twists large', duration: '3 hours', price: 200.0, description: 'Hair is not included' },
    ],
  },
  {
    id: 'wig-install',
    name: 'Wig Install',
    image: 'https://picsum.photos/600/400?random=17',
    variants: [
      { id: 'wig-install', name: 'wig install', duration: '2 hours', price: 100.0, description: '' },
    ],
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
