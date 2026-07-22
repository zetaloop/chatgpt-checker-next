// ==UserScript==
// @name         ChatGPT Checker Next
// @namespace    https://github.com/zetaloop/chatgpt-checker-next
// @homepage     https://github.com/zetaloop/chatgpt-checker-next
// @author       zetaloop
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzJjM2U1MCIgZD0iTTMyIDJDMTUuNDMyIDIgMiAxNS40MzIgMiAzMnMxMy40MzIgMzAgMzAgMzAgMzAtMTMuNDMyIDMwLTMwUzQ4LjU2OCAyIDMyIDJ6bTAgNTRjLTEzLjIzMyAwLTI0LTEwLjc2Ny0yNC0yNFMxOC43NjcgOCAzMiA4czI0IDEwLjc2NyAyNCAyNFM0NS4yMzMgNTYgMzIgNTZ6Ii8+PHBhdGggZmlsbD0iIzNkYzJmZiIgZD0iTTMyIDEyYy0xMS4wNDYgMC0yMCA4Ljk1NC0yMCAyMHM4Ljk1NCAyMCAyMCAyMCAyMC04Ljk1NCAyMC0yMFM0My4wNDYgMTIgMzIgMTJ6bTAgMzZjLTguODM3IDAtMTYtNy4xNjMtMTYtMTZzNy4xNjMtMTYgMTYtMTYgMTYgNy4xNjMgMTYgMTZTNDAuODM3IDQ4IDMyIDQ4eiIvPjxwYXRoIGZpbGw9IiMwMGZmN2YiIGQ9Ik0zMiAyMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMzOC42MjcgMjAgMzIgMjB6bTAgMjBjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzIiIGN5PSIzMiIgcj0iNCIvPjwvc3ZnPg==
// @version      3.3.0
// @description  获取 ChatGPT 和 Grok 的功能、服务等信息。
// @match        *://chatgpt.com/*
// @match        *://grok.com/*
// @grant        GM_addElement
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @sandbox      raw
// @run-at       document-start
// @downloadURL  https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @updateURL    https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @license AGPLv3
// ==/UserScript==

