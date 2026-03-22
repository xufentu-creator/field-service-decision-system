const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Field Service Decision System (MVP Backend)
 *
 * This backend supports structured decision workflows
 * for repair and renovation scenarios.
 *
 * Design direction:
 * Human judgment is preserved as a structural constraint.
 */

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const dataDir = path.join(__dirname, "data");
const requestsFile = path.join(dataDir, "requests.json");
const bookingsFile = path.join(dataDir, "bookings.json");
const workersFile = path.join(dataDir, "workers.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function ensureFile(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
  }
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read JSON from ${filePath}:`, error);
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function seedWorkersIfEmpty() {
  const workers = readJson(workersFile);
  if (Array.isArray(workers) && workers.length > 0) {
    return;
  }

  const demoWorkers = [
    {
      workerId: "wk_001",
      name: "David Chen",
      trade: "Cabinet Repair",
      serviceArea: "Los Angeles",
      phone: "222-333-4444",
      email: "david@example.com",
      experienceYears: 8,
      status: "active"
    },
    {
      workerId: "wk_002",
      name: "James Lee",
      trade: "Closet Installation",
      serviceArea: "Orange County",
      phone: "555-666-7777",
      email: "james@example.com",
      experienceYears: 5,
      status: "active"
    }
  ];

  writeJson(workersFile, demoWorkers);
}

function getMockPreviewImages(issueType) {
  const base = "https://via.placeholder.com/900x600?text=";
  return {
    basic: `${base}${encodeURIComponent(`${issueType} - Basic`)}`,
    standard: `${base}${encodeURIComponent(`${issueType} - Standard`)}`,
    premium: `${base}${encodeURIComponent(`${issueType} - Premium`)}`
  };
}

function inferIssueType(currentIssue, desiredResult) {
  const text = `${currentIssue} ${desiredResult}`.toLowerCase();

  if (text.includes("cabinet") || text.includes("柜") || text.includes("橱柜")) {
    return "Cabinet";
  }
  if (text.includes("closet") || text.includes("衣柜")) {
    return "Closet";
  }
  if (text.includes("wall") || text.includes("墙")) {
    return "Wall";
  }
  if (text.includes("kitchen") || text.includes("厨房")) {
    return "Kitchen";
  }
  if (text.includes("bathroom") || text.includes("浴室")) {
    return "Bathroom";
  }

  return "Space";
}

function buildOptions({ currentIssue, desiredResult, budgetPreference, stylePreference }) {
  const issueType = inferIssueType(currentIssue, desiredResult);
  const previews = getMockPreviewImages(issueType);

  const budget = normalizeString(budgetPreference, "balanced").toLowerCase();
  const style = normalizeString(stylePreference, "clean");

  let basicPrice = "$150-$300";
  let standardPrice = "$400-$700";
  let premiumPrice = "$900+";

  if (issueType === "Kitchen" || issueType === "Cabinet" || issueType === "Closet") {
    basicPrice = "$300-$800";
    standardPrice = "$900-$1800";
    premiumPrice = "$2500+";
  }

  if (budget.includes("low") || budget.includes("控制预算")) {
    basicPrice = issueType === "Space" ? "$120-$250" : basicPrice;
  }

  return [
    {
      optionId: createId("opt_basic"),
      name: "基础方案",
      nameEn: "Basic",
      description: "优先解决当前可见问题，适合控制预算或先恢复基本使用。",
      descriptionEn: "Fixes visible issues first, suitable for budget-conscious needs.",
      previewImage: previews.basic,
      materialLevel: "标准",
      materialLevelEn: "Standard",
      serviceScope: "局部修复 / 基础处理",
      serviceScopeEn: "Partial repair / basic treatment",
      estimatedTime: "2-4小时",
      estimatedTimeEn: "2-4 hours",
      stylePreference: style,
      priceRange: basicPrice
    },
    {
      optionId: createId("opt_standard"),
      name: "标准方案",
      nameEn: "Standard",
      description: "兼顾外观、完成度与预算，适合大多数常见场景。",
      descriptionEn: "Balances finish quality and budget for most common scenarios.",
      previewImage: previews.standard,
      materialLevel: "升级",
      materialLevelEn: "Enhanced",
      serviceScope: "修复 + 表面处理",
      serviceScopeEn: "Repair + surface finishing",
      estimatedTime: "4-6小时",
      estimatedTimeEn: "4-6 hours",
      stylePreference: style,
      priceRange: standardPrice
    },
    {
      optionId: createId("opt_premium"),
      name: "升级方案",
      nameEn: "Premium",
      description: "适用于希望提升整体效果、材质和长期使用体验的情况。",
      descriptionEn: "For higher finish quality, better materials, and longer-term results.",
      previewImage: previews.premium,
      materialLevel: "高级",
      materialLevelEn: "Premium",
      serviceScope: "完整处理 / 升级完成",
      serviceScopeEn: "Complete treatment / upgraded finish",
      estimatedTime: "1-2天",
      estimatedTimeEn: "1-2 days",
      stylePreference: style,
      priceRange: premiumPrice
    }
  ];
}

ensureDataDir();
ensureFile(requestsFile, []);
ensureFile(bookingsFile, []);
ensureFile(workersFile, []);
seedWorkersIfEmpty();

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Field Service Decision System backend is running."
  });
});

/**
 * Generate options based on current issue and desired result.
 */
app.post("/api/generate-options", (req, res) => {
  try {
    const imageUrl = normalizeString(req.body.imageUrl, "");
    const currentIssue = normalizeString(req.body.currentIssue, "");
    const desiredResult = normalizeString(req.body.desiredResult, "");
    const budgetPreference = normalizeString(req.body.budgetPreference, "balanced");
    const stylePreference = normalizeString(req.body.stylePreference, "");

    if (!currentIssue && !desiredResult) {
      return res.status(400).json({
        error: "At least one of currentIssue or desiredResult is required."
      });
    }

    const requestId = createId("req");
    const options = buildOptions({
      currentIssue,
      desiredResult,
      budgetPreference,
      stylePreference
    });

    const boundaryNote =
      "当前结果基于可见条件和输入信息生成，最终方案与价格可能因现场情况调整。";

    const decisionContext = {
      type: "structured_decision",
      uncertainty: "partial_visibility",
      choiceRemainsWithUser: true
    };

    const requestRecord = {
      requestId,
      imageUrl,
      currentIssue,
      desiredResult,
      budgetPreference,
      stylePreference,
      options,
      boundaryNote,
      decisionContext,
      createdAt: new Date().toISOString()
    };

    const requests = readJson(requestsFile);
    requests.push(requestRecord);
    writeJson(requestsFile, requests);

    return res.json({
      requestId,
      options,
      boundaryNote,
      decisionContext
    });
  } catch (error) {
    console.error("Error in /api/generate-options:", error);
    return res.status(500).json({
      error: "Failed to generate options."
    });
  }
});

/**
 * Create a booking after the user selects an option.
 */
app.post("/api/bookings", (req, res) => {
  try {
    const requestId = normalizeString(req.body.requestId, "");
    const optionId = normalizeString(req.body.optionId, "");
    const customerName = normalizeString(req.body.customerName, "");
    const phone = normalizeString(req.body.phone, "");
    const email = normalizeString(req.body.email, "");
    const address = normalizeString(req.body.address, "");
    const preferredDate = normalizeString(req.body.preferredDate, "");
    const preferredTime = normalizeString(req.body.preferredTime, "");
    const notes = normalizeString(req.body.notes, "");

    if (!requestId || !optionId || !customerName || !phone || !address) {
      return res.status(400).json({
        error: "requestId, optionId, customerName, phone, and address are required."
      });
    }

    const requests = readJson(requestsFile);
    const requestRecord = requests.find((item) => item.requestId === requestId);

    if (!requestRecord) {
      return res.status(404).json({
        error: "Request not found."
      });
    }

    const selectedOption = requestRecord.options.find(
      (item) => item.optionId === optionId
    );

    if (!selectedOption) {
      return res.status(404).json({
        error: "Selected option not found."
      });
    }

    const bookingId = createId("bk");

    const bookingRecord = {
      bookingId,
      status: "pending_confirmation",
      customer: {
        name: customerName,
        phone,
        email
      },
      serviceAddress: address,
      preferredDate,
      preferredTime,
      notes,
      request: {
        requestId: requestRecord.requestId,
        currentIssue: requestRecord.currentIssue,
        desiredResult: requestRecord.desiredResult,
        imageUrl: requestRecord.imageUrl
      },
      selectedOption: {
        optionId: selectedOption.optionId,
        name: selectedOption.name,
        nameEn: selectedOption.nameEn,
        description: selectedOption.description,
        previewImage: selectedOption.previewImage,
        priceRange: selectedOption.priceRange
      },
      boundaryNote: requestRecord.boundaryNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const bookings = readJson(bookingsFile);
    bookings.push(bookingRecord);
    writeJson(bookingsFile, bookings);

    return res.status(201).json({
      success: true,
      bookingId,
      status: bookingRecord.status,
      message: "预约已提交，后续将联系你确认最终方案与价格。"
    });
  } catch (error) {
    console.error("Error in /api/bookings:", error);
    return res.status(500).json({
      error: "Failed to create booking."
    });
  }
});

/**
 * Get all bookings for admin/backend use.
 */
app.get("/api/bookings", (req, res) => {
  try {
    const bookings = readJson(bookingsFile);
    return res.json(bookings);
  } catch (error) {
    console.error("Error in GET /api/bookings:", error);
    return res.status(500).json({
      error: "Failed to read bookings."
    });
  }
});

/**
 * Get a single booking by ID.
 */
app.get("/api/bookings/:bookingId", (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookings = readJson(bookingsFile);
    const booking = bookings.find((item) => item.bookingId === bookingId);

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found."
      });
    }

    return res.json(booking);
  } catch (error) {
    console.error("Error in GET /api/bookings/:bookingId:", error);
    return res.status(500).json({
      error: "Failed to read booking."
    });
  }
});

/**
 * Get worker list.
 */
app.get("/api/workers", (req, res) => {
  try {
    const workers = readJson(workersFile);
    return res.json(workers);
  } catch (error) {
    console.error("Error in GET /api/workers:", error);
    return res.status(500).json({
      error: "Failed to read workers."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
