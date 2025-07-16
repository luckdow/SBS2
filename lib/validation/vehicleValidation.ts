/**
 * Comprehensive validation utilities for vehicle form
 * Provides real-time validation with Turkish error messages
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface VehicleFormData {
  name: string;
  type: 'sedan' | 'suv' | 'van' | 'luxury';
  capacity: number;
  baggage: number;
  pricePerKm: number;
  rating: number;
  image: string;
  features: string[];
  isActive: boolean;
}

// Vehicle type constraints
const VEHICLE_TYPE_CONSTRAINTS = {
  sedan: { maxCapacity: 4, maxBaggage: 3, minPrice: 5, maxPrice: 25 },
  suv: { maxCapacity: 7, maxBaggage: 5, minPrice: 8, maxPrice: 35 },
  van: { maxCapacity: 15, maxBaggage: 10, minPrice: 12, maxPrice: 50 },
  luxury: { maxCapacity: 4, maxBaggage: 4, minPrice: 25, maxPrice: 200 }
};

/**
 * Validates vehicle name
 */
export function validateVehicleName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Araç adı gereklidir' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < 3) {
    return { isValid: false, error: 'Araç adı en az 3 karakter olmalıdır' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Araç adı en fazla 50 karakter olabilir' };
  }

  // Check for only numbers
  if (/^\d+$/.test(trimmedName)) {
    return { isValid: false, error: 'Araç adı sadece sayılardan oluşamaz' };
  }

  // Check for excessive special characters
  if (/[^a-zA-ZçÇğĞıİöÖşŞüÜ0-9\s\-\.]/g.test(trimmedName)) {
    return { isValid: false, error: 'Araç adında geçersiz karakterler var' };
  }

  // Check for professional naming
  if (/^\s*[a-zA-ZçÇğĞıİöÖşŞüÜ]/.test(trimmedName)) {
    return { isValid: true };
  }

  return { isValid: false, error: 'Araç adı geçerli bir format olmalıdır' };
}

/**
 * Validates vehicle capacity based on type
 */
export function validateCapacity(capacity: number, vehicleType: string): ValidationResult {
  if (!capacity || capacity < 1) {
    return { isValid: false, error: 'Kapasite en az 1 kişi olmalıdır' };
  }

  if (capacity > 20) {
    return { isValid: false, error: 'Kapasite en fazla 20 kişi olabilir' };
  }

  const typeConstraints = VEHICLE_TYPE_CONSTRAINTS[vehicleType as keyof typeof VEHICLE_TYPE_CONSTRAINTS];
  if (typeConstraints && capacity > typeConstraints.maxCapacity) {
    return { 
      isValid: false, 
      error: `${vehicleType.toUpperCase()} araçlar için maksimum kapasite ${typeConstraints.maxCapacity} kişidir` 
    };
  }

  return { isValid: true };
}

/**
 * Validates baggage capacity
 */
export function validateBaggage(baggage: number, capacity: number, vehicleType: string): ValidationResult {
  if (baggage < 0) {
    return { isValid: false, error: 'Bagaj kapasitesi 0\'dan küçük olamaz' };
  }

  if (baggage > 20) {
    return { isValid: false, error: 'Bagaj kapasitesi en fazla 20 olabilir' };
  }

  const typeConstraints = VEHICLE_TYPE_CONSTRAINTS[vehicleType as keyof typeof VEHICLE_TYPE_CONSTRAINTS];
  if (typeConstraints && baggage > typeConstraints.maxBaggage) {
    return { 
      isValid: false, 
      error: `${vehicleType.toUpperCase()} araçlar için maksimum bagaj ${typeConstraints.maxBaggage} adet` 
    };
  }

  // Warning if baggage is more than capacity
  if (baggage > capacity) {
    return { 
      isValid: true, 
      warning: 'Bagaj kapasitesi yolcu kapasitesinden fazla' 
    };
  }

  return { isValid: true };
}

/**
 * Validates price per km
 */
