import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { siteConfig } from '../../siteConfig';
import { postCategories, UNCATEGORIZED_ID, UNCATEGORIZED_NAME } from '../../data/categories';
import ArticlesClient, { type ArticleGroup, type ArticleItem } from './ArticlesClient';

export const metadata = {
  title: '文章 | ' + siteConfig.title,
};

export default function PostsPage() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let posts: ArticleItem[] = [];

  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter((name) => name.endsWith('.md'));

      posts = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fileContents = fs.readFileSync(path.join(postsDirectory, fileName), 'utf8');
        const { data } = matter(fileContents);
        const rawCategory = typeof data.category === 'string' ? data.category.trim() : '';

        return {
          slug,
          title: data.title || '无标题',
          date: data.date || '',
          description: data.description || '',
          cover: data.cover || siteConfig.defaultPostCover,
          category: rawCategory || UNCATEGORIZED_ID,
        };
      });

      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (error) {
    console.error('读取文章列表失败', error);
  }

  // 按配置顺序生成分类分组
  const groups: ArticleGroup[] = postCategories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description || '',
    posts: posts.filter((post) => post.category === category.id),
  }));

  // 配置里没声明、但文章里写了的分类，也自动列出来
  const declared = new Set(postCategories.map((category) => category.id));
  const extraCategories = Array.from(new Set(posts.map((post) => post.category))).filter(
    (id) => !declared.has(id) && id !== UNCATEGORIZED_ID,
  );
  extraCategories.forEach((id) => {
    groups.push({ id, name: id, description: '', posts: posts.filter((post) => post.category === id) });
  });

  // 未分类放最后
  const uncategorized = posts.filter((post) => post.category === UNCATEGORIZED_ID);
  if (uncategorized.length > 0) {
    groups.push({ id: UNCATEGORIZED_ID, name: UNCATEGORIZED_NAME, description: '', posts: uncategorized });
  }

  return (
    <div className="min-h-screen relative pb-32">
      <Navbar />
      <PageTransition>
        <ArticlesClient groups={groups} total={posts.length} />
      </PageTransition>
    </div>
  );
}
