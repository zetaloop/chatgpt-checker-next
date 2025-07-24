> Forked from [KoriIku/chatgpt-degrade-checker](https://github.com/KoriIku/chatgpt-degrade-checker), and fixed some bugs.
>
> 20250609 Added Codex usage tracking.<br>
> 20250613 Added Deep Research usage tracking.<br>
> 20250725 Added ChatGPT Agent usage tracking.

# ChatGPT Service Downgrade Detection Tool Next

This tool helps detect if ChatGPT has limited access to certain features on your account by downgrading service due to a "high-risk" IP designation. Users encountering issues like the inability to generate images with GPT-4, limited web search access, or simplified responses from GPT-3.5 may benefit from running this script to identify potential downgrades.

## Installation and Usage
1. First, install Tampermonkey: https://www.tampermonkey.net/

2. Then, click this link to install the tool: [Click to Install](https://github.com/zetaloop/chatgpt-degrade-checker/raw/refs/heads/main/chatgpt-degrade-checker.user.js)

3. After installation, open [ChatGPT](https://chatgpt.com/). A green circle will appear on the right side of the screen. Hover over it to view diagnostic details. If the Proof of Work (PoW) difficulty displayed is unusually low, it may suggest that your IP has been flagged, which could result in limited access to certain features.

   As a reference, PoW values with five or more digits generally indicate an unrestricted IP that should allow full access to ChatGPT’s capabilities. Values of 000032 or lower could indicate that the IP is considered high-risk, leading to restricted functionality.

   _(Note: PoW levels can vary even for the same IP. For example, after completing a higher difficulty PoW, the next one may be slightly easier, although it typically won’t drop to “simple.”)_

### Codex Usage Tracking
When visiting `https://chatgpt.com/codex`, the PoW endpoint is unavailable. The userscript intercepts the Wham rate-limit API response and displays a purple progress bar showing how many Codex tasks you have used and how long until the quota resets. If PoW data cannot be retrieved, the PoW section is hidden and the circular icon turns purple to indicate Codex status.

## What Is a Service Downgrade?
When certain IPs are flagged as high-risk, ChatGPT may silently downgrade access by switching to a lower-tier model, such as the 4o-mini variant or a simpler model, without notifying the user.

### Effects of Service Downgrades
With service downgrades, even ChatGPT Plus users may notice missing features like web search and image generation on GPT-4. Similarly, if downgraded to a lighter GPT-3.5 model, responses may become more basic, with less depth in reasoning. 

For users experiencing sudden changes in ChatGPT functionality—like missing image generation, web search, or nuanced responses—this tool may help clarify if a silent downgrade is impacting their experience.


---

# ChatGPT 服务降级检测工具
由于 ChatGPT 会对某些 ip 进行无提示的服务降级，此脚本用于检测你的 ip 是否被 ChatGPT 判定为高风险。在一定程度上可以用于辅助判断你的 ip 是否遭到服务降级。

## 安装及使用
1. 首先安装 tampermonkey：https://www.tampermonkey.net/

2. 然后点击链接安装本工具： [点此安装](https://github.com/zetaloop/chatgpt-degrade-checker/raw/refs/heads/main/chatgpt-degrade-checker.user.js)

3. 安装完成后打开 [chatgpt](https://chatgpt.com/)，你可以在屏幕右侧看到一个绿色圆圈，鼠标移上去之后会显示详细信息，如果 PoW 难度的值很低，代表你的 ip 可能被判断为了高风险。

作为参考，这个值在超过 5 位时，一般代表你的ip较为优质，可以正常使用所有服务，如果小于等于 000032，说明你的 ip 被认为有很高的风险。

（更详细的区分尚不清晰，我简单测试了几个 ip，发现即便对同一个 ip，其要求的 PoW 也很容易变动，例如，如果已经完成了一个较困难的 PoW，下一次的 PoW 难度就会稍稍降低，但不会降低到“简单”级别。）

### Codex 使用量
访问 `https://chatgpt.com/codex` 时无法获取 PoW 信息，脚本会拦截 Wham 接口的返回数据显示 Codex 当前额度，并以紫色进度条展示剩余次数和重置倒计时。如果无法获取 PoW 数据，会隐藏 PoW 信息，并把圆形图标变成紫色表示 Codex 状态。

## 什么是服务降级？
ChatGPT 会对一些被判断为高风险的 ip 降级服务，偷偷将模型切换为 4o-mini 或者更差，并且**没有任何提示**。

### 服务降级有什么影响
降级后，即便你是 plus 用户，在使用 4o 模型时会发现无法使用联网搜索、图片生成等功能，使用 o1 模型时，会发现模型不进行思考直接回答。




