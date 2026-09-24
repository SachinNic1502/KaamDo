import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../constants';
import { logout } from '../../store/authSlice';
import { AppDispatch } from '../../store';

const MENU_ITEMS = [
  { icon: 'location-outline', label: 'My Addresses' },
  { icon: 'card-outline', label: 'Payment Methods' },
  { icon: 'time-outline', label: 'Booking History' },
  { icon: 'document-text-outline', label: 'Invoices' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'information-circle-outline', label: 'About' },
];

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.user);

  const handleLogout = () => {
    Alert.alert('Logout', 'Sign out here and revoke your sessions on all devices?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.phone}>{user?.phone || '+91 0000000000'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={Colors.text || '#333'}
            />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.gray || '#999'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.7}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#E53935" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl || 40,
    backgroundColor: Colors.white || '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.md || 12,
  },
  name: {
    fontSize: FontSize.lg || 20,
    fontWeight: '700',
    color: Colors.text || '#333',
    marginBottom: Spacing.xs || 4,
  },
  phone: {
    fontSize: FontSize.sm || 14,
    color: Colors.gray || '#777',
    marginBottom: 2,
  },
  email: {
    fontSize: FontSize.sm || 14,
    color: Colors.gray || '#777',
  },
  menuContainer: {
    marginTop: Spacing.lg || 24,
    marginHorizontal: Spacing.md || 16,
    backgroundColor: Colors.white || '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md || 16,
    paddingHorizontal: Spacing.md || 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border || '#EEE',
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md || 16,
    color: Colors.text || '#333',
    marginLeft: Spacing.md || 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg || 24,
    marginHorizontal: Spacing.md || 16,
    paddingVertical: Spacing.md || 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: FontSize.md || 16,
    fontWeight: '600',
    color: '#E53935',
    marginLeft: Spacing.sm || 8,
  },
  bottomSpacer: {
    height: Spacing.xl || 40,
  },
});
