import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { uploadMultipleImages } from '../../services/upload';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { Colors, Spacing, FontSize } from '../../constants';
import { useCategories, useCreateJob } from '../../hooks/use-api';

const steps = ['Category', 'Issue', 'Address', 'Date & Time', 'Review'];

interface JobFormData {
  category: string;
  subcategory: string;
  description: string;
  photos: string[];
  addressLabel: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  date: string;
  time: string;
}

export default function CreateJobScreen() {
  const user = useSelector((state: any) => state.auth.user);
  const { data: catData } = useCategories();
  const { mutate: createJob, isPending } = useCreateJob();
  const categories = catData?.data ?? [];
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<JobFormData>({
    category: '',
    subcategory: '',
    description: '',
    photos: [],
    addressLabel: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    date: '',
    time: '',
  });

  const updateForm = (field: keyof JobFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateForm('photos', [...form.photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    const updated = form.photos.filter((_, i) => i !== index);
    updateForm('photos', updated);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return form.category !== '' && form.subcategory !== '';
      case 1:
        return form.description.trim().length > 0;
      case 2:
        return form.address.trim().length > 0 && form.city.trim().length > 0 && form.pincode.trim().length > 0;
      case 3:
        return form.date.trim().length > 0 && form.time.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    const selectedCategory = categories.find((c) => c.name === form.category);
    const subcategory = selectedCategory?.subcategories.find(s => s.name === form.subcategory);
    const scheduled = new Date(form.date + 'T' + form.time + ':00');
    if (!subcategory || !form.state.trim() || form.description.trim().length < 10 || !Number.isFinite(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
      Alert.alert('Check booking', 'Choose a service, enter at least 10 characters, your state, and a future date (YYYY-MM-DD) and time (HH:mm).');
      return;
    }
    let images: string[];
    try { images = await uploadMultipleImages(form.photos); }
    catch { Alert.alert('Upload failed', 'Your photos could not be uploaded. Try again or remove them.'); return; }
    createJob(
      {
        categoryId: selectedCategory?._id,
        subcategoryId: subcategory._id,
        pricingModel: subcategory.pricingModel,
        description: form.description,
        images,
        address: {
          label: form.addressLabel,
          address: form.address,
          state: form.state,
          city: form.city,
          pincode: form.pincode,
        },
        scheduledDate: scheduled.toISOString(),
        scheduledTime: form.time,

      },
      {
        onError: (error) => Alert.alert('Booking failed', error.message),
        onSuccess: () => {
          Alert.alert('Job Created', 'Your job has been submitted successfully!', [
            { text: 'OK' },
          ]);
        },
      }
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              index < currentStep && styles.stepCompleted,
              index === currentStep && styles.stepActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                (index < currentStep || index === currentStep) && styles.stepNumberActive,
              ]}
            >
              {index < currentStep ? '✓' : index + 1}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              index === currentStep && styles.stepLabelActive,
            ]}
          >
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderCategoryStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Select Category</Text>
      <View style={styles.categoryGrid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            style={[styles.categoryCard, form.category === cat.name && styles.categoryCardActive]}
            onPress={() => {
              updateForm('category', cat.name);
              updateForm('subcategory', '');
            }}
          >
            <Text style={[styles.categoryName, form.category === cat.name && styles.categoryNameActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {form.category !== '' && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Select Subcategory</Text>
          <View style={styles.categoryGrid}>
            {categories
              .find((c) => c.name === form.category)
              ?.subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub._id ?? sub.name}
                  style={[styles.subcategoryCard, form.subcategory === sub.name && styles.subcategoryCardActive]}
                  onPress={() => updateForm('subcategory', sub.name)}
                >
                  <Text
                    style={[
                      styles.subcategoryName,
                      form.subcategory === sub.name && styles.subcategoryNameActive,
                    ]}
                  >
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </>
      )}
    </View>
  );

  const renderIssueStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Describe the Issue</Text>
      <Text style={styles.fieldLabel}>Description *</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        placeholder="Describe the issue in detail..."
        placeholderTextColor={Colors.gray}
        value={form.description}
        onChangeText={(val) => updateForm('description', val)}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Photos (Optional)</Text>
      <TouchableOpacity style={styles.photoUploadBtn} onPress={pickImage}>
        <Text style={styles.photoUploadText}>+ Add Photo</Text>
      </TouchableOpacity>

      {form.photos.length > 0 && (
        <View style={styles.photoGrid}>
          {form.photos.map((uri, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(index)}>
                <Text style={styles.removePhotoText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Select Address</Text>

      <Text style={styles.fieldLabel}>Label (e.g., Home, Office)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g., Home"
        placeholderTextColor={Colors.gray}
        value={form.addressLabel}
        onChangeText={(val) => updateForm('addressLabel', val)}
      />

      <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Address *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Street address, apt, suite, etc."
        placeholderTextColor={Colors.gray}
        value={form.address}
        onChangeText={(val) => updateForm('address', val)}
      />

      <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>City *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="City"
        placeholderTextColor={Colors.gray}
        value={form.city}
        onChangeText={(val) => updateForm('city', val)}
      />

      <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>State *</Text>
      <TextInput style={styles.textInput} placeholder="State" value={form.state} onChangeText={(value) => updateForm('state', value)} />
      <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Pincode *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Pincode"
        placeholderTextColor={Colors.gray}
        value={form.pincode}
        onChangeText={(val) => updateForm('pincode', val)}
        keyboardType="numeric"
      />
    </View>
  );

  const renderDateTimeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Select Date & Time</Text>

      <Text style={styles.fieldLabel}>Preferred Date *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="DD/MM/YYYY"
        placeholderTextColor={Colors.gray}
        value={form.date}
        onChangeText={(val) => updateForm('date', val)}
      />

      <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Preferred Time *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="HH:MM (e.g., 14:30)"
        placeholderTextColor={Colors.gray}
        value={form.time}
        onChangeText={(val) => updateForm('time', val)}
      />
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Review & Submit</Text>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Category</Text>
        <Text style={styles.reviewValue}>{form.category}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Subcategory</Text>
        <Text style={styles.reviewValue}>{form.subcategory}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Description</Text>
        <Text style={styles.reviewValue}>{form.description}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Photos</Text>
        <Text style={styles.reviewValue}>{form.photos.length} attached</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Address</Text>
        <Text style={styles.reviewValue}>
          {form.addressLabel ? `${form.addressLabel}: ` : ''}
          {form.address}, {form.city} - {form.pincode}
        </Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewLabel}>Date & Time</Text>
        <Text style={styles.reviewValue}>
          {form.date} at {form.time}
        </Text>
      </View>

      <TouchableOpacity style={[styles.submitBtn, isPending && { opacity: 0.6 }]} onPress={handleSubmit} disabled={isPending}>
        <Text style={styles.submitBtnText}>{isPending ? 'Submitting...' : 'Submit Job'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderCategoryStep();
      case 1:
        return renderIssueStep();
      case 2:
        return renderAddressStep();
      case 3:
        return renderDateTimeStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {renderStepIndicator()}

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.bottomBar}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep((prev) => prev - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < steps.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
            onPress={() => canProceed() && setCurrentStep((prev) => prev + 1)}
            disabled={!canProceed()}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepActive: {
    backgroundColor: Colors.primary,
  },
  stepCompleted: {
    backgroundColor: Colors.success,
  },
  stepNumber: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  stepContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 120,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryNameActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  subcategoryCard: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  subcategoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  subcategoryName: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  subcategoryNameActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  photoUploadBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  photoUploadText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  reviewSection: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewLabel: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
  reviewValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  nextBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginLeft: 'auto',
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: '600',
  },
});
