import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, gradients } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function ProfileSheet() {
  const { displayName, userEmail, isProfileSheetVisible, setProfileSheetVisible } = useApp();
  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(300)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isProfileSheetVisible) {
      setModalVisible(true);
      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [isProfileSheetVisible]);

  function handleLogout() {
    setProfileSheetVisible(false);
    setTimeout(() => router.replace('/welcome'), 250);
  }

  const nomeCapitalizado = displayName
    .split(' ')
    .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={() => setProfileSheetVisible(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => setProfileSheetVisible(false)}>
        <Pressable>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Meu Perfil</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setProfileSheetVisible(false)}
                activeOpacity={0.7}
              >
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
            {/* User info */}
            <View style={styles.userRow}>
              <View style={styles.avatarWrapper}>
                <Image source={require('@/assets/images/avatar.jpg')} style={styles.avatarImage} />
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.onlineDot}
                />
              </View>
              <View>
                <Text style={styles.userName}>Olá, {nomeCapitalizado}!</Text>
                <Text style={styles.userEmail}>{userEmail || 'contato@gmail.com.br'}</Text>
              </View>
            </View>

            <View style={styles.menuList}>
              {/* Perfil */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setProfileSheetVisible(false)}
                activeOpacity={0.7}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={colors.gray[700]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.menuItemText}>Meus dados</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              {/* Sair */}
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke={colors.error[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={[styles.menuItemText, styles.logoutText]}>Sair do aplicativo</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
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
    backgroundColor: colors.base.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    paddingBottom: 32,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.base.white,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  userEmail: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 4,
  },
  menuList: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.gray[900],
    fontWeight: '500',
  },
  logoutText: {
    color: colors.error[600],
  },
});
