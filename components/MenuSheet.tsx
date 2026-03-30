import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

interface MenuItem {
  label: string;
  route?: string;
  icon: React.ReactNode;
}

const ICON_COLOR = colors.brand[900];

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Boletim',
    route: '/(main)/boletim',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 20 20" fill="none">
        <Path d="M16.6693 10.417V5.66699C16.6693 4.26686 16.6693 3.5668 16.3968 3.03202C16.1571 2.56161 15.7747 2.17916 15.3042 1.93948C14.7695 1.66699 14.0694 1.66699 12.6693 1.66699H7.33594C5.93581 1.66699 5.23574 1.66699 4.70096 1.93948C4.23056 2.17916 3.8481 2.56161 3.60842 3.03202C3.33594 3.5668 3.33594 4.26686 3.33594 5.66699V14.3337C3.33594 15.7338 3.33594 16.4339 3.60842 16.9686C3.8481 17.439 4.23056 17.8215 4.70096 18.0612C5.23574 18.3337 5.93581 18.3337 7.33594 18.3337H10.0026M11.6693 9.16699H6.66927M8.33594 12.5003H6.66927M13.3359 5.83366H6.66927M12.0859 15.8337L13.7526 17.5003L17.5026 13.7503" stroke={ICON_COLOR} strokeWidth="2.004" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: 'Frequência',
    route: '/(main)/historico',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 20 20" fill="none">
        <Path d="M12.0807 15.8337L13.7474 17.5003L17.4974 13.7503M18.3183 10.4586C18.3266 10.3069 18.3307 10.1541 18.3307 10.0003C18.3307 5.39795 14.5998 1.66699 9.9974 1.66699C5.39502 1.66699 1.66406 5.39795 1.66406 10.0003C1.66406 14.5298 5.27782 18.2153 9.77947 18.3309M9.9974 5.00033V10.0003L13.1127 11.558" stroke={ICON_COLOR} strokeWidth="2.004" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: 'Aulas',
    route: '/(main)/agenda',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 20 20" fill="none">
        <Path d="M17.5 8.33366H2.5M13.3333 1.66699V5.00033M6.66667 1.66699V5.00033M6.5 18.3337H13.5C14.9001 18.3337 15.6002 18.3337 16.135 18.0612C16.6054 17.8215 16.9878 17.439 17.2275 16.9686C17.5 16.4339 17.5 15.7338 17.5 14.3337V7.33366C17.5 5.93353 17.5 5.23346 17.2275 4.69868C16.9878 4.22828 16.6054 3.84583 16.135 3.60614C15.6002 3.33366 14.9001 3.33366 13.5 3.33366H6.5C5.09987 3.33366 4.3998 3.33366 3.86502 3.60614C3.39462 3.84583 3.01217 4.22828 2.77248 4.69868C2.5 5.23346 2.5 5.93353 2.5 7.33366V14.3337C2.5 15.7338 2.5 16.4339 2.77248 16.9686C3.01217 17.439 3.39462 17.8215 3.86502 18.0612C4.3998 18.3337 5.09987 18.3337 6.5 18.3337Z" stroke={ICON_COLOR} strokeWidth="2.004" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: 'Diário',
    route: '/(main)/diario',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 20 20" fill="none">
        <Path d="M11.6693 1.8916V5.33372C11.6693 5.80043 11.6693 6.03378 11.7601 6.21204C11.84 6.36885 11.9675 6.49633 12.1243 6.57622C12.3025 6.66705 12.5359 6.66705 13.0026 6.66705H16.4447M13.3359 10.8337H6.66927M13.3359 14.167H6.66927M8.33594 7.50033H6.66927M11.6693 1.66699H7.33594C5.93581 1.66699 5.23574 1.66699 4.70096 1.93948C4.23056 2.17916 3.8481 2.56161 3.60842 3.03202C3.33594 3.5668 3.33594 4.26686 3.33594 5.66699V14.3337C3.33594 15.7338 3.33594 16.4339 3.60842 16.9686C3.8481 17.439 4.23056 17.8215 4.70096 18.0612C5.23574 18.3337 5.93581 18.3337 7.33594 18.3337H12.6693C14.0694 18.3337 14.7695 18.3337 15.3042 18.0612C15.7747 17.8215 16.1571 17.439 16.3968 16.9686C16.6693 16.4339 16.6693 15.7338 16.6693 14.3337V6.66699L11.6693 1.66699Z" stroke={ICON_COLOR} strokeWidth="2.004" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: 'Livros',
    route: '/(main)/livros',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 20 20" fill="none">
        <Path d="M8.33333 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H8.33333C8.79357 17.5 9.16667 17.1269 9.16667 16.6667V3.33333C9.16667 2.8731 8.79357 2.5 8.33333 2.5Z" stroke={ICON_COLOR} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5.83594 2.5V17.5" stroke={ICON_COLOR} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16.9975 15.7501C17.1642 16.1668 16.9142 16.6668 16.4975 16.8335L14.9142 17.4168C14.4975 17.5835 13.9975 17.3335 13.8309 16.9168L9.24752 4.25012C9.08085 3.83346 9.33085 3.33346 9.74752 3.16679L11.3309 2.58346C11.7475 2.41679 12.2475 2.66679 12.4142 3.08346L16.9975 15.7501Z" stroke={ICON_COLOR} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: 'Merenda',
    route: '/(main)/merenda',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 20 20" fill="none">
        <Path d="M9.9974 17.4502C11.2474 17.4502 12.2891 18.3336 13.3307 18.3336C15.8307 18.3336 18.3307 11.6669 18.3307 8.15022C18.3023 7.07083 17.8484 6.04641 17.0679 5.30026C16.2874 4.55412 15.2436 4.14673 14.1641 4.16689C12.3141 4.16689 10.8307 5.36689 9.9974 5.83356C9.16406 5.36689 7.68073 4.16689 5.83073 4.16689C4.75052 4.14452 3.70548 4.55118 2.9245 5.29779C2.14353 6.0444 1.69029 7.0701 1.66406 8.15022C1.66406 11.6669 4.16406 18.3336 6.66406 18.3336C7.70573 18.3336 8.7474 17.4502 9.9974 17.4502Z" stroke={ICON_COLOR} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8.33594 1.66699C9.16927 2.08366 10.0026 3.33366 10.0026 5.83366" stroke={ICON_COLOR} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: 'Material\nEscolar',
    route: '/(main)/material',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 20 20" fill="none">
        <Path d="M11.6697 1.66699V6.66699C11.6695 6.94656 11.7397 7.22167 11.8738 7.46699L16.4655 15.867C16.6044 16.1208 16.6748 16.4065 16.6698 16.6958C16.6648 16.9851 16.5846 17.2681 16.437 17.517C16.2894 17.7659 16.0796 17.9721 15.8282 18.1153C15.5767 18.2585 15.2923 18.3337 15.003 18.3337H5.00299C4.71364 18.3337 4.42925 18.2585 4.17782 18.1153C3.92638 17.9721 3.71655 17.7659 3.56898 17.517C3.42141 17.2681 3.34118 16.9851 3.33619 16.6958C3.33119 16.4065 3.4016 16.1208 3.54049 15.867L8.13216 7.46699C8.26623 7.22167 8.33644 6.94656 8.33632 6.66699V1.66699" stroke={ICON_COLOR} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5.375 12.5H14.62" stroke={ICON_COLOR} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7.08594 1.66699H12.9193" stroke={ICON_COLOR} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: 'Dados\ndo Aluno',
    route: '/(main)/dados',
    icon: (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" stroke={ICON_COLOR} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M6 12v5c3.33 2 8.67 2 12 0v-5" stroke={ICON_COLOR} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function MenuSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const sheetAnim = useRef(new Animated.Value(600)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      sheetAnim.setValue(600);
      Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 200 }).start();
    } else {
      Animated.timing(sheetAnim, { toValue: 600, duration: 220, useNativeDriver: true }).start(() => setModalVisible(false));
    }
  }, [visible]);

  function closeSheet(afterClose?: () => void) {
    Animated.timing(sheetAnim, { toValue: 600, duration: 220, useNativeDriver: true }).start(() => {
      setModalVisible(false);
      onClose();
      afterClose?.();
    });
  }

  function handlePress(item: MenuItem) {
    closeSheet(() => {
      if (item.route) router.push(item.route as any);
    });
  }

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={() => closeSheet()}>
      <Pressable style={styles.backdrop} onPress={() => closeSheet()} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
        <View style={styles.sheetHandle} />
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Menu</Text>
          <TouchableOpacity onPress={() => closeSheet()} style={styles.closeBtn} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M18 6L6 18M6 6l12 12" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.sheetBody}>
          <View style={styles.grid}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.gridItem}
                onPress={() => handlePress(item)}
                activeOpacity={0.75}
              >
                <View style={styles.iconBox}>
                  {item.icon}
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[200],
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  sheetBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '30%',
    flexGrow: 1,
    maxWidth: '32%',
  },
  iconBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.success[50],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.brand[900],
    textAlign: 'center',
    lineHeight: 16,
  },
});
