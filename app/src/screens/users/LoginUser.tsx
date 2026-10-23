import { useEffect, useRef } from 'react';
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

const SEGMENT_COUNT = 70;
const PARTICLE_COUNT = 40;

const Serpent = () => {
  const { width, height } = useWindowDimensions();

  const radii = useRef(
    Array.from({ length: SEGMENT_COUNT }, (_, i) => {
      let r: number;
      if (i === 0) r = 0.8;
      else if (i < 5) r = 0.8 - i * 0.04;
      else r = Math.max(0.08, 0.65 * (1 - i / SEGMENT_COUNT));
      return Math.max(3, r * 18);
    })
  ).current;

  const xs = useRef(Array.from({ length: SEGMENT_COUNT }, () => new Animated.Value(0))).current;
  const ys = useRef(Array.from({ length: SEGMENT_COUNT }, () => new Animated.Value(0))).current;

  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1.5 + Math.random() * 2.5,
      phase: Math.random(),
    }))
  ).current;
  const twinkle = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const px = new Array<number>(SEGMENT_COUNT).fill(width / 2);
    const py = new Array<number>(SEGMENT_COUNT).fill(height / 2);
    let t = 0;
    let frame = 0;

    const loop = () => {
      frame = requestAnimationFrame(loop);
      t += 0.018;

      px[0] = width / 2 + Math.sin(t * 0.7) * (width * 0.42) + Math.cos(t * 1.8) * 10;
      py[0] = height / 2 + Math.sin(t * 1.4) * (height * 0.4) + Math.cos(t * 0.5) * 8;

      for (let i = 1; i < SEGMENT_COUNT; i++) {
        const wave = Math.sin(t * 4 - i * 0.15) * 0.9;
        px[i] += (px[i - 1] - px[i]) * 0.3 + wave;
        py[i] += (py[i - 1] - py[i]) * 0.3 + wave;
      }

      for (let i = 0; i < SEGMENT_COUNT; i++) {
        xs[i].setValue(px[i] - radii[i]);
        ys[i].setValue(py[i] - radii[i]);
      }
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [width, height, xs, ys, radii]);

  const twinkleOpacity = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.8] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => (
        <Animated.View
          key={`p${i}`}
          style={{
            position: 'absolute',
            left: p.x * width,
            top: p.y * height,
            width: p.size,
            height: p.size,
            borderRadius: p.size,
            backgroundColor: '#a7f3d0',
            opacity: i % 2 === 0 ? twinkleOpacity : Animated.subtract(1, twinkleOpacity),
          }}
        />
      ))}

      {Array.from({ length: SEGMENT_COUNT }, (_, k) => SEGMENT_COUNT - 1 - k).map((i) => {
        const size = radii[i] * 2;
        const isHead = i === 0;
        const isScale = i % 6 === 0 && !isHead;
        return (
          <Animated.View
            key={`s${i}`}
            style={[
              styles.segment,
              {
                width: size,
                height: size,
                borderRadius: radii[i],
                backgroundColor: isHead ? '#e2e8f0' : isScale ? '#10b981' : '#c0c0c0',
                borderColor: isScale ? '#6ee7b7' : 'rgba(255,255,255,0.55)',
                shadowColor: isScale ? '#10b981' : '#000',
                shadowOpacity: isScale ? 0.9 : 0.4,
                transform: [{ translateX: xs[i] }, { translateY: ys[i] }],
              },
            ]}
          >
            <View
              style={{
                position: 'absolute',
                top: size * 0.14,
                left: size * 0.2,
                width: size * 0.34,
                height: size * 0.26,
                borderRadius: size,
                backgroundColor: 'rgba(255,255,255,0.55)',
              }}
            />
            {isHead && (
              <>
                <View style={[styles.eye, { top: size * 0.3, left: size * 0.18 }]} />
                <View style={[styles.eye, { top: size * 0.3, right: size * 0.18 }]} />
              </>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

type LoginCardProps = {
  compact: boolean;
  onSubmit: () => void;
};

const LoginCard = ({ compact, onSubmit }: LoginCardProps) => {

  const {handleInputChange, state} = useLogin();

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
      <ActivityIndicator size="large" color={C.emerald} />
      <Text style={styles.loadingText}>Entrando...</Text>
    </View>
  );
};

export default function LoginUser() {
  const { width } = useWindowDimensions();
  const compact = width < 768;

  const {handleLogin, isLoading} = useLogin();

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

  const panelWidth = width * (compact ? 0.55 : 0.55);

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
            <LoginCard compact={compact} onSubmit={onSubmit} />
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
    backgroundColor: 'rgba(3,10,6,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 100,
    elevation: 100,
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
