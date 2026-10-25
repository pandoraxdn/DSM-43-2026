import { useEffect, useRef, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { NeonBorder } from '../../components/NeonBorder';
import { useLogin } from '../../hooks/useLogin';

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

const C = {
  bg:       '#030a06',
  dark:     '#05140d',
  deep:     '#0b291a',
  emerald:  '#10b981',
  platinum: '#94a3b8',
  silver:   '#e2e8f0',
  slate300: '#cbd5e1'
};

const SEGMENT_COUNT = 120;
const PARTICLE_COUNT = 70;

const Serpent = () => {

  const { width, height } = useWindowDimensions();
  const SAMPLES = 360;
  const TWO_PI = Math.PI * 2;
  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
  const s = clamp(Math.min(width, height) / 390, 0.8, 1.5);
  const u = (v: number) => v * s;
  const anchorStyle = { position: 'absolute' as const, left: 0, top: 0, width: 0, height: 0 };

  const progress = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  const model = useMemo(() => {
    const bodyR = 9 * s;
    const segLen = 5.5 * s;
    const swayAmp = 5 * s;
    const margin = bodyR + 20 * s + 12;
    const ax = (width / 2 - margin) / 1.06;
    const ay = (height / 2 - margin - 20) / 1.06;

    const K = 1200;
    const px: number[] = [];
    const py: number[] = [];
    const cum: number[] = [0];
    for (let k = 0; k <= K; k++) {
      const th = (k / K) * TWO_PI;
      px.push(width / 2 + ax * (Math.sin(2 * th) + 0.06 * Math.cos(5 * th)));
      py.push(height / 2 + ay * (Math.sin(3 * th + 0.6) + 0.06 * Math.cos(2 * th)));
      if (k > 0) cum.push(cum[k - 1] + Math.hypot(px[k] - px[k - 1], py[k] - py[k - 1]));
    }
    const L = cum[K];

    const at = (sv: number) => {
      let d = sv % L;
      if (d < 0) d += L;
      let lo = 0;
      let hi = K;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= d) lo = mid;
        else hi = mid;
      }
      const seg = cum[lo + 1] - cum[lo] || 1;
      const f = (d - cum[lo]) / seg;
      return {
        x: px[lo] + (px[lo + 1] - px[lo]) * f,
        y: py[lo] + (py[lo + 1] - py[lo]) * f,
        tx: (px[lo + 1] - px[lo]) / seg,
        ty: (py[lo + 1] - py[lo]) / seg,
      };
    };

    const speed = 105 * s;
    const T = L / speed;
    const periodMs = T * 1000;
    const m = Math.max(1, Math.round(T * 0.67));

    const radii = Array.from({ length: SEGMENT_COUNT }, (_, i) => {
      const t = i / (SEGMENT_COUNT - 1);
      const neck = Math.min(1, 0.75 + t * 4);
      return Math.max(1.2 * s, bodyR * Math.pow(1 - t, 0.7) * neck);
    });

    const xs: number[][] = Array.from({ length: SEGMENT_COUNT }, () => []);
    const ys: number[][] = Array.from({ length: SEGMENT_COUNT }, () => []);
    const headRot: number[] = [];
    const tongue: number[] = [];
    let prevAng = 0;

    for (let j = 0; j <= SAMPLES; j++) {
      const t = j / SAMPLES;

      for (let i = 0; i < SEGMENT_COUNT; i++) {
        const p = at(t * L - i * segLen);
        const nx = -p.ty;
        const ny = p.tx;
        const sway =
          Math.sin(TWO_PI * m * t - i * 0.22) *
          swayAmp *
          Math.min(1, i / 10) *
          (0.4 + (0.6 * i) / (SEGMENT_COUNT - 1));
        xs[i].push(p.x + nx * sway);
        ys[i].push(p.y + ny * sway);
      }

      const hp = at(t * L);
      let ang = Math.atan2(hp.ty, hp.tx);
      if (j > 0) {
        while (ang - prevAng > Math.PI) ang -= TWO_PI;
        while (ang - prevAng < -Math.PI) ang += TWO_PI;
      }
      prevAng = ang;
      headRot.push(ang);

      tongue.push(clamp((Math.sin(TWO_PI * 5 * t) - 0.6) / 0.4, 0, 1));
    }

    return { xs, ys, headRot, tongue, radii, periodMs };
  }, [width, height, s]);

  const nodes = useMemo(() => {
    const inputRange = Array.from({ length: SAMPLES + 1 }, (_, j) => j / SAMPLES);
    const mk = (arr: number[]) =>
      progress.interpolate({ inputRange, outputRange: arr, extrapolate: 'clamp' });
    return {
      xs: model.xs.map(mk),
      ys: model.ys.map(mk),
      headRot: progress.interpolate({
        inputRange,
        outputRange: model.headRot.map((a) => `${a}rad`),
        extrapolate: 'clamp',
      }),
      tongue: mk(model.tongue),
    };
  }, [model, progress]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.5 + Math.random() * 2.5,
      })),
    [width, height]
  );

  const twinkleA = useMemo(
    () => twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.8] }),
    [twinkle]
  );
  const twinkleB = useMemo(
    () => twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0.2] }),
    [twinkle]
  );

  useEffect(() => {
    progress.setValue(0);
    const anim = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: model.periodMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [progress, model.periodMs]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [twinkle]);

  const order = useMemo(
    () => Array.from({ length: SEGMENT_COUNT }, (_, k) => SEGMENT_COUNT - 1 - k),
    []
  );

  const disc = (R: number, color: string, opacity = 1) => (
    <View
      style={{
        position: 'absolute',
        left: -R,
        top: -R,
        width: R * 2,
        height: R * 2,
        borderRadius: R,
        backgroundColor: color,
        opacity,
      }}
    />
  );

  const anchor = (i: number, key: string, child: React.ReactNode) => (
    <Animated.View
      key={key}
      style={[anchorStyle, { transform: [{ translateX: nodes.xs[i] }, { translateY: nodes.ys[i] }] }]}
    >
      {child}
    </Animated.View>
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => (
        <Animated.View
          key={`p${i}`}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.size,
            backgroundColor: '#a7f3d0',
            opacity: i % 2 === 0 ? twinkleA : twinkleB,
          }}
        />
      ))}

      {order.map((i) => (i % 3 === 0 ? anchor(i, `g${i}`, disc(model.radii[i] * 2.1, '#10b981', 0.07)) : null))}

      {order.map((i) => anchor(i, `o${i}`, disc(model.radii[i] + 1.3 * s, '#cbd5e1', 0.75)))}

      {order.map((i) =>
        anchor(i, `f${i}`, disc(model.radii[i], i % 7 === 5 ? '#2f9e7a' : '#0b3d2e'))
      )}

      {order.map((i) =>
        i >= 9 && i < SEGMENT_COUNT - 4 && i % 7 === 2
          ? anchor(i, `d${i}`, disc(model.radii[i] * 0.38, '#e2e8f0', 0.85))
          : null
      )}

      <Animated.View
        style={[
          anchorStyle,
          {
            transform: [
              { translateX: nodes.xs[0] },
              { translateY: nodes.ys[0] },
              { rotate: nodes.headRot },
            ],
          },
        ]}
      >
        <Animated.View style={[anchorStyle, { opacity: nodes.tongue }]}>
          <View style={{ position: 'absolute', left: u(19), top: u(-0.8), width: u(11), height: u(1.6), backgroundColor: '#f43f5e', borderRadius: u(1) }} />
          <View style={{ position: 'absolute', left: u(29.6), top: u(-2.6), width: u(6), height: u(1.6), backgroundColor: '#f43f5e', borderRadius: u(1), transform: [{ rotate: '-28deg' }] }} />
          <View style={{ position: 'absolute', left: u(29.6), top: u(1.0), width: u(6), height: u(1.6), backgroundColor: '#f43f5e', borderRadius: u(1), transform: [{ rotate: '28deg' }] }} />
        </Animated.View>

        <View
          style={{
            position: 'absolute',
            left: u(-13.2),
            top: u(-13.2),
            width: u(34.4),
            height: u(26.4),
            backgroundColor: '#cbd5e1',
            borderTopLeftRadius: u(9),
            borderBottomLeftRadius: u(9),
            borderTopRightRadius: u(13.2),
            borderBottomRightRadius: u(13.2),
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: u(-12),
            top: u(-12),
            width: u(32),
            height: u(24),
            backgroundColor: '#0f5132',
            borderTopLeftRadius: u(8),
            borderBottomLeftRadius: u(8),
            borderTopRightRadius: u(12),
            borderBottomRightRadius: u(12),
          }}
        />
        <View style={{ position: 'absolute', left: u(4), top: u(-9), width: u(15), height: u(18), borderRadius: u(9), backgroundColor: '#16a34a', opacity: 0.55 }} />
        <View style={{ position: 'absolute', left: u(-6), top: u(-9), width: u(14), height: u(5), borderRadius: u(5), backgroundColor: '#fff', opacity: 0.22 }} />

        <View style={{ position: 'absolute', left: u(15.1), top: u(-3.4), width: u(1.8), height: u(1.8), borderRadius: u(1), backgroundColor: '#022c22' }} />
        <View style={{ position: 'absolute', left: u(15.1), top: u(1.6), width: u(1.8), height: u(1.8), borderRadius: u(1), backgroundColor: '#022c22' }} />

        <View style={{ position: 'absolute', left: u(1), top: u(-12), width: u(10), height: u(10), borderRadius: u(5), backgroundColor: '#bef264', opacity: 0.35 }} />
        <View style={{ position: 'absolute', left: u(1), top: u(2), width: u(10), height: u(10), borderRadius: u(5), backgroundColor: '#bef264', opacity: 0.35 }} />
        <View style={{ position: 'absolute', left: u(3), top: u(-10.5), width: u(6), height: u(7), borderRadius: u(3.5), backgroundColor: '#d9f99d' }} />
        <View style={{ position: 'absolute', left: u(3), top: u(3.5), width: u(6), height: u(7), borderRadius: u(3.5), backgroundColor: '#d9f99d' }} />
        <View style={{ position: 'absolute', left: u(5.1), top: u(-9.6), width: u(1.8), height: u(5.2), borderRadius: u(1), backgroundColor: '#020617' }} />
        <View style={{ position: 'absolute', left: u(5.1), top: u(4.4), width: u(1.8), height: u(5.2), borderRadius: u(1), backgroundColor: '#020617' }} />
      </Animated.View>
    </View>
  );
};

