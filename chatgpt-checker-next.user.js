// ==UserScript==
// @name         ChatGPT Checker Next
// @namespace    https://github.com/zetaloop/chatgpt-checker-next
// @homepage     https://github.com/zetaloop/chatgpt-checker-next
// @author       zetaloop
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzJjM2U1MCIgZD0iTTMyIDJDMTUuNDMyIDIgMiAxNS40MzIgMiAzMnMxMy40MzIgMzAgMzAgMzAgMzAtMTMuNDMyIDMwLTMwUzQ4LjU2OCAyIDMyIDJ6bTAgNTRjLTEzLjIzMyAwLTI0LTEwLjc2Ny0yNC0yNFMxOC43NjcgOCAzMiA4czI0IDEwLjc2NyAyNCAyNFM0NS4yMzMgNTYgMzIgNTZ6Ii8+PHBhdGggZmlsbD0iIzNkYzJmZiIgZD0iTTMyIDEyYy0xMS4wNDYgMC0yMCA4Ljk1NC0yMCAyMHM4Ljk1NCAyMCAyMCAyMCAyMC04Ljk1NCAyMC0yMFM0My4wNDYgMTIgMzIgMTJ6bTAgMzZjLTguODM3IDAtMTYtNy4xNjMtMTYtMTZzNy4xNjMtMTYgMTYtMTYgMTYgNy4xNjMgMTYgMTZTNDAuODM3IDQ4IDMyIDQ4eiIvPjxwYXRoIGZpbGw9IiMwMGZmN2YiIGQ9Ik0zMiAyMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMzOC42MjcgMjAgMzIgMjB6bTAgMjBjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzIiIGN5PSIzMiIgcj0iNCIvPjwvc3ZnPg==
// @version      2.7.3
// @description  获取 ChatGPT 的服务降级风险等级和各功能可用额度信息。
// @match        *://chatgpt.com/*
// @match        *://sora.chatgpt.com/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @updateURL    https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @license AGPLv3
// ==/UserScript==

