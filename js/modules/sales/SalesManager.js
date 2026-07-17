import Storage from "../core/Storage.js";
import { generateId, formatDate, formatCurrency } from "../utils/Helpers.js";

class SalesManager {
  constructor(inventoryManager) {
    this.storage = new Storage();
    this.inventory = inventoryManager;
    this.sales = this.storage.get("sales", []);
    this.invoices = this.storage.get("invoices", []);
    this.invoiceCounter = this.storage.get("invoiceCounter", 1);
    this.listeners = [];
  }

  /**
   * إنشاء فاتورة جديدة - النسخة المصححة
   */
  createInvoice(items, customerData = {}) {
    if (!items || items.length === 0) {
      throw new Error("الفاتورة يجب أن تحتوي على منتج واحد على الأقل");
    }

    // التحقق من توفر المنتجات
    items.forEach((item) => {
      const product = this.inventory.getById(item.productId);
      if (!product) {
        throw new Error(`المنتج غير موجود: ${item.productId}`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`الكمية غير متوفرة للمنتج: ${product.name}`);
      }
    });

    // حساب الإجماليات
    let subtotal = 0;
    const invoiceItems = items.map((item) => {
      const product = this.inventory.getById(item.productId);
      const total = product.sellingPrice * item.quantity;
      subtotal += total;

      // حساب الربح لكل صنف
      const profit =
        (product.sellingPrice - product.purchasePrice) * item.quantity;

      return {
        ...item,
        productName: product.name,
        productPartNumber: product.partNumber,
        unitPrice: product.sellingPrice,
        purchasePrice: product.purchasePrice, // إضافة سعر الشراء
        total: total,
        profit: profit, // إضافة الربح
      };
    });

    const invoiceNumber = this.generateInvoiceNumber();

    // تطبيق الخصم والضريبة
    const discount = customerData.discount || 0;
    const tax = customerData.tax || 0;
    const taxAmount = (subtotal - discount) * (tax / 100);
    const total = subtotal - discount + taxAmount;

    // حساب إجمالي الربح
    const totalProfit = invoiceItems.reduce(
      (sum, item) => sum + item.profit,
      0,
    );

    const invoice = {
      id: generateId(),
      invoiceNumber,
      items: invoiceItems,
      subtotal,
      discount,
      tax,
      taxAmount,
      total,
      totalProfit, // إضافة إجمالي الربح
      customer: customerData,
      createdAt: new Date().toISOString(),
      status: "completed",
    };

    // حفظ الفاتورة
    this.invoices.push(invoice);

    // حفظ المبيعات مع الربح
    invoiceItems.forEach((item) => {
      this.sales.push({
        ...item,
        invoiceId: invoice.id,
        invoiceNumber,
        saleDate: invoice.createdAt,
        profit: item.profit, // تأكد من حفظ الربح
      });
    });

    // تحديث المخزون
    items.forEach((item) => {
      this.inventory.updateQuantity(item.productId, item.quantity, "subtract");
      // تحديث إحصائيات المنتج
      const product = this.inventory.getById(item.productId);
      if (product) {
        product.salesCount = (product.salesCount || 0) + item.quantity;
        product.totalRevenue =
          (product.totalRevenue || 0) + product.sellingPrice * item.quantity;
        this.inventory.update(item.productId, product);
      }
    });

    // حفظ البيانات
    this.save();
    this.notifyListeners("create", invoice);

    return invoice;
  }

  /**
   * إنشاء رقم فاتورة تلقائي
   */
  generateInvoiceNumber() {
    const number = this.invoiceCounter;
    this.invoiceCounter++;
    this.storage.set("invoiceCounter", this.invoiceCounter);
    return `INV-${String(number).padStart(6, "0")}`;
  }

  /**
   * الحصول على جميع الفواتير (مع تصفية الملغية عند الحاجة)
   */
  getAllInvoices(includeCancelled = true) {
    if (includeCancelled) {
      return this.invoices;
    }
    // فقط الفواتير المكتملة
    return this.invoices.filter((inv) => inv.status === "completed");
  }

  /**
   * الحصول على عدد الفواتير النشطة (غير الملغية)
   */
  getActiveInvoicesCount() {
    return this.invoices.filter((inv) => inv.status === "completed").length;
  }

  /**
   * الحصول على فاتورة بواسطة ID
   */
  getInvoiceById(id) {
    return this.invoices.find((inv) => inv.id === id);
  }

  /**
   * الحصول على فاتورة بواسطة رقم الفاتورة
   */
  getInvoiceByNumber(invoiceNumber) {
    return this.invoices.find((inv) => inv.invoiceNumber === invoiceNumber);
  }

