export interface RestaurantType {
  id: string;
  name: string;
  image: string;
  rating: string;
  time: string;
  price: string;
  discount: string;
  cuisine: string;
}

export const popularRestaurants: RestaurantType[] = [
  {
    id: 'res_1', // Maps to res_1 in DB
    name: 'Ishtaa Pure Veg',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop',
    rating: '4.7',
    time: '25-35 mins',
    price: '₹250 for one',
    discount: '20% off on first order',
    cuisine: 'North Indian, Jain Specials',
  },
  {
    id: 'res_2', // Maps to res_2 in DB
    name: 'Jain Bhoj',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=300&auto=format&fit=crop',
    rating: '4.8',
    time: '30-40 mins',
    price: '₹200 for one',
    discount: 'Free delivery above ₹299',
    cuisine: 'Authentic Jain Food',
  },
  {
    id: 'res_3', // Maps to res_3 in DB
    name: 'Sattvik Kitchen',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=300&auto=format&fit=crop',
    rating: '4.6',
    time: '35-45 mins',
    price: '₹180 for one',
    discount: 'Pure Satvik Diet',
    cuisine: 'No Onion, No Garlic Veg',
  },
  {
    id: 'res_4', // Maps to res_4 in DB
    name: 'Green Garden Bowls',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=300&auto=format&fit=crop',
    rating: '4.5',
    time: '20-30 mins',
    price: '₹220 for one',
    discount: '15% off above ₹400',
    cuisine: 'Healthy Bowls, Salads',
  },
  {
    id: 'res_5', // Maps to res_5 in DB
    name: 'Organic Roots',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop',
    rating: '4.9',
    time: '40-55 mins',
    price: '₹300 for one',
    discount: 'Zero Pesticides',
    cuisine: 'Farm-to-Table Organic',
  },
  {
    id: 'res_6', // Maps to res_6 in DB
    name: 'Prasadam Bhavan',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=300&auto=format&fit=crop',
    rating: '4.9',
    time: '30-45 mins',
    price: '₹120 for one',
    discount: 'Blessed food, pure & divine',
    cuisine: 'Temple-style Prasadam',
  },
  {
    id: 'res_7', // Maps to res_7 in DB
    name: 'Vrinda Veg Express',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=300&auto=format&fit=crop',
    rating: '4.3',
    time: '20-30 mins',
    price: '₹160 for one',
    discount: '10% off for repeats',
    cuisine: 'North Indian Thalis & Curries',
  },
  {
    id: 'res_8', // Maps to res_8 in DB
    name: 'Ayur Kitchen',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=300&auto=format&fit=crop',
    rating: '4.7',
    time: '35-50 mins',
    price: '₹280 for one',
    discount: 'Ayurvedic Principles',
    cuisine: 'Nourishing Veg, No Maida',
  }
];

export const getRestaurantDetails = (id: string) => {
  const defaultRestaurant = {
    id: id || 'unknown',
    name: 'VegDash Restaurant',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop',
    rating: '4.5',
    cuisine: 'Vegetarian'
  };
  return popularRestaurants.find(r => r.id === id) || defaultRestaurant;
};

export interface ReviewType {
  id: number;
  name: string;
  rating: number;
  date: string;
  avatar: string;
  comment: string;
  restaurantId: string;
}

export const mockReviews: ReviewType[] = [
  {
    id: 1,
    name: 'Aarav Mehta',
    rating: 5,
    date: '2026-06-10',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
    comment: 'The food from Ishtaa was incredibly pure and delicious. The Jain Dal Makhani was cooked perfectly without onion or garlic!',
    restaurantId: 'res_1'
  },
  {
    id: 2,
    name: 'Ananya Sharma',
    rating: 4.5,
    date: '2026-06-12',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    comment: 'Fast delivery and excellent packaging. Sambar was hot and idlis were super soft.',
    restaurantId: 'res_1'
  },
  {
    id: 3,
    name: 'Rahul Verma',
    rating: 5,
    date: '2026-06-14',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    comment: 'Finally a 100% vegetarian food app. The Satvik meals are amazing for daily orders.',
    restaurantId: 'res_2'
  },
  {
    id: 4,
    name: 'Pooja Hegde',
    rating: 4,
    date: '2026-06-15',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    comment: 'Loved the Jain special biryani. Highly recommended for family events.',
    restaurantId: 'res_2'
  },
  {
    id: 5,
    name: 'Karan Malhotra',
    rating: 5,
    date: '2026-06-16',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
    comment: 'Authentic taste, pure and organic ingredients. The dal khichdi was so soothing.',
    restaurantId: 'res_3'
  },
  {
    id: 6,
    name: 'Diya Sen',
    rating: 4.5,
    date: '2026-06-16',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    comment: 'The salad bowl was super fresh and healthy. Love the packaging too!',
    restaurantId: 'res_4'
  }
];