(function () {
    "use strict";

    const MODE_CHATGPT = "chatgpt";
    const MODE_CODEX = "codex";
    const MODE_SORA = "sora";

    function detectPageMode() {
        const { hostname, pathname } = window.location;
        if (hostname === "sora.chatgpt.com") return MODE_SORA;
        if (hostname === "chatgpt.com" && pathname.startsWith("/codex")) {
            return MODE_CODEX;
        }
        return MODE_CHATGPT;
    }

    const currentPageMode = detectPageMode();
    const isChatgptMode = currentPageMode === MODE_CHATGPT;
    const isCodexMode = currentPageMode === MODE_CODEX;
    const isSoraMode = currentPageMode === MODE_SORA;
    const NOT_STARTED_BADGE = '<span style="color:#9ca3af"> (未开始)</span>';

    function createElements() {
        if (!document.body) {
            requestAnimationFrame(createElements);
            return;
        }

        if (document.getElementById("checker-next-displayBox")) return;

        // 创建显示框
        const displayBox = document.createElement("div");
        displayBox.id = "checker-next-displayBox";
        displayBox.style.position = "fixed";
        displayBox.style.top = "50%";
        displayBox.style.right = "20px";
        displayBox.style.transform = "translateY(-50%)";
        displayBox.style.width = "240px";
        displayBox.style.padding = "0";
        displayBox.style.overflow = "hidden";
        displayBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        displayBox.style.color = "#fff";
        displayBox.style.fontSize = "14px";
        displayBox.style.borderRadius = "8px";
        displayBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
        displayBox.style.zIndex = "10000";
        displayBox.style.transition = "height 0.3s ease";
        displayBox.style.opacity = "0";
        displayBox.style.transform =
            "translateY(-50%) translateX(4px) scale(0.98)";
        displayBox.style.pointerEvents = "none";
        displayBox.style.height = "auto";

        const scriptVersion =
            typeof GM_info === "object" &&
            GM_info &&
            typeof GM_info.script === "object" &&
            typeof GM_info.script.version === "string"
                ? GM_info.script.version
                : "";

        const contentWrapper = document.createElement("div");
        contentWrapper.style.padding = "10px";
        contentWrapper.innerHTML = `
        <div id="pow-section">
            <div style="margin-bottom: 2px;">
                <strong>ChatGPT</strong>
            </div>
            PoW难度：<span id="difficulty">...</span><span id="difficulty-level" style="margin-left: 3px"></span>
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
            <span id="persona-container" style="display: block">用户类型：<span id="persona">...</span></span>
            <span id="default-model-container" style="display: block">默认模型：<span id="default-model">...</span></span>
            <span id="price-region-container" style="display: block">价格地区：<span id="price-region">...</span></span>
            <span id="adult-status-container" style="display: block">是否成年：<span id="adult-status">...</span></span>
        </div>
        <div id="deep-research-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>深度研究</strong>
            </div>
            剩余次数：<span id="deep-research-usage">...</span><br>
            重置时间：<span id="deep-research-reset-time">...</span>
        </div>
        <div id="odyssey-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>代理模式</strong>
            </div>
            剩余次数：<span id="odyssey-usage">...</span><br>
            重置时间：<span id="odyssey-reset-time">...</span>
        </div>
        <div id="file-upload-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>文件上传</strong>
            </div>
            剩余次数：<span id="file-upload-usage">...</span><br>
            重置时间：<span id="file-upload-reset-time">...</span>
        </div>
        <div id="memory-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>模型记忆</strong>
            </div>
            记忆容量：<span id="memory-usage">...</span>
        </div>
        <div id="codex-section" style="margin-top: 10px; display: none">
            <div style="margin-bottom: 8px;">
                <strong>Codex</strong>
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
                <span>已用：<span id="codex-usage">...</span></span>
                <span><i>代码 每5小时</i></span>
            </div>
            <div id="codex-progress-bg" style="margin-top: 4px; margin-bottom: 4px; width: 100%; height: 8px; background: #555; border-radius: 4px;">
                <div id="codex-progress-bar" style="height: 100%; width: 0%; background: #C26FFD; border-radius: 4px;"></div>
            </div>
            重置时间：<span id="codex-reset-time">...</span>
            <div style="margin-top: 8px;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-right:4px;">
                <span>已用：<span id="codex-usage-week">...</span></span>
                <span><i>代码 每周</i></span>
            </div>
            <div id="codex-progress-bg-week" style="margin-top: 4px; margin-bottom: 4px; width: 100%; height: 8px; background: #555; border-radius: 4px;">
                <div id="codex-progress-bar-week" style="height: 100%; width: 0%; background: #C26FFD; border-radius: 4px;"></div>
            </div>
            重置时间：<span id="codex-reset-time-week">...</span>
            <div id="codex-review-container" style="margin-top: 8px; display: none;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-right:4px;">
                    <span>已用：<span id="codex-usage-review">...</span></span>
                    <span><i>代码审查 每周</i></span>
                </div>
                <div id="codex-progress-bg-review" style="margin-top: 4px; margin-bottom: 4px; width: 100%; height: 8px; background: #555; border-radius: 4px;">
                    <div id="codex-progress-bar-review" style="height: 100%; width: 0%; background: #C26FFD; border-radius: 4px;"></div>
                </div>
                重置时间：<span id="codex-reset-time-review">...</span>
            </div>
            <div id="codex-credits-container" style="margin-top: 10px; display: none;">
                <div style="margin-bottom: 2px;">
                    <strong>积分</strong>
                    <span id="codex-credits-tooltip" style="
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
                剩余积分：<span id="codex-credits-value">...</span>
            </div>
        </div>
        <div id="sora-section" style="margin-top: 10px; display: none">
            <div style="margin-bottom: 2px;">
                <strong>Sora</strong>
                <span id="sora-info-tooltip" style="
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
            <div id="sora-models-container">
                生成模型：<span id="sora-models">...</span>
            </div>
            <div id="sora-free-container">
                免费次数：<span id="sora-free-usage">...</span>
            </div>
            <div id="sora-reset-container">
                重置时间：<span id="sora-reset-time">...</span>
            </div>
            <div id="sora-credits-container" style="margin-top: 10px; display: none;">
                <div style="margin-bottom: 2px;">
                    <strong>积分</strong>
                    <span id="credits-tooltip" style="
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
                剩余积分：<span id="sora-credits-detail">...</span>
            </div>
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
            ChatGPT Checker Next${scriptVersion ? ` v${scriptVersion}` : ""}
    </div>`;
        displayBox.appendChild(contentWrapper);
        document.body.appendChild(displayBox);

        let displayBoxInitialized = false;
        const resizeObserver = new ResizeObserver(() => {
            if (!displayBoxInitialized) return;
            displayBox.style.height = contentWrapper.offsetHeight + "px";
        });
        resizeObserver.observe(contentWrapper);

        const powSection = document.getElementById("pow-section");
        const deepSection = document.getElementById("deep-research-section");
        const odysseySection = document.getElementById("odyssey-section");
        const fileUploadSection = document.getElementById(
            "file-upload-section",
        );
        const codexSection = document.getElementById("codex-section");
        const soraSection = document.getElementById("sora-section");

        if (isCodexMode) {
            if (powSection) powSection.style.display = "none";
            if (deepSection) deepSection.style.display = "none";
            if (odysseySection) odysseySection.style.display = "none";
            if (fileUploadSection) fileUploadSection.style.display = "none";
            if (soraSection) {
                soraSection.style.display = "none";
                soraSection.style.marginTop = "10px";
            }
            if (codexSection) {
                codexSection.style.display = "block";
                codexSection.style.marginTop = "0";
            }
        } else if (isSoraMode) {
            if (powSection) powSection.style.display = "none";
            if (deepSection) deepSection.style.display = "none";
            if (odysseySection) odysseySection.style.display = "none";
            if (fileUploadSection) fileUploadSection.style.display = "none";
            if (codexSection) {
                codexSection.style.display = "none";
                codexSection.style.marginTop = "10px";
            }
            if (soraSection) {
                soraSection.style.display = "block";
                soraSection.style.marginTop = "0";
            }
        } else {
            if (codexSection) {
                codexSection.style.display = "none";
                codexSection.style.marginTop = "10px";
            }
            if (soraSection) {
                soraSection.style.display = "none";
                soraSection.style.marginTop = "10px";
            }
        }

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
                <stop offset="0%" style="stop-color:#888;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#666;stop-opacity:1" />
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
            // 打开时先禁用高度动画，设置正确高度
            displayBox.style.transition = "none";
            displayBox.style.height = contentWrapper.offsetHeight + "px";
            // 强制重绘后启用所有动画
            displayBox.offsetHeight;
            displayBox.style.transition =
                "height 0.2s ease, opacity 0.06s ease-out, transform 0.06s ease-out";
            displayBox.style.opacity = "1";
            displayBox.style.transform =
                "translateY(-50%) translateX(0) scale(1)";
            displayBox.style.pointerEvents = "auto";
            displayBoxInitialized = true;
            collapsedIndicator.style.opacity = "0";
        });

        displayBox.addEventListener("mouseleave", function () {
            displayBox.style.opacity = "0";
            displayBox.style.transform =
                "translateY(-50%) translateX(2px) scale(0.98)";
            displayBox.style.pointerEvents = "none";
            displayBoxInitialized = false;
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
        const codexTooltipBox = document.createElement("div");
        codexTooltipBox.id = "codex-tooltip-box";
        codexTooltipBox.innerText = "使用一次之后才开始计时。";
        codexTooltipBox.style.position = "fixed";
        codexTooltipBox.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        codexTooltipBox.style.color = "#fff";
        codexTooltipBox.style.padding = "8px 12px";
        codexTooltipBox.style.borderRadius = "5px";
        codexTooltipBox.style.fontSize = "12px";
        codexTooltipBox.style.visibility = "hidden";
        codexTooltipBox.style.zIndex = "10001";
        codexTooltipBox.style.width = "240px";
        codexTooltipBox.style.lineHeight = "1.4";
        codexTooltipBox.style.pointerEvents = "none";
        document.body.appendChild(codexTooltipBox);

        // 创建积分提示框
        const creditsTooltipBox = document.createElement("div");
        creditsTooltipBox.id = "credits-tooltip-box";
        creditsTooltipBox.innerText =
            "单独购买的积分，可用于 Codex、Sora 等任务。";
        creditsTooltipBox.style.position = "fixed";
        creditsTooltipBox.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        creditsTooltipBox.style.color = "#fff";
        creditsTooltipBox.style.padding = "8px 12px";
        creditsTooltipBox.style.borderRadius = "5px";
        creditsTooltipBox.style.fontSize = "12px";
        creditsTooltipBox.style.visibility = "hidden";
        creditsTooltipBox.style.zIndex = "10001";
        creditsTooltipBox.style.width = "240px";
        creditsTooltipBox.style.lineHeight = "1.4";
        creditsTooltipBox.style.pointerEvents = "none";
        document.body.appendChild(creditsTooltipBox);

        // 创建 Sora 信息提示框
        const soraInfoTooltipBox = document.createElement("div");
        soraInfoTooltipBox.id = "sora-info-tooltip-box";
        soraInfoTooltipBox.innerText =
            "Sora 1 (也就是 Turbo) 没有次数限制。Sora 2 有每日次数，也可使用积分。";
        soraInfoTooltipBox.style.position = "fixed";
        soraInfoTooltipBox.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        soraInfoTooltipBox.style.color = "#fff";
        soraInfoTooltipBox.style.padding = "8px 12px";
        soraInfoTooltipBox.style.borderRadius = "5px";
        soraInfoTooltipBox.style.fontSize = "12px";
        soraInfoTooltipBox.style.visibility = "hidden";
        soraInfoTooltipBox.style.zIndex = "10001";
        soraInfoTooltipBox.style.width = "240px";
        soraInfoTooltipBox.style.lineHeight = "1.4";
        soraInfoTooltipBox.style.pointerEvents = "none";
        document.body.appendChild(soraInfoTooltipBox);

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

        function bindTooltipEvents(triggerId, tooltipElement) {
            const trigger = document.getElementById(triggerId);
            if (!trigger || !tooltipElement) return;
            trigger.addEventListener("mouseenter", function (event) {
                tooltipElement.style.visibility = "visible";

                const tooltipWidth = 240;
                const mouseX = event.clientX;
                const mouseY = event.clientY;

                let leftPosition = mouseX - tooltipWidth - 10;
                if (leftPosition < 10) {
                    leftPosition = mouseX + 20;
                }

                let topPosition = mouseY - 40;

                tooltipElement.style.left = `${leftPosition}px`;
                tooltipElement.style.top = `${topPosition}px`;
            });

            trigger.addEventListener("mouseleave", function () {
                tooltipElement.style.visibility = "hidden";
            });
        }

        function bindAllTooltips() {
            bindTooltipEvents("codex-tooltip", codexTooltipBox);
            bindTooltipEvents("credits-tooltip", creditsTooltipBox);
            bindTooltipEvents("codex-credits-tooltip", creditsTooltipBox);
            bindTooltipEvents("sora-info-tooltip", soraInfoTooltipBox);
        }

        // 延迟添加提示事件，因为元素可能在后面动态显示
        setTimeout(bindAllTooltips, 100);

        // 在 MutationObserver 中也需要重新绑定事件
        window.rebindCodexEvents = bindAllTooltips;
    }

    // 创建元素
    createElements();

    // 使用 MutationObserver 观测 DOM 改动
    const observer = new MutationObserver((mutationsList, observer) => {
        // 保持检测器元素
        if (!document.getElementById("checker-next-displayBox")) {
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

        if (difficulty === "...") {
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
    let codexResetTimeReview = null;
    let codexResetAtPrimary = null;
    let codexResetAtSecondary = null;
    let codexResetAtReview = null;
    let codexResetsAfterPrimary = null;
    let codexResetsAfterSecondary = null;
    let codexResetsAfterReview = null;
    let codexUsedPercentPrimary = null; // 0~100
    let codexUsedPercentSecondary = null; // 0~100
    let codexUsedPercentReview = null; // 0~100
    let codexLimitWindowSecondsPrimary = null;
    let codexLimitWindowSecondsSecondary = null;
    let codexLimitWindowSecondsReview = null;
    function updateCodexInfo(
        pUsedPercent,
        pResetAfter,
        pResetAt,
        sUsedPercent,
        sResetAfter,
        sResetAt,
        pLimitWindowSecs,
        sLimitWindowSecs,
        rUsedPercent,
        rResetAfter,
        rResetAt,
        rLimitWindowSecs,
    ) {
        const section = document.getElementById("codex-section");
        const barP = document.getElementById("codex-progress-bar");
        const usageP = document.getElementById("codex-usage");
        const resetP = document.getElementById("codex-reset-time");

        const barS = document.getElementById("codex-progress-bar-week");
        const usageS = document.getElementById("codex-usage-week");
        const resetS = document.getElementById("codex-reset-time-week");

        const barR = document.getElementById("codex-progress-bar-review");
        const usageR = document.getElementById("codex-usage-review");
        const resetR = document.getElementById("codex-reset-time-review");

        if (
            !section ||
            !barP ||
            !usageP ||
            !resetP ||
            !barS ||
            !usageS ||
            !resetS ||
            !barR ||
            !usageR ||
            !resetR
        )
            return;

        if (pUsedPercent == null || sUsedPercent == null) {
            section.style.display = "none";
            return;
        }

        codexUsedPercentPrimary = Math.max(0, Math.min(100, pUsedPercent));
        codexUsedPercentSecondary = Math.max(0, Math.min(100, sUsedPercent));
        codexUsedPercentReview =
            rUsedPercent != null
                ? Math.max(0, Math.min(100, rUsedPercent))
                : null;
        codexResetsAfterPrimary = pResetAfter ?? null;
        codexResetsAfterSecondary = sResetAfter ?? null;
        codexResetsAfterReview = rResetAfter ?? null;
        codexLimitWindowSecondsPrimary = pLimitWindowSecs ?? null;
        codexLimitWindowSecondsSecondary = sLimitWindowSecs ?? null;
        codexLimitWindowSecondsReview = rLimitWindowSecs ?? null;
        codexResetAtPrimary = pResetAt != null ? pResetAt * 1000 : null;
        codexResetAtSecondary = sResetAt != null ? sResetAt * 1000 : null;
        codexResetAtReview = rResetAt != null ? rResetAt * 1000 : null;

        if (codexUsedPercentPrimary > 0 && codexResetsAfterPrimary != null) {
            codexResetTimePrimary = Date.now() + codexResetsAfterPrimary * 1000;
        } else if (codexResetAtPrimary != null) {
            codexResetTimePrimary = codexResetAtPrimary;
        } else {
            codexResetTimePrimary = null;
        }

        if (
            codexUsedPercentSecondary > 0 &&
            codexResetsAfterSecondary != null
        ) {
            codexResetTimeSecondary =
                Date.now() + codexResetsAfterSecondary * 1000;
        } else if (codexResetAtSecondary != null) {
            codexResetTimeSecondary = codexResetAtSecondary;
        } else {
            codexResetTimeSecondary = null;
        }

        if (codexUsedPercentReview > 0 && codexResetsAfterReview != null) {
            codexResetTimeReview = Date.now() + codexResetsAfterReview * 1000;
        } else if (codexResetAtReview != null) {
            codexResetTimeReview = codexResetAtReview;
        } else {
            codexResetTimeReview = null;
        }

        barP.style.width = `${codexUsedPercentPrimary}%`;
        barS.style.width = `${codexUsedPercentSecondary}%`;
        barP.style.background = "#C26FFD";
        barS.style.background = "#C26FFD";

        usageP.innerText = `${codexUsedPercentPrimary}%`;
        usageS.innerText = `${codexUsedPercentSecondary}%`;

        const reviewContainer = document.getElementById(
            "codex-review-container",
        );
        if (codexUsedPercentReview != null) {
            barR.style.width = `${codexUsedPercentReview}%`;
            barR.style.background = "#C26FFD";
            usageR.innerText = `${codexUsedPercentReview}%`;
            if (reviewContainer) reviewContainer.style.display = "block";
        } else {
            if (reviewContainer) reviewContainer.style.display = "none";
        }

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

    function updateCodexCredits(credits) {
        if (!isCodexMode) return;
        const container = document.getElementById("codex-credits-container");
        const valueEl = document.getElementById("codex-credits-value");
        if (!container || !valueEl) return;
        const balanceRaw =
            credits &&
            (typeof credits.balance === "string"
                ? credits.balance.trim()
                : typeof credits.balance === "number"
                  ? String(credits.balance)
                  : "");
        if (balanceRaw) {
            valueEl.innerText = balanceRaw;
            container.style.display = "block";
        } else {
            valueEl.innerText = "...";
            container.style.display = "none";
        }
    }

    function isCodexTimerNotStarted(limitSecs, resetAfterSecs) {
        return (
            limitSecs != null &&
            resetAfterSecs != null &&
            limitSecs === resetAfterSecs
        );
    }

    function formatCodexDuration(totalSecs, omitZeroUnits) {
        if (totalSecs == null) return "...";
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

    function formatCodexAbsoluteTime(timestampMs) {
        if (timestampMs == null) return "";
        const date = new Date(timestampMs);
        if (Number.isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = `${date.getHours()}`.padStart(2, "0");
        const minutes = `${date.getMinutes()}`.padStart(2, "0");
        const seconds = `${date.getSeconds()}`.padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function updateCodexCountdown() {
        const resetP = document.getElementById("codex-reset-time");
        const resetS = document.getElementById("codex-reset-time-week");
        const resetR = document.getElementById("codex-reset-time-review");
        if (!resetP || !resetS || !resetR) return;

        const notStartedPrimary = isCodexTimerNotStarted(
            codexLimitWindowSecondsPrimary,
            codexResetsAfterPrimary,
        );
        const notStartedSecondary = isCodexTimerNotStarted(
            codexLimitWindowSecondsSecondary,
            codexResetsAfterSecondary,
        );
        const notStartedReview = isCodexTimerNotStarted(
            codexLimitWindowSecondsReview,
            codexResetsAfterReview,
        );

        // 五小时
        let tooltipTimestampPrimary = null;
        if (codexUsedPercentPrimary == null) {
            resetP.innerText = "...";
        } else if (notStartedPrimary) {
            const secs = codexLimitWindowSecondsPrimary;
            resetP.innerHTML = `${formatCodexDuration(
                secs,
                true,
            )}${NOT_STARTED_BADGE}`;
            tooltipTimestampPrimary = codexResetAtPrimary;
        } else {
            if (codexResetTimePrimary != null) {
                const secs = Math.max(
                    0,
                    Math.floor((codexResetTimePrimary - Date.now()) / 1000),
                );
                resetP.innerText = formatCodexDuration(secs, false);
            } else {
                resetP.innerText = "...";
            }
            tooltipTimestampPrimary = codexResetAtPrimary;
        }
        if (tooltipTimestampPrimary != null) {
            const tooltipText = formatCodexAbsoluteTime(
                tooltipTimestampPrimary,
            );
            if (tooltipText) {
                resetP.title = tooltipText;
            } else {
                resetP.removeAttribute("title");
            }
        } else {
            resetP.removeAttribute("title");
        }

        // 一星期
        let tooltipTimestampSecondary = null;
        if (codexUsedPercentSecondary == null) {
            resetS.innerText = "...";
        } else if (notStartedSecondary) {
            const secs = codexLimitWindowSecondsSecondary;
            resetS.innerHTML = `${formatCodexDuration(
                secs,
                true,
            )}${NOT_STARTED_BADGE}`;
            tooltipTimestampSecondary = codexResetAtSecondary;
        } else {
            if (codexResetTimeSecondary != null) {
                const secs = Math.max(
                    0,
                    Math.floor((codexResetTimeSecondary - Date.now()) / 1000),
                );
                resetS.innerText = formatCodexDuration(secs, false);
            } else {
                resetS.innerText = "...";
            }
            tooltipTimestampSecondary = codexResetAtSecondary;
        }
        if (tooltipTimestampSecondary != null) {
            const tooltipText = formatCodexAbsoluteTime(
                tooltipTimestampSecondary,
            );
            if (tooltipText) {
                resetS.title = tooltipText;
            } else {
                resetS.removeAttribute("title");
            }
        } else {
            resetS.removeAttribute("title");
        }

        // 代码审查
        let tooltipTimestampReview = null;
        if (codexUsedPercentReview == null) {
            resetR.innerText = "...";
        } else if (notStartedReview) {
            const secs = codexLimitWindowSecondsReview;
            resetR.innerHTML = `${formatCodexDuration(
                secs,
                true,
            )}${NOT_STARTED_BADGE}`;
            tooltipTimestampReview = codexResetAtReview;
        } else {
            if (codexResetTimeReview != null) {
                const secs = Math.max(
                    0,
                    Math.floor((codexResetTimeReview - Date.now()) / 1000),
                );
                resetR.innerText = formatCodexDuration(secs, false);
            } else {
                resetR.innerText = "...";
            }
            tooltipTimestampReview = codexResetAtReview;
        }
        if (tooltipTimestampReview != null) {
            const tooltipText = formatCodexAbsoluteTime(tooltipTimestampReview);
            if (tooltipText) {
                resetR.title = tooltipText;
            } else {
                resetR.removeAttribute("title");
            }
        } else {
            resetR.removeAttribute("title");
        }
    }
    setInterval(updateCodexCountdown, 1000);

    // 更新 Sora 用量
    let soraResetDeadlineMs = null;
    let soraLimitWindowSeconds = null;
    let soraTimerNotStarted = false;
    let soraSupportsQuota = null;
    let soraCreditsAvailable = false;

    function applySoraQuotaVisibility() {
        const showQuota = soraSupportsQuota !== false;
        const freeContainer = document.getElementById("sora-free-container");
        const resetContainer = document.getElementById("sora-reset-container");
        const creditsContainer = document.getElementById(
            "sora-credits-container",
        );
        if (freeContainer)
            freeContainer.style.display = showQuota ? "block" : "none";
        if (resetContainer)
            resetContainer.style.display = showQuota ? "block" : "none";
        if (creditsContainer) {
            const showCredits = showQuota && soraCreditsAvailable;
            creditsContainer.style.display = showCredits ? "block" : "none";
        }
    }

    function updateSoraModels(models) {
        if (!isSoraMode) return;
        const modelsEl = document.getElementById("sora-models");
        if (!modelsEl) return;
        if (!Array.isArray(models) || models.length === 0) {
            modelsEl.innerText = "...";
            return;
        }
        const formatted = models
            .map((item) => {
                if (!item || typeof item !== "object") return null;
                const label =
                    typeof item.label === "string" && item.label.trim()
                        ? item.label.trim()
                        : "";
                const id =
                    typeof item.id === "string" && item.id.trim()
                        ? item.id.trim()
                        : "";
                if (label && id) return `${label} (${id})`;
                if (label) return label;
                if (id) return id;
                return null;
            })
            .filter(Boolean);
        modelsEl.innerText = formatted.length ? formatted.join("、") : "...";
        const hasTurbo = Array.isArray(models)
            ? models.some((item) => {
                  if (!item || typeof item !== "object") return false;
                  const id =
                      typeof item.id === "string" ? item.id.toLowerCase() : "";
                  return id === "turbo";
              })
            : false;
        if (hasTurbo) {
            soraSupportsQuota = false;
        } else if (formatted.length) {
            soraSupportsQuota = true;
        }
        applySoraQuotaVisibility();
        setIconColors("#2E91F6", "#1666D6");
    }

    function updateSoraInfo(
        rateLimitReached,
        accessResetsInSeconds,
        creditRemaining,
        estimatedVideosRemaining,
        estimatedPurchasedVideosRemaining,
    ) {
        if (!isSoraMode) return;
        if (soraSupportsQuota === false) {
            soraCreditsAvailable = false;
            applySoraQuotaVisibility();
            return;
        }
        const section = document.getElementById("sora-section");
        const freeUsageEl = document.getElementById("sora-free-usage");
        const resetEl = document.getElementById("sora-reset-time");
        const creditsDetailEl = document.getElementById("sora-credits-detail");

        if (!section || !freeUsageEl || !resetEl || !creditsDetailEl) {
            return;
        }

        if (
            typeof estimatedVideosRemaining === "number" &&
            typeof estimatedPurchasedVideosRemaining === "number"
        ) {
            const freeCount = Math.max(
                0,
                estimatedVideosRemaining - estimatedPurchasedVideosRemaining,
            );
            freeUsageEl.innerText = `${freeCount}次`;
        } else {
            freeUsageEl.innerText = "...";
        }

        const hasCredits =
            typeof creditRemaining === "number" &&
            typeof estimatedPurchasedVideosRemaining === "number";
        if (hasCredits) {
            creditsDetailEl.innerText = `${creditRemaining} = ${estimatedPurchasedVideosRemaining}次`;
        } else {
            creditsDetailEl.innerText = "...";
        }
        soraCreditsAvailable = hasCredits;

        if (typeof accessResetsInSeconds === "number") {
            soraLimitWindowSeconds = accessResetsInSeconds;
            soraTimerNotStarted = accessResetsInSeconds === 86400;
            if (soraTimerNotStarted) {
                soraResetDeadlineMs = null;
            } else {
                soraResetDeadlineMs = Date.now() + accessResetsInSeconds * 1000;
            }
        } else {
            soraResetDeadlineMs = null;
            soraLimitWindowSeconds = null;
            soraTimerNotStarted = false;
            resetEl.innerText = "...";
            resetEl.removeAttribute("title");
        }
        updateSoraCountdown();
        applySoraQuotaVisibility();

        section.style.display = "block";
        section.style.marginTop = "0";
        setIconColors("#2E91F6", "#1666D6");
    }

    function updateSoraCountdown() {
        if (!isSoraMode) return;
        const resetEl = document.getElementById("sora-reset-time");
        if (!resetEl) return;
        if (soraTimerNotStarted) {
            if (typeof soraLimitWindowSeconds === "number") {
                resetEl.innerHTML = `${formatCodexDuration(
                    soraLimitWindowSeconds,
                    true,
                )}${NOT_STARTED_BADGE}`;
            } else {
                resetEl.innerText = "...";
            }
            resetEl.removeAttribute("title");
            return;
        }
        if (soraResetDeadlineMs == null) {
            resetEl.innerText = "...";
            resetEl.removeAttribute("title");
            return;
        }
        const remainingSecs = Math.max(
            0,
            Math.floor((soraResetDeadlineMs - Date.now()) / 1000),
        );
        resetEl.innerText = formatCodexDuration(remainingSecs, false);
        const tooltipText = formatCodexAbsoluteTime(soraResetDeadlineMs);
        if (tooltipText) {
            resetEl.title = tooltipText;
        } else {
            resetEl.removeAttribute("title");
        }
    }
    setInterval(updateSoraCountdown, 1000);

    function isResetTimestampNear(resetAfter, expectedTimestamp) {
        if (!resetAfter || typeof expectedTimestamp !== "number") return false;
        const timestamp = new Date(resetAfter).getTime();
        if (Number.isNaN(timestamp)) return false;
        return Math.abs(timestamp - expectedTimestamp) <= 5000;
    }

    function isMonthlyResetNotStarted(resetAfter) {
        const monthLater = new Date(Date.now());
        monthLater.setMonth(monthLater.getMonth() + 1);
        return isResetTimestampNear(resetAfter, monthLater.getTime());
        // 如果获取的时间接近当前的一个月后，认定为计数未开始
    }

    function isFileUploadResetNotStarted(resetAfter) {
        const threeHoursLater = Date.now() + 3 * 60 * 60 * 1000;
        return isResetTimestampNear(resetAfter, threeHoursLater);
        // 如果获取的时间接近当前的三小时后，认定为计数未开始
    }

    // 更新深度研究次数
    let researchRemaining = null;
    let researchReset = null;
    function updateDeepResearchInfo(remaining, resetAfter) {
        if (!isChatgptMode) return;
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
        if (isMonthlyResetNotStarted(resetAfter)) {
            usageEl.innerHTML = `${remaining}次${NOT_STARTED_BADGE}`;
        } else {
            usageEl.innerText = `${remaining}次`;
        }

        if (researchReset) {
            const date = new Date(researchReset);
            resetEl.innerText = date
                .toLocaleString("zh-CN", { hour12: false })
                .replace(/\//g, "-");
        } else {
            resetEl.innerText = "...";
        }
    }

    // 更新代理模式次数
    let agentRemaining = null;
    let agentReset = null;
    function updateAgentInfo(remaining, resetAfter) {
        if (!isChatgptMode) return;
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
        if (isMonthlyResetNotStarted(resetAfter)) {
            usageEl.innerHTML = `${remaining}次${NOT_STARTED_BADGE}`;
        } else {
            usageEl.innerText = `${remaining}次`;
        }

        if (agentReset) {
            const date = new Date(agentReset);
            resetEl.innerText = date
                .toLocaleString("zh-CN", { hour12: false })
                .replace(/\//g, "-");
        } else {
            resetEl.innerText = "...";
        }
    }

    // 更新文件上传次数
    let uploadRemaining = null;
    let uploadReset = null;
    function updateFileUploadInfo(remaining, resetAfter) {
        if (!isChatgptMode) return;
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
        if (isFileUploadResetNotStarted(resetAfter)) {
            usageEl.innerHTML = `${remaining}次${NOT_STARTED_BADGE}`;
        } else {
            usageEl.innerText = `${remaining}次`;
        }

        if (uploadReset) {
            const date = new Date(uploadReset);
            resetEl.innerText = date
                .toLocaleString("zh-CN", { hour12: false })
                .replace(/\//g, "-");
        } else {
            resetEl.innerText = "...";
        }
    }

    // 更新默认模型
    let defaultModelSlug = null;
    function updateDefaultModelInfo(slug) {
        if (!isChatgptMode) return;
        const container = document.getElementById("default-model-container");
        const valueEl = document.getElementById("default-model");
        if (!container || !valueEl) return;

        if (!slug || typeof slug !== "string") {
            defaultModelSlug = null;
            valueEl.innerText = "...";
            container.style.display = "block";
            return;
        }

        defaultModelSlug = slug;
        valueEl.innerText = slug;
        container.style.display = "block";
    }

    let priceRegionCode = null;
    function updatePriceRegion(countryCode) {
        if (!isChatgptMode) return;
        const container = document.getElementById("price-region-container");
        const valueEl = document.getElementById("price-region");
        if (!container || !valueEl) return;

        if (typeof countryCode === "string" && countryCode.trim()) {
            priceRegionCode = countryCode.trim().toUpperCase();
        } else {
            priceRegionCode = null;
        }

        valueEl.innerText = priceRegionCode || "...";
        container.style.display = "block";
    }

    function updateAdultStatus(isAdult) {
        if (!isChatgptMode) return;
        const container = document.getElementById("adult-status-container");
        const valueEl = document.getElementById("adult-status");
        if (!valueEl) return;
        if (typeof isAdult === "boolean") {
            valueEl.innerText = isAdult ? "True" : "False";
        } else {
            valueEl.innerText = "...";
        }
        if (container) container.style.display = "block";
    }

    let memoryUsageTokens = null;
    let memoryMaxTokensValue = null;
    function updateMemoryUsage(memoryNumTokens, memoryMaxTokens) {
        if (!isChatgptMode) return;
        const section = document.getElementById("memory-section");
        const valueEl = document.getElementById("memory-usage");
        if (!section || !valueEl) return;

        const valid =
            typeof memoryNumTokens === "number" &&
            typeof memoryMaxTokens === "number" &&
            memoryMaxTokens > 0;

        if (valid) {
            memoryUsageTokens = memoryNumTokens;
            memoryMaxTokensValue = memoryMaxTokens;
        }

        if (
            typeof memoryUsageTokens === "number" &&
            typeof memoryMaxTokensValue === "number"
        ) {
            valueEl.innerText = `${memoryUsageTokens}/${memoryMaxTokensValue}`;
            section.style.display = "block";
            section.style.marginTop = powFetched ? "10px" : "0";
        } else {
            valueEl.innerText = "...";
            section.style.display = "none";
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
                    "/backend-anon/sentinel/chat-requirements",
                )) &&
            finalMethod === "POST" &&
            response.ok
        ) {
            if (!isChatgptMode) {
                return response;
            }
            let responseBodyText;
            try {
                responseBodyText = await response.text();
                const data = JSON.parse(responseBodyText);
                const difficulty = data.proofofwork
                    ? data.proofofwork.difficulty
                    : "...";
                const persona = data.persona || "...";
                const difficultyElement = document.getElementById("difficulty");
                if (difficultyElement) difficultyElement.innerText = difficulty;

                const personaContainer =
                    document.getElementById("persona-container");
                const personaElement = document.getElementById("persona");
                if (personaContainer && personaElement) {
                    if (
                        persona &&
                        typeof persona === "string" &&
                        persona !== "..." &&
                        !persona.toLowerCase().includes("free")
                    ) {
                        personaElement.innerText = persona;
                    } else {
                        personaElement.innerText = "...";
                    }
                    personaContainer.style.display = "block";
                }
                updateDifficultyIndicator(difficulty);

                return new Response(responseBodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error("[CheckerNext] 处理响应或重新创建响应时出错:", e);
                const difficultyElement = document.getElementById("difficulty");
                if (difficultyElement) difficultyElement.innerText = "...";
                updateDifficultyIndicator("...");
                const personaElement = document.getElementById("persona");
                if (personaElement) personaElement.innerText = "...";

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
            requestUrl.includes("/backend-api/settings/is_adult") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isChatgptMode) {
                return response;
            }
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                updateAdultStatus(
                    typeof data?.is_adult === "boolean" ? data.is_adult : null,
                );
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error("[CheckerNext] 处理成年状态响应出错:", e);
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
            requestUrl.includes(
                "/backend-api/checkout_pricing_config/configs",
            ) &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isChatgptMode) {
                return response;
            }
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                updatePriceRegion(
                    typeof data?.country_code === "string"
                        ? data.country_code
                        : null,
                );
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error("[CheckerNext] 处理价格地区响应出错:", e);
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
            requestUrl.includes("/backend-api/memories") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isChatgptMode) {
                return response;
            }
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                updateMemoryUsage(
                    typeof data?.memory_num_tokens === "number"
                        ? data.memory_num_tokens
                        : null,
                    typeof data?.memory_max_tokens === "number"
                        ? data.memory_max_tokens
                        : null,
                );
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error("[CheckerNext] 处理记忆用量响应出错:", e);
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
                    "[CheckerNext] 处理 Deep Research 与 Agent 响应出错:",
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
            requestUrl.includes("/backend/nf/check") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isSoraMode) {
                return response;
            }
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                const info = data?.rate_limit_and_credit_balance;
                if (info) {
                    updateSoraInfo(
                        typeof info.rate_limit_reached === "boolean"
                            ? info.rate_limit_reached
                            : null,
                        typeof info.access_resets_in_seconds === "number"
                            ? info.access_resets_in_seconds
                            : null,
                        typeof info.credit_remaining === "number"
                            ? info.credit_remaining
                            : null,
                        typeof info.estimated_num_videos_remaining === "number"
                            ? info.estimated_num_videos_remaining
                            : null,
                        typeof info.estimated_num_purchased_videos_remaining ===
                            "number"
                            ? info.estimated_num_purchased_videos_remaining
                            : null,
                    );
                }
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error("[CheckerNext] 处理 Sora 响应出错:", e);
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
            requestUrl.includes("/backend/models") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isSoraMode) {
                return response;
            }
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                if (Array.isArray(data?.data)) {
                    updateSoraModels(data.data);
                } else {
                    updateSoraModels(null);
                }
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error("[CheckerNext] 处理 Sora 模型响应出错:", e);
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
                    const cr = data.code_review_rate_limit || {};
                    const r = cr.primary_window || {};
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
                        typeof r.used_percent === "number"
                            ? r.used_percent
                            : null,
                        typeof r.reset_after_seconds === "number"
                            ? r.reset_after_seconds
                            : null,
                        typeof r.reset_at === "number" ? r.reset_at : null,
                        typeof r.limit_window_seconds === "number"
                            ? r.limit_window_seconds
                            : null,
                    );
                    updateCodexCredits(data.credits);
                }
                return new Response(bodyText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            } catch (e) {
                console.error("[CheckerNext] 处理 Codex 响应出错:", e);
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
