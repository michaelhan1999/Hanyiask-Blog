/**
 * i18n 应用层
 * 将 translations 注入到页面，并处理语言切换
 */

// 导入翻译（通过 Vite 注入）
// @ts-ignore
import { translations } from './translations.ts';

type Lang = 'zh' | 'en' | 'ko' | 'ja';

declare global {
  interface Window {
    __translations: typeof translations;
    __currentLang: Lang;
  }
}

const LANG_KEY = 'blog-lang';
const DEFAULT_LANG: Lang = 'zh';

function getSavedLang(): Lang {
  return (localStorage.getItem(LANG_KEY) as Lang) || DEFAULT_LANG;
}

function applyTranslations(lang: Lang) {
  window.__currentLang = lang;
  window.__translations = translations;
  localStorage.setItem(LANG_KEY, lang);

  const t = translations[lang];
  if (!t) return;

  // 遍历所有带 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = (el as HTMLElement).dataset.i18n as keyof typeof translations.zh;
    if (key && t[key]) {
      el.textContent = t[key];
    }
  });

  // 遍历带 data-i18n-html 属性的元素（支持内嵌 HTML）
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = (el as HTMLElement).dataset.i18nHtml as keyof typeof translations.zh;
    if (key && t[key]) {
      (el as HTMLElement).innerHTML = t[key];
    }
  });

  // 遍历带 data-i18n-attr 属性的元素（设置属性，如 placeholder）
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const raw = (el as HTMLElement).dataset.i18nAttr!;
    const colonIdx = raw.indexOf(':');
    const key = raw.slice(colonIdx + 1) as keyof typeof translations.zh;
    const attr = raw.slice(0, colonIdx);
    if (key && t[key]) {
      el.setAttribute(attr, t[key]);
    }
  });

  document.documentElement.lang = lang;
}

// 初始化
function init() {
  const savedLang = getSavedLang();
  applyTranslations(savedLang);

  // 监听语言切换事件
  window.addEventListener('lang-change', ((e: CustomEvent) => {
    applyTranslations(e.detail.lang as Lang);
  }) as EventListener);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

(window as any).applyTranslations = applyTranslations;
(window as any).getSavedLang = getSavedLang;
