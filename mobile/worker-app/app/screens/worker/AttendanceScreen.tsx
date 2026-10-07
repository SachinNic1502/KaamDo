import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Badge, EmptyState } from "../../../components/ui";
import {
  useAttendanceList,
  useCheckIn,
  useCheckOut,
  useWorkerJobs,
} from "../../../hooks/use-api";
import { AttendanceRecord, Job } from "../../../types";

export const AttendanceScreen = ({ navigation }: any) => {
  const { data: records = [], isLoading, refetch } = useAttendanceList();
  const { data: inProgressJobs = [] } = useWorkerJobs("in_progress");
  const { data: assignedJobs = [] } = useWorkerJobs("assigned");

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

  // All jobs eligible for attendance
  const activeJobs = useMemo(() => {
    const list: Job[] = [...inProgressJobs, ...assignedJobs];
    // deduplicate by _id
    const seen = new Set<string>();
    return list.filter((j) => {
      if (!j._id || seen.has(j._id)) return false;
      seen.add(j._id);
      return true;
    });
  }, [inProgressJobs, assignedJobs]);

  // Set default selected job
  useEffect(() => {
    if (!selectedJobId && activeJobs.length > 0) {
      setSelectedJobId(activeJobs[0]._id);
    }
  }, [activeJobs, selectedJobId]);

  // Find today's active punch if any
  const todayRecord = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return records.find((r) => {
      const recDate = new Date(r.date).toISOString().split("T")[0];
      return recDate === today;
    });
  }, [records]);

  const isCheckedIn = Boolean(todayRecord && todayRecord.checkIn && !todayRecord.checkOut);
  const isShiftDone = Boolean(todayRecord && todayRecord.checkIn && todayRecord.checkOut);

  // Live timer if checked in
  useEffect(() => {
    if (!isCheckedIn || !todayRecord?.checkIn) {
      setElapsedTime("00:00:00");
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(todayRecord.checkIn!).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;
      setElapsedTime(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isCheckedIn, todayRecord?.checkIn]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalHours = records.reduce((acc, cur) => acc + (cur.workingHours || 0), 0);
    const approvedDays = records.filter((r) => r.status === "approved" || r.status === "present").length;
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalShifts: records.length,
      approvedDays,
    };
  }, [records]);

  const handlePunchIn = async () => {
    if (!selectedJobId) {
      Alert.alert("Job Selection Required", "Please select an assigned or active job to record attendance for.");
      return;
    }

    try {
      await checkInMutation.mutateAsync({
        jobId: selectedJobId,
        notes: notes.trim() || undefined,
        action: "check-in",
      });
      setNotes("");
      Alert.alert("Punch In Successful", "Your shift start time has been logged.");
      refetch();
    } catch (err: any) {
      Alert.alert("Punch In Failed", err.message || "Could not log shift start.");
    }
  };

  const handlePunchOut = async () => {
    if (!todayRecord?._id) return;

    Alert.alert(
      "Confirm Punch Out",
      "Are you sure you want to complete your shift for today?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Shift",
          style: "destructive",
          onPress: async () => {
            try {
              await checkOutMutation.mutateAsync({
                attendanceId: todayRecord._id,
                action: "check-out",
              });
              Alert.alert("Shift Completed", "Your check-out time and logged hours have been recorded.");
              refetch();
            } catch (err: any) {
              Alert.alert("Punch Out Failed", err.message || "Could not log check-out.");
            }
          },
        },
      ]
    );
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderHeader = () => {
    return (
      <View style={styles.topSection}>
        {/* Shift Punch Card */}
        <View style={styles.punchCard}>
          <View style={styles.punchHeader}>
            <View>
              <Text style={styles.punchDate}>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </Text>
              <Text style={styles.punchCardTitle}>Daily Shift Attendance</Text>
            </View>
            <View
              style={[
                styles.punchStatusBadge,
                isCheckedIn
                  ? styles.punchBadgeActive
                  : isShiftDone
                  ? styles.punchBadgeDone
                  : styles.punchBadgeIdle,
              ]}
            >
              <View
                style={[
                  styles.punchStatusDot,
                  {
                    backgroundColor: isCheckedIn
                      ? Colors.online
                      : isShiftDone
                      ? Colors.primary
                      : Colors.textMuted,
                  },
                ]}
              />
              <Text
                style={[
                  styles.punchBadgeText,
                  {
                    color: isCheckedIn
                      ? Colors.online
                      : isShiftDone
                      ? Colors.primary
                      : Colors.textSecondary,
                  },
                ]}
              >
                {isCheckedIn ? "ON SHIFT" : isShiftDone ? "COMPLETED" : "NOT PUNCHED"}
              </Text>
            </View>
          </View>

          {/* Active Shift Display */}
          {isCheckedIn ? (
            <View style={styles.activeShiftBox}>
              <Text style={styles.timerLabel}>Live Shift Duration</Text>
              <Text style={styles.timerText}>{elapsedTime}</Text>
              <View style={styles.shiftMetaRow}>
                <View style={styles.shiftMetaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.shiftMetaText}>
                    Started: {formatTime(todayRecord?.checkIn)}
                  </Text>
                </View>
                {todayRecord?.notes ? (
                  <View style={styles.shiftMetaItem}>
                    <Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.shiftMetaText} numberOfLines={1}>
                      {todayRecord.notes}
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.punchOutBtn}
                onPress={handlePunchOut}
                disabled={checkOutMutation.isPending}
                activeOpacity={0.8}
              >
                {checkOutMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="stop-circle" size={20} color={Colors.white} />
                    <Text style={styles.punchOutBtnText}>PUNCH OUT (END SHIFT)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : isShiftDone ? (
            <View style={styles.doneShiftBox}>
              <Ionicons name="checkmark-circle" size={36} color={Colors.success} />
              <Text style={styles.doneShiftTitle}>Shift Finished Today</Text>
              <Text style={styles.doneShiftSub}>
                Logged {todayRecord?.workingHours || 0} hrs • {formatTime(todayRecord?.checkIn)} to{" "}
                {formatTime(todayRecord?.checkOut)}
              </Text>
            </View>
          ) : (
            <View style={styles.punchInBox}>
              {/* Job Selector */}
              <Text style={styles.inputLabel}>Select Active / Assigned Job</Text>
              {activeJobs.length === 0 ? (
                <View style={styles.noJobNotice}>
                  <Ionicons name="alert-circle-outline" size={18} color={Colors.warning} />
                  <Text style={styles.noJobText}>
                    No active or assigned jobs found. Accept a job from requests first to punch in.
                  </Text>
                </View>
              ) : (
                <View style={styles.jobChipsRow}>
                  {activeJobs.map((j) => (
                    <TouchableOpacity
                      key={j._id}
                      style={[
                        styles.jobChip,
                        selectedJobId === j._id && styles.jobChipSelected,
                      ]}
                      onPress={() => setSelectedJobId(j._id)}
                    >
                      <Text
                        style={[
                          styles.jobChipText,
                          selectedJobId === j._id && styles.jobChipTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {j.jobNumber || j.categoryId?.name || "Job"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.inputLabel}>Shift Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g. On-site electrical rewiring started"
                placeholderTextColor={Colors.textMuted}
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity
                style={[
                  styles.punchInBtn,
                  (!selectedJobId || activeJobs.length === 0) && styles.punchInBtnDisabled,
                ]}
                onPress={handlePunchIn}
                disabled={!selectedJobId || activeJobs.length === 0 || checkInMutation.isPending}
                activeOpacity={0.8}
              >
                {checkInMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="play-circle" size={20} color={Colors.white} />
                    <Text style={styles.punchInBtnText}>PUNCH IN (START SHIFT)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalHours} hrs</Text>
            <Text style={styles.statLabel}>Hours Logged</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalShifts}</Text>
            <Text style={styles.statLabel}>Total Shifts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.approvedDays}</Text>
            <Text style={styles.statLabel}>Present Days</Text>
          </View>
        </View>

        <Text style={styles.historySectionTitle}>Attendance History</Text>
      </View>
    );
  };

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => {
    const jobNum =
      typeof item.jobId === "object" && item.jobId
        ? item.jobId.jobNumber || item.jobId.title || "Service Job"
        : "Job Record";

    const isApproved = item.status === "approved" || item.status === "present";

    return (
      <View style={styles.historyItemCard}>
        <View style={styles.historyCardTop}>
          <View style={styles.dateGroup}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
          </View>
          <Badge
            variant={isApproved ? "success" : item.status === "rejected" ? "error" : "warning"}
            label={item.status.toUpperCase()}
          />
        </View>

        <View style={styles.historyTimeRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>PUNCH IN</Text>
            <Text style={styles.timeValue}>{formatTime(item.checkIn)}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>PUNCH OUT</Text>
            <Text style={styles.timeValue}>{formatTime(item.checkOut)}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>DURATION</Text>
            <Text style={styles.hoursValue}>
              {item.workingHours !== undefined ? `${item.workingHours} hrs` : "—"}
            </Text>
          </View>
        </View>

        <View style={styles.historyFooter}>
          <View style={styles.jobRefPill}>
            <Ionicons name="briefcase-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.jobRefText}>{jobNum}</Text>
          </View>
          {item.notes ? (
            <Text style={styles.historyNotesText} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Shift Attendance</Text>
          <Text style={styles.headerSub}>Verify on-site hours & shift logs</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={() => refetch()}
          activeOpacity={0.7}
        >
          <Ionicons name="reload" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={renderAttendanceItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="calendar-outline"
              title="No Attendance Logs Yet"
              description="Your daily punch-in logs and work hours will be recorded here."
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  refreshIconBtn: {
    padding: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl * 2,
  },
  topSection: {
    marginBottom: Spacing.md,
  },
  punchCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
    marginBottom: Spacing.base,
  },
  punchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  punchDate: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  punchCardTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  punchStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  punchBadgeActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  punchBadgeDone: {
    backgroundColor: Colors.primaryLight,
  },
  punchBadgeIdle: {
    backgroundColor: Colors.surfaceSubtle,
  },
  punchStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  punchBadgeText: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "800",
  },
  activeShiftBox: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  timerLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  timerText: {
    fontSize: 38,
    fontWeight: "900",
    color: Colors.primary,
    fontVariant: ["tabular-nums"],
    marginVertical: Spacing.xs,
  },
  shiftMetaRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  shiftMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shiftMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  punchOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    width: "100%",
    gap: 8,
    ...Shadows.md,
  },
  punchOutBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  doneShiftBox: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: 6,
  },
  doneShiftTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  doneShiftSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  punchInBox: {
    marginTop: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: Spacing.xs,
  },
  noJobNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  noJobText: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    flex: 1,
  },
  jobChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  jobChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
  },
  jobChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  jobChipText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  jobChipTextSelected: {
    color: Colors.white,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  punchInBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    gap: 8,
    ...Shadows.md,
  },
  punchInBtnDisabled: {
    opacity: 0.5,
  },
  punchInBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    ...Shadows.sm,
  },
  statValue: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  historySectionTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  historyItemCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  historyCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  dateGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyDate: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  historyTimeRow: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeBox: {
    flex: 1,
    alignItems: "center",
  },
  timeDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  timeLabel: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textMuted,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  hoursValue: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.primary,
  },
  historyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  jobRefPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  jobRefText: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "700",
    color: Colors.primary,
  },
  historyNotesText: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
    maxWidth: "50%",
  },
});
