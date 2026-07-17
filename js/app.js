import Storage from "./modules/core/Storage.js";
import InventoryManager from "./modules/inventory/InventoryManager.js";
import SalesManager from "./modules/sales/SalesManager.js";
import Notification from "./modules/ui/Notification.js";
import Modal from "./modules/ui/Modal.js";
import {
  formatDate,
  formatCurrency,
  formatNumber,
} from "./modules/utils/Helpers.js";

/**
 * التطبيق الرئيسي - النسخة النهائية المصححة بالكامل
 */
class App {
  constructor() {
    // تهيئة المديرين
    this.storage = new Storage();
    this.inventory = new InventoryManager();
    this.sales = new SalesManager(this.inventory);
    this.notification = new Notification();
    this.modal = new Modal();

    // العناصر
    this.currentPage = "dashboard";
    this.pageContent = document.getElementById("pageContent");
    this.saleItems = [];
    this.editingProductId = null;

    this.init();
  }

  /**
   * تهيئة التطبيق - النسخة المصححة
   */
  init() {
    // عرض التاريخ الحالي
    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
      dateElement.textContent = formatDate(new Date());
    }

    // إعداد التنقل
    this.setupNavigation();

    // إعداد البحث
    this.setupSearch();

    // تحميل الصفحة الافتراضية
    this.loadPage("dashboard");

    // إضافة بيانات عينة إذا كانت فارغة
    this.loadSampleData();

