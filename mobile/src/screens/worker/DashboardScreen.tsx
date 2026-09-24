import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Colors, Spacing, FontSize } from '../../constants';
import { useJobs, useUpdateJob, useUpdateWorkerProfile } from '../../hooks/use-api';
import { onJobStatusUpdate } from '../../services/chat';

export default function DashboardScreen() {
  const user = useSelector((state: any) => state.auth.user);
  const { mutate: updateJob } = useUpdateJob();
  const handleJobAction = (jobId: string, status: "worker_accepted" | "rejected") => {
    updateJob(
      { jobId, status },
      { onError: (error) => Alert.alert("Action failed", error.message) }
    );
  };
  const { mutate: updateWorkerProfile } = useUpdateWorkerProfile();

  const { data: assignedRes, refetch: refetchAssigned } = useJobs({ workerId: user?._id, status: 'worker_assigned' });
  const { data: completedRes, isLoading, refetch: refetchCompleted } = useJobs({ workerId: user?._id, status: 'completed' });

  const jobRequests = assignedRes?.data ?? [];
  const completedJobs = completedRes?.data ?? [];

  const [isOnline, setIsOnline] = useState(user?.isOnline ?? false);

  useEffect(() => {
    const unsubscribe = onJobStatusUpdate(() => {
      refetchAssigned();
      refetchCompleted();
    });
    return () => unsubscribe();
  }, []);

  const totalEarnings = completedJobs.reduce((sum: number, j: any) => sum + (j.price ?? 0), 0);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const stats = [
    { label: "Today's Jobs", value: String(jobRequests.length), icon: 'briefcase-outline' as const },
    { label: 'This Week', value: String(completedJobs.length), icon: 'calendar-outline' as const },
    { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: 'wallet-outline' as const },
    { label: 'Rating', value: String(user?.rating ?? '—'), icon: 'star-outline' as const },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, Worker!</Text>
          <Text style={styles.subtitle}>Welcome back to KaamDo</Text>
        </View>
        <View style={styles.onlineToggle}>
          <Text style={[styles.statusText, isOnline && styles.onlineText]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={(val) => {
              setIsOnline(val);
              if (user?._id) updateWorkerProfile({ workerId: user._id, isOnline: val });
            }}
            trackColor={{ false: Colors.gray[300], true: Colors.primary }}
            thumbColor={Platform.OS === 'ios' ? '#fff' : isOnline ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Ionicons name={stat.icon} size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Incoming Job Requests</Text>
          <Text style={styles.sectionCount}>{jobRequests.length} new</Text>
        </View>
        {jobRequests.map((job: any) => (
          <View key={job._id} style={styles.jobCard}>
            <View style={styles.jobInfo}>
              <Text style={styles.customerName}>{job.customerName ?? 'Customer'}</Text>
              <Text style={styles.serviceName}>{job.service ?? job.title ?? 'Service'}</Text>
              <View style={styles.jobDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.gray[500]} />
                  <Text style={styles.detailText}>{job.distance ?? '—'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={14} color={Colors.gray[500]} />
                  <Text style={styles.detailText}>{job.scheduledTime ?? job.date ?? '—'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.jobActions}>
              <Text style={styles.priceText}>₹{job.price ?? '—'}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleJobAction(job._id, 'worker_accepted')}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => handleJobAction(job._id, 'rejected')}>
                  <Ionicons name="close" size={18} color={Colors.error} />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Completed Jobs</Text>
        </View>
        {completedJobs.map((job: any) => (
          <View key={job._id} style={styles.completedCard}>
            <View style={styles.completedInfo}>
              <Text style={styles.customerName}>{job.customerName ?? 'Customer'}</Text>
              <Text style={styles.serviceName}>{job.service ?? job.title ?? 'Service'}</Text>
              <Text style={styles.completedTime}>{job.completedAt ?? '—'}</Text>
            </View>
            <View style={styles.completedMeta}>
              <Text style={styles.earningsText}>₹{job.price ?? 0}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.ratingText}>{job.rating ?? '—'}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.gray[500],
    marginTop: 2,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusText: {
    fontSize: FontSize.sm,
    color: Colors.gray[500],
    fontWeight: '600',
  },
  onlineText: {
    color: Colors.success,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.gray[500],
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  jobCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  customerName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  serviceName: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginTop: 2,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: FontSize.xs,
    color: Colors.gray[500],
  },
  jobActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: 4,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: 4,
  },
  rejectButtonText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  completedCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedInfo: {
    flex: 1,
  },
  completedTime: {
    fontSize: FontSize.xs,
    color: Colors.gray[500],
    marginTop: 4,
  },
  completedMeta: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  earningsText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: FontSize.sm,
    color: Colors.gray[600],
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