export function validatePrice(price: number, vehicleType: string): ValidationResult {
  if (!price || price <= 0) {
    return { isValid: false, error: 'Fiyat 0\'dan büyük olmalıdır' };
  }

  if (price < 1) {
    return { isValid: false, error: 'Minimum fiyat 1 ₺/km olmalıdır' };
  }

  if (price > 1000) {
    return { isValid: false, error: 'Maksimum fiyat 1000 ₺/km olabilir' };
  }

  const typeConstraints = VEHICLE_TYPE_CONSTRAINTS[vehicleType as keyof typeof VEHICLE_TYPE_CONSTRAINTS];
  if (typeConstraints) {
    if (price < typeConstraints.minPrice) {
      return { 
        isValid: false, 
        error: `${vehicleType.toUpperCase()} araçlar için minimum fiyat ${typeConstraints.minPrice} ₺/km` 
      };
    }

    if (price > typeConstraints.maxPrice) {
      return { 
        isValid: true, 
        warning: `${vehicleType.toUpperCase()} araçlar için önerilen maksimum fiyat ${typeConstraints.maxPrice} ₺/km` 
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates rating
 */
export function validateRating(rating: number): ValidationResult {
  if (!rating) {
    return { isValid: false, error: 'Puan gereklidir' };
  }

  if (rating < 1.0) {
    return { isValid: false, error: 'Minimum puan 1.0 olmalıdır' };
  }

  if (rating > 5.0) {
    return { isValid: false, error: 'Maksimum puan 5.0 olabilir' };
  }

  // Check decimal places
  if (Math.round(rating * 10) / 10 !== rating) {
    return { isValid: false, error: 'Puan en fazla 1 ondalık basamak içerebilir' };
  }

  return { isValid: true };
}

/**
 * Validates image URL
 */
export function validateImageUrl(url: string): ValidationResult {
  // Allow empty URL
  if (!url || url.trim().length === 0) {
    return { isValid: true };
  }

  const trimmedUrl = url.trim();

  // Basic URL validation
  try {
    new URL(trimmedUrl);
  } catch {
    return { isValid: false, error: 'Geçerli bir URL formatı giriniz' };
  }

  // Check if it's an image URL
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
  if (!imageExtensions.test(trimmedUrl)) {
    return { 
      isValid: true, 
      warning: 'URL\'nin resim dosyası olduğundan emin olun (.jpg, .png, .webp vb.)' 
    };
  }

  return { isValid: true };
}

/**
 * Validates features selection
 */
export function validateFeatures(features: string[]): ValidationResult {
  if (!features || features.length === 0) {
    return { isValid: false, error: 'En az bir özellik seçmelisiniz' };
  }

  if (features.length > 10) {
    return { isValid: false, error: 'En fazla 10 özellik seçebilirsiniz' };
  }

  return { isValid: true };
}

/**
 * Validates entire form
 */
export function validateVehicleForm(formData: VehicleFormData): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // Validate each field
  const nameValidation = validateVehicleName(formData.name);
  if (!nameValidation.isValid && nameValidation.error) {
    errors.name = nameValidation.error;
  }

  const capacityValidation = validateCapacity(formData.capacity, formData.type);
  if (!capacityValidation.isValid && capacityValidation.error) {
    errors.capacity = capacityValidation.error;
  }

  const baggageValidation = validateBaggage(formData.baggage, formData.capacity, formData.type);
  if (!baggageValidation.isValid && baggageValidation.error) {
    errors.baggage = baggageValidation.error;
  } else if (baggageValidation.warning) {
    warnings.baggage = baggageValidation.warning;
  }

  const priceValidation = validatePrice(formData.pricePerKm, formData.type);
  if (!priceValidation.isValid && priceValidation.error) {
    errors.pricePerKm = priceValidation.error;
  } else if (priceValidation.warning) {
    warnings.pricePerKm = priceValidation.warning;
  }

  const ratingValidation = validateRating(formData.rating);
  if (!ratingValidation.isValid && ratingValidation.error) {
    errors.rating = ratingValidation.error;
  }

  const imageValidation = validateImageUrl(formData.image);
  if (!imageValidation.isValid && imageValidation.error) {
    errors.image = imageValidation.error;
  } else if (imageValidation.warning) {
    warnings.image = imageValidation.warning;
  }

  const featuresValidation = validateFeatures(formData.features);
  if (!featuresValidation.isValid && featuresValidation.error) {
    errors.features = featuresValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitizes and formats input values
 */
export function sanitizeVehicleFormData(formData: Partial<VehicleFormData>): Partial<VehicleFormData> {
  return {
    ...formData,
    name: formData.name?.trim() || '',
    image: formData.image?.trim() || '',
    capacity: formData.capacity ? Math.round(Math.max(1, Math.min(20, formData.capacity))) : 1,
    baggage: formData.baggage ? Math.round(Math.max(0, Math.min(20, formData.baggage))) : 0,
    pricePerKm: formData.pricePerKm ? Math.round((Math.max(1, Math.min(1000, formData.pricePerKm)) * 10)) / 10 : 1,
    rating: formData.rating ? Math.round((Math.max(1, Math.min(5, formData.rating)) * 10)) / 10 : 5.0,
  };
}