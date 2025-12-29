import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { API_CONFIG } from '../constants/config';

export default function SignupScreen() {
    const { t } = useLanguage();
    const { login } = useAuth();
    const params = useLocalSearchParams();

    // Mocking data fetched from social login
    const [email, setEmail] = useState((params.email as string) || 'social@user.com');
    const [name, setName] = useState((params.name as string) || '');
    const [phone, setPhone] = useState('');

    const handlePhoneChange = (text: string) => {
        // Remove all non-digit characters
        const cleaned = text.replace(/\D/g, '');

        // Format the number (Korean style: 010-XXXX-XXXX)
        let formatted = cleaned;
        if (cleaned.length > 3 && cleaned.length <= 7) {
            formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        } else if (cleaned.length > 7) {
            formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
        }

        setPhone(formatted);
    };

    const handleComplete = async () => {
        const passwordToSave = (params.password as string) || '1234';
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, phone, password: passwordToSave }),
            });
            const data = await response.json();
            console.log('Signup response:', data);
            if (data.status === 'success') {
                login(email, name, 'user');
                router.replace('/(tabs)');
            } else {
                const errorDetail = data.message || (data.detail && JSON.stringify(data.detail)) || '';
                alert(`${t.btn_signup} ${t.msg_signup_failed}: ${errorDetail}`);
            }
        } catch (error: any) {
            console.error('Signup fetch error:', error);
            alert(`${t.msg_server_error} (${API_CONFIG.BASE_URL})`);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <LinearGradient colors={['#E0C3FC', '#8EC5FC']} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <ThemedText type="title" style={styles.title}>{t.signup_header}</ThemedText>
                    <ThemedText style={styles.subtitle}>{t.email_label}: {email}</ThemedText>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>{t.name_label}</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>{t.phone_label}</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="010-1234-5678"
                            value={phone}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                            maxLength={13}
                        />
                    </View>

                    <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                        <ThemedText style={styles.completeBtnText}>{t.btn_complete}</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ThemedText style={styles.backBtnText}>{t.btn_cancel}</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30 },
    headerContainer: { alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#34495e' },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 30,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#7f8c8d', marginBottom: 8, marginLeft: 5 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    completeBtn: {
        backgroundColor: '#6e8efb',
        borderRadius: 15,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    completeBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    backBtn: { marginTop: 20, alignItems: 'center' },
    backBtnText: { color: '#95a5a6', fontSize: 14 },
});
