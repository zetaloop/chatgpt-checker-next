// ==UserScript==
// @name         ChatGPT Checker Next
// @namespace    https://github.com/zetaloop/chatgpt-checker-next
// @homepage     https://github.com/zetaloop/chatgpt-checker-next
// @author       zetaloop
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzJjM2U1MCIgZD0iTTMyIDJDMTUuNDMyIDIgMiAxNS40MzIgMiAzMnMxMy40MzIgMzAgMzAgMzAgMzAtMTMuNDMyIDMwLTMwUzQ4LjU2OCAyIDMyIDJ6bTAgNTRjLTEzLjIzMyAwLTI0LTEwLjc2Ny0yNC0yNFMxOC43NjcgOCAzMiA4czI0IDEwLjc2NyAyNCAyNFM0NS4yMzMgNTYgMzIgNTZ6Ii8+PHBhdGggZmlsbD0iIzNkYzJmZiIgZD0iTTMyIDEyYy0xMS4wNDYgMC0yMCA4Ljk1NC0yMCAyMHM4Ljk1NCAyMCAyMCAyMCAyMC04Ljk1NCAyMC0yMFM0My4wNDYgMTIgMzIgMTJ6bTAgMzZjLTguODM3IDAtMTYtNy4xNjMtMTYtMTZzNy4xNjMtMTYgMTYtMTYgMTYgNy4xNjMgMTYgMTZTNDAuODM3IDQ4IDMyIDQ4eiIvPjxwYXRoIGZpbGw9IiMwMGZmN2YiIGQ9Ik0zMiAyMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMzOC42MjcgMjAgMzIgMjB6bTAgMjBjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzIiIGN5PSIzMiIgcj0iNCIvPjwvc3ZnPg==
// @version      2.6.0
// @description  获取 ChatGPT 的服务降级风险等级、深度研究和 Codex 用量等信息。
// @match        *://chatgpt.com/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @updateURL    https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
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
        displayBox.style.width = "240px";
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
                <strong>服务信息</strong>
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
            <span id="persona-container" style="display: none">用户类型：<span id="persona">N/A</span></span>
            <span id="default-model-container" style="display: none">默认模型：<span id="default-model">N/A</span></span>
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
        <div id="file-upload-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>文件上传</strong>
            </div>
            剩余次数：<span id="file-upload-usage">N/A</span><br>
            重置时间：<span id="file-upload-reset-time">N/A</span>
        </div>
        <div id="codex-section" style="margin-top: 10px; display: none">
            <div style="margin-bottom: 8px;">
                <strong>Codex 用量</strong>
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
            <div style="display:flex;justify-content:space-between;align-items:center;margin-right:4px;">
                <span>已用：<span id="codex-usage">N/A</span></span>
                <span><i>每5小时</i></span>
            </div>
            <div id="codex-progress-bg" style="margin-top: 4px; margin-bottom: 4px; width: 100%; height: 8px; background: #555; border-radius: 4px;">
                <div id="codex-progress-bar" style="height: 100%; width: 0%; background: #C26FFD; border-radius: 4px;"></div>
            </div>
            重置时间：<span id="codex-reset-time">N/A</span>
            <div style="margin-top: 8px;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-right:4px;">
                <span>已用：<span id="codex-usage-week">N/A</span></span>
                <span><i>每周</i></span>
            </div>
            <div id="codex-progress-bg-week" style="margin-top: 4px; margin-bottom: 4px; width: 100%; height: 8px; background: #555; border-radius: 4px;">
                <div id="codex-progress-bar-week" style="height: 100%; width: 0%; background: #C26FFD; border-radius: 4px;"></div>
            </div>
            重置时间：<span id="codex-reset-time-week">N/A</span>
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
            "这个数值越大，相当于 ChatGPT 认为你的 IP 风险越低。";
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
            "访问 Codex 主页获取用量数据，使用一次之后才开始计时。";
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
                    },
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

        if (difficulty === "N/A") {
            setIconColors("#888", "#666");
            difficultyLevel.innerText = "";
            powFetched = false;
            const powSection = document.getElementById("pow-section");
            if (powSection && codexFetched) powSection.style.display = "none";
            return;
        }

        const cleanDifficulty = difficulty.replace("0x", "").replace(/^0+/, "");
        const hexLength = cleanDifficulty.length;

        let color, secondaryColor, textColor, level;

        if (hexLength <= 2) {
            color = "#F44336";
            secondaryColor = "#d32f2f";
            textColor = "#ff6b6b";
            level = "(风险)";
        } else if (hexLength === 3) {
            color = "#FFC107";
            secondaryColor = "#ffa000";
            textColor = "#ffd700";
            level = "(中等)";
        } else if (hexLength === 4) {
            color = "#8BC34A";
            secondaryColor = "#689f38";
            textColor = "#9acd32";
            level = "(良好)";
        } else {
            color = "#4CAF50";
            secondaryColor = "#388e3c";
            textColor = "#98fb98";
            level = "(优秀)";
        }

        setIconColors(color, secondaryColor);
        difficultyLevel.innerHTML = `<span style="color: ${textColor}">${level}</span>`;
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

    // 更新 Codex 用量
    let codexResetTimePrimary = null;
    let codexResetTimeSecondary = null;
    let codexResetsAfterPrimary = null;
    let codexResetsAfterSecondary = null;
    let codexUsedPercentPrimary = null; // 0~100
    let codexUsedPercentSecondary = null; // 0~100
    let codexLimitWindowSecondsPrimary = null;
    let codexLimitWindowSecondsSecondary = null;
    function updateCodexInfo(
        pUsedPercent,
        pResetAfter,
        pResetAt,
        sUsedPercent,
        sResetAfter,
        sResetAt,
        pLimitWindowSecs,
        sLimitWindowSecs,
    ) {
        const section = document.getElementById("codex-section");
        const barP = document.getElementById("codex-progress-bar");
        const usageP = document.getElementById("codex-usage");
        const resetP = document.getElementById("codex-reset-time");

        const barS = document.getElementById("codex-progress-bar-week");
        const usageS = document.getElementById("codex-usage-week");
        const resetS = document.getElementById("codex-reset-time-week");

        if (
            !section ||
            !barP ||
            !usageP ||
            !resetP ||
            !barS ||
            !usageS ||
            !resetS
        )
            return;

        if (
            typeof pUsedPercent !== "number" ||
            typeof sUsedPercent !== "number"
        ) {
            section.style.display = "none";
            return;
        }

        codexUsedPercentPrimary = Math.max(0, Math.min(100, pUsedPercent));
        codexUsedPercentSecondary = Math.max(0, Math.min(100, sUsedPercent));
        codexResetsAfterPrimary =
            typeof pResetAfter === "number" ? pResetAfter : null;
        codexResetsAfterSecondary =
            typeof sResetAfter === "number" ? sResetAfter : null;
        codexLimitWindowSecondsPrimary =
            typeof pLimitWindowSecs === "number" ? pLimitWindowSecs : null;
        codexLimitWindowSecondsSecondary =
            typeof sLimitWindowSecs === "number" ? sLimitWindowSecs : null;

        if (codexUsedPercentPrimary > 0 && codexResetsAfterPrimary != null) {
            codexResetTimePrimary = Date.now() + codexResetsAfterPrimary * 1000;
        } else if (typeof pResetAt === "number") {
            codexResetTimePrimary = pResetAt * 1000;
        } else {
            codexResetTimePrimary = null;
        }

        if (
            codexUsedPercentSecondary > 0 &&
            codexResetsAfterSecondary != null
        ) {
            codexResetTimeSecondary =
                Date.now() + codexResetsAfterSecondary * 1000;
        } else if (typeof sResetAt === "number") {
            codexResetTimeSecondary = sResetAt * 1000;
        } else {
            codexResetTimeSecondary = null;
        }

        barP.style.width = `${codexUsedPercentPrimary}%`;
        barS.style.width = `${codexUsedPercentSecondary}%`;
        barP.style.background = "#C26FFD";
        barS.style.background = "#C26FFD";

        usageP.innerText = `${codexUsedPercentPrimary}%`;
        usageS.innerText = `${codexUsedPercentSecondary}%`;

        section.style.display = "block";
        section.style.marginTop = powFetched ? "10px" : "0";

        codexFetched = true;
        if (!powFetched) {
            setIconColors("#C26FFD", "#A855F7");
            const powSection = document.getElementById("pow-section");
            if (powSection) powSection.style.display = "none";
        }
        updateCodexCountdown();
    }

    function formatCodexDuration(totalSecs, omitZeroUnits) {
        if (totalSecs == null) return "N/A";
        const t = Math.max(0, Math.floor(totalSecs));
        const d = Math.floor(t / 86400);
        const h = Math.floor((t % 86400) / 3600);
        const m = Math.floor((t % 3600) / 60);
        const s = t % 60;

        if (d >= 1) {
            const parts = [`${d}天`];
            if (!omitZeroUnits || h > 0) parts.push(`${h}小时`);
            if (!omitZeroUnits || m > 0) parts.push(`${m}分钟`);
            if (!omitZeroUnits || s > 0) parts.push(`${s}秒`);
            return parts.join("");
        } else {
            const parts = [];
            if (!omitZeroUnits || h > 0) parts.push(`${h}小时`);
            if (!omitZeroUnits || m > 0) parts.push(`${m}分钟`);
            if (!omitZeroUnits || s > 0) parts.push(`${s}秒`);
            return parts.length ? parts.join("") : "0秒";
        }
    }

    function updateCodexCountdown() {
        const resetP = document.getElementById("codex-reset-time");
        const resetS = document.getElementById("codex-reset-time-week");
        if (!resetP || !resetS) return;

        // 五小时
        if (codexUsedPercentPrimary == null) {
            resetP.innerText = "N/A";
        } else if (codexUsedPercentPrimary === 0) {
            let secs = null;
            if (typeof codexLimitWindowSecondsPrimary === "number") {
                secs = codexLimitWindowSecondsPrimary + 60;
            } else if (typeof codexResetsAfterPrimary === "number") {
                secs = codexResetsAfterPrimary + 60;
            } else if (typeof codexResetTimePrimary === "number") {
                secs =
                    Math.max(
                        0,
                        Math.floor((codexResetTimePrimary - Date.now()) / 1000),
                    ) + 60;
            }
            resetP.innerText =
                secs != null
                    ? `${formatCodexDuration(secs, true)}（未开始）`
                    : "N/A";
        } else {
            let secs = null;
            if (typeof codexResetTimePrimary === "number") {
                secs = Math.max(
                    0,
                    Math.floor((codexResetTimePrimary - Date.now()) / 1000),
                );
            } else if (typeof codexResetsAfterPrimary === "number") {
                secs = Math.max(0, Math.floor(codexResetsAfterPrimary));
            }
            resetP.innerText =
                secs != null ? formatCodexDuration(secs, false) : "N/A";
        }

        // 一星期
        if (codexUsedPercentSecondary == null) {
            resetS.innerText = "N/A";
        } else if (codexUsedPercentSecondary === 0) {
            let secs = null;
            if (typeof codexLimitWindowSecondsSecondary === "number") {
                secs = codexLimitWindowSecondsSecondary + 60;
            } else if (typeof codexResetsAfterSecondary === "number") {
                secs = codexResetsAfterSecondary + 60;
            } else if (typeof codexResetTimeSecondary === "number") {
                secs =
                    Math.max(
                        0,
                        Math.floor(
                            (codexResetTimeSecondary - Date.now()) / 1000,
                        ),
                    ) + 60;
            }
            resetS.innerText =
                secs != null
                    ? `${formatCodexDuration(secs, true)}（未开始）`
                    : "N/A";
        } else {
            let secs = null;
            if (typeof codexResetTimeSecondary === "number") {
                secs = Math.max(
                    0,
                    Math.floor((codexResetTimeSecondary - Date.now()) / 1000),
                );
            } else if (typeof codexResetsAfterSecondary === "number") {
                secs = Math.max(0, Math.floor(codexResetsAfterSecondary));
            }
            resetS.innerText =
                secs != null ? formatCodexDuration(secs, false) : "N/A";
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
        section.style.marginTop = powFetched ? "10px" : "0";
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
        section.style.marginTop = powFetched ? "10px" : "0";
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

    // 更新文件上传次数
    let uploadRemaining = null;
    let uploadReset = null;
    function updateFileUploadInfo(remaining, resetAfter) {
        const section = document.getElementById("file-upload-section");
        const usageEl = document.getElementById("file-upload-usage");
        const resetEl = document.getElementById("file-upload-reset-time");

        if (!section || !usageEl || !resetEl) return;

        if (typeof remaining !== "number") {
            section.style.display = "none";
            return;
        }

        uploadRemaining = remaining;
        uploadReset = resetAfter || null;

        section.style.display = "block";
        section.style.marginTop = powFetched ? "10px" : "0";
        usageEl.innerText = `${remaining}次`;

        if (uploadReset) {
            const date = new Date(uploadReset);
            resetEl.innerText = date
                .toLocaleString("zh-CN", { hour12: false })
                .replace(/\//g, "-");
        } else {
            resetEl.innerText = "N/A";
        }
    }

    // 更新默认模型
    let defaultModelSlug = null;
    function updateDefaultModelInfo(slug) {
        const container = document.getElementById("default-model-container");
        const valueEl = document.getElementById("default-model");
        if (!container || !valueEl) return;

        if (!slug || typeof slug !== "string") {
            container.style.display = "none";
            defaultModelSlug = null;
            return;
        }

        defaultModelSlug = slug;
        valueEl.innerText = slug;
        container.style.display = "inline";
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
                    "/backend-anon/sentinel/chat-requirements",
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
                    e,
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
                          (i) => i.feature_name === "deep_research",
                      )
                    : null;
                const odyssey = Array.isArray(data.limits_progress)
                    ? data.limits_progress.find(
                          (i) => i.feature_name === "odyssey",
                      )
                    : null;
                const file_upload = Array.isArray(data.limits_progress)
                    ? data.limits_progress.find(
                          (i) => i.feature_name === "file_upload",
                      )
                    : null;
                if (deep_research) {
                    updateDeepResearchInfo(
                        deep_research.remaining,
                        deep_research.reset_after,
                    );
                }
                if (odyssey) {
                    updateAgentInfo(odyssey.remaining, odyssey.reset_after);
                }
                if (file_upload) {
                    updateFileUploadInfo(
                        file_upload.remaining,
                        file_upload.reset_after,
                    );
                }
                updateDefaultModelInfo(
                    typeof data.default_model_slug === "string"
                        ? data.default_model_slug
                        : null,
                );
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error(
                    "[DegradeChecker] 处理 Deep Research 与 Agent 响应出错:",
                    e,
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
            requestUrl.includes("/backend-api/wham/usage") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                if (
                    location.pathname.startsWith("/codex") &&
                    data &&
                    data.rate_limit
                ) {
                    const p = data.rate_limit.primary_window || {};
                    const s = data.rate_limit.secondary_window || {};
                    updateCodexInfo(
                        typeof p.used_percent === "number"
                            ? p.used_percent
                            : null,
                        typeof p.reset_after_seconds === "number"
                            ? p.reset_after_seconds
                            : null,
                        typeof p.reset_at === "number" ? p.reset_at : null,
                        typeof s.used_percent === "number"
                            ? s.used_percent
                            : null,
                        typeof s.reset_after_seconds === "number"
                            ? s.reset_after_seconds
                            : null,
                        typeof s.reset_at === "number" ? s.reset_at : null,
                        typeof p.limit_window_seconds === "number"
                            ? p.limit_window_seconds
                            : null,
                        typeof s.limit_window_seconds === "number"
                            ? s.limit_window_seconds
                            : null,
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
