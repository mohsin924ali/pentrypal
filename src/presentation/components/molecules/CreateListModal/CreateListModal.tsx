// ========================================
// Create List Modal - Shopping List Creation Interface
// ========================================

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';

// Hooks and Utils
import { useTheme } from '../../../providers/ThemeProvider';

// Types
export interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateList: (data: CreateListFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface CreateListFormData {
  name: string;
  description?: string;
  budget_amount?: number;
  budget_currency?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ========================================
// Form Validation
// ========================================

interface FormErrors {
  name?: string;
  budget_amount?: string;
}

const validateForm = (data: CreateListFormData): FormErrors => {
  const errors: FormErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'List name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'List name must be at least 2 characters';
  } else if (data.name.trim().length > 100) {
    errors.name = 'List name must be less than 100 characters';
  }

  // Budget validation
  if (data.budget_amount !== undefined && data.budget_amount !== null) {
    if (data.budget_amount < 0) {
      errors.budget_amount = 'Budget must be a positive number';
    } else if (data.budget_amount > 999999) {
      errors.budget_amount = 'Budget amount is too large';
    }
  }

  return errors;
};

// ========================================
// Create List Modal Component
// ========================================

export const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  onClose,
  onCreateList,
  isLoading = false,
  error = null,
}) => {
  const { theme } = useTheme();

  // Debug: Log props changes
  useEffect(() => {
    console.log('🔍 DEBUG: CreateListModal props:', {
      visible,
      isLoading,
      error,
    });
  }, [visible, isLoading, error]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget_amount: undefined,
    budget_currency: 'USD',
  } as unknown as CreateListFormData);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Animation
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Safe theme with fallbacks
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          primary: { '500': '#22c55e', '600': '#16a34a' },
          text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
          background: { primary: '#ffffff' },
          surface: { background: '#ffffff', secondary: '#f5f5f5', card: '#ffffff' },
          border: { primary: '#e5e5e5' },
          semantic: { error: { '500': '#ef4444' }, success: { '500': '#10b981' } },
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      };

  // ========================================
  // Animation Effects
  // ========================================

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setFormData({
        name: '',
        description: '',
        budget_amount: undefined,
        budget_currency: 'USD',
      } as any);
      setFormErrors({});
      setTouched({});

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // ========================================
  // Event Handlers
  // ========================================

  const handleClose = useCallback(() => {
    if (isLoading) return;
    onClose();
  }, [onClose, isLoading]);

  const handleFieldChange = useCallback(
    (field: keyof CreateListFormData, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: field === 'budget_amount' ? (value ? parseFloat(value) : undefined) : value,
      }));

      // Clear field error when user starts typing
      if (formErrors[field as keyof FormErrors]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [formErrors]
  );

  const handleFieldBlur = useCallback(
    (field: string) => {
      setTouched(prev => ({ ...prev, [field]: true }));

      // Validate field on blur
      const errors = validateForm(formData);
      setFormErrors(errors);
    },
    [formData]
  );

  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
      budget_amount: true,
    });

    // Validate form
    const errors = validateForm(formData);
    setFormErrors(errors);

    // Check if form is valid
    if (Object.keys(errors).length > 0) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
      console.log('📝 Creating list with data:', formData);
      await onCreateList(formData);
      // Modal will be closed by parent component on success
    } catch (error) {
      console.error('Failed to create list:', error);
      // Error handling is done by parent component
    }
  }, [formData, onCreateList]);

  // ========================================
  // Render Helpers
  // ========================================

  const renderFormField = (
    label: string,
    field: keyof CreateListFormData,
    placeholder: string,
    options: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric';
      maxLength?: number;
    } = {}
  ) => {
    const hasError = touched[field] && formErrors[field as keyof FormErrors];
    const value = formData[field];

    return (
      <View style={styles.fieldContainer}>
        <Typography
          variant='body2'
          style={[styles.fieldLabel, { color: safeTheme.colors.text.secondary }]}>
          {label}
          {field === 'name' && (
            <Typography style={{ color: safeTheme.colors.semantic.error['500'] }}> *</Typography>
          )}
        </Typography>

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: safeTheme.colors.surface.card,
              borderColor: hasError
                ? safeTheme.colors.semantic.error['500']
                : safeTheme.colors.border.primary,
              color: safeTheme.colors.text.primary,
              minHeight: options.multiline ? 80 : 48,
            },
          ]}
          value={String(value || '')}
          onChangeText={text => handleFieldChange(field, text)}
          onBlur={() => handleFieldBlur(field)}
          placeholder={placeholder}
          placeholderTextColor={safeTheme.colors.text.tertiary}
          multiline={options.multiline}
          keyboardType={options.keyboardType || 'default'}
          maxLength={options.maxLength}
          editable={!isLoading}
          textAlignVertical={options.multiline ? 'top' : 'center'}
        />

        {hasError && (
          <Typography
            variant='caption'
            style={[styles.errorText, { color: safeTheme.colors.semantic.error['500'] }]}>
            {formErrors[field as keyof FormErrors]}
          </Typography>
        )}
      </View>
    );
  };

  // ========================================
  // Main Render
  // ========================================

  return (
    <Modal
      visible={visible}
      animationType='none'
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      {/* Modal Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: safeTheme.colors.surface.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: safeTheme.colors.border.primary }]}>
            <Typography
              variant='h3'
              style={[styles.headerTitle, { color: safeTheme.colors.text.primary }]}>
              Create New List
            </Typography>

            <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={isLoading}>
              <Typography variant='h4' style={{ color: safeTheme.colors.text.secondary }}>
                ✕
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'>
            {/* List Name */}
            {renderFormField('List Name', 'name', 'Enter list name (e.g., "Weekly Groceries")', {
              maxLength: 100,
            })}

            {/* Description */}
            {renderFormField(
              'Description (Optional)',
              'description',
              'Add a description for your list...',
              { multiline: true, maxLength: 500 }
            )}

            {/* Budget Section */}
            <View style={styles.budgetSection}>
              <Typography
                variant='body2'
                style={[styles.sectionTitle, { color: safeTheme.colors.text.secondary }]}>
                Budget (Optional)
              </Typography>

              <View style={styles.budgetRow}>
                {renderFormField('Amount', 'budget_amount', '0.00', { keyboardType: 'numeric' })}

                <View style={styles.currencyContainer}>
                  <Typography
                    variant='body2'
                    style={[styles.fieldLabel, { color: safeTheme.colors.text.secondary }]}>
                    Currency
                  </Typography>
                  <View
                    style={[
                      styles.currencyPicker,
                      {
                        backgroundColor: safeTheme.colors.surface.card,
                        borderColor: safeTheme.colors.border.primary,
                      },
                    ]}>
                    <Typography variant='body1' style={{ color: safeTheme.colors.text.primary }}>
                      {formData.budget_currency}
                    </Typography>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Error Display */}
          {error && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: safeTheme.colors.semantic.error['500'] },
              ]}>
              <Typography variant='caption' style={{ color: '#ffffff' }}>
                {error}
              </Typography>
            </View>
          )}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: safeTheme.colors.border.primary }]}>
            <View style={styles.buttonRow}>
              <Button
                title='Cancel'
                onPress={handleClose}
                disabled={isLoading}
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: (safeTheme.colors.surface as any).secondary },
                ]}
                textStyle={{ color: safeTheme.colors.text.secondary } as any}
                {...({} as any)}
              />

              <Button
                title={isLoading ? 'Creating...' : 'Create List'}
                onPress={handleSubmit}
                disabled={isLoading || !formData.name.trim()}
                style={[
                  styles.button,
                  styles.createButton,
                  {
                    backgroundColor:
                      isLoading || !formData.name.trim()
                        ? safeTheme.colors.text.tertiary
                        : safeTheme.colors.primary['500'],
                  },
                ]}
                textStyle={{ color: '#ffffff', fontWeight: '600' } as any}
                {...({} as any)}
              />
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
  } as ViewStyle,

  overlayTouchable: {
    flex: 1,
  } as ViewStyle,

  keyboardAvoidingView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 9999,
  } as ViewStyle,

  modalContainer: {
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  } as ViewStyle,

  headerTitle: {
    fontWeight: '600',
  } as TextStyle,

  closeButton: {
    padding: 4,
  } as ViewStyle,

  content: {
    flex: 1,
  } as ViewStyle,

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  } as ViewStyle,

  fieldContainer: {
    marginBottom: 20,
  } as ViewStyle,

  fieldLabel: {
    marginBottom: 8,
    fontWeight: '500',
  } as TextStyle,

  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'System',
  } as ViewStyle,

  errorText: {
    marginTop: 4,
    fontSize: 12,
  },

  budgetSection: {
    marginTop: 8,
  } as ViewStyle,

  sectionTitle: {
    marginBottom: 12,
    fontWeight: '500',
  } as TextStyle,

  budgetRow: {
    flexDirection: 'row',
    gap: 16,
  } as ViewStyle,

  currencyContainer: {
    flex: 0.4,
  } as ViewStyle,

  currencyPicker: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    minHeight: 48,
  } as ViewStyle,

  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  } as ViewStyle,

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  } as ViewStyle,

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  cancelButton: {
    // Additional cancel button styles
  } as ViewStyle,

  createButton: {
    // Additional create button styles
  } as ViewStyle,
};
