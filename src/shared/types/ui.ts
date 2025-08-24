// ========================================
// UI Component Types - Design System & Component Props
// ========================================

import type { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { ReactNode } from 'react';

// ========================================
// Theme Types
// ========================================

export interface Theme {
  readonly colors: ColorPalette;
  readonly typography: Typography;
  readonly spacing: Spacing;
  readonly shadows: Shadows;
  readonly borders: Borders;
  readonly animations: Animations;
  readonly breakpoints: Breakpoints;
}

export interface ColorPalette {
  readonly primary: ColorScale;
  readonly secondary: ColorScale;
  readonly accent: ColorScale;
  readonly neutral: ColorScale;
  readonly semantic: SemanticColors;
  readonly surface: SurfaceColors;
  readonly text: TextColors;
  readonly border: BorderColors;
}

export interface ColorScale {
  readonly 50: string;
  readonly 100: string;
  readonly 200: string;
  readonly 300: string;
  readonly 400: string;
  readonly 500: string;
  readonly 600: string;
  readonly 700: string;
  readonly 800: string;
  readonly 900: string;
  readonly 950: string;
}

export interface SemanticColors {
  readonly success: ColorScale;
  readonly warning: ColorScale;
  readonly error: ColorScale;
  readonly info: ColorScale;
}

export interface SurfaceColors {
  readonly background: string;
  readonly card: string;
  readonly modal: string;
  readonly overlay: string;
  readonly disabled: string;
}

export interface TextColors {
  readonly primary: string;
  readonly secondary: string;
  readonly tertiary: string;
  readonly disabled: string;
  readonly inverse: string;
  readonly onPrimary: string;
  readonly onSecondary: string;
  readonly onSurface: string;
}

export interface BorderColors {
  readonly primary: string;
  readonly secondary: string;
  readonly divider: string;
  readonly focus: string;
  readonly error: string;
}

// ========================================
// Typography System
// ========================================

export interface Typography {
  readonly fontFamilies: FontFamilies;
  readonly fontSizes: FontSizes;
  readonly fontWeights: FontWeights;
  readonly lineHeights: LineHeights;
  readonly letterSpacing: LetterSpacing;
  readonly textStyles: TextStyles;
}

export interface FontFamilies {
  readonly primary: string;
  readonly secondary: string;
  readonly monospace: string;
}

export interface FontSizes {
  readonly xs: number;
  readonly sm: number;
  readonly base: number;
  readonly lg: number;
  readonly xl: number;
  readonly '2xl': number;
  readonly '3xl': number;
  readonly '4xl': number;
  readonly '5xl': number;
  readonly '6xl': number;
}

export interface FontWeights {
  readonly thin: '100';
  readonly extraLight: '200';
  readonly light: '300';
  readonly normal: '400';
  readonly medium: '500';
  readonly semiBold: '600';
  readonly bold: '700';
  readonly extraBold: '800';
  readonly black: '900';
}

export interface LineHeights {
  readonly none: number;
  readonly tight: number;
  readonly snug: number;
  readonly normal: number;
  readonly relaxed: number;
  readonly loose: number;
}

export interface LetterSpacing {
  readonly tighter: number;
  readonly tight: number;
  readonly normal: number;
  readonly wide: number;
  readonly wider: number;
  readonly widest: number;
}

export interface TextStyles {
  readonly h1: TextStyle;
  readonly h2: TextStyle;
  readonly h3: TextStyle;
  readonly h4: TextStyle;
  readonly h5: TextStyle;
  readonly h6: TextStyle;
  readonly body1: TextStyle;
  readonly body2: TextStyle;
  readonly caption: TextStyle;
  readonly overline: TextStyle;
  readonly button: TextStyle;
}

// ========================================
// Spacing System
// ========================================

export interface Spacing {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly '2xl': number;
  readonly '3xl': number;
  readonly '4xl': number;
  readonly '5xl': number;
  readonly '6xl': number;
}

// ========================================
// Shadow System
// ========================================

export interface Shadows {
  readonly none: ViewStyle;
  readonly sm: ViewStyle;
  readonly md: ViewStyle;
  readonly lg: ViewStyle;
  readonly xl: ViewStyle;
  readonly '2xl': ViewStyle;
}

// ========================================
// Border System
// ========================================

export interface Borders {
  readonly radius: BorderRadius;
  readonly width: BorderWidth;
}

export interface BorderRadius {
  readonly none: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly '2xl': number;
  readonly '3xl': number;
  readonly full: number;
}

export interface BorderWidth {
  readonly none: number;
  readonly thin: number;
  readonly medium: number;
  readonly thick: number;
}

// ========================================
// Animation System
// ========================================

export interface Animations {
  readonly durations: AnimationDurations;
  readonly easings: AnimationEasings;
  readonly presets: AnimationPresets;
}

export interface AnimationDurations {
  readonly instant: number;
  readonly fast: number;
  readonly normal: number;
  readonly slow: number;
  readonly slower: number;
}

export interface AnimationEasings {
  readonly linear: string;
  readonly easeIn: string;
  readonly easeOut: string;
  readonly easeInOut: string;
  readonly bounce: string;
  readonly elastic: string;
}

export interface AnimationPresets {
  readonly fadeIn: AnimationConfig;
  readonly fadeOut: AnimationConfig;
  readonly slideInUp: AnimationConfig;
  readonly slideInDown: AnimationConfig;
  readonly slideInLeft: AnimationConfig;
  readonly slideInRight: AnimationConfig;
  readonly scaleIn: AnimationConfig;
  readonly scaleOut: AnimationConfig;
  readonly rotateIn: AnimationConfig;
  readonly bounce: AnimationConfig;
}

export interface AnimationConfig {
  readonly duration: number;
  readonly easing: string;
  readonly delay?: number;
  readonly repeat?: number;
  readonly reverse?: boolean;
}

// ========================================
// Breakpoints
// ========================================

export interface Breakpoints {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
}

// ========================================
// Component Base Types
// ========================================

export interface BaseComponentProps {
  readonly testID?: string;
  readonly accessible?: boolean;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly accessibilityRole?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export interface BaseTextProps {
  readonly testID?: string;
  readonly accessible?: boolean;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly accessibilityRole?: string;
  readonly style?: StyleProp<TextStyle>;
}

export interface BaseImageProps {
  readonly testID?: string;
  readonly accessible?: boolean;
  readonly accessibilityLabel?: string;
  readonly style?: StyleProp<ImageStyle>;
}

// ========================================
// Button Component Types
// ========================================

export interface ButtonProps extends BaseComponentProps {
  readonly title: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly leftIcon?: IconProps;
  readonly rightIcon?: IconProps;
  readonly fullWidth?: boolean;
  readonly children?: ReactNode;
}

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'destructive';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ========================================
// Input Types
// ========================================

export type InputVariant = 'outline' | 'filled' | 'underline';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends BaseComponentProps {
  readonly label?: string;
  readonly placeholder?: string;
  readonly value?: string;
  readonly onChangeText?: (text: string) => void;
  readonly onBlur?: (event: any) => void;
  readonly onFocus?: (event: any) => void;
  readonly error?: string;
  readonly helperText?: string;
  readonly variant?: InputVariant;
  readonly size?: InputSize;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly secure?: boolean;
  readonly leftIcon?: IconProps;
  readonly rightIcon?: IconProps;
  readonly showPasswordToggle?: boolean;
  readonly multiline?: boolean;
  readonly maxLength?: number;
  readonly autoComplete?: string;
  readonly keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'visible-password';
  readonly returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  readonly blurOnSubmit?: boolean;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly inputStyle?: StyleProp<TextStyle>;
  readonly labelStyle?: StyleProp<TextStyle>;
  readonly errorStyle?: StyleProp<TextStyle>;
  readonly helperStyle?: StyleProp<TextStyle>;
}

// ========================================
// Input Component Types
// ========================================

export interface InputProps extends BaseComponentProps {
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly placeholder?: string;
  readonly label?: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly multiline?: boolean;
  readonly numberOfLines?: number;
  readonly keyboardType?: KeyboardType;
  readonly autoCapitalize?: AutoCapitalize;
  readonly autoComplete?: AutoComplete;
  readonly secureTextEntry?: boolean;
  readonly leftIcon?: IconProps;
  readonly rightIcon?: IconProps;
  readonly clearable?: boolean;
  readonly variant?: InputVariant;
  readonly size?: InputSize;
}

export type KeyboardType = 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
export type AutoCapitalize = 'none' | 'sentences' | 'words' | 'characters';
export type AutoComplete =
  | 'off'
  | 'email'
  | 'password'
  | 'username'
  | 'name'
  | 'tel'
  | 'postal-code';
// InputVariant and InputSize already defined above

// ========================================
// Icon Component Types
// ========================================

export interface IconProps extends BaseComponentProps {
  readonly name: string;
  readonly size?: IconSize;
  readonly color?: string;
  readonly family?: IconFamily;
  readonly onPress?: () => void;
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
export type IconFamily = 'ionicons' | 'material' | 'feather' | 'fontawesome' | 'custom';

// ========================================
// Card Component Types
// ========================================

export interface CardProps extends BaseComponentProps {
  readonly children: ReactNode;
  readonly variant?: CardVariant;
  readonly padding?: SpacingValue;
  readonly margin?: SpacingValue;
  readonly elevation?: ElevationLevel;
  readonly borderless?: boolean;
  readonly onPress?: () => void;
  readonly pressable?: boolean;
}

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type SpacingValue = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

// ========================================
// Modal Component Types
// ========================================

export interface ModalProps extends BaseComponentProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly size?: ModalSize;
  readonly position?: ModalPosition;
  readonly animationType?: ModalAnimationType;
  readonly backdrop?: boolean;
  readonly backdropDismiss?: boolean;
  readonly children: ReactNode;
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type ModalAnimationType = 'slide' | 'fade' | 'scale' | 'none';

// ========================================
// List Component Types
// ========================================

export interface ListProps<T> extends BaseComponentProps {
  readonly data: T[];
  readonly renderItem: (item: ListRenderItemInfo<T>) => ReactNode;
  readonly keyExtractor?: (item: T, index: number) => string;
  readonly separator?: boolean | ReactNode;
  readonly header?: ReactNode;
  readonly footer?: ReactNode;
  readonly empty?: ReactNode;
  readonly loading?: boolean;
  readonly refreshing?: boolean;
  readonly onRefresh?: () => void;
  readonly onEndReached?: () => void;
  readonly onEndReachedThreshold?: number;
  readonly horizontal?: boolean;
  readonly numColumns?: number;
}

export interface ListRenderItemInfo<T> {
  readonly item: T;
  readonly index: number;
  readonly separators: {
    readonly highlight: () => void;
    readonly unhighlight: () => void;
    readonly updateProps: (select: 'leading' | 'trailing', newProps: unknown) => void;
  };
}

// ========================================
// Form Component Types
// ========================================

export interface FormProps extends BaseComponentProps {
  readonly children: ReactNode;
  readonly onSubmit?: (values: Record<string, unknown>) => void;
  readonly validation?: ValidationSchema;
  readonly initialValues?: Record<string, unknown>;
}

export interface FormFieldProps extends BaseComponentProps {
  readonly name: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly children: ReactNode;
}

export interface ValidationSchema {
  readonly [field: string]: ValidationRule[];
}

export interface ValidationRule {
  readonly type: ValidationType;
  readonly message: string;
  readonly value?: unknown;
}

export type ValidationType = 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';

// ========================================
// Navigation Component Types
// ========================================

export interface TabBarProps extends BaseComponentProps {
  readonly tabs: TabItem[];
  readonly activeTab: string;
  readonly onTabPress: (tabId: string) => void;
  readonly variant?: TabVariant;
  readonly scrollable?: boolean;
}

export interface TabItem {
  readonly id: string;
  readonly title: string;
  readonly icon?: IconProps;
  readonly badge?: BadgeProps;
  readonly disabled?: boolean;
}

export type TabVariant = 'default' | 'pills' | 'underlined';

export interface HeaderProps extends BaseComponentProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly leftAction?: HeaderAction;
  readonly rightActions?: HeaderAction[];
  readonly variant?: HeaderVariant;
  readonly transparent?: boolean;
}

export interface HeaderAction {
  readonly icon?: IconProps;
  readonly title?: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
}

export type HeaderVariant = 'default' | 'large' | 'compact';

// ========================================
// Feedback Component Types
// ========================================

export interface AlertProps extends BaseComponentProps {
  readonly title: string;
  readonly message?: string;
  readonly variant?: AlertVariant;
  readonly icon?: IconProps;
  readonly actions?: AlertAction[];
  readonly dismissible?: boolean;
  readonly onDismiss?: () => void;
}

export interface AlertAction {
  readonly title: string;
  readonly onPress: () => void;
  readonly style?: AlertActionStyle;
}

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertActionStyle = 'default' | 'cancel' | 'destructive';

export interface ToastProps {
  readonly message: string;
  readonly variant?: ToastVariant;
  readonly duration?: number;
  readonly position?: ToastPosition;
  readonly action?: ToastAction;
}

export interface ToastAction {
  readonly title: string;
  readonly onPress: () => void;
}

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top' | 'bottom' | 'center';

export interface LoadingProps extends BaseComponentProps {
  readonly size?: LoadingSize;
  readonly color?: string;
  readonly text?: string;
  readonly overlay?: boolean;
}

export type LoadingSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends BaseComponentProps {
  readonly content: string | number;
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
  readonly position?: BadgePosition;
  readonly max?: number;
  readonly showZero?: boolean;
}

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

// ========================================
// Layout Component Types
// ========================================

export interface ContainerProps extends BaseComponentProps {
  readonly children: ReactNode;
  readonly maxWidth?: ContainerSize;
  readonly padding?: SpacingValue;
  readonly margin?: SpacingValue;
  readonly center?: boolean;
}

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface StackProps extends BaseComponentProps {
  readonly children: ReactNode;
  readonly direction?: StackDirection;
  readonly spacing?: SpacingValue;
  readonly align?: StackAlign;
  readonly justify?: StackJustify;
  readonly wrap?: boolean;
}

export type StackDirection = 'row' | 'column';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface GridProps extends BaseComponentProps {
  readonly children: ReactNode;
  readonly columns?: number;
  readonly spacing?: SpacingValue;
  readonly templateColumns?: string;
  readonly templateRows?: string;
}

// ========================================
// Utility Types
// ========================================

export interface ResponsiveValue<T> {
  readonly xs?: T;
  readonly sm?: T;
  readonly md?: T;
  readonly lg?: T;
  readonly xl?: T;
}

export type ColorValue = string | ResponsiveValue<string>;
export type SpacingValueResponsive = SpacingValue | ResponsiveValue<SpacingValue>;

export interface ComponentVariants<T> {
  readonly [variant: string]: T;
}

export interface ComponentSizes<T> {
  readonly [size: string]: T;
}

// ========================================
// Accessibility Types
// ========================================

export interface AccessibilityProps {
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly accessibilityRole?: AccessibilityRole;
  readonly accessibilityState?: AccessibilityState;
  readonly accessibilityValue?: AccessibilityValue;
  readonly accessibilityActions?: AccessibilityAction[];
  readonly onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
}

export type AccessibilityRole =
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'
  | 'imagebutton'
  | 'header'
  | 'summary'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar'
  | 'none';

export interface AccessibilityState {
  readonly disabled?: boolean;
  readonly selected?: boolean;
  readonly checked?: boolean | 'mixed';
  readonly busy?: boolean;
  readonly expanded?: boolean;
}

export interface AccessibilityValue {
  readonly min?: number;
  readonly max?: number;
  readonly now?: number;
  readonly text?: string;
}

export interface AccessibilityAction {
  readonly name: string;
  readonly label?: string;
}

export interface AccessibilityActionEvent {
  readonly nativeEvent: {
    readonly actionName: string;
  };
}
