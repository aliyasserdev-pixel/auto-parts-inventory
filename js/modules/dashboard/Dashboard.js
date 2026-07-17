import { formatCurrency, formatNumber } from '../utils/Helpers.js';

class Dashboard {
  constructor(inventoryManager, salesManager, container) {
    this.inventory = inventoryManager;
    this.sales = salesManager;
    this.container = container;
  }

  /**
   * عرض لوحة التحكم
   */
  render() {
    const stats = this.inventory.getStats();
    const salesStats = this.sales.getSalesStats();
    const topProducts = this.sales.getTopSellingProducts(5);
    const lowStock = this.inventory.getLowStockProducts();

    const html = `
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-value">${formatNumber(stats.totalItems)}</div>
                    <div class="stat-label">إجمالي الأصناف</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${formatNumber(stats.totalQuantity)}</div>
                    <div class="stat-label">إجمالي الكميات</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">${formatCurrency(stats.totalValue)}</div>
                    <div class="stat-label">قيمة المخزون</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚠️</div>
                    <div class="stat-value">${formatNumber(stats.lowStock)}</div>
                    <div class="stat-label">قطع منخفضة المخزون</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">❌</div>
                    <div class="stat-value">${formatNumber(stats.outOfStock)}</div>
                    <div class="stat-label">قطع منتهية</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value">${formatCurrency(salesStats.total.revenue)}</div>
                    <div class="stat-label">إجمالي الإيرادات</div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 مبيعات اليوم</h3>
                    </div>
                    <div class="sales-summary">
                        <p><strong>المبيعات:</strong> ${formatNumber(salesStats.today.sales)}</p>
                        <p><strong>الإيرادات:</strong> ${formatCurrency(salesStats.today.revenue)}</p>
                        <p><strong>الأرباح:</strong> ${formatCurrency(salesStats.today.profit)}</p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🏆 أكثر القطع مبيعاً</h3>
                    </div>
                    <div class="top-products">
                        ${
                          topProducts.length > 0
                            ? topProducts
                                .map(
                                  (p) => `
                            <div class="top-product-item">
                                <span>${p.productName}</span>
                                <span class="badge">${formatNumber(p.quantity)}</span>
                            </div>
                        `,
                                )
                                .join("")
                            : "<p>لا توجد مبيعات حتى الآن</p>"
                        }
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">⚠️ تنبيهات المخزون</h3>
                    </div>
                    <div class="alerts-list">
                        ${
                          lowStock.length > 0
                            ? lowStock
                                .slice(0, 5)
                                .map(
                                  (p) => `
                            <div class="alert-item ${p.quantity === 0 ? "danger" : "warning"}">
                                <span>${p.name}</span>
                                <span class="badge">${formatNumber(p.quantity)}</span>
                            </div>
                        `,
                                )
                                .join("")
                            : "<p>✅ جميع القطع متوفرة</p>"
                        }
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📅 آخر المبيعات</h3>
                    </div>
                    <div class="recent-sales">
                        ${
                          this.sales.sales
                            .slice(-5)
                            .reverse()
                            .map(
                              (sale) => `
                            <div class="sale-item">
                                <span>${sale.productName || "غير معروف"}</span>
                                <span class="badge">${formatCurrency(sale.total || sale.unitPrice * sale.quantity)}</span>
                            </div>
                        `,
                            )
                            .join("") || "<p>لا توجد مبيعات حديثة</p>"
                        }
                    </div>
                </div>
            </div>
        `;

    this.container.innerHTML = html;
  }
}

export default Dashboard;