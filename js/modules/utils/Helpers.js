/**
 * توليد ID فريد
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * تنسيق التاريخ
 */
export const formatDate = (date, format = 'ar') => {
    const d = new Date(date);
    if (format === 'ar') {
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    return d.toISOString().split('T')[0];
};

/**
 * تنسيق العملة
 */
export const formatCurrency = (amount, currency = 'SAR') => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: currency
    }).format(amount || 0);
};

/**
 * تنسيق الأرقام
 */
export const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-EG').format(num || 0);
};

/**
 * التحقق من صحة رقم القطعة
 */
export const validatePartNumber = (partNumber) => {
    return partNumber && partNumber.trim().length > 0;
};

/**
 * حساب الربح
 */
export const calculateProfit = (sellingPrice, purchasePrice, quantity = 1) => {
    return (sellingPrice - purchasePrice) * quantity;
};

/**
 * حساب نسبة الربح
 */
export const calculateProfitMargin = (sellingPrice, purchasePrice) => {
    if (purchasePrice === 0) return 0;
    return ((sellingPrice - purchasePrice) / purchasePrice) * 100;
};

/**
 * تنقية النص
 */
export const sanitizeString = (str) => {
    if (!str) return '';
    return str.trim().replace(/[<>]/g, '');
};

/**
 * التحقق من صحة البريد الإلكتروني
 */
export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * التحقق من صحة رقم الجوال
 */
export const validatePhone = (phone) => {
    return /^[0-9]{10,15}$/.test(phone);
};

/**
 * تنزيل ملف
 */
export const downloadFile = (content, filename, type = 'application/json') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * نسخ نص
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
};

/**
 * الحصول على معلمات URL
 */
export const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
};

/**
 * تأخير (للاستخدام مع async/await)
 */
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * تصفية الكائن لإزالة القيم الفارغة
 */
export const filterObject = (obj) => {
    const result = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            result[key] = obj[key];
        }
    });
    return result;
};

/**
 * دمج الكائنات بعمق
 */
export const deepMerge = (target, source) => {
    const result = { ...target };
    Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    });
    return result;
};