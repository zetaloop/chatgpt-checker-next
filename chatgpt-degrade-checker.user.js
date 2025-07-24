// ==UserScript==
// @name         ChatGPT降级检测
// @namespace    https://github.com/zetaloop/chatgpt-degrade-checker-next
// @homepage     https://github.com/zetaloop/chatgpt-degrade-checker-next
// @author       zetaloop
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzJjM2U1MCIgZD0iTTMyIDJDMTUuNDMyIDIgMiAxNS40MzIgMiAzMnMxMy40MzIgMzAgMzAgMzAgMzAtMTMuNDMyIDMwLTMwUzQ4LjU2OCAyIDMyIDJ6bTAgNTRjLTEzLjIzMyAwLTI0LTEwLjc2Ny0yNC0yNFMxOC43NjcgOCAzMiA4czI0IDEwLjc2NyAyNCAyNFM0NS4yMzMgNTYgMzIgNTZ6Ii8+PHBhdGggZmlsbD0iIzNkYzJmZiIgZD0iTTMyIDEyYy0xMS4wNDYgMC0yMCA4Ljk1NC0yMCAyMHM4Ljk1NCAyMCAyMCAyMCAyMC04Ljk1NCAyMC0yMFM0My4wNDYgMTIgMzIgMTJ6bTAgMzZjLTguODM3IDAtMTYtNy4xNjMtMTYtMTZzNy4xNjMtMTYgMTYtMTYgMTYgNy4xNjMgMTYgMTZTNDAuODM3IDQ4IDMyIDQ4eiIvPjxwYXRoIGZpbGw9IiMwMGZmN2YiIGQ9Ik0zMiAyMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMzOC42MjcgMjAgMzIgMjB6bTAgMjBjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzIiIGN5PSIzMiIgcj0iNCIvPjwvc3ZnPg==
// @version      2.5.0
// @description  由于 ChatGPT 会对某些 ip 进行无提示的服务降级，此脚本用于检测你的 ip 在 ChatGPT 数据库中的风险等级。
// @match        *://chatgpt.com/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://github.com/zetaloop/chatgpt-degrade-checker-next/raw/refs/heads/main/chatgpt-degrade-checker.user.js
// @updateURL    https://github.com/zetaloop/chatgpt-degrade-checker-next/raw/refs/heads/main/chatgpt-degrade-checker.user.js
// @license AGPLv3
// ==/UserScript==

