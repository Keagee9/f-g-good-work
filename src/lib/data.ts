import type { ServiceCategory } from './types';

export const serviceCategories: ServiceCategory[] = [
  {
    "id": "cat_001",
    "name": "Bob Braids",
    "image": "https://tse4.mm.bing.net/th?id=OIP.sJg3d5WpBtc_--8gD-53rwHaJP&pid=Api&P=0&h=220",
    "variants": [
      {
        "id": "var_001",
        "name": "Small Bob Braids",
        "duration": "3 hours",
        "price": 180,
        "description": "Small, neat bob braids for a classic look."
      },
      {
        "id": "var_002",
        "name": "Medium Bob Braids",
        "duration": "2.5 hours",
        "price": 160,
        "description": "Medium-sized bob braids, a popular and stylish choice."
      },
      {
        "id": "var_003",
        "name": "Large Bob Braids",
        "duration": "2 hours",
        "price": 140,
        "description": "Large bob braids for a bold and beautiful statement."
      }
    ]
  },
  {
    "id": "cat_002",
    "name": "Knotless Braids",
    "image": "https://tse1.mm.bing.net/th?id=OIP.2s-2NCw5-23a5V7vB5D5XgHaJP&pid=Api&P=0&h=220",
    "variants": [
      {
        "id": "var_004",
        "name": "Small Knotless Braids",
        "duration": "4 hours",
        "price": 250,
        "description": "Small, lightweight knotless braids for a natural look."
      },
      {
        "id": "var_005",
        "name": "Medium Knotless Braids",
        "duration": "3.5 hours",
        "price": 220,
        "description": "Medium knotless braids, offering a balance of fullness and comfort."
      },
      {
        "id": "var_006",
        "name": "Large Knotless Braids",
        "duration": "3 hours",
        "price": 200,
        "description": "Large knotless braids for a quick and stunning transformation."
      }
    ]
  },
  {
    "id": "cat_003",
    "name": "Bohemian Braids",
    "image": "https://cdn-s.acuityscheduling.com/appointmentType-thumb-48287514.jpeg",
    "variants": [
      {
        "id": "var_007",
        "name": "Small Bohemian Braids",
        "duration": "4.5 hours",
        "price": 280,
        "description": "Small bohemian braids with curly strands for a free-spirited style."
      },
      {
        "id": "var_008",
        "name": "Medium Bohemian Braids",
        "duration": "4 hours",
        "price": 260,
        "description": "Medium bohemian braids for a perfect blend of texture and volume."
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
