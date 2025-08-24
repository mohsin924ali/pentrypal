// ========================================
// Form Hook - Secure Form Management with Validation
// ========================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ZodSchema, ZodError } from 'zod';

// Form field state
interface FormFieldState<T> {
  readonly value: T;
  readonly error?: string;
  readonly touched: boolean;
  readonly dirty: boolean;
}

// Form state
interface FormState<T extends Record<string, any>> {
  readonly fields: { [K in keyof T]: FormFieldState<T[K]> };
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
  readonly hasErrors: boolean;
  readonly isDirty: boolean;
  readonly submitCount: number;
}

// Form actions
interface FormActions<T extends Record<string, any>> {
  readonly setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  readonly setError: <K extends keyof T>(field: K, error?: string) => void;
  readonly setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  readonly validateField: <K extends keyof T>(field: K) => Promise<boolean>;
  readonly validateForm: () => Promise<boolean>;
  readonly resetForm: () => void;
  readonly resetField: <K extends keyof T>(field: K) => void;
  readonly handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => () => Promise<void>;
  readonly getFieldProps: <K extends keyof T>(field: K) => FormFieldProps<T[K]>;
}

// Form field props for components
interface FormFieldProps<T> {
  readonly value: T;
  readonly onChangeText: (value: T) => void;
  readonly onBlur: () => void;
  readonly error?: string;
}

// Form hook options
interface UseFormOptions<T extends Record<string, any>> {
  readonly initialValues: T;
  readonly validationSchema?: ZodSchema<T>;
  readonly validateOnChange?: boolean;
  readonly validateOnBlur?: boolean;
  readonly enableReinitialize?: boolean;
  readonly onSubmit?: (values: T) => Promise<void> | void;
}

// Form validation error
interface ValidationError {
  readonly field: string;
  readonly message: string;
}

