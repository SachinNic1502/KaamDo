import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { useCategories, useCreateJob } from "../../../hooks/use-api";
import { uploadMultipleImages } from "../../../services/upload";
import * as SecureStore from "../../../services/storage";
import {
  AppHeader,
  FormField,
  PrimaryButton,
  OutlineButton,
  Card,
  useToast,
} from "../../../components/ui";

const STEPS = [
  { label: "Trade", icon: "construct-outline" as const },
  { label: "Details", icon: "document-text-outline" as const },
  { label: "Location", icon: "location-outline" as const },
  { label: "Schedule", icon: "calendar-outline" as const },
  { label: "Review", icon: "checkmark-done-outline" as const },
];

const DRAFT_KEY = "kaamdo_job_draft_v1";
const SAVED_ADDRESSES_KEY = "kaamdo_saved_addresses_v1";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const DEFAULT_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "addr_home",
    label: "Home",
    address: "B-402, Green Valley Apartments, Sector 12",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110075",
  },
  {
    id: "addr_office",
    label: "Office",
    address: "Tower 3, Level 5, Cyber Park, DLF Phase 2",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
  },
];

const getCategoryIcon = (name: string): keyof typeof Ionicons.glyphMap => {
  const n = name.toLowerCase();
  if (n.includes("plumb")) return "water-outline";
  if (n.includes("electr")) return "flash-outline";
  if (n.includes("carpent")) return "hammer-outline";
  if (n.includes("paint")) return "color-palette-outline";
  if (n.includes("ac") || n.includes("cool") || n.includes("hvac")) return "snow-outline";
  if (n.includes("clean")) return "sparkles-outline";
  if (n.includes("appliance")) return "tv-outline";
  return "construct-outline";
};

const COMMON_PROBLEMS: Record<string, string[]> = {
  plumber: [
    "Pipe Leakage",
    "Tap Broken / Dripping",
    "Drain Blocked",
    "Low Water Pressure",
    "Toilet / Commode Repair",
    "Water Tank Cleaning",
  ],
  electrician: [
    "Switch / Socket Broken",
    "Ceiling Fan Installation",
    "MCB Tripping / Sparking",
    "Wiring & Inverter Fix",
    "LED / Chandelier Fitting",
    "Appliance Power Issue",
  ],
  carpenter: [
    "Door Lock Repair",
    "Cabinet / Drawer Hinges",
    "Furniture Assembly",
    "Wooden Door Alignment",
    "New Custom Shelves",
  ],
  painter: [
    "Single Room Wall Paint",
    "Dampness / Seepage Patch",
    "Full House Repainting",
    "Door / Grill Polish",
    "Texture / Accent Wall",
  ],
  cleaning: [
    "Deep Home Cleaning",
    "Bathroom Deep Clean",
    "Kitchen Chimney / Degreasing",
    "Sofa / Carpet Shampoo",
  ],
  default: [
    "Urgent Repair Required",
    "Inspection & Cost Estimate",
    "New Unit Installation",
    "Preventive Maintenance",
    "Replacement of Faulty Part",
  ],
};

const formatDateStr = (daysAhead: number) => {
  const d = new Date(Date.now() + daysAhead * 86400000);
  return d.toISOString().split("T")[0];
};

const QUICK_DATES = [
  { label: "Today", date: formatDateStr(0), isUrgent: true },
  { label: "Tomorrow", date: formatDateStr(1), isUrgent: false },
  { label: "In 2 Days", date: formatDateStr(2), isUrgent: false },
  { label: "In 3 Days", date: formatDateStr(3), isUrgent: false },
];

const TIME_SLOTS = [
  { label: "Morning", time: "10:00", range: "09:00 AM - 12:00 PM" },
  { label: "Afternoon", time: "13:00", range: "12:00 PM - 03:00 PM" },
  { label: "Late Afternoon", time: "16:00", range: "03:00 PM - 06:00 PM" },
  { label: "Evening", time: "19:00", range: "06:00 PM - 09:00 PM" },
];

