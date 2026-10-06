const mongoose = require("mongoose");
require("dotenv").config({ path: [".env.local", ".env"] });

const defaultCategories = [
  {
    name: "Electrician",
    slug: "electrician",
    description: "Certified electricians for switches, wiring, fans, appliances, and home power systems.",
    isActive: true,
    subcategories: [
      {
        name: "Switch & Socket Repair",
        description: "Diagnosis and replacement of faulty electrical switches, modular plates, and sockets.",
        basePrice: 149,
        pricingModel: "visit",
        estimatedDuration: 30,
        isActive: true,
      },
      {
        name: "Fan Installation & Repair",
        description: "Ceiling fan, exhaust fan, or decorative chandelier installation and regulator fixing.",
        basePrice: 199,
        pricingModel: "fixed",
        estimatedDuration: 45,
        isActive: true,
      },
      {
        name: "MCB & Distribution Board Fixing",
        description: "Single/double pole MCB tripping repair, fuse replacement, and main box inspection.",
        basePrice: 299,
        pricingModel: "fixed",
        estimatedDuration: 45,
        isActive: true,
      },
      {
        name: "Complete House Wiring Inspection",
        description: "End-to-end electrical wiring audit, earthing test, and concealed wire fault finding.",
        basePrice: 499,
        pricingModel: "visit",
        estimatedDuration: 90,
        isActive: true,
      },
    ],
  },
  {
    name: "Plumbing",
    slug: "plumbing",
    description: "Expert plumbers for taps, leakages, pipes, sanitary fittings, and water tanks.",
    isActive: true,
    subcategories: [
      {
        name: "Tap Leakage & Mixer Repair",
        description: "Fix dripping taps, single lever mixers, bib cocks, and washer replacements.",
        basePrice: 149,
        pricingModel: "visit",
        estimatedDuration: 30,
        isActive: true,
      },
      {
        name: "Toilet & Flush Tank Repair",
        description: "Western or Indian commode syphon repair, float valve, and inlet pipe fixing.",
        basePrice: 299,
        pricingModel: "fixed",
        estimatedDuration: 60,
        isActive: true,
      },
      {
        name: "Pipe Blockage & Drain Cleaning",
        description: "Kitchen sink, bathroom floor trap, or drainage pipe unblocking using pressure tools.",
        basePrice: 399,
        pricingModel: "fixed",
        estimatedDuration: 60,
        isActive: true,
      },
      {
        name: "Overhead Water Tank Cleaning",
        description: "Hygienic 4-stage mechanized cleaning and disinfection of domestic rooftop tanks.",
        basePrice: 799,
        pricingModel: "fixed",
        estimatedDuration: 120,
        isActive: true,
      },
    ],
  },
  {
    name: "AC & Appliance Repair",
    slug: "ac-repair",
    description: "Skilled technicians for split & window ACs, washing machines, and refrigerators.",
    isActive: true,
    subcategories: [
      {
        name: "Split AC Jet Foam Servicing",
        description: "Deep power jet cleaning of indoor cooling coils, filters, outdoor unit, and tray.",
        basePrice: 499,
        pricingModel: "fixed",
        estimatedDuration: 60,
        isActive: true,
      },
      {
        name: "AC Gas Leakage Check & Refill",
        description: "Nitrogen pressure leak detection, brazing repair, and eco-friendly refrigerant top-up.",
        basePrice: 1499,
        pricingModel: "fixed",
        estimatedDuration: 90,
        isActive: true,
      },
      {
        name: "Washing Machine Diagnosis",
        description: "Inspection of drum vibration, drainage motor, inlet valve, or PCB control errors.",
        basePrice: 249,
        pricingModel: "visit",
        estimatedDuration: 45,
        isActive: true,
      },
      {
        name: "Refrigerator Cooling Repair",
        description: "Thermostat, compressor relay, defrost timer, and cooling coil diagnostics.",
        basePrice: 249,
        pricingModel: "visit",
        estimatedDuration: 45,
        isActive: true,
      },
    ],
  },
  {
    name: "Carpentry",
    slug: "carpentry",
    description: "Master carpenters for wooden doors, locks, modular furniture assembly, and fittings.",
    isActive: true,
    subcategories: [
      {
        name: "Door Lock & Handle Fitting",
        description: "Installation or repair of mortise locks, cylindrical locks, and safety chains.",
        basePrice: 199,
        pricingModel: "fixed",
        estimatedDuration: 30,
        isActive: true,
      },
      {
        name: "Modular Furniture Assembly",
        description: "Flat-pack IKEA/Amazon bed, wardrobe, table, or desk precision assembly.",
        basePrice: 250,
        pricingModel: "hourly",
        estimatedDuration: 60,
        isActive: true,
      },
      {
        name: "Cupboard Hinge & Channel Repair",
        description: "Hydraulic soft-close hinge realignment and smooth drawer telescopic channel replacement.",
        basePrice: 299,
        pricingModel: "fixed",
        estimatedDuration: 45,
        isActive: true,
      },
    ],
  },
  {
    name: "Painting & Waterproofing",
    slug: "painting",
    description: "Interior wall painting, texture finish, primer application, and moisture waterproofing.",
    isActive: true,
    subcategories: [
      {
        name: "Single Room Interior Painting",
        description: "Two-coat premium acrylic emulsion painting including wall putty patch touch-ups.",
        basePrice: 2499,
        pricingModel: "fixed",
        estimatedDuration: 240,
        isActive: true,
      },
      {
        name: "Full Home Painting Consultation",
        description: "Laser measurement, wall moisture testing, color shade catalog, and written estimate.",
        basePrice: 499,
        pricingModel: "visit",
        estimatedDuration: 90,
        isActive: true,
      },
      {
        name: "Ceiling Waterproofing & Sealing",
        description: "Dr. Fixit elastomeric damp-proof coating on seepage cracks and balcony joints.",
        basePrice: 399,
        pricingModel: "visit",
        estimatedDuration: 90,
        isActive: true,
      },
    ],
  },
  {
    name: "Cleaning & Pest Control",
    slug: "cleaning",
    description: "Professional house cleaning, kitchen scrubbing, bathroom sanitization, and pest prevention.",
    isActive: true,
    subcategories: [
      {
        name: "Full Home Deep Cleaning",
        description: "Intensive floor scrubbing, window pane cleaning, dusting, and full home sanitization.",
        basePrice: 1999,
        pricingModel: "fixed",
        estimatedDuration: 300,
        isActive: true,
      },
      {
        name: "Bathroom Deep Disinfection",
        description: "Hard water stain removal from tiles, taps, mirrors, and sanitary ware descaling.",
        basePrice: 399,
        pricingModel: "fixed",
        estimatedDuration: 60,
        isActive: true,
      },
      {
        name: "Kitchen Chimney & Degreasing",
        description: "Baffle filter cleaning, oil collector degreasing, and kitchen platform cleaning.",
        basePrice: 699,
        pricingModel: "fixed",
        estimatedDuration: 90,
        isActive: true,
      },
    ],
  },
];

