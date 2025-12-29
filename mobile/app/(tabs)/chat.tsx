import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../constants/config';

export default function ChatScreen() {
    const { t, lang } = useLanguage();
    const { userEmail } = useAuth();
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = inputText.trim();
        setMessages([...messages, { role: 'user', text: userMsg }]);
        setInputText('');
        setLoading(true);

        try {
            // Prepare history for backend
            const history = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const response = await fetch(`${API_CONFIG.BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: history,
                    lang,
                    user_email: userEmail
                }),
            });
            const data = await response.json();
            setMessages((prev) => [...prev, { role: 'ai', text: data.response }]);
        } catch (error) {
            console.error(error);
            alert('Chat error. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <LinearGradient colors={['#fdfcfb', '#e2d1c3']} style={StyleSheet.absoluteFill} />

            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>{t.chat_header}</ThemedText>
                <ThemedText style={styles.subtitle}>{t.chat_desc}</ThemedText>
            </ThemedView>

            <ScrollView contentContainerStyle={styles.chatArea}>
                {messages.map((msg, idx) => (
                    <View key={idx} style={[styles.msgBox, msg.role === 'user' ? styles.userMsg : styles.aiMsg]}>
                        <ThemedText style={msg.role === 'user' ? styles.userText : styles.aiText}>
                            {msg.text}
                        </ThemedText>
                    </View>
                ))}
                {loading && (
                    <View style={[styles.msgBox, styles.aiMsg]}>
                        <ThemedText style={styles.aiText}>...</ThemedText>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={t.chat_placeholder}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
                        <ThemedText style={styles.sendBtnText}>➔</ThemedText>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    subtitle: {
        fontSize: 13,
        color: '#7f8c8d',
    },
    chatArea: {
        padding: 20,
        paddingBottom: 100,
    },
    msgBox: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    userMsg: {
        alignSelf: 'flex-end',
        backgroundColor: '#6e8efb',
    },
    aiMsg: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
    },
    userText: {
        color: '#fff',
        fontSize: 15,
    },
    aiText: {
        color: '#333',
        fontSize: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16,
    },
    sendBtn: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: '#6e8efb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