  /**
   * إلغاء فاتورة - النسخة المصححة (مع خصم الربح)
   */
  cancelInvoice(id) {
    const invoice = this.getInvoiceById(id);
    if (!invoice) {
      throw new Error("الفاتورة غير موجودة");
    }

    if (invoice.status === "cancelled") {
      throw new Error("الفاتورة ملغية بالفعل");
    }

    // 1. حذف المبيعات المرتبطة بالفاتورة من this.sales
    this.sales = this.sales.filter((sale) => sale.invoiceId !== invoice.id);

    // 2. إرجاع الكميات للمخزون
    invoice.items.forEach((item) => {
      this.inventory.updateQuantity(item.productId, item.quantity, "add");
    });

    // 3. تحديث حالة الفاتورة إلى ملغية
    invoice.status = "cancelled";

    // 4. حفظ البيانات
    this.save();
    this.notifyListeners("cancel", invoice);

    return invoice;
  }

  /**
   * الحصول على إحصائيات المبيعات - النسخة المصححة (تستثني الفواتير الملغية)
   */
  getSalesStats() {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay(),
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const stats = {
      today: { sales: 0, revenue: 0, profit: 0, count: 0 },
      week: { sales: 0, revenue: 0, profit: 0, count: 0 },
      month: { sales: 0, revenue: 0, profit: 0, count: 0 },
      year: { sales: 0, revenue: 0, profit: 0, count: 0 },
      total: { sales: 0, revenue: 0, profit: 0, count: 0 },
    };

    // ✅ فقط الفواتير المكتملة (غير الملغية)
    const activeInvoices = this.invoices.filter(
      (inv) => inv.status === "completed",
    );

    activeInvoices.forEach((invoice) => {
      const saleDate = new Date(invoice.createdAt);
      const revenue = invoice.total || 0;
      const profit = invoice.totalProfit || 0;
      const count = 1;

      // إضافة للكل
      stats.total.revenue += revenue;
      stats.total.profit += profit;
      stats.total.count += count;

      // حساب عدد القطع المباعة
      invoice.items.forEach((item) => {
        stats.total.sales += item.quantity;
      });

      // اليوم
      if (saleDate >= startOfDay) {
        stats.today.revenue += revenue;
        stats.today.profit += profit;
        stats.today.count += count;
        invoice.items.forEach((item) => {
          stats.today.sales += item.quantity;
        });
      }

      // الأسبوع
      if (saleDate >= startOfWeek) {
        stats.week.revenue += revenue;
        stats.week.profit += profit;
        stats.week.count += count;
        invoice.items.forEach((item) => {
          stats.week.sales += item.quantity;
        });
      }

      // الشهر
      if (saleDate >= startOfMonth) {
        stats.month.revenue += revenue;
        stats.month.profit += profit;
        stats.month.count += count;
        invoice.items.forEach((item) => {
          stats.month.sales += item.quantity;
        });
      }

      // السنة
      if (saleDate >= startOfYear) {
        stats.year.revenue += revenue;
        stats.year.profit += profit;
        stats.year.count += count;
        invoice.items.forEach((item) => {
          stats.year.sales += item.quantity;
        });
      }
    });

    return stats;
  }

  /**
   * الحصول على أفضل المنتجات مبيعاً - النسخة المصححة (تستثني الفواتير الملغية)
   */
  getTopSellingProducts(limit = 10) {
    const salesMap = new Map();

    // ✅ فقط الفواتير المكتملة (غير الملغية)
    const activeInvoices = this.invoices.filter(
      (inv) => inv.status === "completed",
    );

    activeInvoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        if (salesMap.has(item.productId)) {
          const data = salesMap.get(item.productId);
          data.quantity += item.quantity;
          data.revenue += item.total || 0;
          data.profit += item.profit || 0;
        } else {
          salesMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName || "غير معروف",
            quantity: item.quantity,
            revenue: item.total || 0,
            profit: item.profit || 0,
          });
        }
      });
    });

    return Array.from(salesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  /**
   * حساب إجمالي الأرباح - النسخة المصححة (تستثني الفواتير الملغية)
   */
  getTotalProfit() {
    let totalProfit = 0;

    // ✅ فقط الفواتير المكتملة (غير الملغية)
    const activeInvoices = this.invoices.filter(
      (inv) => inv.status === "completed",
    );

    activeInvoices.forEach((invoice) => {
      totalProfit += invoice.totalProfit || 0;
    });

    return totalProfit;
  }

  /**
   * الحصول على مبيعات اليوم - دالة جديدة
   */
  getTodaySales() {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    let sales = [];

    // من المبيعات المباشرة
    this.sales.forEach((sale) => {
      const saleDate = new Date(sale.saleDate);
      if (saleDate >= startOfDay) {
        sales.push(sale);
      }
    });

    // من الفواتير
    this.invoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      if (invoiceDate >= startOfDay && invoice.status === "completed") {
        invoice.items.forEach((item) => {
          sales.push({
            ...item,
            saleDate: invoice.createdAt,
            invoiceNumber: invoice.invoiceNumber,
          });
        });
      }
    });

    return sales;
  }

  /**
   * حفظ البيانات
   */
  save() {
    this.storage.set("sales", this.sales);
    this.storage.set("invoices", this.invoices);
  }

  /**
   * إضافة مستمع
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * إشعار المستمعين
   */
  notifyListeners(action, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(action, data);
      } catch (error) {
        console.error("Listener error:", error);
      }
    });
  }
}

export default SalesManager;
