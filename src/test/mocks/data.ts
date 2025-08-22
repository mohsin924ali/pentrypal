/**
 * Mock data factories for testing
 */

import { faker } from '@faker-js/faker';

// User mock data
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  displayName: faker.person.fullName(),
  avatar: faker.image.avatar(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  preferences: {
    theme: 'light',
    notifications: true,
    language: 'en',
  },
  ...overrides,
});

// Shopping List mock data
export const createMockShoppingList = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.department(),
  description: faker.lorem.sentence(),
  ownerId: faker.string.uuid(),
  collaborators: [],
  items: [],
  categories: [],
  status: 'active',
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

// Shopping Item mock data
export const createMockShoppingItem = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  quantity: faker.number.int({ min: 1, max: 10 }),
  unit: faker.helpers.arrayElement(['pcs', 'kg', 'lbs', 'liters', 'bottles']),
  category: {
    id: faker.string.uuid(),
    name: faker.commerce.department(),
    color: faker.internet.color(),
  },
  completed: faker.datatype.boolean(),
  price: parseFloat(faker.commerce.price()),
  notes: faker.lorem.sentence(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

// Pantry Item mock data
export const createMockPantryItem = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  quantity: faker.number.int({ min: 1, max: 20 }),
  unit: faker.helpers.arrayElement(['pcs', 'kg', 'lbs', 'liters', 'bottles']),
  category: {
    id: faker.string.uuid(),
    name: faker.commerce.department(),
    color: faker.internet.color(),
  },
  expiryDate: faker.date.future(),
  location: faker.helpers.arrayElement([
    'Fridge',
    'Pantry',
    'Freezer',
    'Cabinet',
  ]),
  minimumStock: faker.number.int({ min: 1, max: 5 }),
  barcode: faker.string.numeric(12),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

// Collaborator mock data
export const createMockCollaborator = (overrides: Partial<any> = {}) => ({
  userId: faker.string.uuid(),
  listId: faker.string.uuid(),
  role: faker.helpers.arrayElement(['owner', 'editor', 'viewer']),
  permissions: ['read', 'write'],
  invitedAt: faker.date.past(),
  acceptedAt: faker.date.recent(),
  ...overrides,
});

// Category mock data
export const createMockCategory = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.department(),
  color: faker.internet.color(),
  icon: faker.helpers.arrayElement(['🥬', '🥛', '🍞', '🥩', '🧴']),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

// API Response mock data
export const createMockApiResponse = <T>(
  data: T,
  overrides: Partial<any> = {},
) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  ...overrides,
});

// Error mock data
export const createMockError = (overrides: Partial<any> = {}) => ({
  message: faker.lorem.sentence(),
  code: faker.helpers.arrayElement([
    'NETWORK_ERROR',
    'VALIDATION_ERROR',
    'AUTH_ERROR',
  ]),
  status: faker.helpers.arrayElement([400, 401, 403, 404, 500]),
  ...overrides,
});

// Mock arrays generators
export const createMockUsers = (count: number = 5) =>
  Array.from({ length: count }, () => createMockUser());

export const createMockShoppingLists = (count: number = 3) =>
  Array.from({ length: count }, () => createMockShoppingList());

export const createMockShoppingItems = (count: number = 10) =>
  Array.from({ length: count }, () => createMockShoppingItem());

export const createMockPantryItems = (count: number = 15) =>
  Array.from({ length: count }, () => createMockPantryItem());

export const createMockCollaborators = (count: number = 3) =>
  Array.from({ length: count }, () => createMockCollaborator());
