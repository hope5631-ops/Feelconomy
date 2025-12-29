import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LanguageCode } from '../../constants/translations';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { API_CONFIG } from '../../constants/config';

export default function HomeScreen() {
  const { t, lang, setLang } = useLanguage();
  const { userEmail, logout } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeHeart = async () => {
    if (content.length < 5) {
      alert(t.msg_input_short);
      return;
    }
    setLoading(true);
    try {
      // For local network testing: Using the PC's local IP
      const response = await fetch(`${API_CONFIG.BASE_URL}/analyze-sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, lang, user_email: userEmail }),
      });
      const data = await response.json();
      setResult(data);
      setContent(''); // Clear after success

      // Give a moment to see the result, then maybe jump? 
      // Or just let them see it. Let's add an alert or just stay.
      // Actually, navigation might be better.
      setTimeout(() => {
        router.push('/(tabs)/history');
      }, 2000);
    } catch (error) {
      console.error(error);
      alert(t.msg_server_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient colors={['#fdfcfb', '#e2d1c3']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language Switcher - High Visibility for Mobile */}
        <View style={styles.langPicker}>
          {(['ko', 'en', 'ph', 'zh'] as LanguageCode[]).map((lc) => {
            const labels = { ko: '🇰🇷 한', en: '🇺🇸 EN', ph: '🇵🇭 PH', zh: '🇨🇳 中' };
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

        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>{t.title}</ThemedText>
          <ThemedText style={styles.subtitle}>{t.subtitle}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.sectionHeader}>{t.input_header}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t.input_placeholder}
            multiline
            value={content}
            onChangeText={setContent}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, content.length < 5 && styles.buttonDisabled]}
            onPress={analyzeHeart}
            disabled={loading || content.length < 5}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>{t.btn_analyze}</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>

        {loading && <ThemedText style={styles.loadingText}>{t.analyzing}</ThemedText>}

        {result && (
          <ThemedView style={styles.resultCard}>
            <ThemedText style={styles.resultHeader}>{t.report_header}</ThemedText>

            <View style={styles.metricRow}>
              <ThemedText style={styles.metricLabel}>{t.stability_index}</ThemedText>
              <ThemedText style={styles.metricValue}>{result.index}%</ThemedText>
            </View>

            <View style={styles.metricRow}>
              <ThemedText style={styles.metricLabel}>{t.core_sentiment}</ThemedText>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{result.sentiment}</ThemedText>
              </View>
            </View>

            <View style={styles.aiWordBox}>
              <ThemedText style={styles.aiWordLabel}>{t.ai_word}</ThemedText>
              <ThemedText style={styles.aiWordText}>{result.summary}</ThemedText>
            </View>

            <View style={styles.prescriptionBox}>
              <ThemedText style={styles.prescriptionLabel}>{t.prescription_label}</ThemedText>
              <ThemedText style={styles.prescriptionText}>{result.prescription}</ThemedText>
            </View>
          </ThemedView>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); router.replace('/login'); }}>
          <ThemedText style={styles.logoutBtnText}>{t.msg_logout}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  langPicker: {
    flexDirection: 'row',
    justifyContent: 'center', // Center it for better balance
    gap: 12,
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 8,
    borderRadius: 20,
  },
  langBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  langBtnActive: {
    backgroundColor: '#6e8efb',
    shadowOpacity: 0.3,
    shadowColor: '#6e8efb',
  },
  langText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  langTextActive: {
    color: '#fff',
  },
  header: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  button: {
    backgroundColor: '#6e8efb',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#6e8efb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6e8efb',
    fontStyle: 'italic',
  },
  resultCard: {
    marginTop: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 40,
  },
  resultHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  metricLabel: {
    fontSize: 16,
    color: '#555',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6e8efb',
  },
  badge: {
    backgroundColor: '#eef2ff',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  badgeText: {
    color: '#6e8efb',
    fontWeight: 'bold',
  },
  aiWordBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6e8efb',
  },
  aiWordLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  aiWordText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  prescriptionBox: {
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
    padding: 15,
    marginTop: 15,
  },
  prescriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  prescriptionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  logoutBtn: {
    marginTop: 40,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ff6b6b',
    borderRadius: 15,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
