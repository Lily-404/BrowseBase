import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      header: {
        slogan: 'Discover the best of the web.',
        blog: 'Blog',
        openSource: 'Open Source',
        switchToChinese: 'Chinese',
        switchToEnglish: 'English'
      },
      category: {
        title: 'Category',
        all: 'All',
        ai: 'AI',
        docs: 'Doc',
        tutorials: 'Tutorials',
        tools: 'Tools',
        dev: 'Dev',
        design: 'Design',
        blog: 'Blog',
        resources: 'Resources',
        opensource: 'Open Source' 
      },
      filter: {
        title: 'Filter',
        trending: 'Trending',
        newAdded: 'New Added',
        beginnerFriendly: 'YouTube Creators',
        enterprise: 'Mac Apps',
        communityChoice: 'Community Choice',
        openSource: 'Open Source'
      },
      resourcePreview: {
        title: 'Resources',
        noMatch: 'No matching resources found',
        updatedAt: 'Updated',
        reviews: 'reviews'
      },
      navigation: {
        previous: 'Previous',
        next: 'Next'
      }
    }
  },
  zh: {
    translation: {
      header: {
        slogan: '资源，自有分量。',
        blog: '博客',
        openSource: '开源',
        switchToChinese: '中文',
        switchToEnglish: '英文'
      },
      category: {
        title: '分类',
        all: '全部',
        ai: 'AI',
        docs: '文档',
        tutorials: '教程',
        tools: '工具',
        dev: '开发',
        design: '设计',
        blog: '博客',
        opensource: '开源' ,
        resources: '资源'
      },
      filter: {
        title: '合集',
        trending: '热门',
        newAdded: '最新',
        beginnerFriendly: '油管博主',
        enterprise: 'Mac软件',
        communityChoice: '社区',
        openSource: '开源'
      },
      resourcePreview: {
        title: '资源',
        noMatch: '暂无匹配的资源',
        updatedAt: '更新于',
        reviews: '条评论'
      },
      navigation: {
        previous: '上一页',
        next: '下一页'
      }
    }
  }
};

i18n
  .use(LanguageDetector)  // 添加语言检测器
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',  // 设置回退语言为英文
    detection: {
      order: ['navigator'],  // 使用浏览器语言设置
      lookupFromPathIndex: 0,
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;