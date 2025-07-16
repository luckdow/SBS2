import { useState, useCallback, useEffect } from 'react';
import { 
  validateVehicleName, 
  validateCapacity, 
  validateBaggage, 
  validatePrice, 
  validateRating, 
  validateImageUrl, 
  validateFeatures,
  validateVehicleForm,
  sanitizeVehicleFormData,
  type VehicleFormData,
  type ValidationResult
} from '../../lib/validation/vehicleValidation';

interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
  touched: boolean;
}

interface UseVehicleFormValidationProps {
  initialData?: Partial<VehicleFormData>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useVehicleFormValidation({
  initialData = {},
  validateOnChange = true,
  validateOnBlur = true
}: UseVehicleFormValidationProps = {}) {
  
  // Form data state
  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    type: 'sedan',
    capacity: 4,
    baggage: 2,
    pricePerKm: 8,
    rating: 5.0,
    image: '',
    features: [],
    isActive: true,
    ...initialData
  });

  // Validation state for each field
  const [validationState, setValidationState] = useState<Record<string, FieldValidation>>({
    name: { isValid: false, touched: false },
    capacity: { isValid: true, touched: false },
    baggage: { isValid: true, touched: false },
    pricePerKm: { isValid: true, touched: false },
    rating: { isValid: true, touched: false },
    image: { isValid: true, touched: false },
    features: { isValid: false, touched: false }
  });

  // Form-level validation state
  const [isFormValid, setIsFormValid] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formWarnings, setFormWarnings] = useState<Record<string, string>>({});

  // Validate individual field
  const validateField = useCallback((fieldName: string, value: any): FieldValidation => {
    let validation: ValidationResult = { isValid: true };

    switch (fieldName) {
      case 'name':
        validation = validateVehicleName(value);
        break;
      case 'capacity':
        validation = validateCapacity(value, formData.type);
        break;
      case 'baggage':
        validation = validateBaggage(value, formData.capacity, formData.type);
        break;
      case 'pricePerKm':
        validation = validatePrice(value, formData.type);
        break;
      case 'rating':
        validation = validateRating(value);
        break;
      case 'image':
        validation = validateImageUrl(value);
        break;
      case 'features':
        validation = validateFeatures(value);
        break;
      default:
        break;
    }

    return {
      isValid: validation.isValid,
      error: validation.error,
      warning: validation.warning,
      touched: true
    };
  }, [formData.type, formData.capacity]);

  // Update field value and validate
  const updateField = useCallback((fieldName: string, value: any) => {
    // Sanitize the value
    const sanitizedData = sanitizeVehicleFormData({ [fieldName]: value });
    const sanitizedValue = sanitizedData[fieldName as keyof VehicleFormData] ?? value;

    // Update form data
    setFormData(prev => ({ ...prev, [fieldName]: sanitizedValue }));

    // Validate if enabled
    if (validateOnChange) {
      const fieldValidation = validateField(fieldName, sanitizedValue);
      setValidationState(prev => ({
        ...prev,
        [fieldName]: fieldValidation
      }));
    }
  }, [validateField, validateOnChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    if (validateOnBlur) {
      const currentValue = formData[fieldName as keyof VehicleFormData];
      const fieldValidation = validateField(fieldName, currentValue);
      setValidationState(prev => ({
        ...prev,
        [fieldName]: { ...fieldValidation, touched: true }
      }));
    }
  }, [formData, validateField, validateOnBlur]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const fullValidation = validateVehicleForm(formData);
    
    // Update individual field validations
    const newValidationState = { ...validationState };
    Object.keys(formData).forEach(fieldName => {
      if (fieldName in newValidationState) {
        const fieldValidation = validateField(fieldName, formData[fieldName as keyof VehicleFormData]);
        newValidationState[fieldName] = { ...fieldValidation, touched: true };
      }
    });
    
    setValidationState(newValidationState);
    setFormErrors(fullValidation.errors);
    setFormWarnings(fullValidation.warnings);
    setIsFormValid(fullValidation.isValid);
    
    return fullValidation;
  }, [formData, validationState, validateField]);

  // Reset form
  const resetForm = useCallback((newData?: Partial<VehicleFormData>) => {
    const resetData = {
      name: '',
      type: 'sedan' as const,
      capacity: 4,
      baggage: 2,
      pricePerKm: 8,
      rating: 5.0,
      image: '',
      features: [],
      isActive: true,
      ...newData
    };

    setFormData(resetData);
    setValidationState({
      name: { isValid: false, touched: false },
      capacity: { isValid: true, touched: false },
      baggage: { isValid: true, touched: false },
      pricePerKm: { isValid: true, touched: false },
      rating: { isValid: true, touched: false },
      image: { isValid: true, touched: false },
      features: { isValid: false, touched: false }
    });
    setFormErrors({});
    setFormWarnings({});
    setIsFormValid(false);
  }, []);

  // Auto-validate when dependencies change
  useEffect(() => {
    if (validateOnChange) {
      // Re-validate capacity and baggage when type changes
      if (validationState.capacity.touched) {
        const capacityValidation = validateField('capacity', formData.capacity);
        setValidationState(prev => ({ ...prev, capacity: capacityValidation }));
      }
      
      if (validationState.baggage.touched) {
        const baggageValidation = validateField('baggage', formData.baggage);
        setValidationState(prev => ({ ...prev, baggage: baggageValidation }));
      }

      if (validationState.pricePerKm.touched) {
        const priceValidation = validateField('pricePerKm', formData.pricePerKm);
        setValidationState(prev => ({ ...prev, pricePerKm: priceValidation }));
      }
    }
  }, [formData.type, formData.capacity, validateField, validateOnChange, validationState.capacity.touched, validationState.baggage.touched, validationState.pricePerKm.touched]);

  // Get validation info for a field
  const getFieldValidation = useCallback((fieldName: string) => {
    return validationState[fieldName] || { isValid: true, touched: false };
  }, [validationState]);

  // Check if field should show validation (touched or has error)
  const shouldShowValidation = useCallback((fieldName: string) => {
    const field = validationState[fieldName];
    return field && (field.touched || field.error);
  }, [validationState]);

  return {
    // Form data
    formData,
    updateField,
    resetForm,
    
    // Validation
    validationState,
    getFieldValidation,
    shouldShowValidation,
    handleFieldBlur,
    validateForm,
    
    // Form state
    isFormValid,
    formErrors,
    formWarnings,
    
    // Utilities
    sanitizeFormData: () => sanitizeVehicleFormData(formData)
  };
}