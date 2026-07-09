# MyWeb Obsidian Publishing Pipeline

This site uses Obsidian as the editor, Markdown as the source format, Git for version control, and Vercel for deployment.

## Write

Open `E:\MyWeb\content` as your Obsidian vault.

- Posts: `content/posts/<category>/<title>.md`
- Notes: `content/notes/<category>/<title>.md`
- Images and files: `content/media/`

Use YAML frontmatter at the top of each Markdown file:

```yaml
---
type: post
title: 示例文章
date: 2026-07-09
category: 问学录
tags: [Obsidian, Markdown, Vercel]
status: published
visible: true
summary: 这是一篇示例文章。
---
```

## Build

```powershell
npm.cmd run build
```

The build scans Markdown files, regenerates `content/indexes`, and writes the deployable site to `dist`.

`content/indexes` and `dist` are generated outputs. Do not edit them by hand.

## Preview

```powershell
npm.cmd run preview
```

## Deploy

Push this repository to GitHub, GitLab, or Bitbucket, then import it in Vercel.

Use these Vercel settings:

- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: project root

After import, every Git push triggers a new deployment.
