// ==UserScript==
// @name         ChatGPT Checker Next
// @namespace    https://github.com/zetaloop/chatgpt-checker-next
// @homepage     https://github.com/zetaloop/chatgpt-checker-next
// @author       zetaloop
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzJjM2U1MCIgZD0iTTMyIDJDMTUuNDMyIDIgMiAxNS40MzIgMiAzMnMxMy40MzIgMzAgMzAgMzAgMzAtMTMuNDMyIDMwLTMwUzQ4LjU2OCAyIDMyIDJ6bTAgNTRjLTEzLjIzMyAwLTI0LTEwLjc2Ny0yNC0yNFMxOC43NjcgOCAzMiA4czI0IDEwLjc2NyAyNCAyNFM0NS4yMzMgNTYgMzIgNTZ6Ii8+PHBhdGggZmlsbD0iIzNkYzJmZiIgZD0iTTMyIDEyYy0xMS4wNDYgMC0yMCA4Ljk1NC0yMCAyMHM4Ljk1NCAyMCAyMCAyMCAyMC04Ljk1NCAyMC0yMFM0My4wNDYgMTIgMzIgMTJ6bTAgMzZjLTguODM3IDAtMTYtNy4xNjMtMTYtMTZzNy4xNjMtMTYgMTYtMTYgMTYgNy4xNjMgMTYgMTZTNDAuODM3IDQ4IDMyIDQ4eiIvPjxwYXRoIGZpbGw9IiMwMGZmN2YiIGQ9Ik0zMiAyMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMzOC42MjcgMjAgMzIgMjB6bTAgMjBjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzIiIGN5PSIzMiIgcj0iNCIvPjwvc3ZnPg==
// @version      5.0.0
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
    const CHATGPT_FAKE_PLAN_KEY = "checker-next-chatgpt-fake-plan";
    const CHATGPT_FAKE_PLAN_ENABLED_KEY =
        "checker-next-chatgpt-fake-plan-enabled";
    const CHATGPT_MODULE_INJECTION_ENABLED_KEY =
        "checker-next-chatgpt-module-injection-enabled";
    const CHATGPT_COPY_BUTTON_ENABLED_KEY =
        "checker-next-chatgpt-copy-button-enabled";
    const CHATGPT_COPY_DETAILS_KEY = "checker-next-chatgpt-copy-details";
    const CHATGPT_MESSAGE_INFO_KEY = "checker-next-chatgpt-message-info";
    const CHATGPT_MESSAGE_INFO_EVENT = "checker-next-message-info";
    const CHATGPT_APPROVAL_KEY = "checker-next-chatgpt-approval";
    const CHATGPT_APPROVAL_EVENT = "checker-next-approval";
    const CHATGPT_SELECTION_POPOVER_DISABLED_KEY =
        "checker-next-chatgpt-selection-popover-disabled";
    const CHATGPT_RUNTIME_MODEL_STATE_EVENT =
        "checker-next-runtime-model-state";
    const CHATGPT_RUNTIME_MODEL_REQUEST_EVENT =
        "checker-next-runtime-model-request";
    const CHATGPT_RUNTIME_MODEL_SET_EVENT = "checker-next-runtime-model-set";
    const CHATGPT_RUNTIME_CUSTOM_VALUE = "__checker_next_custom__";

    let chatgptModuleInjectionEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_MODULE_INJECTION_ENABLED_KEY) !== "false";
    let chatgptCopyButtonEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_COPY_BUTTON_ENABLED_KEY) !== "false";
    let chatgptCopyDetailsEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_COPY_DETAILS_KEY) === "true";
    let chatgptMessageInfoEnabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_MESSAGE_INFO_KEY) !== "false";
    let chatgptApprovalEnabled =
        isChatgptMode && localStorage.getItem(CHATGPT_APPROVAL_KEY) !== "false";
    let chatgptSelectionPopoverDisabled =
        isChatgptMode &&
        localStorage.getItem(CHATGPT_SELECTION_POPOVER_DISABLED_KEY) === "true";
    let chatgptSelectionPopoverStyle;
    let userRegionValue = null;
    let priceRegionCode = null;
    let chatgptRuntimeModelState;
    let chatgptPlanTypes;
    let chatgptCopyIcons;
    let chatgptModuleInjectionStarted = false;
    let chatgptInjectionFailure;
    const chatgptReportedFailures = new Set();
    const chatgptRuntimeModelCatalogs = {
        chat: [],
        work: [],
    };

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
        const fail = (error) => {
            chatgptInjectionFailure = String(error);
            reportChatgptFailure(`模块注入失败：${error}`);
            updateChatgptInjectionStatus();
        };
        const install = (require) => {
            const { patches, bindings } = createChatgptModulePatches();
            const entries = patches.concat(createChatgptModuleData());
            installChatgptRuntimeBridge(require, bindings);
            const processed = new WeakMap();
            const patch = (id, factory) => {
                if (processed.has(factory)) return processed.get(factory);
                const source = factory.toString();
                const target = { id, source };
                try {
                    for (const entry of entries) {
                        if (!entry.predicate(source)) continue;
                        if (entry.id !== undefined && entry.id !== id)
                            throw new Error(`${entry.label}匹配到多个模块`);
                        if (entry.read) {
                            if (entry.id === undefined) {
                                queueMicrotask(() => {
                                    try {
                                        entry.read(require(id));
                                    } catch (error) {
                                        reportChatgptFailure(
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
                    return result;
                } catch (error) {
                    fail(error);
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
                        fail(error);
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
        const origins = new Map();
        const customModels = new Map();
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
            watchedScope,
            stopWatching,
            composerScope,
            homeScope,
            picker,
            modelState,
            homeOrigin,
            scheduled = false,
            lastState;
        const report = (error) =>
            console.error("[CheckerNext] 运行时模块出错:", error);
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
        const routeId = (pathname = location.pathname) => {
            const match = pathname.match(
                /^\/(?:c|share|g\/[^/]+\/(?:shared\/)?c)\/([^/]+)$/,
            );
            return match ? decodeURIComponent(match[1]) : null;
        };
        const current = () => conversations.get(routeId());
        const readModel = (scope) => {
            const context = scope.value.chatGptSelectionContext;
            if (!context) return;
            return {
                selectedModel: scope.get(native.selection, context)
                    .selectedModel,
                isWorkConversation: context.conversationOrigin === "tpp",
            };
        };
        const scheduleState = () => {
            if (scheduled) return;
            scheduled = true;
            queueMicrotask(() => {
                scheduled = false;
                const active =
                    picker?.pathname === location.pathname ? picker : null;
                const scope = active?.scope ?? appScope;
                if (stopWatching && watchedScope.node !== scope?.node) {
                    stopWatching();
                    stopWatching = undefined;
                    modelState = undefined;
                }
                if (scope && (active || current()) && !stopWatching) {
                    watchedScope = scope;
                    let pathname;
                    stopWatching = scope.watch((scope) => {
                        const nextPathname = scope.get(
                            native.location,
                        )?.pathname;
                        if (
                            nextPathname !== undefined &&
                            nextPathname !== pathname &&
                            nextPathname === location.pathname
                        ) {
                            pathname = nextPathname;
                            const conversation = conversations.get(
                                routeId(pathname),
                            );
                            for (const [key, value] of conversations) {
                                if (value !== conversation)
                                    conversations.delete(key);
                            }
                        }
                        modelState = active ? readModel(scope) : undefined;
                        scheduleState();
                    });
                }
                const model = active && modelState?.selectedModel;
                const state = {
                    ready: true,
                    pathname: location.pathname,
                    copyReady: current()?.copyReady ?? false,
                    available: Boolean(model && active.onModelChange),
                    origin:
                        active && modelState?.isWorkConversation
                            ? "work"
                            : "chat",
                    model: model?.slug ?? null,
                    thinkingEffort: model?.thinkingEffort ?? null,
                };
                if (state.available)
                    pageWindow.__checkerNextModulesInstalled = true;
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
        const applyOrigin = (conversation) => {
            const origin = origins.get(conversation?.conversation_id);
            return origin === undefined
                ? conversation
                : { ...conversation, conversation_origin: origin };
        };
        const extendModels = (data) => {
            if (!data || customModels.size === 0) return data;
            let modelConfigBySlug = data.modelConfigBySlug;
            let internalOptions = data.internalOptions;
            const options = [
                ...(data.options ?? []),
                ...(internalOptions ?? []),
                ...(data.versionOptions?.flatMap(
                    (version) => version.options,
                ) ?? []),
            ];
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
        const bridge = {
            register(values) {
                Object.assign(native, values);
            },
            scope(fn) {
                return after(fn, (_, scope) => {
                    if (
                        scope.scope.__scopeBrand === "AppScope" &&
                        (!appScope || appScope.node !== scope.node)
                    ) {
                        appScope = scope;
                        scheduleState();
                    }
                    if (scope.scope.__scopeBrand === "ComposerScope") {
                        if (scope.value.kind === "chatgpt")
                            composerScope = scope;
                        if (
                            scope.value.kind === "new" &&
                            scope.value.entrypoint === "home"
                        ) {
                            homeScope = { pathname: location.pathname, scope };
                        }
                    }
                });
            },
            picker(fn) {
                return after(fn, ([props]) => {
                    picker = {
                        pathname: location.pathname,
                        scope: composerScope,
                        onModelChange: props.onModelChange,
                    };
                    scheduleState();
                });
            },
            turns(fn) {
                return after(fn, ([props]) => {
                    pageWindow.__checkerNextModulesInstalled = true;
                    const conversation = {
                        id: props.conversationId,
                        serverId: props.browserConversationId,
                        copyReady: props.renderedTurns.length > 0,
                        turns: props.isReadOnly
                            ? props.renderedTurns
                            : undefined,
                        readOnly: props.isReadOnly,
                    };
                    conversations.set(conversation.id, conversation);
                    if (conversation.serverId)
                        conversations.set(conversation.serverId, conversation);
                    scheduleState();
                });
            },
            conversation(fn) {
                return function (scope, conversation) {
                    const origin = origins.get(conversation.conversationId);
                    return fn(
                        scope,
                        origin === undefined
                            ? conversation
                            : { ...conversation, conversationOrigin: origin },
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
                function MessageInfo(props) {
                    const scope = appScope;
                    const { conversationId } = props;
                    const item = assistant ? props.assistantItem : props.item;
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
                        const id =
                            item.latestMessageId ??
                            item.serverMessageId ??
                            item.messageId;
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
                        return React.createElement(fn, props);
                    if (!assistant)
                        return React.createElement(fn, {
                            ...props,
                            item: { ...item, sentAtMs: time },
                        });
                    const title = [
                        time === null ? null : new Date(time).toLocaleString(),
                        model ? `响应模型：${model}` : null,
                        requested && requested !== model
                            ? `请求模型：${requested}`
                            : null,
                        effort ? `思考强度：${effort}` : null,
                    ]
                        .filter(Boolean)
                        .join("\n");
                    const info = React.createElement(
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
                    return React.createElement(fn, {
                        ...props,
                        sourcesAction: React.createElement(
                            React.Fragment,
                            null,
                            props.sourcesAction,
                            info,
                        ),
                    });
                }
                return function (props) {
                    const item = assistant ? props.assistantItem : props.item;
                    return React.createElement(
                        appScope &&
                            item &&
                            (assistant || item.type === "user-message")
                            ? MessageInfo
                            : fn,
                        props,
                    );
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
                                      new Date(props.sentAtMs).toLocaleString(),
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
                        queryKey: ["accounts"],
                        predicate: ({ queryKey }) =>
                            ["check", "full"].includes(queryKey[1]),
                    },
                    { throwOnError: true },
                );
            },
            async loadTurns(includeDetails = false) {
                const conversation = current();
                const scope = appScope;
                if (!conversation) throw new Error("当前会话尚未载入");
                if (!conversation.readOnly) {
                    if (!scope) throw new Error("当前会话状态尚未载入");
                    await native.loadHistory(
                        scope,
                        conversation.serverId ?? conversation.id,
                    );
                }
                if (includeDetails) {
                    if (!scope) throw new Error("当前会话状态尚未载入");
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
                return conversation.readOnly
                    ? conversation.turns
                    : scope.get(native.turns, conversation.id);
            },
            getMessageText(item) {
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
                    const rendered = native.renderMessage(message);
                    return rendered
                        ? native.messageText({
                              content: rendered.markdown,
                              contentReferences: rendered.contentReferences,
                          })
                        : "";
                }
                if (item.type === "user-message") return item.message;
                if (item.type === "assistant-message") {
                    if (!native.messageText)
                        throw new Error("原生复制接口尚未载入");
                    return native.messageText(item);
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
            (event) => {
                try {
                    const detail = event.detail;
                    const active =
                        picker?.pathname === location.pathname ? picker : null;
                    if (!active) throw new Error("当前页面的模型控件尚未载入");
                    if (detail.origin === "chat" || detail.origin === "work") {
                        const conversation = current();
                        if (routeId() !== null) {
                            if (!conversation || !appScope)
                                throw new Error("当前会话状态尚未载入");
                            const origin =
                                detail.origin === "work" ? "tpp" : null;
                            origins.set(conversation.id, origin);
                            if (conversation.serverId)
                                origins.set(conversation.serverId, origin);
                            native.setOrigin(appScope, conversation.id, origin);
                            appScope.queryClient.setQueryData(
                                [
                                    "chatgpt-conversation",
                                    conversation.serverId ?? conversation.id,
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
                        model = {
                            slug: detail.model,
                            thinkingEffort: null,
                            versionId: null,
                        };
                    }
                    if (Object.hasOwn(detail, "thinkingEffort")) {
                        model = {
                            ...(model ?? readModel(active.scope).selectedModel),
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
                        active.onModelChange(model);
                    }
                } catch (error) {
                    report(error);
                    pageWindow.dispatchEvent(
                        new pageWindow.CustomEvent(
                            "checker-next-runtime-model-state",
                            {
                                detail: {
                                    ready: true,
                                    available: false,
                                    error: String(error),
                                },
                            },
                        ),
                    );
                }
            },
        );
        pageWindow.addEventListener("popstate", scheduleState);
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

    function getChatgptModuleExports(source) {
        const [, exports, require] = source.match(
            /^[^(]+\([^,]+,([^,]+),([^)]*)\)\{/,
        );
        const pattern = new RegExp(
            `${RegExp.escape(require)}\\.d\\(${RegExp.escape(exports)},\\{([^{}]*)\\}(?:,\\{([^{}]*)\\})?`,
            "g",
        );
        return Object.fromEntries(
            [...source.matchAll(pattern)].flatMap((match) =>
                [match[1], match[2] ?? ""].flatMap((table) =>
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
        const module = (label, predicate, apply) =>
            patches.push({ label, predicate, apply });
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
                    getChatgptModuleExports(target.source),
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
                append(
                    scopes,
                    `${useScope.name}=${api}.scope(${useScope.name});`,
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
            "输入框模块",
            (source) =>
                source.includes("chatGptSelectionContext:") &&
                source.includes("modelBeforeRateLimit") &&
                source.includes("savedModelPending:"),
            (composer) => {
                const selection = single(
                    [
                        ...composer.source.matchAll(
                            /\(0,[\w$]+\.[\w$]+\)\(([\w$]+)\.([\w$]+),[\w$]+\),\{savedModelPending:/g,
                        ),
                    ],
                    "模型状态接口",
                );
                const selectionModule = single(
                    [
                        ...composer.source.matchAll(
                            new RegExp(
                                `(?:[\\s,;])${RegExp.escape(selection[1])}=[\\w$]+\\(["']([^"']+)["']\\)`,
                                "g",
                            ),
                        ),
                    ],
                    "模型状态模块",
                )[1];
                bindings.selection = [selectionModule, selection[2]];
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
        );

        module(
            "完整会话模块",
            (source) =>
                source.includes('queryKey:["chatgpt-conversation-full",') &&
                source.includes("forceFull:!0"),
            (history) => {
                const loadHistory = exported(
                    history,
                    "完整会话加载接口",
                    (source) =>
                        source.includes(
                            'queryKey:["chatgpt-conversation-full",',
                        ),
                );
                bindings.loadHistory = [history.id, loadHistory.exportName];
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

        const matchesLocation = (source) =>
            /return [\w$]+\?\.pathname===[\w$]+\.value\.pathname&&[\w$]+\.search===/.test(
                source,
            );
        module("页面路由模块", matchesLocation, (router) => {
            const matchLocation = exported(
                router,
                "页面地址接口",
                matchesLocation,
            );
            const locationSignal = single(
                [...matchLocation.toString().matchAll(/\.get\(([\w$]+)\)/g)],
                "页面地址信号",
            )[1];
            const locationExport = single(
                [
                    ...router.source.matchAll(
                        new RegExp(
                            `(?:[,{])([\\w$]+):${RegExp.escape(locationSignal)}(?=[,}])`,
                            "g",
                        ),
                    ),
                ],
                "页面地址导出",
            )[1];
            bindings.location = [router.id, locationExport];
        });

        module(
            "会话状态模块",
            (source) =>
                source.includes("conversationOrigin:") &&
                source.includes("asyncStatus:") &&
                source.includes("currentNode:") &&
                source.includes("serverConversationId:"),
            (conversation) => {
                const setOrigin = exported(
                    conversation,
                    "会话模式接口",
                    (source) =>
                        /^function [\w$]+\([\w$]+,[\w$]+,[\w$]+\)\{let [\w$]+=[\w$]+\([\w$]+\.get,[\w$]+\);/.test(
                            source,
                        ) && /conversationOrigin:[\w$]+\?\?null/.test(source),
                );
                const store = single(
                    [
                        ...setOrigin
                            .toString()
                            .matchAll(/&&([\w$]+)\([\w$]+,\{\.\.\./g),
                    ],
                    "会话存储接口",
                )[1];
                append(conversation, `${store}=${api}.conversation(${store});`);
                bindings.setOrigin = [conversation.id, setOrigin.exportName];
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
                        source.includes('return"extension"'),
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
            "消息操作模块",
            (source) =>
                source.includes("copyPlainTextFromSource") &&
                source.includes("suppressCopyTurnToClipboardAnalytics") &&
                source.includes("getCopyHtml"),
            (messages) => {
                const copyText = single(
                    [
                        ...messages.source.matchAll(
                            /([\w$]+)\?\.completed===!0\?(function\(([\w$]+)\)\{if\(null==\3\)return"";[\s\S]*?return [^;{}]+\.join\(""\)\})\(\1\)/g,
                        ),
                    ],
                    "原生消息复制接口",
                );
                replace(messages, copyText[2], "checkerNextMessageText");
                append(
                    messages,
                    `const checkerNextMessageText=${copyText[2]};${api}.register({messageText:checkerNextMessageText});`,
                );
                const approval = single(
                    [
                        ...messages.source.matchAll(
                            /let [\w$]+=([\w$]+);return [\w$]+\.request\?\.body\.codex_mcp_elicitation\?\.kind==="openaiForm"/g,
                        ),
                    ],
                    "授权组件",
                )[1];
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
                append(
                    messages,
                    `${approval}=${api}.approval(${approval},${react});`,
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
                                        "additionalTurnActions:",
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
                source.includes('queryKey:["accounts","full",') &&
                source.includes('"/accounts/check/{version}"'),
            (fullAccounts) => {
                const accountQuery = single(
                    [
                        ...fullAccounts.source.matchAll(
                            /queryFn:(async [\w$]+=>\{[\s\S]*?\})(?=,staleTime:)/g,
                        ),
                    ],
                    "完整账号查询接口",
                );
                replace(
                    fullAccounts,
                    accountQuery[1],
                    `async (...args)=>{const result=await (${accountQuery[1]})(...args),plan=${fakePlan};return plan?{...result,accounts:Object.fromEntries(Object.entries(result.accounts).map(([id,entry])=>[id,{...entry,account:{...entry.account,plan_type:plan}}]))}:result}`,
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
        const data = [
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
        const copyIcons = {};
        for (const [state, name] of [
            ["idle", "square-on-square-light-16"],
            ["success", "checkmark-lg-light-16"],
            ["error", "circle-exclamation-mark-light-16"],
        ]) {
            data.push({
                label: `${state}图标`,
                predicate: (source) => source.includes(`name:"${name}"`),
                read(exports) {
                    const icon = single(
                        Object.values(exports).filter(
                            (value) =>
                                value?.name === name &&
                                value.canvas &&
                                typeof value.body === "string",
                        ),
                        `${state}图标`,
                    );
                    copyIcons[state] = { ...icon.canvas, body: icon.body };
                    if (
                        ["idle", "success", "error"].every(
                            (state) => copyIcons[state],
                        )
                    ) {
                        chatgptCopyIcons = copyIcons;
                        syncChatgptCopyButton();
                    }
                },
            });
        }
        return data;
    }

    function getChatgptModuleItems() {
        const items = ["运行时模型切换"];
        if (chatgptCopyButtonEnabled) items.push("复制全文");
        if (chatgptMessageInfoEnabled) items.push("显示时间和模型");
        if (chatgptApprovalEnabled) items.push("自动批准工具请求");
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
            console.error("[CheckerNext] 更新会员设置失败:", error);
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

    function updateChatgptRuntimeModelCatalog(origin, data) {
        if (!isChatgptMode || (origin !== "chat" && origin !== "work")) return;
        if (!Array.isArray(data?.models)) {
            reportChatgptFailure(`ChatGPT ${origin} 模型列表格式无效。`);
        }
        chatgptRuntimeModelCatalogs[origin] = Array.isArray(data?.models)
            ? data.models.flatMap((model) => {
                  if (typeof model?.slug !== "string" || !model.slug.trim()) {
                      return [];
                  }
                  return [
                      {
                          slug: model.slug.trim(),
                          title:
                              typeof model.title === "string" &&
                              model.title.trim()
                                  ? model.title.trim()
                                  : model.slug.trim(),
                          thinkingEfforts: Array.isArray(model.thinking_efforts)
                              ? model.thinking_efforts
                                    .map((effort) =>
                                        typeof effort === "string"
                                            ? effort
                                            : effort?.thinking_effort,
                                    )
                                    .filter(
                                        (effort) =>
                                            typeof effort === "string" &&
                                            effort.trim(),
                                    )
                              : [],
                      },
                  ];
              })
            : [];
        updateChatgptRuntimeModelOptions();
    }

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
        const models = chatgptRuntimeModelCatalogs[originSelect.value] || [];
        const createPlaceholder = (
            text = chatgptRuntimeModelState?.available ? "默认" : "读取中…",
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
        const efforts = [...new Set(selectedModel?.thinkingEfforts || [])].map(
            String,
        );
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

    function updateChatgptInjectionStatus() {
        if (!isChatgptMode) return;
        const status = document.getElementById("chatgpt-injection-status");
        const tooltip = document.getElementById(
            "chatgpt-module-injection-tooltip-box",
        );
        if (!status) return;

        const items = getChatgptModuleItems()
            .map((item) => `• ${item}`)
            .join("\n");
        let label = "加载中";
        let color = "#bbbbbb";
        let description = "正在加载 ChatGPT 页面模块。";
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
        } else if (pageWindow.__checkerNextModulesInstalled) {
            label = "注入成功";
            color = "#98fb98";
            description = `当前页面已注入：\n${items}`;
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

        const controlsDisabled = !chatgptModuleInjectionStarted;
        originSelect.disabled = controlsDisabled;
        modelSelect.disabled = controlsDisabled;
        thinkingSelect.disabled = controlsDisabled;

        const state = chatgptRuntimeModelState;
        let modelValue;
        let thinkingValue;
        if (state?.available) {
            if (
                document.activeElement !== originSelect &&
                (state.origin === "chat" || state.origin === "work")
            ) {
                originSelect.value = state.origin;
            }
            if (
                document.activeElement !== modelSelect &&
                typeof state.model === "string"
            ) {
                modelValue = state.model;
            }
            if (document.activeElement !== thinkingSelect) {
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
                    reportChatgptFailure("ChatGPT 运行时模型返回了无效状态。");
                    return;
                }
                chatgptRuntimeModelState = event.detail;
                if (event.detail.error) {
                    reportChatgptFailure(
                        `ChatGPT 运行时模型出错：${event.detail.error}`,
                    );
                }
                updateChatgptRuntimeModelControls();
                syncChatgptCopyButton();
            },
        );
        pageWindow.addEventListener("load", updateChatgptInjectionStatus, {
            once: true,
        });
    }

    function formatChatgptConversation(turns) {
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

    function setChatgptCopyButtonState(button, state, icons) {
        const icon =
            state === "success"
                ? icons.success
                : state === "error"
                  ? icons.error
                  : icons.idle;
        const targets = button.lastElementChild?.querySelectorAll("svg") ?? [];
        for (const target of targets) target.replaceWith(icon.cloneNode(true));
        const label =
            state === "loading"
                ? "正在复制"
                : state === "success"
                  ? "已复制"
                  : state === "error"
                    ? "复制失败"
                    : "复制全文";
        button.setAttribute("aria-label", label);
        button.title = label;
    }

    function syncChatgptCopyButton() {
        const existing = document.getElementById(
            "checker-next-copy-conversation-button",
        );
        const pathname = pageWindow.location.pathname;
        const isConversationPath =
            /^\/(?:c|share|g\/[^/]+\/(?:shared\/)?c)\/[^/]+$/.test(pathname);
        if (!chatgptCopyButtonEnabled || !isConversationPath) {
            existing?.remove();
            if (chatgptCopyButtonEnabled && pathname.includes("/c/")) {
                reportChatgptFailure(
                    `未识别 ChatGPT 会话路径，复制按钮无法插入：${pathname}`,
                );
            }
            return;
        }
        const runtimeReady =
            chatgptModuleInjectionStarted &&
            chatgptRuntimeModelState?.pathname === pathname;
        if (!runtimeReady) {
            existing?.remove();
            return;
        }
        const ready = chatgptRuntimeModelState.copyReady;
        if (
            existing instanceof HTMLButtonElement &&
            existing.dataset.pathname === pathname &&
            existing.disabled === !ready
        ) {
            return;
        }
        if (existing instanceof HTMLButtonElement) {
            existing.dataset.pathname = pathname;
            existing.disabled = !ready;
            return;
        }

        const nativeButton = [
            ...document.querySelectorAll(
                'header[data-app-shell-titlebar] button[aria-haspopup="menu"]',
            ),
        ].findLast((button) => !button.closest('[aria-hidden="true"]'));
        if (!nativeButton || !chatgptCopyIcons) return;

        const button = nativeButton.cloneNode(true);
        const nativeIcons = [
            ...(button.lastElementChild?.querySelectorAll("svg") ?? []),
        ];
        if (
            !(button instanceof HTMLButtonElement) ||
            nativeIcons.length === 0
        ) {
            return;
        }
        const icons = Object.fromEntries(
            ["idle", "success", "error"].map((state) => {
                const source = chatgptCopyIcons[state];
                const icon = nativeIcons[0].cloneNode(false);
                icon.setAttribute("width", source.width);
                icon.setAttribute("height", source.height);
                icon.setAttribute("viewBox", source.viewBox);
                icon.setAttribute("fill", "currentColor");
                icon.innerHTML = source.body;
                return [state, icon];
            }),
        );

        button.id = "checker-next-copy-conversation-button";
        button.type = "button";
        button.dataset.pathname = pathname;
        button.disabled = !ready;
        setChatgptCopyButtonState(button, "idle", icons);
        let copying = false;
        button.addEventListener("click", async () => {
            if (copying) return;
            copying = true;
            setChatgptCopyButtonState(button, "loading", icons);
            try {
                const currentTurns =
                    await pageWindow.__checkerNextRuntimeModelBridge.loadTurns(
                        chatgptCopyDetailsEnabled,
                    );
                if (!Array.isArray(currentTurns)) {
                    throw new Error("当前会话尚未载入");
                }
                await pageWindow.navigator.clipboard.writeText(
                    formatChatgptConversation(currentTurns),
                );
                setChatgptCopyButtonState(button, "success", icons);
            } catch (error) {
                console.error("[CheckerNext] 复制会话失败:", error);
                setChatgptCopyButtonState(button, "error", icons);
            } finally {
                copying = false;
            }
            setTimeout(
                () => setChatgptCopyButtonState(button, "idle", icons),
                1000,
            );
        });
        nativeButton.before(button);
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
            <span id="user-region-container" style="display: block">用户地区：<span id="user-region">${userRegionValue || "..."}</span></span>
            <span id="price-region-container" style="display: block">价格地区：<span id="price-region">${priceRegionCode || "..."}</span></span>
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
            "这个数值越大，相当于 ChatGPT 认为你的 IP 风险越低。",
        );

        // 创建 Codex 提示框
        const codexTooltipBox = createTooltip(
            "codex-tooltip-box",
            isCodexMode ? "首次使用后开始计时。" : "打开“使用情况”后加载。",
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
            syncChatgptCopyButton();
        }

        function bindChatgptCopyButtonToggle() {
            const toggle = document.getElementById(
                "chatgpt-copy-button-toggle",
            );
            if (!(toggle instanceof HTMLInputElement)) return;

            updateChatgptCopyButtonToggle();
            toggle.addEventListener("change", () => {
                chatgptCopyButtonEnabled = toggle.checked;
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
                thinkingSelect.value = "";
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
        if (isChatgptMode) syncChatgptCopyButton();
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

        appendRateLimit(data?.rate_limit, "代码");
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
            section.style.marginTop = powFetched ? "10px" : "0";
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
        if (Number(balanceRaw) > 0) {
            valueEl.innerText = balanceRaw;
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
                    `第${index + 1}次到期：${formatCodexAbsoluteTime(credit.expires_at) || "..."}`,
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

            const tooltipText = formatCodexAbsoluteTime(window.resetAt);
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
        section.style.marginTop = powFetched ? "10px" : "0";
        if (isResetTimestampNear(resetAfter, Date.now() + resetPeriod)) {
            usageEl.innerHTML = `${remaining}次${NOT_STARTED_BADGE}`;
        } else {
            usageEl.innerText = `${remaining}次`;
        }

        resetEl.innerText = resetAfter
            ? new Date(resetAfter)
                  .toLocaleString("zh-CN", { hour12: false })
                  .replace(/\//g, "-")
            : "...";
    }

    function updateUserRegion(country, region) {
        if (!isChatgptMode || typeof country !== "string" || !country.trim())
            return;

        const parts = [country.trim()];
        if (typeof region === "string" && region.trim()) {
            parts.push(region.trim());
        }
        userRegionValue = parts.join(" / ");

        const container = document.getElementById("user-region-container");
        const valueEl = document.getElementById("user-region");
        if (!container || !valueEl) return;
        valueEl.innerText = userRegionValue;
        container.style.display = "block";
    }

    function updatePriceRegion(countryCode) {
        if (
            !isChatgptMode ||
            typeof countryCode !== "string" ||
            !countryCode.trim()
        )
            return;

        priceRegionCode = countryCode.trim().toUpperCase();

        const container = document.getElementById("price-region-container");
        const valueEl = document.getElementById("price-region");
        if (!container || !valueEl) return;
        valueEl.innerText = priceRegionCode;
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
            try {
                const data = await response.clone().json();
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

                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理响应或重新创建响应时出错:", e);
                const difficultyElement = document.getElementById("difficulty");
                if (difficultyElement) difficultyElement.innerText = "...";
                updateDifficultyIndicator("...");
                const personaElement = document.getElementById("persona");
                if (personaElement) personaElement.innerText = "...";

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
            try {
                const data = await response.clone().json();
                updateUserRegion(
                    typeof data?.country === "string" ? data.country : null,
                    typeof data?.region === "string" ? data.region : null,
                );
                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理用户地区响应出错:", e);
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
            try {
                const data = await response.clone().json();
                updatePriceRegion(
                    typeof data?.country_code === "string"
                        ? data.country_code
                        : null,
                );
                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理价格地区响应出错:", e);
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
                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理记忆用量响应出错:", e);
                return response;
            }
        }

        if (
            /\/backend-api\/tpp\/models\/?(?:[?#]|$)/.test(requestUrl) &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isChatgptMode) return response;
            try {
                updateChatgptRuntimeModelCatalog(
                    "work",
                    await response.clone().json(),
                );
                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理 Work 模型响应出错:", e);
                return response;
            }
        }

        if (
            /\/backend-api\/models\/?(?:[?#]|$)/.test(requestUrl) &&
            finalMethod === "GET" &&
            response.ok
        ) {
            if (!isChatgptMode) return response;
            try {
                updateChatgptRuntimeModelCatalog(
                    "chat",
                    await response.clone().json(),
                );
                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理 Chat 模型响应出错:", e);
                return response;
            }
        }

        if (
            requestUrl.includes("/backend-api/conversation/init") &&
            finalMethod === "POST" &&
            response.ok
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
                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理功能用量响应出错:", e);
                return response;
            }
        }

        if (
            /\/backend-api\/wham\/usage\/?(?:[?#]|$)/.test(requestUrl) &&
            finalMethod === "GET" &&
            response.ok
        ) {
            try {
                const data = await response.clone().json();
                updateCodexInfo(getCodexUsageWindows(data));
                updateCodexCredits(data?.credits);
                updateCodexResetCredits(data?.rate_limit_reset_credits);
                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理 Codex 响应出错:", e);
                return response;
            }
        }

        if (
            /\/backend-api\/wham\/rate-limit-reset-credits\/?(?:[?#]|$)/.test(
                requestUrl,
            ) &&
            finalMethod === "GET" &&
            response.ok
        ) {
            try {
                updateCodexResetCredits(await response.clone().json());
                return response;
            } catch (e) {
                console.error("[CheckerNext] 处理 Codex 重置机会响应出错:", e);
                return response;
            }
        }

        return response;
    };
})();
