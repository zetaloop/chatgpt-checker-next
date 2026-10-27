// ==UserScript==
// @name         ChatGPT Checker Next
// @namespace    https://github.com/zetaloop/chatgpt-checker-next
// @homepage     https://github.com/zetaloop/chatgpt-checker-next
// @author       zetaloop
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzJjM2U1MCIgZD0iTTMyIDJDMTUuNDMyIDIgMiAxNS40MzIgMiAzMnMxMy40MzIgMzAgMzAgMzAgMzAtMTMuNDMyIDMwLTMwUzQ4LjU2OCAyIDMyIDJ6bTAgNTRjLTEzLjIzMyAwLTI0LTEwLjc2Ny0yNC0yNFMxOC43NjcgOCAzMiA4czI0IDEwLjc2NyAyNCAyNFM0NS4yMzMgNTYgMzIgNTZ6Ii8+PHBhdGggZmlsbD0iIzNkYzJmZiIgZD0iTTMyIDEyYy0xMS4wNDYgMC0yMCA4Ljk1NC0yMCAyMHM4Ljk1NCAyMCAyMCAyMCAyMC04Ljk1NCAyMC0yMFM0My4wNDYgMTIgMzIgMTJ6bTAgMzZjLTguODM3IDAtMTYtNy4xNjMtMTYtMTZzNy4xNjMtMTYgMTYtMTYgMTYgNy4xNjMgMTYgMTZTNDAuODM3IDQ4IDMyIDQ4eiIvPjxwYXRoIGZpbGw9IiMwMGZmN2YiIGQ9Ik0zMiAyMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMzOC42MjcgMjAgMzIgMjB6bTAgMjBjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzIiIGN5PSIzMiIgcj0iNCIvPjwvc3ZnPg==
// @version      5.3.4
// @description  查看 ChatGPT 和 Codex 的账号、用量与服务信息。
// @match        *://chatgpt.com/*
// @grant        GM_addElement
// @grant        unsafeWindow
// @sandbox      raw
// @run-at       document-start
// @noframes
// @downloadURL  https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @updateURL    https://github.com/zetaloop/chatgpt-checker-next/raw/refs/heads/main/chatgpt-checker-next.user.js
// @license AGPLv3
// ==/UserScript==

