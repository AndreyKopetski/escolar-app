import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'secondary-gray'
  | 'tertiary'
  | 'tertiary-gray'
  | 'link'
  | 'link-gray';

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps) {
  const isLink = variant === 'link' || variant === 'link-gray';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isLink && styles.linkBase,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        isDisabled && variantDisabledStyles[variant],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.base.white : colors.brand[600]}
        />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text
            style={[
              styles.label,
              sizeLabelStyles[size],
              variantLabelStyles[variant],
              isDisabled && variantDisabledLabelStyles[variant],
            ]}
          >
            {label}
          </Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Base ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    shadowColor: colors.gray[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkBase: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '600',
  },
});

// ─── Sizes ─────────────────────────────────────────────────────────────────────

const sizeStyles = StyleSheet.create({
  sm:  { paddingHorizontal: 12, paddingVertical: 8  },
  md:  { paddingHorizontal: 14, paddingVertical: 10 },
  lg:  { paddingHorizontal: 16, paddingVertical: 10 },
  xl:  { paddingHorizontal: 18, paddingVertical: 12 },
  '2xl': { paddingHorizontal: 22, paddingVertical: 16 },
});

const sizeLabelStyles = StyleSheet.create({
  sm:    { fontSize: 14, lineHeight: 20 },
  md:    { fontSize: 14, lineHeight: 20 },
  lg:    { fontSize: 16, lineHeight: 24 },
  xl:    { fontSize: 16, lineHeight: 24 },
  '2xl': { fontSize: 18, lineHeight: 28 },
});

// ─── Variants ──────────────────────────────────────────────────────────────────

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.brand[600],
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  secondary: {
    backgroundColor: colors.base.white,
    borderWidth: 1,
    borderColor: colors.brand[200],
  },
  'secondary-gray': {
    backgroundColor: colors.base.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  tertiary: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  'tertiary-gray': {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  link: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  'link-gray': {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
});

const variantLabelStyles = StyleSheet.create({
  primary:          { color: colors.base.white },
  secondary:        { color: colors.brand[700] },
  'secondary-gray': { color: colors.gray[700] },
  tertiary:         { color: colors.brand[700] },
  'tertiary-gray':  { color: colors.gray[600] },
  link:             { color: colors.brand[700], textDecorationLine: 'none' },
  'link-gray':      { color: colors.gray[600], textDecorationLine: 'none' },
});

// ─── Disabled overrides ────────────────────────────────────────────────────────

const variantDisabledStyles = StyleSheet.create({
  primary:          { backgroundColor: colors.brand[200] },
  secondary:        { backgroundColor: colors.brand[25] },
  'secondary-gray': { backgroundColor: colors.gray[50] },
  tertiary:         {},
  'tertiary-gray':  {},
  link:             {},
  'link-gray':      {},
});

const variantDisabledLabelStyles = StyleSheet.create({
  primary:          { color: colors.base.white },
  secondary:        { color: colors.brand[300] },
  'secondary-gray': { color: colors.gray[400] },
  tertiary:         { color: colors.brand[300] },
  'tertiary-gray':  { color: colors.gray[400] },
  link:             { color: colors.brand[300] },
  'link-gray':      { color: colors.gray[400] },
});
