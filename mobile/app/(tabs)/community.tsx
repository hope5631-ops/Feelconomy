import React from 'react';
import { StyleSheet, ScrollView, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CommunityScreen() {
    const { t } = useLanguage();

    const posts = [
        { author: 'Jane', content: 'Today was hard, but I survived! 🌿', likes: 12, comments: 4 },
        { author: 'Anon', content: 'TodakTodak is so helpful. Feeling better now.', likes: 25, comments: 8 },
        { author: 'Sky', content: 'Anyone has tips for better sleep? 😴', likes: 8, comments: 15 },
    ];

    return (
        <ThemedView style={styles.container}>
            <LinearGradient colors={['#fdfcfb', '#e2d1c3']} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title" style={styles.title}>{t.tab_community}</ThemedText>
                    <ThemedText style={styles.subtitle}>{t.community_header}</ThemedText>
                </ThemedView>

                {posts.map((post, idx) => (
                    <ThemedView key={idx} style={styles.postCard}>
                        <View style={styles.postHeader}>
                            <View style={styles.avatar} />
                            <ThemedText style={styles.author}>{post.author}</ThemedText>
                        </View>
                        <ThemedText style={styles.postContent}>{post.content}</ThemedText>
                        <View style={styles.postFooter}>
                            <ThemedText style={styles.footerItem}>❤️ {post.likes}</ThemedText>
                            <ThemedText style={styles.footerItem}>💬 {post.comments}</ThemedText>
                        </View>
                    </ThemedView>
                ))}
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
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#eef2ff', marginRight: 10 },
    author: { fontWeight: 'bold', color: '#2c3e50' },
    postContent: { fontSize: 16, color: '#34495e', lineHeight: 24, marginBottom: 15 },
    postFooter: { flexDirection: 'row', gap: 20 },
    footerItem: { fontSize: 14, color: '#95a5a6' },
});
