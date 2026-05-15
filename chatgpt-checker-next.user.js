// ==UserScript==
// @name         ChatGPT Checker Next
// @namespace    https://github.com/zetaloop/chatgpt-checker-next
// @homepage     https://github.com/zetaloop/chatgpt-checker-next
// @author       zetaloop
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzJjM2U1MCIgZD0iTTMyIDJDMTUuNDMyIDIgMiAxNS40MzIgMiAzMnMxMy40MzIgMzAgMzAgMzAgMzAtMTMuNDMyIDMwLTMwUzQ4LjU2OCAyIDMyIDJ6bTAgNTRjLTEzLjIzMyAwLTI0LTEwLjc2Ny0yNC0yNFMxOC43NjcgOCAzMiA4czI0IDEwLjc2NyAyNCAyNFM0NS4yMzMgNTYgMzIgNTZ6Ii8+PHBhdGggZmlsbD0iIzNkYzJmZiIgZD0iTTMyIDEyYy0xMS4wNDYgMC0yMCA4Ljk1NC0yMCAyMHM4Ljk1NCAyMCAyMCAyMCAyMC04Ljk1NCAyMC0yMFM0My4wNDYgMTIgMzIgMTJ6bTAgMzZjLTguODM3IDAtMTYtNy4xNjMtMTYtMTZzNy4xNjMtMTYgMTYtMTYgMTYgNy4xNjMgMTYgMTZTNDAuODM3IDQ4IDMyIDQ4eiIvPjxwYXRoIGZpbGw9IiMwMGZmN2YiIGQ9Ik0zMiAyMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMzOC42MjcgMjAgMzIgMjB6bTAgMjBjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzIiIGN5PSIzMiIgcj0iNCIvPjwvc3ZnPg==
// @version      3.3.0
// @description  获取 ChatGPT 和 Grok 的功能、服务等信息。
// @match        *://chatgpt.com/*
// @match        *://sora.chatgpt.com/*
// @match        *://grok.com/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @updateURL    https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @license AGPLv3
// ==/UserScript==

