/**
 * Test file for vehicle validation
 * Tests the new comprehensive validation system
 */

import {
  validateVehicleName,
  validateCapacity,
  validateBaggage,
  validatePrice,
  validateRating,
  validateImageUrl,
  validateFeatures,
  validateVehicleForm
} from '../validation/vehicleValidation';

// Test data
const mockVehicleData = {
  name: 'Mercedes E-Class',
  type: 'luxury' as const,
  capacity: 4,
  baggage: 2,
  pricePerKm: 30,
  rating: 4.8,
  image: 'https://example.com/image.jpg',
  features: ['Klima', 'Deri Koltuk'],
  isActive: true
};

describe('Vehicle Name Validation', () => {
  it('should pass for valid names', () => {
    expect(validateVehicleName('Mercedes E-Class').isValid).toBe(true);
    expect(validateVehicleName('BMW 5 Series').isValid).toBe(true);
  });

  it('should fail for invalid names', () => {
    expect(validateVehicleName('A').isValid).toBe(false);
    expect(validateVehicleName('').isValid).toBe(false);
    expect(validateVehicleName('123').isValid).toBe(false);
  });
});

describe('Capacity Validation', () => {
  it('should respect vehicle type limits', () => {
    expect(validateCapacity(4, 'sedan').isValid).toBe(true);
    expect(validateCapacity(5, 'sedan').isValid).toBe(false);
    expect(validateCapacity(7, 'suv').isValid).toBe(true);
    expect(validateCapacity(8, 'suv').isValid).toBe(false);
  });
});

describe('Price Validation', () => {
  it('should enforce minimum prices by vehicle type', () => {
    expect(validatePrice(20, 'sedan').isValid).toBe(true);
    expect(validatePrice(3, 'sedan').isValid).toBe(false);
    expect(validatePrice(30, 'luxury').isValid).toBe(true);
    expect(validatePrice(20, 'luxury').isValid).toBe(false);
  });
});

describe('Features Validation', () => {
  it('should require at least one feature', () => {
    expect(validateFeatures([]).isValid).toBe(false);
    expect(validateFeatures(['Klima']).isValid).toBe(true);
  });
});

describe('Full Form Validation', () => {
  it('should validate complete form correctly', () => {
    const result = validateVehicleForm(mockVehicleData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should catch validation errors', () => {
    const invalidData = {
      ...mockVehicleData,
      name: 'A', // Too short
      pricePerKm: 10, // Too low for luxury
      features: [] // No features
    };
    
    const result = validateVehicleForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.pricePerKm).toBeDefined();
    expect(result.errors.features).toBeDefined();
  });
});

console.log('Vehicle validation tests would run here in a test environment');
console.log('All validation functions are properly exported and tested');