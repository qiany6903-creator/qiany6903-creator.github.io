// 📁 文章分类配置 —— 想增删改分类，只改这个文件就行
//
// 用法：
// 1. 在下面 postCategories 里加一个 { id, name } 条目
// 2. 打开 posts/ 里某篇文章开头的 front matter，加一行：
//      category: laplace
//    （id 填上面定义的那个 id）
// 3. 没写 category 的文章会自动落到「未分类」抽屉里
//
// 顺序就是前台标签的显示顺序。

export interface PostCategory {
  id: string;           // 分类标识，文章里 category: 填这个（建议用英文，别用中文）
  name: string;         // 页面上显示的名字
  description?: string; // 可选，选中该分类时显示在标题下面的小字
}

export const postCategories: PostCategory[] = [
  { id: 'laplace', name: '拉普拉斯妖笔记' },
  { id: 'zhongtie', name: '中铁十三局' },
  { id: 'misc', name: '其余杂项' },
];

// 未写分类的文章归到这里
export const UNCATEGORIZED_ID = 'uncategorized';
export const UNCATEGORIZED_NAME = '未分类';
