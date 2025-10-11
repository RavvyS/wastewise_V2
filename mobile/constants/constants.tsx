// Keys for AsyncStorage
export const USERS_KEY = '@wastewise_users_v1';
export const WASTE_KEY = '@wastewise_waste_v1';

// Sample initial data
export const SAMPLE_USERS = [
  { id: 'u1', name: 'Alice', email: 'alice@example.com' },
  { id: 'u2', name: 'Bob', email: 'bob@example.com' },
];

export const SAMPLE_WASTE = [
  {
    id: 'w1',
    category: 'Plastic',
    item: 'Juice Box',
    instructions: 'Empty liquid, rinse if possible, flatten box. Put with mixed recyclables if your region accepts juice boxes (tetra pak).',
  },
  { id: 'w2', category: 'Organic', item: 'Banana Peel', instructions: 'Compost in food waste bin or home compost.' },
  { id: 'w3', category: 'Glass', item: 'Wine Bottle', instructions: 'Rinse and place in glass recycling.' },
];