(function () {
    "use strict";

    function createElements() {
        if (!document.body) {
            requestAnimationFrame(createElements);
            return;
        }

        if (document.getElementById("degrade-checker-displayBox")) return;

        // 创建显示框
        const displayBox = document.createElement("div");
        displayBox.id = "degrade-checker-displayBox";
        displayBox.style.position = "fixed";
        displayBox.style.top = "50%";
        displayBox.style.right = "20px";
        displayBox.style.transform = "translateY(-50%)";
        displayBox.style.width = "220px";
        displayBox.style.padding = "10px";
        displayBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        displayBox.style.color = "#fff";
        displayBox.style.fontSize = "14px";
        displayBox.style.borderRadius = "8px";
        displayBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
        displayBox.style.zIndex = "10000";
        displayBox.style.transition = "all 0.3s ease";
        displayBox.style.display = "none";

        displayBox.innerHTML = `
        <div id="pow-section">
            <div style="margin-bottom: 2px;">
                <strong>连接质量</strong>
            </div>
            PoW难度：<span id="difficulty">N/A</span><span id="difficulty-level" style="margin-left: 3px"></span>
            <span id="difficulty-tooltip" style="
                cursor: pointer;
                color: #fff;
                font-size: 12px;
                display: inline-block;
                width: 14px;
                height: 14px;
                line-height: 14px;
                text-align: center;
                border-radius: 50%;
                border: 1px solid #fff;
                margin-left: 3px;
            ">?</span><br>
            IP质量：<span id="ip-quality">N/A</span><br>
            <span id="persona-container" style="display: none">用户类型：<span id="persona">N/A</span></span>
        </div>
        <div id="deep-research-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>深度研究</strong>
            </div>
            剩余次数：<span id="deep-research-usage">N/A</span><br>
            重置时间：<span id="deep-research-reset-time">N/A</span>
        </div>
        <div id="odyssey-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>代理模式</strong>
            </div>
            剩余次数：<span id="odyssey-usage">N/A</span><br>
            重置时间：<span id="odyssey-reset-time">N/A</span>
        </div>
        <div id="codex-section" style="margin-top: 10px; display: none">
            <div style="margin-bottom: 2px;">
                <strong>Codex 可用次数</strong>
                <span id="codex-tooltip" style="
                    cursor: pointer;
                    color: #fff;
                    font-size: 12px;
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    line-height: 14px;
                    text-align: center;
                    border-radius: 50%;
                    border: 1px solid #fff;
                    margin-left: 3px;
                ">?</span>
            </div>
            已用次数：<span id="codex-usage">N/A</span><br>
            <div id="codex-progress-bg" style="margin-top: 8px; margin-bottom: 8px; width: 100%; height: 8px; background: #555; border-radius: 4px;">
                <div id="codex-progress-bar" style="height: 100%; width: 0%; background: #C26FFD; border-radius: 4px;"></div>
            </div>
            重置时间：<span id="codex-reset-time">N/A</span>
        </div>
        <div style="
            margin-top: 12px;
            padding-top: 8px;
            border-top: 0.5px solid rgba(255, 255, 255, 0.15);
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
            letter-spacing: 0.3px;
        ">
            ChatGPT Checker Next
    </div>`;
        document.body.appendChild(displayBox);

        // 创建收缩状态的指示器
        const collapsedIndicator = document.createElement("div");
        collapsedIndicator.style.position = "fixed";
        collapsedIndicator.style.top = "50%";
        collapsedIndicator.style.right = "20px";
        collapsedIndicator.style.transform = "translateY(-50%)";
        collapsedIndicator.style.width = "32px";
        collapsedIndicator.style.height = "32px";
        collapsedIndicator.style.backgroundColor = "transparent";
        collapsedIndicator.style.borderRadius = "50%";
        collapsedIndicator.style.cursor = "pointer";
        collapsedIndicator.style.zIndex = "10000";
        collapsedIndicator.style.padding = "4px";
        collapsedIndicator.style.display = "flex";
        collapsedIndicator.style.alignItems = "center";
        collapsedIndicator.style.justifyContent = "center";
        collapsedIndicator.style.transition = "all 0.3s ease";

        // 使用SVG作为指示器
        collapsedIndicator.innerHTML = `
    <svg id="status-icon" width="32" height="32" viewBox="0 0 64 64" style="transition: all 0.3s ease;">
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2ecc71;stop-opacity:1" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g id="icon-group" filter="url(#glow)">
            <circle cx="32" cy="32" r="28" fill="url(#gradient)" stroke="#fff" stroke-width="2"/>
            <circle cx="32" cy="32" r="20" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="100">
                <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0 32 32"
                    to="360 32 32"
                    dur="8s"
                    repeatCount="indefinite"/>
            </circle>
            <circle cx="32" cy="32" r="12" fill="none" stroke="#fff" stroke-width="2">
                <animate
                    attributeName="r"
                    values="12;14;12"
                    dur="2s"
                    repeatCount="indefinite"/>
            </circle>
            <circle id="center-dot" cx="32" cy="32" r="4" fill="#fff">
                <animate
                    attributeName="r"
                    values="4;6;4"
                    dur="2s"
                    repeatCount="indefinite"/>
            </circle>
        </g>
    </svg>`;
        document.body.appendChild(collapsedIndicator);

        // 鼠标悬停事件
        collapsedIndicator.addEventListener("mouseenter", function () {
            displayBox.style.display = "block";
            collapsedIndicator.style.opacity = "0";
        });

        displayBox.addEventListener("mouseleave", function () {
            displayBox.style.display = "none";
            collapsedIndicator.style.opacity = "1";
        });

        // 创建提示框
        const tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.innerText =
            "这个值越小，代表PoW难度越高，ChatGPT认为你的IP风险越高。";
        tooltip.style.position = "fixed";
        tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        tooltip.style.color = "#fff";
        tooltip.style.padding = "8px 12px";
        tooltip.style.borderRadius = "5px";
        tooltip.style.fontSize = "12px";
        tooltip.style.visibility = "hidden";
        tooltip.style.zIndex = "10001";
        tooltip.style.width = "240px";
        tooltip.style.lineHeight = "1.4";
        tooltip.style.pointerEvents = "none";
        document.body.appendChild(tooltip);

        // 创建 Codex 提示框
        const codexTooltip = document.createElement("div");
        codexTooltip.id = "codex-tooltip-box";
        codexTooltip.innerText =
            "访问 Codex 主页获取可用次数，使用一次之后才开始计时。";
        codexTooltip.style.position = "fixed";
        codexTooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        codexTooltip.style.color = "#fff";
        codexTooltip.style.padding = "8px 12px";
        codexTooltip.style.borderRadius = "5px";
        codexTooltip.style.fontSize = "12px";
        codexTooltip.style.visibility = "hidden";
        codexTooltip.style.zIndex = "10001";
        codexTooltip.style.width = "240px";
        codexTooltip.style.lineHeight = "1.4";
        codexTooltip.style.pointerEvents = "none";
        document.body.appendChild(codexTooltip);

        // 显示提示
        document
            .getElementById("difficulty-tooltip")
            .addEventListener("mouseenter", function (event) {
                tooltip.style.visibility = "visible";

                const tooltipWidth = 240;
                const windowWidth = window.innerWidth;
                const mouseX = event.clientX;
                const mouseY = event.clientY;

                let leftPosition = mouseX - tooltipWidth - 10;
                if (leftPosition < 10) {
                    leftPosition = mouseX + 20;
                }

                let topPosition = mouseY - 40;

                tooltip.style.left = `${leftPosition}px`;
                tooltip.style.top = `${topPosition}px`;
            });

        // 隐藏提示
        document
            .getElementById("difficulty-tooltip")
            .addEventListener("mouseleave", function () {
                tooltip.style.visibility = "hidden";
            });

        // Codex 提示事件处理
        function addCodexTooltipEvents() {
            const codexTooltipElement =
                document.getElementById("codex-tooltip");
            if (codexTooltipElement) {
                codexTooltipElement.addEventListener(
                    "mouseenter",
                    function (event) {
                        codexTooltip.style.visibility = "visible";

                        const tooltipWidth = 240;
                        const windowWidth = window.innerWidth;
                        const mouseX = event.clientX;
                        const mouseY = event.clientY;

                        let leftPosition = mouseX - tooltipWidth - 10;
                        if (leftPosition < 10) {
                            leftPosition = mouseX + 20;
                        }

                        let topPosition = mouseY - 40;

                        codexTooltip.style.left = `${leftPosition}px`;
                        codexTooltip.style.top = `${topPosition}px`;
                    }
                );

                codexTooltipElement.addEventListener("mouseleave", function () {
                    codexTooltip.style.visibility = "hidden";
                });
            }
        }

        // 延迟添加 Codex 提示事件，因为元素可能在后面动态显示
        setTimeout(addCodexTooltipEvents, 100);

        // 在 MutationObserver 中也需要重新绑定事件
        function rebindCodexEvents() {
            addCodexTooltipEvents();
        }

        // 暴露函数供 MutationObserver 使用
        window.rebindCodexEvents = rebindCodexEvents;
    }

    // 创建元素
    createElements();

    // 使用 MutationObserver 观测 DOM 改动
    const observer = new MutationObserver((mutationsList, observer) => {
        // 保持检测器元素
        if (!document.getElementById("degrade-checker-displayBox")) {
            createElements();
        }
        // 重新绑定 Codex 事件
        if (window.rebindCodexEvents) {
            window.rebindCodexEvents();
        }
    });

    function startObserverWhenReady() {
        if (!document.body) {
            requestAnimationFrame(startObserverWhenReady);
            return;
        }
        observer.observe(document.body, { childList: true, subtree: true });
    }
    startObserverWhenReady();

    let powFetched = false;
    let codexFetched = false;

    // 更新difficulty指示器
    function updateDifficultyIndicator(difficulty) {
        const difficultyLevel = document.getElementById("difficulty-level");
        const ipQuality = document.getElementById("ip-quality");

        if (difficulty === "N/A") {
            setIconColors("#888", "#666");
            difficultyLevel.innerText = "";
            ipQuality.innerHTML = "N/A";
            powFetched = false;
            const powSection = document.getElementById("pow-section");
            if (powSection && codexFetched) powSection.style.display = "none";
            return;
        }

        const cleanDifficulty = difficulty.replace("0x", "").replace(/^0+/, "");
        const hexLength = cleanDifficulty.length;

        let color, secondaryColor, textColor, level, qualityText;

        if (hexLength <= 2) {
            color = "#F44336";
            secondaryColor = "#d32f2f";
            textColor = "#ff6b6b";
            level = "(困难)";
            qualityText = "高风险";
        } else if (hexLength === 3) {
            color = "#FFC107";
            secondaryColor = "#ffa000";
            textColor = "#ffd700";
            level = "(中等)";
            qualityText = "中等";
        } else if (hexLength === 4) {
            color = "#8BC34A";
            secondaryColor = "#689f38";
            textColor = "#9acd32";
            level = "(简单)";
            qualityText = "良好";
        } else {
            color = "#4CAF50";
            secondaryColor = "#388e3c";
            textColor = "#98fb98";
            level = "(极易)";
            qualityText = "优秀";
        }

        setIconColors(color, secondaryColor);
        difficultyLevel.innerHTML = `<span style="color: ${textColor}">${level}</span>`;
        ipQuality.innerHTML = `<span style="color: ${textColor}">${qualityText}</span>`;
        powFetched = true;
        const powSection = document.getElementById("pow-section");
        if (powSection) powSection.style.display = "block";
    }

    function setIconColors(primaryColor, secondaryColor) {
        const gradient = document.querySelector("#gradient");
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        `;
    }

    // 更新 Codex 可用次数进度条
    let codexResetTime = null;
    let codexLimit = null;
    let codexUsed = null;
    let codexResetsAfter = null;
    function updateCodexInfo(limit, remaining, resetsAfter) {
        const section = document.getElementById("codex-section");
        const bar = document.getElementById("codex-progress-bar");
        const usageEl = document.getElementById("codex-usage");
        const resetEl = document.getElementById("codex-reset-time");

        if (!section || !bar || !usageEl || !resetEl) return;

        if (typeof limit !== "number" || typeof remaining !== "number") {
            section.style.display = "none";
            return;
        }

        codexLimit = limit;
        codexUsed = limit - (remaining + 1);
        codexResetsAfter = resetsAfter;
        const percent = Math.max(0, Math.min(100, (codexUsed / limit) * 100));
        bar.style.width = `${percent}%`;
        bar.style.background = "#C26FFD";
        section.style.display = "block";
        if (!powFetched) {
            section.style.marginTop = "0";
        } else {
            section.style.marginTop = "10px";
        }

        if (codexUsed > 0) {
            codexResetTime = Date.now() + resetsAfter * 1000;
        } else {
            codexResetTime = null;
        }

        codexFetched = true;
        if (!powFetched) {
            setIconColors("#C26FFD", "#A855F7");
            const powSection = document.getElementById("pow-section");
            if (powSection) powSection.style.display = "none";
        }
        updateCodexCountdown();
    }

    function updateCodexCountdown() {
        const usageEl = document.getElementById("codex-usage");
        const resetEl = document.getElementById("codex-reset-time");

        if (!usageEl || !resetEl) return;
        if (codexLimit === null || codexUsed === null) {
            usageEl.innerText = "N/A";
            resetEl.innerText = "N/A";
            return;
        }

        usageEl.innerText = `${codexUsed}/${codexLimit}`;

        // 未使用时静态显示 resetsAfter 时间
        if (codexUsed === 0 && codexResetsAfter !== null) {
            const totalSecs = codexResetsAfter;
            const m = Math.floor(totalSecs / 60);
            const s = totalSecs % 60;
            const staticStr = s ? `${m}分钟${s}秒` : `${m}分钟`;
            resetEl.innerText = `${staticStr}（未开始）`;
            return;
        }

        // 已使用后动态倒计时
        if (codexResetTime) {
            const remainingSecs = Math.max(
                0,
                Math.floor((codexResetTime - Date.now()) / 1000)
            );
            const minutes = Math.floor(remainingSecs / 60);
            const seconds = remainingSecs % 60;
            const timeStr = minutes
                ? `${minutes}分钟${seconds}秒`
                : `${seconds}秒`;
            resetEl.innerText = timeStr;
        } else {
            resetEl.innerText = "N/A";
        }
    }
    setInterval(updateCodexCountdown, 1000);

    // 更新深度研究次数
    let researchRemaining = null;
    let researchReset = null;
    function updateDeepResearchInfo(remaining, resetAfter) {
        const section = document.getElementById("deep-research-section");
        const usageEl = document.getElementById("deep-research-usage");
        const resetEl = document.getElementById("deep-research-reset-time");

        if (!section || !usageEl || !resetEl) return;

        if (typeof remaining !== "number") {
            section.style.display = "none";
            return;
        }

        researchRemaining = remaining;
        researchReset = resetAfter || null;

        section.style.display = "block";
        if (!powFetched) {
            section.style.marginTop = "0";
        } else {
            section.style.marginTop = "10px";
        }

        usageEl.innerText = `${remaining}次`;

        if (researchReset) {
            const date = new Date(researchReset);
            resetEl.innerText = date
                .toLocaleString("zh-CN", { hour12: false })
                .replace(/\//g, "-");
        } else {
            resetEl.innerText = "N/A";
        }
    }

    // 更新代理模式次数
    let agentRemaining = null;
    let agentReset = null;
    function updateAgentInfo(remaining, resetAfter) {
        const section = document.getElementById("odyssey-section");
        const usageEl = document.getElementById("odyssey-usage");
        const resetEl = document.getElementById("odyssey-reset-time");

        if (!section || !usageEl || !resetEl) return;

        if (typeof remaining !== "number") {
            section.style.display = "none";
            return;
        }

        agentRemaining = remaining;
        agentReset = resetAfter || null;

        section.style.display = "block";
        if (!powFetched) {
            section.style.marginTop = "0";
        } else {
            section.style.marginTop = "10px";
        }

        usageEl.innerText = `${remaining}次`;

        if (agentReset) {
            const date = new Date(agentReset);
            resetEl.innerText = date
                .toLocaleString("zh-CN", { hour12: false })
                .replace(/\//g, "-");
        } else {
            resetEl.innerText = "N/A";
        }
    }

    // 拦截 fetch 请求
    const originalFetch = window.fetch;
    window.fetch = async function (resource, options = {}) {
        const requestUrl =
            typeof resource === "string" ? resource : resource?.url || "";
        const requestMethod =
            typeof resource === "object" && resource.method
                ? resource.method
                : options?.method || "GET";
        const finalMethod = requestMethod.toUpperCase();
        const response = await originalFetch(resource, options);

        if (
            (requestUrl.includes("/backend-api/sentinel/chat-requirements") ||
                requestUrl.includes(
                    "/backend-anon/sentinel/chat-requirements"
                )) &&
            finalMethod === "POST" &&
            response.ok
        ) {
            let responseBodyText;
            try {
                responseBodyText = await response.text();
                const data = JSON.parse(responseBodyText);
                const difficulty = data.proofofwork
                    ? data.proofofwork.difficulty
                    : "N/A";
                const persona = data.persona || "N/A";
                const difficultyElement = document.getElementById("difficulty");
                if (difficultyElement) difficultyElement.innerText = difficulty;

                const personaContainer =
                    document.getElementById("persona-container");
                const personaElement = document.getElementById("persona");
                if (personaContainer && personaElement) {
                    if (
                        persona &&
                        typeof persona === "string" &&
                        persona !== "N/A" &&
                        !persona.toLowerCase().includes("free")
                    ) {
                        personaContainer.style.display = "block";
                        personaElement.innerText = persona;
                    } else {
                        personaContainer.style.display = "none";
                    }
                }
                updateDifficultyIndicator(difficulty);

                return new Response(responseBodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error(
                    "[DegradeChecker] 处理响应或重新创建响应时出错:",
                    e
                );
                const difficultyElement = document.getElementById("difficulty");
                if (difficultyElement) difficultyElement.innerText = "N/A";
                updateDifficultyIndicator("N/A");
                const personaContainer =
                    document.getElementById("persona-container");
                if (personaContainer) personaContainer.style.display = "none";

                if (typeof responseBodyText === "string") {
                    return new Response(responseBodyText, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                    });
                }
                return response;
            }
        }

        if (
            requestUrl.includes("/backend-api/conversation/init") &&
            finalMethod === "POST" &&
            response.ok
        ) {
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                const deep_research = Array.isArray(data.limits_progress)
                    ? data.limits_progress.find(
                          (i) => i.feature_name === "deep_research"
                      )
                    : null;
                const odyssey = Array.isArray(data.limits_progress)
                    ? data.limits_progress.find(
                          (i) => i.feature_name === "odyssey"
                      )
                    : null;
                if (deep_research) {
                    updateDeepResearchInfo(
                        deep_research.remaining,
                        deep_research.reset_after
                    );
                }
                if (odyssey) {
                    updateAgentInfo(odyssey.remaining, odyssey.reset_after);
                }
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error(
                    "[DegradeChecker] 处理 Deep Research 与 Agent 响应出错:",
                    e
                );
                if (typeof bodyText === "string") {
                    return new Response(bodyText, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                    });
                }
                return response;
            }
        }

        if (
            requestUrl.includes("/backend-api/wham/tasks/rate_limit") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                if (location.pathname.startsWith("/codex")) {
                    updateCodexInfo(
                        data.limit,
                        data.remaining,
                        data.resets_after
                    );
                }
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error("[DegradeChecker] 处理 Codex 响应出错:", e);
                if (typeof bodyText === "string") {
                    return new Response(bodyText, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                    });
                }
                return response;
            }
        }
        return response;
    };
})();