async function seedMarketplace() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/kaamdo";
  console.log(`Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri);

    const db = mongoose.connection.db;
    const categoriesCol = db.collection("servicecategories");
    const settingsCol = db.collection("platformsettings");

    console.log("Seeding service categories...");
    for (const cat of defaultCategories) {
      const exists = await categoriesCol.findOne({ slug: cat.slug });
      if (exists) {
        console.log(`Category "${cat.name}" already exists, updating subcategories...`);
        await categoriesCol.updateOne(
          { slug: cat.slug },
          { $set: { description: cat.description, subcategories: cat.subcategories, isActive: true } }
        );
      } else {
        await categoriesCol.insertOne({
          ...cat,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`Created category "${cat.name}" with ${cat.subcategories.length} subcategories.`);
      }
    }

    console.log("Seeding default platform settings...");
    const existingSettings = await settingsCol.findOne({});
    if (!existingSettings) {
      await settingsCol.insertOne({
        platformName: "KaamDo",
        tagline: "Har Kaam, Sahi Insaan",
        supportEmail: "support@kaamdo.com",
        supportPhone: "+91 1800-123-4567",
        description: "One platform for getting local work done.",
        commissionRules: [
          { category: "Electrician", type: "percentage", value: 10 },
          { category: "Plumbing", type: "percentage", value: 12 },
          { category: "AC Repair", type: "percentage", value: 10 },
          { category: "Carpentry", type: "percentage", value: 10 },
          { category: "Cleaning", type: "percentage", value: 15 },
          { category: "Painting Contract", type: "percentage", value: 5 },
          { category: "Labor", type: "fixed", value: 30 },
        ],
        cancellationPolicies: [
          { status: "Before assignment", fee: "Free" },
          { status: "After assignment", fee: "5% of job value" },
          { status: "Worker en route", fee: "Visit charge" },
          { status: "Worker arrived", fee: "Full visit charge" },
          { status: "Work started", fee: "No cancellation" },
        ],
        notifications: [
          { name: "New Job", description: "Send notification for new job events", enabled: true },
          { name: "Job Accepted", description: "Send notification when job is accepted", enabled: true },
          { name: "Worker Assigned", description: "Send notification when worker is assigned", enabled: true },
          { name: "Payment Received", description: "Send notification for payment received", enabled: true },
          { name: "Dispute Update", description: "Send notification for dispute updates", enabled: true },
          { name: "KYC Status", description: "Send notification for KYC status changes", enabled: true },
        ],
        serviceAreas: ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Kolkata"],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Platform settings initialized.");
    } else {
      console.log("Platform settings already exist.");
    }

    console.log("Seeding demo role users...");
    const bcrypt = require("bcryptjs");
    const usersCol = db.collection("users");
    const workerProfilesCol = db.collection("workerprofiles");
    const contractorProfilesCol = db.collection("contractorprofiles");

    try {
      await workerProfilesCol.dropIndex("skills_1_serviceAreas_1_isOnline_1");
    } catch {}

    const demoUsers = [
      {
        name: "Super Admin",
        phone: "9876543210",
        email: "admin@kaamdo.com",
        passwordRaw: "AdminPassword123!",
        role: "admin",
      },
      {
        name: "Vikram Sharma (Customer)",
        phone: "9876543211",
        email: "vikram@example.com",
        passwordRaw: "CustomerPass123!",
        role: "customer",
      },
      {
        name: "Ramesh Kumar (Worker)",
        phone: "9876543212",
        email: "ramesh@example.com",
        passwordRaw: "WorkerPass123!",
        role: "worker",
        skills: ["Electrician", "Wiring", "Switch & Socket Repair"],
        experience: 6,
        serviceAreas: ["Bengaluru", "Koramangala"],
        hourlyRate: 299,
        dailyRate: 1499,
        rating: 4.9,
        totalJobs: 142,
        avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
      },
      {
        name: "Apex Builders (Contractor)",
        phone: "9876543213",
        email: "apex.contractors@example.com",
        passwordRaw: "ContractorPass123!",
        role: "contractor",
      },
      {
        name: "Mohammad Riaz",
        phone: "9876543214",
        email: "riaz@example.com",
        passwordRaw: "WorkerPass123!",
        role: "worker",
        skills: ["Electrician", "MCB Wiring", "Switchboard Repair"],
        experience: 8,
        serviceAreas: ["Bengaluru", "Indiranagar"],
        hourlyRate: 299,
        dailyRate: 1599,
        rating: 4.9,
        totalJobs: 320,
        avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
      },
      {
        name: "Dinesh Sharma",
        phone: "9876543215",
        email: "dinesh@example.com",
        passwordRaw: "WorkerPass123!",
        role: "worker",
        skills: ["Plumbing", "Leakage Repair", "Sanitary Fittings"],
        experience: 6,
        serviceAreas: ["Pune", "Kothrud"],
        hourlyRate: 249,
        dailyRate: 1399,
        rating: 4.8,
        totalJobs: 215,
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80",
      },
      {
        name: "Vikram Chauhan",
        phone: "9876543216",
        email: "chauhan@example.com",
        passwordRaw: "WorkerPass123!",
        role: "worker",
        skills: ["AC & Appliance Repair", "Gas Refill", "Split AC Installation"],
        experience: 10,
        serviceAreas: ["Delhi NCR", "Noida", "Sector 62"],
        hourlyRate: 399,
        dailyRate: 1899,
        rating: 4.9,
        totalJobs: 410,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
      },
      {
        name: "Rameshwar Prajapati",
        phone: "9876543217",
        email: "prajapati@example.com",
        passwordRaw: "WorkerPass123!",
        role: "worker",
        skills: ["Carpentry", "Door Lock Fitting", "Custom Shelving"],
        experience: 7,
        serviceAreas: ["Mumbai", "Andheri West"],
        hourlyRate: 349,
        dailyRate: 1699,
        rating: 4.85,
        totalJobs: 180,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
      },
      {
        name: "Girish Nayak",
        phone: "9876543218",
        email: "girish@example.com",
        passwordRaw: "WorkerPass123!",
        role: "worker",
        skills: ["Painting & Waterproofing", "Interior Painting", "Wall Texture"],
        experience: 5,
        serviceAreas: ["Hyderabad", "Madhapur"],
        hourlyRate: 299,
        dailyRate: 1400,
        rating: 4.75,
        totalJobs: 135,
        avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=160&auto=format&fit=crop&q=80",
      },
    ];

    for (const u of demoUsers) {
      const hashedPassword = await bcrypt.hash(u.passwordRaw, 10);
      const existingUser = await usersCol.findOne({ phone: u.phone });
      let userId;

      if (!existingUser) {
        const insertRes = await usersCol.insertOne({
          name: u.name,
          phone: u.phone,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          avatar: u.avatar,
          isActive: true,
          isPhoneVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        userId = insertRes.insertedId;
        console.log(`Created demo user [${u.role}]: ${u.phone} (${u.passwordRaw})`);
      } else {
        userId = existingUser._id;
        await usersCol.updateOne(
          { _id: userId },
          { $set: { password: hashedPassword, role: u.role, avatar: u.avatar || existingUser.avatar, isActive: true, isPhoneVerified: true } }
        );
        console.log(`Updated demo user [${u.role}]: ${u.phone}`);
      }

      // If worker, ensure WorkerProfile exists
      if (u.role === "worker") {
        const existingProfile = await workerProfilesCol.findOne({ userId });
        if (!existingProfile) {
          await workerProfilesCol.insertOne({
            userId,
            skills: u.skills || ["Electrician", "Wiring", "Switch & Socket Repair"],
            experience: u.experience || 5,
            serviceAreas: u.serviceAreas || ["Bengaluru"],
            hourlyRate: u.hourlyRate || 299,
            dailyRate: u.dailyRate || 1499,
            status: "verified",
            isOnline: true,
            rating: u.rating || 4.8,
            totalJobs: u.totalJobs || 100,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log(`Created verified WorkerProfile for ${u.name}.`);
        } else {
          await workerProfilesCol.updateOne(
            { userId },
            {
              $set: {
                skills: u.skills || existingProfile.skills,
                experience: u.experience || existingProfile.experience,
                serviceAreas: u.serviceAreas || existingProfile.serviceAreas,
                hourlyRate: u.hourlyRate || existingProfile.hourlyRate,
                status: "verified",
                isOnline: true,
                rating: u.rating || existingProfile.rating,
              }
            }
          );
        }
      }

      // If contractor, ensure ContractorProfile exists
      if (u.role === "contractor") {
        const existingContractor = await contractorProfilesCol.findOne({ userId });
        if (!existingContractor) {
          await contractorProfilesCol.insertOne({
            userId,
            companyName: "Apex Infrastructure & Renovations",
            specialization: ["Full Home Renovation", "Commercial Painting", "Plumbing Contracting"],
            experienceYears: 12,
            verified: true,
            rating: 4.8,
            completedProjects: 38,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log("Created verified ContractorProfile for Apex Builders.");
        }
      }
    }

    console.log("Marketplace seeding completed successfully!");
  } catch (error) {
    console.error("Marketplace seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedMarketplace();