type LoginCardProps = {
  compact: boolean;
};

const LoginCard = ({ compact }: LoginCardProps) => {

  const { state, handleLogin, handleInputChange } = useLogin();

  const onSubmit = () => {
    try {
      handleLogin();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.';
      Alert.alert('Error al iniciar sesión', message, [{ text: 'Aceptar' }]);
      return;
    }
  };

  return (
    <View style={[styles.card, compact && { padding: 14, borderRadius: 16 }]}>

      <View style={styles.cardTopAccent} />

      <View style={[styles.header, compact && { marginBottom: 14 }]}>
        <View style={[styles.emblem, compact && { width: 44, height: 44, borderRadius: 22, marginBottom: 8 }]}>
          <Text style={{ fontSize: compact ? 20 : 28 }}>🛡️</Text>
        </View>
        <Text
          style={[styles.title, compact && { fontSize: 15, letterSpacing: 1 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          DRACONIA PORTAL
        </Text>
        <Text style={[styles.subtitle, compact && { fontSize: 6, letterSpacing: 1 }]} numberOfLines={1}>
          AMBITION • CUNNING • GREATNESS
        </Text>
      </View>

      <Text style={styles.label}>Email</Text>
      <View style={styles.inputWrap}>
        <Text style={[styles.inputIconLeft, styles.iconText, compact && styles.iconCompact]}>👤</Text>
        <TextInput
          value={ state.email }
          onChangeText={ (text) => handleInputChange('email', text) }
          placeholder="draconia@slytherin.edu"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, compact && styles.inputCompact]}
        />
      </View>
      <View style={[styles.rowBetween, { flexWrap: 'wrap' }]}>
        <Text style={styles.label}>PASSWORD</Text>
        <Pressable>
          <Text style={[styles.forgot, compact && { fontSize: 10 }]}>Se te olvido la palabra</Text>
        </Pressable>
      </View>
      <View style={styles.inputWrap}>
        <Text style={[styles.inputIconLeft, styles.iconText, compact && styles.iconCompact]}>🔒</Text>
        <TextInput
          value={ state.password }
          onChangeText={ (text) => handleInputChange('password', text) }
          placeholder="••••••••••••"
          placeholderTextColor="#64748b"
          secureTextEntry={true}
          autoCapitalize="none"
          style={[styles.input, compact ? styles.inputCompact : { paddingRight: 44 }]}
        />
      </View>

      <Pressable onPress={onSubmit} style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
        <View style={[styles.button, compact && { paddingVertical: 11 }]}>
          <Text style={styles.buttonText}>Login</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </Pressable>

      <View style={[styles.footer, compact && { marginTop: 16, paddingTop: 12, gap: 4, flexWrap: 'wrap' }]}>
        <Text style={{ fontSize: 13 }}>🛡️</Text>
        <Text style={[styles.footerText, compact && { fontSize: 10 }]}>Protected by Encryption</Text>
      </View>
    </View>
  );
}

function CharacterBackground({ width, compact }: { width: number; compact: boolean }) {

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View pointerEvents="none" style={[styles.bgPanel, { width }]}>
      <Image
        source={require('./../../../assets/draconia.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
      />

      <View style={styles.fade}>
        {Array.from({ length: 16 }, (_, i) => (
          <View
            key={i}
            style={{ flex: 1, backgroundColor: `rgba(3,10,6,${(Math.pow(i / 15, 1.6) * 0.97).toFixed(3)})` }}
          />
        ))}
      </View>

      <View style={[styles.caption, compact && { bottom: 20, left: 16 }]}>
        <Text style={[styles.characterName, compact && { fontSize: 13 }]}>Draconia Malfoy</Text>
        <Text style={[styles.characterHouse, compact && { fontSize: 8, letterSpacing: 1 }]}>HOUSE OF SLYTHERIN</Text>
      </View>
    </View>
  );
}

const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size={80} color={C.emerald} />
      <Text style={styles.loadingText}>Entrando...</Text>
    </View>
  );
};

