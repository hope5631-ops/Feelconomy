import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_CONFIG } from '../../constants/config';

export default function HistoryScreen() {
    const { t } = useLanguage();
    const { userEmail } = useAuth();
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [userEmail]);

    const fetchHistory = async () => {
        if (!userEmail) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/history/${userEmail}`);
            const data = await response.json();
            setHistoryData(data.history || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <LinearGradient colors={['#fdfcfb', '#e2d1c3']} style={StyleSheet.absoluteFill} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchHistory} />
                }
            >
                <ThemedView style={styles.header}>
                    <ThemedText type="title" style={styles.title}>{t.tab_history}</ThemedText>
                    <ThemedText style={styles.subtitle}>{t.history_header}</ThemedText>
                </ThemedView>

                {loading ? (
                    <ActivityIndicator size="large" color="#6e8efb" style={{ marginTop: 50 }} />
                ) : historyData.length === 0 ? (
                    <ThemedText style={{ textAlign: 'center', marginTop: 50, color: '#95a5a6' }}>
                        {t.msg_no_history}
                    </ThemedText>
                ) : (
                    historyData.map((item, idx) => (
                        <ThemedView key={idx} style={styles.historyCard}>
                            <View style={styles.cardTop}>
                                <ThemedText style={styles.date}>{item.date?.split(' ')[0]}</ThemedText>
                                <View style={styles.scoreBadge}>
                                    <ThemedText style={styles.scoreText}>{item.score}</ThemedText>
                                </View>
                            </View>
                            <ThemedText style={styles.sentiment}>{item.sentiment}</ThemedText>
                            <ThemedText style={styles.summary}>{item.summary}</ThemedText>
                            {item.prescription && (
                                <View style={styles.prescContainer}>
                                    <ThemedText style={styles.prescText}>📌 {item.prescription}</ThemedText>
                                </View>
                            )}
                        </ThemedView>
                    ))
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 60 },
    header: { backgroundColor: 'transparent', alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
    subtitle: { fontSize: 13, color: '#7f8c8d' },
    historyCard: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    date: { fontSize: 14, color: '#95a5a6', fontWeight: 'bold' },
    scoreBadge: { backgroundColor: '#6e8efb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    scoreText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    sentiment: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5 },
    summary: { fontSize: 14, color: '#7f8c8d', lineHeight: 20 },
    prescContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    prescText: {
        fontSize: 13,
        color: '#6e8efb',
        fontStyle: 'italic',
    },
});
