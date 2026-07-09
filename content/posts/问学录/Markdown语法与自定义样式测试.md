---
id: "post_20260707_2c98706d"
type: "post"
title: "Markdown语法与自定义样式测试"
slug: "Markdown语法与自定义样式测试"
date: "2026-07-07"
category: "问学录"
tags: ["Markdown", "渲染测试", "自定义样式"]
status: "draft"
visible: true
createdAt: "2026-07-07T14:32:06.078Z"
updatedAt: "2026-07-07T14:21:39.466Z"
wordCount: 901
importedPath: "content/posts/问学录/Markdown语法与自定义样式测试.md"
summary: "用于验证常规 Markdown、Momo 自定义语法、提示块、表格、代码块、脚注与正文滚动动画的测试文稿。"
---
# Markdown语法与自定义样式测试

这是一篇专门用于测试文章页渲染能力的文稿。正文应当使用宋体气质的中文显示，英文如 `Times New Roman`、`Markdown`、`Frontend` 应当呈现为更接近英文衬线字体的效果。

段落中可以包含 **加粗文字**、*斜体文字*、~~删除线文字~~、`inline code`，也可以包含 [普通链接](https://github.com/Motues/Momo "Motues/Momo")。

## 二级标题：基础文本

普通段落应该有稳定的行高和较舒展的阅读节奏。这里故意写长一点，用来观察一行文字较长时的换行效果。文章内容不应该突然挤在一起，也不应该出现明显的字体错乱；当上下滚动时，每一个正文块应该有轻微的淡入淡出，而不是全部一次性僵硬出现。

### 三级标题：行内自定义语法

下面这些是从 Momo 风格里借来的自定义写法：

- `!!隐藏内容!!` 会渲染为模糊剧透：!!这是一段需要点击或悬浮查看的隐藏内容!!
- `{汉字}(han|zi)` 会渲染为注音：{汉字}(han|zi)
- `==彩虹文字==` 会渲染为彩虹文字：==这是一段彩虹文字==
- `++下划线文字++` 会渲染为强调下划线：++这是一段下划线文字++

这些语法也可以和普通强调混合使用，例如：**这里有 !!隐藏的重点!!**，以及 ++带下划线的 `code` 片段++。

## 列表与任务

无序列表：

- 第一项：观察项目符号颜色变化。
- 第二项：包含一个 [链接](https://example.com)。
- 第三项：包含 `inline code`。

有序列表：

1. 先导入 Markdown 文件。
2. 再生成索引 JSON。
3. 最后在前台文章页打开。

任务列表：

- [x] 支持 frontmatter 去除。
- [x] 支持正文 Markdown 解析。
- [ ] 后续可以继续接入更完整的 Markdown 引擎。

## 引用与分割线

> 这是一段普通引用。引用块应当有左侧竖线和浅色背景，文字不要过黑，也不要过于突兀。
>
> 多段引用应该仍然保持完整的引用结构。

---

## 提示块测试

:::note
这是一个 note 提示块，用来放普通说明。
:::

:::tip[自定义提示标题]
这是一个 tip 提示块，标题应该可以自定义。
:::

:::important
这是一个 important 提示块，适合放关键结论。
:::

:::warning
这是一个 warning 提示块，适合放需要注意的内容。
:::

:::caution
这是一个 caution 提示块，适合放高风险提醒。
:::

:::quote
这一段使用 `:::quote` 自定义块。它应该呈现为居中、带引号气质的特殊引用。
:::

## 表格测试

| 项目 | 状态 | 说明 |
|---|:---:|---:|
| 标题 | 已支持 | 左侧普通文字 |
| 表格 | 已支持 | 右侧对齐 |
| 代码 | 已支持 | `copy` |

## 代码块测试

```js
const title = "Markdown语法与自定义样式测试";
const features = ["heading", "table", "code", "admonition", "spoiler"];

function renderFeatureList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

console.log(renderFeatureList(features));
```

```css
.markdown-content {
  font-family: "Times New Roman", "Noto Serif SC", "Songti SC", SimSun, serif;
  line-height: 1.75;
}
```

## 图片测试

下面是一张外链图片，用于测试图片、圆角和居中效果。如果当前网络不可用，图片加载失败也不应影响正文排版。

![山间湖面](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80 "山间湖面")

## 脚注测试

这里有一个脚注引用[^note-1]，这里还有第二个脚注[^note-2]。脚注区域应该出现在文章末尾，并且具有较弱的视觉层级。

[^note-1]: 第一个脚注，用于验证脚注编号与返回链接。
[^note-2]: 第二个脚注，用于验证多个脚注的排列。

## 原始 HTML 测试

<div class="quote">
  <p>这是一段直接写在 Markdown 里的 HTML。当前解析器会保留常见 HTML 块。</p>
</div>

## 结束

如果这篇文章打开后，标题、段落、列表、表格、代码复制按钮、提示块、脚注、自定义语法和滚动淡入淡出都正常，就说明当前文章页的 Markdown 渲染链路可以继续用于真实内容。
