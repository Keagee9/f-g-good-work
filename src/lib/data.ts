import type { ServiceCategory } from './types';

export const serviceCategories: ServiceCategory[] = [
  {
    "id": "cat_braids",
    "name": "Bob Braids",
    "image": "https://tse4.mm.bing.net/th?id=OIP.0sP23MLp4sQ44J_Yp3iLiQHaHa&pid=Api&P=0&h=220",
    "variants": [
      {
        "id": "ser_small_braids",
        "name": "Small Bob Braids",
        "duration": "3 hours",
        "price": 200,
        "description": "Small, intricate bob braids for a detailed and lasting style."
      },
      {
        "id": "ser_medium_braids",
        "name": "Medium Bob Braids",
        "duration": "2.5 hours",
        "price": 180,
        "description": "Classic medium-sized bob braids, a popular and versatile choice."
      },
      {
        "id": "ser_large_braids",
        "name": "Large Bob Braids",
        "duration": "2 hours",
        "price": 160,
        "description": "Bold and beautiful large bob braids for a standout look."
      }
    ]
  },
  {
    "id": "cat_knotless",
    "name": "Knotless Braids",
    "image": "https://cdn-s.acuityscheduling.com/appointmentType-thumb-21013400.jpeg?1623343269",
    "variants": [
      {
        "id": "ser_knotless_small",
        "name": "Small Knotless Braids",
        "duration": "4 hours",
        "price": 250,
        "description": "Small and lightweight knotless braids for a natural look."
      },
      {
        "id": "ser_knotless_medium",
        "name": "Medium Knotless Braids",
        "duration": "3.5 hours",
        "price": 220,
        "description": "The perfect balance with medium knotless braids."
      },
      {
        "id": "ser_knotless_large",
        "name": "Large Knotless Braids",
        "duration": "3 hours",
        "price": 200,
        "description": "Quick and stylish large knotless braids."
      }
    ]
  },
  {
    "id": "cat_twists",
    "name": "Senegalese Twists",
    "image": "https://tse1.mm.bing.net/th?id=OIP.i-b9YhB_E5b-w8W9T7G_iAHaHa&pid=Api&P=0&h=220",
    "variants": [
      {
        "id": "ser_twists_small",
        "name": "Small Twists",
        "duration": "3.5 hours",
        "price": 230,
        "description": "Elegant and fine Senegalese twists."
      },
      {
        "id": "ser_twists_medium",
        "name": "Medium Twists",
        "duration": "3 hours",
        "price": 210,
        "description": "Classic and beautiful medium Senegalese twists."
      },
      {
        "id": "ser_twists_large",
        "name": "Large Twists",
        "duration": "2.5 hours",
        "price": 190,
        "description": "Bold and beautiful large Senegalese twists."
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
