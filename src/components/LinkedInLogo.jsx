import { FONTS } from '../lib/constants';

export default function LinkedInLogo({ size = 28, radius = 'var(--radius-sm)' }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: radius,
      background: '#0077B5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: '13px', color: '#fff' }}>in</span>
    </div>
  );
}
