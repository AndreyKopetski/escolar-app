import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants/colors';

type Props = {
  size?: number;
};

export default function AppLogo({ size = 70 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path d="M0 0V26.1712L37.7889 63.9025H64V0H0Z" fill={colors.base.brand} />
      <Path
        d="M40.6188 29.421L42.4299 27.6127L48.619 21.4409L42.4299 15.2612L36.2407 21.4409L34.4297 23.2492V20.6861V11.9512H25.6814V20.6861V23.2492L23.8704 21.4409L17.6891 15.2612L11.5 21.4409L17.6891 27.6127L19.5002 29.421L23.8704 33.7924L25.6814 35.6007L28.2484 38.1638L30.0595 39.9721L34.4297 44.3356L36.2407 46.1439L42.4299 52.3236L48.619 46.1439L42.4299 39.9721L40.6188 38.1638H43.1779H51.9262V29.421H43.1779H40.6188Z"
        fill={colors.base.black}
      />
    </Svg>
  );
}
