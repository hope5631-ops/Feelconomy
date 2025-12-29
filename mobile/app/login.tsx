import React, { useState, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { API_CONFIG } from '../constants/config';

export default function LoginScreen() {
    const { t, lang, setLang } = useLanguage();
    const { login } = useAuth();

    // Switch to English upon loading if needed, or just let the user choose.
    // Given the request, let's proactively set it to English.
    React.useEffect(() => {
        setLang('en');
    }, []);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const passwordRef = useRef<TextInput>(null);

    const validateEmail = (email: string) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const handleLogin = async () => {
        // Allow 'admin' or valid email format
        if (email !== 'admin' && !validateEmail(email)) {
            alert(t.msg_wrong_email);
            return;
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                const role = data.user.role || 'user';
                login(data.user.email, data.user.name, role);
                router.replace('/(tabs)');
            } else if (data.status === 'new') {
                // If social login or new user, go to signup
                router.push({
                    pathname: '/signup',
                    params: { email, name: email.split('@')[0], password }
                });
            } else {
                alert(`${t.btn_login} ${t.msg_login_failed}: ${data.message || data.detail || ''}`);
            }
        } catch (error) {
            console.error(error);
            alert(t.msg_server_error);
            login(email || 'guest@test.com', 'Guest User', 'user');
            router.replace('/(tabs)');
        }
    };

    const handleSocialLogin = async (provider: string) => {
        // Simulating fetching data from social ID
        const mockData = provider === 'kakao'
            ? { email: 'kakao_user@kakao.com', name: '카카오 친구' }
            : { email: 'google_user@gmail.com', name: 'Google Explorer' };

        try {
            // Check if user already exists
            const response = await fetch(`${API_CONFIG.BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: mockData.email, password: '1234' }), // Matching default password
            });
            const data = await response.json();

            if (data.status === 'success') {
                // If user exists, log in instantly
                login(data.user.email, data.user.name, data.user.role || 'user');
                router.replace('/(tabs)');
            } else {
                // If and only if it's a new user, go to signup
                router.push({
                    pathname: '/signup',
                    params: mockData
                });
            }
        } catch (error) {
            console.error('Social login error:', error);
            // Fallback to signup if error occurs during check
            router.push({
                pathname: '/signup',
                params: mockData
            });
        }
    };

    return (
        <ThemedView style={styles.container}>
            <LinearGradient colors={['#A1C4FD', '#C2E9FB']} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Language Switcher */}
                <View style={styles.langPicker}>
                    {(['ko', 'en', 'ph', 'zh']).map((lc: any) => {
                        const labels: { [key: string]: string } = { ko: '🇰🇷 한', en: '🇺🇸 EN', ph: '🇵🇭 PH', zh: '🇨🇳 中' };
                        return (
                            <TouchableOpacity
                                key={lc}
                                onPress={() => setLang(lc)}
                                style={[styles.langBtn, lang === lc && styles.langBtnActive]}
                            >
                                <ThemedText style={[styles.langText, lang === lc && styles.langTextActive]}>
                                    {labels[lc]}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3222/3222800.png' }}
                        style={styles.logo}
                    />
                    <ThemedText type="title" style={styles.title}>{t.title}</ThemedText>
                    <ThemedText style={styles.subtitle}>{t.login_title}</ThemedText>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>{t.email_label}</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder={isEmailFocused ? "" : "example@email.com"}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onFocus={() => setIsEmailFocused(true)}
                            onBlur={() => setIsEmailFocused(false)}
                            onSubmitEditing={() => passwordRef.current?.focus()}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>{t.password_label}</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                            ref={passwordRef}
                        />
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <ThemedText style={styles.loginBtnText}>{t.btn_login}</ThemedText>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <ThemedText style={styles.dividerText}>OR</ThemedText>
                        <View style={styles.line} />
                    </View>

                    <TouchableOpacity style={[styles.socialBtn, styles.kakaoBtn]} onPress={() => handleSocialLogin('kakao')}>
                        <ThemedText style={styles.kakaoText}>🟡 {t.btn_kakao}</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]} onPress={() => handleSocialLogin('google')}>
                        <ThemedText style={styles.googleText}>🔵 {t.btn_google}</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.signupBtn} onPress={() => router.push('/signup')}>
                        <ThemedText style={styles.signupBtnText}>{t.btn_signup}</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#34495e',
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 30,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#7f8c8d',
        marginBottom: 8,
        marginLeft: 5,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    loginBtn: {
        backgroundColor: '#6e8efb',
        borderRadius: 15,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#6e8efb',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 3,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupBtn: {
        marginTop: 20,
        alignItems: 'center',
    },
    signupBtnText: {
        color: '#6e8efb',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#eee',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#95a5a6',
        fontSize: 12,
    },
    socialBtn: {
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
    },
    kakaoBtn: {
        backgroundColor: '#FEE500',
        borderColor: '#FEE500',
    },
    googleBtn: {
        backgroundColor: '#fff',
        borderColor: '#eee',
    },
    kakaoText: {
        color: '#3C1E1E',
        fontWeight: 'bold',
    },
    googleText: {
        color: '#757575',
        fontWeight: 'bold',
    },
    langPicker: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 30,
        backgroundColor: 'rgba(255,255,255,0.4)',
        padding: 8,
        borderRadius: 20,
    },
    langBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    langBtnActive: {
        backgroundColor: '#6e8efb',
    },
    langText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
    },
    langTextActive: {
        color: '#fff',
    },
});