(function () {
    "use strict";

    const MODE_CHATGPT = "chatgpt";
    const MODE_CODEX = "codex";
    const pageWindow = unsafeWindow;
    const currentPageMode = pageWindow.location.pathname.startsWith("/codex")
        ? MODE_CODEX
        : MODE_CHATGPT;
    const isChatgptMode = currentPageMode === MODE_CHATGPT;
    const isCodexMode = currentPageMode === MODE_CODEX;
    const CHATGPT_POW_RADIX_KEY = "checker-next-chatgpt-pow-radix";
    const CHATGPT_FAKE_PLAN_KEY = "checker-next-chatgpt-fake-plan";
    const CHATGPT_FAKE_PLAN_ENABLED_KEY =
        "checker-next-chatgpt-fake-plan-enabled";
    const CHATGPT_MODULE_INJECTION_ENABLED_KEY =
        "checker-next-chatgpt-module-injection-enabled";
    const CHATGPT_COPY_BUTTON_ENABLED_KEY =
        "checker-next-chatgpt-copy-button-enabled";
    const CHATGPT_COPY_DETAILS_KEY = "checker-next-chatgpt-copy-details";
    const CHATGPT_COPY_RAW_KEY = "checker-next-chatgpt-copy-raw";
    const CHATGPT_COPY_EVENT = "checker-next-copy";
    const CHATGPT_MESSAGE_INFO_KEY = "checker-next-chatgpt-message-info";
    const CHATGPT_MESSAGE_INFO_EVENT = "checker-next-message-info";
    const CHATGPT_APPROVAL_KEY = "checker-next-chatgpt-approval";
    const CHATGPT_APPROVAL_EVENT = "checker-next-approval";
    const CHATGPT_AUTO_COLLAPSE_KEY = "checker-next-chatgpt-auto-collapse";
    const CHATGPT_AUTO_COLLAPSE_EVENT = "checker-next-auto-collapse";
    const CHATGPT_SELECTION_POPOVER_DISABLED_KEY =
        "checker-next-chatgpt-selection-popover-disabled";
    const CHATGPT_RUNTIME_MODEL_STATE_EVENT =
        "checker-next-runtime-model-state";
    const CHATGPT_RUNTIME_MODEL_REQUEST_EVENT =
        "checker-next-runtime-model-request";
    const CHATGPT_RUNTIME_MODEL_SET_EVENT = "checker-next-runtime-model-set";
    const CHATGPT_RUNTIME_CUSTOM_VALUE = "__checker_next_custom__";

    let powDifficulty = "...";
    let powRadix =
        localStorage.getItem(CHATGPT_POW_RADIX_KEY) === "16" ? 16 : 10;
    let chatgptModuleInjectionEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_MODULE_INJECTION_ENABLED_KEY) !== "false";
    let chatgptCopyButtonEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_COPY_BUTTON_ENABLED_KEY) !== "false";
    let chatgptCopyDetailsEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_COPY_DETAILS_KEY) === "true";
    let chatgptCopyRawEnabled =
        isChatgptMode && localStorage.getItem(CHATGPT_COPY_RAW_KEY) === "true";
    let chatgptMessageInfoEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_MESSAGE_INFO_KEY) !== "false";
    let chatgptApprovalEnabled =
        isChatgptMode && localStorage.getItem(CHATGPT_APPROVAL_KEY) !== "false";
    let chatgptAutoCollapseEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_AUTO_COLLAPSE_KEY) !== "false";
    let chatgptSelectionPopoverDisabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_SELECTION_POPOVER_DISABLED_KEY) === "true";
    let chatgptSelectionPopoverStyle;
    let userRegionValue = null;
    let billingCurrency = null;
    let chatgptRuntimeModelState;
    let chatgptRuntimeEnvironmentState;
    let chatgptPlanTypes;
    let chatgptModuleInjectionStarted = false;
    let chatgptModuleEntries = [];
    let chatgptRuntimeReady = false;
    let chatgptInjectionFailure;
    const chatgptReportedFailures = new Set();

    if (isChatgptMode) {
        if (chatgptModuleInjectionEnabled) installChatgptModuleInjection();
        chatgptSelectionPopoverStyle = GM_addElement("style", {
            media: chatgptSelectionPopoverDisabled ? "all" : "not all",
            textContent:
                '[role="presentation"].pointer-events-auto.w-fit.max-w-full.overflow-hidden:is(.pointer-events-none.w-max.fixed > *, .flex-wrap) { display: none !important; }',
        });
    }
    const NOT_STARTED_BADGE = '<span style="color:#9ca3af"> (未开始)</span>';

    function installChatgptModuleInjection() {
        chatgptModuleInjectionStarted = true;
        const prototype = pageWindow.Function.prototype;
        const original = prototype.call;
        let runtime;
        const install = (require) => {
            const { patches, bindings } = createChatgptModulePatches();
            const entries = patches.concat(createChatgptModuleData());
            chatgptModuleEntries = entries;
            installChatgptRuntimeBridge(require, bindings);
            const processed = new WeakMap();
            const patch = (id, factory) => {
                if (processed.has(factory)) return processed.get(factory);
                const source = factory.toString();
                const target = { id, source };
                let matched = false;
                try {
                    for (const entry of entries) {
                        if (!entry.predicate(source)) continue;
                        matched = true;
                        if (entry.id !== undefined && entry.id !== id)
                            throw new Error(`${entry.label}匹配到多个模块`);
                        if (entry.read) {
                            if (entry.id === undefined) {
                                queueMicrotask(() => {
                                    try {
                                        entry.read(require(id));
                                    } catch (error) {
                                        reportChatgptInjectionFailure(
                                            `读取${entry.label}失败：${error}`,
                                        );
                                    }
                                });
                            }
                        } else {
                            entry.apply(target);
                        }
                        entry.id = id;
                    }
                    const result =
                        target.source === source
                            ? factory
                            : compileChatgptModule(target.source);
                    processed.set(factory, result);
                    if (matched) queueMicrotask(updateChatgptInjectionStatus);
                    return result;
                } catch (error) {
                    reportChatgptInjectionFailure(error);
                    processed.set(factory, factory);
                    return factory;
                }
            };
            for (const [id, factory] of Object.entries(require.m))
                require.m[id] = patch(id, factory);
            require.m = new Proxy(require.m, {
                set(target, id, factory) {
                    target[id] = patch(id, factory);
                    return true;
                },
            });
        };
        const hook = new Proxy(original, {
            apply(target, factory, args) {
                const [receiver, module, exports, require] = args;
                if (
                    !runtime &&
                    typeof require === "function" &&
                    typeof require.C === "function" &&
                    require.m?.[module?.id] === factory &&
                    require.c?.[module.id] === module &&
                    receiver === exports &&
                    exports === module.exports
                ) {
                    runtime = require;
                    if (prototype.call === hook) prototype.call = original;
                    try {
                        install(require);
                    } catch (error) {
                        reportChatgptInjectionFailure(error);
                    }
                    return Reflect.apply(
                        require.m[module.id],
                        receiver,
                        args.slice(1),
                    );
                }
                return Reflect.apply(target, factory, args);
            },
        });
        prototype.call = hook;
    }

    function installChatgptRuntimeBridge(require, bindings) {
        const { location } = pageWindow;
        const conversations = new Map();
        const dotControllers = new Map();
        let dotMessageContext;
        const origins = new Map();
        const customModels = new Map();
        const controls = new Set();
        const native = new Proxy(
            {},
            {
                get(target, name) {
                    const binding = bindings[name];
                    return binding
                        ? require(binding[0])[binding[1]]
                        : target[name];
                },
            },
        );
        let appScope,
            watchedEnvironmentScope,
            stopWatchingEnvironment,
            homeScope,
            homeOrigin,
            scheduled = false,
            lastState;
        const activeControl = () =>
            [...controls].findLast(
                (control) =>
                    control.active &&
                    control.route.pathname === location.pathname &&
                    (control.route.search ?? "") === location.search,
            );
        const report = reportChatgptInjectionFailure;
        const subscribeCopy = (listener) => {
            pageWindow.addEventListener(CHATGPT_COPY_EVENT, listener);
            return () =>
                pageWindow.removeEventListener(CHATGPT_COPY_EVENT, listener);
        };
        const getCopyEnabled = () => chatgptCopyButtonEnabled;
        const subscribeAutoCollapse = (listener) => {
            pageWindow.addEventListener(CHATGPT_AUTO_COLLAPSE_EVENT, listener);
            return () =>
                pageWindow.removeEventListener(
                    CHATGPT_AUTO_COLLAPSE_EVENT,
                    listener,
                );
        };
        const getAutoCollapse = () => chatgptAutoCollapseEnabled;
        const after = (fn, callback) => {
            function wrapped(...args) {
                const result = fn.apply(this, args);
                try {
                    callback(args, result);
                } catch (error) {
                    report(error);
                }
                return result;
            }
            return wrapped;
        };
        const useControl = (scope, value) => {
            const control = native.useRef({}).current;
            const route = scope.getOwnValue(native.routeScope);
            native.useLayoutEffect(() => {
                if (
                    control.route !== route ||
                    control.conversationId !== value.conversationId
                )
                    control.error = null;
                Object.assign(control, value, { scope, route });
                controls.add(control);
                scheduleState();
                return () => {
                    controls.delete(control);
                    scheduleState();
                };
            }, [control, scope, route, value]);
        };
        const scheduleState = () => {
            if (scheduled) return;
            scheduled = true;
            queueMicrotask(() => {
                scheduled = false;
                const active = activeControl();
                const isDot = active?.kind === "dot";
                const model = active?.selectedModel;
                const state = {
                    ready: true,
                    pathname: location.pathname,
                    search: location.search,
                    available: Boolean(
                        active &&
                            !active.loading &&
                            (isDot || (model?.slug && active.onModelChange)),
                    ),
                    loading: active?.loading ?? true,
                    origin: isDot
                        ? "dot"
                        : active?.isWorkConversation
                          ? "work"
                          : "chat",
                    model: model?.slug?.trim() || null,
                    thinkingEffort: model?.thinkingEffort ?? null,
                    models: active?.models ?? [],
                    error: active?.error ?? active?.sourceError ?? null,
                };
                const serialized = JSON.stringify(state);
                if (serialized === lastState) return;
                lastState = serialized;
                pageWindow.dispatchEvent(
                    new pageWindow.CustomEvent(
                        "checker-next-runtime-model-state",
                        {
                            detail: state,
                        },
                    ),
                );
            });
        };
        const watchEnvironment = () => {
            const key = native.intl;
            if (
                !appScope ||
                !key ||
                watchedEnvironmentScope?.node === appScope.node
            )
                return;
            const scope = appScope;
            stopWatchingEnvironment?.();
            try {
                stopWatchingEnvironment = scope.watch((scope) => {
                    try {
                        const intl = scope.get(key);
                        if (!intl) return;
                        const timeZone = intl
                            .formatDateToParts(Date.now(), {
                                timeZoneName: "short",
                            })
                            .find(
                                (part) => part.type === "timeZoneName",
                            )?.value;
                        chatgptRuntimeEnvironmentState = {
                            timeZone: timeZone ?? null,
                            locale: intl.locale ?? null,
                        };
                        updateChatgptLocaleInfo();
                    } catch (error) {
                        report(error);
                    }
                });
                watchedEnvironmentScope = scope;
            } catch (error) {
                report(error);
            }
        };
        const applyOrigin = (conversation) => {
            const origin = origins.get(conversation?.conversation_id);
            return origin === undefined
                ? conversation
                : { ...conversation, conversation_origin: origin };
        };
        const modelOptions = (data) => [
            ...(data?.options ?? []),
            ...(data?.internalOptions ?? []),
            ...(data?.versionOptions?.flatMap((version) => version.options) ??
                []),
        ];
        const extendModels = (data) => {
            if (!data || customModels.size === 0) return data;
            let modelConfigBySlug = data.modelConfigBySlug;
            let internalOptions = data.internalOptions;
            const options = modelOptions(data);
            for (const [slug, efforts] of customModels) {
                const model = modelConfigBySlug?.[slug] ?? { title: slug };
                const additions = [...efforts].filter(
                    (effort) =>
                        effort !== null &&
                        !model.thinkingEfforts?.some(
                            (item) => item.thinking_effort === effort,
                        ),
                );
                if (!modelConfigBySlug?.[slug] || additions.length) {
                    if (modelConfigBySlug === data.modelConfigBySlug)
                        modelConfigBySlug = { ...modelConfigBySlug };
                    modelConfigBySlug[slug] = additions.length
                        ? {
                              ...model,
                              thinkingEfforts: [
                                  ...(model.thinkingEfforts ?? []),
                                  ...additions.map((thinking_effort) => ({
                                      thinking_effort,
                                  })),
                              ],
                          }
                        : model;
                }
                for (const thinkingEffort of efforts) {
                    if (
                        options.some(
                            (option) =>
                                option.slug === slug &&
                                (option.thinkingEffort ?? null) ===
                                    thinkingEffort,
                        )
                    )
                        continue;
                    const option = options.find(
                        (option) => option.slug === slug,
                    );
                    const title = model.title ?? option?.modelTitle ?? slug;
                    if (internalOptions === data.internalOptions)
                        internalOptions = [...(internalOptions ?? [])];
                    internalOptions.push({
                        ...option,
                        slug,
                        thinkingEffort,
                        title: thinkingEffort ?? title,
                        modelTitle: title,
                        selectedLabel:
                            thinkingEffort === null
                                ? title
                                : `${title} ${thinkingEffort}`,
                    });
                }
            }
            return modelConfigBySlug === data.modelConfigBySlug &&
                internalOptions === data.internalOptions
                ? data
                : { ...data, modelConfigBySlug, internalOptions };
        };
        const formatLink = (reference) => {
            const url = native.referenceUrl(reference);
            const title = native.referenceText(reference);
            return url ? native.markdownLink(title ?? url, url) : (title ?? "");
        };
        const messageText = (item, sources = []) => {
            const references = item.contentReferences;
            const parts = [];
            const nodes = [
                { node: native.parseMarkdown(item.content), prefix: "" },
            ];
            for (const { node, prefix, end: parentEnd } of nodes) {
                const start = node.position?.start.offset;
                const end = node.position?.end.offset;
                if (start == null || end == null) continue;
                if (
                    ["leafDirective", "textDirective"].includes(node.type) &&
                    node.name === "chatgpt-content-reference"
                ) {
                    const match = native.resolveReference(
                        node.attributes,
                        references,
                    );
                    if (match)
                        parts.push({
                            start,
                            end,
                            prefix,
                            reference: match.reference,
                        });
                } else if (node.type === "text") {
                    // 引用标题可含行内格式，标记可能跨越相邻的 Markdown 节点。
                    for (const match of item.content
                        .slice(start, parentEnd)
                        .matchAll(/\uE200[^\uE200\uE201]*\uE201/g)) {
                        const offset = start + match.index;
                        if (offset >= end) break;
                        const marker = match[0];
                        const reference = native.resolveReference(
                            { marker_text: marker },
                            references,
                        )?.reference ?? {
                            type: marker.slice(1, -1).split("\uE202")[0],
                            matched_text: marker,
                        };
                        parts.push({
                            start: offset,
                            end: offset + marker.length,
                            prefix,
                            reference,
                        });
                    }
                } else if (node.children) {
                    let continuation = prefix;
                    if (node.type === "blockquote") continuation += "> ";
                    else if (node.type === "listItem") {
                        const first = node.children[0]?.position?.start.offset;
                        if (first != null)
                            continuation = item.content
                                .slice(
                                    item.content.lastIndexOf("\n", first - 1) +
                                        1,
                                    first,
                                )
                                .replace(/>(?![ \t])/g, "> ")
                                .replace(/[^> \t]/g, " ");
                    }
                    nodes.push(
                        ...node.children.map((node) => ({
                            node,
                            prefix: continuation,
                            end,
                        })),
                    );
                }
            }
            let content = "";
            let offset = 0;
            for (const part of parts.sort((a, b) => a.start - b.start)) {
                const { reference } = part;
                let text;
                if (reference.model_dil_v2) {
                    const markdown = native.fallbackMarkdown(reference);
                    if (markdown == null)
                        throw new Error("富文本消息的 Markdown 尚未载入");
                    text = messageText(
                        {
                            content: markdown,
                            contentReferences:
                                reference.source_content_references ?? [],
                        },
                        Object.values(
                            reference.model_dil_v2.appData?.opGenui
                                ?.componentResults ?? {},
                        ).flatMap((component) =>
                            component.componentName === "Cite"
                                ? (component.state?.items ?? [])
                                : [],
                        ),
                    );
                } else if (reference.category === "code_block") {
                    text = native
                        .markdown({
                            type: "code",
                            lang: reference.data.language,
                            value: native.codeContent(reference.data),
                        })
                        .trimEnd();
                } else if (reference.category !== "visualization") {
                    const links = native.referenceSources(reference);
                    const [type, ...values] =
                        reference.matched_text?.startsWith("\uE200")
                            ? reference.matched_text
                                  .slice(1, -1)
                                  .split("\uE202")
                            : [];
                    if (links.length) {
                        text = links.map(formatLink).filter(Boolean).join(" ");
                    } else if (type === "url" && values.length === 2) {
                        text = formatLink({
                            title: values[0],
                            url: values[1],
                        });
                    } else if (type === "cite") {
                        text = values
                            .map((id) =>
                                sources.find((source) => source.ref_id === id),
                            )
                            .filter(Boolean)
                            .map(formatLink)
                            .filter(Boolean)
                            .join(" ");
                    } else {
                        text =
                            reference.link_markdown ??
                            reference.data?.content ??
                            native.referenceText(reference) ??
                            native.markerText(reference);
                    }
                }
                content += item.content.slice(offset, part.start);
                content +=
                    typeof text === "string"
                        ? text.replaceAll("\n", `\n${part.prefix}`)
                        : item.content.slice(part.start, part.end);
                offset = part.end;
            }
            content += item.content.slice(offset);
            return native.messageText({
                ...item,
                content,
                contentReferences: references,
            });
        };
        const sidebarHref = (props) => {
            if (props["data-checker-next-href"])
                return props["data-checker-next-href"];
            if (props.animatedIcon === "sidebar-new-chat") return "/";
            if (props.animatedIcon === "sidebar-projects") return "/projects";
            const destination = props["data-sidebar-destination"];
            if (!destination) return;
            const prefix = "builtin:orbit:";
            if (destination.startsWith(prefix))
                return native.dotHref(destination.slice(prefix.length));
            return Object.values(native.sidebarRoutes).find(
                (route) => route.destinationId === destination,
            )?.path;
        };
        const sidebarClick = (onClick) => (event) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            )
                return;
            try {
                onClick(event);
            } finally {
                event.preventDefault();
            }
        };
        function CopyButton({ getText, message = false, disabled = false }) {
            const [state, setState] = native.useState("idle");
            const copying = native.useRef(false);
            const timer = native.useRef();
            native.useLayoutEffect(() => () => clearTimeout(timer.current), []);
            const icon =
                state === "success"
                    ? "copied"
                    : state === "error"
                      ? "copyError"
                      : "copy";
            const label =
                state === "loading"
                    ? "正在复制"
                    : state === "success"
                      ? "已复制"
                      : state === "error"
                        ? "复制失败"
                        : message
                          ? "复制消息"
                          : "复制全文";
            return native.createElement(
                message ? "button" : native.button,
                {
                    ...(message
                        ? {
                              type: "button",
                              className:
                                  "button ghost icon-button message-action-button",
                          }
                        : { color: "toolbar", size: "toolbar", uniform: true }),
                    disabled,
                    "aria-label": label,
                    title: label,
                    onClick: async (event) => {
                        event.stopPropagation();
                        if (copying.current) return;
                        copying.current = true;
                        clearTimeout(timer.current);
                        setState("loading");
                        try {
                            await pageWindow.navigator.clipboard.writeText(
                                getText(),
                            );
                            setState("success");
                        } catch (error) {
                            report(error);
                            setState("error");
                        } finally {
                            copying.current = false;
                        }
                        timer.current = setTimeout(
                            () => setState("idle"),
                            1000,
                        );
                    },
                },
                native.createElement(native.icon, {
                    icon: {
                        assets: {
                            16: native[`${icon}16`],
                            20: native[`${icon}20`],
                        },
                    },
                    size: message ? "secondary" : "leading",
                    "aria-hidden": true,
                }),
            );
        }
        function CopyHeader({
            dot = false,
            allowsThreadContentOverlap,
            ...props
        }) {
            const enabled = native.useSyncExternalStore(
                subscribeCopy,
                getCopyEnabled,
                getCopyEnabled,
            );
            if (!enabled) return null;
            return native.createElement(
                native.ErrorBoundary,
                null,
                native.createElement(
                    native.shell.HeaderAction,
                    {
                        actionId: "checker-next-copy-conversation",
                        align: "end",
                        order: 1,
                        unifiedSlotPosition: dot ? "thread" : undefined,
                        allowsThreadContentOverlap,
                    },
                    native.createElement(
                        native.shell.HeaderToolbar.Actions,
                        null,
                        native.createElement(CopyButton, props),
                    ),
                ),
            );
        }
        function DotCopy({ controller, header = false }) {
            const timeline = native.useMemo(
                () =>
                    controller.services.conversations.timeline(
                        controller.roomId,
                    ),
                [controller],
            );
            const state = native.useSyncExternalStore(
                timeline.subscribe,
                timeline.getSnapshot,
                timeline.getSnapshot,
            );
            const enabled = native.useSyncExternalStore(
                subscribeCopy,
                getCopyEnabled,
                getCopyEnabled,
            );
            if (!enabled) return null;
            return native.createElement(header ? CopyHeader : CopyButton, {
                dot: header,
                disabled: state.messages.length === 0,
                getText: () => formatDotConversation(controller),
            });
        }
        const bridge = {
            register(values) {
                Object.assign(native, values);
                if (values.Component) {
                    native.ErrorBoundary = class extends values.Component {
                        state = { failed: false };
                        static getDerivedStateFromError() {
                            return { failed: true };
                        }
                        componentDidCatch(error) {
                            report(error);
                        }
                        render() {
                            return this.state.failed
                                ? null
                                : this.props.children;
                        }
                    };
                }
                if (values.intl) queueMicrotask(watchEnvironment);
            },
            formatDateToParts(value, options) {
                const key = native.intl;
                return key
                    ? appScope?.get(key)?.formatDateToParts(value, options)
                    : undefined;
            },
            sidebarNav(fn) {
                return function (props) {
                    const to = sidebarHref(props);
                    return native.createElement(
                        fn,
                        to && !props.to && !props.disabled
                            ? {
                                  ...props,
                                  to,
                                  onClick: props.onClick
                                      ? sidebarClick(props.onClick)
                                      : undefined,
                              }
                            : props,
                    );
                };
            },
            sidebarButton(fn) {
                return function (props) {
                    const button = fn(props);
                    const href = sidebarHref(props);
                    if (!href || button.props.disabled) return button;
                    const { type, disabled, onClick, ...attributes } =
                        button.props;
                    return native.createElement("a", {
                        ...attributes,
                        href,
                        onClick: onClick ? sidebarClick(onClick) : undefined,
                    });
                };
            },
            sidebarRow(fn) {
                return function (props) {
                    const href = sidebarHref(props);
                    if (!href || props.hasNavigationLink || props.isDisabled)
                        return native.createElement(fn, props);
                    const [content, ...actions] = props.children;
                    return native.createElement(
                        fn,
                        { ...props, hasNavigationLink: true },
                        native.createElement(
                            "a",
                            {
                                href,
                                draggable: false,
                                "data-interactive-row-link": true,
                                "aria-label": props["aria-label"],
                                "aria-labelledby": props["aria-labelledby"],
                                "aria-current": props.isActive
                                    ? "page"
                                    : undefined,
                                className:
                                    "flex min-w-0 flex-1 before:pointer-events-auto before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] focus-visible:before:outline focus-visible:before:outline-2 focus-visible:before:outline-offset-[-2px] focus-visible:before:outline-ring",
                            },
                            content,
                        ),
                        ...actions,
                    );
                };
            },
            projectHref: (id) => native.projectHref(id),
            libraryHref: (scope) => native.libraryHref(scope),
            scope(fn) {
                return after(fn, (_, scope) => {
                    if (scope.scope.__scopeBrand === "AppScope") {
                        appScope = scope;
                        if (!chatgptRuntimeReady) {
                            chatgptRuntimeReady = true;
                            queueMicrotask(updateChatgptInjectionStatus);
                        }
                        queueMicrotask(watchEnvironment);
                    }
                    if (
                        scope.scope.__scopeBrand === "ComposerScope" &&
                        scope.value.kind === "new" &&
                        scope.value.entrypoint === "home"
                    ) {
                        const route = scope.getOwnValue(native.routeScope);
                        if (
                            route.pathname === location.pathname &&
                            (route.search ?? "") === location.search
                        )
                            homeScope = { pathname: route.pathname, scope };
                    }
                });
            },
            picker(fn) {
                return function (props) {
                    const scope = native.useScope(native.composerScope);
                    const models = native.useMemo(() => {
                        const models = new Map();
                        for (const [slug, model] of Object.entries(
                            props.models?.modelConfigBySlug ?? {},
                        )) {
                            models.set(slug, {
                                slug,
                                title: model.title ?? slug,
                                thinkingEfforts: (
                                    model.thinkingEfforts ?? []
                                ).map((effort) => effort.thinking_effort),
                            });
                        }
                        for (const option of modelOptions(props.models)) {
                            let model = models.get(option.slug);
                            if (!model) {
                                model = {
                                    slug: option.slug,
                                    title:
                                        option.modelTitle ??
                                        option.title ??
                                        option.slug,
                                    thinkingEfforts: [],
                                };
                                models.set(option.slug, model);
                            }
                            if (
                                option.thinkingEffort != null &&
                                !model.thinkingEfforts.includes(
                                    option.thinkingEffort,
                                )
                            )
                                model.thinkingEfforts.push(
                                    option.thinkingEffort,
                                );
                        }
                        return [...models.values()];
                    }, [props.models]);
                    useControl(scope, {
                        kind: "chat",
                        active: true,
                        conversationId: props.conversationId,
                        selectedModel: props.selectedModel,
                        isWorkConversation: props.isTppConversation,
                        catalog: props.models,
                        models,
                        loading: Boolean(props.isLoading),
                        sourceError: props.isError ? "模型目录读取失败" : null,
                        onModelChange: props.onModelChange,
                        onThinkingEffortChange: props.onThinkingEffortChange,
                    });
                    return native.createElement(fn, props);
                };
            },
            dotPicker(fn) {
                return function (props) {
                    const scope = native.useScope(native.routeScope);
                    const conversationId = props.conversationId ?? null;
                    const active = props.active && conversationId !== null;
                    const hostId = native.useValue(
                        native.threadHost,
                        conversationId,
                    );
                    const key = native.useMemo(
                        () =>
                            active
                                ? { hostId, threadId: conversationId }
                                : null,
                        [active, hostId, conversationId],
                    );
                    const settings = native.useValue(
                        native.threadSettings,
                        key,
                    );
                    const model = settings?.model?.trim() || null;
                    const additionalModels = native.useMemo(
                        () => new Set(model ? [model] : []),
                        [model],
                    );
                    const catalog = native.useThreadModels({
                        hostId,
                        enabled: active,
                        additionalAvailableModels: additionalModels,
                    });
                    const models = native.useMemo(
                        () =>
                            (catalog.data?.models ?? []).map((model) => ({
                                slug: model.model,
                                title: model.displayName,
                                thinkingEfforts:
                                    model.supportedReasoningEfforts.map(
                                        (effort) => effort.reasoningEffort,
                                    ),
                            })),
                        [catalog.data],
                    );
                    useControl(scope, {
                        kind: "dot",
                        active,
                        conversationId,
                        hostId,
                        selectedModel: {
                            slug: model,
                            thinkingEffort: settings?.reasoningEffort,
                        },
                        models,
                        loading: catalog.isPending,
                        sourceError: catalog.error
                            ? String(catalog.error)
                            : null,
                    });
                    return native.createElement(fn, props);
                };
            },
            dotController(fn) {
                return after(fn, (_, controller) => {
                    dotControllers.set(controller.roomId, controller);
                    controller.dispose = after(controller.dispose, () => {
                        if (
                            dotControllers.get(controller.roomId) === controller
                        )
                            dotControllers.delete(controller.roomId);
                    });
                    queueMicrotask(() =>
                        pageWindow.dispatchEvent(
                            new pageWindow.Event(CHATGPT_COPY_EVENT),
                        ),
                    );
                });
            },
            dotHeader(fn, Menu) {
                return function (props) {
                    const getController = () =>
                        dotControllers.get(props.roomId);
                    const controller = native.useSyncExternalStore(
                        subscribeCopy,
                        getController,
                        getController,
                    );
                    const result = fn(props);
                    if (!controller) return result;
                    const copy = native.createElement(
                        native.ErrorBoundary,
                        { key: "checker-next-copy" },
                        native.createElement(DotCopy, { controller }),
                    );
                    let inserted = false;
                    const children = result.props.children.map((child) => {
                        if (
                            child?.props?.actionId !== "orbit-messaging-actions"
                        )
                            return child;
                        const group = child.props.children;
                        const actions = group.props.children.flatMap(
                            (action) => {
                                if (action?.type !== Menu) return [action];
                                inserted = true;
                                return [action, copy];
                            },
                        );
                        return native.cloneElement(
                            child,
                            {},
                            native.cloneElement(group, {}, ...actions),
                        );
                    });
                    return native.createElement(
                        native.Fragment,
                        null,
                        native.cloneElement(result, {}, ...children),
                        !inserted &&
                            native.createElement(
                                native.ErrorBoundary,
                                null,
                                native.createElement(DotCopy, {
                                    controller,
                                    header: true,
                                }),
                            ),
                    );
                };
            },
            dotMessage(fn) {
                return function (props) {
                    dotMessageContext ??= native.createContext(null);
                    return native.createElement(
                        dotMessageContext.Provider,
                        { value: props.message },
                        native.createElement(fn, props),
                    );
                };
            },
            dotActions(fn) {
                return function (props) {
                    const message = native.useContext(dotMessageContext);
                    const enabled = native.useSyncExternalStore(
                        subscribeCopy,
                        getCopyEnabled,
                        getCopyEnabled,
                    );
                    const actions = fn(props);
                    if (!message || !enabled) return actions;
                    const copy = native.createElement(
                        native.ErrorBoundary,
                        { key: "checker-next-copy" },
                        native.createElement(CopyButton, {
                            message: true,
                            getText: () => {
                                if (!message.text)
                                    throw new Error("消息中没有可复制的正文");
                                return message.text;
                            },
                        }),
                    );
                    return native.cloneElement(
                        actions,
                        {},
                        ...(message.self
                            ? [copy, ...actions.props.children]
                            : [...actions.props.children, copy]),
                    );
                };
            },
            analysis(fn) {
                return function (props) {
                    const enabled = native.useSyncExternalStore(
                        subscribeAutoCollapse,
                        getAutoCollapse,
                        getAutoCollapse,
                    );
                    return native.createElement(
                        fn,
                        enabled
                            ? {
                                  ...props,
                                  allowCollapseBeforeFinal: true,
                                  preventAutoCollapse: false,
                                  forceExpanded: false,
                                  disableCollapse: false,
                              }
                            : props,
                    );
                };
            },
            turns(fn) {
                return after(fn, ([props]) => {
                    const conversation = {
                        id: props.conversationId,
                        isWorkConversation: props.isWorkConversation,
                        copyReady: props.renderedTurns.length > 0,
                        turns:
                            props.isReadOnly || props.isTemporaryChat
                                ? props.renderedTurns
                                : undefined,
                    };
                    conversations.set(conversation.id, conversation);
                });
            },
            chatView(fn) {
                return function (props) {
                    const result = fn(props);
                    const id = props.conversationId;
                    const conversation = conversations.get(id);
                    native.useLayoutEffect(() => {
                        if (conversation) conversations.set(id, conversation);
                        return () => {
                            if (conversations.get(id) === conversation)
                                conversations.delete(id);
                        };
                    }, [id, conversation]);
                    return native.createElement(
                        native.Fragment,
                        null,
                        result,
                        !props.isInlinePreview &&
                            !props.workspace &&
                            getChatgptPage() === "chat" &&
                            native.createElement(CopyHeader, {
                                allowsThreadContentOverlap:
                                    !conversation?.isWorkConversation,
                                disabled: !conversation?.copyReady,
                                getText: () =>
                                    formatChatgptConversation(
                                        bridge.getTurns(
                                            id,
                                            chatgptCopyDetailsEnabled,
                                        ),
                                        id,
                                    ),
                            }),
                    );
                };
            },
            conversation(fn) {
                return function (scope, conversation, ...args) {
                    const origin = origins.get(conversation.conversationId);
                    return fn(
                        scope,
                        origin === undefined
                            ? conversation
                            : { ...conversation, conversationOrigin: origin },
                        ...args,
                    );
                };
            },
            query(fn) {
                function wrapped(...args) {
                    const query = fn(...args);
                    return {
                        ...query,
                        queryFn: async (...args) =>
                            applyOrigin(await query.queryFn(...args)),
                    };
                }
                return wrapped;
            },
            models(fn) {
                return function (...args) {
                    return extendModels(fn.apply(this, args));
                };
            },
            message(fn, React, assistant = false) {
                const MessageId = assistant ? React.createContext(null) : null;
                function MessageInfo(props) {
                    const scope = appScope;
                    const { conversationId } = props;
                    const item = props.item;
                    const id = assistant
                        ? React.useContext(MessageId)
                        : (item.latestMessageId ??
                          item.serverMessageId ??
                          item.messageId);
                    const subscribe = React.useCallback(
                        (listener) => {
                            const stop = scope.watch((scope) => {
                                scope.get(native.mapping, conversationId);
                                listener();
                            });
                            pageWindow.addEventListener(
                                CHATGPT_MESSAGE_INFO_EVENT,
                                listener,
                            );
                            return () => {
                                stop();
                                pageWindow.removeEventListener(
                                    CHATGPT_MESSAGE_INFO_EVENT,
                                    listener,
                                );
                            };
                        },
                        [scope, conversationId],
                    );
                    const snapshot = () => {
                        if (!chatgptMessageInfoEnabled) return null;
                        const message = scope.get(
                            native.mapping,
                            conversationId,
                        )?.[id]?.message;
                        const metadata = message?.metadata ?? {};
                        return JSON.stringify([
                            message?.create_time ?? null,
                            assistant
                                ? (metadata.resolved_model_slug ??
                                  metadata.model_slug ??
                                  null)
                                : null,
                            assistant
                                ? (metadata.thinking_effort ?? null)
                                : null,
                            assistant
                                ? (metadata.default_model_slug ??
                                  metadata.model_slug ??
                                  null)
                                : null,
                        ]);
                    };
                    const data = React.useSyncExternalStore(
                        subscribe,
                        snapshot,
                        snapshot,
                    );
                    const [created, model, effort, requested] =
                        data === null ? [] : JSON.parse(data);
                    const time = created == null ? null : created * 1000;
                    if (time === null && !model)
                        return assistant
                            ? null
                            : React.createElement(fn, props);
                    if (!assistant)
                        return React.createElement(fn, {
                            ...props,
                            item: { ...item, sentAtMs: time },
                        });
                    const title = [
                        time === null ? null : formatAbsoluteTime(time),
                        model ? `响应模型：${model}` : null,
                        requested && requested !== model
                            ? `请求模型：${requested}`
                            : null,
                        effort ? `思考强度：${effort}` : null,
                    ]
                        .filter(Boolean)
                        .join("\n");
                    return React.createElement(
                        "span",
                        {
                            className:
                                "ms-2 flex min-w-0 max-w-full items-center gap-2 text-xs text-tertiary",
                            "data-checker-message-info": "",
                            title,
                        },
                        model
                            ? React.createElement(
                                  "span",
                                  { className: "truncate" },
                                  model,
                              )
                            : null,
                        effort
                            ? React.createElement(
                                  "span",
                                  { className: "shrink-0" },
                                  effort,
                              )
                            : null,
                        time === null
                            ? null
                            : React.createElement(native.messageTime, {
                                  className: "shrink-0",
                                  sentAtMs: time,
                                  title,
                              }),
                    );
                }
                return function (props) {
                    if (assistant) {
                        const result = fn({
                            ...props,
                            sourcesAction: React.createElement(
                                React.Fragment,
                                null,
                                props.sourcesAction,
                                appScope
                                    ? React.createElement(MessageInfo, {
                                          conversationId: props.conversationId,
                                      })
                                    : null,
                            ),
                        });
                        return React.createElement(
                            MessageId.Provider,
                            {
                                value:
                                    result?.props.messageId ??
                                    props.assistantItem?.latestMessageId ??
                                    props.assistantItem?.messageId,
                            },
                            result,
                        );
                    }
                    return React.createElement(
                        appScope && props.item?.type === "user-message"
                            ? MessageInfo
                            : fn,
                        props,
                    );
                };
            },
            timeFormat(fn) {
                return function (props) {
                    const { intl } = props;
                    return fn({
                        ...props,
                        intl: {
                            ...intl,
                            formatDate: (value, options) =>
                                intl.formatDate(value, {
                                    ...options,
                                    timeZone: intl.timeZone,
                                }),
                        },
                    });
                };
            },
            time(fn, jsx) {
                return function (props) {
                    const result = fn(props);
                    return result
                        ? jsx(
                              result.type,
                              {
                                  ...result.props,
                                  title:
                                      props.title ??
                                      formatAbsoluteTime(props.sentAtMs),
                              },
                              result.key,
                          )
                        : result;
                };
            },
            approval(fn, React) {
                return function (props) {
                    const item = React.useMemo(() => {
                        if (!chatgptApprovalEnabled) return props.item;
                        const request = props.item.request;
                        const body = request?.body;
                        const actions = body?.actions ?? [];
                        const action =
                            actions.find((action) => action.allow_once) ??
                            actions.find(
                                (action) =>
                                    action.name === "allow_once" &&
                                    action.allow,
                            ) ??
                            actions.find(
                                (action) =>
                                    action.name !== "approve_for_me" &&
                                    action.allow,
                            );
                        const allow = action?.allow_once ?? action?.allow;
                        if (!allow) return props.item;
                        const elicitation = body.codex_mcp_elicitation;
                        return {
                            ...props.item,
                            allowTargetMessageId: allow.target_message_id,
                            request: {
                                ...request,
                                body: {
                                    ...body,
                                    actions: [
                                        {
                                            ...action,
                                            name: "allow_once",
                                            allow,
                                            split_action_options: [],
                                        },
                                    ],
                                    codex_mcp_elicitation:
                                        elicitation == null
                                            ? elicitation
                                            : {
                                                  ...elicitation,
                                                  approval: { persist: [] },
                                              },
                                },
                            },
                        };
                    }, [props.item, chatgptApprovalEnabled]);
                    const card = fn(
                        item === props.item ? props : { ...props, item },
                    );
                    const scope = appScope;
                    const id = props.conversationId;
                    const subscribe = React.useCallback(
                        (listener) => {
                            const stop = scope.watch((scope) => {
                                scope.get(native.status, id);
                                listener();
                            });
                            pageWindow.addEventListener(
                                CHATGPT_APPROVAL_EVENT,
                                listener,
                            );
                            return () => {
                                stop();
                                pageWindow.removeEventListener(
                                    CHATGPT_APPROVAL_EVENT,
                                    listener,
                                );
                            };
                        },
                        [scope, id],
                    );
                    const snapshot = () =>
                        chatgptApprovalEnabled
                            ? scope.get(native.status, id)
                            : null;
                    const status = React.useSyncExternalStore(
                        subscribe,
                        snapshot,
                        snapshot,
                    );
                    const attempted = React.useRef(null);
                    const { actions } = card.props;
                    const target = item.allowTargetMessageId;
                    const automatic =
                        status !== null &&
                        status !== "error" &&
                        !actions.approveDisabled;
                    const hidden =
                        automatic &&
                        (attempted.current !== target || actions.isLoading);
                    React.useEffect(() => {
                        if (
                            !automatic ||
                            status !== "idle" ||
                            actions.isLoading ||
                            attempted.current === target
                        )
                            return;
                        attempted.current = target;
                        actions.onApprove();
                    }, [automatic, actions, target, status]);
                    return hidden ? null : card;
                };
            },
            allows: (slug) => customModels.has(slug),
            homeOrigin: () => homeOrigin,
            refreshAccounts() {
                return appScope?.queryClient.invalidateQueries(
                    {
                        predicate: ({ queryKey: [category, key] }) =>
                            (category === "accounts" && key === "check") ||
                            (category === "usage-settings" &&
                                key === "accounts-check"),
                    },
                    { throwOnError: true },
                );
            },
            getTurns(conversationId, includeDetails = false) {
                const conversation = conversations.get(conversationId);
                const scope = appScope;
                if (!conversation) throw new Error("当前会话尚未载入");
                if (!scope && (includeDetails || !conversation.turns))
                    throw new Error("当前会话状态尚未载入");
                if (includeDetails) {
                    const messages = native.messages({
                        current_node: scope.get(
                            native.currentNode,
                            conversation.id,
                        ),
                        mapping: scope.get(native.mapping, conversation.id),
                    });
                    const turns = [];
                    for (const message of messages) {
                        const role = message.author.role;
                        if (!["user", "assistant", "tool"].includes(role))
                            continue;
                        if (role === "user" || turns.length === 0)
                            turns.push({ turn: { items: [] } });
                        turns.at(-1).turn.items.push({
                            type:
                                role === "user"
                                    ? "user-message"
                                    : "assistant-message",
                            source: message,
                        });
                    }
                    return turns;
                }
                return (
                    conversation.turns ??
                    scope.get(native.turns, conversation.id)
                );
            },
            getMessageText(item, conversationId) {
                if (item.source) {
                    const message = item.source;
                    const { content, metadata = {} } = message;
                    if (content.content_type === "thoughts")
                        return content.thoughts
                            .map(
                                (thought) => thought.content || thought.summary,
                            )
                            .filter(Boolean)
                            .join("\n\n");
                    if (content.content_type === "reasoning_recap")
                        return content.content;
                    const tool =
                        message.author.role === "tool"
                            ? message.author.name
                            : message.recipient !== "all"
                              ? message.recipient
                              : null;
                    if (tool) {
                        let text = native.messageContent(message);
                        if (text) {
                            try {
                                const value = JSON.parse(text);
                                text =
                                    typeof value?.text === "string"
                                        ? value.text
                                        : JSON.stringify(value, null, 2);
                            } catch {}
                        } else {
                            const groups =
                                metadata.inline_cot_expandable_content
                                    ?.search_result_groups ??
                                metadata.search_result_groups ??
                                [];
                            text = [
                                native.searchQueries(metadata).join("\n"),
                                ...groups
                                    .flatMap((group) => group.entries ?? [])
                                    .map((entry) =>
                                        [entry.title, entry.url, entry.snippet]
                                            .filter(Boolean)
                                            .join("\n"),
                                    ),
                            ]
                                .filter(Boolean)
                                .join("\n\n");
                        }
                        return text ? `${tool}\n${text}` : "";
                    }
                    if (chatgptCopyRawEnabled)
                        return native.messageContent(message);
                    const rendered = native.renderMessage(message);
                    return rendered
                        ? messageText({
                              content: rendered.markdown,
                              contentReferences: rendered.contentReferences,
                          })
                        : "";
                }
                if (
                    chatgptCopyRawEnabled &&
                    ["user-message", "assistant-message"].includes(item.type)
                ) {
                    const mapping = appScope?.get(
                        native.mapping,
                        conversationId,
                    );
                    return (item.sourceMessageIds ?? [item.messageId])
                        .map((id) => {
                            const message = mapping?.[id]?.message;
                            if (!message) throw new Error("原始消息尚未载入");
                            return native.messageContent(message);
                        })
                        .filter(Boolean)
                        .join("\n\n");
                }
                if (item.type === "user-message") return item.message;
                if (item.type === "assistant-message") {
                    if (!native.messageText)
                        throw new Error("原生复制接口尚未载入");
                    return messageText(item);
                }
                return "";
            },
        };
        pageWindow.__checkerNextRuntimeModelBridge = bridge;
        pageWindow.addEventListener(
            "checker-next-runtime-model-request",
            () => {
                lastState = undefined;
                scheduleState();
            },
        );
        pageWindow.addEventListener(
            "checker-next-runtime-model-set",
            async (event) => {
                const active = activeControl();
                const conversationId = active?.conversationId;
                try {
                    const detail = event.detail;
                    if (active) active.error = null;
                    scheduleState();
                    if (!active) throw new Error("当前页面的模型控件尚未载入");
                    if (active.kind === "dot") {
                        const settings = {};
                        if (typeof detail.model === "string" && detail.model)
                            settings.model = detail.model;
                        if (Object.hasOwn(detail, "thinkingEffort"))
                            settings.effort = detail.thinkingEffort;
                        if (Object.keys(settings).length === 0) return;
                        const applied = await native
                            .threadClient(active.scope, active.hostId)
                            .updateThreadSettingsForNextTurn(
                                active.conversationId,
                                settings,
                            );
                        if (!applied) throw new Error("线程模型设置未应用");
                        return;
                    }
                    if (detail.origin === "chat" || detail.origin === "work") {
                        const conversation = conversations.get(conversationId);
                        if (getChatgptPage() === "chat") {
                            if (!conversation || !appScope)
                                throw new Error("当前会话状态尚未载入");
                            const origin =
                                detail.origin === "work" ? "tpp" : null;
                            origins.set(conversation.id, origin);
                            const serverId = appScope.get(
                                native.serverId,
                                conversation.id,
                            );
                            if (serverId) origins.set(serverId, origin);
                            native.setOrigin(appScope, conversation.id, origin);
                            appScope.queryClient.setQueryData(
                                [
                                    "chatgpt-conversation",
                                    serverId ?? conversation.id,
                                ],
                                applyOrigin,
                            );
                        } else {
                            if (homeScope?.pathname !== location.pathname)
                                throw new Error("新会话状态尚未载入");
                            homeOrigin = detail.origin;
                            native.setHome(homeScope.scope, detail.origin);
                        }
                    }
                    let model;
                    if (typeof detail.model === "string" && detail.model) {
                        const option = native.resolveModel(active.catalog, {
                            slug: detail.model,
                            thinkingEffort: null,
                        });
                        model = {
                            slug: detail.model,
                            thinkingEffort:
                                active.catalog
                                    ?.defaultThinkingEffortByModelSlug?.[
                                    detail.model
                                ] ??
                                option?.thinkingEffort ??
                                null,
                            versionId: native.modelVersion(
                                active.catalog,
                                detail.model,
                            ),
                        };
                    }
                    if (Object.hasOwn(detail, "thinkingEffort")) {
                        model = {
                            ...(model ?? active.selectedModel),
                            thinkingEffort: detail.thinkingEffort,
                        };
                    }
                    if (model) {
                        let efforts = customModels.get(model.slug);
                        if (!efforts) {
                            efforts = new Set();
                            customModels.set(model.slug, efforts);
                        }
                        const effort = model.thinkingEffort ?? null;
                        if (!efforts.has(effort)) {
                            efforts.add(effort);
                            active.scope.queryClient.setQueriesData(
                                {
                                    predicate: ({ queryKey }) =>
                                        [
                                            "chatgpt-models",
                                            "chatgpt-tpp-models",
                                        ].includes(queryKey[0]),
                                },
                                (data) => {
                                    const extended = extendModels(data);
                                    return extended === data
                                        ? undefined
                                        : extended;
                                },
                            );
                        }
                        if (
                            !detail.model &&
                            Object.hasOwn(detail, "thinkingEffort") &&
                            active.onThinkingEffortChange
                        )
                            await active.onThinkingEffortChange(
                                detail.thinkingEffort,
                            );
                        else await active.onModelChange(model);
                    }
                    scheduleState();
                } catch (error) {
                    report(error);
                    if (
                        active &&
                        activeControl() === active &&
                        active.conversationId === conversationId
                    ) {
                        active.error = String(error);
                        scheduleState();
                    }
                }
            },
        );
        pageWindow.navigation.addEventListener(
            "currententrychange",
            scheduleState,
        );
    }

    function compileChatgptModule(source) {
        const script = document.createElement("script");
        script.nonce = document.querySelector("script[nonce]")?.nonce ?? "";
        script.textContent = `"use strict";globalThis.__checkerNextModule=Object.values({${source}})[0];`;
        try {
            document.head.append(script);
            const factory = pageWindow.__checkerNextModule;
            if (typeof factory !== "function")
                throw new Error("页面未能执行模块补丁");
            return factory;
        } finally {
            script.remove();
            delete pageWindow.__checkerNextModule;
        }
    }

    function getChatgptModuleExports(source, gettersOnly = false) {
        const [, exports, require] = source.match(
            /^[^(]+\([^,]+,([^,]+),([^)]*)\)\{/,
        );
        const pattern = new RegExp(
            `${RegExp.escape(require)}\\.d\\(${RegExp.escape(exports)},\\{([^{}]*)\\}(?:,\\{([^{}]*)\\})?`,
            "g",
        );
        return Object.fromEntries(
            [...source.matchAll(pattern)].flatMap((match) =>
                (gettersOnly ? [match[1]] : [match[1], match[2] ?? ""]).flatMap(
                    (table) =>
                        [
                            ...table.matchAll(
                                /(?:^|,)([\w$]+):(?:\(\)=>)?([\w$.]+)/g,
                            ),
                        ].map((entry) => [entry[1], entry[2]]),
                ),
            ),
        );
    }

    function createChatgptModulePatches() {
        const patches = [];
        const bindings = {};
        const module = (label, predicate, apply, page) =>
            patches.push({ label, predicate, apply, page });
        const single = (items, label) => {
            if (items.length !== 1)
                throw new Error(`${label}匹配到 ${items.length} 个结果`);
            return items[0];
        };
        const exported = (target, label, predicate) => {
            if (!target.functions) {
                const declarations = new Set(
                    [...target.source.matchAll(/\bfunction\s+([\w$]+)\(/g)].map(
                        (match) => match[1],
                    ),
                );
                const members = Object.entries(
                    getChatgptModuleExports(target.source, true),
                )
                    .filter(([, name]) => declarations.has(name))
                    .map(([key, name]) => `${JSON.stringify(key)}:${name}`)
                    .join(",");
                // 函数声明在入口前完成提升，提前返回即可读取其源码。
                target.functions = compileChatgptModule(
                    target.source.replace("{", `{return {${members}};`),
                )();
            }
            const matches = Object.entries(target.functions).filter(
                ([exportName, fn]) =>
                    typeof predicate === "string"
                        ? exportName === predicate
                        : predicate(fn.toString()),
            );
            const [exportName, fn] = single(
                [
                    ...new Map(
                        matches.map((item) => [item[1].name, item]),
                    ).values(),
                ],
                label,
            );
            return { exportName, name: fn.name, toString: () => fn.toString() };
        };
        const append = (target, addition) => {
            target.source = `${target.source.slice(0, -1)};${addition}}`;
        };
        const replace = (target, from, to) => {
            if (!target.source.includes(from))
                throw new Error("原生函数定义未匹配");
            target.source = target.source.replace(from, to);
        };
        const api = "globalThis.__checkerNextRuntimeModelBridge";
        const fakePlan = `localStorage.getItem(${JSON.stringify(CHATGPT_FAKE_PLAN_ENABLED_KEY)})==="true"?localStorage.getItem(${JSON.stringify(CHATGPT_FAKE_PLAN_KEY)})||"pro":""`;

        module(
            "国际化状态模块",
            (source) =>
                source.includes('locale:"en",messages:{}') &&
                !source.includes(".formatMessage"),
            (intl) => {
                const [, value] = single(
                    Object.entries(getChatgptModuleExports(intl.source)),
                    "国际化状态接口",
                );
                append(intl, `${api}.register({intl:${value}});`);
            },
        );

        module(
            "响应式状态模块",
            (source) =>
                source.includes("getOwnValue") &&
                source.includes("createSubscriberStore") &&
                source.includes("Missing parent scope"),
            (scopes) => {
                const useScope = exported(
                    scopes,
                    "状态作用域接口",
                    (source) =>
                        source.includes("getOwnValue") &&
                        source.includes("useContext") &&
                        source.includes(".watch="),
                );
                bindings.useScope = [scopes.id, useScope.exportName];
                const useValue = exported(
                    scopes,
                    "状态订阅接口",
                    (source) =>
                        source.includes("cacheKey") &&
                        source.includes(".enabled") &&
                        source.includes("useLayoutEffect"),
                );
                bindings.useValue = [scopes.id, useValue.exportName];
                const react = single(
                    [
                        ...useScope
                            .toString()
                            .matchAll(/\(0,([\w$]+)\.useContext\)/g),
                    ],
                    "React 模块",
                )[1];
                append(
                    scopes,
                    `${api}.register({useMemo:${react}.useMemo,useRef:${react}.useRef,useState:${react}.useState,useLayoutEffect:${react}.useLayoutEffect,createElement:${react}.createElement,createContext:${react}.createContext,useContext:${react}.useContext,cloneElement:${react}.cloneElement,Fragment:${react}.Fragment,Component:${react}.Component,useSyncExternalStore:${react}.useSyncExternalStore});${useScope.name}=${api}.scope(${useScope.name});`,
                );
            },
        );

        module(
            "按钮组件模块",
            (source) =>
                source.includes("uniformAtMobile:") &&
                source.includes("sizingLabels:"),
            (button) => {
                const render = exported(button, "按钮组件", (source) =>
                    /^function [\w$]+\([\w$]+\)\{let [^{}]*;return /.test(
                        source,
                    ),
                );
                bindings.button = [button.id, render.exportName];
            },
        );

        module(
            "图标组件模块",
            (source) =>
                source.includes("icon16:") && source.includes(".CompactSource"),
            (icon) => {
                const render = exported(icon, "图标组件", (source) =>
                    source.includes('"assets"in'),
                );
                bindings.icon = [icon.id, render.exportName];
            },
        );

        for (const [name, asset] of [
            ["copy16", "square-on-square-light-16"],
            ["copy20", "square-on-square-light-20"],
            ["copied16", "checkmark-lg-light-16"],
            ["copied20", "checkmark-lg-light-20"],
            ["copyError16", "circle-exclamation-mark-light-16"],
            ["copyError20", "circle-exclamationmark-light-20"],
        ]) {
            module(
                asset,
                (source) => source.includes(`={kind:"sprite",name:"${asset}"`),
                (icon) => {
                    const [, exportName] = single(
                        [
                            ...icon.source.matchAll(
                                /[\w$]+\.([\w$]+)=\{kind:"sprite",name:/g,
                            ),
                        ],
                        "图标资源",
                    );
                    bindings[name] = [icon.id, exportName];
                },
            );
        }

        module(
            "侧栏导航组件模块",
            (source) =>
                source.includes("sidebar.navItem.unread") &&
                source.includes("excludeFromNavigation:"),
            (navigation) => {
                const item = exported(navigation, "侧栏导航项", (source) =>
                    source.includes("sidebar.navItem.unread"),
                );
                append(
                    navigation,
                    `${item.name}=${api}.sidebarNav(${item.name});`,
                );
            },
        );

        module(
            "侧栏行组件模块",
            (source) =>
                source.includes("hasNavigationLink:") &&
                source.includes("data-sidebar-cycle-item"),
            (row) => {
                const render = exported(row, "侧栏行", (source) =>
                    source.includes("hasNavigationLink:"),
                );
                append(
                    row,
                    `${render.name}=${api}.sidebarRow(${render.name});`,
                );
            },
        );

        const sidebarButton = /let ([\w$]+)=[\w$]+=>\{let\{type:/;
        module(
            "侧栏按钮链接模块",
            (source) =>
                sidebarButton.test(source) && source.includes('"data-uniform"'),
            (button) => {
                const name = button.source.match(sidebarButton)[1];
                append(button, `${name}=${api}.sidebarButton(${name});`);
            },
        );

        module(
            "侧栏路由模块",
            (source) =>
                source.includes("destinationId:") &&
                source.includes('rail:"fixed"') &&
                source.includes("routeKind"),
            (routes) => {
                const [exportName] = single(
                    Object.entries(
                        getChatgptModuleExports(routes.source),
                    ).filter(
                        ([, name]) =>
                            !routes.source.includes(`function ${name}(`),
                    ),
                    "侧栏路由表",
                );
                bindings.sidebarRoutes = [routes.id, exportName];
            },
        );

        for (const [name, label, predicate, resolve] of [
            [
                "dotHref",
                "Dot 导航地址",
                (source) =>
                    source.includes('"/dots"') && source.includes("orbitId"),
                (source) =>
                    source.includes("encodeURIComponent") &&
                    !source.includes("/thread/"),
            ],
            [
                "projectHref",
                "项目导航地址",
                (source) => source.includes('"/g/:projectId/project"'),
                (source) => source.includes("}/project`"),
            ],
            [
                "libraryHref",
                "资料库导航地址",
                (source) => source.includes("library-display-preferences:"),
                (source) =>
                    source.includes('"/library"') &&
                    source.includes(".lastTab"),
            ],
        ]) {
            module(label, predicate, (routes) => {
                const href = exported(routes, label, resolve);
                bindings[name] = [routes.id, href.exportName];
            });
        }

        for (const [label, marker] of [
            ["侧栏导航入口模块", 'animatedIcon:"sidebar-new-chat"'],
            ["侧栏图标入口模块", "data-slate-sidebar-peek-area"],
        ]) {
            module(
                label,
                (source) =>
                    source.includes(marker) &&
                    source.includes("data-sidebar-destination"),
                (navigation) => {
                    navigation.source = navigation.source.replaceAll(
                        /"data-sidebar-destination":([\w$]+)\.id/g,
                        '"data-checker-next-href":$1.href,$&',
                    );
                },
            );
        }

        module(
            "新建聊天导航按钮模块",
            (source) =>
                source.includes("newChatMessage:") &&
                source.includes("disabled:") &&
                source.includes("staticIcon:"),
            (button) => {
                const [, start] = single(
                    [...button.source.matchAll(/onStartChat:([\w$]+)/g)],
                    "新建聊天操作",
                );
                replace(
                    button,
                    `onClick:${start}`,
                    `"data-checker-next-href":"/",onClick:${start}`,
                );
            },
        );

        const projectRow = /projectId:([\w$]+),actions:[\w$]+/g;
        module(
            "项目侧栏链接模块",
            (source) =>
                source.includes("onOpenProject:") &&
                source.includes("excludePinnedConversations:") &&
                /projectId:[\w$]+,actions:[\w$]+/.test(source),
            (project) => {
                const row = single(
                    [...project.source.matchAll(projectRow)],
                    "项目侧栏行",
                );
                replace(
                    project,
                    row[0],
                    `"data-checker-next-href":${api}.projectHref(${row[1]}),${row[0]}`,
                );
            },
        );

        module(
            "侧栏功能入口模块",
            (source) =>
                source.includes('animatedIcon:"sidebar-images"') &&
                source.includes('animatedIcon:"sidebar-library"'),
            (features) => {
                features.source = features.source.replaceAll(
                    /onSelect:(?:\(\)|[\w$]+)=>\{(?:[\w$]+\(\),)?[\w$]+\(("[^"\\]+"|[\w$]+\.[\w$]+)(?=[,)])/g,
                    "href:$1,$&",
                );
                features.source = features.source.replaceAll(
                    /onSelect:([\w$]+)=>\{\(0,[\w$]+\.[\w$]+\)\(([\w$]+),[\w$]+,\1\)\},onRestore:\(\)=>\(0,[\w$]+\.[\w$]+\)\(\2,"(library|sites)"\),isCurrentDestination:[\w$]+\.startsWith\(("[^"]+")\)/g,
                    (match, argument, scope, destination, path) =>
                        `href:${destination === "library" ? `${api}.libraryHref(${scope})` : path},${match}`,
                );
                features.source = features.source.replaceAll(
                    /onSelect:[\w$]+=>\{let [\w$]+=\(\)=>\{\(0,[\w$]+\.[\w$]+\)\([\w$]+,[\w$]+,([\w$]+),[\w$]+\.CodexPluginDirectoryEntrypoint\./g,
                    'href:$1?"/plugins":"/skills",$&',
                );
                features.source = features.source.replaceAll(
                    /onSelect:([\w$]+)=>\{[\w$]+\?[\w$]+\(([\w$]+\.[\w$]+),\{state:\1\}\):[\w$]+\.set\(/g,
                    "href:$2,$&",
                );
            },
        );

        module(
            "模型控件模块",
            (source) =>
                source.includes("xHighExperimentResetContextKey") &&
                source.includes("onThinkingEffortChange"),
            (picker) => {
                const renderPicker = exported(
                    picker,
                    "模型控件",
                    (source) =>
                        source.includes("xHighExperimentResetContextKey") &&
                        source.includes("onThinkingEffortChange"),
                );
                append(
                    picker,
                    `${renderPicker.name}=${api}.picker(${renderPicker.name});`,
                );
            },
        );

        module(
            "会话渲染模块",
            (source) =>
                source.includes('id:"pending-chatgpt-submit"') &&
                source.includes("timestampSeparatorAtMs"),
            (turns) => {
                const renderTurns = exported(turns, "会话内容接口", (source) =>
                    source.includes("timestampSeparatorAtMs"),
                );
                append(
                    turns,
                    `${renderTurns.name}=${api}.turns(${renderTurns.name});`,
                );
            },
            "chat",
        );

        module(
            "会话页面模块",
            (source) =>
                source.includes("ChatGptConversationPage:") &&
                source.includes("ChatGptSharedConversationPage:"),
            (page) => {
                const view = exported(page, "会话页面", (source) =>
                    /\{[^{}]*\bisInlinePreview:[^{}]*\}=[\w$]+/.test(source),
                );
                const source = view.toString();
                const serverId = single(
                    [
                        ...new Set(
                            [
                                ...source.matchAll(
                                    /serverConversationId:([\w$]+)/g,
                                ),
                            ].map((match) => match[1]),
                        ),
                    ],
                    "会话服务端 ID",
                );
                const [, selector] = single(
                    [
                        ...source.matchAll(
                            new RegExp(
                                `${RegExp.escape(serverId)}=\\(0,[\\w$]+\\.[\\w$]+\\)\\(([\\w$]+\\.[\\w$]+),[\\w$]+\\)`,
                                "g",
                            ),
                        ),
                    ],
                    "会话 ID 状态",
                );
                append(
                    page,
                    `${api}.register({serverId:${selector}});${view.name}=${api}.chatView(${view.name});`,
                );
            },
            "chat",
        );

        module(
            "Dots 消息状态模块",
            (source) =>
                source.includes(
                    "historyAnchor:void 0,newerLoading:!1,messages:[]",
                ) &&
                source.includes("services:{") &&
                source.includes("renderMessageFooter:"),
            (messages) => {
                const create = single(
                    [
                        ...messages.source.matchAll(
                            /historyAnchor:void 0,newerLoading:!1,messages:\[\][\s\S]*?function ([\w$]+)\(/g,
                        ),
                    ],
                    "Dots 消息控制器",
                )[1];
                append(messages, `${create}=${api}.dotController(${create});`);
            },
            "dot",
        );

        module(
            "Dots 消息组件模块",
            (source) =>
                source.includes("message-inline-actions--orbit") &&
                source.includes("className:`message-row ${"),
            (messages) => {
                const renderMessage = single(
                    [
                        ...messages.source.matchAll(
                            /function ([\w$]+)\(e\)\{(?:(?!function [\w$]+\()[\s\S])*?className:`message-row \$\{/g,
                        ),
                    ],
                    "Dots 消息行",
                )[1];
                const actions = single(
                    [
                        ...messages.source.matchAll(
                            /function ([\w$]+)\(e\)\{(?:(?!function [\w$]+\()[\s\S])*?`message-inline-actions\$\{/g,
                        ),
                    ],
                    "Dots 消息操作栏",
                )[1];
                append(
                    messages,
                    `${renderMessage}=${api}.dotMessage(${renderMessage});${actions}=${api}.dotActions(${actions});`,
                );
            },
            "dot",
        );

        module(
            "Dot 顶栏模块",
            (source) => source.includes('actionId:"orbit-messaging-actions"'),
            (header) => {
                const render = single(
                    [
                        ...header.source.matchAll(
                            /function ([\w$]+)\([\w$]+\)\{(?:(?!function [\w$]+\()[\s\S])*?actionId:"orbit-messaging-actions"/g,
                        ),
                    ],
                    "Dot 顶栏",
                )[1];
                const menu = single(
                    [
                        ...header.source.matchAll(
                            /function ([\w$]+)\([\w$]+\)\{(?:(?!function [\w$]+\()[\s\S])*?triggerButtonColor:"toolbar",triggerButtonSize:/g,
                        ),
                    ],
                    "Dot 更多操作",
                )[1];
                append(
                    header,
                    `${render}=${api}.dotHeader(${render},${menu});`,
                );
            },
            "dot",
        );

        module(
            "分析内容模块",
            (source) =>
                /\{[^{}]*\ballowCollapseBeforeFinal:[^{}]*\}=[\w$]+/.test(
                    source,
                ) &&
                source.includes("preventAutoCollapse:") &&
                source.includes("agentActivityProps:"),
            (analysis) => {
                const activity = exported(
                    analysis,
                    "分析内容组件",
                    (source) =>
                        /\{[^{}]*\ballowCollapseBeforeFinal:[^{}]*\}=[\w$]+/.test(
                            source,
                        ) && source.includes("persistedCollapsed:"),
                );
                append(
                    analysis,
                    `${activity.name}=${api}.analysis(${activity.name});`,
                );
            },
            "chat",
        );

        module(
            "页面布局模块",
            (source) =>
                source.includes("PaneHeaderRow:") &&
                source.includes("HeaderContextMenuItem:") &&
                source.includes("UnifiedTabStrip:"),
            (shell) => {
                const [exportName] = single(
                    Object.entries(getChatgptModuleExports(shell.source)),
                    "页面布局接口",
                );
                bindings.shell = [shell.id, exportName];
            },
        );

        module(
            "会话内容模块",
            (source) =>
                source.includes("context_truncation_continuation:") &&
                source.includes("getRenderTelemetry:") &&
                source.includes("isStreaming:") &&
                !source.includes("function "),
            (content) => {
                const [contentExport] = single(
                    Object.entries(getChatgptModuleExports(content.source)),
                    "会话内容选择器",
                );
                bindings.turns = [content.id, contentExport];
                const imports = Object.fromEntries(
                    [
                        ...content.source.matchAll(
                            /([\w$]+)=[\w$]+\("([^"]+)"\)/g,
                        ),
                    ].map((match) => [match[1], match[2]]),
                );
                for (const [name, field] of [
                    ["currentNode", "current_node"],
                    ["mapping", "mapping"],
                ]) {
                    const value = single(
                        [
                            ...content.source.matchAll(
                                new RegExp(`${field}:([\\w$]+)`, "g"),
                            ),
                        ],
                        field,
                    )[1];
                    const reference = single(
                        [
                            ...content.source.matchAll(
                                new RegExp(
                                    `(?:[,;])${RegExp.escape(value)}=[\\w$]+\\(([\\w$]+)\\.([\\w$]+),[\\w$]+\\)`,
                                    "g",
                                ),
                            ),
                        ],
                        name,
                    );
                    bindings[name] = [imports[reference[1]], reference[2]];
                }
                const status = single(
                    [
                        ...content.source.matchAll(
                            /isStreaming:\(0,[\w$]+\.[\w$]+\)\([\w$]+\(([\w$]+)\.([\w$]+),[\w$]+\)\)/g,
                        ),
                    ],
                    "响应状态接口",
                );
                bindings.status = [imports[status[1]], status[2]];
            },
        );

        module(
            "消息数据模块",
            (source) =>
                source.includes("is_visually_hidden_from_conversation") &&
                source.includes(".reverse().map(") &&
                source.includes(".search_model_queries"),
            (messages) => {
                for (const [name, predicate] of [
                    [
                        "messages",
                        (source) =>
                            source.includes(".current_node") &&
                            source.includes(".reverse().map("),
                    ],
                    [
                        "messageContent",
                        (source) =>
                            source.includes(".parts.map(") &&
                            source.includes(".text"),
                    ],
                    [
                        "searchQueries",
                        (source) => source.includes(".search_model_queries"),
                    ],
                ]) {
                    const fn = exported(messages, name, predicate);
                    bindings[name] = [messages.id, fn.exportName];
                }
            },
        );

        module(
            "消息文本模块",
            (source) =>
                source.includes("hasUserAttachmentPreview:") &&
                source.includes("sourceMarkdown:") &&
                source.includes("codex_file_citation_authoritative"),
            (messages) => {
                const renderMessage = exported(
                    messages,
                    "消息文本接口",
                    (source) =>
                        source.includes("hasUserAttachmentPreview:") &&
                        source.includes("sourceMarkdown:"),
                );
                bindings.renderMessage = [
                    messages.id,
                    renderMessage.exportName,
                ];
            },
        );

        module(
            "富文本正文模块",
            (source) => source.includes("fallbackMarkdownVersion:"),
            (markdown) => {
                const fallback = exported(
                    markdown,
                    "富文本 Markdown",
                    (source) => source.includes(".fallbackMarkdown"),
                );
                bindings.fallbackMarkdown = [markdown.id, fallback.exportName];
            },
        );

        module(
            "内容引用模块",
            (source) =>
                source.includes('"chatgpt-content-reference"') &&
                source.includes("content_references_by_file:"),
            (references) => {
                for (const [name, predicate] of [
                    [
                        "referenceSources",
                        (source) =>
                            source.includes(".fallback_items") &&
                            source.includes(".sources"),
                    ],
                    [
                        "referenceText",
                        (source) =>
                            source.includes(".alt") &&
                            source.includes(".prompt_text") &&
                            source.indexOf(".alt") < source.indexOf(".title"),
                    ],
                    [
                        "referenceUrl",
                        (source) =>
                            source.includes(".cloud_doc_url") &&
                            source.includes(".source_url"),
                    ],
                    [
                        "markerText",
                        (source) => source.includes(".payload.length"),
                    ],
                ]) {
                    const fn = exported(references, name, predicate);
                    bindings[name] = [references.id, fn.exportName];
                }
            },
        );

        module(
            "代码块正文模块",
            (source) =>
                source.includes("has_redundant_fences:") &&
                source.includes(".children"),
            (code) => {
                const content = exported(code, "代码块复制正文", (source) =>
                    source.includes("has_redundant_fences:"),
                );
                bindings.codeContent = [code.id, content.exportName];
            },
            "chat",
        );

        module(
            "Markdown 序列化模块",
            (source) =>
                source.includes('type:"link",url:') &&
                source.includes("resourceLink:!0"),
            (markdown) => {
                const link = exported(markdown, "Markdown 链接", (source) =>
                    source.includes("resourceLink:!0"),
                );
                bindings.markdownLink = [markdown.id, link.exportName];
                const [, serialize] = single(
                    [
                        ...link
                            .toString()
                            .matchAll(/\(0,([\w$]+\.[\w$]+)\)\(\{type:"link"/g),
                    ],
                    "Markdown 序列化接口",
                );
                const [name, exportName] = serialize.split(".");
                const [, id] = single(
                    [
                        ...markdown.source.matchAll(
                            new RegExp(
                                `${RegExp.escape(name)}=[\\w$]+\\("([^"]+)"\\)`,
                                "g",
                            ),
                        ),
                    ],
                    "Markdown 序列化模块",
                );
                bindings.markdown = [id, exportName];
            },
        );

        for (const [name, brand] of [
            ["routeScope", "RouteScope"],
            ["composerScope", "ComposerScope"],
        ]) {
            module(
                brand,
                (source) => source.includes(`)("${brand}",`),
                (scope) => {
                    const symbol = single(
                        [
                            ...scope.source.matchAll(
                                new RegExp(
                                    `([\\w$]+)=\\(0,[\\w$]+\\.[\\w$]+\\)\\("${brand}",`,
                                    "g",
                                ),
                            ),
                        ],
                        brand,
                    )[1];
                    const [exportName] = single(
                        Object.entries(
                            getChatgptModuleExports(scope.source),
                        ).filter(([, value]) => value === symbol),
                        brand,
                    );
                    bindings[name] = [scope.id, exportName];
                },
            );
        }

        const threadSettings =
            /([\w$]+)=\(0,[\w$]+\.[\w$]+\)\("modelSettings"\)/;
        module(
            "任务模型状态模块",
            (source) => threadSettings.test(source),
            (state) => {
                const settings = state.source.match(threadSettings)[1];
                const host = single(
                    [
                        ...state.source.matchAll(
                            new RegExp(
                                `${RegExp.escape(settings)},\\{hostId:[\\w$]+\\?\\.managerHostId\\?\\?[\\w$]+\\(([\\w$.]+),[\\w$]+\\),threadId:[\\w$]+\\}`,
                                "g",
                            ),
                        ),
                    ],
                    "任务宿主状态",
                )[1];
                const exports = Object.entries(
                    getChatgptModuleExports(state.source),
                );
                for (const [name, symbol] of [
                    ["threadHost", host],
                    ["threadSettings", settings],
                ]) {
                    const [exportName] = single(
                        exports.filter(([, value]) => value === symbol),
                        `${name} 原生导出`,
                    );
                    bindings[name] = [state.id, exportName];
                }
            },
        );

        module(
            "任务客户端模块",
            (source) =>
                source.includes(".forHost(") &&
                source.includes(".rpc.dup()") &&
                source.includes(".onRpcBroken("),
            (client) => {
                const access = exported(
                    client,
                    "任务客户端接口",
                    (source) =>
                        source.includes(".forHost(") &&
                        source.includes(".rpc.dup()"),
                );
                bindings.threadClient = [client.id, access.exportName];
            },
        );

        module(
            "任务模型目录模块",
            (source) =>
                source.includes('"models","list"') &&
                source.includes("modelCatalogPath:") &&
                source.includes("additionalAvailableModels:"),
            (models) => {
                const useModels = exported(
                    models,
                    "任务模型目录接口",
                    (source) =>
                        source.includes("model_catalog_json") &&
                        source.includes("additionalAvailableModels") &&
                        source.includes("model_provider"),
                );
                bindings.useThreadModels = [models.id, useModels.exportName];
            },
        );

        module(
            "Dot 会话模块",
            (source) => source.includes("AeonMessagingRoomView:"),
            (dot) => {
                const renderDot = exported(
                    dot,
                    "Dot 会话接口",
                    "AeonMessagingRoomView",
                );
                append(
                    dot,
                    `${renderDot.name}=${api}.dotPicker(${renderDot.name});`,
                );
            },
            "dot",
        );

        const conversationOrigin =
            /function [\w$]+\([\w$]+,[\w$]+,([\w$]+)\)\{[^{}]*\{[^{}]*conversationOrigin:\1\?\?null\}/;
        module(
            "会话状态模块",
            (source) => conversationOrigin.test(source),
            (conversation) => {
                const setOrigin = exported(
                    conversation,
                    "会话模式接口",
                    (source) => conversationOrigin.test(source),
                );
                bindings.setOrigin = [conversation.id, setOrigin.exportName];
            },
        );

        const conversationStore =
            /\.set\([\w$.]+,([\w$]+)\.conversationId,\1\.conversationOrigin\)/;
        module(
            "会话存储模块",
            (source) => conversationStore.test(source),
            (conversation) => {
                const store = exported(conversation, "会话存储接口", (source) =>
                    conversationStore.test(source),
                );
                append(
                    conversation,
                    `${store.name}=${api}.conversation(${store.name});`,
                );
            },
        );

        module(
            "会话查询模块",
            (source) =>
                source.includes('queryKey:["chatgpt-conversation",') &&
                source.includes('queryKey:["chatgpt-shared-conversation",'),
            (queries) => {
                const query = exported(queries, "会话查询接口", (source) =>
                    source.includes('queryKey:["chatgpt-conversation",'),
                );
                append(queries, `${query.name}=${api}.query(${query.name});`);
            },
        );

        module(
            "首页模式模块",
            (source) =>
                source.includes('"codex_composer_mode"') &&
                source.includes('"oai-chat-surface-mode"') &&
                source.includes("persistedMode:"),
            (home) => {
                const setHome = exported(
                    home,
                    "首页模式接口",
                    (source) =>
                        /^function [\w$]+\([\w$]+,[\w$]+\)\{/.test(source) &&
                        source.includes('"chat"===') &&
                        source.includes(".set("),
                );
                const homeSource = setHome.toString();
                const homeGuard = single(
                    [
                        ...homeSource.matchAll(
                            /"chat"===([\w$]+)&&([\w$]+)\.get\(([\w$.]+)\)\|\|/g,
                        ),
                    ],
                    "首页模式选择条件",
                );
                replace(
                    home,
                    homeSource,
                    homeSource.replace(
                        homeGuard[0],
                        `${api}.homeOrigin()!=="chat"&&"chat"===${homeGuard[1]}&&${homeGuard[2]}.get(${homeGuard[3]})||`,
                    ),
                );
                const resolveHome = exported(
                    home,
                    "首页模式解析接口",
                    (source) =>
                        source.includes("persistedMode:") &&
                        source.includes("workOnlyModeEnabled:"),
                );
                const parameter = single(
                    [
                        ...resolveHome
                            .toString()
                            .matchAll(/^function [\w$]+\(([\w$]+)\)\{/g),
                    ],
                    "首页模式参数",
                )[1];
                replace(
                    home,
                    resolveHome.toString(),
                    resolveHome
                        .toString()
                        .replace(
                            "{",
                            `{if(${api}.homeOrigin()==="chat")${parameter}={...${parameter},workOnlyModeEnabled:false};`,
                        ),
                );
                bindings.setHome = [home.id, setHome.exportName];
            },
        );

        module(
            "模型解析模块",
            (source) =>
                source.includes("default_slider_upgrades") &&
                source.includes("workspace_model_policy") &&
                source.includes("modelConfigBySlug"),
            (models) => {
                const parseModels = exported(
                    models,
                    "模型目录解析接口",
                    (source) =>
                        source.includes("modelConfigBySlug:") &&
                        source.includes("internalOptions:") &&
                        source.includes("workspaceModelPolicy:"),
                );
                append(
                    models,
                    `${parseModels.name}=${api}.models(${parseModels.name});`,
                );
                const resolveModel = exported(
                    models,
                    "模型选项解析接口",
                    (source) =>
                        /^function [\w$]+\([\w$]+,[\w$]+\)\{/.test(source) &&
                        source.includes("defaultThinkingEffortByModelSlug") &&
                        source.includes("internalOptions"),
                );
                const modelVersion = exported(
                    models,
                    "模型版本解析接口",
                    (source) =>
                        source.includes("versionOptions?.find") &&
                        source.includes(".slugs.includes("),
                );
                bindings.resolveModel = [models.id, resolveModel.exportName];
                bindings.modelVersion = [models.id, modelVersion.exportName];
            },
        );

        module(
            "模型额度模块",
            (source) =>
                source.includes("using_default_model_slug") &&
                source.includes("work_subscription_required"),
            (limits) => {
                const resolveLimit = exported(
                    limits,
                    "模型额度解析接口",
                    (source) =>
                        source.includes("using_default_model_slug") &&
                        source.includes("versionId:"),
                );
                const limitModel = resolveLimit
                    .toString()
                    .match(/^function [\w$]+\([^,]+,([^,]+),/)?.[1];
                if (!limitModel) throw new Error("模型额度参数未匹配");
                replace(
                    limits,
                    resolveLimit.toString(),
                    resolveLimit
                        .toString()
                        .replace(
                            "{",
                            `{if(${api}.allows(${limitModel}.slug))return ${limitModel};`,
                        ),
                );
            },
        );

        module(
            "授权组件模块",
            (source) =>
                source.includes(".codex_mcp_elicitation?.kind") &&
                source.includes("approveDisabled:") &&
                source.includes("connectionRequired"),
            (approval) => {
                const render = single(
                    [
                        ...approval.source.matchAll(
                            /=([\w$]+);return [\w$]+\.request\?\.body\.codex_mcp_elicitation\?\.kind==="openaiForm"/g,
                        ),
                    ],
                    "授权组件",
                )[1];
                const react = single(
                    [
                        ...new Set(
                            [
                                ...approval.source.matchAll(
                                    /\(0,([\w$]+)\.useState\)/g,
                                ),
                            ].map((match) => match[1]),
                        ),
                    ],
                    "React 接口",
                );
                append(
                    approval,
                    `${render}=${api}.approval(${render},${react});`,
                );
            },
            "chat",
        );

        module(
            "消息操作模块",
            (source) =>
                source.includes("copyPlainTextFromSource") &&
                source.includes("suppressCopyTurnToClipboardAnalytics") &&
                source.includes("getCopyHtml"),
            (messages) => {
                const copyText = single(
                    [
                        ...messages.source.matchAll(
                            /([\w$]+)\?\.completed===!0\?([\w$]+)\(\1\):""/g,
                        ),
                    ],
                    "原生消息复制接口",
                )[2];
                const [, parse, extensions, mdastExtensions] = single(
                    [
                        ...messages.source.matchAll(
                            /\(0,([\w$]+\.[\w$]+)\)\([\w$]+\.content,\{extensions:\[\(0,([\w$]+\.[\w$]+)\)\(\)\],mdastExtensions:\[\(0,([\w$]+\.[\w$]+)\)\(\)\]\}\)/g,
                        ),
                    ],
                    "原生 Markdown 解析器",
                );
                const [, resolve] = single(
                    [
                        ...messages.source.matchAll(
                            /\(0,([\w$]+\.[\w$]+)\)\([\w$]+,[\w$]+\.contentReferences\)/g,
                        ),
                    ],
                    "原生引用解析接口",
                );
                append(
                    messages,
                    `${api}.register({messageText:${copyText},parseMarkdown:content=>${parse}(content,{extensions:[${extensions}()],mdastExtensions:[${mdastExtensions}()]}),resolveReference:${resolve}});`,
                );
                const react = single(
                    [
                        ...new Set(
                            [
                                ...messages.source.matchAll(
                                    /\(0,([\w$]+)\.useState\)/g,
                                ),
                            ].map((match) => match[1]),
                        ),
                    ],
                    "React 接口",
                );
                const renderMessage = single(
                    [
                        ...new Set(
                            [
                                ...messages.source.matchAll(
                                    /\(0,[\w$]+\.(?:jsx|jsxs)\)\(([\w$]+),\{([^{}]*)/g,
                                ),
                            ]
                                .filter((match) =>
                                    [
                                        "item:",
                                        "items:",
                                        "isMostRecentTurn:",
                                        "isReadOnly:",
                                    ].every((property) =>
                                        match[2].includes(property),
                                    ),
                                )
                                .map((match) => match[1]),
                        ),
                    ],
                    "消息组件",
                );
                const renderActions = single(
                    [
                        ...new Set(
                            [
                                ...messages.source.matchAll(
                                    /\(0,[\w$]+\.(?:jsx|jsxs)\)\(([\w$]+),\{([^{}]*)/g,
                                ),
                            ]
                                .filter((match) =>
                                    [
                                        "assistantItem:",
                                        "sourcesAction:",
                                        "actionRowRef:",
                                    ].every((property) =>
                                        match[2].includes(property),
                                    ),
                                )
                                .map((match) => match[1]),
                        ),
                    ],
                    "消息操作栏",
                );
                append(
                    messages,
                    `${renderMessage}=${api}.message(${renderMessage},${react});${renderActions}=${api}.message(${renderActions},${react},true);`,
                );
            },
            "chat",
        );

        module(
            "消息时间格式模块",
            (source) =>
                source.includes("sentAtMs:") &&
                source.includes("weekdayFormat:") &&
                source.includes(".formatDate("),
            (time) => {
                const format = exported(
                    time,
                    "消息时间格式接口",
                    (source) =>
                        source.includes("sentAtMs:") &&
                        source.includes("weekdayFormat:") &&
                        source.includes(".formatDate("),
                );
                append(
                    time,
                    `${format.name}=${api}.timeFormat(${format.name});`,
                );
            },
            "chat",
        );

        module(
            "消息时间模块",
            (source) =>
                source.includes("nowMs:") &&
                source.includes("weekdayFormat:") &&
                source.includes("text-xs text-tertiary"),
            (time) => {
                const render = exported(
                    time,
                    "消息时间组件",
                    (source) =>
                        source.includes("sentAtMs:") &&
                        source.includes("weekdayFormat:"),
                );
                const jsx = single(
                    [...render.toString().matchAll(/\(0,([\w$]+)\.jsx\)/g)],
                    "时间元素接口",
                )[1];
                append(
                    time,
                    `${render.name}=${api}.time(${render.name},${jsx}.jsx);`,
                );
                bindings.messageTime = [time.id, render.exportName];
            },
            "chat",
        );

        module(
            "账号会员模块",
            (source) =>
                source.includes("readAccounts") &&
                source.includes("queryClient.fetchQuery"),
            (accounts) => {
                const readAccounts = exported(
                    accounts,
                    "账号会员接口",
                    (source) =>
                        source.includes("readAccounts") &&
                        source.includes("queryClient.fetchQuery"),
                );
                append(
                    accounts,
                    `{const original=${readAccounts.name};${readAccounts.name}=async function(...args){const result=await original(...args),plan=${fakePlan};return plan?{...result,accounts:result.accounts.map(account=>({...account,plan_type:plan}))}:result}};`,
                );
            },
        );

        module(
            "完整账号模块",
            (source) =>
                source.includes(
                    "Account check is missing membership metadata",
                ) && source.includes('"/accounts/check/{version}"'),
            (fullAccounts) => {
                const result = single(
                    [
                        ...fullAccounts.source.matchAll(
                            /return ([\w$]+)\?\.\(([\w$]+)\),\2\b/g,
                        ),
                    ],
                    "完整账号查询结果",
                );
                replace(
                    fullAccounts,
                    result[0],
                    `return ${result[1]}?.(${result[2]}),((result,plan)=>plan?{...result,accounts:Object.fromEntries(Object.entries(result.accounts).map(([id,entry])=>[id,{...entry,account:{...entry.account,plan_type:plan}}]))}:result)(${result[2]},${fakePlan})`,
                );
            },
        );

        module(
            "账号会话模块",
            (source) =>
                source.includes("getBrowserChatGptDocumentAuth:") &&
                source.includes("readChatGptTokenClaims:"),
            (auth) => {
                const documentAuth = exported(
                    auth,
                    "账号会话接口",
                    "getBrowserChatGptDocumentAuth",
                );
                append(
                    auth,
                    `{const original=${documentAuth.name};${documentAuth.name}=function(...args){const auth=original(...args),plan=${fakePlan};return !plan||auth==null?auth:{...auth,planType:plan,targetingAccount:auth.targetingAccount==null?auth.targetingAccount:{...auth.targetingAccount,planType:plan}}}};`,
                );
            },
        );
        return { patches, bindings };
    }

    function createChatgptModuleData() {
        const single = (items, label) => {
            if (items.length !== 1)
                throw new Error(`${label}匹配到 ${items.length} 个结果`);
            return items[0];
        };
        return [
            {
                label: "会员类型",
                predicate: (source) =>
                    source.includes('.FREE="free"') &&
                    source.includes('.PRO="pro"') &&
                    source.includes('.EDUCATION_CBP="education"'),
                read(exports) {
                    const planEnum = single(
                        Object.values(exports).filter(
                            (value) =>
                                value?.FREE === "free" && value?.PRO === "pro",
                        ),
                        "会员枚举",
                    );
                    chatgptPlanTypes = Object.values(planEnum);
                    updateChatgptFakePlanControls();
                },
            },
        ];
    }

    function getChatgptPage() {
        const pathname = pageWindow.location.pathname;
        if (pathname.startsWith("/dots/")) return "dot";
        if (/^\/(?:c|share|g\/[^/]+\/(?:shared\/)?c)\//.test(pathname))
            return "chat";
    }

    function getChatgptModuleItems(page) {
        const items = ["运行时模型切换", "侧栏中键打开"];
        if (page && chatgptCopyButtonEnabled) items.push("复制全文");
        if (page === "chat") {
            if (chatgptMessageInfoEnabled) items.push("显示时间和模型");
            if (chatgptApprovalEnabled) items.push("自动批准工具请求");
            if (chatgptAutoCollapseEnabled) items.push("自动收起分析内容");
        }
        if (chatgptFakePlanEnabled)
            items.push(`假装会员：${chatgptFakePlanValue}`);
        return items;
    }

    function updateToggleStyle(slider, sliderDot, enabled) {
        if (enabled) {
            slider.style.backgroundColor = "#4CAF50";
            sliderDot.style.transform = "translateX(12px)";
        } else {
            slider.style.backgroundColor = "#555";
            sliderDot.style.transform = "translateX(0)";
        }
    }

    async function updateChatgptFakePlan() {
        if (!chatgptModuleInjectionStarted) return;
        try {
            await pageWindow.__checkerNextRuntimeModelBridge?.refreshAccounts();
            updateChatgptInjectionStatus();
        } catch (error) {
            reportChatgptInjectionFailure(`更新会员设置失败：${error}`);
        }
    }

    function updateChatgptFakePlanControls() {
        const select = document.getElementById("chatgpt-fake-plan-select");
        const toggle = document.getElementById("chatgpt-fake-plan-toggle");
        const slider = document.getElementById("chatgpt-fake-plan-slider");
        const sliderDot = document.getElementById(
            "chatgpt-fake-plan-slider-dot",
        );
        if (!(select instanceof HTMLSelectElement)) return;

        const selectedPlan = chatgptPlanTypes?.includes(chatgptFakePlanValue);
        const options = (chatgptPlanTypes ?? []).map((planType) => {
            const option = document.createElement("option");
            option.value = planType;
            option.textContent = planType;
            return option;
        });
        if (!selectedPlan) {
            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = chatgptPlanTypes ? "请选择" : "读取中…";
            placeholder.disabled = true;
            options.unshift(placeholder);
        }
        select.replaceChildren(...options);
        select.value = selectedPlan ? chatgptFakePlanValue : "";
        select.disabled = !chatgptPlanTypes;

        if (
            toggle instanceof HTMLInputElement &&
            slider instanceof HTMLElement &&
            sliderDot instanceof HTMLElement
        ) {
            toggle.checked = Boolean(selectedPlan && chatgptFakePlanEnabled);
            toggle.disabled = !selectedPlan;
            updateToggleStyle(slider, sliderDot, toggle.checked);
        }
    }

    let chatgptFakePlanValue = isChatgptMode
        ? localStorage.getItem(CHATGPT_FAKE_PLAN_KEY) || "pro"
        : "pro";
    let chatgptFakePlanEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_FAKE_PLAN_ENABLED_KEY) === "true";

    function updateChatgptRuntimeModelOptions(
        selectedModelValue = undefined,
        selectedThinkingValue = undefined,
    ) {
        const originElement = document.getElementById("chatgpt-runtime-origin");
        const modelElement = document.getElementById("chatgpt-runtime-model");
        const thinkingElement = document.getElementById(
            "chatgpt-runtime-thinking",
        );
        const originSelect =
            originElement instanceof HTMLSelectElement ? originElement : null;
        const modelSelect =
            modelElement instanceof HTMLSelectElement ? modelElement : null;
        const thinkingSelect =
            thinkingElement instanceof HTMLSelectElement
                ? thinkingElement
                : null;
        if (!originSelect || !modelSelect || !thinkingSelect) return;

        const modelValue =
            typeof selectedModelValue === "string"
                ? selectedModelValue
                : modelSelect.value === CHATGPT_RUNTIME_CUSTOM_VALUE
                  ? ""
                  : modelSelect.value;
        const thinkingValue =
            typeof selectedThinkingValue === "string"
                ? selectedThinkingValue
                : thinkingSelect.value === CHATGPT_RUNTIME_CUSTOM_VALUE
                  ? ""
                  : thinkingSelect.value;
        const createOption = (value, text = value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            return option;
        };
        const state = chatgptRuntimeModelState;
        const models = originSelect.value === state?.origin ? state.models : [];
        const createPlaceholder = (
            text = !state || state.loading
                ? "读取中…"
                : state.origin === "dot"
                  ? "Dot 默认"
                  : "默认",
        ) => {
            const option = createOption("", text);
            option.disabled = true;
            return option;
        };
        const modelOptions = modelValue ? [] : [createPlaceholder()];
        modelOptions.push(
            ...models.map((model) =>
                createOption(
                    model.slug,
                    model.title === model.slug
                        ? model.slug
                        : `${model.slug}（${model.title}）`,
                ),
            ),
        );
        if (modelValue && !models.some((model) => model.slug === modelValue)) {
            modelOptions.push(createOption(modelValue));
        }
        modelOptions.push(
            createOption(CHATGPT_RUNTIME_CUSTOM_VALUE, "自定义…"),
        );
        modelSelect.replaceChildren(...modelOptions);
        modelSelect.value = modelValue;

        const selectedModel = models.find((model) => model.slug === modelValue);
        const efforts = [
            ...new Set(
                selectedModel?.thinkingEfforts ??
                    (state?.origin === "dot" && !modelValue
                        ? models.flatMap((model) => model.thinkingEfforts)
                        : []),
            ),
        ].map(String);
        const thinkingOptions = chatgptRuntimeModelState?.available
            ? [createOption("", "未指定")]
            : [createPlaceholder()];
        thinkingOptions.push(...efforts.map((effort) => createOption(effort)));
        if (thinkingValue && !efforts.includes(thinkingValue)) {
            thinkingOptions.push(createOption(thinkingValue));
        }
        thinkingOptions.push(
            createOption(CHATGPT_RUNTIME_CUSTOM_VALUE, "自定义…"),
        );
        thinkingSelect.replaceChildren(...thinkingOptions);
        thinkingSelect.value = thinkingValue;
    }

    function reportChatgptFailure(message) {
        if (chatgptReportedFailures.has(message)) return;
        chatgptReportedFailures.add(message);
        console.error(`[CheckerNext] ${message}`);
    }

    function reportChatgptInjectionFailure(error) {
        chatgptInjectionFailure = String(error);
        reportChatgptFailure(`模块注入失败：${error}`);
        updateChatgptInjectionStatus();
    }

    function updateChatgptInjectionStatus() {
        if (!isChatgptMode) return;
        const status = document.getElementById("chatgpt-injection-status");
        const tooltip = document.getElementById(
            "chatgpt-module-injection-tooltip-box",
        );
        if (!status) return;

        const page = getChatgptPage();
        const items = getChatgptModuleItems(page)
            .map((item) => `• ${item}`)
            .join("\n");
        let label = "加载中";
        let color = "#bbbbbb";
        let description = "正在加载 ChatGPT 页面模块。";
        const pending = chatgptModuleEntries.filter(
            (entry) =>
                entry.id === undefined &&
                (entry.page === undefined || entry.page === page),
        );
        if (chatgptModuleInjectionEnabled !== chatgptModuleInjectionStarted) {
            label = "刷新生效";
            color = "#ffd700";
            description = chatgptModuleInjectionEnabled
                ? `刷新页面后启用模块注入：\n${items}`
                : "刷新页面后关闭模块注入。";
        } else if (!chatgptModuleInjectionEnabled) {
            label = "注入关闭";
            description = "模块注入已关闭。";
        } else if (chatgptInjectionFailure) {
            label = "注入失败";
            color = "#ff6b6b";
            description = chatgptInjectionFailure;
        } else if (chatgptRuntimeReady && pending.length === 0) {
            label = "注入成功";
            color = "#98fb98";
            description = `当前页面已注入：\n${items}`;
        } else if (pending.length) {
            description = `正在加载：\n${pending.map((entry) => `• ${entry.label}`).join("\n")}`;
        }
        status.innerText = label;
        status.style.color = color;
        if (tooltip) tooltip.innerText = description;
    }

    function updateChatgptRuntimeModelControls() {
        if (!isChatgptMode) return;
        updateChatgptInjectionStatus();
        const originElement = document.getElementById("chatgpt-runtime-origin");
        const modelElement = document.getElementById("chatgpt-runtime-model");
        const thinkingElement = document.getElementById(
            "chatgpt-runtime-thinking",
        );
        const originSelect =
            originElement instanceof HTMLSelectElement ? originElement : null;
        const modelSelect =
            modelElement instanceof HTMLSelectElement ? modelElement : null;
        const thinkingSelect =
            thinkingElement instanceof HTMLSelectElement
                ? thinkingElement
                : null;
        if (!originSelect || !modelSelect || !thinkingSelect) return;

        const state = chatgptRuntimeModelState;
        const page = pageWindow.location.pathname + pageWindow.location.search;
        const pageChanged = modelSelect.dataset.page !== page;
        modelSelect.dataset.page = page;
        const isDot = state?.origin === "dot";
        const controlsDisabled =
            !chatgptModuleInjectionStarted || !state?.available;
        originSelect.disabled = controlsDisabled || isDot;
        originSelect.querySelector('[value="dot"]').hidden = !isDot;
        modelSelect.disabled = controlsDisabled;
        thinkingSelect.disabled = controlsDisabled;
        if (state && (pageChanged || document.activeElement !== originSelect))
            originSelect.value = state.origin;
        const error = document.getElementById("chatgpt-runtime-error");
        if (error) {
            error.textContent = state?.error ?? "";
            error.hidden = !state?.error;
        }

        let modelValue = pageChanged ? "" : undefined;
        let thinkingValue = pageChanged ? "" : undefined;
        if (state) {
            if (pageChanged || document.activeElement !== modelSelect)
                modelValue = state.model ?? "";
            if (pageChanged || document.activeElement !== thinkingSelect) {
                thinkingValue =
                    typeof state.thinkingEffort === "string"
                        ? state.thinkingEffort
                        : "";
            }
        }
        updateChatgptRuntimeModelOptions(modelValue, thinkingValue);
    }

    function requestChatgptRuntimeModelState() {
        if (!isChatgptMode || !chatgptModuleInjectionStarted) return;
        pageWindow.dispatchEvent(
            new pageWindow.CustomEvent(CHATGPT_RUNTIME_MODEL_REQUEST_EVENT),
        );
    }

    if (isChatgptMode) {
        pageWindow.addEventListener(
            CHATGPT_RUNTIME_MODEL_STATE_EVENT,
            (event) => {
                if (!event.detail || typeof event.detail !== "object") {
                    reportChatgptInjectionFailure(
                        "ChatGPT 运行时模型返回了无效状态。",
                    );
                    return;
                }
                chatgptRuntimeModelState = event.detail;
                if (event.detail.error) {
                    reportChatgptInjectionFailure(
                        `ChatGPT 运行时模型出错：${event.detail.error}`,
                    );
                }
                updateChatgptRuntimeModelControls();
            },
        );
        pageWindow.addEventListener("load", updateChatgptInjectionStatus, {
            once: true,
        });
    }

    function formatChatgptConversation(turns, conversationId) {
        const sections = [];
        let role;
        let text = "";
        const flush = () => {
            if (text) sections.push(`「${role}」\n${text}`);
            text = "";
        };
        for (const { turn } of turns ?? []) {
            for (const item of turn.items) {
                const messageText =
                    pageWindow.__checkerNextRuntimeModelBridge.getMessageText(
                        item,
                        conversationId,
                    );
                if (!messageText) continue;
                const messageRole =
                    item.type === "user-message" ? "用户" : "助手";
                if (role !== messageRole) flush();
                role = messageRole;
                text = text ? `${text}\n\n${messageText}` : messageText;
            }
            flush();
        }
        if (!sections.length) throw new Error("会话中没有可复制的正文");
        return sections.join("\n\n========\n\n");
    }

    function formatDotConversation(controller) {
        const { messages } = controller.services.conversations.get(
            controller.roomId,
        );
        const { room } = controller.state.getSnapshot();
        const sections = messages
            .filter((message) => !message.deletedAt && message.text)
            .map((message) => {
                const sender = message.self
                    ? "用户"
                    : (room?.members.find(
                          (member) => member.id === message.senderId,
                      )?.name ??
                      message.senderName ??
                      "助手");
                return `「${sender}」\n${message.text}`;
            });
        if (!sections.length) throw new Error("会话中没有可复制的正文");
        return sections.join("\n\n========\n\n");
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
        displayBox.style.width = "248px";
        displayBox.style.padding = "0";
        displayBox.style.maxHeight = "calc(100vh - 20px)";
        displayBox.style.overflowX = "hidden";
        displayBox.style.overflowY = "auto";
        displayBox.style.scrollbarWidth = "thin";
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
            #checker-next-displayBox[data-mode="codex"] :is(#pow-section, #chatgpt-runtime-model-section, #deep-research-section, #file-upload-section, #paste-text-to-file-section, #image-gen-section, #features-section) {
                display: none !important;
            }
            #checker-next-displayBox[data-mode="codex"] #codex-section,
            #checker-next-displayBox[data-mode="chatgpt"] #features-section {
                display: block !important;
                margin-top: 0 !important;
            }
            #checker-next-displayBox[data-mode="chatgpt"] #codex-section {
                display: block !important;
            }
            #checker-next-displayBox[data-mode="chatgpt"] .codex-section-title {
                margin-bottom: 2px !important;
            }
            #codex-section a {
                color: #8ab4f8;
                text-decoration: none;
            }
            #codex-section a:hover {
                text-decoration: underline;
            }
            #chatgpt-runtime-model-section select {
                width: 100%;
                box-sizing: border-box;
                background-color: #333;
                color: #fff;
                border: 0;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 11px;
                cursor: pointer;
                outline: none;
                line-height: 1em;
            }
        </style>
        <div id="pow-section">
            <div style="margin-bottom: 2px;">
                <strong>ChatGPT</strong>
            </div>
            PoW难度：<button type="button" id="difficulty" aria-describedby="tooltip" style="border: 0; padding: 0; background: none; color: inherit; font: inherit; cursor: pointer;">${formatDifficulty(powDifficulty)}</button><span id="difficulty-level" style="margin-left: 3px"></span>
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
            <span id="user-region-container" style="display: block">用户地区：<span id="user-region">${[userRegionValue, billingCurrency].filter(Boolean).join(" / ") || "..."}</span></span>
            <span id="locale-info-container" style="display: block">时区语言：<span id="locale-info">${[chatgptRuntimeEnvironmentState?.timeZone, chatgptRuntimeEnvironmentState?.locale].filter(Boolean).join(" / ") || "..."}</span></span>
        </div>
        <div id="chatgpt-runtime-model-section" style="margin-top: 10px;">
            <div style="margin-bottom: 4px;">
                <strong>模型</strong>
                <span id="chatgpt-runtime-model-tooltip" style="
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
            <div style="display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 4px; align-items: center;">
                <label for="chatgpt-runtime-origin">模式</label>
                <select id="chatgpt-runtime-origin">
                    <option value="chat">Chat</option>
                    <option value="work">Work</option>
                    <option value="dot" hidden>Dot</option>
                </select>
                <label for="chatgpt-runtime-model">模型</label>
                <select id="chatgpt-runtime-model">
                    <option value="" disabled selected>读取中…</option>
                    <option value="${CHATGPT_RUNTIME_CUSTOM_VALUE}">自定义…</option>
                </select>
                <label for="chatgpt-runtime-thinking">思考</label>
                <select id="chatgpt-runtime-thinking">
                    <option value="" disabled selected>读取中…</option>
                    <option value="${CHATGPT_RUNTIME_CUSTOM_VALUE}">自定义…</option>
                </select>
            </div>
            <div id="chatgpt-runtime-error" hidden style="margin-top: 4px; font-size: 11px; color: #ff6b6b; overflow-wrap: anywhere;"></div>
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
            <div class="codex-section-title" style="margin-bottom: 8px;">
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
            <div id="codex-windows-container">${isChatgptMode ? '<a href="#settings/Usage">查看用量</a>' : "额度：..."}</div>
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
            <div id="codex-reset-credits-container" style="margin-top: 10px; display: none;">
                <div style="margin-bottom: 2px;">
                    <strong>重置机会</strong>
                </div>
                可用次数：<span id="codex-reset-credits-count">...</span>
                <div id="codex-reset-credits-expirations" style="margin-top: 2px; white-space: pre-line;"></div>
                <a id="codex-reset-credits-link" href="${isCodexMode ? "/#settings/Usage" : "#settings/Usage"}" style="display: none; margin-top: 2px;">查看到期时间</a>
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
            <div id="chatgpt-module-injection-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>模块注入：<span id="chatgpt-injection-status" style="color: #bbbbbb;">检查中</span>
                <span id="chatgpt-module-injection-tooltip" style="
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
                    <input type="checkbox" id="chatgpt-module-injection-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-module-injection-slider" style="
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
                    <span id="chatgpt-module-injection-slider-dot" style="
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
            <div id="chatgpt-copy-button-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>复制按钮
                <span id="chatgpt-copy-button-tooltip" style="
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
                    <input type="checkbox" id="chatgpt-copy-button-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-copy-button-slider" style="
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
                    <span id="chatgpt-copy-button-slider-dot" style="
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
            <div id="chatgpt-copy-raw-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>复制原始格式
                <span id="chatgpt-copy-raw-tooltip" style="
                    cursor: pointer;
                    font-size: 12px;
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    text-align: center;
                    line-height: 14px;
                    border: 1px solid #fff;
                    border-radius: 50%;
                    margin-left: 3px;
                ">?</span></span>
                <label style="position: relative; display: inline-block; width: 28px; height: 16px;">
                    <input type="checkbox" id="chatgpt-copy-raw-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-copy-raw-slider" style="
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
                    <span id="chatgpt-copy-raw-slider-dot" style="
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
            <div id="chatgpt-copy-details-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>复制思考内容
                <span id="chatgpt-copy-details-tooltip" style="
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
                    <input type="checkbox" id="chatgpt-copy-details-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-copy-details-slider" style="
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
                    <span id="chatgpt-copy-details-slider-dot" style="
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
            <div id="chatgpt-message-info-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>显示消息时间
                <span id="chatgpt-message-info-tooltip" style="
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
                    <input type="checkbox" id="chatgpt-message-info-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-message-info-slider" style="
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
                    <span id="chatgpt-message-info-slider-dot" style="
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
            <div id="chatgpt-approval-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>自动批准工具请求
                <span id="chatgpt-approval-tooltip" style="
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
                    <input type="checkbox" id="chatgpt-approval-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-approval-slider" style="
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
                    <span id="chatgpt-approval-slider-dot" style="
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
            <div id="chatgpt-auto-collapse-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>自动收起分析内容
                <span id="chatgpt-auto-collapse-tooltip" style="
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
                    <input type="checkbox" id="chatgpt-auto-collapse-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-auto-collapse-slider" style="
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
                    <span id="chatgpt-auto-collapse-slider-dot" style="
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
            <div id="chatgpt-selection-popover-container" style="display: flex; align-items: center; justify-content: space-between;">
                <span>禁用划词悬浮窗
                <span id="chatgpt-selection-popover-tooltip" style="
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
                    <input type="checkbox" id="chatgpt-selection-popover-toggle" style="opacity: 0; width: 0; height: 0;">
                    <span id="chatgpt-selection-popover-slider" style="
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
                    <span id="chatgpt-selection-popover-slider-dot" style="
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
                    width: 140px;
                    box-sizing: border-box;
                ">
                    <option value="" disabled>读取中…</option>
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
        collapsedIndicator.style.right = "28px";
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
            requestChatgptRuntimeModelState();
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
                    isDisplayBoxVisible &&
                    !(
                        document.activeElement instanceof HTMLSelectElement &&
                        displayBox.contains(document.activeElement)
                    )
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
            if (
                !(document.activeElement instanceof HTMLSelectElement) ||
                !displayBox.contains(document.activeElement)
            ) {
                hideDisplayBox();
            }
        });
        displayBox.addEventListener("change", function (event) {
            if (event.target instanceof HTMLSelectElement) {
                event.target.blur();
            }
        });
        displayBox.addEventListener(
            "wheel",
            function (event) {
                if (displayBox.scrollHeight <= displayBox.clientHeight) return;
                displayBox.scrollTop += event.deltaY;
                event.preventDefault();
                event.stopPropagation();
            },
            { passive: false },
        );

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
            "这个数值越大，相当于 ChatGPT 认为你的 IP 风险越低。点击数值切换十六进制与十进制。",
        );

        // 创建 Codex 提示框
        const codexTooltipBox = createTooltip(
            "codex-tooltip-box",
            "首次使用后开始计时，通用额度用于 Codex、Work 等，ChatPass 额度用于授权其他应用使用。",
        );

        // 创建积分提示框
        const creditsTooltipBox = createTooltip(
            "credits-tooltip-box",
            "单独购买的积分，可用于 Codex 任务。",
        );

        // 创建功能提示框
        const featuresTooltipBox = createTooltip(
            "features-tooltip-box",
            "刷新页面生效。",
        );

        const chatgptRuntimeModelTooltipBox = createTooltip(
            "chatgpt-runtime-model-tooltip-box",
            "乱改会触发风控。",
        );

        const chatgptModuleInjectionTooltipBox = createTooltip(
            "chatgpt-module-injection-tooltip-box",
            "正在检查 ChatGPT 模块补丁。",
        );
        chatgptModuleInjectionTooltipBox.style.whiteSpace = "pre-line";

        const chatgptCopyButtonTooltipBox = createTooltip(
            "chatgpt-copy-button-tooltip-box",
            "在右上角显示复制全文按钮。",
        );

        const chatgptCopyRawTooltipBox = createTooltip(
            "chatgpt-copy-raw-tooltip-box",
            "复制呈现 <Link>、<Cite> 等标签的原始格式。",
        );

        const chatgptCopyDetailsTooltipBox = createTooltip(
            "chatgpt-copy-details-tooltip-box",
            "复制全文包括思考与工具调用内容。",
        );

        const chatgptMessageInfoTooltipBox = createTooltip(
            "chatgpt-message-info-tooltip-box",
            "在消息末尾显示时间与模型信息。",
        );

        const chatgptApprovalTooltipBox = createTooltip(
            "chatgpt-approval-tooltip-box",
            "自动为每次工具请求选择允许。",
        );

        const chatgptAutoCollapseTooltipBox = createTooltip(
            "chatgpt-auto-collapse-tooltip-box",
            "默认收起分析执行内容。",
        );

        const chatgptSelectionPopoverTooltipBox = createTooltip(
            "chatgpt-selection-popover-tooltip-box",
            "隐藏划词和编辑时的悬浮菜单。",
        );

        // 创建假装会员提示框
        const chatgptFakePlanTooltipBox = createTooltip(
            "chatgpt-fake-plan-tooltip-box",
            "可能导致功能异常，不影响模型列表。",
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
            bindTooltipEvents(
                "chatgpt-fake-plan-tooltip",
                chatgptFakePlanTooltipBox,
            );
            bindTooltipEvents("features-tooltip", featuresTooltipBox);
            bindTooltipEvents(
                "chatgpt-runtime-model-tooltip",
                chatgptRuntimeModelTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-module-injection-tooltip",
                chatgptModuleInjectionTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-copy-button-tooltip",
                chatgptCopyButtonTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-copy-raw-tooltip",
                chatgptCopyRawTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-copy-details-tooltip",
                chatgptCopyDetailsTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-message-info-tooltip",
                chatgptMessageInfoTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-approval-tooltip",
                chatgptApprovalTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-auto-collapse-tooltip",
                chatgptAutoCollapseTooltipBox,
            );
            bindTooltipEvents(
                "chatgpt-selection-popover-tooltip",
                chatgptSelectionPopoverTooltipBox,
            );
        }

        function bindToggle(id, enabled, storageKey, setEnabled) {
            const toggle = document.getElementById(`${id}-toggle`);
            const slider = document.getElementById(`${id}-slider`);
            const sliderDot = document.getElementById(`${id}-slider-dot`);
            if (!toggle || !slider || !sliderDot) return;

            toggle.checked = enabled;
            updateToggleStyle(slider, sliderDot, enabled);
            toggle.addEventListener("change", function () {
                setEnabled(toggle.checked);
                localStorage.setItem(storageKey, String(toggle.checked));
                updateToggleStyle(slider, sliderDot, toggle.checked);
            });
        }

        function updateChatgptCopyButtonToggle() {
            const toggle = document.getElementById(
                "chatgpt-copy-button-toggle",
            );
            const slider = document.getElementById(
                "chatgpt-copy-button-slider",
            );
            const sliderDot = document.getElementById(
                "chatgpt-copy-button-slider-dot",
            );
            if (!(toggle instanceof HTMLInputElement) || !slider || !sliderDot)
                return;

            toggle.checked = chatgptCopyButtonEnabled;
            toggle.disabled = !chatgptModuleInjectionStarted;
            updateToggleStyle(
                slider,
                sliderDot,
                chatgptModuleInjectionStarted && chatgptCopyButtonEnabled,
            );
        }

        function bindChatgptCopyButtonToggle() {
            const toggle = document.getElementById(
                "chatgpt-copy-button-toggle",
            );
            if (!(toggle instanceof HTMLInputElement)) return;

            updateChatgptCopyButtonToggle();
            toggle.addEventListener("change", () => {
                chatgptCopyButtonEnabled = toggle.checked;
                pageWindow.dispatchEvent(
                    new pageWindow.Event(CHATGPT_COPY_EVENT),
                );
                localStorage.setItem(
                    CHATGPT_COPY_BUTTON_ENABLED_KEY,
                    String(chatgptCopyButtonEnabled),
                );
                updateChatgptCopyButtonToggle();
                updateChatgptInjectionStatus();
            });
        }

        function bindChatgptRuntimeModelControls() {
            const originElement = document.getElementById(
                "chatgpt-runtime-origin",
            );
            const modelElement = document.getElementById(
                "chatgpt-runtime-model",
            );
            const thinkingElement = document.getElementById(
                "chatgpt-runtime-thinking",
            );
            const originSelect =
                originElement instanceof HTMLSelectElement
                    ? originElement
                    : null;
            const modelSelect =
                modelElement instanceof HTMLSelectElement ? modelElement : null;
            const thinkingSelect =
                thinkingElement instanceof HTMLSelectElement
                    ? thinkingElement
                    : null;
            if (!originSelect || !modelSelect || !thinkingSelect) return;

            function apply(detail) {
                if (!chatgptModuleInjectionStarted) return;
                pageWindow.dispatchEvent(
                    new pageWindow.CustomEvent(
                        CHATGPT_RUNTIME_MODEL_SET_EVENT,
                        { detail },
                    ),
                );
            }

            function bindCustomOption(select, promptText, onChange) {
                let previousValue = select.value;
                select.addEventListener("focus", () => {
                    previousValue = select.value;
                });
                select.addEventListener(
                    "blur",
                    updateChatgptRuntimeModelControls,
                );
                select.addEventListener("change", () => {
                    if (select.value === CHATGPT_RUNTIME_CUSTOM_VALUE) {
                        const value = pageWindow
                            .prompt(promptText, previousValue)
                            ?.trim();
                        if (!value) {
                            select.value = previousValue;
                            return;
                        }
                        if (
                            ![...select.options].some(
                                (option) => option.value === value,
                            )
                        ) {
                            const option = document.createElement("option");
                            option.value = value;
                            option.textContent = value;
                            select.insertBefore(
                                option,
                                select.lastElementChild,
                            );
                        }
                        select.value = value;
                    }
                    previousValue = select.value;
                    onChange(select.value);
                });
            }

            originSelect.addEventListener("change", () => {
                modelSelect.value = "";
                thinkingSelect.value = "";
                updateChatgptRuntimeModelOptions();
                apply({ origin: originSelect.value });
            });
            bindCustomOption(modelSelect, "输入模型 slug", (model) => {
                updateChatgptRuntimeModelOptions();
                if (model) apply({ model });
            });
            bindCustomOption(
                thinkingSelect,
                "输入思考强度",
                (thinkingEffort) => {
                    apply({ thinkingEffort: thinkingEffort || null });
                },
            );

            updateChatgptRuntimeModelControls();
            requestChatgptRuntimeModelState();
        }

        function bindChatgptFakePlanSelect() {
            const select = document.getElementById("chatgpt-fake-plan-select");
            const toggle = document.getElementById("chatgpt-fake-plan-toggle");
            const slider = document.getElementById("chatgpt-fake-plan-slider");
            const sliderDot = document.getElementById(
                "chatgpt-fake-plan-slider-dot",
            );
            if (
                !(select instanceof HTMLSelectElement) ||
                !(toggle instanceof HTMLInputElement) ||
                !(slider instanceof HTMLElement) ||
                !(sliderDot instanceof HTMLElement)
            ) {
                return;
            }

            updateChatgptFakePlanControls();

            select.addEventListener("change", function () {
                if (!chatgptPlanTypes?.includes(select.value)) return;
                chatgptFakePlanValue = select.value;
                localStorage.setItem(
                    CHATGPT_FAKE_PLAN_KEY,
                    chatgptFakePlanValue,
                );
                updateChatgptFakePlanControls();
                void updateChatgptFakePlan();
            });
            toggle.addEventListener("change", function () {
                chatgptFakePlanEnabled = toggle.checked;
                localStorage.setItem(
                    CHATGPT_FAKE_PLAN_ENABLED_KEY,
                    chatgptFakePlanEnabled ? "true" : "false",
                );
                updateChatgptFakePlanControls();
                void updateChatgptFakePlan();
            });
        }

        if (isChatgptMode) {
            const difficultyElement = document.getElementById("difficulty");
            difficultyElement.addEventListener("click", () => {
                powRadix = powRadix === 10 ? 16 : 10;
                localStorage.setItem(CHATGPT_POW_RADIX_KEY, String(powRadix));
                difficultyElement.textContent = formatDifficulty(powDifficulty);
            });
            bindToggle(
                "chatgpt-module-injection",
                chatgptModuleInjectionEnabled,
                CHATGPT_MODULE_INJECTION_ENABLED_KEY,
                (value) => {
                    chatgptModuleInjectionEnabled = value;
                    updateChatgptInjectionStatus();
                },
            );
            bindChatgptCopyButtonToggle();
            bindToggle(
                "chatgpt-copy-raw",
                chatgptCopyRawEnabled,
                CHATGPT_COPY_RAW_KEY,
                (value) => {
                    chatgptCopyRawEnabled = value;
                },
            );
            bindToggle(
                "chatgpt-copy-details",
                chatgptCopyDetailsEnabled,
                CHATGPT_COPY_DETAILS_KEY,
                (value) => {
                    chatgptCopyDetailsEnabled = value;
                },
            );
            bindToggle(
                "chatgpt-message-info",
                chatgptMessageInfoEnabled,
                CHATGPT_MESSAGE_INFO_KEY,
                (value) => {
                    chatgptMessageInfoEnabled = value;
                    pageWindow.dispatchEvent(
                        new pageWindow.Event(CHATGPT_MESSAGE_INFO_EVENT),
                    );
                    updateChatgptInjectionStatus();
                },
            );
            bindToggle(
                "chatgpt-approval",
                chatgptApprovalEnabled,
                CHATGPT_APPROVAL_KEY,
                (value) => {
                    chatgptApprovalEnabled = value;
                    pageWindow.dispatchEvent(
                        new pageWindow.Event(CHATGPT_APPROVAL_EVENT),
                    );
                    updateChatgptInjectionStatus();
                },
            );
            bindToggle(
                "chatgpt-auto-collapse",
                chatgptAutoCollapseEnabled,
                CHATGPT_AUTO_COLLAPSE_KEY,
                (value) => {
                    chatgptAutoCollapseEnabled = value;
                    pageWindow.dispatchEvent(
                        new pageWindow.Event(CHATGPT_AUTO_COLLAPSE_EVENT),
                    );
                    updateChatgptInjectionStatus();
                },
            );
            bindToggle(
                "chatgpt-selection-popover",
                chatgptSelectionPopoverDisabled,
                CHATGPT_SELECTION_POPOVER_DISABLED_KEY,
                (value) => {
                    chatgptSelectionPopoverDisabled = value;
                    chatgptSelectionPopoverStyle.media = value
                        ? "all"
                        : "not all";
                },
            );
            bindChatgptRuntimeModelControls();
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

    function formatDifficulty(difficulty) {
        return difficulty === "..." || powRadix === 16
            ? difficulty
            : Number.parseInt(difficulty, 16).toString();
    }

    // 更新difficulty指示器
    function updateDifficultyIndicator(difficulty) {
        powDifficulty = difficulty;
        const difficultyElement = document.getElementById("difficulty");
        if (difficultyElement)
            difficultyElement.textContent = formatDifficulty(difficulty);
        const difficultyLevel = document.getElementById("difficulty-level");

        if (difficulty === "...") {
            setIconColors("#888", "#666");
            difficultyLevel.innerText = "";
            powFetched = false;
            const powSection = document.getElementById("pow-section");
            if (powSection && isCodexMode && codexFetched)
                powSection.style.display = "none";
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
    let codexUsageWindows = [];
    let codexCreditsVisible = false;
    let codexResetAvailableCount;
    let codexResetCredits;

    function isCodexWindowDuration(limitWindowSeconds, expectedSeconds) {
        return (
            Number.isFinite(limitWindowSeconds) &&
            limitWindowSeconds > 0 &&
            Math.abs(limitWindowSeconds - expectedSeconds) <=
                expectedSeconds * 0.05
        );
    }

    function formatCodexWindowLabel(name, limitWindowSeconds) {
        let period = "";
        if (isCodexWindowDuration(limitWindowSeconds, 5 * 60 * 60)) {
            period = "每5小时";
        } else if (
            isCodexWindowDuration(limitWindowSeconds, 30 * 24 * 60 * 60)
        ) {
            period = "每月";
        } else if (
            isCodexWindowDuration(limitWindowSeconds, 7 * 24 * 60 * 60)
        ) {
            period = "每周";
        } else if (isCodexWindowDuration(limitWindowSeconds, 24 * 60 * 60)) {
            period = "每天";
        } else if (
            Number.isFinite(limitWindowSeconds) &&
            limitWindowSeconds > 0
        ) {
            period = `每${formatCodexDuration(limitWindowSeconds, true)}`;
        }
        return period ? `${name} ${period}` : name;
    }

    function getCodexUsageWindows(data) {
        const windows = [];

        function appendWindow(window, name) {
            if (!window || typeof window !== "object") return;
            const limitWindowSeconds = Number.isFinite(
                window.limit_window_seconds,
            )
                ? window.limit_window_seconds
                : null;
            windows.push({
                label: formatCodexWindowLabel(name, limitWindowSeconds),
                usedPercent: Number.isFinite(window.used_percent)
                    ? Math.max(0, Math.min(100, window.used_percent))
                    : null,
                resetAfterSeconds: Number.isFinite(window.reset_after_seconds)
                    ? window.reset_after_seconds
                    : null,
                resetAt: Number.isFinite(window.reset_at)
                    ? window.reset_at * 1000
                    : null,
                limitWindowSeconds,
            });
        }

        function appendRateLimit(rateLimit, name) {
            if (!rateLimit || typeof rateLimit !== "object") return;
            appendWindow(rateLimit.primary_window, name);
            appendWindow(rateLimit.secondary_window, name);
        }

        appendRateLimit(data?.rate_limit, "通用");
        for (const window of data?.chatpass?.windows ?? []) {
            appendWindow(window, "ChatPass");
        }
        if (Array.isArray(data?.additional_rate_limits)) {
            for (const additionalRateLimit of data.additional_rate_limits) {
                const name =
                    typeof additionalRateLimit?.limit_name === "string" &&
                    additionalRateLimit.limit_name.trim()
                        ? additionalRateLimit.limit_name.trim()
                        : "附加用量";
                appendRateLimit(
                    additionalRateLimit?.rate_limit,
                    name === "GPT-5.3-Codex-Spark"
                        ? "Spark"
                        : name === "gpt-reserve"
                          ? "Reserve Luna"
                          : name,
                );
            }
        }
        appendWindow(data?.code_review_rate_limit?.primary_window, "代码审查");
        return windows;
    }

    function updateCodexDisplayState() {
        codexFetched =
            codexUsageWindows.length > 0 ||
            codexCreditsVisible ||
            codexResetAvailableCount != null ||
            (codexResetCredits?.length ?? 0) > 0;

        const section = document.getElementById("codex-section");
        if (section) {
            section.style.display = codexFetched ? "block" : "none";
        }
        if (!codexFetched || !isCodexMode || powFetched) return;

        setIconColors("#C26FFD", "#A855F7");
        const powSection = document.getElementById("pow-section");
        if (powSection) powSection.style.display = "none";
    }

    function updateCodexInfo(windows) {
        const container = document.getElementById("codex-windows-container");
        if (!container || windows.length === 0) return;

        const now = Date.now();
        codexUsageWindows = windows.map((window) => ({
            ...window,
            resetTime:
                window.resetAfterSeconds != null
                    ? now + window.resetAfterSeconds * 1000
                    : window.resetAt,
            resetElement: null,
        }));
        container.replaceChildren();

        for (const [index, window] of codexUsageWindows.entries()) {
            const row = document.createElement("div");
            if (index > 0) row.style.marginTop = "8px";
            row.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-right:4px;">
                    <span>已用：<span class="codex-window-usage">...</span></span>
                    <span><i class="codex-window-label"></i></span>
                </div>
                <div style="margin-top: 4px; margin-bottom: 4px; width: 100%; height: 8px; background: #555; border-radius: 4px;">
                    <div class="codex-window-progress-bar" style="height: 100%; width: 0%; background: #C26FFD; border-radius: 4px;"></div>
                </div>
                重置时间：<span class="codex-window-reset-time">...</span>
            `;
            const usage = row.querySelector(".codex-window-usage");
            const label = row.querySelector(".codex-window-label");
            const bar = row.querySelector(".codex-window-progress-bar");
            const reset = row.querySelector(".codex-window-reset-time");
            if (!usage || !label || !bar || !reset) continue;

            usage.innerText =
                window.usedPercent == null ? "..." : `${window.usedPercent}%`;
            label.innerText = window.label;
            bar.style.width = `${window.usedPercent ?? 0}%`;
            window.resetElement = reset;
            container.appendChild(row);
        }

        updateCodexDisplayState();
        updateCodexCountdown();
    }

    function updateCodexCredits(credits) {
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
        const balance = Number(balanceRaw);
        if (Number.isFinite(balance) && balance > 0) {
            valueEl.innerText = Math.ceil(balance).toLocaleString(
                chatgptRuntimeEnvironmentState?.locale ||
                    document.documentElement.lang ||
                    undefined,
            );
            container.style.display = "block";
            codexCreditsVisible = true;
        } else {
            valueEl.innerText = "...";
            container.style.display = "none";
            codexCreditsVisible = false;
        }
        updateCodexDisplayState();
    }

    function updateCodexResetCredits(resetCredits) {
        if (!resetCredits || typeof resetCredits !== "object") return;

        if (Number.isFinite(resetCredits.available_count)) {
            codexResetAvailableCount = Math.max(
                0,
                Math.floor(resetCredits.available_count),
            );
        }
        if (Array.isArray(resetCredits.credits)) {
            codexResetCredits = resetCredits.credits.filter(
                (credit) => credit?.status === "available",
            );
        }

        const container = document.getElementById(
            "codex-reset-credits-container",
        );
        const count = document.getElementById("codex-reset-credits-count");
        const expirations = document.getElementById(
            "codex-reset-credits-expirations",
        );
        const detailsLink = document.getElementById("codex-reset-credits-link");
        if (!container || !count || !expirations || !detailsLink) return;

        const availableCredits = codexResetCredits ?? [];
        count.innerText = `${codexResetAvailableCount ?? availableCredits.length}次`;
        expirations.innerText = availableCredits
            .map(
                (credit, index) =>
                    `第${index + 1}次到期：${formatAbsoluteTime(credit.expires_at) || "..."}`,
            )
            .join("\n");
        detailsLink.style.display =
            availableCredits.length === 0 && codexResetAvailableCount > 0
                ? "block"
                : "none";
        container.style.display = "block";
        updateCodexDisplayState();
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

    function formatAbsoluteTime(timestamp) {
        if (timestamp == null) return "";
        const parts =
            pageWindow.__checkerNextRuntimeModelBridge?.formatDateToParts(
                timestamp,
                {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hourCycle: "h23",
                    numberingSystem: "latn",
                },
            );
        if (!parts) return "";
        const values = Object.fromEntries(
            parts.map(({ type, value }) => [type, value]),
        );
        return `${values.year}-${Number(values.month)}-${Number(values.day)} ${values.hour}:${values.minute}:${values.second}`;
    }

    function updateCodexCountdown() {
        for (const window of codexUsageWindows) {
            const reset = window.resetElement;
            if (!reset) continue;

            const notStarted = isCodexTimerNotStarted(
                window.limitWindowSeconds,
                window.resetAfterSeconds,
            );
            if (window.usedPercent == null) {
                reset.innerText = "...";
            } else if (notStarted) {
                reset.innerHTML = `${formatCodexDuration(
                    window.limitWindowSeconds,
                    true,
                )}${NOT_STARTED_BADGE}`;
            } else if (window.resetTime != null) {
                const secs = Math.max(
                    0,
                    Math.floor((window.resetTime - Date.now()) / 1000),
                );
                reset.innerText = formatCodexDuration(secs, false);
            } else {
                reset.innerText = "...";
            }

            const tooltipText = formatAbsoluteTime(window.resetAt);
            if (tooltipText) {
                reset.title = tooltipText;
            } else {
                reset.removeAttribute("title");
            }
        }
    }
    setInterval(updateCodexCountdown, 1000);

    function isResetTimestampNear(resetAfter, expectedTimestamp) {
        if (!resetAfter || typeof expectedTimestamp !== "number") return false;
        const timestamp = new Date(resetAfter).getTime();
        if (Number.isNaN(timestamp)) return false;
        return Math.abs(timestamp - expectedTimestamp) <= 5000;
    }

    const CHATGPT_FEATURE_LIMITS = {
        deep_research: ["deep-research", 30 * 24 * 60 * 60 * 1000],
        file_upload: ["file-upload", 3 * 60 * 60 * 1000],
        paste_text_to_file: ["paste-text-to-file", 3 * 60 * 60 * 1000],
        image_gen: ["image-gen", 24 * 60 * 60 * 1000],
    };

    function updateChatgptFeatureLimit(config, remaining, resetAfter) {
        if (!isChatgptMode) return;
        const [id, resetPeriod] = config;
        const section = document.getElementById(`${id}-section`);
        const usageEl = document.getElementById(`${id}-usage`);
        const resetEl = document.getElementById(`${id}-reset-time`);
        if (!section || !usageEl || !resetEl) return;

        if (typeof remaining !== "number") {
            section.style.display = "none";
            return;
        }

        section.style.display = "block";
        if (isResetTimestampNear(resetAfter, Date.now() + resetPeriod)) {
            usageEl.innerHTML = `${remaining}次${NOT_STARTED_BADGE}`;
        } else {
            usageEl.innerText = `${remaining}次`;
        }

        resetEl.innerText = formatAbsoluteTime(resetAfter) || "...";
    }

    function updateUserRegionDisplay() {
        const container = document.getElementById("user-region-container");
        const valueEl = document.getElementById("user-region");
        if (!container || !valueEl) return;
        valueEl.innerText =
            [userRegionValue, billingCurrency].filter(Boolean).join(" / ") ||
            "...";
        container.style.display = "block";
    }

    function updateUserRegion(country, region) {
        if (!isChatgptMode || typeof country !== "string" || !country.trim())
            return;

        const parts = [country.trim()];
        if (typeof region === "string" && region.trim()) {
            parts.push(region.trim());
        }
        userRegionValue = parts.join(" / ");
        updateUserRegionDisplay();
    }

    function updateBillingCurrency(currency) {
        if (!isChatgptMode || typeof currency !== "string" || !currency.trim())
            return;
        billingCurrency = currency.trim().toUpperCase();
        updateUserRegionDisplay();
    }

    function updateChatgptLocaleInfo() {
        const container = document.getElementById("locale-info-container");
        const valueEl = document.getElementById("locale-info");
        if (!container || !valueEl) return;
        valueEl.innerText =
            [
                chatgptRuntimeEnvironmentState?.timeZone,
                chatgptRuntimeEnvironmentState?.locale,
            ]
                .filter(Boolean)
                .join(" / ") || "...";
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
        } else {
            valueEl.innerText = "...";
            section.style.display = "none";
        }
    }

    function updatePersona(persona) {
        if (!isChatgptMode || typeof persona !== "string" || !persona) return;
        const container = document.getElementById("persona-container");
        const valueEl = document.getElementById("persona");
        if (!container || !valueEl) return;
        valueEl.innerText = persona;
        container.style.display = "block";
    }

    if (isChatgptMode) {
        pageWindow.addEventListener("message", (event) => {
            if (event.origin !== pageWindow.location.origin) return;
            updatePersona(event.data?.result?.cachedChatReq?.persona);
        });
    }

    // 拦截 fetch 请求
    const originalFetch = pageWindow.fetch.bind(pageWindow);
    pageWindow.fetch = async function (resource, options) {
        const response = await originalFetch(resource, options);
        observeResponse(resource, options, response).catch((error) => {
            console.error("[CheckerNext] 读取响应信息出错:", error);
        });
        return response;
    };

    async function observeResponse(resource, options, response) {
        if (!response.ok) return;
        const requestUrl = new URL(
            resource?.url ?? resource,
            pageWindow.location.href,
        ).pathname;
        const finalMethod = (
            options?.method ??
            resource?.method ??
            "GET"
        ).toUpperCase();

        if (
            (requestUrl.includes(
                "/backend-api/sentinel/chat-requirements/prepare",
            ) ||
                requestUrl.includes(
                    "/backend-anon/sentinel/chat-requirements/prepare",
                )) &&
            finalMethod === "POST"
        ) {
            if (!isChatgptMode) {
                return;
            }
            try {
                const data = await response.clone().json();
                const difficulty = data.proofofwork
                    ? data.proofofwork.difficulty
                    : "...";
                updatePersona(data.persona);
                updateDifficultyIndicator(difficulty);

                return;
            } catch (e) {
                console.error("[CheckerNext] 处理挑战响应出错:", e);
                updateDifficultyIndicator("...");
                return;
            }
        }

        if (requestUrl.endsWith("/backend-api/me") && finalMethod === "GET") {
            if (!isChatgptMode) {
                return;
            }
            try {
                const data = await response.clone().json();
                updateUserRegion(
                    typeof data?.country === "string" ? data.country : null,
                    typeof data?.region === "string" ? data.region : null,
                );
                return;
            } catch (e) {
                console.error("[CheckerNext] 处理用户地区响应出错:", e);
                return;
            }
        }

        if (
            /\/backend-api\/accounts\/check\/[^/?#]+/.test(requestUrl) &&
            finalMethod === "GET"
        ) {
            if (!isChatgptMode) {
                return;
            }
            try {
                const data = await response.clone().json();
                const accountId = data?.account_ordering?.[0];
                const account =
                    (accountId && data?.accounts?.[accountId]) ||
                    data?.accounts?.default;
                updateBillingCurrency(account?.entitlement?.billing_currency);
                return;
            } catch (e) {
                console.error("[CheckerNext] 处理计费币种响应出错:", e);
                return;
            }
        }

        if (
            requestUrl.includes("/backend-api/memories") &&
            finalMethod === "GET"
        ) {
            if (!isChatgptMode) {
                return;
            }
            try {
                const data = await response.clone().json();
                updateMemoryUsage(
                    typeof data?.memory_num_tokens === "number"
                        ? data.memory_num_tokens
                        : null,
                    typeof data?.memory_max_tokens === "number"
                        ? data.memory_max_tokens
                        : null,
                );
                return;
            } catch (e) {
                console.error("[CheckerNext] 处理记忆用量响应出错:", e);
                return;
            }
        }

        if (
            requestUrl.includes("/backend-api/conversation/init") &&
            finalMethod === "POST"
        ) {
            try {
                const data = await response.clone().json();
                if (Array.isArray(data.limits_progress)) {
                    for (const limit of data.limits_progress) {
                        const config =
                            CHATGPT_FEATURE_LIMITS[limit.feature_name];
                        if (Array.isArray(config)) {
                            updateChatgptFeatureLimit(
                                config,
                                limit.remaining,
                                limit.reset_after,
                            );
                        }
                    }
                }
                return;
            } catch (e) {
                console.error("[CheckerNext] 处理功能用量响应出错:", e);
                return;
            }
        }

        if (
            /\/backend-api\/wham\/usage\/?$/.test(requestUrl) &&
            finalMethod === "GET"
        ) {
            try {
                const data = await response.clone().json();
                updateCodexInfo(getCodexUsageWindows(data));
                updateCodexCredits(data?.credits);
                updateCodexResetCredits(data?.rate_limit_reset_credits);
                return;
            } catch (e) {
                console.error("[CheckerNext] 处理 Codex 响应出错:", e);
                return;
            }
        }

        if (
            /\/backend-api\/wham\/rate-limit-reset-credits\/?$/.test(
                requestUrl,
            ) &&
            finalMethod === "GET"
        ) {
            try {
                updateCodexResetCredits(await response.clone().json());
                return;
            } catch (e) {
                console.error("[CheckerNext] 处理 Codex 重置机会响应出错:", e);
                return;
            }
        }
    }
})();