/**
 * Secure Form Management Hook
 *
 * Features:
 * - Type-safe form state management
 * - Zod schema validation
 * - Field-level and form-level validation
 * - Security-focused (prevents XSS, injection)
 * - Performance optimized
 * - Accessibility ready
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  validateOnChange = false,
  validateOnBlur = true,
  enableReinitialize = false,
  onSubmit,
}: UseFormOptions<T>): FormState<T> & FormActions<T> {
  // Initialize form state
  const [fields, setFields] = useState<FormState<T>['fields']>(() => {
    const initialFields = {} as FormState<T>['fields'];
    Object.keys(initialValues).forEach(key => {
      const fieldKey = key as keyof T;
      initialFields[fieldKey] = {
        value: initialValues[fieldKey],
        touched: false,
        dirty: false,
      };
    });
    return initialFields;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const initialValuesRef = useRef(initialValues);

  // Reinitialize form when initial values change
  useEffect(() => {
    if (enableReinitialize && initialValuesRef.current !== initialValues) {
      setFields(() => {
        const newFields = {} as FormState<T>['fields'];
        Object.keys(initialValues).forEach(key => {
          const fieldKey = key as keyof T;
          newFields[fieldKey] = {
            value: initialValues[fieldKey],
            touched: false,
            dirty: false,
          };
        });
        return newFields;
      });
      initialValuesRef.current = initialValues;
    }
  }, [initialValues, enableReinitialize]);

  // Security: Sanitize input to prevent XSS
  const sanitizeValue = useCallback(<V>(value: V): V => {
    if (typeof value === 'string') {
      // Basic XSS prevention - remove script tags and dangerous characters
      const sanitized = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
      return sanitized as V;
    }
    return value;
  }, []);

  // Validate a single field
  const validateField = useCallback(
    async <K extends keyof T>(field: K): Promise<boolean> => {
      if (!validationSchema) return true;

      try {
        const fieldValue = fields[field].value;
        const fieldSchema = validationSchema.shape[field as string];

        if (fieldSchema) {
          await fieldSchema.parseAsync(fieldValue);
        }

        // Clear error if validation passes
        setFields(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            error: undefined,
          },
        }));

        return true;
      } catch (error) {
        const zodError = error as ZodError;
        const errorMessage = zodError.errors[0]?.message || 'Invalid value';

        setFields(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            error: errorMessage,
          },
        }));

        return false;
      }
    },
    [fields, validationSchema]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!validationSchema) return true;

    try {
      const currentValues = {} as T;
      Object.keys(fields).forEach(key => {
        const fieldKey = key as keyof T;
        currentValues[fieldKey] = fields[fieldKey].value;
      });

      console.log('🔍 FORM VALIDATION DEBUG:');
      console.log('- Current form values:', currentValues);
      console.log('- Fields state:', fields);
      console.log('- About to validate with schema...');

      await validationSchema.parseAsync(currentValues);

      // Clear all errors
      setFields(prev => {
        const newFields = { ...prev };
        Object.keys(newFields).forEach(key => {
          const fieldKey = key as keyof T;
          newFields[fieldKey] = {
            ...newFields[fieldKey],
            error: undefined,
          };
        });
        return newFields;
      });

      return true;
    } catch (error) {
      const zodError = error as ZodError;
      const errors: Record<string, string> = {};

      console.log('❌ FORM VALIDATION FAILED:');
      console.log('- Zod error:', zodError);
      console.log('- Individual errors:');

      zodError.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
        console.log(`  - Field "${path}": ${err.message}`);
        console.log(`    Code: ${err.code}, Value:`, err.input);
      });

      // Set field errors
      setFields(prev => {
        const newFields = { ...prev };
        Object.keys(newFields).forEach(key => {
          const fieldKey = key as keyof T;
          newFields[fieldKey] = {
            ...newFields[fieldKey],
            error: errors[key as string],
          };
        });
        return newFields;
      });

      return false;
    }
  }, [fields, validationSchema]);

  // Set field value
  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      const sanitizedValue = sanitizeValue(value);

      setFields(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          value: sanitizedValue,
          dirty: true,
        },
      }));

      // Validate on change if enabled
      if (validateOnChange) {
        setTimeout(() => validateField(field), 100);
      }
    },
    [sanitizeValue, validateOnChange, validateField]
  );

  // Set field error
  const setError = useCallback(<K extends keyof T>(field: K, error?: string) => {
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, touched: boolean = true) => {
      setFields(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          touched,
        },
      }));

      // Validate on blur if enabled and field is touched
      if (validateOnBlur && touched) {
        setTimeout(() => validateField(field), 100);
      }
    },
    [validateOnBlur, validateField]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setFields(() => {
      const resetFields = {} as FormState<T>['fields'];
      Object.keys(initialValues).forEach(key => {
        const fieldKey = key as keyof T;
        resetFields[fieldKey] = {
          value: initialValues[fieldKey],
          touched: false,
          dirty: false,
        };
      });
      return resetFields;
    });
    setIsSubmitting(false);
    setSubmitCount(0);
  }, [initialValues]);

  // Reset single field
  const resetField = useCallback(
    <K extends keyof T>(field: K) => {
      setFields(prev => ({
        ...prev,
        [field]: {
          value: initialValues[field],
          touched: false,
          dirty: false,
        },
      }));
    },
    [initialValues]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (submitHandler: (values: T) => Promise<void> | void) => async (): Promise<void> => {
      setIsSubmitting(true);
      setSubmitCount(prev => prev + 1);

      try {
        // Mark all fields as touched
        setFields(prev => {
          const newFields = { ...prev };
          Object.keys(newFields).forEach(key => {
            const fieldKey = key as keyof T;
            newFields[fieldKey] = {
              ...newFields[fieldKey],
              touched: true,
            };
          });
          return newFields;
        });

        // Validate form before submission
        const isValid = await validateForm();

        if (!isValid) {
          throw new Error('Form validation failed');
        }

        // Prepare clean values for submission
        const currentValues = {} as T;
        Object.keys(fields).forEach(key => {
          const fieldKey = key as keyof T;
          currentValues[fieldKey] = fields[fieldKey].value;
        });

        // Submit form
        await submitHandler(currentValues);
      } catch (error) {
        // Log submission error (in production, send to monitoring service)
        if (__DEV__) {
          console.error('Form submission error:', error);
        }
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fields, validateForm]
  );

  // Get field props for components
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K): FormFieldProps<T[K]> => ({
      value: fields[field].value,
      onChangeText: (value: T[K]) => setValue(field, value),
      onBlur: () => setFieldTouched(field, true),
      error: fields[field].touched ? fields[field].error : undefined,
    }),
    [fields, setValue, setFieldTouched]
  );

  // Computed state
  const isValid = Object.values(fields).every(field => !field.error);
  const hasErrors = Object.values(fields).some(field => Boolean(field.error));
  const isDirty = Object.values(fields).some(field => field.dirty);

  return {
    // State
    fields,
    isValid,
    isSubmitting,
    hasErrors,
    isDirty,
    submitCount,

    // Actions
    setValue,
    setError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    resetField,
    handleSubmit,
    getFieldProps,
  };
}

/**
 * Hook for managing a single form field
 */
export function useFormField<T>(initialValue: T, validator?: (value: T) => string | undefined) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const validate = useCallback(() => {
    if (validator) {
      const errorMessage = validator(value);
      setError(errorMessage);
      return !errorMessage;
    }
    return true;
  }, [value, validator]);

  const handleChangeText = useCallback(
    (newValue: T) => {
      setValue(newValue);
      if (touched && validator) {
        setTimeout(() => {
          const errorMessage = validator(newValue);
          setError(errorMessage);
        }, 0);
      }
    },
    [touched, validator]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);

  return {
    value,
    error: touched ? error : undefined,
    touched,
    setValue,
    setError,
    setTouched,
    validate,
    handleChangeText,
    handleBlur,
    fieldProps: {
      value,
      onChangeText: handleChangeText,
      onBlur: handleBlur,
      error: touched ? error : undefined,
    },
  };
}