(function () {
    "use strict";

    const MODE_CHATGPT = "chatgpt";
    const MODE_CODEX = "codex";
    const MODE_GROK = "grok";
    const pageWindow = unsafeWindow;

    function detectPageMode() {
        const { hostname, pathname } = pageWindow.location;
        if (hostname === "grok.com") return MODE_GROK;
        if (hostname === "chatgpt.com" && pathname.startsWith("/codex")) {
            return MODE_CODEX;
        }
        return MODE_CHATGPT;
    }

    const currentPageMode = detectPageMode();
    const isChatgptMode = currentPageMode === MODE_CHATGPT;
    const isCodexMode = currentPageMode === MODE_CODEX;
    const isGrokMode = currentPageMode === MODE_GROK;
    const CHATGPT_UNLOCK_THEME_COLORS_KEY =
        "checker-next-chatgpt-unlock-theme-colors";
    const CHATGPT_FAKE_PLAN_KEY = "checker-next-chatgpt-fake-plan";
    const CHATGPT_FAKE_PLAN_ENABLED_KEY =
        "checker-next-chatgpt-fake-plan-enabled";
    const CHATGPT_IMPORT_MAP_CACHE_KEY =
        "checker-next-chatgpt-import-map-cache";

    if (isChatgptMode) {
        installCachedChatgptImportMapPatch();
    }
    const NOT_STARTED_BADGE = '<span style="color:#9ca3af"> (未开始)</span>';

    // Spoil RSC dehydrated data to force client-side refetch
    // Parse user info from RSC data
    let grokActiveSubscriptions = null;
    let grokXSubscriptionType = null;
    let grokCountryCode = null;
    let grokUserInfoFetched = false;

    // Grok 可用模型列表
    let grokAvailableModels = null;
    let grokModelsFetched = false;

    // Grok 开发工具状态
    let grokDevToolsFetched = false;
    let grokDevToolsDisplayValue = null;

    // Grok 抢先体验模型状态
    let grokEarlyAccessDisplayValue = null;
    let grokEarlyAccessFetched = false;

    // Grok 异步聊天状态
    let grokAsyncChatDisplayValue = null;
    let grokAsyncChatFetched = false;

    // Grok 假装用户类型状态
    let grokSuperGrokDisplayValue = null;
    let grokSuperGrokFetched = false;
    let grokSuperGrokProDisplayValue = null;
    let grokSuperGrokProFetched = false;
    let grokEnterpriseDisplayValue = null;
    let grokEnterpriseFetched = false;

    // RSC 缓存需要 spoil 的查询键
    const SPOIL_QUERY_KEYS = ["get-models"];

    if (isGrokMode) {
        pageWindow.__next_f = pageWindow.__next_f || [];
        const originalPush = pageWindow.__next_f.push;
        pageWindow.__next_f.push = function (...args) {
            try {
                if (args[0] && typeof args[0][1] === "string") {
                    let dataString = args[0][1];

                    // 解析用户信息（activeSubscriptions、xSubscriptionType 和 countryCode）
                    if (!grokUserInfoFetched) {
                        // 匹配 activeSubscriptions 数组
                        const activeSubsMatch = dataString.match(
                            /"activeSubscriptions"\s*:\s*\[([^\]]*)\]/,
                        );
                        if (activeSubsMatch) {
                            try {
                                // 解析数组内容
                                const subsArray = JSON.parse(
                                    `[${activeSubsMatch[1]}]`,
                                );
                                grokActiveSubscriptions = subsArray;
                            } catch (e) {
                                // 解析失败时尝试简单匹配字符串
                                const stringsMatch =
                                    activeSubsMatch[1].match(/"([^"]+)"/g);
                                if (stringsMatch) {
                                    grokActiveSubscriptions = stringsMatch.map(
                                        (s) => s.replace(/"/g, ""),
                                    );
                                }
                            }
                        }

                        // 匹配 xSubscriptionType
                        const subTypeMatch = dataString.match(
                            /"xSubscriptionType"\s*:\s*"([^"]*)"/,
                        );
                        if (subTypeMatch) {
                            grokXSubscriptionType = subTypeMatch[1];
                        }

                        // 匹配 countryCode（通常在 user 对象后面）
                        const countryMatch = dataString.match(
                            /"countryCode"\s*:\s*"([^"]*)"/,
                        );
                        if (countryMatch) {
                            grokCountryCode = countryMatch[1];
                        }

                        if (grokXSubscriptionType && grokCountryCode) {
                            grokUserInfoFetched = true;
                            console.log(
                                "[CheckerNext] Parsed Grok user info:",
                                grokActiveSubscriptions,
                                grokXSubscriptionType,
                                grokCountryCode,
                            );
                            updateGrokUserInfo();
                        }
                    }

                    // enableEarlyAccessModels
                    if (
                        grokEarlyAccessEnabled &&
                        dataString.indexOf(
                            '"enableEarlyAccessModels":false',
                        ) !== -1
                    ) {
                        dataString = dataString.replace(
                            /"enableEarlyAccessModels":false/g,
                            '"enableEarlyAccessModels":true',
                        );
                        args[0][1] = dataString;
                        console.log(
                            "[CheckerNext] 已替换 enableEarlyAccessModels 为 true",
                        );
                    }
                    // 在替换之后解析最终值
                    if (!grokEarlyAccessFetched) {
                        const earlyAccessMatch = dataString.match(
                            /"enableEarlyAccessModels":(true|false)/,
                        );
                        if (earlyAccessMatch) {
                            grokEarlyAccessDisplayValue =
                                earlyAccessMatch[1] === "true";
                            grokEarlyAccessFetched = true;
                            updateBooleanStatus(
                                "grok-early-access-status",
                                grokEarlyAccessDisplayValue,
                            );
                        }
                    }

                    // isAsyncChat
                    if (
                        grokAsyncChatEnabled &&
                        dataString.indexOf('"isAsyncChat":false') !== -1
                    ) {
                        dataString = dataString.replace(
                            /"isAsyncChat":false/g,
                            '"isAsyncChat":true',
                        );
                        args[0][1] = dataString;
                        console.log("[CheckerNext] 已替换 isAsyncChat 为 true");
                    }
                    // 在替换之后解析最终值
                    if (!grokAsyncChatFetched) {
                        const asyncChatMatch = dataString.match(
                            /"isAsyncChat":(true|false)/,
                        );
                        if (asyncChatMatch) {
                            grokAsyncChatDisplayValue =
                                asyncChatMatch[1] === "true";
                            grokAsyncChatFetched = true;
                            updateBooleanStatus(
                                "grok-async-chat-status",
                                grokAsyncChatDisplayValue,
                            );
                        }
                    }

                    // isSuperGrokUser
                    if (
                        grokSuperGrokEnabled &&
                        dataString.indexOf('"isSuperGrokUser":false') !== -1
                    ) {
                        dataString = dataString.replace(
                            /"isSuperGrokUser":false/g,
                            '"isSuperGrokUser":true',
                        );
                        args[0][1] = dataString;
                        console.log(
                            "[CheckerNext] 已替换 isSuperGrokUser 为 true",
                        );
                    }
                    if (!grokSuperGrokFetched) {
                        const superGrokMatch = dataString.match(
                            /"isSuperGrokUser":(true|false)/,
                        );
                        if (superGrokMatch) {
                            grokSuperGrokDisplayValue =
                                superGrokMatch[1] === "true";
                            grokSuperGrokFetched = true;
                            updateBooleanStatus(
                                "grok-super-grok-status",
                                grokSuperGrokDisplayValue,
                            );
                        }
                    }

                    // isSuperGrokProUser
                    if (
                        grokSuperGrokProEnabled &&
                        dataString.indexOf('"isSuperGrokProUser":false') !== -1
                    ) {
                        dataString = dataString.replace(
                            /"isSuperGrokProUser":false/g,
                            '"isSuperGrokProUser":true',
                        );
                        args[0][1] = dataString;
                        console.log(
                            "[CheckerNext] 已替换 isSuperGrokProUser 为 true",
                        );
                    }
                    if (!grokSuperGrokProFetched) {
                        const superGrokProMatch = dataString.match(
                            /"isSuperGrokProUser":(true|false)/,
                        );
                        if (superGrokProMatch) {
                            grokSuperGrokProDisplayValue =
                                superGrokProMatch[1] === "true";
                            grokSuperGrokProFetched = true;
                            updateBooleanStatus(
                                "grok-super-grok-pro-status",
                                grokSuperGrokProDisplayValue,
                            );
                        }
                    }

                    // isEnterpriseUser
                    if (
                        grokEnterpriseEnabled &&
                        dataString.indexOf('"isEnterpriseUser":false') !== -1
                    ) {
                        dataString = dataString.replace(
                            /"isEnterpriseUser":false/g,
                            '"isEnterpriseUser":true',
                        );
                        args[0][1] = dataString;
                        console.log(
                            "[CheckerNext] 已替换 isEnterpriseUser 为 true",
                        );
                    }
                    if (!grokEnterpriseFetched) {
                        const enterpriseMatch = dataString.match(
                            /"isEnterpriseUser":(true|false)/,
                        );
                        if (enterpriseMatch) {
                            grokEnterpriseDisplayValue =
                                enterpriseMatch[1] === "true";
                            grokEnterpriseFetched = true;
                            updateBooleanStatus(
                                "grok-enterprise-status",
                                grokEnterpriseDisplayValue,
                            );
                        }
                    }

                    if (dataString.indexOf('"queries":[') !== -1) {
                        // 尝试找到 queries 数组并过滤
                        const queriesStart = dataString.indexOf('"queries":[');
                        // 找到完整的 queries 数组
                        let depth = 0;
                        let start = queriesStart + 10;
                        let end = start;
                        for (let i = start; i < dataString.length; i++) {
                            if (dataString[i] === "[") depth++;
                            if (dataString[i] === "]") depth--;
                            if (depth === 0) {
                                end = i + 1;
                                break;
                            }
                        }

                        if (end > start) {
                            try {
                                const queriesArrayStr = dataString.substring(
                                    start,
                                    end,
                                );
                                const queries = JSON.parse(queriesArrayStr);

                                // 过滤掉需要 spoil 的查询
                                const filteredQueries = queries.filter((q) => {
                                    const firstKey = q.queryKey?.[0];
                                    if (SPOIL_QUERY_KEYS.includes(firstKey)) {
                                        console.log(
                                            "[CheckerNext] Spoiled RSC cache:",
                                            firstKey,
                                        );
                                        return false;
                                    }
                                    return true;
                                });

                                if (filteredQueries.length !== queries.length) {
                                    // 替换回去
                                    const newQueriesStr =
                                        JSON.stringify(filteredQueries);
                                    dataString =
                                        dataString.substring(0, start) +
                                        newQueriesStr +
                                        dataString.substring(end);
                                    args[0][1] = dataString;
                                }
                            } catch (parseError) {
                                // 解析失败时忽略
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(
                    "[CheckerNext] Error while spoiling RSC data:",
                    e,
                );
            }
            return originalPush.apply(pageWindow.__next_f, args);
        };
    }

    // Grok 开发工具开关状态存储
    const GROK_DEV_TOOLS_KEY = "checker-next-grok-dev-tools";
    let grokDevToolsEnabled =
        isGrokMode && localStorage.getItem(GROK_DEV_TOOLS_KEY) === "true";

    // Grok 所有模型开关状态存储
    const GROK_ALL_MODELS_KEY = "checker-next-grok-all-models";
    let grokAllModelsEnabled =
        isGrokMode && localStorage.getItem(GROK_ALL_MODELS_KEY) === "true";

    // Grok 抢先体验模型开关状态存储
    const GROK_EARLY_ACCESS_KEY = "checker-next-grok-early-access";
    let grokEarlyAccessEnabled =
        isGrokMode && localStorage.getItem(GROK_EARLY_ACCESS_KEY) === "true";

    // Grok 异步聊天开关状态存储
    const GROK_ASYNC_CHAT_KEY = "checker-next-grok-async-chat";
    let grokAsyncChatEnabled =
        isGrokMode && localStorage.getItem(GROK_ASYNC_CHAT_KEY) === "true";

    // Grok 假装用户类型开关状态存储
    const GROK_SUPER_GROK_KEY = "checker-next-grok-super-grok";
    let grokSuperGrokEnabled =
        isGrokMode && localStorage.getItem(GROK_SUPER_GROK_KEY) === "true";

    const GROK_SUPER_GROK_PRO_KEY = "checker-next-grok-super-grok-pro";
    let grokSuperGrokProEnabled =
        isGrokMode && localStorage.getItem(GROK_SUPER_GROK_PRO_KEY) === "true";

    const GROK_ENTERPRISE_KEY = "checker-next-grok-enterprise";
    let grokEnterpriseEnabled =
        isGrokMode && localStorage.getItem(GROK_ENTERPRISE_KEY) === "true";

    const CHATGPT_RESEARCH_TO_TEXT_KEY =
        "checker-next-chatgpt-research-to-text";
    let chatgptResearchToTextEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_RESEARCH_TO_TEXT_KEY) === "true";
    let chatgptUnlockThemeColorsEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_UNLOCK_THEME_COLORS_KEY) === "true";
    const CHATGPT_AGE_VERIFICATION_SETTING_KEY =
        "checker-next-chatgpt-age-verification-setting";
    let chatgptAgeVerificationSettingEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_AGE_VERIFICATION_SETTING_KEY) === "true";

    function rewriteModuleImports(sourceText, assetUrl, assetBaseUrl) {
        let patched = sourceText;
        patched = patched.replaceAll(
            "import.meta.url",
            JSON.stringify(assetUrl),
        );
        patched = patched.replaceAll('from"./', `from"${assetBaseUrl}/`);
        patched = patched.replaceAll("from'./", `from'${assetBaseUrl}/`);
        patched = patched.replaceAll('import"./', `import"${assetBaseUrl}/`);
        patched = patched.replaceAll("import'./", `import'${assetBaseUrl}/`);
        patched = patched.replaceAll('import("./', `import("${assetBaseUrl}/`);
        patched = patched.replaceAll("import('./", `import('${assetBaseUrl}/`);
        patched = patched.replaceAll("import(`./", `import(\`${assetBaseUrl}/`);

        const normalizedBase = assetBaseUrl.endsWith("/")
            ? assetBaseUrl
            : `${assetBaseUrl}/`;
        const normalizedAssetBase = assetBaseUrl.endsWith("/")
            ? assetBaseUrl.slice(0, -1)
            : assetBaseUrl;
        patched = patched.replaceAll(
            'from"assets/',
            `from"${normalizedAssetBase}/assets/`,
        );
        patched = patched.replaceAll(
            "from'assets/",
            `from'${normalizedAssetBase}/assets/`,
        );
        patched = patched.replaceAll(
            'import"assets/',
            `import"${normalizedAssetBase}/assets/`,
        );
        patched = patched.replaceAll(
            "import'assets/",
            `import'${normalizedAssetBase}/assets/`,
        );
        patched = patched.replaceAll(
            'import("assets/',
            `import("${normalizedAssetBase}/assets/`,
        );
        patched = patched.replaceAll(
            "import('assets/",
            `import('${normalizedAssetBase}/assets/`,
        );
        patched = patched.replaceAll(
            'new URL("assets/',
            `new URL("${normalizedBase}assets/`,
        );
        patched = patched.replaceAll(
            "new URL('assets/",
            `new URL('${normalizedBase}assets/`,
        );
        return patched;
    }

    function patchChatgptUnlockThemeColorsAssetSource(sourceText) {
        const themeListPattern =
            /([A-Za-z$_][\w$]*)=\[`default`,`blue`,`green`,`yellow`,`pink`,`orange`\],([A-Za-z$_][\w$]*)=\[`purple`\],([A-Za-z$_][\w$]*)=\[`black`\]/;
        if (!themeListPattern.test(sourceText)) return null;
        return sourceText.replace(
            themeListPattern,
            (_match, baseVarName, purpleVarName, blackVarName) =>
                `${baseVarName}=[\`default\`,\`blue\`,\`green\`,\`yellow\`,\`pink\`,\`orange\`,\`purple\`,\`black\`],${purpleVarName}=[],${blackVarName}=[]`,
        );
    }

    function patchChatgptFakePlanAssetSource(sourceText) {
        const targetPlanType =
            normalizeChatgptFakePlanType(chatgptFakePlanValue);
        const targetSubscriptionPlan =
            getFakeSubscriptionPlanByPlanType(targetPlanType);
        const hasPaid =
            targetPlanType !== "guest" &&
            targetPlanType !== "free" &&
            targetPlanType !== "free_workspace";

        const planTypePattern =
            /planType:\s*[A-Za-z$_][\w$]*\.account\.plan_type\?\?[A-Za-z$_][\w$]*/;
        const hasPaidSubscriptionPattern =
            /hasPaidSubscription:\s*[A-Za-z$_][\w$]*\.entitlement\.has_active_subscription\?\?!1/;
        const subscriptionPlanPattern =
            /subscriptionPlan:\s*[A-Za-z$_][\w$]*\.entitlement\.subscription_plan\?\?void 0/;
        const lightAccountPlanTypePattern =
            /return this\.data\.lightAccount\.planType/;
        const sessionAccountPattern =
            /([A-Za-z$_][\w$]*)=[A-Za-z$_][\w$]*\.session\?\.account;/;
        const requiredPatterns = [
            planTypePattern,
            hasPaidSubscriptionPattern,
            subscriptionPlanPattern,
            lightAccountPlanTypePattern,
            sessionAccountPattern,
        ];
        if (
            requiredPatterns.some(
                (pattern) =>
                    [...sourceText.matchAll(new RegExp(pattern.source, "g"))]
                        .length !== 1,
            )
        ) {
            return null;
        }

        let patched = sourceText;

        patched = patched.replace(
            planTypePattern,
            `planType:"${targetPlanType}"`,
        );

        patched = patched.replace(
            hasPaidSubscriptionPattern,
            `hasPaidSubscription:${hasPaid ? "!0" : "!1"}`,
        );

        patched = patched.replace(
            subscriptionPlanPattern,
            `subscriptionPlan:"${targetSubscriptionPlan}"`,
        );

        patched = patched.replace(
            lightAccountPlanTypePattern,
            `return "${targetPlanType}"`,
        );

        patched = patched.replace(
            sessionAccountPattern,
            (match, accountVariable) =>
                `${match}${accountVariable}&&(${accountVariable}.planType="${targetPlanType}");`,
        );

        return patched;
    }

    function injectImportMap(importMapJson) {
        return GM_addElement("script", {
            type: "importmap",
            textContent: JSON.stringify(importMapJson),
        });
    }

    function getChatgptImportPatchSignature() {
        const unlockThemeColors =
            localStorage.getItem(CHATGPT_UNLOCK_THEME_COLORS_KEY) === "true";
        const fakePlanEnabled =
            localStorage.getItem(CHATGPT_FAKE_PLAN_ENABLED_KEY) === "true";
        const fakePlan = localStorage.getItem(CHATGPT_FAKE_PLAN_KEY) || "pro";
        const transformSignature = [
            rewriteModuleImports,
            patchChatgptUnlockThemeColorsAssetSource,
            patchChatgptFakePlanAssetSource,
        ].join("\n");
        return `${transformSignature}\n${unlockThemeColors ? "1" : "0"}:${fakePlanEnabled ? fakePlan : ""}`;
    }

    function isChatgptImportPatchEnabled() {
        return (
            localStorage.getItem(CHATGPT_UNLOCK_THEME_COLORS_KEY) === "true" ||
            localStorage.getItem(CHATGPT_FAKE_PLAN_ENABLED_KEY) === "true"
        );
    }

    function installCachedChatgptImportMapPatch() {
        if (!isChatgptImportPatchEnabled()) return;
        if (window.__checkerNextImportMapInstalled) return;

        const cached = GM_getValue(CHATGPT_IMPORT_MAP_CACHE_KEY, null);
        if (
            !cached ||
            typeof cached !== "object" ||
            cached.signature !== getChatgptImportPatchSignature() ||
            typeof cached.assetUrl !== "string" ||
            typeof cached.assetFilename !== "string" ||
            typeof cached.sourceText !== "string"
        ) {
            return;
        }

        const assetBaseUrl = cached.assetUrl.slice(
            0,
            cached.assetUrl.lastIndexOf("/"),
        );
        const blobUrl = URL.createObjectURL(
            new Blob([cached.sourceText], { type: "text/javascript" }),
        );
        const importMap = injectImportMap({
            imports: {
                [cached.assetUrl]: blobUrl,
            },
            scopes: {
                [`${assetBaseUrl}/`]: {
                    [`./${cached.assetFilename}`]: blobUrl,
                },
            },
        });
        if (!importMap) {
            URL.revokeObjectURL(blobUrl);
            console.warn("[CheckerNext] 缓存模块映射未能插入页面。");
            return;
        }

        window.__checkerNextImportMapInstalled = true;
        console.info(
            "[CheckerNext] 已创建缓存 import map 元素:",
            cached.assetUrl,
        );
    }

    function getChatgptAssetPatchFunctions() {
        const patchFunctions = [];
        if (chatgptUnlockThemeColorsEnabled) {
            patchFunctions.push(patchChatgptUnlockThemeColorsAssetSource);
        }
        if (isChatgptFakePlanRuntimeEnabled()) {
            patchFunctions.push(patchChatgptFakePlanAssetSource);
        }
        return patchFunctions;
    }

    async function prepareChatgptImportMapPatchCache() {
        if (!isChatgptImportPatchEnabled()) return;

        const preload = [
            ...document.querySelectorAll('link[rel="modulepreload"]'),
        ].find((element) =>
            /\/4813494d-[^/?]+\.js(?:[?#]|$)/.test(element.href),
        );
        if (!preload) {
            console.error("[CheckerNext] 未找到 ChatGPT 目标模块。");
            return;
        }

        const assetUrl = preload.href;
        const assetFilename = new URL(assetUrl).pathname.split("/").pop();
        const signature = getChatgptImportPatchSignature();
        const cached = GM_getValue(CHATGPT_IMPORT_MAP_CACHE_KEY, null);
        if (
            cached?.assetUrl === assetUrl &&
            cached?.signature === signature &&
            typeof cached.sourceText === "string"
        ) {
            return;
        }

        try {
            const response = await originalFetch(assetUrl);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            let sourceText = await response.text();
            for (const patch of getChatgptAssetPatchFunctions()) {
                const patched = patch(sourceText);
                if (typeof patched !== "string" || patched.length === 0) {
                    console.error(
                        `[CheckerNext] 模块补丁未匹配: ${patch.name}`,
                    );
                    return;
                }
                sourceText = patched;
            }

            const assetBaseUrl = assetUrl.slice(0, assetUrl.lastIndexOf("/"));
            sourceText = rewriteModuleImports(
                sourceText,
                assetUrl,
                assetBaseUrl,
            );
            GM_setValue(CHATGPT_IMPORT_MAP_CACHE_KEY, {
                assetFilename,
                assetUrl,
                signature,
                sourceText,
            });
            console.info(
                "[CheckerNext] 模块补丁缓存已更新，重新载入后生效:",
                assetUrl,
            );
        } catch (error) {
            console.error("[CheckerNext] 生成模块补丁缓存失败:", error);
        }
    }

    let chatgptAgeVerificationSettingFetched = false;
    let chatgptAgeVerificationSettingDisplayValue = null;

    const CHATGPT_FAKE_PLAN_SUBSCRIPTION_PLAN_MAP = Object.freeze({
        guest: "chatgptguestplan",
        free: "chatgptfreeplan",
        go: "chatgptgoplan",
        plus: "chatgptplusplan",
        prolite: "chatgptprolite",
        pro: "chatgptpro",
        free_workspace: "chatgptfreeworkspaceplan",
        team: "chatgptteamplan",
        business: "chatgptbusiness_flat",
        hc: "chatgpthc_flat",
        finserv: "chatgptfinserv_flat",
        education: "chatgpteducation_flat",
        quorum: "chatgptquorumplan",
        enterprise: "chatgptenterpriseplan",
        edu: "chatgpteduplan",
        k12: "chatgptk12plan",
    });

    function normalizeChatgptFakePlanType(value) {
        if (
            typeof value === "string" &&
            Object.hasOwn(CHATGPT_FAKE_PLAN_SUBSCRIPTION_PLAN_MAP, value)
        ) {
            return value;
        }
        return "pro";
    }

    function getFakeSubscriptionPlanByPlanType(planType) {
        const normalizedPlanType = normalizeChatgptFakePlanType(planType);
        return CHATGPT_FAKE_PLAN_SUBSCRIPTION_PLAN_MAP[normalizedPlanType];
    }

    let chatgptFakePlanValue = isChatgptMode
        ? normalizeChatgptFakePlanType(
              localStorage.getItem(CHATGPT_FAKE_PLAN_KEY),
          )
        : "pro";
    let chatgptFakePlanEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_FAKE_PLAN_ENABLED_KEY) === "true";

    function isChatgptFakePlanRuntimeEnabled() {
        return chatgptFakePlanEnabled && chatgptFakePlanValue;
    }

    // 全局状态：记录弹窗是否正在显示
    let isDisplayBoxVisible = false;

    function createElements() {
        if (!document.body) {
            requestAnimationFrame(createElements);
            return;
        }

        if (document.getElementById("checker-next-displayBox")) return;

        // 创建显示框
        const displayBox = document.createElement("div");
        displayBox.id = "checker-next-displayBox";
        displayBox.dataset.mode = currentPageMode;
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
        <style>
            #checker-next-displayBox[data-mode="codex"] :is(#pow-section, #deep-research-section, #file-upload-section, #paste-text-to-file-section, #image-gen-section, #features-section, #grok-section),
            #checker-next-displayBox[data-mode="grok"] :is(#pow-section, #deep-research-section, #file-upload-section, #paste-text-to-file-section, #image-gen-section, #features-section, #codex-section),
            #checker-next-displayBox[data-mode="chatgpt"] :is(#codex-section, #grok-section) {
                display: none !important;
            }
            #checker-next-displayBox[data-mode="codex"] #codex-section,
            #checker-next-displayBox[data-mode="grok"] #grok-section,
            #checker-next-displayBox[data-mode="chatgpt"] #features-section {
                display: block !important;
                margin-top: 0 !important;
            }
        </style>
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
            <span id="user-region-container" style="display: block">用户地区：<span id="user-region">...</span></span>
            <span id="default-model-container" style="display: block">默认模型：<span id="default-model">...</span></span>
            <span id="price-region-container" style="display: block">价格地区：<span id="price-region">...</span></span>
        </div>
        <div id="deep-research-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>深度研究</strong>
            </div>
            剩余次数：<span id="deep-research-usage">...</span><br>
            重置时间：<span id="deep-research-reset-time">...</span>
        </div>
        <div id="image-gen-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>图片生成</strong>
            </div>
            剩余次数：<span id="image-gen-usage">...</span><br>
            重置时间：<span id="image-gen-reset-time">...</span>
        </div>
        <div id="file-upload-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>文件上传</strong>
            </div>
            剩余次数：<span id="file-upload-usage">...</span><br>
            重置时间：<span id="file-upload-reset-time">...</span>
        </div>
        <div id="paste-text-to-file-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>粘贴文本为文件</strong>
            </div>
            剩余次数：<span id="paste-text-to-file-usage">...</span><br>
            重置时间：<span id="paste-text-to-file-reset-time">...</span>
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
        <div id="grok-section" style="margin-top: 10px; display: none">
            <div style="margin-bottom: 2px;">
                <strong>Grok</strong>
            </div>
            Grok订阅：<span id="grok-active-subscriptions">...</span><br>
            X订阅：<span id="grok-x-subscription-type">...</span><br>
            账号地区：<span id="grok-country-code">...</span><br>
            可用模型：<span id="grok-available-models">...</span>
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>任务</strong>
            </div>
            任务总数：<span id="grok-task-usage">...</span><br>
            高频任务：<span id="grok-frequent-usage">...</span>
            <span id="grok-frequent-tooltip" style="
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
            低频任务：<span id="grok-occasional-usage">...</span>
            <span id="grok-occasional-tooltip" style="
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
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>功能</strong>
                <span id="grok-feature-tooltip" style="
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
            <div id="grok-dev-tools-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>开发工具：<span id="grok-dev-tools-status">...</span>
                <span id="grok-dev-tools-tooltip" style="
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
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="grok-dev-tools-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="grok-dev-tools-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="grok-dev-tools-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="grok-async-chat-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>异步聊天：<span id="grok-async-chat-status">...</span>
                <span id="grok-async-chat-tooltip" style="
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
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="grok-async-chat-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="grok-async-chat-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="grok-async-chat-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="grok-early-access-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>抢先体验模型：<span id="grok-early-access-status">...</span>
                <span id="grok-early-access-tooltip" style="
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
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="grok-early-access-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="grok-early-access-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="grok-early-access-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="grok-all-models-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>解锁所有模型
                <span id="grok-all-models-tooltip" style="
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
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="grok-all-models-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="grok-all-models-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="grok-all-models-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="grok-super-grok-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>假装 Super Grok：<span id="grok-super-grok-status">...</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="grok-super-grok-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="grok-super-grok-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="grok-super-grok-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="grok-super-grok-pro-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>假装 SuperGrok Pro：<span id="grok-super-grok-pro-status">...</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="grok-super-grok-pro-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="grok-super-grok-pro-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="grok-super-grok-pro-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="grok-enterprise-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>假装 Enterprise：<span id="grok-enterprise-status">...</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="grok-enterprise-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="grok-enterprise-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="grok-enterprise-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
        </div>
        <div id="features-section" style="margin-top: 10px; display: none">
            <div style="margin-top: 10px; margin-bottom: 2px;">
                <strong>功能</strong>
                <span id="features-tooltip" style="
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
            <div id="chatgpt-age-verification-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>年龄验证：<span id="chatgpt-age-verification-status">...</span>
                <span id="chatgpt-age-verification-tooltip" style="
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
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="chatgpt-age-verification-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-age-verification-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="chatgpt-age-verification-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="chatgpt-research-to-text-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>研究报告转文本
                <span id="chatgpt-research-to-text-tooltip" style="
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
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="chatgpt-research-to-text-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-research-to-text-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="chatgpt-research-to-text-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="chatgpt-unlock-theme-colors-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>解锁所有主题色
                <span id="chatgpt-unlock-theme-colors-tooltip" style="
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
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="chatgpt-unlock-theme-colors-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-unlock-theme-colors-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="chatgpt-unlock-theme-colors-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
            </div>
            <div id="chatgpt-fake-plan-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>假装
                <select id="chatgpt-fake-plan-select" style="
                    background-color: #333;
                    color: #fff;
                    border: 0px;
                    border-radius: 4px;
                    padding: 4px 8px 4px 8px;
                    font-size: 11px;
                    cursor: pointer;
                    outline: none;
                    line-height: 1em;
                ">
                    <option value="guest">Guest</option>
                    <option value="free">Free</option>
                    <option value="go">Go</option>
                    <option value="plus">Plus</option>
                    <option value="prolite">Pro Lite</option>
                    <option value="pro">Pro</option>
                    <option value="free_workspace">Free Workspace</option>
                    <option value="team">Team</option>
                    <option value="business">Business</option>
                    <option value="hc">HC</option>
                    <option value="finserv">Finserv</option>
                    <option value="education">Education</option>
                    <option value="quorum">Quorum</option>
                    <option value="enterprise">Enterprise (弃用)</option>
                    <option value="edu">Edu (弃用)</option>
                    <option value="k12">K12</option>
                </select>
                <span id="chatgpt-fake-plan-tooltip" style="
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
                    margin-right: 2px;
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px; cursor: pointer;">
                    <input type="checkbox" id="chatgpt-fake-plan-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-fake-plan-slider" style="
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #555;
                        transition: 0.3s;
                        border-radius: 16px;
                    "></span>
                    <span id="chatgpt-fake-plan-slider-dot" style="
                        position: absolute;
                        content: '';
                        height: 10px;
                        width: 10px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: 0.3s;
                        border-radius: 50%;
                    "></span>
                </label>
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
            <a href="https://github.com/zetaloop/chatgpt-checker-next" target="_blank" style="color: inherit; text-decoration: none;">ChatGPT Checker Next</a>${scriptVersion ? ` <a href="https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js" target="_blank" style="color: inherit; text-decoration: none;">v${scriptVersion}</a>` : ""}
    </div>`;
        displayBox.appendChild(contentWrapper);
        document.body.appendChild(displayBox);

        let displayBoxInitialized = false;
        const resizeObserver = new ResizeObserver(() => {
            if (!displayBoxInitialized) return;
            displayBox.style.height = `${contentWrapper.offsetHeight}px`;
        });
        resizeObserver.observe(contentWrapper);

        // 如果之前弹窗正在显示，直接恢复显示状态（跳过动画）
        if (isDisplayBoxVisible) {
            displayBox.style.transition = "none";
            displayBox.style.height = `${contentWrapper.offsetHeight}px`;
            displayBox.style.opacity = "1";
            displayBox.style.transform =
                "translateY(-50%) translateX(0) scale(1)";
            displayBox.style.pointerEvents = "auto";
            displayBox.offsetHeight; // 强制重绘
            displayBox.style.transition =
                "height 0.2s ease, opacity 0.06s ease-out, transform 0.06s ease-out";
            displayBoxInitialized = true;
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

        // 辅助函数
        function isPointInRect(x, y, rect) {
            return (
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom
            );
        }

        function showDisplayBox() {
            // 打开时先禁用高度动画，设置正确高度
            displayBox.style.transition = "none";
            displayBox.style.height = `${contentWrapper.offsetHeight}px`;
            // 强制重绘后启用所有动画
            displayBox.offsetHeight;
            displayBox.style.transition =
                "height 0.2s ease, opacity 0.06s ease-out, transform 0.06s ease-out";
            displayBox.style.opacity = "1";
            displayBox.style.transform =
                "translateY(-50%) translateX(0) scale(1)";
            displayBox.style.pointerEvents = "auto";
            displayBoxInitialized = true;
            isDisplayBoxVisible = true;
            collapsedIndicator.style.opacity = "0";
        }

        function hideDisplayBox() {
            displayBox.style.opacity = "0";
            displayBox.style.transform =
                "translateY(-50%) translateX(2px) scale(0.98)";
            displayBox.style.pointerEvents = "none";
            displayBoxInitialized = false;
            isDisplayBoxVisible = false;
            collapsedIndicator.style.opacity = "1";
        }

        // 在 window 级别监听 mousemove，仅在鼠标移动时检测
        // 使用捕获阶段，确保即使其他层阻止冒泡也能收到事件
        window.addEventListener(
            "mousemove",
            function (e) {
                const indicatorRect =
                    collapsedIndicator.getBoundingClientRect();
                const displayBoxRect = displayBox.getBoundingClientRect();

                const overIndicator = isPointInRect(
                    e.clientX,
                    e.clientY,
                    indicatorRect,
                );
                const overDisplayBox = isPointInRect(
                    e.clientX,
                    e.clientY,
                    displayBoxRect,
                );

                if (overIndicator && !isDisplayBoxVisible) {
                    showDisplayBox();
                } else if (
                    !overIndicator &&
                    !overDisplayBox &&
                    isDisplayBoxVisible
                ) {
                    hideDisplayBox();
                }
            },
            true,
        );

        // 保留原有事件作为备用
        collapsedIndicator.addEventListener("mouseenter", function () {
            if (!isDisplayBoxVisible) {
                showDisplayBox();
            }
        });

        displayBox.addEventListener("mouseleave", function () {
            hideDisplayBox();
        });

        function createTooltip(id, text) {
            const element = document.createElement("div");
            element.id = id;
            element.innerText = text;
            Object.assign(element.style, {
                position: "fixed",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "5px",
                fontSize: "12px",
                visibility: "hidden",
                zIndex: "10001",
                width: "240px",
                lineHeight: "1.4",
                pointerEvents: "none",
            });
            document.body.appendChild(element);
            return element;
        }

        const tooltip = createTooltip(
            "tooltip",
            "这个数值越大，相当于 ChatGPT 认为你的 IP 风险越低。",
        );

        // 创建 Codex 提示框
        const codexTooltipBox = createTooltip(
            "codex-tooltip-box",
            "使用一次之后才开始计时。",
        );

        // 创建积分提示框
        const creditsTooltipBox = createTooltip(
            "credits-tooltip-box",
            "单独购买的积分，可用于 Codex 任务。",
        );

        // 创建 Grok 功能提示框
        const grokFeatureTooltipBox = createTooltip(
            "grok-feature-tooltip-box",
            "刷新页面生效。",
        );

        // 创建 Grok 开发工具提示框
        const grokDevToolsTooltipBox = createTooltip(
            "grok-dev-tools-tooltip-box",
            "Grok 设置 - 开发工具。",
        );

        // 创建 Grok 高频任务提示框
        const grokFrequentTooltipBox = createTooltip(
            "grok-frequent-tooltip-box",
            "每日触发的任务。",
        );

        // 创建功能提示框
        const featuresTooltipBox = createTooltip(
            "features-tooltip-box",
            "刷新页面生效。",
        );

        // 创建研究报告转文本提示框
        const chatgptResearchToTextTooltipBox = createTooltip(
            "chatgpt-research-to-text-tooltip-box",
            "在传统深度研究时，将结果转为普通文本消息以便复制。",
        );

        // 创建解锁主题色提示框
        const chatgptUnlockThemeColorsTooltipBox = createTooltip(
            "chatgpt-unlock-theme-colors-tooltip-box",
            "解锁粉色、橙色、紫色与黑色。",
        );

        // 创建 Grok 低频任务提示框
        const grokOccasionalTooltipBox = createTooltip(
            "grok-occasional-tooltip-box",
            "单次、每周、每月、每年触发的任务。",
        );

        // 创建年龄验证提示框
        const chatgptAgeVerificationSettingTooltipBox = createTooltip(
            "chatgpt-age-verification-tooltip-box",
            "ChatGPT 设置 - 账户 - 年龄验证，可以扫脸验证成人，没看到 True/False 的话请进入对话/设置来触发加载此配置。",
        );

        // 创建假装会员提示框
        const chatgptFakePlanTooltipBox = createTooltip(
            "chatgpt-fake-plan-tooltip-box",
            "可能导致功能异常，不影响模型列表。",
        );

        // 创建 Grok 所有模型提示框
        const grokAllModelsTooltipBox = createTooltip(
            "grok-all-models-tooltip-box",
            "在界面上解锁不可用的模型，并没有实际作用。",
        );

        // 创建 Grok 抢先体验模型提示框
        const grokEarlyAccessTooltipBox = createTooltip(
            "grok-early-access-tooltip-box",
            "将用户设置里的 enableEarlyAccessModels 设为 true。",
        );

        // 创建 Grok 异步聊天提示框
        const grokAsyncChatTooltipBox = createTooltip(
            "grok-async-chat-tooltip-box",
            "将用户设置里的 isAsyncChat 设为 true。",
        );

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
            bindTooltipEvents("difficulty-tooltip", tooltip);
            bindTooltipEvents("codex-tooltip", codexTooltipBox);
            bindTooltipEvents("codex-credits-tooltip", creditsTooltipBox);
            bindTooltipEvents("grok-feature-tooltip", grokFeatureTooltipBox);
            bindTooltipEvents(
                "grok-all-models-tooltip",
                grokAllModelsTooltipBox,
            );
            bindTooltipEvents("grok-dev-tools-tooltip", grokDevToolsTooltipBox);
            bindTooltipEvents("grok-frequent-tooltip", grokFrequentTooltipBox);
            bindTooltipEvents(
                "grok-occasional-tooltip",
                grokOccasionalTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-age-verification-tooltip",
                chatgptAgeVerificationSettingTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-fake-plan-tooltip",
                chatgptFakePlanTooltipBox,
            );
            bindTooltipEvents(
                "grok-early-access-tooltip",
                grokEarlyAccessTooltipBox,
            );
            bindTooltipEvents(
                "grok-async-chat-tooltip",
                grokAsyncChatTooltipBox,
            );
            bindTooltipEvents("features-tooltip", featuresTooltipBox);
            bindTooltipEvents(
                "chatgpt-research-to-text-tooltip",
                chatgptResearchToTextTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-unlock-theme-colors-tooltip",
                chatgptUnlockThemeColorsTooltipBox,
            );
        }

        function updateGrokDevToolsSliderStyle(slider, sliderDot, enabled) {
            if (enabled) {
                slider.style.backgroundColor = "#4CAF50";
                sliderDot.style.transform = "translateX(12px)";
            } else {
                slider.style.backgroundColor = "#555";
                sliderDot.style.transform = "translateX(0)";
            }
        }

        function bindGrokToggle(id, enabled, storageKey, setEnabled) {
            const toggle = document.getElementById(`${id}-toggle`);
            const slider = document.getElementById(`${id}-slider`);
            const sliderDot = document.getElementById(`${id}-slider-dot`);
            if (!toggle || !slider || !sliderDot) return;

            toggle.checked = enabled;
            updateGrokDevToolsSliderStyle(slider, sliderDot, enabled);
            toggle.addEventListener("change", function () {
                setEnabled(toggle.checked);
                localStorage.setItem(storageKey, String(toggle.checked));
                updateGrokDevToolsSliderStyle(
                    slider,
                    sliderDot,
                    toggle.checked,
                );
            });
        }

        function bindChatgptResearchToTextToggle() {
            const container = document.getElementById(
                "chatgpt-research-to-text-container",
            );
            const toggle = document.getElementById(
                "chatgpt-research-to-text-toggle",
            );
            const slider = document.getElementById(
                "chatgpt-research-to-text-slider",
            );
            const sliderDot = document.getElementById(
                "chatgpt-research-to-text-slider-dot",
            );
            if (!container || !toggle || !slider || !sliderDot) return;

            function apply() {
                updateGrokDevToolsSliderStyle(
                    slider,
                    sliderDot,
                    chatgptResearchToTextEnabled,
                );
            }

            toggle.checked = chatgptResearchToTextEnabled;
            apply();

            toggle.addEventListener("change", function () {
                chatgptResearchToTextEnabled = toggle.checked;
                localStorage.setItem(
                    CHATGPT_RESEARCH_TO_TEXT_KEY,
                    chatgptResearchToTextEnabled ? "true" : "false",
                );
                apply();
            });
        }

        function bindChatgptUnlockThemeColorsToggle() {
            const container = document.getElementById(
                "chatgpt-unlock-theme-colors-container",
            );
            const toggle = document.getElementById(
                "chatgpt-unlock-theme-colors-toggle",
            );
            const slider = document.getElementById(
                "chatgpt-unlock-theme-colors-slider",
            );
            const sliderDot = document.getElementById(
                "chatgpt-unlock-theme-colors-slider-dot",
            );
            if (!container || !toggle || !slider || !sliderDot) return;

            function apply() {
                updateGrokDevToolsSliderStyle(
                    slider,
                    sliderDot,
                    chatgptUnlockThemeColorsEnabled,
                );
            }

            toggle.checked = chatgptUnlockThemeColorsEnabled;
            apply();

            toggle.addEventListener("change", function () {
                chatgptUnlockThemeColorsEnabled = toggle.checked;
                localStorage.setItem(
                    CHATGPT_UNLOCK_THEME_COLORS_KEY,
                    chatgptUnlockThemeColorsEnabled ? "true" : "false",
                );
                apply();
                void prepareChatgptImportMapPatchCache();
            });
        }
        function bindChatgptAgeVerificationSettingToggle() {
            const container = document.getElementById(
                "chatgpt-age-verification-container",
            );
            const toggle = document.getElementById(
                "chatgpt-age-verification-toggle",
            );
            const slider = document.getElementById(
                "chatgpt-age-verification-slider",
            );
            const sliderDot = document.getElementById(
                "chatgpt-age-verification-slider-dot",
            );
            const statusEl = document.getElementById(
                "chatgpt-age-verification-status",
            );
            if (!container || !toggle || !slider || !sliderDot || !statusEl)
                return;

            function apply() {
                updateBooleanStatus(
                    statusEl,
                    chatgptAgeVerificationSettingDisplayValue,
                );
                updateGrokDevToolsSliderStyle(
                    slider,
                    sliderDot,
                    chatgptAgeVerificationSettingEnabled,
                );
            }

            toggle.checked = chatgptAgeVerificationSettingEnabled;
            apply();

            toggle.addEventListener("change", function () {
                chatgptAgeVerificationSettingEnabled = toggle.checked;
                localStorage.setItem(
                    CHATGPT_AGE_VERIFICATION_SETTING_KEY,
                    chatgptAgeVerificationSettingEnabled ? "true" : "false",
                );
                apply();
            });
        }

        function bindChatgptFakePlanSelect() {
            const select = document.getElementById("chatgpt-fake-plan-select");
            const toggle = document.getElementById("chatgpt-fake-plan-toggle");
            const slider = document.getElementById("chatgpt-fake-plan-slider");
            const sliderDot = document.getElementById(
                "chatgpt-fake-plan-slider-dot",
            );
            if (!select || !toggle || !slider || !sliderDot) return;

            chatgptFakePlanValue =
                normalizeChatgptFakePlanType(chatgptFakePlanValue);
            select.value = chatgptFakePlanValue;
            toggle.checked = chatgptFakePlanEnabled;
            updateGrokDevToolsSliderStyle(
                slider,
                sliderDot,
                isChatgptFakePlanRuntimeEnabled(),
            );

            select.addEventListener("change", function () {
                chatgptFakePlanValue = normalizeChatgptFakePlanType(
                    select.value,
                );
                select.value = chatgptFakePlanValue;
                localStorage.setItem(
                    CHATGPT_FAKE_PLAN_KEY,
                    chatgptFakePlanValue,
                );
                void prepareChatgptImportMapPatchCache();
            });
            toggle.addEventListener("change", function () {
                chatgptFakePlanEnabled = toggle.checked;
                localStorage.setItem(
                    CHATGPT_FAKE_PLAN_ENABLED_KEY,
                    chatgptFakePlanEnabled ? "true" : "false",
                );
                updateGrokDevToolsSliderStyle(
                    slider,
                    sliderDot,
                    chatgptFakePlanEnabled,
                );
                void prepareChatgptImportMapPatchCache();
            });
        }

        if (isGrokMode) {
            bindGrokToggle(
                "grok-dev-tools",
                grokDevToolsEnabled,
                GROK_DEV_TOOLS_KEY,
                (value) => {
                    grokDevToolsEnabled = value;
                },
            );
            bindGrokToggle(
                "grok-all-models",
                grokAllModelsEnabled,
                GROK_ALL_MODELS_KEY,
                (value) => {
                    grokAllModelsEnabled = value;
                },
            );
            bindGrokToggle(
                "grok-early-access",
                grokEarlyAccessEnabled,
                GROK_EARLY_ACCESS_KEY,
                (value) => {
                    grokEarlyAccessEnabled = value;
                },
            );
            bindGrokToggle(
                "grok-async-chat",
                grokAsyncChatEnabled,
                GROK_ASYNC_CHAT_KEY,
                (value) => {
                    grokAsyncChatEnabled = value;
                },
            );
            bindGrokToggle(
                "grok-super-grok",
                grokSuperGrokEnabled,
                GROK_SUPER_GROK_KEY,
                (value) => {
                    grokSuperGrokEnabled = value;
                },
            );
            bindGrokToggle(
                "grok-super-grok-pro",
                grokSuperGrokProEnabled,
                GROK_SUPER_GROK_PRO_KEY,
                (value) => {
                    grokSuperGrokProEnabled = value;
                },
            );
            bindGrokToggle(
                "grok-enterprise",
                grokEnterpriseEnabled,
                GROK_ENTERPRISE_KEY,
                (value) => {
                    grokEnterpriseEnabled = value;
                },
            );
            updateBooleanStatus(
                "grok-dev-tools-status",
                grokDevToolsDisplayValue,
            );
            updateBooleanStatus(
                "grok-early-access-status",
                grokEarlyAccessDisplayValue,
            );
            updateBooleanStatus(
                "grok-async-chat-status",
                grokAsyncChatDisplayValue,
            );
            updateBooleanStatus(
                "grok-super-grok-status",
                grokSuperGrokDisplayValue,
            );
            updateBooleanStatus(
                "grok-super-grok-pro-status",
                grokSuperGrokProDisplayValue,
            );
            updateBooleanStatus(
                "grok-enterprise-status",
                grokEnterpriseDisplayValue,
            );
            updateGrokUserInfo();
            updateGrokModels();
        }

        if (isChatgptMode) {
            bindChatgptResearchToTextToggle();
            bindChatgptUnlockThemeColorsToggle();
            bindChatgptAgeVerificationSettingToggle();
            bindChatgptFakePlanSelect();
        }
        bindAllTooltips();
    }

    // 创建元素
    createElements();

    // 使用 MutationObserver 观测 DOM 改动
    const observer = new MutationObserver(() => {
        if (!document.getElementById("checker-next-displayBox")) {
            createElements();
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

    function updateBooleanStatus(target, value) {
        const statusEl =
            typeof target === "string"
                ? document.getElementById(target)
                : target;
        if (!statusEl) return;
        if (value === true) {
            statusEl.innerHTML = '<span style="color: #98fb98;">True</span>';
        } else if (value === false) {
            statusEl.innerHTML = '<span style="color: #ff6b6b;">False</span>';
        } else {
            statusEl.innerText = "...";
        }
    }

    // 更新 ChatGPT 各自的开关状态显示
    function updateChatgptAgeVerificationSettingStatus(
        originalValue,
        wasModified,
    ) {
        if (!isChatgptMode) return;
        const statusEl = document.getElementById(
            "chatgpt-age-verification-status",
        );
        if (!statusEl) return;

        if (
            (originalValue === null || originalValue === undefined) &&
            chatgptAgeVerificationSettingFetched
        ) {
            updateBooleanStatus(
                statusEl,
                chatgptAgeVerificationSettingDisplayValue,
            );
            return;
        }
        if (typeof originalValue === "boolean") {
            chatgptAgeVerificationSettingFetched = true;
            if (wasModified) {
                chatgptAgeVerificationSettingDisplayValue = true;
            } else {
                chatgptAgeVerificationSettingDisplayValue = originalValue;
            }
            updateBooleanStatus(
                statusEl,
                chatgptAgeVerificationSettingDisplayValue,
            );
        }
    }

    function updateGrokDevToolsStatus(originalValue, wasModified) {
        if (!isGrokMode) return;
        const statusEl = document.getElementById("grok-dev-tools-status");
        if (!statusEl) return;

        // 如果传入 null/undefined 但已经获取过值，则保留原有值不更新
        if (
            (originalValue === null || originalValue === undefined) &&
            grokDevToolsFetched
        ) {
            updateBooleanStatus(statusEl, grokDevToolsDisplayValue);
            return;
        }

        // 只有获取到有效值时才更新
        if (typeof originalValue === "boolean") {
            grokDevToolsFetched = true;

            // 如果开关启用且修改成功，显示 True
            if (wasModified) {
                grokDevToolsDisplayValue = true;
            } else {
                grokDevToolsDisplayValue = originalValue;
            }

            updateBooleanStatus(statusEl, grokDevToolsDisplayValue);
        }
    }

    // 更新 Grok 用户信息（Grok订阅、X订阅和账号地区）
    function updateGrokUserInfo() {
        if (!isGrokMode) return;

        const activeSubsEl = document.getElementById(
            "grok-active-subscriptions",
        );
        const subTypeEl = document.getElementById("grok-x-subscription-type");
        const countryEl = document.getElementById("grok-country-code");

        // 应用已缓存的值
        if (activeSubsEl) {
            if (
                grokActiveSubscriptions &&
                Array.isArray(grokActiveSubscriptions)
            ) {
                if (grokActiveSubscriptions.length === 0) {
                    activeSubsEl.innerText = "无";
                } else {
                    activeSubsEl.innerText = grokActiveSubscriptions.join("、");
                }
            } else if (!grokUserInfoFetched) {
                activeSubsEl.innerText = "...";
            }
        }

        if (subTypeEl) {
            if (grokXSubscriptionType) {
                subTypeEl.innerText = grokXSubscriptionType;
            } else if (!grokUserInfoFetched) {
                subTypeEl.innerText = "...";
            }
        }

        if (countryEl) {
            if (grokCountryCode) {
                countryEl.innerText = grokCountryCode;
            } else if (!grokUserInfoFetched) {
                countryEl.innerText = "...";
            }
        }
    }

    // 更新 Grok 可用模型列表
    function updateGrokModels() {
        if (!isGrokMode) return;

        const modelsEl = document.getElementById("grok-available-models");
        if (!modelsEl) return;

        if (grokAvailableModels && Array.isArray(grokAvailableModels)) {
            const formattedModels = grokAvailableModels.map((model) => {
                // 匹配 "modeName (modelId)" 格式
                const match = model.match(/^(.+?)(\s*\([^)]+\))$/);
                if (match) {
                    return `${match[1]}<span style="color: #bbbbbb; font-size: 9px;">${match[2]}</span>`;
                }
                return model;
            });
            modelsEl.innerHTML = `<div style="display: block; padding-left: 0.5em; font-size: 12px; line-height: 1.2;">${formattedModels.join("<br>")}</div>`;
        } else if (!grokModelsFetched) {
            modelsEl.innerHTML = "...";
        }
    }

    // 读取并处理 Grok 页面内嵌数据
    function processGrokServerClientData() {
        if (!isGrokMode) return;

        const scriptEl = document.getElementById(
            "server-client-data-experimentation",
        );
        if (!scriptEl) return;

        try {
            const data = JSON.parse(scriptEl.textContent || "{}");
            const serverConfig = data?.serverConfig;
            if (serverConfig && typeof serverConfig === "object") {
                const originalValue = serverConfig.show_model_config_override;
                let wasModified = false;

                // 如果开关启用，覆盖该值
                if (
                    grokDevToolsEnabled &&
                    typeof originalValue === "boolean" &&
                    originalValue !== true
                ) {
                    serverConfig.show_model_config_override = true;
                    scriptEl.textContent = JSON.stringify(data);
                    wasModified = true;
                    console.log(
                        "[CheckerNext] 已覆盖 show_model_config_override 为 true",
                    );
                }

                updateGrokDevToolsStatus(
                    typeof originalValue === "boolean" ? originalValue : null,
                    wasModified,
                );
            }

            // 尝试更新用户信息（RSC 可能已解析）
            updateGrokUserInfo();
        } catch (e) {
            console.error(
                "[CheckerNext] 处理 Grok server-client-data 出错:",
                e,
            );
        }
    }

    // 在 DOM 准备好后处理 Grok 数据
    function initGrokDataProcessing() {
        if (!isGrokMode) return;

        // 尝试立即处理
        if (document.getElementById("server-client-data-experimentation")) {
            processGrokServerClientData();
        } else {
            // 等待 DOM 加载
            const grokObserver = new MutationObserver((mutations, obs) => {
                if (
                    document.getElementById(
                        "server-client-data-experimentation",
                    )
                ) {
                    processGrokServerClientData();
                    obs.disconnect();
                }
            });

            if (document.documentElement) {
                grokObserver.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            } else {
                document.addEventListener("DOMContentLoaded", () => {
                    processGrokServerClientData();
                });
            }
        }
    }

    // 立即初始化 Grok 数据处理
    initGrokDataProcessing();

    // 更新 Grok 任务用量
    let grokFetched = false;
    function updateGrokTaskInfo(taskUsage) {
        if (!isGrokMode) return;
        const section = document.getElementById("grok-section");
        const taskUsageEl = document.getElementById("grok-task-usage");
        const frequentUsageEl = document.getElementById("grok-frequent-usage");
        const occasionalUsageEl = document.getElementById(
            "grok-occasional-usage",
        );

        if (!section || !taskUsageEl || !frequentUsageEl || !occasionalUsageEl)
            return;

        if (!taskUsage || typeof taskUsage !== "object") {
            section.style.display = "none";
            return;
        }

        const usage = typeof taskUsage.usage === "number" ? taskUsage.usage : 0;
        const limit = typeof taskUsage.limit === "number" ? taskUsage.limit : 0;
        const frequentUsage =
            typeof taskUsage.frequentUsage === "number"
                ? taskUsage.frequentUsage
                : 0;
        const frequentLimit =
            typeof taskUsage.frequentLimit === "number"
                ? taskUsage.frequentLimit
                : 0;
        const occasionalUsage =
            typeof taskUsage.occasionalUsage === "number"
                ? taskUsage.occasionalUsage
                : 0;
        const occasionalLimit =
            typeof taskUsage.occasionalLimit === "number"
                ? taskUsage.occasionalLimit
                : 0;

        taskUsageEl.innerText = `${usage}/${limit}`;
        frequentUsageEl.innerText = `${frequentUsage}/${frequentLimit}`;
        occasionalUsageEl.innerText = `${occasionalUsage}/${occasionalLimit}`;

        section.style.display = "block";
        section.style.marginTop = "0";

        if (!grokFetched) {
            // Grok 品牌色
            setIconColors("#000000", "#1D1D1D");
            grokFetched = true;
        }
    }

    function isResetTimestampNear(resetAfter, expectedTimestamp) {
        if (!resetAfter || typeof expectedTimestamp !== "number") return false;
        const timestamp = new Date(resetAfter).getTime();
        if (Number.isNaN(timestamp)) return false;
        return Math.abs(timestamp - expectedTimestamp) <= 5000;
    }

    function isMonthlyResetNotStarted(resetAfter) {
        const thirtyDaysLater = Date.now() + 30 * 24 * 60 * 60 * 1000;
        return isResetTimestampNear(resetAfter, thirtyDaysLater);
    }

    function isDailyResetNotStarted(resetAfter) {
        const oneDayLater = Date.now() + 24 * 60 * 60 * 1000;
        return isResetTimestampNear(resetAfter, oneDayLater);
    }

    function isThreeHourResetNotStarted(resetAfter) {
        const threeHoursLater = Date.now() + 3 * 60 * 60 * 1000;
        return isResetTimestampNear(resetAfter, threeHoursLater);
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
        if (isThreeHourResetNotStarted(resetAfter)) {
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

    // 更新粘贴文本为文件次数
    let pasteTextRemaining = null;
    let pasteTextReset = null;
    function updatePasteTextToFileInfo(remaining, resetAfter) {
        if (!isChatgptMode) return;
        const section = document.getElementById("paste-text-to-file-section");
        const usageEl = document.getElementById("paste-text-to-file-usage");
        const resetEl = document.getElementById(
            "paste-text-to-file-reset-time",
        );

        if (!section || !usageEl || !resetEl) return;

        if (typeof remaining !== "number") {
            section.style.display = "none";
            return;
        }

        pasteTextRemaining = remaining;
        pasteTextReset = resetAfter || null;

        section.style.display = "block";
        section.style.marginTop = powFetched ? "10px" : "0";
        if (isThreeHourResetNotStarted(resetAfter)) {
            usageEl.innerHTML = `${remaining}次${NOT_STARTED_BADGE}`;
        } else {
            usageEl.innerText = `${remaining}次`;
        }

        if (pasteTextReset) {
            const date = new Date(pasteTextReset);
            resetEl.innerText = date
                .toLocaleString("zh-CN", { hour12: false })
                .replace(/\//g, "-");
        } else {
            resetEl.innerText = "...";
        }
    }

    // 更新图片生成次数
    let imageGenRemaining = null;
    let imageGenReset = null;
    function updateImageGenInfo(remaining, resetAfter) {
        if (!isChatgptMode) return;
        const section = document.getElementById("image-gen-section");
        const usageEl = document.getElementById("image-gen-usage");
        const resetEl = document.getElementById("image-gen-reset-time");

        if (!section || !usageEl || !resetEl) return;

        if (typeof remaining !== "number") {
            section.style.display = "none";
            return;
        }

        imageGenRemaining = remaining;
        imageGenReset = resetAfter || null;

        section.style.display = "block";
        section.style.marginTop = powFetched ? "10px" : "0";
        if (isDailyResetNotStarted(resetAfter)) {
            usageEl.innerHTML = `${remaining}次${NOT_STARTED_BADGE}`;
        } else {
            usageEl.innerText = `${remaining}次`;
        }

        if (imageGenReset) {
            const date = new Date(imageGenReset);
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

    let userRegionValue = null;
    function updateUserRegion(country, region) {
        if (!isChatgptMode) return;
        const container = document.getElementById("user-region-container");
        const valueEl = document.getElementById("user-region");
        if (!container || !valueEl) return;

        if (typeof country === "string" && country.trim()) {
            const parts = [country.trim()];
            if (typeof region === "string" && region.trim()) {
                parts.push(region.trim());
            }
            userRegionValue = parts.join(" / ");
        } else {
            userRegionValue = null;
        }

        valueEl.innerText = userRegionValue || "...";
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

    function recreateResponseText(text, response) {
        return new pageWindow.Response(text, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }

    // 拦截 fetch 请求
    const originalFetch = pageWindow.fetch.bind(pageWindow);
    pageWindow.fetch = async function (resource, options = {}) {
        const requestUrl =
            typeof resource === "string" ? resource : resource?.url || "";
        const requestMethod =
            typeof resource === "object" && resource.method
                ? resource.method
                : options?.method || "GET";
        const finalMethod = requestMethod.toUpperCase();
        const response = await originalFetch(resource, options);

        if (
            (requestUrl.includes(
                "/backend-api/sentinel/chat-requirements/prepare",
            ) ||
                requestUrl.includes(
                    "/backend-anon/sentinel/chat-requirements/prepare",
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

                return recreateResponseText(responseBodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理响应或重新创建响应时出错:", e);
                const difficultyElement = document.getElementById("difficulty");
                if (difficultyElement) difficultyElement.innerText = "...";
                updateDifficultyIndicator("...");
                const personaElement = document.getElementById("persona");
                if (personaElement) personaElement.innerText = "...";

                if (typeof responseBodyText === "string") {
                    return recreateResponseText(responseBodyText, response);
                }
                return response;
            }
        }

        if (
            requestUrl.endsWith("/backend-api/me") &&
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
                updateUserRegion(
                    typeof data?.country === "string" ? data.country : null,
                    typeof data?.region === "string" ? data.region : null,
                );
                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理用户地区响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
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
                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理价格地区响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
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
                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理记忆用量响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
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
                const file_upload = Array.isArray(data.limits_progress)
                    ? data.limits_progress.find(
                          (i) => i.feature_name === "file_upload",
                      )
                    : null;
                const paste_text_to_file = Array.isArray(data.limits_progress)
                    ? data.limits_progress.find(
                          (i) => i.feature_name === "paste_text_to_file",
                      )
                    : null;
                const image_gen = Array.isArray(data.limits_progress)
                    ? data.limits_progress.find(
                          (i) => i.feature_name === "image_gen",
                      )
                    : null;
                if (deep_research) {
                    updateDeepResearchInfo(
                        deep_research.remaining,
                        deep_research.reset_after,
                    );
                }
                if (file_upload) {
                    updateFileUploadInfo(
                        file_upload.remaining,
                        file_upload.reset_after,
                    );
                }
                if (paste_text_to_file) {
                    updatePasteTextToFileInfo(
                        paste_text_to_file.remaining,
                        paste_text_to_file.reset_after,
                    );
                }
                if (image_gen) {
                    updateImageGenInfo(
                        image_gen.remaining,
                        image_gen.reset_after,
                    );
                }
                updateDefaultModelInfo(
                    data.default_model_slug === null
                        ? "无"
                        : typeof data.default_model_slug === "string"
                          ? data.default_model_slug
                          : null,
                );
                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理功能用量响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
                }
                return response;
            }
        }

        if (
            requestUrl.includes("/backend-api/settings/is_adult") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isChatgptMode) return response;
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);

                let originalValue = data.show_age_verification_setting === true;
                let modified = false;

                if (
                    chatgptAgeVerificationSettingEnabled &&
                    data.show_age_verification_setting !== true
                ) {
                    data.show_age_verification_setting = true;
                    modified = true;
                }

                updateChatgptAgeVerificationSettingStatus(
                    originalValue,
                    modified,
                );

                if (modified) {
                    return new pageWindow.Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                    });
                }
                // 返回新的 response，因为 body 已经被 consumed 了
                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理 is_adult 响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
                }
                return response;
            }
        }

        if (
            requestUrl.includes("/backend-api/conversation/") &&
            !requestUrl.includes("/backend-api/conversation/init") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isChatgptMode) {
                return response;
            }

            let bodyText;
            try {
                if (
                    !/\/backend-api\/conversation\/[0-9a-f-]+(?:[/?#]|$)/i.test(
                        requestUrl,
                    )
                ) {
                    return response;
                }

                const contentType = response.headers.get("content-type") || "";
                if (contentType.indexOf("application/json") === -1) {
                    return response;
                }

                bodyText = await response.text();

                if (
                    bodyText.indexOf('"async_task_type"') === -1 ||
                    bodyText.indexOf('"research"') === -1
                ) {
                    return recreateResponseText(bodyText, response);
                }

                if (
                    bodyText.indexOf('"is_async_task_result_message"') === -1 &&
                    bodyText.indexOf('"b1de6e2_rm"') === -1
                ) {
                    return recreateResponseText(bodyText, response);
                }

                const data = JSON.parse(bodyText);
                let modified = false;
                let hasResearchAndOriginallyNotText = false;

                if (data && typeof data === "object" && data.mapping) {
                    const mapping = data.mapping;
                    if (mapping && typeof mapping === "object") {
                        for (const id of Object.keys(mapping)) {
                            const metadata = mapping?.[id]?.message?.metadata;
                            if (!metadata || typeof metadata !== "object")
                                continue;
                            if (metadata.async_task_type !== "research")
                                continue;

                            if (
                                metadata.is_async_task_result_message ===
                                    true ||
                                metadata.b1de6e2_rm === true
                            ) {
                                hasResearchAndOriginallyNotText = true;
                                if (chatgptResearchToTextEnabled) {
                                    if (
                                        metadata.is_async_task_result_message ===
                                        true
                                    ) {
                                        metadata.is_async_task_result_message = false;
                                        modified = true;
                                    }
                                    if (metadata.b1de6e2_rm === true) {
                                        metadata.b1de6e2_rm = false;
                                        modified = true;
                                    }
                                }
                            }
                        }
                    }
                }

                if (modified) {
                    bodyText = JSON.stringify(data);
                }

                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理 conversation 响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
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
                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理 Codex 响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
                }
                return response;
            }
        }

        if (
            requestUrl.includes("grok.com/rest/models") &&
            finalMethod === "POST" &&
            response.ok
        ) {
            if (!isGrokMode) {
                return response;
            }
            let bodyText;
            try {
                bodyText = await response.text();
                let data = JSON.parse(bodyText);

                // 如果启用了解锁所有模型，把不可用模型移动到可用列表
                if (
                    grokAllModelsEnabled &&
                    Array.isArray(data.models) &&
                    Array.isArray(data.unavailableModels) &&
                    data.unavailableModels.length > 0
                ) {
                    data.models = [...data.models, ...data.unavailableModels];
                    data.unavailableModels = [];
                    bodyText = JSON.stringify(data);
                    console.log(
                        "[CheckerNext] Unlocked unavailable models:",
                        data.models.map((m) => m.modelId),
                    );
                }

                // 解析可用模型列表
                if (Array.isArray(data.models)) {
                    grokAvailableModels = data.models.map(
                        (m) => `${m.modeName} (${m.modelId})`,
                    );
                    grokModelsFetched = true;
                    console.log(
                        "[CheckerNext] Grok available models:",
                        grokAvailableModels,
                    );
                    updateGrokModels();
                }

                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理 Grok models 响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
                }
                return response;
            }
        }

        if (
            requestUrl.includes("grok.com/rest/tasks") &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isGrokMode) {
                return response;
            }
            let bodyText;
            try {
                bodyText = await response.text();
                const data = JSON.parse(bodyText);
                if (data && typeof data.taskUsage === "object") {
                    updateGrokTaskInfo(data.taskUsage);
                }
                return recreateResponseText(bodyText, response);
            } catch (e) {
                console.error("[CheckerNext] 处理 Grok 响应出错:", e);
                if (typeof bodyText === "string") {
                    return recreateResponseText(bodyText, response);
                }
                return response;
            }
        }
        return response;
    };

    if (isChatgptMode && isChatgptImportPatchEnabled()) {
        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                () => void prepareChatgptImportMapPatchCache(),
                { once: true },
            );
        } else {
            void prepareChatgptImportMapPatchCache();
        }
    }
})();
