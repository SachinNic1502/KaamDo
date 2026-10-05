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
            <Ionicons name="bookmark-outline" size={15} color={Colors.primary} />
            <Text style={styles.saveDraftText}>Save Draft</Text>
          </TouchableOpacity>
        }
      />

      {/* Stepper Progress */}
      <View style={styles.stepProgressContainer}>
        {STEPS.map((s, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.stepItem}
            onPress={() => idx <= currentStep && setCurrentStep(idx)}
            activeOpacity={idx <= currentStep ? 0.7 : 1}
          >
            <View
              style={[
                styles.stepCircle,
                idx === currentStep
                  ? styles.stepCircleActive
                  : idx < currentStep
                  ? styles.stepCircleDone
                  : styles.stepCircleInactive,
              ]}
            >
              {idx < currentStep ? (
                <Ionicons name="checkmark" size={12} color={Colors.white} />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    idx === currentStep ? styles.stepNumberActive : styles.stepNumberInactive,
                  ]}
                >
                  {idx + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabelText,
                idx === currentStep && styles.stepLabelTextActive,
                idx < currentStep && styles.stepLabelTextDone,
              ]}
              numberOfLines={1}
            >
              {s.label}
            </Text>
            {idx < STEPS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  idx < currentStep ? styles.stepLineDone : styles.stepLineInactive,
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Draft Resume Banner */}
      {draftBanner && (
        <View style={styles.draftNoticeBanner}>
          <View style={styles.draftNoticeLeft}>
            <View style={styles.draftIconBadge}>
              <Ionicons name="bookmark" size={16} color={Colors.primary} />
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
        >
          {/* STEP 0: Category & Subcategory */}
          {currentStep === 0 && (
            <View>
              {preferredWorkerName && (
                <View style={styles.preferredWorkerBadge}>
                  <Ionicons name="person-circle-outline" size={18} color={Colors.primary} />
                  <Text style={styles.preferredWorkerText}>
                    Booking directly with: {preferredWorkerName}
                  </Text>
                </View>
              )}

              <Text style={styles.stepTitle}>Select Service Trade</Text>
              <Text style={styles.stepSub}>
                What type of trade specialist do you need for this job?
              </Text>

              <View style={styles.searchBarBox}>
                <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Search trades (Electrician, Plumber, AC Repair)..."
                  placeholderTextColor={Colors.textMuted}
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                />
                {categorySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setCategorySearch("")}>
                    <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
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
                        activeOpacity={0.75}
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
                        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                          <Text
                            style={[
                              styles.choiceCardText,
                              isSelected && styles.choiceCardTextActive,
                            ]}
                          >
                            {c.name}
                          </Text>
                          <Text style={styles.choiceSubCount}>
                            {c.subcategories?.length || 0} services
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={Colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {selectedCategoryObj && selectedCategoryObj.subcategories?.length > 0 && (
                <View style={{ marginTop: Spacing.xl }}>
                  <Text style={styles.subHeading}>
                    Specific {selectedCategoryObj.name} Services
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
                          activeOpacity={0.75}
                        >
                          <View style={styles.subChoiceHeader}>
                            <Text
                              style={[
                                styles.subChoiceText,
                                isSubSelected && styles.subChoiceTextActive,
                              ]}
                            >
                              {sub.name}
                            </Text>
                            {isSubSelected && (
                              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                            )}
                          </View>
                          <View style={styles.pricePillRow}>
                            <Text style={styles.pricePill}>
                              {sub.basePrice ? `₹${sub.basePrice} base` : "Visit & Quote"}
                            </Text>
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
                Be specific so technicians can bring the right tools and materials.
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
                <View>
                  <Text style={styles.subHeading}>Attach Photos (Optional)</Text>
                  <Text style={styles.fieldHelper}>
                    Help workers inspect the issue before arriving (up to 4 photos).
                  </Text>
                </View>
                <Text style={styles.photoCountBadge}>{form.photos.length}/4</Text>
              </View>

              <View style={styles.photoGrid}>
                {form.photos.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumb}>
                    <Image source={{ uri }} style={styles.photoImg} />
                    <TouchableOpacity
                      onPress={() => removePhoto(idx)}
                      style={styles.removePhotoBtn}
                    >
                      <Ionicons name="close" size={14} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}

                {form.photos.length < 4 && (
                  <TouchableOpacity
                    onPress={pickImage}
                    style={styles.addPhotoBtn}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="camera-outline" size={24} color={Colors.primary} />
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
                Where should the technician arrive to inspect or execute work?
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
                              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
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
                {["Home", "Office", "Commercial", "Other"].map((lbl) => (
                  <TouchableOpacity
                    key={lbl}
                    onPress={() => updateForm("addressLabel", lbl)}
                    style={[
                      styles.addressLabelChip,
                      form.addressLabel === lbl && styles.addressLabelChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.addressLabelText,
                        form.addressLabel === lbl && styles.addressLabelTextActive,
                      ]}
                    >
                      {lbl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormField
                label="Street Address / Flat No."
                placeholder="Flat 402, Block B, Green Heights"
                value={form.address}
                onChangeText={(t) => updateForm("address", t)}
                required
              />

              <View style={styles.twoCol}>
                <View style={{ flex: 1, marginRight: Spacing.sm }}>
                  <FormField
                    label="City"
                    placeholder="New Delhi"
                    value={form.city}
                    onChangeText={(t) => updateForm("city", t)}
                    required
                  />
                </View>
                <View style={{ flex: 1 }}>
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
                activeOpacity={0.7}
              >
                <Ionicons
                  name={saveAddressForFuture ? "checkbox" : "square-outline"}
                  size={20}
                  color={saveAddressForFuture ? Colors.primary : Colors.textMuted}
                />
                <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                  <Text style={styles.saveAddressCheckTitle}>
                    Save this address to Address Book
                  </Text>
                  <Text style={styles.saveAddressCheckSub}>
                    Easily 1-tap select for your next booking.
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
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={form.urgency === "standard" ? Colors.primary : Colors.textSecondary}
                  />
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
                  <Ionicons
                    name="flash"
                    size={20}
                    color={form.urgency === "urgent" ? Colors.error : Colors.textSecondary}
                  />
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
              <View style={styles.quickDatesRow}>
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

              <Card style={{ marginBottom: Spacing.md }}>
                <View style={styles.reviewSection}>
                  <View style={styles.reviewSectionHeader}>
                    <Text style={styles.reviewLabel}>Trade & Service</Text>
                    <TouchableOpacity onPress={() => setCurrentStep(0)}>
                      <Text style={styles.editStepLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewValue}>
                    {form.category} • {form.subcategory}
                  </Text>
                  {selectedSubcategoryObj?.basePrice ? (
                    <Text style={styles.reviewSubPrice}>
                      Base Price: ₹{selectedSubcategoryObj.basePrice}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.reviewSection}>
                  <View style={styles.reviewSectionHeader}>
                    <Text style={styles.reviewLabel}>Work Description</Text>
                    <TouchableOpacity onPress={() => setCurrentStep(1)}>
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
                    <Text style={styles.reviewLabel}>Service Location</Text>
                    <TouchableOpacity onPress={() => setCurrentStep(2)}>
                      <Text style={styles.editStepLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewValue}>
                    {form.addressLabel}: {form.address}, {form.city}, {form.state} - {form.pincode}
                  </Text>
                </View>

                <View style={[styles.reviewSection, { borderBottomWidth: 0 }]}>
                  <View style={styles.reviewSectionHeader}>
                    <Text style={styles.reviewLabel}>Schedule & Urgency</Text>
                    <TouchableOpacity onPress={() => setCurrentStep(3)}>
                      <Text style={styles.editStepLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewValue}>
                    {form.date} at {form.time} ({form.urgency === "urgent" ? "Express" : "Standard"})
                  </Text>
                </View>
              </Card>

              <Card variant="flat" style={{ marginBottom: Spacing.lg }}>
                <View style={styles.pricingNoteRow}>
                  <Ionicons name="shield-checkmark" size={22} color={Colors.success} />
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

        <View style={styles.bottomBar}>
          {currentStep > 0 && (
            <OutlineButton
              title="Back"
              onPress={handleBack}
              fullWidth={false}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
          )}
          <PrimaryButton
            title={currentStep === STEPS.length - 1 ? "Publish Job Request" : "Continue"}
            onPress={handleNext}
            disabled={!canProceed()}
            loading={isPending}
            fullWidth={false}
            style={{ flex: currentStep > 0 ? 2 : 1 }}
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
  preferredWorkerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: 6,
  },
  preferredWorkerText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  saveDraftBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  saveDraftText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  stepProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepCircleDone: {
    backgroundColor: Colors.success,
  },
  stepCircleInactive: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumber: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepNumberInactive: {
    color: Colors.textMuted,
  },
  stepLabelText: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.textMuted,
    marginLeft: 4,
  },
  stepLabelTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  stepLabelTextDone: {
    color: Colors.textPrimary,
  },
  stepLine: {
    width: 14,
    height: 2,
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: Colors.success,
  },
  stepLineInactive: {
    backgroundColor: Colors.borderLight,
  },
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  stepSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 42,
    marginBottom: Spacing.base,
  },
  searchBarInput: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  subHeading: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
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
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  choiceCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  choiceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  choiceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceIconWrapActive: {
    backgroundColor: Colors.primary,
  },
  choiceCardText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  choiceCardTextActive: {
    color: Colors.primaryDark,
    fontWeight: "700",
  },
  choiceSubCount: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  subOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  subChoiceCard: {
    width: "48%",
    padding: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  subChoiceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  subChoiceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  subChoiceText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  subChoiceTextActive: {
    color: Colors.primaryDark,
    fontWeight: "700",
  },
  pricePillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: 4,
  },
  pricePill: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
  },
  pricingModelTag: {
    fontSize: FontSize.xxs - 1,
    color: Colors.textMuted,
  },
  quickTagsBox: {
    marginBottom: Spacing.md,
  },
  quickTagsLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  quickTagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  quickTagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 2,
  },
  quickTagText: {
    fontSize: FontSize.xxs,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  photoSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
  },
  photoCountBadge: {
    fontSize: FontSize.xs,
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
    width: 76,
    height: 76,
    borderRadius: BorderRadius.md,
    position: "relative",
  },
  photoImg: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.md,
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
  },
  addPhotoBtn: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 2,
  },
  savedAddressSection: {
    marginBottom: Spacing.lg,
  },
  savedAddressTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  savedAddressRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  savedAddressCard: {
    width: 200,
    padding: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  savedAddressCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  savedAddressCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  savedAddressIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    lineHeight: 16,
  },
  savedAddressCityPincode: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  labelChips: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  addressLabelChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressLabelChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  addressLabelText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  addressLabelTextActive: {
    color: Colors.white,
  },
  twoCol: {
    flexDirection: "row",
  },
  saveAddressCheckRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
  },
  saveAddressCheckTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  saveAddressCheckSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  urgencyRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  urgencyCard: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  urgencyCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  urgencyCardActiveUrgent: {
    borderColor: Colors.error,
    backgroundColor: "#FEF2F2",
  },
  urgencyTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 6,
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
  quickDatesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickDateChip: {
    width: "48%",
    padding: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
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
    fontWeight: "600",
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  timeSlotCard: {
    width: "48%",
    padding: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  timeSlotCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  timeSlotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  reviewSection: {
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  reviewSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  reviewLabel: {
    fontSize: FontSize.xxs,
    textTransform: "uppercase",
    fontWeight: "700",
    color: Colors.textMuted,
  },
  editStepLink: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  reviewValue: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  reviewSubPrice: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  reviewPhotosBadge: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  pricingNoteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pricingNoteTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  pricingNoteDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.sm,
  },
});
