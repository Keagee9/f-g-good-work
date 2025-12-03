
import type { ServiceCategory } from './types';

export const serviceCategories: ServiceCategory[] = [
  {
    "id": "cat_01",
    "name": "Box Braids",
    "image": "https://cdn-s.acuityscheduling.com/images/1.439.46933560/1688686121544-1688686121544.jpeg?1690509600000",
    "variants": [
      {
        "id": "serv_01",
        "name": "Small Box Braids",
        "duration": "4 hours",
        "price": 250,
        "description": "Small, intricate box braids for a classic look."
      },
      {
        "id": "serv_02",
        "name": "Medium Box Braids",
        "duration": "3 hours",
        "price": 200,
        "description": "Medium-sized box braids, a versatile and popular choice."
      },
      {
        "id": "serv_03",
        "name": "Large Box Braids",
        "duration": "2 hours",
        "price": 150,
        "description": "Large box braids for a bold, statement look."
      }
    ]
  },
  {
    "id": "cat_02",
    "name": "Knotless Braids",
    "image": "https://cdn-s.acuityscheduling.com/images/1.439.46933560/1688686186419-1688686186419.jpeg?1690509600000",
    "variants": [
      {
        "id": "serv_04",
        "name": "Small Knotless Braids",
        "duration": "5 hours",
        "price": 300,
        "description": "Small, seamless knotless braids for a natural finish."
      },
      {
        "id": "serv_05",
        "name": "Medium Knotless Braids",
        "duration": "4 hours",
        "price": 250,
        "description": "Medium knotless braids, offering comfort and style."
      },
      {
        "id": "serv_06",
        "name": "Large Knotless Braids",
        "duration": "3 hours",
        "price": 200,
        "description": "Large, comfortable knotless braids with a modern appeal."
      }
    ]
  },
  {
    "id": "cat_03",
    "name": "Cornrows",
    "image": "https://tse4.mm.bing.net/th?id=OIP.iFmUDJp1h19f4a_SZuL-EwHaJQ&pid=Api&P=0&h=220",
    "variants": [
      {
        "id": "serv_07",
        "name": "Basic Cornrows",
        "duration": "1 hour",
        "price": 80,
        "description": "Simple and clean straight-back cornrows."
      },
      {
        "id": "serv_08",
        "name": "Designer Cornrows",
        "duration": "2 hours",
        "price": 120,
        "description": "Intricate and custom-designed cornrow styles."
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
