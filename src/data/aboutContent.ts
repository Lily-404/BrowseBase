export interface AboutSection {
  title: string;
  content: string | string[];
}

export const aboutContent: AboutSection[] = [
  {
    title: "项目初衷",
    content: "BrowseBase 是一个极简主义的资源整理平台，分类随意，由我的心情去编辑，所有链接都通过人肉的形式进行筛选，所以质量绝对有保障。让你在点开每个链接的时候像是在抽盲盒，保持惊喜，打破信息茧房。"
  },
  {
    title: "关于更新",
    content: "本站资源会不定期更新，如果遇到资源失效，请及时联系我。"
  },
  {
    title: "联系我",
    content:  [
      "链接: https://about.jimmy-blog.top"
    ]
  }
]; 