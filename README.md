# 🚀 AI 项目管理规划工具

一个基于 AI 的智能项目管理规划工具，帮助您分析项目需求、制定执行计划并跟踪项目进度。

## ✨ 功能特性

### 1. 初始想法输入
- 文本框供用户输入项目想法
- AI 自动分析项目需求
- 生成项目概述和可行性分析

### 2. 条件分析与提问
- 自动列出实现项目所需的关键条件
- 针对每个条件提供调研问题
- 支持用户输入调研答案
- 勾选框标记调研完成状态

### 3. 条件调研进度
- 可视化进度条显示调研进度
- 所有条件调研完成后自动提示进入执行阶段

### 4. 执行阶段规划
- 进度条显示项目总体进度
- 分阶段任务管理（规划、设计、开发、测试、部署）
- 勾选框标记任务完成状态

### 5. 新进度提醒与任务列表
- 当前阶段完成后自动提醒下一阶段
- 支持添加自定义任务
- 支持编辑和删除任务

### 6. 项目历史记录
- 保存多个项目
- 随时加载和查看项目进度
- 本地存储保护数据隐私

## 🔧 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Kimi API (AI 分析)
- LocalStorage (数据持久化)

## 🚀 部署方式

### 方式一：GitHub Pages（演示模式）

访问：[https://ttjacky2023-spec.github.io/project-planner/](https://ttjacky2023-spec.github.io/project-planner/)

> 注意：GitHub Pages 版本使用演示模式，AI 分析为模拟数据。如需使用真实 Kimi API，请使用 Vercel 部署。

### 方式二：Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ttjacky2023-spec/project-planner)

1. 点击上方按钮
2. 使用 GitHub 账号登录 Vercel
3. 选择项目名称并部署
4. 部署完成后即可访问

### 方式三：本地运行

```bash
# 克隆仓库
git clone https://github.com/ttjacky2023-spec/project-planner.git

# 进入项目目录
cd project-planner

# 使用本地服务器运行（例如 Python）
python -m http.server 8000

# 访问 http://localhost:8000
```

## 🔑 配置 Kimi API

1. 访问 [Moonshot AI](https://platform.moonshot.cn/) 获取 API Key
2. 在页面顶部的 API 配置区域输入您的 API Key
3. API Key 仅存储在本地浏览器中，不会上传到服务器

## 📖 使用指南

### 第一步：输入项目想法
1. 在"初始想法输入"区域输入您的项目想法
2. 点击"AI 分析项目需求"按钮
3. 等待 AI 分析完成

### 第二步：条件调研
1. 查看 AI 列出的实现条件
2. 针对每个条件回答调研问题
3. 勾选"调研完成"标记进度
4. 所有条件调研完成后进入执行阶段

### 第三步：执行阶段
1. 查看当前阶段的任务列表
2. 完成任务后勾选对应的复选框
3. 当前阶段完成后会自动提醒下一阶段

### 第四步：任务管理
1. 在"任务管理"区域查看所有任务
2. 可以添加自定义任务
3. 可以删除不需要的任务

### 第五步：保存项目
1. 输入项目名称
2. 点击"保存项目"按钮
3. 在"项目历史记录"中可以随时加载

## 📝 项目结构

```
project-planner/
├── index.html      # 主页面
├── styles.css      # 样式文件
├── app.js          # 应用逻辑
├── vercel.json     # Vercel 配置
└── README.md       # 项目说明
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
