import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useT } from '@/hooks/useT';
import { colors, gradients } from '@/constants/colors';

const STUDENT_PHOTOS: Record<string, number> = {
  TK: require('@/assets/images/avatar-thomas.jpg'),
  JK: require('@/assets/images/avatar-julia.jpg'),
};

export default function Header({ showStudentSelector = true, notifRoute = '/(main)/notificacoes', disableNotif = false }: { showStudentSelector?: boolean; notifRoute?: string; disableNotif?: boolean }) {
  const { displayName, activeStudent, activeYear, setStudentSheetVisible, setProfileSheetVisible, unreadNotificationsCount, profilePhoto } = useApp();
  const t = useT();
  const router = useRouter();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setPhase(p => p + 0.04);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const firstName = displayName.split(' ')[0];
  const nomeCapitalizado = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  const activePhoto = activeStudent.foto ?? STUDENT_PHOTOS[activeStudent.iniciais];
  const otherKey = activeStudent.iniciais === 'TK' ? 'JK' : 'TK';
  const otherPhoto = STUDENT_PHOTOS[otherKey];

  function handleLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {size.width > 0 && (() => {
        const spacing = 14;
        const amplitude = 3;
        const frequency = 0.5;
        const cols = Math.ceil(size.width / spacing) + 2;
        const rows = Math.ceil(size.height / spacing) + 2;
        const dots = [];
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * spacing;
            const y = row * spacing + Math.sin(col * frequency + phase) * amplitude;
            dots.push(<Circle key={`${row}-${col}`} cx={x} cy={y} r={0.8} fill={colors.gray[300]} />);
          }
        }
        return (
          <Svg style={styles.pattern} width={size.width} height={size.height} pointerEvents="none">
            {dots}
          </Svg>
        );
      })()}
      <View style={styles.topRow}>
        <View style={styles.left}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setProfileSheetVisible(true)}
            activeOpacity={0.8}
          >
            <Image source={profilePhoto ?? require('@/assets/images/avatar.jpg')} style={styles.avatarImage} />
            <LinearGradient
              colors={gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.onlineDot}
            />
          </TouchableOpacity>
          <Text style={styles.greeting}>{t('profile.greeting', { name: nomeCapitalizado })}</Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke={colors.gray[900]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={disableNotif ? undefined : () => router.push(notifRoute as any)}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={colors.gray[900]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            {unreadNotificationsCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showStudentSelector && <LinearGradient
        colors={[gradients.subtle[1], gradients.subtle[0]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.studentCardBorder}
      >
      <TouchableOpacity
        onPress={() => setStudentSheetVisible(true)}
        activeOpacity={0.7}
        style={styles.studentCardWrapper}
      >
        <BlurView intensity={60} tint="light" style={styles.studentCard}>
        <View style={styles.studentAvatarGroup}>
          {/* Avatar inativo — atrás */}
          <View style={styles.studentAvatarBackWrapper}>
            <Image source={otherPhoto} style={styles.studentAvatarBackImage} />
          </View>
          {/* Avatar ativo — frente com borda gradient */}
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.studentAvatarBorder}
          >
            <Image source={activePhoto} style={styles.studentAvatarPhoto} />
          </LinearGradient>
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>{activeStudent.nome}</Text>
          <View style={styles.yearBadge}>
            <Text style={styles.yearBadgeText}>{activeYear}</Text>
          </View>
        </View>

        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path d="M4.9974 5.00033L6.66406 3.33366M6.66406 3.33366L4.9974 1.66699M6.66406 3.33366H4.9974C3.15645 3.33366 1.66406 4.82604 1.66406 6.66699M14.9974 15.0003L13.3307 16.667M13.3307 16.667L14.9974 18.3337M13.3307 16.667H14.9974C16.8383 16.667 18.3307 15.1746 18.3307 13.3337M11.1784 11.1813C11.8303 11.4927 12.5601 11.667 13.3307 11.667C16.0922 11.667 18.3307 9.42842 18.3307 6.66699C18.3307 3.90557 16.0922 1.66699 13.3307 1.66699C10.5693 1.66699 8.33073 3.90557 8.33073 6.66699C8.33073 7.43759 8.50505 8.16747 8.81642 8.81935M11.6641 13.3337C11.6641 16.0951 9.42549 18.3337 6.66406 18.3337C3.90264 18.3337 1.66406 16.0951 1.66406 13.3337C1.66406 10.5722 3.90264 8.33366 6.66406 8.33366C9.42549 8.33366 11.6641 10.5722 11.6641 13.3337Z" stroke={colors.brand[700]} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        </BlurView>
      </TouchableOpacity>
      </LinearGradient>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.base.white,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.gray[900],
    lineHeight: 28,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.base.white,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.base.white,
    lineHeight: 12,
  },
  studentCardBorder: {
    borderRadius: 14,
    padding: 2,
  },
  studentCardWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingRight: 16,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
  },
  studentAvatarGroup: {
    width: 40,
    height: 40,
    position: 'relative',
    flexShrink: 0,
  },
  studentAvatarBackWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  studentAvatarBackImage: {
    width: 24,
    height: 24,
  },
  studentAvatarBorder: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 8,
    padding: 2.5,
  },
  studentAvatarPhoto: {
    width: 24,
    height: 24,
    borderRadius: 8,
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[700],
    lineHeight: 20,
    maxWidth: 150,
  },
  yearBadge: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[200],
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexShrink: 0,
  },
  yearBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.blue[700],
    lineHeight: 18,
  },
});