export default function LoginUser() {
  const { width } = useWindowDimensions();
  const compact = width < 768;

  const panelWidth = width * (compact ? 0.55 : 0.55);
  const { isLoading } = useLogin();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.bgGlow} />

      <CharacterBackground width={panelWidth} compact={compact} />

      <Serpent />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              justifyContent: 'flex-end',
              padding: compact ? 10 : 20,
              paddingRight: compact ? 10 : width * 0.08,
              paddingTop: 50,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '80%', marginHorizontal: 10 }}>
            <LoginCard compact={compact} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} />
      <NeonBorder />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    backgroundColor: C.bg,
    flex: 1
  },
  segment: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  eye: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: 'rgba(3,10,6,0.75)',
    elevation: 100,
    gap: 12,
    justifyContent: 'center',
    zIndex: 100
  },
  loadingText: { fontWeight: '600', fontSize: 12, letterSpacing: 2, color: C.slate300 },
  bgPanel: { position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' },
  fade: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '55%', flexDirection: 'row' },
  caption: { position: 'absolute', bottom: 30, left: 24 },
  bgGlow: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(16,185,129,0.07)' },
  scroll: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
    gap: 24,
  },
  col: { minWidth: 0, alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: 'rgba(8,31,20,0.9)',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.2)',
    overflow: 'hidden',
    shadowColor: C.emerald,
    shadowOpacity: 0.25,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  cardTopAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: C.silver, opacity: 0.6 },
  header: { alignItems: 'center', marginBottom: 28 },
  emblem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.deep,
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: C.emerald,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontFamily: SERIF,
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: 2,
    color: C.silver,
    textShadowColor: 'rgba(16,185,129,0.6)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 10,
    letterSpacing: 3,
    color: C.platinum,
    marginTop: 4,
  },
  label: {
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.slate300,
    marginBottom: 6,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot: { fontWeight: '400', fontSize: 12, color: C.emerald, marginBottom: 6 },
  inputWrap: { justifyContent: 'center', marginBottom: 18 },
  input: {
    fontWeight: '400',
    fontSize: 14,
    color: C.silver,
    backgroundColor: 'rgba(3,15,9,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 44,
    paddingRight: 16,
  },
  inputCompact: { fontSize: 12, paddingLeft: 32, paddingRight: 8, paddingVertical: 9 },
  iconCompact: { fontSize: 12, left: 10 },
  inputIconLeft: { position: 'absolute', left: 14, zIndex: 1 },
  inputIconRight: { position: 'absolute', right: 14, zIndex: 1 },
  iconText: { fontSize: 15 },
  toggleText: { fontWeight: '700', fontSize: 10, letterSpacing: 1, color: C.platinum },
  checkMark: { fontWeight: '700', fontSize: 11, lineHeight: 13, color: C.dark },
  arrow: { fontWeight: '700', fontSize: 16, color: '#a7f3d0' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    backgroundColor: 'rgba(5,20,13,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: C.emerald, borderColor: '#34d399' },
  rememberText: { fontWeight: '400', fontSize: 12, color: C.slate300 },
  button: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.5)',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
    color: C.silver,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51,65,85,0.4)',
  },
  footerText: { fontWeight: '400', fontSize: 12, color: '#94a3b8' },
  neonWrap: { width: '100%', margin: 12 },
  neonGlow: { position: 'absolute', borderColor: '#34d399' },
  neonGlowOuter: {
    top: -10, left: -10, right: -10, bottom: -10,
    borderWidth: 2,
    borderRadius: 30,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  neonGlowMid: {
    top: -5, left: -5, right: -5, bottom: -5,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: 'rgba(52,211,153,0.6)',
    shadowColor: '#34d399',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  characterWrap: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#6ee7b7',
  },
  characterImg: { width: '100%', aspectRatio: 1100 / 1406 },
  characterCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  characterName: { fontFamily: SERIF,
    fontWeight: '700', fontSize: 18, color: C.silver },
  characterHouse: {
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 2,
    color: '#34d399',
    marginTop: 2,
  },
});