(function () {
    "use strict";

    const BOX_ID = "checker-next-displayBox";
    const POS_KEY = "checker-next-integrated-draggable-position-v5";

    const OLD_PROXY_IDS = [
        "checker-next-draggable-proxy-ball",
        "checker-next-draggable-proxy-ball-v3",
        "checker-next-draggable-proxy-ball-v4",
        "checker-next-draggable-proxy-ball-v5",
    ];

    let position = null;
    let dragging = false;
    let moved = false;
    let dragSource = null;
    let rafId = 0;

    function getBox() {
        return document.getElementById(BOX_ID);
    }

    function getBall() {
        const icon = document.querySelector("#status-icon");
        return icon ? icon.closest("div") : null;
    }

    function removeOldProxyBalls() {
        for (const id of OLD_PROXY_IDS) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }
    }

    function readPosition() {
        try {
            const raw = localStorage.getItem(POS_KEY);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (
                parsed &&
                typeof parsed.x === "number" &&
                typeof parsed.y === "number"
            ) {
                return parsed;
            }
        } catch {}

        return null;
    }

    function savePosition(pos) {
        try {
            localStorage.setItem(POS_KEY, JSON.stringify(pos));
        } catch {}
    }

    function defaultPosition() {
        return {
            x: window.innerWidth - 20,
            y: window.innerHeight / 2,
        };
    }

    function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    function getBallSize() {
        const ball = getBall();

        return {
            width: Math.max(ball?.offsetWidth || 40, 40),
            height: Math.max(ball?.offsetHeight || 40, 40),
        };
    }

    function clampPosition(pos) {
        const margin = 4;
        const ballSize = getBallSize();

        /*
         * pos.x = 小球右边缘位置
         * pos.y = 小球垂直中心位置
         *
         * 这里只按小球大小限制位置。
         * 不再按弹窗大小限制，所以小球可以拖到网页角落。
         */
        const minX = margin + ballSize.width;
        const maxX = Math.max(minX, window.innerWidth - margin);

        const minY = margin + ballSize.height / 2;
        const maxY = Math.max(
            minY,
            window.innerHeight - margin - ballSize.height / 2,
        );

        return {
            x: Math.round(clamp(pos.x, minX, maxX)),
            y: Math.round(clamp(pos.y, minY, maxY)),
        };
    }

    function getPosition() {
        if (!position) {
            position = readPosition() || defaultPosition();
        }

        position = clampPosition(position);
        return position;
    }

    function isBoxVisible() {
        const box = getBox();
        if (!box) return false;

        const style = getComputedStyle(box);
        return Number(style.opacity) > 0.1 && style.pointerEvents !== "none";
    }

    function ensureBoxTransform() {
        const box = getBox();
        if (!box) return;

        const transform = box.style.transform || "";

        if (!transform.includes("translateY(-50%)")) {
            box.style.transform = `translateY(-50%) ${transform}`.trim();
        }
    }

    function prepareBoxViewportLimits(box) {
        const margin = 8;
        const maxHeight = Math.max(120, window.innerHeight - margin * 2);
        const maxWidth = Math.max(120, window.innerWidth - margin * 2);

        box.style.maxHeight = `${maxHeight}px`;
        box.style.maxWidth = `${maxWidth}px`;
        box.style.overflowX = "hidden";
        box.style.overflowY = "auto";

        return {
            margin,
            maxHeight,
            maxWidth,
        };
    }

    function getBoxVisibleSize(box, limits) {
        const width = Math.min(
            box.offsetWidth || box.scrollWidth || 240,
            limits.maxWidth,
        );

        const rawHeight = box.offsetHeight || box.scrollHeight || 40;
        const height = Math.min(rawHeight, limits.maxHeight);

        return {
            width: Math.max(width, 40),
            height: Math.max(height, 40),
        };
    }

    function getClampedBoxPlacement(pos, box, limits) {
        const size = getBoxVisibleSize(box, limits);
        const margin = limits.margin;

        /*
         * 默认让弹窗显示在小球左侧。
         * 但如果小球在左侧，弹窗会自动被夹到屏幕内。
         */
        const minLeft = margin;
        const maxLeft = Math.max(minLeft, window.innerWidth - margin - size.width);
        const left = clamp(pos.x - size.width, minLeft, maxLeft);

        /*
         * 弹窗仍然用 translateY(-50%) 居中显示。
         * 但 centerY 会根据弹窗高度夹在屏幕内，
         * 所以小球靠底部/顶部时，弹窗不会被浏览器边缘挡住。
         */
        const minCenterY = margin + size.height / 2;
        const maxCenterY = Math.max(
            minCenterY,
            window.innerHeight - margin - size.height / 2,
        );
        const centerY = clamp(pos.y, minCenterY, maxCenterY);

        return {
            left,
            centerY,
            width: size.width,
            height: size.height,
        };
    }

    function applyPosition() {
        removeOldProxyBalls();

        const box = getBox();
        const ball = getBall();

        if (!box || !ball) return;

        const pos = getPosition();

        const ballWidth = ball.offsetWidth || 40;
        const ballHeight = ball.offsetHeight || 40;

        const limits = prepareBoxViewportLimits(box);
        const placement = getClampedBoxPlacement(pos, box, limits);

        box.style.position = "fixed";
        box.style.left = `${placement.left}px`;
        box.style.top = `${placement.centerY}px`;
        box.style.right = "auto";
        ensureBoxTransform();

        ball.style.position = "fixed";
        ball.style.left = `${pos.x - ballWidth}px`;
        ball.style.top = `${pos.y - ballHeight / 2}px`;
        ball.style.right = "auto";
        ball.style.transform = "none";
        ball.style.display = "flex";
        ball.style.zIndex = "10000";
        ball.style.cursor = dragging ? "grabbing" : "grab";
        ball.style.touchAction = "none";

        if (!isBoxVisible() && !dragging) {
            ball.style.opacity = "1";
            ball.style.pointerEvents = "auto";
        }
    }

    function scheduleApplyPosition() {
        if (rafId) return;

        rafId = requestAnimationFrame(function () {
            rafId = 0;
            applyPosition();
        });
    }

    function showByOriginalLogic() {
        const ball = getBall();
        const box = getBox();

        if (!ball || !box) return;

        applyPosition();

        const rect = ball.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;

        ball.dispatchEvent(
            new MouseEvent("mouseenter", {
                view: window,
                bubbles: false,
                cancelable: true,
                clientX,
                clientY,
            }),
        );

        window.dispatchEvent(
            new MouseEvent("mousemove", {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX,
                clientY,
            }),
        );

        setTimeout(function () {
            if (!isBoxVisible()) {
                const limits = prepareBoxViewportLimits(box);
                const maxHeight = limits.maxHeight;
                const contentHeight = box.scrollHeight || box.offsetHeight || 0;

                box.style.opacity = "1";
                box.style.pointerEvents = "auto";
                box.style.transform =
                    "translateY(-50%) translateX(0) scale(1)";

                if (contentHeight > 0) {
                    box.style.height = `${Math.min(contentHeight, maxHeight)}px`;
                }

                ball.style.opacity = "0";
                ball.style.pointerEvents = "none";
            }

            applyPosition();
        }, 30);
    }

    function keepVisibleWhileDraggingBox() {
        const box = getBox();
        const ball = getBall();

        if (!box || !ball) return;

        const limits = prepareBoxViewportLimits(box);
        const maxHeight = limits.maxHeight;
        const contentHeight = box.scrollHeight || box.offsetHeight || 0;

        box.style.opacity = "1";
        box.style.pointerEvents = "auto";
        box.style.transform = "translateY(-50%) translateX(0) scale(1)";

        if (contentHeight > 0) {
            box.style.height = `${Math.min(contentHeight, maxHeight)}px`;
        }

        ball.style.opacity = "0";
        ball.style.pointerEvents = "none";
    }

    function isInteractiveTarget(target) {
        return !!target.closest(
            "input, select, textarea, button, a, label, option, [role='button']",
        );
    }

    function attachDrag(handle, sourceName) {
        if (!handle || handle.dataset.checkerNextIntegratedDragV5 === "1") {
            return;
        }

        handle.dataset.checkerNextIntegratedDragV5 = "1";

        let startX = 0;
        let startY = 0;
        let startPos = null;

        handle.addEventListener(
            "pointerdown",
            function (event) {
                if (event.button !== 0) return;

                if (sourceName === "box" && isInteractiveTarget(event.target)) {
                    return;
                }

                event.preventDefault();

                dragging = true;
                moved = false;
                dragSource = sourceName;

                startX = event.clientX;
                startY = event.clientY;
                startPos = { ...getPosition() };

                document.body.style.userSelect = "none";
                handle.style.cursor = "grabbing";

                try {
                    handle.setPointerCapture(event.pointerId);
                } catch {}
            },
            true,
        );

        handle.addEventListener(
            "pointermove",
            function (event) {
                if (!dragging || !startPos) return;

                event.preventDefault();

                const dx = event.clientX - startX;
                const dy = event.clientY - startY;

                if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                    moved = true;
                }

                position = clampPosition({
                    x: startPos.x + dx,
                    y: startPos.y + dy,
                });

                if (dragSource === "box") {
                    keepVisibleWhileDraggingBox();
                }

                scheduleApplyPosition();
            },
            true,
        );

        function finishDrag(event) {
            if (!dragging) return;

            const source = dragSource;

            dragging = false;
            dragSource = null;
            startPos = null;

            document.body.style.userSelect = "";
            handle.style.cursor = "grab";

            position = clampPosition(getPosition());
            savePosition(position);
            applyPosition();

            try {
                handle.releasePointerCapture(event.pointerId);
            } catch {}

            if (!moved && source === "ball") {
                event.preventDefault();
                event.stopPropagation();
                showByOriginalLogic();
                return;
            }

            if (moved) {
                event.preventDefault();
                event.stopPropagation();

                if (source === "box") {
                    keepVisibleWhileDraggingBox();
                    applyPosition();
                }
            }
        }

        handle.addEventListener("pointerup", finishDrag, true);
        handle.addEventListener("pointercancel", finishDrag, true);

        handle.addEventListener(
            "click",
            function (event) {
                if (sourceName !== "ball") return;

                event.preventDefault();
                event.stopPropagation();

                if (!dragging && !moved) {
                    showByOriginalLogic();
                }

                moved = false;
            },
            true,
        );
    }

    function attachEvents() {
        const ball = getBall();
        const box = getBox();

        if (!ball || !box) return;

        attachDrag(ball, "ball");
        attachDrag(box, "box");

        if (ball.dataset.checkerNextIntegratedOpenV5 !== "1") {
            ball.dataset.checkerNextIntegratedOpenV5 = "1";

            ball.addEventListener(
                "mouseenter",
                function () {
                    if (!dragging) {
                        showByOriginalLogic();
                    }
                },
                false,
            );
        }

        if (box.dataset.checkerNextIntegratedLeaveV5 !== "1") {
            box.dataset.checkerNextIntegratedLeaveV5 = "1";

            box.addEventListener(
                "mouseleave",
                function () {
                    if (dragging) {
                        keepVisibleWhileDraggingBox();
                        applyPosition();
                    }
                },
                true,
            );
        }
    }

    function resetBrokenStylesIfNeeded() {
        const box = getBox();
        const ball = getBall();

        if (!box || !ball) return;

        prepareBoxViewportLimits(box);
        ball.style.display = "flex";

        if (!isBoxVisible() && !dragging) {
            ball.style.opacity = "1";
            ball.style.pointerEvents = "auto";
        }
    }

    function tick() {
        removeOldProxyBalls();
        resetBrokenStylesIfNeeded();
        attachEvents();
        applyPosition();
    }

    function start() {
        tick();

        const observer = new MutationObserver(function () {
            tick();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });

        window.addEventListener("resize", function () {
            position = clampPosition(getPosition());
            savePosition(position);
            applyPosition();
        });

        setInterval(tick, 800);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
