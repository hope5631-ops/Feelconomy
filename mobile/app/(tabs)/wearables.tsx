import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WearablesScreen() {
    const { t } = useLanguage();

    return (
        <ThemedView style={styles.container}>
            <LinearGradient colors={['#fdfcfb', '#e2d1c3']} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title" style={styles.title}>{t.wearable_header}</ThemedText>
                    <ThemedText style={styles.subtitle}>{t.wearable_desc}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.card}>
                    <ThemedText style={styles.cardLabel}>{t.hr_title}</ThemedText>
                    <View style={styles.mockChart}>
                        {/* Mocking a tiny visual for heart rate */}
                        {[40, 60, 45, 80, 55, 70, 65].map((h, i) => (
                            <View key={i} style={[styles.bar, { height: h, backgroundColor: h > 75 ? '#ff6b6b' : '#6e8efb' }]} />
                        ))}
                    </View>
                    <ThemedText style={styles.hrValue}>72 BPM</ThemedText>
                </ThemedView>

                <ThemedView style={styles.card}>
                    <ThemedText style={styles.cardLabel}>{t.stress_report}</ThemedText>
                    <View style={styles.stressRow}>
                        <ThemedText style={styles.stressLabel}>{t.stress_load}</ThemedText>
                        <ThemedText style={styles.stressValue}>{t.stress_high}</ThemedText>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '65%' }]} />
                    </View>
                </ThemedView>

                <ThemedView style={[styles.card, styles.alertCard]}>
                    <ThemedText style={styles.alertTitle}>{t.emergency_alert}</ThemedText>
                    <ThemedText style={styles.alertMsg}>{t.emergency_msg}</ThemedText>
                </ThemedView>
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
    header: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    subtitle: {
        fontSize: 13,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
    },
    mockChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 100,
        marginBottom: 10,
    },
    bar: {
        width: 30,
        borderRadius: 5,
    },
    hrValue: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    stressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    stressLabel: {
        fontSize: 14,
        color: '#666',
    },
    stressValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff6b6b',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#ff6b6b',
    },
    alertCard: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 1,
        borderColor: '#ff6b6b',
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff6b6b',
        marginBottom: 5,
    },
    alertMsg: {
        fontSize: 14,
        color: '#c0392b',
        lineHeight: 20,
    },
});
