import type { ServiceCategory } from './types';

export const serviceCategories: ServiceCategory[] = [
  {
    "id": "cat_001",
    "name": "Box Braids",
    "image": "https://cdn-s.acuityscheduling.com/appointmentType-thumb-45093783.jpeg",
    "variants": [
      {
        "id": "var_001",
        "name": "Small Box Braids",
        "duration": "4 hours",
        "price": 250,
        "description": "Small, intricate box braids for a classic look."
      },
      {
        "id": "var_002",
        "name": "Medium Box Braids",
        "duration": "3 hours",
        "price": 200,
        "description": "Medium-sized box braids, a popular and versatile choice."
      },
      {
        "id": "var_003",
        "name": "Large Box Braids",
        "duration": "2.5 hours",
        "price": 180,
        "description": "Large box braids for a bold and beautiful statement."
      },
      {
        "id": "var_004",
        "name": "Jumbo Box Braids",
        "duration": "2 hours",
        "price": 150,
        "description": "Extra large, jumbo-sized box braids for a quick and stylish look."
      }
    ]
  },
  {
    "id": "cat_002",
    "name": "Knotless Braids",
    "image": "https://cdn-s.acuityscheduling.com/appointmentType-thumb-45093864.jpeg",
    "variants": [
      {
        "id": "var_005",
        "name": "Small Knotless Braids",
        "duration": "4.5 hours",
        "price": 300,
        "description": "Small, lightweight knotless braids that are gentle on your scalp."
      },
      {
        "id": "var_006",
        "name": "Medium Knotless Braids",
        "duration": "3.5 hours",
        "price": 250,
        "description": "Medium-sized knotless braids for a natural and seamless look."
      },
      {
        "id": "var_007",
        "name": "Large Knotless Braids",
        "duration": "3 hours",
        "price": 200,
        "description": "Large, beautiful knotless braids that offer style and comfort."
      },
      {
        "id": "var_008",
        "name": "Jumbo Knotless Braids",
        "duration": "2.5 hours",
        "price": 180,
        "description": "Jumbo knotless braids for a quick, pain-free, and stunning hairstyle."
      }
    ]
  },
  {
    "id": "cat_003",
    "name": "Boho/Goddess Braids",
    "image": "https://tse4.mm.bing.net/th?id=OIP.3i3bYpB0bY6I-D4bXz_iQAHaHa&pid=Api&P=0&h=220",
    "variants": [
      {
        "id": "var_009",
        "name": "Small Boho Braids",
        "duration": "4.5 hours",
        "price": 350,
        "description": "Small, bohemian-style braids with curly ends for a free-spirited look."
      },
      {
        "id": "var_010",
        "name": "Medium Boho Braids",
        "duration": "3.5 hours",
        "price": 300,
        "description": "Medium-sized boho braids that blend a chic and carefree vibe."
      },
      {
        "id": "var_011",
        "name": "Large Boho Braids",
        "duration": "3 hours",
        "price": 250,
        "description": "Large boho braids for a voluminous, textured, and stylish appearance."
      }
    ]
  },
  {
    "id": "cat_004",
    "name": "Cornrows",
    "image": "https://tse1.mm.bing.net/th?id=OIP.f-4X-V3TIEp-rq0k-f1pCwHaHa&pid=Api&rs=1&c=1&qlt=95&w=121&h=121",
    "variants": [
      {
        "id": "var_012",
        "name": "Small Feed-in Cornrows",
        "duration": "3 hours",
        "price": 180,
        "description": "Small, neat feed-in cornrows for a sleek and intricate style."
      },
      {
        "id": "var_013",
        "name": "Medium Feed-in Cornrows",
        "duration": "2 hours",
        "price": 150,
        "description": "Medium-sized feed-in cornrows that are both stylish and practical."
      },
      {
        "id": "var_014",
        "name": "Large Feed-in Cornrows",
        "duration": "1.5 hours",
        "price": 120,
        "description": "Large feed-in cornrows for a quick and bold look."
      },
      {
        "id": "var_015",
        "name": "Lemonade Braids",
        "duration": "3 hours",
        "price": 200,
        "description": "Stylish side-swept cornrows inspired by Beyoncé's 'Lemonade'."
      }
    ]
  }
];

export const availableTimes: string[] = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
];