    // استعادة وضع المظهر
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    }

    console.log("🚗 نظام إدارة قطع غيار السيارات - جاهز");
  }

  /**
   * إعداد التنقل
   */
  setupNavigation() {
    document.querySelectorAll(".sidebar-nav a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.loadPage(page);

        // تحديث الحالة النشطة
        document
          .querySelectorAll(".sidebar-nav a")
          .forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        // إغلاق السايدبار في الموبايل
        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
          sidebar.classList.remove("active");
        }
      });
    });
  }

  /**
   * إعداد البحث
   */
  setupSearch() {
    const searchInput = document.getElementById("globalSearch");
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch(searchInput.value);
      }, 300);
    });

    // بحث فوري
    const searchBtn = document.querySelector(".header-search button");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        this.performSearch(searchInput.value);
      });
    }

    // اختصار Ctrl+F
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  /**
   * تحميل الصفحة
   */
  loadPage(page) {
    this.currentPage = page;

    if (!this.pageContent) return;

    // عرض محتوى مؤقت
    this.pageContent.innerHTML = this.getSkeletonLoader();

    // تحميل المحتوى الفعلي
    setTimeout(() => {
      switch (page) {
        case "dashboard":
          this.loadDashboard();
          break;
        case "inventory":
          this.loadInventory();
          break;
        case "sales":
          this.loadSales();
          break;
        case "reports":
          this.loadReports();
          break;
        case "analytics":
          this.loadAnalytics();
          break;
        case "settings":
          this.loadSettings();
          break;
        default:
          this.pageContent.innerHTML =
            '<h2 style="text-align:center;padding:40px;">صفحة قيد التطوير</h2>';
      }
    }, 300);
  }

  /**
   * تحميل بيانات عينة - مع الشركات الجديدة
   */
  loadSampleData() {
    console.log("🔍 جاري التحقق من البيانات...");

    const products = this.storage.get("products", []);

    if (products.length > 0) {
      console.log(
        `📌 يوجد ${products.length} منتج، تخطي إضافة البيانات العينة`,
      );
      return;
    }

    const wasCleared = localStorage.getItem("autoparts_was_cleared");
    if (wasCleared === "true") {
      console.log("📌 تم مسح البيانات سابقاً، لن يتم إضافة بيانات عينة");
      return;
    }

    console.log("📌 جاري إضافة بيانات عينة مع الشركات الجديدة...");

    const sampleProducts = [
      {
        id: "sample_1",
        name: "طقم تيل فرامل امامي",
        partNumber: "BR-001",
        category: "Toyota",
        status: "original",
        vehicle: "كامري",
        model: "2020",
        fromYear: 2020,
        toYear: 2023,
        engine: "2.5L",
        transmission: "أوتوماتيك",
        quantity: 15,
        minStock: 5,
        purchasePrice: 120,
        sellingPrice: 250,
        location: "A1",
        shelf: "3",
        barcode: "1234567890123",
        description: "طقم تيل فرامل امامي اصلي لسيارات تويوتا كامري",
        specifications: "مادة سيراميك عالية الجودة",
        images: [],
        salesCount: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample_2",
        name: "فلتر زيت",
        partNumber: "FL-002",
        category: "Hyundai",
        status: "commercial",
        vehicle: "النترا",
        model: "2019",
        fromYear: 2019,
        toYear: 2022,
        engine: "1.6L",
        transmission: "أوتوماتيك",
        quantity: 30,
        minStock: 10,
        purchasePrice: 25,
        sellingPrice: 45,
        location: "B2",
        shelf: "1",
        barcode: "1234567890124",
        description: "فلتر زيت عالي الجودة",
        images: [],
        salesCount: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample_3",
        name: "بواجي احتراق",
        partNumber: "SP-003",
        category: "Nissan",
        status: "new",
        vehicle: "صنى",
        model: "2021",
        fromYear: 2021,
        toYear: 2024,
        engine: "1.5L",
        transmission: "يدوي",
        quantity: 20,
        minStock: 8,
        purchasePrice: 15,
        sellingPrice: 35,
        location: "C3",
        shelf: "2",
        barcode: "1234567890125",
        description: "بواجي احتراق عالية الأداء",
        images: [],
        salesCount: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 🇲🇾 ماليزي
      {
        id: "sample_4",
        name: "طقم تيل فرامل",
        partNumber: "BR-MAL-001",
        category: "ماليزي",
        status: "original",
        vehicle: "بروتون",
        model: "2020",
        fromYear: 2020,
        toYear: 2023,
        engine: "1.6L",
        transmission: "أوتوماتيك",
        quantity: 12,
        minStock: 4,
        purchasePrice: 100,
        sellingPrice: 200,
        location: "D1",
        shelf: "4",
        barcode: "1234567890126",
        description: "طقم تيل فرامل لسيارات بروتون الماليزية",
        specifications: "جودة عالية",
        images: [],
        salesCount: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 🇰🇷 كوري
      {
        id: "sample_5",
        name: "بواجي احتراق",
        partNumber: "SP-KOR-002",
        category: "كوري",
        status: "new",
        vehicle: "كيا",
        model: "2021",
        fromYear: 2021,
        toYear: 2024,
        engine: "2.0L",
        transmission: "يدوي",
        quantity: 18,
        minStock: 6,
        purchasePrice: 12,
        sellingPrice: 30,
        location: "D3",
        shelf: "3",
        barcode: "1234567890128",
        description: "بواجي احتراق لسيارات كيا الكورية",
        specifications: "عالية الأداء",
        images: [],
        salesCount: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 🇮🇩 إندونيسي
      {
        id: "sample_6",
        name: "فلتر هواء",
        partNumber: "FL-IND-003",
        category: "إندونيسي",
        status: "commercial",
        vehicle: "ديهاتسو",
        model: "2019",
        fromYear: 2019,
        toYear: 2022,
        engine: "1.5L",
        transmission: "أوتوماتيك",
        quantity: 25,
        minStock: 8,
        purchasePrice: 20,
        sellingPrice: 40,
        location: "D2",
        shelf: "2",
        barcode: "1234567890127",
        description: "فلتر هواء لسيارات ديهاتسو الإندونيسية",
        specifications: "فلتر عالي الجودة",
        images: [],
        salesCount: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.storage.set("products", sampleProducts);
    this.inventory.products = sampleProducts;

    console.log("✅ تم إضافة البيانات العينة مع الشركات الجديدة");
  }

  /**
   * تحميل لوحة التحكم
   */
  loadDashboard() {
    try {
      this.inventory.products = this.storage.get("products", []);
      this.sales.sales = this.storage.get("sales", []);
      this.sales.invoices = this.storage.get("invoices", []);

      const stats = this.inventory.getStats();
      const salesStats = this.sales.getSalesStats();
      const topProducts = this.sales.getTopSellingProducts(5);
      const lowStock = this.inventory.getLowStockProducts();
      const totalProfit = this.sales.getTotalProfit();

      if (!this.pageContent) return;

      this.pageContent.innerHTML = `
        <div style="margin-bottom:20px;">
          <h1 style="font-size:1.5rem;">📊 لوحة التحكم</h1>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:30px;">
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">📦</div>
            <div style="font-size:1.8rem;font-weight:bold;">${formatNumber(stats.totalItems)}</div>
            <div style="color:var(--text-secondary);font-size:0.9rem;">إجمالي الأصناف</div>
          </div>
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">📊</div>
            <div style="font-size:1.8rem;font-weight:bold;">${formatNumber(stats.totalQuantity)}</div>
            <div style="color:var(--text-secondary);font-size:0.9rem;">إجمالي الكميات</div>
          </div>
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">💰</div>
            <div style="font-size:1.8rem;font-weight:bold;">${formatCurrency(stats.totalValue)}</div>
            <div style="color:var(--text-secondary);font-size:0.9rem;">قيمة المخزون</div>
          </div>
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">📈</div>
            <div style="font-size:1.8rem;font-weight:bold;color:#16a34a;">${formatCurrency(salesStats.total.revenue)}</div>
            <div style="color:var(--text-secondary);font-size:0.9rem;">إجمالي الإيرادات</div>
          </div>
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">💵</div>
            <div style="font-size:1.8rem;font-weight:bold;color:#2563eb;">${formatCurrency(totalProfit)}</div>
            <div style="color:var(--text-secondary);font-size:0.9rem;">إجمالي الأرباح</div>
          </div>
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">📋</div>
            <div style="font-size:1.8rem;font-weight:bold;">${salesStats.total.count}</div>
            <div style="color:var(--text-secondary);font-size:0.9rem;">عدد الفواتير</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
          <div class="card" style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 style="font-size:1.1rem;">📅 مبيعات اليوم</h3>
            </div>
            <p><strong>عدد الفواتير:</strong> ${salesStats.today.count}</p>
            <p><strong>المبيعات:</strong> ${formatNumber(salesStats.today.sales)}</p>
            <p><strong>الإيرادات:</strong> ${formatCurrency(salesStats.today.revenue)}</p>
            <p><strong>الأرباح:</strong> ${formatCurrency(salesStats.today.profit)}</p>
          </div>

          <div class="card" style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 style="font-size:1.1rem;">🏆 أكثر القطع مبيعاً</h3>
            </div>
            ${
              topProducts.length > 0
                ? topProducts
                    .map(
                      (p) => `
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <span>${p.productName}</span>
                <span style="background:var(--primary-color);color:white;padding:2px 10px;border-radius:20px;font-size:0.85rem;">${formatNumber(p.quantity)}</span>
              </div>
            `,
                    )
                    .join("")
                : '<p style="color:var(--text-secondary);">لا توجد مبيعات حتى الآن</p>'
            }
          </div>

          <div class="card" style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 style="font-size:1.1rem;">⚠️ تنبيهات المخزون</h3>
            </div>
            ${
              lowStock.length > 0
                ? lowStock
                    .slice(0, 5)
                    .map(
                      (p) => `
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <span>${p.name}</span>
                <span style="${p.quantity === 0 ? "background:#dc2626;color:white;" : "background:#f59e0b;color:white;"}padding:2px 10px;border-radius:20px;font-size:0.85rem;">${formatNumber(p.quantity)}</span>
              </div>
            `,
                    )
                    .join("")
                : '<p style="color:var(--text-secondary);">✅ جميع القطع متوفرة</p>'
            }
          </div>

          <div class="card" style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 style="font-size:1.1rem;">📅 آخر المبيعات</h3>
            </div>
            ${
              this.sales.sales
                .slice(-5)
                .reverse()
                .map(
                  (sale) => `
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <span>${sale.productName || "غير معروف"}</span>
                <span style="font-weight:bold;color:var(--primary-color);">${formatCurrency(sale.total || sale.unitPrice * sale.quantity)}</span>
              </div>
            `,
                )
                .join("") ||
              '<p style="color:var(--text-secondary);">لا توجد مبيعات حديثة</p>'
            }
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Dashboard error:", error);
      if (this.pageContent) {
        this.pageContent.innerHTML =
          '<p style="text-align:center;padding:40px;color:var(--text-secondary);">حدث خطأ في تحميل لوحة التحكم</p>';
      }
    }
  }

  /**
   * تحديث البيانات بعد البيع أو الإلغاء
   */
  refreshDataAfterSale() {
    this.inventory.products = this.storage.get("products", []);
    this.sales.sales = this.storage.get("sales", []);
    this.sales.invoices = this.storage.get("invoices", []);

    const currentPage = this.currentPage;

    if (currentPage === "dashboard") {
      this.loadDashboard();
    } else if (currentPage === "sales") {
      this.loadSales();
    } else if (currentPage === "reports") {
      this.loadReports();
    } else if (currentPage === "analytics") {
      this.loadAnalytics();
    }
  }

  /**
   * تحميل المخزون - مع الشركات الجديدة في الفلتر
   */
  loadInventory() {
    try {
      this.inventory.products = this.storage.get("products", []);
      const products = this.inventory.getAll();

      if (!this.pageContent) return;

      this.pageContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
          <div>
            <h1 style="font-size:1.5rem;margin-bottom:4px;">📦 إدارة المخزون</h1>
            <span style="color:var(--text-secondary);font-size:0.9rem;">إجمالي القطع: ${products.length}</span>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="app.showAddProduct()" style="padding:10px 20px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius);cursor:pointer;display:flex;align-items:center;gap:6px;">
              ➕ إضافة قطعة جديدة
            </button>
            <button class="btn btn-info" onclick="app.refreshDataAfterSale()" style="padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:var(--radius);cursor:pointer;display:flex;align-items:center;gap:6px;">
              🔄 تحديث
            </button>
          </div>
        </div>

        <!-- الفلاتر -->
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;padding:16px;background:var(--card-bg);border-radius:var(--radius);box-shadow:var(--shadow);">
          <div style="flex:1;min-width:150px;">
            <input type="text" id="filterSearch" placeholder="🔍 بحث باسم القطعة أو رقمها..." oninput="app.filterInventory()" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
          </div>
          <div style="min-width:130px;">
            <select id="filterCategory" onchange="app.filterInventory()" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
              <option value="">📋 جميع الشركات</option>
              ${this.inventory.categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
            </select>
          </div>
          <div style="min-width:130px;">
            <select id="filterStatus" onchange="app.filterInventory()" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
              <option value="">📌 جميع الحالات</option>
              <option value="original">✅ أصلي</option>
              <option value="commercial">🔄 تجاري</option>
              <option value="chinese">🇨🇳 صيني</option>
              <option value="improved">⚡ محسن</option>
              <option value="used">🔧 مستعمل</option>
              <option value="new">✨ جديد</option>
            </select>
          </div>
          <div style="min-width:100px;">
            <select id="filterStock" onchange="app.filterInventory()" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
              <option value="">📊 المخزون</option>
              <option value="all">الكل</option>
              <option value="low">⚠️ منخفض</option>
              <option value="out">❌ منتهي</option>
              <option value="high">✅ متوفر</option>
            </select>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-success" onclick="app.exportData()" style="padding:10px 16px;background:#16a34a;color:white;border:none;border-radius:var(--radius);cursor:pointer;display:flex;align-items:center;gap:4px;">📤 تصدير</button>
            <button class="btn btn-warning" onclick="app.importData()" style="padding:10px 16px;background:#f59e0b;color:white;border:none;border-radius:var(--radius);cursor:pointer;display:flex;align-items:center;gap:4px;">📥 استيراد</button>
            <button class="btn btn-secondary" onclick="app.clearFilters()" style="padding:10px 16px;background:var(--text-secondary);color:white;border:none;border-radius:var(--radius);cursor:pointer;display:flex;align-items:center;gap:4px;">🧹 مسح الفلتر</button>
          </div>
        </div>

        <!-- إحصائيات سريعة -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:20px;">
          <div style="background:var(--card-bg);padding:12px;border-radius:var(--radius);text-align:center;border-right:4px solid var(--primary-color);">
            <div style="font-size:1.3rem;font-weight:bold;color:var(--primary-color);">${products.length}</div>
            <div style="font-size:0.75rem;color:var(--text-secondary);">إجمالي القطع</div>
          </div>
          <div style="background:var(--card-bg);padding:12px;border-radius:var(--radius);text-align:center;border-right:4px solid #16a34a;">
            <div style="font-size:1.3rem;font-weight:bold;color:#16a34a;">${products.filter((p) => p.quantity > (p.minStock || 5)).length}</div>
            <div style="font-size:0.75rem;color:var(--text-secondary);">✅ متوفرة</div>
          </div>
          <div style="background:var(--card-bg);padding:12px;border-radius:var(--radius);text-align:center;border-right:4px solid #f59e0b;">
            <div style="font-size:1.3rem;font-weight:bold;color:#f59e0b;">${products.filter((p) => p.quantity <= (p.minStock || 5) && p.quantity > 0).length}</div>
            <div style="font-size:0.75rem;color:var(--text-secondary);">⚠️ منخفضة</div>
          </div>
          <div style="background:var(--card-bg);padding:12px;border-radius:var(--radius);text-align:center;border-right:4px solid #dc2626;">
            <div style="font-size:1.3rem;font-weight:bold;color:#dc2626;">${products.filter((p) => p.quantity === 0).length}</div>
            <div style="font-size:0.75rem;color:var(--text-secondary);">❌ منتهية</div>
          </div>
        </div>

        <!-- جدول المنتجات -->
        <div style="background:var(--card-bg);padding:16px;border-radius:var(--radius-lg);box-shadow:var(--shadow);overflow-x:auto;">
          ${
            products.length === 0
              ? `
            <div style="text-align:center;padding:60px 20px;">
              <div style="font-size:4rem;margin-bottom:16px;">📦</div>
              <h3 style="color:var(--text-secondary);">لا توجد قطع في المخزون</h3>
              <p style="color:var(--text-secondary);margin-bottom:16px;">ابدأ بإضافة قطعة جديدة</p>
              <button class="btn btn-primary" onclick="app.showAddProduct()" style="padding:12px 24px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius);cursor:pointer;font-size:1rem;">
                ➕ إضافة قطعة جديدة
              </button>
            </div>
          `
              : `
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="padding:12px 14px;text-align:right;border-bottom:2px solid var(--border-color);font-size:0.85rem;color:var(--text-secondary);">#</th>
                  <th style="padding:12px 14px;text-align:right;border-bottom:2px solid var(--border-color);font-size:0.85rem;color:var(--text-secondary);">اسم القطعة</th>
                  <th style="padding:12px 14px;text-align:right;border-bottom:2px solid var(--border-color);font-size:0.85rem;color:var(--text-secondary);">رقم القطعة</th>
                  <th style="padding:12px 14px;text-align:right;border-bottom:2px solid var(--border-color);font-size:0.85rem;color:var(--text-secondary);">الشركة</th>
                  <th style="padding:12px 14px;text-align:right;border-bottom:2px solid var(--border-color);font-size:0.85rem;color:var(--text-secondary);">الكمية</th>
                  <th style="padding:12px 14px;text-align:right;border-bottom:2px solid var(--border-color);font-size:0.85rem;color:var(--text-secondary);">سعر البيع</th>
                  <th style="padding:12px 14px;text-align:right;border-bottom:2px solid var(--border-color);font-size:0.85rem;color:var(--text-secondary);">الحالة</th>
                  <th style="padding:12px 14px;text-align:right;border-bottom:2px solid var(--border-color);font-size:0.85rem;color:var(--text-secondary);">الإجراءات</th>
                </tr>
              </thead>
              <tbody id="inventoryTableBody">
                ${this.renderInventoryTable(products)}
              </tbody>
            </table>
          `
          }
        </div>
      `;
    } catch (error) {
      console.error("Inventory error:", error);
      if (this.pageContent) {
        this.pageContent.innerHTML = `
          <div style="text-align:center;padding:60px 20px;">
            <div style="font-size:3rem;margin-bottom:16px;">❌</div>
            <h3 style="color:var(--text-secondary);">حدث خطأ في تحميل المخزون</h3>
            <p style="color:var(--text-secondary);">الرجاء تحديث الصفحة</p>
            <button onclick="location.reload()" style="padding:10px 20px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius);cursor:pointer;margin-top:10px;">🔄 تحديث الصفحة</button>
          </div>
        `;
      }
    }
  }

  /**
   * عرض جدول المخزون
   */
  renderInventoryTable(products) {
    if (!products || products.length === 0) {
      return '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-secondary);">لا توجد قطع في المخزون</td></tr>';
    }

    return products
      .map(
        (p, index) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">${index + 1}</td>
        <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);"><strong>${p.name || ""}</strong></td>
        <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">${p.partNumber || ""}</td>
        <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">${p.category || "-"}</td>
        <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">
          <span style="padding:4px 12px;border-radius:20px;font-size:0.85rem;${p.quantity <= (p.minStock || 5) ? "background:#fee2e2;color:#dc2626;" : "background:#dcfce7;color:#16a34a;"}">
            ${p.quantity || 0}
          </span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">${p.sellingPrice ? p.sellingPrice.toFixed(2) : "-"}</td>
        <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">
          <span style="padding:4px 12px;border-radius:20px;font-size:0.85rem;background:#dbeafe;color:#2563eb;">
            ${this.getStatusLabel(p.status)}
          </span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">
          <button class="btn btn-info btn-sm" onclick="app.editProduct('${p.id}')" style="margin:2px;padding:4px 12px;background:#3b82f6;color:white;border:none;border-radius:var(--radius);cursor:pointer;">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="app.deleteProduct('${p.id}')" style="margin:2px;padding:4px 12px;background:#dc2626;color:white;border:none;border-radius:var(--radius);cursor:pointer;">🗑️</button>
          <button class="btn btn-success btn-sm" onclick="app.duplicateProduct('${p.id}')" style="margin:2px;padding:4px 12px;background:#16a34a;color:white;border:none;border-radius:var(--radius);cursor:pointer;">📋</button>
        </td>
      </tr>
    `,
      )
      .join("");
  }

  /**
   * عرض واجهة إضافة منتج
   */
  showAddProduct() {
    this.editingProductId = null;
    const form = this.createProductForm();
    this.modal.open({
      title: "➕ إضافة قطعة جديدة",
      content: form,
      size: "lg",
      buttons: [
        { label: "إلغاء", class: "btn", action: "close" },
        { label: "حفظ", class: "btn-primary", action: "save" },
      ],
      save: (modal) => {
        this.saveProduct(modal);
      },
    });
  }

  /**
   * تعديل منتج
   */
  editProduct(id) {
    try {
      const product = this.inventory.getById(id);
      if (!product) {
        this.notification.error("المنتج غير موجود");
        return;
      }

      this.editingProductId = id;
      const form = this.createProductForm(product);
      this.modal.open({
        title: "✏️ تعديل قطعة",
        content: form,
        size: "lg",
        buttons: [
          { label: "إلغاء", class: "btn", action: "close" },
          { label: "تحديث", class: "btn-primary", action: "update" },
        ],
        update: (modal) => {
          this.updateProduct(modal);
        },
      });
    } catch (error) {
      this.notification.error("حدث خطأ في تحميل المنتج");
    }
  }

  /**
   * إنشاء نموذج المنتج - مع الشركات الجديدة
   */
  createProductForm(product = null) {
    const p = product || {};
    const form = document.createElement("div");
    form.className = "product-form";

    // ✅ قائمة الشركات الكاملة
    const categories = [
      "Toyota",
      "Hyundai",
      "Mitsubishi",
      "Nissan",
      "ماليزي",
      "كوري",
      "إندونيسي",
    ];

    form.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">اسم القطعة *</label>
          <input class="form-control" id="productName" value="${p.name || ""}" required style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">رقم القطعة *</label>
          <input class="form-control" id="productPartNumber" value="${p.partNumber || ""}" required style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الشركة المصنعة</label>
          <select class="form-control" id="productCategory" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
            <option value="">🏢 اختر الشركة</option>
            ${this.inventory.categories.map((c) => `<option value="${c}" ${p.category === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الحالة</label>
          <select class="form-control" id="productStatus" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
            <option value="original" ${p.status === "original" ? "selected" : ""}>✅ أصلي</option>
            <option value="commercial" ${p.status === "commercial" ? "selected" : ""}>🔄 تجاري</option>
            <option value="chinese" ${p.status === "chinese" ? "selected" : ""}>🇨🇳 صيني</option>
            <option value="improved" ${p.status === "improved" ? "selected" : ""}>⚡ محسن</option>
            <option value="used" ${p.status === "used" ? "selected" : ""}>🔧 مستعمل</option>
            <option value="new" ${p.status === "new" ? "selected" : ""}>✨ جديد</option>
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">نوع السيارة</label>
          <input class="form-control" id="productVehicle" value="${p.vehicle || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الموديل</label>
          <input class="form-control" id="productModel" value="${p.model || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">من سنة</label>
          <input class="form-control" id="productFromYear" type="number" value="${p.fromYear || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">إلى سنة</label>
          <input class="form-control" id="productToYear" type="number" value="${p.toYear || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">المحرك</label>
          <input class="form-control" id="productEngine" value="${p.engine || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">القير</label>
          <input class="form-control" id="productTransmission" value="${p.transmission || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الموقع في المخزن</label>
          <input class="form-control" id="productLocation" value="${p.location || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الرف</label>
          <input class="form-control" id="productShelf" value="${p.shelf || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الكمية *</label>
          <input class="form-control" id="productQuantity" type="number" value="${p.quantity || 0}" required style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الحد الأدنى للمخزون</label>
          <input class="form-control" id="productMinStock" type="number" value="${p.minStock || 5}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">سعر الشراء</label>
          <input class="form-control" id="productPurchasePrice" type="number" value="${p.purchasePrice || 0}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">سعر البيع *</label>
          <input class="form-control" id="productSellingPrice" type="number" value="${p.sellingPrice || 0}" required style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <div class="form-group">
        <label style="display:block;margin-bottom:4px;font-weight:500;">الباركود</label>
        <input class="form-control" id="productBarcode" value="${p.barcode || ""}" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
      </div>
      <div class="form-group">
        <label style="display:block;margin-bottom:4px;font-weight:500;">الوصف</label>
        <textarea class="form-control" id="productDescription" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">${p.description || ""}</textarea>
      </div>
      <div class="form-group">
        <label style="display:block;margin-bottom:4px;font-weight:500;">المواصفات الفنية</label>
        <textarea class="form-control" id="productSpecifications" rows="2" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">${p.specifications || ""}</textarea>
      </div>
    `;
    return form;
  }

  /**
   * حفظ المنتج الجديد
   */
  saveProduct(modal) {
    try {
      const form = modal.querySelector(".product-form");
      if (!form) {
        throw new Error("النموذج غير موجود");
      }

      const product = this.getProductDataFromForm(form);
      const result = this.inventory.add(product);
      this.modal.close();
      this.notification.success("تم إضافة القطعة بنجاح");
      this.loadPage("inventory");
    } catch (error) {
      this.notification.error(error.message || "حدث خطأ في حفظ البيانات");
    }
  }

  /**
   * تحديث المنتج
   */
  updateProduct(modal) {
    try {
      if (!this.editingProductId) {
        throw new Error("معرف المنتج غير موجود");
      }

      const form = modal.querySelector(".product-form");
      if (!form) {
        throw new Error("النموذج غير موجود");
      }

      const product = this.getProductDataFromForm(form);
      const result = this.inventory.update(this.editingProductId, product);
      this.modal.close();
      this.notification.success("تم تحديث القطعة بنجاح");
      this.loadPage("inventory");
    } catch (error) {
      this.notification.error(error.message || "حدث خطأ في تحديث البيانات");
    }
  }

  /**
   * الحصول على بيانات المنتج من النموذج
   */
  getProductDataFromForm(form) {
    const getValue = (id) => {
      const el = form.querySelector(id);
      return el ? el.value : "";
    };

    return {
      name: getValue("#productName").trim(),
      partNumber: getValue("#productPartNumber").trim(),
      category: getValue("#productCategory"),
      status: getValue("#productStatus"),
      vehicle: getValue("#productVehicle").trim(),
      model: getValue("#productModel").trim(),
      fromYear: parseInt(getValue("#productFromYear")) || undefined,
      toYear: parseInt(getValue("#productToYear")) || undefined,
      engine: getValue("#productEngine").trim(),
      transmission: getValue("#productTransmission").trim(),
      location: getValue("#productLocation").trim(),
      shelf: getValue("#productShelf").trim(),
      quantity: parseInt(getValue("#productQuantity")) || 0,
      minStock: parseInt(getValue("#productMinStock")) || 5,
      purchasePrice: parseFloat(getValue("#productPurchasePrice")) || 0,
      sellingPrice: parseFloat(getValue("#productSellingPrice")) || 0,
      barcode: getValue("#productBarcode").trim(),
      description: getValue("#productDescription").trim(),
      specifications: getValue("#productSpecifications").trim(),
    };
  }

  /**
   * حذف منتج
   */
  deleteProduct(id) {
    this.modal.open({
      title: "⚠️ تأكيد الحذف",
      content:
        "هل أنت متأكد من حذف هذه القطعة؟ هذا الإجراء لا يمكن التراجع عنه.",
      buttons: [
        { label: "إلغاء", class: "btn", action: "close" },
        { label: "حذف", class: "btn-danger", action: "confirm" },
      ],
      confirm: () => {
        try {
          this.inventory.delete(id);
          this.modal.close();
          this.notification.success("تم حذف القطعة بنجاح");
          this.loadPage("inventory");
        } catch (error) {
          this.notification.error(error.message);
        }
      },
    });
  }

  /**
   * نسخ منتج
   */
  duplicateProduct(id) {
    try {
      this.inventory.duplicate(id);
      this.notification.success("تم نسخ القطعة بنجاح");
      this.loadPage("inventory");
    } catch (error) {
      this.notification.error(error.message);
    }
  }

  /**
   * فلترة المخزون - مع فلتر المخزون
   */
  filterInventory() {
    try {
      const searchTerm = document.getElementById("filterSearch")?.value || "";
      const category = document.getElementById("filterCategory")?.value || "";
      const status = document.getElementById("filterStatus")?.value || "";

      let products = this.inventory.getAll();

      // بحث
      if (searchTerm.trim()) {
        products = this.inventory.search(searchTerm);
      }

      // ✅ فلتر الشركة - يعمل مع جميع الشركات بما فيها الجديدة
      if (category) {
        products = products.filter((p) => p.category === category);
      }

      // فلتر الحالة
      if (status) {
        products = products.filter((p) => p.status === status);
      }

      const tbody = document.getElementById("inventoryTableBody");
      if (tbody) {
        tbody.innerHTML = this.renderInventoryTable(products);
      }
    } catch (error) {
      console.error("Filter error:", error);
    }
  }

  /**
   * مسح الفلاتر
   */
  clearFilters() {
    const searchInput = document.getElementById("filterSearch");
    const categorySelect = document.getElementById("filterCategory");
    const statusSelect = document.getElementById("filterStatus");
    const stockSelect = document.getElementById("filterStock");

    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "";
    if (statusSelect) statusSelect.value = "";
    if (stockSelect) stockSelect.value = "";

    this.filterInventory();
    this.notification.info("تم مسح جميع الفلاتر");
  }

  /**
   * الحصول على اسم الحالة
   */
  getStatusLabel(status) {
    const statuses = {
      original: "أصلي",
      commercial: "تجاري",
      chinese: "صيني",
      improved: "محسن",
      used: "مستعمل",
      new: "جديد",
    };
    return statuses[status] || status || "-";
  }

  /**
   * تصدير البيانات
   */
  exportData() {
    try {
      const data = this.storage.exportAll();
      const json = JSON.stringify(data, null, 2);
      const filename = `inventory_backup_${new Date().toISOString().split("T")[0]}.json`;
      this.downloadFile(json, filename);
      this.notification.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      this.notification.error("حدث خطأ في تصدير البيانات");
    }
  }

  /**
   * استيراد البيانات
   */
  importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          this.storage.importAll(data);
          this.inventory.products = this.storage.get("products", []);
          this.sales.sales = this.storage.get("sales", []);
          this.sales.invoices = this.storage.get("invoices", []);
          this.notification.success("تم استيراد البيانات بنجاح");
          this.loadPage("inventory");
        } catch (error) {
          this.notification.error("خطأ في قراءة الملف");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  /**
   * مسح جميع البيانات
   */
  clearAllData() {
    this.modal.open({
      title: "⚠️ تأكيد مسح البيانات",
      content:
        "هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه وسيفقد كل بياناتك.",
      buttons: [
        { label: "إلغاء", class: "btn", action: "close" },
        { label: "مسح الكل", class: "btn-danger", action: "confirm" },
      ],
      confirm: () => {
        try {
          console.log("🗑️ بدء عملية مسح البيانات...");

          localStorage.clear();
          console.log("✅ تم مسح localStorage");

          localStorage.setItem("autoparts_was_cleared", "true");
          localStorage.setItem("autoparts_initialized", "false");
          console.log("✅ تم تعيين علامات المنع");

          this.storage = new Storage();
          this.inventory = new InventoryManager();
          this.sales = new SalesManager(this.inventory);
          console.log("✅ تم إعادة تهيئة المديرين");

          this.saleItems = [];
          this.editingProductId = null;

          this.modal.close();

          this.notification.success("تم مسح جميع البيانات بنجاح");

          this.loadPage(this.currentPage);
          console.log("✅ تم مسح البيانات وإعادة تحميل الصفحة");
        } catch (error) {
          console.error("❌ Clear error:", error);
          this.notification.error("حدث خطأ في مسح البيانات");
        }
      },
    });
  }

  /**
   * إعادة تحميل البيانات العينة
   */
  resetSampleData() {
    this.modal.open({
      title: "⚠️ تأكيد إعادة البيانات العينة",
      content:
        "سيتم حذف جميع البيانات الحالية وإضافة بيانات عينة جديدة. هل أنت متأكد؟",
      buttons: [
        { label: "إلغاء", class: "btn", action: "close" },
        { label: "تأكيد", class: "btn-warning", action: "confirm" },
      ],
      confirm: () => {
        try {
          console.log("🔄 بدء إعادة تحميل البيانات العينة...");

          localStorage.clear();
          console.log("✅ تم مسح localStorage");

          localStorage.removeItem("autoparts_was_cleared");
          localStorage.setItem("autoparts_initialized", "false");
          console.log("✅ تم إزالة علامات المنع");

          this.storage = new Storage();
          this.inventory = new InventoryManager();
          this.sales = new SalesManager(this.inventory);
          console.log("✅ تم إعادة تهيئة المديرين");

          this.loadSampleData();

          this.modal.close();

          this.notification.success("تم إعادة تحميل البيانات العينة");

          this.loadPage("settings");
          console.log("✅ تم إعادة تحميل البيانات العينة");
        } catch (error) {
          console.error("❌ Reset error:", error);
          this.notification.error("حدث خطأ في إعادة تحميل البيانات");
        }
      },
    });
  }

  /**
   * تنزيل ملف
   */
  downloadFile(content, filename, type = "application/json") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * عرض مؤقت التحميل
   */
  getSkeletonLoader() {
    return `
      <div style="padding:20px;">
        <div style="height:30px;width:200px;background:var(--bg-color);border-radius:var(--radius);margin-bottom:20px;animation:skeletonLoading 1.5s ease-in-out infinite;"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;">
          ${[1, 2, 3, 4]
            .map(
              () => `
            <div style="padding:20px;background:var(--card-bg);border-radius:var(--radius);box-shadow:var(--shadow);">
              <div style="height:40px;width:40px;background:var(--bg-color);border-radius:50%;margin-bottom:10px;animation:skeletonLoading 1.5s ease-in-out infinite;"></div>
              <div style="height:20px;width:80%;background:var(--bg-color);border-radius:var(--radius);margin-bottom:8px;animation:skeletonLoading 1.5s ease-in-out infinite;"></div>
              <div style="height:15px;width:60%;background:var(--bg-color);border-radius:var(--radius);animation:skeletonLoading 1.5s ease-in-out infinite;"></div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  /**
   * تنفيذ البحث
   */
  performSearch(query) {
    if (!query || query.trim() === "") {
      this.loadPage(this.currentPage);
      return;
    }

    const results = this.inventory.search(query);
    if (this.currentPage === "inventory") {
      const tbody = document.getElementById("inventoryTableBody");
      if (tbody) {
        tbody.innerHTML = this.renderInventoryTable(results);
      }
    } else {
      if (!this.pageContent) return;

      this.pageContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
          <h1 style="font-size:1.5rem;">🔍 نتائج البحث: "${query}"</h1>
          <button class="btn btn-primary" onclick="app.loadPage('${this.currentPage}')" style="padding:10px 20px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius);cursor:pointer;">↩️ العودة</button>
        </div>
        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">#</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">اسم القطعة</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">رقم القطعة</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">الشركة</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">الكمية</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">سعر البيع</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderInventoryTable(results)}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  /**
   * تحميل المبيعات
   */
  loadSales() {
    try {
      this.sales.sales = this.storage.get("sales", []);
      this.sales.invoices = this.storage.get("invoices", []);

      const invoices = this.sales.getAllInvoices();

      if (!this.pageContent) return;

      this.pageContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
          <h1 style="font-size:1.5rem;">💰 المبيعات والفواتير</h1>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="app.showNewSale()" style="padding:10px 20px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius);cursor:pointer;">
              ➕ فاتورة جديدة
            </button>
            <button class="btn btn-info" onclick="app.refreshDataAfterSale()" style="padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:var(--radius);cursor:pointer;">
              🔄 تحديث
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:20px;">
          <div style="background:var(--card-bg);padding:16px;border-radius:var(--radius);text-align:center;">
            <div style="font-size:1.5rem;font-weight:bold;color:var(--primary-color);">${invoices.filter((inv) => inv.status === "completed").length}</div>
            <div style="font-size:0.85rem;color:var(--text-secondary);">فواتير نشطة</div>
          </div>
          <div style="background:var(--card-bg);padding:16px;border-radius:var(--radius);text-align:center;">
            <div style="font-size:1.5rem;font-weight:bold;color:#dc2626;">${invoices.filter((inv) => inv.status === "cancelled").length}</div>
            <div style="font-size:0.85rem;color:var(--text-secondary);">فواتير ملغية</div>
          </div>
          <div style="background:var(--card-bg);padding:16px;border-radius:var(--radius);text-align:center;">
            <div style="font-size:1.5rem;font-weight:bold;color:#16a34a;">${this.sales.getTotalProfit().toFixed(2)}</div>
            <div style="font-size:0.85rem;color:var(--text-secondary);">إجمالي الأرباح</div>
          </div>
        </div>

        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">رقم الفاتورة</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">التاريخ</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">عدد الأصناف</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">الإجمالي</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">الربح</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">الحالة</th>
                <th style="padding:12px 16px;text-align:right;border-bottom:2px solid var(--border-color);">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${
                invoices
                  .map((inv) => {
                    const isCancelled = inv.status === "cancelled";
                    return `
                  <tr style="${isCancelled ? "opacity:0.6;" : ""}">
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">
                      <strong>${inv.invoiceNumber}</strong>
                      ${isCancelled ? '<span style="color:#dc2626;font-size:0.8rem;"> (ملغية)</span>' : ""}
                    </td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">${formatDate(inv.createdAt)}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">${inv.items.length}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">
                      <strong>${inv.total.toFixed(2)}</strong>
                    </td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">
                      <span style="${isCancelled ? "color:#dc2626;" : "color:#16a34a;"}font-weight:bold;">
                        ${isCancelled ? "0.00" : (inv.totalProfit || 0).toFixed(2)}
                      </span>
                    </td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">
                      <span style="padding:4px 12px;border-radius:20px;font-size:0.85rem;${isCancelled ? "background:#fee2e2;color:#dc2626;" : "background:#dcfce7;color:#16a34a;"}">
                        ${isCancelled ? "ملغية" : "مكتملة"}
                      </span>
                    </td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border-color);">
                      <button class="btn btn-info btn-sm" onclick="app.viewInvoice('${inv.id}')" style="margin:2px;padding:4px 12px;background:#3b82f6;color:white;border:none;border-radius:var(--radius);cursor:pointer;">👁️</button>
                      ${
                        !isCancelled
                          ? `
                        <button class="btn btn-danger btn-sm" onclick="app.cancelInvoice('${inv.id}')" style="margin:2px;padding:4px 12px;background:#dc2626;color:white;border:none;border-radius:var(--radius);cursor:pointer;">❌</button>
                      `
                          : ""
                      }
                    </td>
                  </tr>
                `;
                  })
                  .join("") ||
                '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-secondary);">لا توجد فواتير</td></tr>'
              }
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error("Sales error:", error);
      if (this.pageContent) {
        this.pageContent.innerHTML =
          '<p style="text-align:center;padding:40px;color:var(--text-secondary);">حدث خطأ في تحميل المبيعات</p>';
      }
    }
  }

  /**
   * عرض فاتورة جديدة
   */
  showNewSale() {
    this.saleItems = [];
    const products = this.inventory.getAll().filter((p) => p.quantity > 0);

    const form = document.createElement("div");
    form.innerHTML = `
      <div class="form-group">
        <label style="display:block;margin-bottom:4px;font-weight:500;">اختر المنتج</label>
        <select class="form-control" id="saleProductSelect" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
          <option value="">اختر منتج...</option>
          ${products
            .map(
              (p) => `
            <option value="${p.id}" data-price="${p.sellingPrice}" data-max="${p.quantity}">
              ${p.name} - ${p.partNumber} (${p.quantity} متوفرة)
            </option>
          `,
            )
            .join("")}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الكمية</label>
          <input class="form-control" id="saleQuantity" type="number" value="1" min="1" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">السعر</label>
          <input class="form-control" id="salePrice" type="number" readonly style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <button class="btn btn-primary" onclick="app.addSaleItem()" style="margin-bottom:16px;padding:10px 20px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius);cursor:pointer;">➕ إضافة للفاتورة</button>
      <hr style="margin:16px 0;border-color:var(--border-color);">
      <div id="saleItemsList" style="margin-bottom:16px;"></div>
      <hr style="margin:16px 0;border-color:var(--border-color);">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الخصم</label>
          <input class="form-control" id="saleDiscount" type="number" value="0" oninput="app.updateSaleTotal()" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
        <div class="form-group">
          <label style="display:block;margin-bottom:4px;font-weight:500;">الضريبة %</label>
          <input class="form-control" id="saleTax" type="number" value="0" oninput="app.updateSaleTotal()" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
        </div>
      </div>
      <div style="text-align:center;padding:20px;background:var(--bg-color);border-radius:var(--radius);">
        <h3>الإجمالي: <span id="saleTotalDisplay" style="color:var(--primary-color);">0.00</span></h3>
      </div>
    `;

    this.modal.open({
      title: "💰 فاتورة جديدة",
      content: form,
      size: "lg",
      buttons: [
        { label: "إلغاء", class: "btn", action: "close" },
        { label: "إتمام الفاتورة", class: "btn-success", action: "complete" },
      ],
      complete: () => {
        this.completeSale();
      },
      onOpen: () => {
        const select = document.getElementById("saleProductSelect");
        if (select) {
          select.addEventListener("change", function () {
            const price = this.options[this.selectedIndex]?.dataset?.price || 0;
            const priceInput = document.getElementById("salePrice");
            if (priceInput) priceInput.value = price;
          });
        }
        this.updateSaleTotal();
      },
    });
  }

  /**
   * إضافة صنف للفاتورة
   */
  addSaleItem() {
    try {
      const select = document.getElementById("saleProductSelect");
      const productId = select ? select.value : "";
      const quantityInput = document.getElementById("saleQuantity");
      const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
      const priceInput = document.getElementById("salePrice");
      const price = priceInput ? parseFloat(priceInput.value) || 0 : 0;

      if (!productId) {
        this.notification.warning("الرجاء اختيار منتج");
        return;
      }

      if (quantity <= 0) {
        this.notification.warning("الكمية يجب أن تكون أكبر من صفر");
        return;
      }

      const product = this.inventory.getById(productId);
      if (!product) {
        this.notification.error("المنتج غير موجود");
        return;
      }

      if (quantity > product.quantity) {
        this.notification.warning(`الكمية المتوفرة: ${product.quantity}`);
        return;
      }

      const existingItem = this.saleItems.find(
        (item) => item.productId === productId,
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.saleItems.push({
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          unitPrice: price,
          total: price * quantity,
        });
      }

      this.renderSaleItems();
      this.updateSaleTotal();
      this.notification.success("تم إضافة المنتج للفاتورة");
    } catch (error) {
      this.notification.error("حدث خطأ في إضافة المنتج");
    }
  }

  /**
   * عرض الأصناف في الفاتورة
   */
  renderSaleItems() {
    const container = document.getElementById("saleItemsList");
    if (!container) return;

    if (this.saleItems.length === 0) {
      container.innerHTML =
        '<p style="text-align:center;color:var(--text-secondary);">لا توجد أصناف في الفاتورة</p>';
      return;
    }

    container.innerHTML = `
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">المنتج</th>
            <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الكمية</th>
            <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">السعر</th>
            <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الإجمالي</th>
            <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">حذف</th>
          </tr>
        </thead>
        <tbody>
          ${this.saleItems
            .map(
              (item, index) => `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${item.productName}</td>
              <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">
                <input type="number" value="${item.quantity}" min="1" onchange="app.updateSaleItemQuantity(${index}, this.value)" style="width:60px;padding:4px 8px;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-color);color:var(--text-color);">
              </td>
              <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${item.unitPrice}</td>
              <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${item.total.toFixed(2)}</td>
              <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">
                <button class="btn btn-danger btn-sm" onclick="app.removeSaleItem(${index})" style="padding:4px 8px;background:#dc2626;color:white;border:none;border-radius:var(--radius);cursor:pointer;">✕</button>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  /**
   * تحديث كمية صنف في الفاتورة
   */
  updateSaleItemQuantity(index, value) {
    try {
      const quantity = parseInt(value) || 1;
      if (quantity <= 0) {
        this.notification.warning("الكمية يجب أن تكون أكبر من صفر");
        return;
      }

      const item = this.saleItems[index];
      if (!item) return;

      const product = this.inventory.getById(item.productId);
      if (product && quantity > product.quantity) {
        this.notification.warning(`الكمية المتوفرة: ${product.quantity}`);
        return;
      }

      item.quantity = quantity;
      item.total = quantity * item.unitPrice;
      this.renderSaleItems();
      this.updateSaleTotal();
    } catch (error) {
      this.notification.error("حدث خطأ في تحديث الكمية");
    }
  }

  /**
   * إزالة صنف من الفاتورة
   */
  removeSaleItem(index) {
    this.saleItems.splice(index, 1);
    this.renderSaleItems();
    this.updateSaleTotal();
    this.notification.info("تم حذف الصنف");
  }

  /**
   * تحديث إجمالي الفاتورة
   */
  updateSaleTotal() {
    try {
      const discountInput = document.getElementById("saleDiscount");
      const taxInput = document.getElementById("saleTax");
      const display = document.getElementById("saleTotalDisplay");

      const discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
      const tax = taxInput ? parseFloat(taxInput.value) || 0 : 0;
      const subtotal = this.saleItems.reduce(
        (sum, item) => sum + item.total,
        0,
      );
      const total = subtotal - discount + (subtotal * tax) / 100;

      if (display) {
        display.textContent = total.toFixed(2);
      }
    } catch (error) {
      console.error("Update total error:", error);
    }
  }

  /**
   * إتمام الفاتورة
   */
  completeSale() {
    if (this.saleItems.length === 0) {
      this.notification.warning("الفاتورة فارغة، أضف منتجات أولاً");
      return;
    }

    try {
      const discountInput = document.getElementById("saleDiscount");
      const taxInput = document.getElementById("saleTax");

      const discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
      const tax = taxInput ? parseFloat(taxInput.value) || 0 : 0;

      const invoice = this.sales.createInvoice(this.saleItems, {
        discount,
        tax,
      });

      this.refreshDataAfterSale();

      this.modal.close();
      this.notification.success(
        `تم إنشاء الفاتورة ${invoice.invoiceNumber} بنجاح`,
      );
      this.loadPage("sales");
    } catch (error) {
      this.notification.error(error.message);
    }
  }

  /**
   * عرض تفاصيل الفاتورة
   */
  viewInvoice(id) {
    try {
      const invoice = this.sales.getInvoiceById(id);
      if (!invoice) {
        this.notification.error("الفاتورة غير موجودة");
        return;
      }

      const isCancelled = invoice.status === "cancelled";

      const content = document.createElement("div");
      content.innerHTML = `
        <div style="padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h3 style="margin-bottom:0;">رقم الفاتورة: ${invoice.invoiceNumber}</h3>
            <span style="padding:4px 12px;border-radius:20px;font-size:0.85rem;${isCancelled ? "background:#fee2e2;color:#dc2626;" : "background:#dcfce7;color:#16a34a;"}">
              ${isCancelled ? "⚠️ ملغية" : "✅ مكتملة"}
            </span>
          </div>
          <p><strong>التاريخ:</strong> ${formatDate(invoice.createdAt)}</p>
          ${isCancelled ? '<p style="color:#dc2626;"><strong>ملاحظة:</strong> هذه الفاتورة ملغية ولا تدخل في حسابات الأرباح</p>' : ""}
          <hr style="margin:16px 0;border-color:var(--border-color);">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">المنتج</th>
                <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الكمية</th>
                <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">السعر</th>
                <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الإجمالي</th>
                <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الربح</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item) => `
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${item.productName}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${item.quantity}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${item.unitPrice}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${item.total.toFixed(2)}</td>
                  <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">
                    <span style="${isCancelled ? "color:#dc2626;" : "color:#16a34a;"}">
                      ${isCancelled ? "0.00" : (item.profit || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="padding:12px 16px;text-align:left;font-weight:bold;">المجموع:</td>
                <td style="padding:12px 16px;font-weight:bold;">${invoice.subtotal.toFixed(2)}</td>
              </tr>
              ${
                invoice.discount > 0
                  ? `
                <tr>
                  <td colspan="4" style="padding:8px 16px;text-align:left;">الخصم:</td>
                  <td style="padding:8px 16px;">-${invoice.discount.toFixed(2)}</td>
                </tr>
              `
                  : ""
              }
              ${
                invoice.tax > 0
                  ? `
                <tr>
                  <td colspan="4" style="padding:8px 16px;text-align:left;">الضريبة (${invoice.tax}%):</td>
                  <td style="padding:8px 16px;">${invoice.taxAmount.toFixed(2)}</td>
                </tr>
              `
                  : ""
              }
              <tr>
                <td colspan="4" style="padding:12px 16px;text-align:left;font-weight:bold;font-size:1.1rem;">الإجمالي:</td>
                <td style="padding:12px 16px;font-weight:bold;font-size:1.1rem;color:var(--primary-color);">${invoice.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="4" style="padding:8px 16px;text-align:left;font-weight:bold;">إجمالي الربح:</td>
                <td style="padding:8px 16px;font-weight:bold;${isCancelled ? "color:#dc2626;" : "color:#16a34a;"}">
                  ${isCancelled ? "0.00 (ملغية)" : (invoice.totalProfit || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;

      this.modal.open({
        title: `🧾 فاتورة ${invoice.invoiceNumber}`,
        content: content,
        size: "lg",
        buttons: [{ label: "إغلاق", class: "btn", action: "close" }],
      });
    } catch (error) {
      this.notification.error("حدث خطأ في عرض الفاتورة");
    }
  }

  /**
   * إلغاء فاتورة
   */
  cancelInvoice(id) {
    this.modal.open({
      title: "⚠️ تأكيد الإلغاء",
      content:
        "هل أنت متأكد من إلغاء هذه الفاتورة؟ سيتم إرجاع الكميات للمخزون وسيتم خصم الأرباح.",
      buttons: [
        { label: "إلغاء", class: "btn", action: "close" },
        { label: "تأكيد الإلغاء", class: "btn-danger", action: "confirm" },
      ],
      confirm: () => {
        try {
          this.sales.cancelInvoice(id);
          this.refreshDataAfterSale();
          this.modal.close();
          this.notification.success("تم إلغاء الفاتورة بنجاح وخصم الأرباح");
          this.loadPage(this.currentPage);
        } catch (error) {
          this.notification.error(error.message);
        }
      },
    });
  }

  /**
   * تحميل التقارير
   */
  loadReports() {
    try {
      const stats = this.inventory.getStats();
      const salesStats = this.sales.getSalesStats();
      const lowStock = this.inventory.getLowStockProducts();
      const topProducts = this.sales.getTopSellingProducts(10);

      if (!this.pageContent) return;

      this.pageContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
          <h1 style="font-size:1.5rem;">📈 التقارير</h1>
          <button class="btn btn-primary" onclick="window.print()" style="padding:10px 20px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius);cursor:pointer;">🖨️ طباعة</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:20px;">
          <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <h3 style="margin-bottom:16px;">📊 ملخص المخزون</h3>
            <p><strong>إجمالي الأصناف:</strong> ${stats.totalItems}</p>
            <p><strong>إجمالي الكميات:</strong> ${stats.totalQuantity}</p>
            <p><strong>قيمة المخزون:</strong> ${formatCurrency(stats.totalValue)}</p>
            <p><strong>قطع منخفضة المخزون:</strong> ${stats.lowStock}</p>
            <p><strong>قطع منتهية:</strong> ${stats.outOfStock}</p>
          </div>

          <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <h3 style="margin-bottom:16px;">💰 ملخص المبيعات</h3>
            <p><strong>مبيعات اليوم:</strong> ${salesStats.today.sales}</p>
            <p><strong>إيرادات اليوم:</strong> ${formatCurrency(salesStats.today.revenue)}</p>
            <p><strong>مبيعات الأسبوع:</strong> ${salesStats.week.sales}</p>
            <p><strong>إيرادات الأسبوع:</strong> ${formatCurrency(salesStats.week.revenue)}</p>
            <p><strong>مبيعات الشهر:</strong> ${salesStats.month.sales}</p>
            <p><strong>إيرادات الشهر:</strong> ${formatCurrency(salesStats.month.revenue)}</p>
            <p><strong>إجمالي الإيرادات:</strong> ${formatCurrency(salesStats.total.revenue)}</p>
            <p><strong>صافي الأرباح:</strong> ${formatCurrency(salesStats.total.profit)}</p>
          </div>
        </div>

        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);margin-bottom:20px;">
          <h3 style="margin-bottom:16px;">🏆 أفضل 10 قطع مبيعاً</h3>
          ${
            topProducts.length > 0
              ? `
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">#</th>
                    <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">القطعة</th>
                    <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الكمية المباعة</th>
                    <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الإيرادات</th>
                  </tr>
                </thead>
                <tbody>
                  ${topProducts
                    .map(
                      (p, i) => `
                    <tr>
                      <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${i + 1}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${p.productName}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${p.quantity}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${formatCurrency(p.revenue)}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : '<p style="text-align:center;color:var(--text-secondary);">لا توجد مبيعات مسجلة</p>'
          }
        </div>

        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
          <h3 style="margin-bottom:16px;">⚠️ قطع منخفضة المخزون</h3>
          ${
            lowStock.length > 0
              ? `
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">#</th>
                    <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">القطعة</th>
                    <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الكمية</th>
                    <th style="padding:8px 12px;text-align:right;border-bottom:1px solid var(--border-color);">الحد الأدنى</th>
                  </tr>
                </thead>
                <tbody>
                  ${lowStock
                    .map(
                      (p, i) => `
                    <tr>
                      <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${i + 1}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${p.name}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${p.quantity}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid var(--border-color);">${p.minStock || 5}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : '<p style="text-align:center;color:var(--text-secondary);">✅ جميع القطع متوفرة</p>'
          }
        </div>
      `;
    } catch (error) {
      console.error("Reports error:", error);
      if (this.pageContent) {
        this.pageContent.innerHTML =
          '<p style="text-align:center;padding:40px;color:var(--text-secondary);">حدث خطأ في تحميل التقارير</p>';
      }
    }
  }

  /**
   * تحميل التحليلات - مع الشركات الجديدة
   */
  loadAnalytics() {
    try {
      const stats = this.inventory.getStats();
      const salesStats = this.sales.getSalesStats();

      if (!this.pageContent) return;

      this.pageContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
          <h1 style="font-size:1.5rem;">📊 التحليلات والإحصائيات</h1>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:20px;">
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">📦</div>
            <div style="font-size:1.8rem;font-weight:bold;">${stats.totalItems}</div>
            <div style="color:var(--text-secondary);">إجمالي الأصناف</div>
          </div>
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">📊</div>
            <div style="font-size:1.8rem;font-weight:bold;">${stats.totalQuantity}</div>
            <div style="color:var(--text-secondary);">إجمالي الكميات</div>
          </div>
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">💰</div>
            <div style="font-size:1.8rem;font-weight:bold;">${formatCurrency(stats.totalValue)}</div>
            <div style="color:var(--text-secondary);">قيمة المخزون</div>
          </div>
          <div style="background:var(--card-bg);padding:20px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <div style="font-size:2rem;margin-bottom:10px;">📈</div>
            <div style="font-size:1.8rem;font-weight:bold;">${formatCurrency(salesStats.total.revenue)}</div>
            <div style="color:var(--text-secondary);">إجمالي الإيرادات</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
          <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <h3 style="margin-bottom:16px;">📅 إحصائيات اليوم</h3>
            <p><strong>المبيعات:</strong> ${salesStats.today.sales}</p>
            <p><strong>الإيرادات:</strong> ${formatCurrency(salesStats.today.revenue)}</p>
            <p><strong>الأرباح:</strong> ${formatCurrency(salesStats.today.profit)}</p>
          </div>

          <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <h3 style="margin-bottom:16px;">📅 إحصائيات الأسبوع</h3>
            <p><strong>المبيعات:</strong> ${salesStats.week.sales}</p>
            <p><strong>الإيرادات:</strong> ${formatCurrency(salesStats.week.revenue)}</p>
            <p><strong>الأرباح:</strong> ${formatCurrency(salesStats.week.profit)}</p>
          </div>

          <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <h3 style="margin-bottom:16px;">📅 إحصائيات الشهر</h3>
            <p><strong>المبيعات:</strong> ${salesStats.month.sales}</p>
            <p><strong>الإيرادات:</strong> ${formatCurrency(salesStats.month.revenue)}</p>
            <p><strong>الأرباح:</strong> ${formatCurrency(salesStats.month.profit)}</p>
          </div>

          <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
            <h3 style="margin-bottom:16px;">📅 إحصائيات السنة</h3>
            <p><strong>المبيعات:</strong> ${salesStats.year.sales}</p>
            <p><strong>الإيرادات:</strong> ${formatCurrency(salesStats.year.revenue)}</p>
            <p><strong>الأرباح:</strong> ${formatCurrency(salesStats.year.profit)}</p>
          </div>
        </div>

        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);margin-top:20px;">
          <h3 style="margin-bottom:16px;">🏷️ توزيع القطع حسب الشركة</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">
 ${this.inventory.categories
   .map((cat) => {
     const count = this.inventory
       .getAll()
       .filter((p) => p.category === cat).length;
     const percentage =
       stats.totalItems > 0 ? ((count / stats.totalItems) * 100).toFixed(1) : 0;
     return `
        <div style="background:var(--bg-color);padding:16px;border-radius:var(--radius);text-align:center;border:1px solid var(--border-color);">
            <div style="font-size:1.5rem;font-weight:bold;color:var(--primary-color);">${count}</div>
            <div style="color:var(--text-secondary);font-size:0.9rem;">${cat}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);">${percentage}%</div>
        </div>
    `;
   })
   .join("")}
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Analytics error:", error);
      if (this.pageContent) {
        this.pageContent.innerHTML =
          '<p style="text-align:center;padding:40px;color:var(--text-secondary);">حدث خطأ في تحميل التحليلات</p>';
      }
    }
  }

  /**
   * عرض إعدادات النظام
   */
  loadSettings() {
    try {
      if (!this.pageContent) return;

      const isDark = document.body.classList.contains("dark-mode");

      this.pageContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
          <h1 style="font-size:1.5rem;">⚙️ إعدادات النظام</h1>
        </div>

        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);margin-bottom:20px;">
          <h3 style="margin-bottom:16px;">🌓 المظهر</h3>
          <button class="btn btn-primary" onclick="app.toggleDarkMode()" style="padding:10px 20px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius);cursor:pointer;">
            ${isDark ? "☀️ الوضع الفاتح" : "🌙 الوضع المظلم"}
          </button>
        </div>

        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);margin-bottom:20px;">
          <h3 style="margin-bottom:16px;">📊 البيانات</h3>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <button class="btn btn-success" onclick="app.exportData()" style="padding:10px 20px;background:#16a34a;color:white;border:none;border-radius:var(--radius);cursor:pointer;">
              📤 تصدير جميع البيانات
            </button>
            <button class="btn btn-info" onclick="app.importData()" style="padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:var(--radius);cursor:pointer;">
              📥 استيراد بيانات
            </button>
            <button class="btn btn-danger" onclick="app.clearAllData()" style="padding:10px 20px;background:#dc2626;color:white;border:none;border-radius:var(--radius);cursor:pointer;">
              🗑️ مسح جميع البيانات
            </button>
            <button class="btn btn-warning" onclick="app.resetSampleData()" style="padding:10px 20px;background:#f59e0b;color:white;border:none;border-radius:var(--radius);cursor:pointer;">
              🔄 إعادة تحميل البيانات العينة
            </button>
          </div>
        </div>

        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);margin-bottom:20px;">
          <h3 style="margin-bottom:16px;">📈 إحصائيات النظام</h3>
          <p><strong>عدد القطع:</strong> ${this.inventory.getAll().length}</p>
          <p><strong>عدد الفواتير:</strong> ${this.sales.getAllInvoices().length}</p>
          <p><strong>حجم التخزين:</strong> ${(this.storage.getSize() / 1024).toFixed(2)} KB</p>
          <p><strong>النسخة:</strong> 1.0.0</p>
        </div>

        <div style="background:var(--card-bg);padding:24px;border-radius:var(--radius-lg);box-shadow:var(--shadow);">
          <h3 style="margin-bottom:16px;">⌨️ اختصارات لوحة المفاتيح</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div><kbd style="background:var(--bg-color);padding:4px 8px;border-radius:4px;border:1px solid var(--border-color);">Ctrl+F</kbd> بحث سريع</div>
            <div><kbd style="background:var(--bg-color);padding:4px 8px;border-radius:4px;border:1px solid var(--border-color);">Esc</kbd> إغلاق المودال</div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Settings error:", error);
      if (this.pageContent) {
        this.pageContent.innerHTML =
          '<p style="text-align:center;padding:40px;color:var(--text-secondary);">حدث خطأ في تحميل الإعدادات</p>';
      }
    }
  }

  /**
   * تبديل الوضع المظلم
   */
  toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
    this.notification.info(
      isDark ? "تم تفعيل الوضع المظلم" : "تم تفعيل الوضع الفاتح",
    );

    if (this.currentPage === "settings") {
      this.loadSettings();
    }
  }

  /**
   * تبديل السايدبار
   */
  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("active");
    }
  }
}

// تصدير التطبيق
const app = new App();
window.app = app;
window.toggleSidebar = () => app.toggleSidebar();
window.toggleDarkMode = () => app.toggleDarkMode();
window.performSearch = () => {
  const query = document.getElementById("globalSearch")?.value || "";
  app.performSearch(query);
};
window.showNotifications = () => {
  app.notification.info("📬 لا توجد إشعارات جديدة");
};

window.showAddProduct = () => app.showAddProduct();
window.editProduct = (id) => app.editProduct(id);
window.deleteProduct = (id) => app.deleteProduct(id);
window.duplicateProduct = (id) => app.duplicateProduct(id);
window.filterInventory = () => app.filterInventory();
window.clearFilters = () => app.clearFilters();
window.exportData = () => app.exportData();
window.importData = () => app.importData();
window.clearAllData = () => app.clearAllData();
window.resetSampleData = () => app.resetSampleData();
