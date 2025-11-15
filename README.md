> Forked from [KoriIku/chatgpt-degrade-checker](https://github.com/KoriIku/chatgpt-degrade-checker), and fixed some bugs.

# ChatGPT Checker Next

获取 ChatGPT 的服务降级风险等级和各功能可用额度信息。

## 安装

1. 首先需要安装 [Tampermonkey](https://www.tampermonkey.net)
2. 然后点击链接安装此脚本 [chatgpt-checker-next.user.js](https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js)
3. 打开 [chatgpt.com](https://chatgpt.com) 首页，页面右侧有一个绿色圆圈，将光标放上去即可查看服务质量（根据 PoW）和可用额度等信息。

## 功能

- **服务质量**：ChatGPT 网站的 Proof Of Work 难度数值，数值越大通常代表风控越轻，但并不是唯一的判断标准。
- **默认模型**：用户选择的默认模型。
- **价格地区**：当前购买会员的价格地区。
- **是否成年**：账户是否标记为成年。
- **模型记忆**：记忆已用/总共的 Token 容量。
- **深度研究**：Deep Research 模式的剩余次数与重置时间。
- **代理模式**：Agent 模式的剩余次数与重置时间。
- **文件上传**：文件上传的剩余次数与重置时间。
- **Codex 用量**：Codex 的每五小时/每周用量进度条与重置时间。
- **Sora 模型**：当前可用的 Sora 模型，例如 `turbo` 为 Sora 1，`sy_8` 为 Sora 2。
- **Sora 次数**：Sora 的每日次数与重置时间。
- **积分**：单独购买的积分，可用于 Sora、Codex 等任务。
- 更多好玩的功能敬请期待

## 顺便一提

服务降级可能表现为：

GPT-5 回答自己是 GPT-4 模型、GPT-5 Thinking 等思考模型 "已思考几秒" 或不思考、深度研究时直接回答而不启动研究等。