export default function CustomerCreateJobScreen({ navigation, route }: any) {
  const preselectedCategoryName = route?.params?.preselectedCategory;
  const preferredWorkerId = route?.params?.preferredWorkerId;
  const preferredWorkerName = route?.params?.preferredWorkerName;

  const user = useSelector((state: any) => state.auth.user);
  const { data: catData, isLoading: catLoading } = useCategories();
  const { mutate: createJob, isPending } = useCreateJob();
  const categories = catData?.data ?? [];
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(DEFAULT_SAVED_ADDRESSES);
  const [selectedSavedAddrId, setSelectedSavedAddrId] = useState<string | null>("addr_home");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const [draftBanner, setDraftBanner] = useState<{ step: number; category: string } | null>(null);

  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    description: "",
    urgency: "standard" as "standard" | "urgent",
    photos: [] as string[],
    addressLabel: "Home",
    address: "B-402, Green Valley Apartments, Sector 12",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110075",
    date: formatDateStr(1),
    time: "10:00",
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        const storedAddrs = await SecureStore.getItemAsync(SAVED_ADDRESSES_KEY);
        if (storedAddrs) {
          const parsed = JSON.parse(storedAddrs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
            setSelectedSavedAddrId(parsed[0].id);
            setForm((prev) => ({
              ...prev,
              addressLabel: parsed[0].label,
              address: parsed[0].address,
              city: parsed[0].city,
              state: parsed[0].state,
              pincode: parsed[0].pincode,
            }));
          }
        }

        const storedDraft = await SecureStore.getItemAsync(DRAFT_KEY);
        if (storedDraft) {
          const parsed = JSON.parse(storedDraft);
          if (parsed && parsed.form && (parsed.form.category || parsed.form.description)) {
            if (!preselectedCategoryName) {
              setDraftBanner({
                step: parsed.step ?? 0,
                category: parsed.form.category || "Service Request",
              });
            }
          }
        }
      } catch {}
    }
    loadInitialData();
  }, [preselectedCategoryName]);

  useEffect(() => {
    if (preselectedCategoryName && categories.length > 0) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === preselectedCategoryName.toLowerCase()
      );
      if (match) {
        setForm((prev) => ({
          ...prev,
          category: match.name,
          subcategory: match.subcategories?.[0]?.name || "",
        }));
      }
    }
  }, [preselectedCategoryName, categories]);

  const updateForm = (field: string, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      SecureStore.setItemAsync(
        DRAFT_KEY,
        JSON.stringify({ step: currentStep, form: updated, updatedAt: Date.now() })
      ).catch(() => {});
      return updated;
    });
  };

  const handleResumeDraft = async () => {
    try {
      const storedDraft = await SecureStore.getItemAsync(DRAFT_KEY);
      if (storedDraft) {
        const parsed = JSON.parse(storedDraft);
        if (parsed.form) {
          setForm(parsed.form);
          setCurrentStep(parsed.step || 0);
          setDraftBanner(null);
          toast.info(
            "Draft Restored",
            `Resumed booking at Step ${(parsed.step || 0) + 1}: ${STEPS[parsed.step || 0]?.label}`
          );
        }
      }
    } catch {
      toast.error("Could not load draft", "Starting fresh.");
    }
  };

  const handleDiscardDraft = async () => {
    try {
      await SecureStore.deleteItemAsync(DRAFT_KEY);
      setDraftBanner(null);
      toast.info("Draft Cleared", "Started a fresh request.");
    } catch {
      setDraftBanner(null);
    }
  };

  const handleSaveDraftExplicit = async () => {
    try {
      await SecureStore.setItemAsync(
        DRAFT_KEY,
        JSON.stringify({ step: currentStep, form, updatedAt: Date.now() })
      );
      toast.success(
        "Progress Saved",
        `Saved at Step ${currentStep + 1} (${STEPS[currentStep].label}). You can resume anytime.`
      );
    } catch {
      toast.error("Save Failed", "Could not save draft locally.");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateForm("photos", [...form.photos, result.assets[0].uri]);
      toast.info("Photo Added", "Image attached.");
    }
  };

  const removePhoto = (index: number) => {
    updateForm(
      "photos",
      form.photos.filter((_, i) => i !== index)
    );
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedSavedAddrId(addr.id);
    setForm((prev) => ({
      ...prev,
      addressLabel: addr.label,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
    toast.info("Address Selected", `Loaded "${addr.label}" address.`);
  };

  const handleAppendIssueTag = (tag: string) => {
    setForm((prev) => {
      const current = prev.description.trim();
      const updated = current ? `${current}, ${tag}` : tag;
      return { ...prev, description: updated };
    });
  };

  const selectedCategoryObj = categories.find((c) => c.name === form.category);
  const selectedSubcategoryObj = selectedCategoryObj?.subcategories?.find(
    (s) => s.name === form.subcategory
  );

  const filteredCategories = categories.filter((c) =>
    categorySearch.trim()
      ? c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        c.subcategories?.some((s) =>
          s.name.toLowerCase().includes(categorySearch.toLowerCase())
        )
      : true
  );

  const getProblemTags = (): string[] => {
    const cat = form.category.toLowerCase();
    for (const [key, tags] of Object.entries(COMMON_PROBLEMS)) {
      if (cat.includes(key)) return tags;
    }
    return COMMON_PROBLEMS.default;
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return form.category !== "" && form.subcategory !== "";
      case 1:
        return form.description.trim().length >= 10;
      case 2:
        return (
          form.address.trim().length >= 5 &&
          form.city.trim().length > 0 &&
          form.pincode.trim().length >= 6
        );
      case 3:
        return form.date.trim().length > 0 && form.time.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      SecureStore.setItemAsync(
        DRAFT_KEY,
        JSON.stringify({ step: nextStep, form, updatedAt: Date.now() })
      ).catch(() => {});
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    const scheduled = new Date(`${form.date}T${form.time}:00`);
    if (
      !selectedSubcategoryObj ||
      !form.state.trim() ||
      form.description.trim().length < 10 ||
      isNaN(scheduled.getTime()) ||
      scheduled.getTime() <= Date.now()
    ) {
      toast.warning(
        "Incomplete Details",
        "Please select a service, describe the issue (10+ characters), and pick a valid future time."
      );
      return;
    }

    let uploadedImages: string[] = [];
    if (form.photos.length > 0) {
      try {
        uploadedImages = await uploadMultipleImages(form.photos);
      } catch {
        toast.error("Photo Upload Failed", "Could not upload photos. Proceeding without photos.");
      }
    }

    createJob(
      {
        categoryId: selectedCategoryObj?._id,
        subcategoryId: selectedSubcategoryObj._id,
        pricingModel: selectedSubcategoryObj.pricingModel,
        description: form.description.trim(),
        images: uploadedImages,
        urgency: form.urgency,
        preferredWorkerId: preferredWorkerId || undefined,
        address: {
          label: form.addressLabel,
          address: form.address.trim(),
          state: form.state.trim(),
          city: form.city.trim(),
          pincode: form.pincode.trim(),
        },
        scheduledDate: scheduled.toISOString(),
        scheduledTime: form.time,
      },
      {
        onError: (err) => toast.error("Booking Failed", err.message),
        onSuccess: async (res: any) => {
          await SecureStore.deleteItemAsync(DRAFT_KEY).catch(() => {});

          if (saveAddressForFuture) {
            try {
              const newAddr: SavedAddress = {
                id: `addr_${Date.now()}`,
                label: form.addressLabel || "Home",
                address: form.address.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
              };
              const existingFiltered = savedAddresses.filter(
                (a) => a.address.toLowerCase() !== newAddr.address.toLowerCase()
              );
              const updatedList = [newAddr, ...existingFiltered].slice(0, 5);
              await SecureStore.setItemAsync(SAVED_ADDRESSES_KEY, JSON.stringify(updatedList));
            } catch {}
          }

          const createdJobId =
            res?.data?.job?._id || res?.data?._id || res?.data?.jobId || res?._id;
          toast.success(
            "Booking Posted Successfully!",
            "Your service request is broadcasted to verified professionals."
          );

          setTimeout(() => {
            if (createdJobId) {
              navigation.replace("JobDetail", { jobId: createdJobId });
            } else {
              navigation.navigate("Bookings");
            }
          }, 600);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Post a Work Request"
        subtitle={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].label}`}
        showBack
        onBack={handleBack}
        rightAction={
          <TouchableOpacity
            onPress={handleSaveDraftExplicit}
            style={styles.saveDraftBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark-outline" size={14} color={Colors.primary} />
            <Text style={styles.saveDraftText}>Save Draft</Text>
          </TouchableOpacity>
        }
      />

      {/* Top Segmented Progress Track */}
      <View style={styles.segmentedProgressRow}>
        {STEPS.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.segmentPill,
              idx < currentStep
                ? styles.segmentPillCompleted
                : idx === currentStep
                ? styles.segmentPillActive
                : styles.segmentPillInactive,
            ]}
          />
        ))}
      </View>

      {/* Modern Stepper Indicator Node Bar */}
      <View style={styles.stepProgressContainer}>
        {/* Continuous connector background line */}
        <View style={styles.stepperTrackBase}>
          <View
            style={[
              styles.stepperTrackFill,
              { width: `${(currentStep / (STEPS.length - 1)) * 100}%` },
            ]}
          />
        </View>

        {STEPS.map((s, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.stepNode}
              onPress={() => idx <= currentStep && setCurrentStep(idx)}
              activeOpacity={idx <= currentStep ? 0.7 : 1}
            >
              <View
                style={[
                  styles.stepCircle,
                  isActive
                    ? styles.stepCircleActive
                    : isDone
                    ? styles.stepCircleDone
                    : styles.stepCircleInactive,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={13} color={Colors.white} />
                ) : (
                  <Ionicons
                    name={s.icon}
                    size={13}
                    color={isActive ? Colors.white : Colors.textMuted}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabelText,
                  isActive && styles.stepLabelTextActive,
                  isDone && styles.stepLabelTextDone,
                ]}
                numberOfLines={1}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Contextual Step Breadcrumb Header */}
      <View style={styles.stepContextBar}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Step {currentStep + 1} of {STEPS.length}
          </Text>
        </View>
        <Text style={styles.stepContextTitle}>{STEPS[currentStep].label}</Text>
      </View>

      {/* Draft Resume Banner */}
      {draftBanner && (
        <View style={styles.draftNoticeBanner}>
          <View style={styles.draftNoticeLeft}>
            <View style={styles.draftIconBadge}>
              <Ionicons name="bookmark" size={15} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.draftNoticeTitle}>Unfinished Draft Found</Text>
              <Text style={styles.draftNoticeSub}>
                {draftBanner.category} • Step {draftBanner.step + 1} of {STEPS.length}
              </Text>
            </View>
          </View>
          <View style={styles.draftNoticeActions}>
            <TouchableOpacity onPress={handleDiscardDraft} style={styles.discardBtn}>
              <Text style={styles.discardBtnText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResumeDraft} style={styles.resumeBtn}>
              <Text style={styles.resumeBtnText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 0: Category & Subcategory */}
          {currentStep === 0 && (
            <View>
              {preferredWorkerName && (
                <View style={styles.preferredWorkerBadge}>
                  <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.preferredWorkerTitle}>Direct Technician Booking</Text>
                    <Text style={styles.preferredWorkerText}>
                      Assigned to {preferredWorkerName}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.stepTitle}>Select Service Trade</Text>
              <Text style={styles.stepSub}>
                Choose the required trade specialist for your job.
              </Text>

              <View style={styles.searchBarBox}>
                <Ionicons name="search-outline" size={19} color={Colors.textSecondary} />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Search trades (Electrician, Plumber, AC Repair)..."
                  placeholderTextColor={Colors.textMuted}
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                />
                {categorySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setCategorySearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.subHeading}>Available Trades</Text>
              {catLoading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading verified trades...</Text>
                </View>
              ) : (
                <View style={styles.optionsWrap}>
                  {filteredCategories.map((c) => {
                    const isSelected = form.category === c.name;
                    const iconName = getCategoryIcon(c.name);
                    return (
                      <TouchableOpacity
                        key={c._id}
                        onPress={() => {
                          updateForm("category", c.name);
                          updateForm("subcategory", c.subcategories?.[0]?.name || "");
                        }}
                        style={[
                          styles.choiceCard,
                          isSelected && styles.choiceCardActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.choiceIconWrap,
                            isSelected && styles.choiceIconWrapActive,
                          ]}
                        >
                          <Ionicons
                            name={iconName}
                            size={20}
                            color={isSelected ? Colors.white : Colors.primary}
                          />
                        </View>
                        <View style={styles.choiceCardContent}>
                          <Text
                            style={[
                              styles.choiceCardText,
                              isSelected && styles.choiceCardTextActive,
                            ]}
                            numberOfLines={1}
                          >
                            {c.name}
                          </Text>
                          <Text style={styles.choiceSubCount}>
                            {c.subcategories?.length || 0} services
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color={Colors.white}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {selectedCategoryObj && selectedCategoryObj.subcategories?.length > 0 && (
                <View style={{ marginTop: Spacing.xl }}>
                  <Text style={styles.subHeading}>
                    {selectedCategoryObj.name} Specific Services
                  </Text>
                  <Text style={styles.stepSub}>
                    Select the exact job service for accurate estimate.
                  </Text>
                  <View style={styles.subOptionsGrid}>
                    {selectedCategoryObj.subcategories.map((sub) => {
                      const isSubSelected = form.subcategory === sub.name;
                      return (
                        <TouchableOpacity
                          key={sub._id}
                          onPress={() => updateForm("subcategory", sub.name)}
                          style={[
                            styles.subChoiceCard,
                            isSubSelected && styles.subChoiceCardActive,
                          ]}
                          activeOpacity={0.8}
                        >
                          <View style={styles.subChoiceHeader}>
                            <Text
                              style={[
                                styles.subChoiceText,
                                isSubSelected && styles.subChoiceTextActive,
                              ]}
                              numberOfLines={2}
                            >
                              {sub.name}
                            </Text>
                            {isSubSelected && (
                              <View style={styles.checkBadge}>
                                <Ionicons name="checkmark" size={11} color={Colors.white} />
                              </View>
                            )}
                          </View>
                          <View style={styles.pricePillRow}>
                            <View style={styles.pricePill}>
                              <Text style={styles.pricePillText}>
                                {sub.basePrice ? `₹${sub.basePrice}` : "Quote"}
                              </Text>
                            </View>
                            <Text style={styles.pricingModelTag}>
                              {sub.pricingModel === "hourly" ? "/ hour" : "standard"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* STEP 1: Description & Photos */}
          {currentStep === 1 && (
            <View>
              <Text style={styles.stepTitle}>Describe the Problem</Text>
              <Text style={styles.stepSub}>
                Be specific so technicians arrive equipped with the right tools.
              </Text>

              {/* Quick Tags */}
              <View style={styles.quickTagsBox}>
                <Text style={styles.quickTagsLabel}>Quick Issue Tags (Tap to add):</Text>
                <View style={styles.quickTagsWrap}>
                  {getProblemTags().map((tag, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleAppendIssueTag(tag)}
                      style={styles.quickTagChip}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={13} color={Colors.primary} />
                      <Text style={styles.quickTagText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <FormField
                label="Problem Description"
                placeholder="e.g. Kitchen sink pipe is leaking under basin. Needs washer replacement."
                value={form.description}
                onChangeText={(t) => updateForm("description", t)}
                multiline
                numberOfLines={4}
                required
                helperText={`Minimum 10 characters required (${form.description.trim().length}/10)`}
              />

              <View style={styles.photoSectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subHeading}>Attach Photos (Optional)</Text>
                  <Text style={styles.fieldHelper}>
                    Help technicians inspect the fault beforehand (up to 4 photos).
                  </Text>
                </View>
                <View style={styles.photoCountBadgeWrap}>
                  <Text style={styles.photoCountBadge}>{form.photos.length}/4</Text>
                </View>
              </View>

              <View style={styles.photoGrid}>
                {form.photos.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumb}>
                    <Image source={{ uri }} style={styles.photoImg} />
                    <TouchableOpacity
                      onPress={() => removePhoto(idx)}
                      style={styles.removePhotoBtn}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={13} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}

                {form.photos.length < 4 && (
                  <TouchableOpacity
                    onPress={pickImage}
                    style={styles.addPhotoBtn}
                    activeOpacity={0.75}
                  >
                    <View style={styles.addPhotoIconCircle}>
                      <Ionicons name="camera-outline" size={22} color={Colors.primary} />
                    </View>
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* STEP 2: Address & Location */}
          {currentStep === 2 && (
            <View>
              <Text style={styles.stepTitle}>Service Location</Text>
              <Text style={styles.stepSub}>
                Provide the exact address where the technician should arrive.
              </Text>

              {savedAddresses.length > 0 && (
                <View style={styles.savedAddressSection}>
                  <Text style={styles.savedAddressTitle}>Saved Address Book</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.savedAddressRow}
                  >
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedSavedAddrId === addr.id;
                      return (
                        <TouchableOpacity
                          key={addr.id}
                          onPress={() => handleSelectSavedAddress(addr)}
                          style={[
                            styles.savedAddressCard,
                            isSelected && styles.savedAddressCardActive,
                          ]}
                          activeOpacity={0.75}
                        >
                          <View style={styles.savedAddressCardTop}>
                            <View style={styles.savedAddressIconRow}>
                              <Ionicons
                                name={addr.label.toLowerCase() === "home" ? "home-outline" : "briefcase-outline"}
                                size={15}
                                color={isSelected ? Colors.primary : Colors.textSecondary}
                              />
                              <Text
                                style={[
                                  styles.savedAddressLabel,
                                  isSelected && styles.savedAddressLabelActive,
                                ]}
                              >
                                {addr.label}
                              </Text>
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={17} color={Colors.primary} />
                            )}
                          </View>
                          <Text style={styles.savedAddressStreet} numberOfLines={2}>
                            {addr.address}
                          </Text>
                          <Text style={styles.savedAddressCityPincode}>
                            {addr.city}, {addr.pincode}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.subHeading}>Address Type</Text>
              <View style={styles.labelChips}>
                {[
                  { label: "Home", icon: "home-outline" },
                  { label: "Office", icon: "business-outline" },
                  { label: "Commercial", icon: "storefront-outline" },
                  { label: "Other", icon: "location-outline" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => updateForm("addressLabel", item.label)}
                    style={[
                      styles.addressLabelChip,
                      form.addressLabel === item.label && styles.addressLabelChipActive,
                    ]}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={13}
                      color={form.addressLabel === item.label ? Colors.white : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.addressLabelText,
                        form.addressLabel === item.label && styles.addressLabelTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormField
                label="Street Address / House / Flat No."
                placeholder="Flat 402, Block B, Green Heights"
                value={form.address}
                onChangeText={(t) => updateForm("address", t)}
                required
              />

              <View style={styles.twoColRow}>
                <View style={styles.colHalf}>
                  <FormField
                    label="City"
                    placeholder="New Delhi"
                    value={form.city}
                    onChangeText={(t) => updateForm("city", t)}
                    required
                  />
                </View>
                <View style={styles.colHalf}>
                  <FormField
                    label="State"
                    placeholder="Delhi"
                    value={form.state}
                    onChangeText={(t) => updateForm("state", t)}
                    required
                  />
                </View>
              </View>

              <FormField
                label="Pincode"
                placeholder="110075"
                keyboardType="numeric"
                maxLength={6}
                value={form.pincode}
                onChangeText={(t) => updateForm("pincode", t)}
                required
              />

              <TouchableOpacity
                onPress={() => setSaveAddressForFuture(!saveAddressForFuture)}
                style={styles.saveAddressCheckRow}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={saveAddressForFuture ? "checkbox" : "square-outline"}
                  size={21}
                  color={saveAddressForFuture ? Colors.primary : Colors.textMuted}
                />
                <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                  <Text style={styles.saveAddressCheckTitle}>
                    Save this address to Address Book
                  </Text>
                  <Text style={styles.saveAddressCheckSub}>
                    Easily 1-tap select for your future work bookings.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Preferred Date, Time & Urgency */}
          {currentStep === 3 && (
            <View>
              <Text style={styles.stepTitle}>Preferred Schedule</Text>
              <Text style={styles.stepSub}>
                When would you like the professional to arrive?
              </Text>

              <Text style={styles.subHeading}>Service Urgency</Text>
              <View style={styles.urgencyRow}>
                <TouchableOpacity
                  onPress={() => updateForm("urgency", "standard")}
                  style={[
                    styles.urgencyCard,
                    form.urgency === "standard" && styles.urgencyCardActive,
                  ]}
                  activeOpacity={0.75}
                >
                  <View style={styles.urgencyIconWrap}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={form.urgency === "standard" ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.urgencyTitle,
                      form.urgency === "standard" && styles.urgencyTitleActive,
                    ]}
                  >
                    Scheduled
                  </Text>
                  <Text style={styles.urgencySub}>Visit at chosen slot</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    updateForm("urgency", "urgent");
                    updateForm("date", formatDateStr(0));
                  }}
                  style={[
                    styles.urgencyCard,
                    form.urgency === "urgent" && styles.urgencyCardActiveUrgent,
                  ]}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.urgencyIconWrap,
                      form.urgency === "urgent" && styles.urgencyIconWrapUrgent,
                    ]}
                  >
                    <Ionicons
                      name="flash"
                      size={20}
                      color={form.urgency === "urgent" ? Colors.error : Colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.urgencyTitle,
                      form.urgency === "urgent" && styles.urgencyTitleActiveUrgent,
                    ]}
                  >
                    Urgent / Express
                  </Text>
                  <Text style={styles.urgencySub}>Technician within 60m</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.subHeading}>Select Date</Text>
              <View style={styles.quickDatesGrid}>
                {QUICK_DATES.map((item, idx) => {
                  const isSelected = form.date === item.date;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => updateForm("date", item.date)}
                      style={[
                        styles.quickDateChip,
                        isSelected && styles.quickDateChipActive,
                      ]}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.quickDateLabel,
                          isSelected && styles.quickDateLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.quickDateVal,
                          isSelected && styles.quickDateValActive,
                        ]}
                      >
                        {item.date}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.subHeading}>Preferred Time Slot</Text>
              <View style={styles.timeSlotsGrid}>
                {TIME_SLOTS.map((slot, idx) => {
                  const isSelected = form.time === slot.time;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => updateForm("time", slot.time)}
                      style={[
                        styles.timeSlotCard,
                        isSelected && styles.timeSlotCardActive,
                      ]}
                      activeOpacity={0.75}
                    >
                      <View style={styles.timeSlotHeader}>
                        <Ionicons
                          name="time-outline"
                          size={15}
                          color={isSelected ? Colors.primary : Colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.timeSlotLabel,
                            isSelected && styles.timeSlotLabelActive,
                          ]}
                        >
                          {slot.label}
                        </Text>
                      </View>
                      <Text style={styles.timeSlotRange}>{slot.range}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 4: Review & Post */}
          {currentStep === 4 && (
            <View>
              <Text style={styles.stepTitle}>Review & Confirm Request</Text>
              <Text style={styles.stepSub}>
                Check your booking details before publishing to local trade specialists.
              </Text>

              <Card style={{ marginBottom: Spacing.md, padding: Spacing.md }}>
                <View style={styles.reviewSection}>
                  <View style={styles.reviewSectionHeader}>
                    <View style={styles.reviewSectionIconTitle}>
                      <Ionicons name="construct-outline" size={16} color={Colors.primary} />
                      <Text style={styles.reviewLabel}>Trade & Service</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCurrentStep(0)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Text style={styles.editStepLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewValue}>
                    {form.category} • {form.subcategory}
                  </Text>
                  {selectedSubcategoryObj?.basePrice ? (
                    <Text style={styles.reviewSubPrice}>
                      Base Price: ₹{selectedSubcategoryObj.basePrice} ({selectedSubcategoryObj.pricingModel === "hourly" ? "hourly" : "standard"})
                    </Text>
                  ) : null}
                </View>

                <View style={styles.reviewSection}>
                  <View style={styles.reviewSectionHeader}>
                    <View style={styles.reviewSectionIconTitle}>
                      <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
                      <Text style={styles.reviewLabel}>Work Description</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCurrentStep(1)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Text style={styles.editStepLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewValue} numberOfLines={3}>
                    {form.description}
                  </Text>
                  {form.photos.length > 0 && (
                    <Text style={styles.reviewPhotosBadge}>
                      {form.photos.length} photo(s) attached
                    </Text>
                  )}
                </View>

                <View style={styles.reviewSection}>
                  <View style={styles.reviewSectionHeader}>
                    <View style={styles.reviewSectionIconTitle}>
                      <Ionicons name="location-outline" size={16} color={Colors.primary} />
                      <Text style={styles.reviewLabel}>Service Location</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCurrentStep(2)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Text style={styles.editStepLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewValue}>
                    {form.addressLabel}: {form.address}, {form.city}, {form.state} - {form.pincode}
                  </Text>
                </View>

                <View style={[styles.reviewSection, { borderBottomWidth: 0 }]}>
                  <View style={styles.reviewSectionHeader}>
                    <View style={styles.reviewSectionIconTitle}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                      <Text style={styles.reviewLabel}>Schedule & Urgency</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCurrentStep(3)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Text style={styles.editStepLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewValue}>
                    {form.date} at {form.time} ({form.urgency === "urgent" ? "Express" : "Standard"})
                  </Text>
                </View>
              </Card>

              <Card variant="flat" style={styles.guaranteeCard}>
                <View style={styles.pricingNoteRow}>
                  <View style={styles.shieldIconBadge}>
                    <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
                  </View>
                  <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                    <Text style={styles.pricingNoteTitle}>Safe & Secure Guarantee</Text>
                    <Text style={styles.pricingNoteDesc}>
                      No advance payment needed. You inspect the work, receive an itemized invoice, and settle after confirming completion OTP.
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Footer */}
        <View style={styles.bottomBar}>
          {currentStep > 0 && (
            <OutlineButton
              title="Back"
              onPress={handleBack}
              fullWidth={false}
              style={styles.backBtn}
            />
          )}
          <PrimaryButton
            title={currentStep === STEPS.length - 1 ? "Publish Job Request" : "Continue"}
            onPress={handleNext}
            disabled={!canProceed()}
            loading={isPending}
            fullWidth={false}
            style={styles.continueBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  saveDraftBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  saveDraftText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* --- Top Segmented Progress Bar --- */
  segmentedProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
    backgroundColor: Colors.surface,
  },
  segmentPill: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  segmentPillCompleted: {
    backgroundColor: Colors.success,
  },
  segmentPillActive: {
    backgroundColor: Colors.primary,
  },
  segmentPillInactive: {
    backgroundColor: Colors.borderLight,
  },

  /* --- Stepper Indicator Nodes --- */
  stepProgressContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: Colors.surface,
  },
  stepperTrackBase: {
    position: "absolute",
    top: 23,
    left: 32,
    right: 32,
    height: 2,
    backgroundColor: Colors.border,
    zIndex: 1,
  },
  stepperTrackFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  stepNode: {
    alignItems: "center",
    width: 58,
    zIndex: 2,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primaryLight2,
    ...Shadows.sm,
  },
  stepCircleDone: {
    backgroundColor: Colors.success,
  },
  stepCircleInactive: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  stepLabelText: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  stepLabelTextActive: {
    color: Colors.primary,
    fontWeight: "800",
  },
  stepLabelTextDone: {
    color: Colors.textPrimary,
  },

  /* --- Contextual Step Header Banner --- */
  stepContextBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 8,
  },
  stepBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  stepBadgeText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  stepContextTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  /* --- Draft Notice Banner --- */
  draftNoticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  draftNoticeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  draftIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  draftNoticeTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  draftNoticeSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  draftNoticeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  discardBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  discardBtnText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  resumeBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  resumeBtnText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: "700",
  },

  /* --- Scroll & Containers --- */
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  stepSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
    lineHeight: 18,
  },
  preferredWorkerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
  },
  preferredWorkerTitle: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  preferredWorkerText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  /* --- Search Bar --- */
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 46,
    marginBottom: Spacing.base,
  },
  searchBarInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  subHeading: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  loadingWrap: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },

  /* --- Category & Subcategory Grids --- */
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  choiceCard: {
    flexBasis: "48%",
    flexGrow: 1,
    maxWidth: "49%",
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    position: "relative",
  },
  choiceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  choiceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceIconWrapActive: {
    backgroundColor: Colors.primary,
  },
  choiceCardContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  choiceCardText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  choiceCardTextActive: {
    color: Colors.primaryDark,
  },
  choiceSubCount: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  subOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  subChoiceCard: {
    flexBasis: "48%",
    flexGrow: 1,
    maxWidth: "49%",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },
  subChoiceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  subChoiceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    minHeight: 36,
  },
  subChoiceText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 4,
    lineHeight: 18,
  },
  subChoiceTextActive: {
    color: Colors.primaryDark,
  },
  pricePillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: 6,
  },
  pricePill: {
    backgroundColor: Colors.primaryLight2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pricePillText: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.primaryDark,
  },
  pricingModelTag: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
  },

  /* --- Problem Tags & Photos --- */
  quickTagsBox: {
    marginBottom: Spacing.md,
  },
  quickTagsLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  quickTagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickTagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 4,
  },
  quickTagText: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  photoSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
  },
  photoCountBadgeWrap: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  photoCountBadge: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  fieldHelper: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  photoThumb: {
    width: 82,
    height: 82,
    borderRadius: BorderRadius.lg,
    position: "relative",
    ...Shadows.sm,
  },
  photoImg: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.lg,
  },
  removePhotoBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  addPhotoBtn: {
    width: 82,
    height: 82,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.borderFocus,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 3,
  },

  /* --- Address Book & Inputs --- */
  savedAddressSection: {
    marginBottom: Spacing.lg,
  },
  savedAddressTitle: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  savedAddressRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  savedAddressCard: {
    width: 220,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },
  savedAddressCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  savedAddressCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  savedAddressIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  savedAddressLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  savedAddressLabelActive: {
    color: Colors.primaryDark,
  },
  savedAddressStreet: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  savedAddressCityPincode: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  labelChips: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.base,
    flexWrap: "wrap",
  },
  addressLabelChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 5,
  },
  addressLabelChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  addressLabelText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  addressLabelTextActive: {
    color: Colors.white,
  },
  twoColRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  colHalf: {
    flex: 1,
  },
  saveAddressCheckRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },
  saveAddressCheckTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  saveAddressCheckSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  /* --- Urgency & Schedule --- */
  urgencyRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  urgencyCard: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },
  urgencyCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  urgencyCardActiveUrgent: {
    borderColor: Colors.error,
    backgroundColor: "#FEF2F2",
  },
  urgencyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  urgencyIconWrapUrgent: {
    backgroundColor: "#FEE2E2",
  },
  urgencyTitle: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  urgencyTitleActive: {
    color: Colors.primaryDark,
  },
  urgencyTitleActiveUrgent: {
    color: Colors.error,
  },
  urgencySub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickDatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickDateChip: {
    flexBasis: "48%",
    flexGrow: 1,
    maxWidth: "49%",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },
  quickDateChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  quickDateLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  quickDateLabelActive: {
    color: Colors.primaryDark,
  },
  quickDateVal: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickDateValActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  timeSlotCard: {
    flexBasis: "48%",
    flexGrow: 1,
    maxWidth: "49%",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },
  timeSlotCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  timeSlotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeSlotLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  timeSlotLabelActive: {
    color: Colors.primaryDark,
  },
  timeSlotRange: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  /* --- Review Section --- */
  reviewSection: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  reviewSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewSectionIconTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewLabel: {
    fontSize: FontSize.xxs,
    textTransform: "uppercase",
    fontWeight: "800",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  editStepLink: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.primary,
  },
  reviewValue: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 20,
    marginTop: 2,
  },
  reviewSubPrice: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 3,
  },
  reviewPhotosBadge: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  guaranteeCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  pricingNoteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  shieldIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  pricingNoteTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "800",
    color: "#166534",
  },
  pricingNoteDesc: {
    fontSize: FontSize.xs,
    color: "#15803D",
    marginTop: 2,
    lineHeight: 18,
  },

  /* --- Bottom Bar --- */
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === "ios" ? 28 : Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    flex: 1,
  },
  continueBtn: {
    flex: 2,
  },
});
