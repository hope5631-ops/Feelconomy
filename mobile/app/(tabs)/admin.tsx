import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { API_CONFIG } from '../../constants/config';

export default function AdminScreen() {
    const { t } = useLanguage();
    const { userRole, userEmail } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    useEffect(() => {
        if (userRole !== 'admin' || userEmail !== 'admin') {
            router.replace('/(tabs)');
            return;
        }
        fetchUsers();
    }, [userRole, userEmail]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users`);
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (email: string) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`${email} 사용자를 정말 삭제하시겠습니까? 관련 데이터도 모두 삭제됩니다.`);
            if (confirmed) handleDelete(email);
        } else {
            Alert.alert(
                "사용자 삭제",
                `${email} 사용자를 정말 삭제하시겠습니까? 관련 데이터도 모두 삭제됩니다.`,
                [
                    { text: "취소", style: "cancel" },
                    { text: "삭제", style: "destructive", onPress: () => handleDelete(email) }
                ]
            );
        }
    };

    const handleDelete = async (email: string) => {
        if (!confirm(t.msg_delete_confirm)) return;
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${email}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.status === 'success') {
                alert(t.msg_delete_success);
                fetchUsers();
            }
        } catch (error) {
            console.error(error);
            alert(t.msg_server_error);
        }
    };

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setEditName(user.name);
        setEditPhone(user.phone);
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${selectedUser.email}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: selectedUser.email, name: editName, phone: editPhone })
            });
            const data = await response.json();
            if (data.status === 'success') {
                alert(t.msg_update_success);
                setEditModalVisible(false);
                fetchUsers();
            }
        } catch (error) {
            console.error(error);
            alert(t.msg_server_error);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <LinearGradient colors={['#ebedee', '#fdfbfb']} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title" style={styles.title}>{t.admin_title}</ThemedText>
                    <ThemedText style={styles.subtitle}>{t.admin_desc}</ThemedText>
                </ThemedView>

                {loading ? (
                    <ActivityIndicator size="large" color="#2c3e50" style={{ marginTop: 50 }} />
                ) : users.length === 0 ? (
                    <ThemedText style={styles.emptyText}>{t.admin_no_users}</ThemedText>
                ) : (
                    users.map((user, idx) => (
                        <View key={idx} style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <ThemedText style={styles.userName}>{user.name}</ThemedText>
                                <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
                                <ThemedText style={styles.userPhone}>{user.phone}</ThemedText>
                                <ThemedText style={styles.userPassword}>{t.admin_pw_label}: {user.password}</ThemedText>
                            </View>
                            <View style={styles.userActions}>
                                {user.email !== 'admin' && (
                                    <>
                                        <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(user)}>
                                            <ThemedText style={styles.actionBtnText}>{t.btn_edit}</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(user.email)}>
                                            <ThemedText style={styles.actionBtnText}>{t.btn_delete}</ThemedText>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    ))
                )}

                <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
                    <ThemedText style={styles.refreshBtnText}>{t.btn_refresh}</ThemedText>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>{t.modal_edit_title}</ThemedText>
                        <ThemedText style={styles.modalSubtitle}>{selectedUser?.email}</ThemedText>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.inputLabel}>{t.name_label}</ThemedText>
                            <TextInput
                                style={styles.modalInput}
                                value={editName}
                                onChangeText={setEditName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.inputLabel}>{t.phone_label}</ThemedText>
                            <TextInput
                                style={styles.modalInput}
                                value={editPhone}
                                onChangeText={setEditPhone}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                                <ThemedText style={styles.cancelBtnText}>{t.btn_cancel}</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                                <ThemedText style={styles.saveBtnText}>{t.btn_save}</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 60 },
    header: { backgroundColor: 'transparent', alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
    subtitle: { fontSize: 13, color: '#7f8c8d', textAlign: 'center' },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    userInfo: { flex: 1, gap: 3 },
    userName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    userEmail: { fontSize: 14, color: '#34495e' },
    userPhone: { fontSize: 13, color: '#7f8c8d' },
    userPassword: { fontSize: 12, color: '#e67e22', fontWeight: 'bold' },
    userActions: { flexDirection: 'row', gap: 8 },
    editBtn: { backgroundColor: '#6e8efb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    deleteBtn: { backgroundColor: '#ff6b6b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#95a5a6' },
    refreshBtn: {
        marginTop: 20,
        backgroundColor: '#2c3e50',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center'
    },
    refreshBtnText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5 },
    modalSubtitle: { fontSize: 14, color: '#7f8c8d', marginBottom: 20 },
    inputGroup: { marginBottom: 15 },
    inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#95a5a6', marginBottom: 5 },
    modalInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
    cancelBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    saveBtn: { flex: 1, backgroundColor: '#6e8efb', padding: 15, borderRadius: 12, alignItems: 'center' },
    cancelBtnText: { color: '#95a5a6', fontWeight: 'bold' },
    saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
