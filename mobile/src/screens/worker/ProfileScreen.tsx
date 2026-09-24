import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Spacing, FontSize } from '../../constants';
import { logout } from '../../store/authSlice';
import { AppDispatch } from '../../store';

const MENU_ITEMS = [
  { icon: 'location-outline', label: 'Service Areas' },
  { icon: 'document-text-outline', label: 'Documents' },
  { icon: 'calendar-outline', label: 'Availability' },
  { icon: 'wallet-outline', label: 'Earnings History' },
  { icon: 'star-outline', label: 'Ratings & Reviews' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'settings-outline', label: 'Settings' },
];

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color={Colors.white} />
            </View>
          )}
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user?.name || 'Worker'}</Text>
          {user?.verified && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          )}
        </View>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color={Colors.warning || '#F59E0B'} />
          <Text style={styles.statValue}>{user?.rating || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{user?.totalJobs || 0}</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{user?.yearsExperience || 0}</Text>
          <Text style={styles.statLabel}>Years Exp</Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsGrid}>
          {(user?.skills || []).map((skill: string, index: number) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={22} color={Colors.text || '#1F2937'} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray || '#9CA3AF'} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
        <Ionicons name="create-outline" size={18} color={Colors.white} />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={Colors.error || '#EF4444'} />
        <Text style={styles.logoutText}>Logout all devices</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl || 40,
    paddingBottom: Spacing.lg || 24,
    backgroundColor: Colors.white || '#FFFFFF',
  },
  avatarContainer: {
    marginBottom: Spacing.md || 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary || '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: FontSize.xl || 24,
    fontWeight: '700',
    color: Colors.text || '#1F2937',
  },
  email: {
    fontSize: FontSize.sm || 14,
    color: Colors.gray || '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.white || '#FFFFFF',
    marginHorizontal: Spacing.md || 16,
    marginTop: Spacing.md || 16,
    borderRadius: 12,
    paddingVertical: Spacing.lg || 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FontSize.lg || 18,
    fontWeight: '700',
    color: Colors.text || '#1F2937',
  },
  statLabel: {
    fontSize: FontSize.xs || 12,
    color: Colors.gray || '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border || '#E5E7EB',
  },
  skillsContainer: {
    marginTop: Spacing.md || 16,
    marginHorizontal: Spacing.md || 16,
    backgroundColor: Colors.white || '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md || 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSize.md || 16,
    fontWeight: '600',
    color: Colors.text || '#1F2937',
    marginBottom: Spacing.sm || 8,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: Colors.primaryLight || '#EFF6FF',
    paddingHorizontal: Spacing.md || 16,
    paddingVertical: Spacing.xs || 8,
    borderRadius: 20,
  },
  skillText: {
    fontSize: FontSize.sm || 14,
    color: Colors.primary || '#3B82F6',
    fontWeight: '500',
  },
  menuContainer: {
    marginTop: Spacing.md || 16,
    marginHorizontal: Spacing.md || 16,
    backgroundColor: Colors.white || '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md || 16,
    paddingVertical: Spacing.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm || 12,
  },
  menuLabel: {
    fontSize: FontSize.md || 16,
    color: Colors.text || '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary || '#3B82F6',
    marginHorizontal: Spacing.md || 16,
    marginTop: Spacing.lg || 24,
    paddingVertical: Spacing.md || 16,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: FontSize.md || 16,
    fontWeight: '600',
    color: Colors.white || '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.md || 16,
    marginTop: Spacing.md || 16,
    paddingVertical: Spacing.md || 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error || '#EF4444',
  },
  logoutText: {
    fontSize: FontSize.md || 16,
    fontWeight: '600',
    color: Colors.error || '#EF4444',
  },
  bottomSpacer: {
    height: Spacing.xl || 40,
  },
});
