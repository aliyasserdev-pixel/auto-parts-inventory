/**
 * وحدة التخزين - تدير جميع عمليات التخزين في LocalStorage
 * مصممة لتكون قابلة للاستبدال بـ MongoDB أو Firebase مستقبلاً
 */
class Storage {
  constructor(prefix = "autoparts_") {
    this.prefix = prefix;
    this.cache = new Map();
  }

  /**
   * الحصول على مفتاح كامل مع البادئة
   */
  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * حفظ بيانات في التخزين
   */
  set(key, data) {
    try {
      const fullKey = this._getKey(key);
      const jsonData = JSON.stringify(data);
      localStorage.setItem(fullKey, jsonData);
      this.cache.set(fullKey, data);
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  }

  /**
   * الحصول على بيانات من التخزين
   */
  get(key, defaultValue = null) {
    try {
      const fullKey = this._getKey(key);

      // التحقق من الكاش أولاً
      if (this.cache.has(fullKey)) {
        return this.cache.get(fullKey);
      }

      const data = localStorage.getItem(fullKey);
      if (!data) return defaultValue;

      const parsed = JSON.parse(data);
      this.cache.set(fullKey, parsed);
      return parsed;
    } catch (error) {
      console.error("Storage get error:", error);
      return defaultValue;
    }
  }

  /**
   * حذف بيانات من التخزين
   */
  remove(key) {
    try {
      const fullKey = this._getKey(key);
      localStorage.removeItem(fullKey);
      this.cache.delete(fullKey);
      return true;
    } catch (error) {
      console.error("Storage remove error:", error);
      return false;
    }
  }

  /**
   * الحصول على جميع المفاتيح
   */
  keys() {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.replace(this.prefix, ""));
  }

  /**
   * مسح التخزين بالكامل
   */
  clear() {
    try {
      // حذف جميع المفاتيح التي تبدأ بالبادئة
      const keys = this.keys();
      keys.forEach((key) => this.remove(key));
      this.cache.clear();
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  }

  /**
   * تصدير جميع البيانات كـ JSON
   */
  exportAll() {
    const data = {};
    this.keys().forEach((key) => {
      data[key] = this.get(key);
    });
    return data;
  }

  /**
   * استيراد بيانات من JSON
   */
  importAll(data) {
    Object.keys(data).forEach((key) => {
      this.set(key, data[key]);
    });
    return true;
  }

  /**
   * الحصول على حجم التخزين المستخدم
   */
  getSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2; // UTF-16
      }
    }
    return total;
  }
}

export default Storage;