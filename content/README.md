# Local Content Store

这个目录是本地后台管理页写入内容的地方。真实页面后续只需要读取 `indexes` 里的 JSON 文件即可，不需要在浏览器端递归扫描本地目录。

## Structure

- `posts/`: 文稿，按年份和标题目录存放。
- `notes/`: 手记，按年份、月份和标题目录存放。
- `media/images/`: 图片资源。
- `media/videos/`: 视频资源。
- `media/files/`: 其他附件。
- `albums/`: 预留相册配置目录。
- `indexes/`: 自动生成的索引文件。

## Generated Indexes

- `posts.json`
- `notes.json`
- `media.json`
- `albums.json`
- `timeline.json`
- `search.json`
- `site.json`
