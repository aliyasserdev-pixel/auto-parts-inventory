import Storage from '../core/Storage.js';
import { generateId, formatDate, validatePartNumber } from '../utils/Helpers.js';

/**
 * مدير المخزون - يدير جميع عمليات قطع الغيار
 */
class InventoryManager {
    constructor() {
        this.storage = new Storage();
        this.products = this.storage.get('products', []);
        this.categories = ['Toyota', 'Hyundai', 'Mitsubishi', 'Nissan'];
        this.listeners = [];
    }

    /**
     * الحصول على جميع المنتجات
     */
    getAll() {
        return this.products;
    }

    /**
     * الحصول على منتج بواسطة ID
     */
    getById(id) {
        return this.products.find(p => p.id === id);
    }

    /**
     * إضافة منتج جديد
     */
    add(product) {
        const newProduct = {
            id: generateId(),
            ...product,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            images: product.images || [],
            salesCount: 0,
            totalRevenue: 0
        };

        // التحقق من صحة البيانات
        if (!this.validateProduct(newProduct)) {
            throw new Error('بيانات المنتج غير صحيحة');
        }

        this.products.push(newProduct);
        this.save();
        this.notifyListeners('add', newProduct);
        return newProduct;
    }

    /**
     * تحديث منتج
     */
    update(id, updates) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('المنتج غير موجود');
        }

        const updated = {
            ...this.products[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        if (!this.validateProduct(updated)) {
            throw new Error('بيانات المنتج غير صحيحة');
        }

        this.products[index] = updated;
        this.save();
        this.notifyListeners('update', updated);
        return updated;
    }

    /**
     * حذف منتج
     */
    delete(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('المنتج غير موجود');
        }

        const deleted = this.products[index];
        this.products.splice(index, 1);
        this.save();
        this.notifyListeners('delete', deleted);
        return deleted;
    }

    /**
     * نسخ منتج
     */
    duplicate(id) {
        const product = this.getById(id);
        if (!product) {
            throw new Error('المنتج غير موجود');
        }

        const duplicated = {
            ...product,
            id: generateId(),
            name: `${product.name} (نسخة)`,
            partNumber: `${product.partNumber}-copy`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            quantity: 0,
            salesCount: 0,
            totalRevenue: 0
        };

        this.products.push(duplicated);
        this.save();
        this.notifyListeners('add', duplicated);
        return duplicated;
    }

    /**
     * تحديث الكمية
     */
    updateQuantity(id, quantity, type = 'set') {
        const product = this.getById(id);
        if (!product) {
            throw new Error('المنتج غير موجود');
        }

        let newQuantity = product.quantity;
        switch(type) {
            case 'set':
                newQuantity = quantity;
                break;
            case 'add':
                newQuantity += quantity;
                break;
            case 'subtract':
                newQuantity -= quantity;
                break;
            default:
                throw new Error('نوع العملية غير صحيح');
        }

        if (newQuantity < 0) {
            throw new Error('الكمية لا يمكن أن تكون سالبة');
        }

        return this.update(id, { quantity: newQuantity });
    }

    /**
     * البحث عن المنتجات
     */
    search(query) {
        if (!query || query.trim() === '') {
            return this.products;
        }

        const searchTerm = query.toLowerCase().trim();
        return this.products.filter(product => {
            return (
                product.name.toLowerCase().includes(searchTerm) ||
                product.partNumber.toLowerCase().includes(searchTerm) ||
                product.barcode?.toLowerCase().includes(searchTerm) ||
                product.brand?.toLowerCase().includes(searchTerm) ||
                product.category?.toLowerCase().includes(searchTerm) ||
                product.model?.toLowerCase().includes(searchTerm) ||
                product.location?.toLowerCase().includes(searchTerm)
            );
        });
    }

    /**
     * فلترة المنتجات
     */
    filter(filters) {
        return this.products.filter(product => {
            let match = true;

            if (filters.category && product.category !== filters.category) {
                match = false;
            }
            if (filters.brand && product.brand !== filters.brand) {
                match = false;
            }
            if (filters.status && product.status !== filters.status) {
                match = false;
            }
            if (filters.minPrice && product.sellingPrice < filters.minPrice) {
                match = false;
            }
            if (filters.maxPrice && product.sellingPrice > filters.maxPrice) {
                match = false;
            }
            if (filters.minQuantity && product.quantity < filters.minQuantity) {
                match = false;
            }
            if (filters.maxQuantity && product.quantity > filters.maxQuantity) {
                match = false;
            }
            if (filters.fromYear && product.fromYear && product.fromYear < filters.fromYear) {
                match = false;
            }
            if (filters.toYear && product.toYear && product.toYear > filters.toYear) {
                match = false;
            }
            if (filters.hasImage !== undefined) {
                const hasImage = product.images && product.images.length > 0;
                if (filters.hasImage !== hasImage) {
                    match = false;
                }
            }
            if (filters.lowStock) {
                if (product.quantity > (product.minStock || 5)) {
                    match = false;
                }
            }

            return match;
        });
    }

    /**
     * ترتيب المنتجات
     */
    sort(sortBy = 'name', order = 'asc') {
        const sorted = [...this.products];
        sorted.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            // التعامل مع القيم غير الموجودة
            if (aVal === undefined) aVal = '';
            if (bVal === undefined) bVal = '';

            // التعامل مع الأرقام
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return order === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // التعامل مع النصوص
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return order === 'asc' 
                    ? aVal.localeCompare(bVal, 'ar')
                    : bVal.localeCompare(aVal, 'ar');
            }

            return 0;
        });
        return sorted;
    }

    /**
     * الحصول على المنتجات منخفضة المخزون
     */
    getLowStockProducts(threshold = 5) {
        return this.products.filter(p => p.quantity <= (p.minStock || threshold));
    }

    /**
     * الحصول على المنتجات المنتهية
     */
    getOutOfStockProducts() {
        return this.products.filter(p => p.quantity <= 0);
    }

    /**
     * الحصول على إحصائيات المخزون
     */
    getStats() {
        const totalItems = this.products.length;
        const totalQuantity = this.products.reduce((sum, p) => sum + p.quantity, 0);
        const totalValue = this.products.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0);
        const lowStock = this.getLowStockProducts().length;
        const outOfStock = this.getOutOfStockProducts().length;

        return {
            totalItems,
            totalQuantity,
            totalValue,
            lowStock,
            outOfStock,
            averagePrice: totalItems > 0 ? totalValue / totalQuantity : 0
        };
    }

    /**
     * التحقق من صحة المنتج
     */
    validateProduct(product) {
        // اسم المنتج مطلوب
        if (!product.name || product.name.trim() === '') {
            return false;
        }

        // رقم القطعة مطلوب
        if (!product.partNumber || product.partNumber.trim() === '') {
            return false;
        }

        // السعر يجب أن يكون رقماً موجباً
        if (product.sellingPrice !== undefined && product.sellingPrice < 0) {
            return false;
        }

        // الكمية يجب أن تكون رقماً غير سالب
        if (product.quantity !== undefined && product.quantity < 0) {
            return false;
        }

        return true;
    }

    /**
     * حفظ البيانات
     */
    save() {
        this.storage.set('products', this.products);
    }

    /**
     * إضافة مستمع للتغييرات
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * إزالة مستمع
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * إشعار المستمعين
     */
    notifyListeners(action, data) {
        this.listeners.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }
}

export default InventoryManager;