// ==UserScript==
// @name         BiliFilter3
// @namespace    https://github.com/ChizhaoEngine/BiliFilter
// @version      0.3.13.3
// @description  杀掉你不想看到的东西
// @author       池沼动力
// @license      CC BY-NC-ND 4.0
// @copyright    CC BY-NC-ND 4.0
// @match        *.bilibili.com/*
// @icon         https://s2.loli.net/2023/01/24/caWi5nrZJDuvFsy.png
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceURL
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM.setClipboard
// @grant        GM_addStyle
// @connect      *
// @require     https://cdn.jsdelivr.net/npm/vue/dist/vue.js
// @updateURL    https://raw.githubusercontent.com/ChizhaoEngine/BiliFilter/main/bft.user.js
// @downloadURL  https://raw.githubusercontent.com/ChizhaoEngine/BiliFilter/main/bft.user.js



// ==/UserScript==

(function () {
    'use strict';
    GM_addStyle(`
    /*  文本黑幕  */
    .bft-heimu span {

        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .bft-heimu:hover span {
        opacity: 1;
    }

    /*  内容覆盖层  */
    .bft-overlay {
        position: relative;
    }

    .bft-overlay::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #faf9f9;
        opacity: 1;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 5;
        /* 提高层级，使覆盖层在内容上方 */
        border-radius: 5px;
    }

    .bft-overlay:hover::after {
        opacity: 0;
    }

    /* bft 统一样式 */
    /* 设置悬浮窗 */
    .bft-setting-window {
        display: block;
        position: fixed;
        top: 20px;
        /* 距离顶部的距离 */
        right: 20px;
        /* 距离右侧的距离 */
        /* 边距 */
        margin: auto;
        /* 宽度 */
        min-width: 35vh;
        max-width: 728px;
        /* 背景 */
        background-color: #efecfa;
        /* 圆角 */
        border-radius: 20px;
        transition: width 2s;
        width: auto;
        /*  层 */
        z-index: 9999;
    }

    .bft-setting-title {
        padding: 40px 24px 20px 24px;
        box-sizing: border-box;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        text-align: left;
    }

    small {
        font-size: 80%;
        opacity: 0.5;
    }

    /* 悬浮窗内容 */
    .bft-setting-contain {
        box-sizing: border-box;
        padding: 24px 24px 0px 24px;
        overflow-y: auto;
        font-size: 15px;
        line-height: 1.5;
        max-height: 75vh;
    }


    /* 规则集面板内容 */
    .bft-ruleset {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        box-sizing: border-box;
        min-height: 48px;
        padding: 0 16px;
        background-color: #fbf8ff;
        border-radius: 10px;
        margin-bottom: 10px;
        transition: height 0.5s, width 0.5s;
        /* 过渡效果，同时设置高度和宽度属性在0.5秒内变化 */
        height: auto;
        /* 设置为auto时，高度会自动根据内容变化 */
    }

    /* 规则集面板图标 */
    .bft-ruleset-icon {
        border-radius: 8px !important;
        min-width: 40px;
        max-width: 40px;
        height: 40px;
        margin-top: 8px;
        margin-bottom: 8px;
        line-height: 40px;
        background-color: #aaa6f4;
        /* 居中 */
        display: flex;
        /* 水平居中 */
        justify-content: center;
        /* 垂直居中 */
        align-items: center;
    }

    /* 规则集信息容器 */
    .bft-ruleset-info {
        flex-grow: 1;
        padding-top: 14px;
        padding-bottom: 14px;
        font-weight: 400;
        font-size: 16px;
        line-height: 20px;
        margin-left: 15px;
    }

    /* 规则集标题 */
    .bft-ruleset-info-title {
        max-width: 180px;
        /* 设置文本超过容器宽度时截断 */
        white-space: nowrap;
        /* 超过容器宽度的部分用省略号代替 */
        text-overflow: ellipsis;
        /* 隐藏超出容器宽度的内容 */
        overflow: hidden;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: .04em;

    }

    .bft-ruleset-info-title small {
        margin-left: 5px;
    }

    /* 规则集其余信息 */
    .bft-ruleset-info-other {
        font-weight: 300;
        font-size: 14px;
        letter-spacing: .04em;
        opacity: 0.5;
    }

    /* 规则集操作 */

    .bft-ruleset-action {
        margin-left: 10px;
        min-width: 80px;
        display: flex;
    }



    /* 规则集操作：复选框 */
    .bft-ruleset-action input[type="checkbox"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin-right: 6px;
        margin-top: 8px;
        width: 14px;
        height: 14px;
        border: 1.5px solid gray;
        border-radius: 4px;
        outline: none;
    }

    /* Unchecked state */
    .bft-ruleset-action input[type="checkbox"]:not(:checked) {
        background-color: #fff;
    }

    /* Checked state */
    .bft-ruleset-action input[type="checkbox"]:checked {
        background-color: gray;
        border-color: gray;
    }

    /* Custom checkmark icon */
    .bft-ruleset-action input[type="checkbox"]::before {
        content: "";
        display: inline-block;
        width: 5px;
        height: 1px;
        border: solid #fff;
        border-width: 0 0 2px 2px;
        transform: rotate(-45deg);
        position: relative;
        top: -5px;
        left: 2px;
        visibility: hidden;
        font-family: revert;
        box-sizing: revert;
    }

    /* Show checkmark for checked checkboxes */
    .bft-ruleset-action input[type="checkbox"]:checked::before {
        visibility: visible;
    }

    /* 规则集编辑面板内容 */
    .bft-ruleset-contain {
        padding-bottom: 14px;
        padding-top: 14px;
        font-weight: 400;
        font-size: 16px;
        line-height: 20px;
        flex-grow: 2;
        display: flex;
        flex-wrap: wrap;
    }



    /* 用户过滤：规则条目操作 */
    .bft-ruleset-rulelist-action {
        margin: 10px;
    }

    /* 规则列表 */
    .bft-ruleset-rulelist-list {
        display: flex;
        flex-wrap: wrap;
    }

    /* 规则条目 */
    .bft-ruleset-rulelist-item {
        display: flex;
        width: 280px;
        flex-wrap: wrap;
        margin-left: 10px;
    }

    /* 条目操作按钮 */
    .bft-ruleset-rulelist-item button {
        margin-top: 5px;
        margin-right: 8px;
    }

    /* 条目输入框 */
    .bft-ruleset-rulelist-item .bft-input-container {
        width: 120px;
    }

    /* 条目标签 */
    .bft-ruleset-rulelist-item h1 {
        font-size: 1em;
        margin-left: 10px;
        width: 95px;
        margin: 10px 0px 0px 10px;
        font-weight: revert;
    }

    .bft-ruleset-rulelist-item h2 {
        margin-top: 10px;
        font-size: 0.7em;
        color: gray;
        font-weight: revert;
        line-height: revert;
    }



    /* 悬浮窗操作 */
    .bft-setting-action {
        box-sizing: border-box;
        padding: 10px 24px 20px 24px;
        text-align: right;
    }

    /* 关于  */
    .bft-about {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        min-height: 48px;
        padding: 0 16px;
        background-color: #fbf8ff;
        border-radius: 10px;
        margin-bottom: 10px;
        transition: height 0.5s, width 0.5s;
        height: auto;
        flex-wrap: wrap;
        flex-direction: column;
        width: 300px;
    }

    .bft-about h1 {
        font-size: 1em;
        color: #7469ae;
        margin: 10px;
        padding: 0;
    }

    .bft-about p {
        font-size: 0.7em;
        color: #787878;
        margin: 10px;
    }

    .bft-about a {
        color: #787878;
        margin: 10px;
        cursor: pointer;
        text-decoration: none;
    }

    /* 右侧悬浮按钮 fab */
    .bft-fab {
        position: fixed;
        bottom: 40vh;
        right: -25px;
        transition: right 0.3s ease-in-out;
        z-index: 9999;
    }

    .bft-fab:hover {
        right: 0;
    }


    .bft-fab-big {
        width: 50px;
        height: 50px;
        background-color: #f6f6f6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .bft-fab-big svg{
        fill: #cdcdcd;
    }

    .bft-fab:hover .bft-fab-mini-contain {
        right: 10px;
        opacity: 1;
    }

    .bft-fab-mini-contain {
        display: flex;
        flex-direction: column;
        position: absolute;
        padding-bottom: 20px;
        bottom: 40px;
        right: -150px;
        opacity: 0;
        transition: right 1s linear(0 0%, 0 1.8%, 0.01 3.6%, 0.03 6.35%, 0.07 9.1%, 0.13 11.4%, 0.19 13.4%, 0.27 15%, 0.34 16.1%, 0.54 18.35%, 0.66 20.6%, 0.72 22.4%, 0.77 24.6%, 0.81 27.3%, 0.85 30.4%, 0.88 35.1%, 0.92 40.6%, 0.94 47.2%, 0.96 55%, 0.98 64%, 0.99 74.4%, 1 86.4%, 1 100%), opacity 0.3s ease-in-out;
    }

    .bft-fab-mini {
        display: flex;
        align-items: center;
        background-color: #f0ecfa;
        border-radius: 50px;
        margin-bottom: 10px;
        padding: 6px 12px;
        cursor: pointer;
        transition: background-color 0.3s ease-in-out;
    }

    .bft-fab-mini:hover {
        background-color: #e7e5f2;
    }

    .bft-fab-mini svg {
        fill: #afa3f4;
        margin-right: 8px;
    }

    .bft-fab-mini-label {
        font-size: 14px;
        color: #5a4969;
        white-space: nowrap;
    }

    .bft-fab-mini:last-child {
        margin-bottom: 0;
    }

    /* 其他组件 */
    /* 图标 */


    .bft-icon {
        display: block;
        width: 60%;
        /* 调整图标宽度根据需要 */
        height: 60%;
        /* 调整图标高度根据需要 */
        fill: white;
        /* 设置图标颜色 */
        text-align: center;
        /* 居中文本 */
        line-height: 24px;
        /* 确保图标在垂直方向居中 */
    }

    /* 按钮 */
    .bft-button {
        cursor: pointer;
        border-radius: 25px;
        background-color: #ffffff;
        border: none;
        height: 30px;
        min-width: 50px;
        padding: 5px 10px;
        font-size: 85%;
    }


    .bft-button:hover {
        background-color: #ece4fc;
    }

    .bft-button:active {
        background-color: #d5c8f7;
    }

    /* 图标按钮 */
    button.bft-button-icon {
        background-color: #fff;
        margin-left: 3px;
        width: 30px;
        height: 30px;
        font-size: 14px;
        line-height: 36px;
        letter-spacing: .04em;
        text-transform: uppercase;
        border: none;
        border-radius: 100px;
        outline: 0;
        cursor: pointer;
        touch-action: manipulation;
        will-change: box-shadow;
        padding: 7px;

        /* 居中 */
        display: flex;
        /* 水平居中 */
        justify-content: center;
        /* 垂直居中 */
        align-items: center;
    }

    button.bft-button-icon:hover {
        background-color: #ece4fc;

    }

    button.bft-button-icon:active {
        background-color: #d5c8f7;
    }

    button.bft-button-icon svg {
        height: 100%;
        width: 100%;
        fill: gray;
    }

    /* 覆盖B站的 :focus 样式 */
    body button:focus {
        background-color: white;
        outline: revert;
    }

    /* 文本框 */
    /* 输入框容器样式 */
    .bft-input-container {
        position: relative;
        margin: 10px;
        width: 280px;
        margin: 15px 10px 10px 10px;
    }

    /* 输入框样式 */
    .bft-input-field {
        width: 100%;
        padding: 5px 0;
        border: none;
        border-bottom: 2px solid #a6a6a6;
        outline: none;
        background: transparent;
        transition: border-bottom-color 0.3s ease;
        font-size: revert;
    }

    /* 删除输入框部分样式 */
    /* Firefox */
    input[type='number'] {
        -moz-appearance: textfield;
    }

    /* Webkit browsers like Safari and Chrome */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }


    /* 输入框获取焦点时下划线颜色变化 */
    .bft-input-field:focus {
        border-bottom-color: #8a80c1;
    }

    /* 输入框的placeholder标签样式 */
    .bft-input-label {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        transition: 0.3s ease all;
        color: gray;
    }

    /* 输入框获得焦点或有值时标签上移 */
    .bft-input-field:focus~.bft-input-label,
    .bft-input-field:valid~.bft-input-label {
        top: -15px;
        font-size: 14px;
        color: #8a80c1;
    }

    /* 输入框底部的边框条样式 */
    .bft-input-bar {
        position: absolute;
        bottom: 0;
        display: block;
        width: 0;
        height: 2px;
        background-color: #8a80c1;
        transition: 0.3s ease all;
    }

    /* 输入框获得焦点时底部边框条扩展 */
    .bft-input-field:focus~.bft-input-bar {
        width: 100%;
    }

    /* 无效值时的文本框 */
    /* 输入框样式 */
    .bft-input-field:invalid {
        width: 100%;
        padding: 5px 0;
        border: none;
        border-bottom: 2px solid #ff7272;
        outline: none;
        background: transparent;
        transition: border-bottom-color 0.3s ease;
    }

    .bft-input-field:focus:invalid {
        border-bottom-color: #ff9e9e;
    }

    .bft-input-label:invalid {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        transition: 0.3s ease all;
        color: gray;
    }

    .bft-input-field:invalid~.bft-input-label {
        top: -15px;
        font-size: 14px;
        color: #ff9e9e;
    }

    .bft-input-bar:invalid {
        position: absolute;
        bottom: 0;
        display: block;
        width: 0;
        height: 2px;
        background-color: #ff9e9e;
        transition: 0.3s ease all;
    }

    .bft-input-field:focus~.bft-input-bar:invalid {
        width: 100%;
    }

    /* 多行输入框 */

    .bft-textarea-container {
        min-width: 95px;
        margin: 10px;
        display: flex;
        max-width: 280px;
        flex-wrap: wrap;
    }

    .bft-textarea-container label {
        margin: 10px;
        width: 280px;
        font-size: 0.9em;
        color: gray;
    }

    .bft-textarea-container textarea {
        min-width: 80px;
        width: 280px;
        height: 80px;
        margin: 10px;
        border: none;
        width: 100%;
        padding: 10px;
        border-radius: 10px;
        outline: none;
        resize: vertical;
        background-color: #fff;
        /* 可以让用户在垂直方向调整Textarea大小 */
    }

    .bft-textarea-container textarea:focus {
        border: none;
    }

    /* 下拉选项框 */
    .bft-select {
        width: 200px;
        height: 36px;
        padding-right: 24px;
        padding-left: 20px;
        margin: 8px;
        font-size: 16px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M-.003 2.5l5 5 5-5h-10z' opacity='.54'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right center;
        border: none;
        border-radius: 10px;
        outline: 0;
        cursor: pointer;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    label.bft-select-label {
        margin: 15px;
        font-size: 0.9em;
        color: gray;
    }

    /*  Snackbar */

    .bft-snackbar-container {
        position: fixed;
        top: 16px;
        right: 10px;
        z-index: 9999;
        /* 提高层级，使覆盖层在内容上方 */
    }

    .bft-snackbar {
        margin-top: 8px;
        background-color: #ffffff;
        color: #000;
        padding: 8px 24px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        display: flex;
        font-size: 0.9em;
    }

    .bft-snackbar-icon {
        display: flex;
        align-items: center;
    }

    .bft-snackbar-icon svg {
        height: 30px;
        width: 30px;
        fill: revert;
    }

    .bft-snackbar-content {
        display: flex;
        font-size: 1em;
        align-items: center;
        margin-left: 10px;
        padding: 15px 0;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .bft-snackbar button {
        color: #7469ae;
        background-color: #ffffff;
        border: none;
        border-radius: 10px;
        padding: 0px 5px;
        cursor: pointer;
        margin-left: 16px;
        font-size: 0.9em;
        white-space: nowrap;
    }

    .bft-snackbar button:hover {
        background-color: #e6e6e6;
    }

    /* 可交互式对话框 */
    .bft-dialog-model {
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.4);
    }

    .bft-dialog {
        display: block;
        position: relative;
        top: 30px;
        margin: auto;
        min-width: 25vh;
        max-width: 418px;
        min-height: 15px;
        background-color: #fff;
        border-radius: 20px;
        transition: width 2s;
        width: auto;
        z-index: 9999;
    }

    .bft-dialog-title {
        padding: 16px 15px 10px 15px;
        box-sizing: border-box;
        font-weight: 500;
        font-size: 15px;
        line-height: 24px;
        text-align: left;
    }

    .bft-dialog-content {
        padding: 15px;
        font-size: 12px;
        display: flex;
        flex-wrap: wrap;
    }

    .bft-dialog-action {
        box-sizing: border-box;
        padding: 0px 15px 12px 15px;
        text-align: right;
    }



    /* 样式工具 */
    /* 浮动左 */
    .bft-flow-left {
        float: left !important;
    }

    .bft-flow-right {
        float: right !important;
    }





    `);
    // 当浏览器关闭时,将面板标记为关闭
    window.addEventListener('beforeunload', () => {
        // 只有当本页面有设置面板打开时才需要
        if (document.getElementById('bft-menu')) {
            // 添加已关闭面板的标记
            GM_setValue("temp_isMenuOpen", false);
        }
    });




    // 载入规则
    var textFilterRules = GM_getValue("textFilterRules", []);
    var otherFilterRules = GM_getValue("otherFilterRules", { duration: 0 });
    var userFilterRules = GM_getValue("userFilterRules", []);
    // 重载规则&重置过滤
    function reloadRules() {
        textFilterRules = GM_getValue("textFilterRules", []);
        otherFilterRules = GM_getValue("otherFilterRules", { duration: 0 });
        userFilterRules = GM_getValue("userFilterRules", []);
        // 重置已过滤项
        let target = document.querySelectorAll('.bft-textFiltered, .bft-heimu, .bft-overlay, .bft-duration-filtered, .bft-user-filtered');
        target.forEach(element => {
            element.classList.remove('bft-textFiltered', 'bft-heimu', 'bft-overlay', 'bft-duration-filtered', 'bft-user-filtered');
        });


    }
    // 1s执行一次过滤
    setInterval(findAndBlock, GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).filterInterval * 1000);
    // 每隔 一段时间 对远程配置文件 检测更新
    setInterval(autoUpdateTextRulesets, 5000);
    setInterval(autoUpdateUserRulesets, 5000);

    // 定义设置菜单
    const menu_bft_userFilter = GM_registerMenuCommand("🐂用户过滤设置", function () {
        bftSettingMenu_userFilter();
    });
    const menu_bft_settingRules = GM_registerMenuCommand("📄内容过滤设置", function () {
        bftSettingMenu_textFilter();
    });

    const menu_bft_otherFilter = GM_registerMenuCommand("⏱️其他过滤设置", function () {
        bftSettingMenu_otherFilter();
    });
    const menu_bft_setting = GM_registerMenuCommand("🦴杂项设置", function () {
        bftSettingMenu_setting();
    });
    const dialog_bft_about = GM_registerMenuCommand("🔖关于", function () {
        bftAboutDialog();
    });
    //根据不同页面执行不同过滤
    function findAndBlock() {
        if (window.location.hostname === "search.bilibili.com") {
            findTextandBlockinSearch();
            findDurationandBlockinSearch();
        }
        else if (window.location.href.includes("www.bilibili.com/video/")) {
            findTextandBlockinVideo();
            findDurationandBlockinVideo();
            findUserandBlockinVideo();
            filterVideoofVideo();
            // 快速加入用户
            if (GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).enableFastAddUserFilterRules) {
                addFastAddUserButtonInVideo();
            }
        } else if (window.location.href.includes("www.bilibili.com/read/")) {
            findTextandBlockinArticle();
        } else if (window.location.href.includes("www.bilibili.com/v/")) {
            findTextandBlockinFenqu1();
        } else if (window.location.hostname === "www.bilibili.com" && window.location.pathname === "/") {
            findTextandBlockinIndex();
            findDurationandBlockinIndex();
            filterVideoofFeedinIndex();
        } else if (window.location.href.includes("space.bilibili.com/")) {
            // 快速加入用户
            if (GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).enableFastAddUserFilterRules) {
                addFastAddUserButtonInSpace();
            }
        }
    };
    //
    //
    // 为每个界面都添加菜单按钮
    addOpenMenuButton();



    //--------------------------------------------------------------------------------
    //对页面直接修改的函数
    //--------------------------------------------------------------------------------
    //----------------------------------------
    // 用户过滤
    //----------------------------------------
    // 定义isUserNeedFilter函数，查询是否屏蔽该用户，参数为uid，返回一个数组 [true/false,用户所属规则集名称,用户屏蔽等级]
    function isUserNeedFilter(uid) {
        // 外层遍历 规则集
        for (let i = 0; i < userFilterRules.length; i++) {
            for (let j = 0; j < userFilterRules[i].rules.length; j++) {
                // 如果uid匹配，则返回[true,所属规则集,level]
                if (uid == userFilterRules[i].rules[j].uid && (userFilterRules[i].enable === true) && (userFilterRules[i].rules[j].level <= userFilterRules[i].level)) {
                    let result = [true, userFilterRules[i].name, userFilterRules[i].rules[j].level];
                    // 结束循环
                    j = userFilterRules[i].rules.length;
                    i = userFilterRules.length - 1;
                    return result;
                }
            }
            // 满足遍历完毕，返回false
            if (i == userFilterRules.length - 1) {
                let result = [false, "sb", "sb"];
                return result;
            }

        }
        return [false, "sb", "sb"];
    }


    //--------
    // 针对用户过滤视频播放页下面的评论
    //--------
    // 定义 findUserandBlockinVideo()函数 主函数，从这里开始执行。将会读取视频下方的评论区。使用isUserNeedFilter()查询用户是否满足条件
    function findUserandBlockinVideo() {
        // 如果无规则，则不执行
        if (userFilterRules.length != 0) {
            // console.log("执行过滤");
            //对主条目评论进行操作
            // 获取每条评论（不包含回复），转成类数组对象，用于确定评论序号便于后续使用
            let mainComment = document.getElementsByClassName("root-reply-container");
            // console.log("[读取评论用户]", mainComment);
            // 有几条评论就循环几次，mainCommentId是评论序号（从0开始）
            for (let mainCommentId = 0; mainCommentId < mainComment.length; mainCommentId++) {
                // 这些对象的html属性中的data-user-id的值就是uid
                let mainCommentUid = mainComment[mainCommentId].querySelector('div.content-warp div.user-info div.user-name').getAttribute("data-user-id");
                // 检测UID是否匹配记录中的
                // 满足则执行替换
                // 查询用户
                if (!mainComment[mainCommentId].classList.contains('bft-user-filtered') && isUserNeedFilter(mainCommentUid)[0] == true) {
                    // console.log("find", mainCommentUid)
                    console.log("[BF][用户][视频页评论]发现目标", mainCommentUid, '规则集:', isUserNeedFilter(mainCommentUid)[1], mainComment[mainCommentId]);
                    //执行叠加层
                    // overrideMainComment(mainCommentId, isUserNeedFilter(mainCommentUid)[1], isUserNeedFilter(mainCommentUid)[2], mainCommentUid, "userBlackList");
                    mainComment[mainCommentId].querySelector('div.content-warp div.root-reply span.reply-content-container.root-reply').classList.add('bft-heimu');
                }
                // 为检测后的内容打上标记
                mainComment[mainCommentId].classList.add('bft-user-filtered');
            }



            // 对评论回复进行操作
            // 获取每条回复，转成类数组对象，用于确定评论序号便于后续使用
            let subReply = document.getElementsByClassName("sub-reply-item");
            // 有几条评论就循环几次，subReplyId是评论序号（从0开始）
            for (let i = 0; i < subReply.length; i++) {

                // 从 一堆class为sub-reply-item的类数组对象中获取对应的uid，第几个评论就对应第几个class是sub-reply-avatar的对象
                // 这些对象的html属性中的data-user-id的值就是uid
                let subReplyUid = subReply[i].querySelector('div.sub-user-info div.sub-user-name').getAttribute("data-user-id");
                // 检测UID是否匹配记录中的

                if (!subReply[i].classList.contains('bft-user-filtered') && isUserNeedFilter(subReplyUid)[0] == true) {
                    // console.log("find", subReplyUid)
                    //执行替换
                    // overrideSubReply(subReplyId, isUserNeedFilter(subReplyUid)[1], isUserNeedFilter(subReplyUid)[2], subReplyUid, "userBlackList");
                    console.log("[BF][用户][视频页评论]发现目标", subReplyUid, '规则集:', isUserNeedFilter(subReplyUid)[1], subReply[i]);
                    subReply[i].classList.add('bft-user-filtered');
                    subReply[i].querySelector('span.reply-content-container.sub-reply-content').classList.add('bft-heimu');

                }

            }

        }
    }


    //---------
    // 针对首页的推荐做出的屏蔽
    //--------
    // 针对主页中 class 为 bili-video-card is-rcmd 的视频进行过滤
    function filterVideoofFeedinIndex() {
        // 获取 所有class 为 bili-video-card is-rcmd 的元素
        let videoCard = document.getElementsByClassName("bili-video-card is-rcmd");
        // console.debug("执行首页视频feedcard过滤");
        // 遍历各元素
        for (let l = 0; l < videoCard.length; l++) {
            // 获取 可探测uid的元素
            let targetElement = videoCard[l].querySelector("div.bili-video-card.is-rcmd div.bili-video-card__wrap.__scale-wrap div.bili-video-card__info.__scale-disable div.bili-video-card__info--right div.bili-video-card__info--bottom a.bili-video-card__info--owner");
            let href = targetElement.getAttribute("href");
            // 从目标元素的href属性值(//space.bilibili.com/1956977928)中获取uid ,并使用isUserNeedFilter判定是否屏蔽
            // 使用正则匹配
            let regex = /(\d+)/;
            let match = href.match(regex);
            // console.debug(match[0]);
            if (!videoCard[l].classList.contains('bft-user-filtered') && isUserNeedFilter(match[0])[0] === true) {
                // 执行屏蔽
                videoCard[l].classList.add('bft-overlay');
                console.log('[BF][用户][首页视频]匹配到规则：', isUserNeedFilter(match[0])[1], videoCard[l]);
            }
            // 为过滤过的打上标记
            videoCard[l].classList.add('bft-user-filtered');
        }
    }
    //---------
    // 针对视频播放页的右侧视频推荐做出的屏蔽（不含自动联播或合集屏蔽）
    //--------
    function filterVideoofVideo() {
        // 获取 所有class 为 bili-video-card is-rcmd 的元素
        let videoCard = document.getElementsByClassName("video-page-card-small");
        // console.debug("执行右侧推荐视频过滤");
        // 遍历各元素
        for (let l = 0; l < videoCard.length; l++) {
            // 获取 可探测uid的元素
            let targetElement = videoCard[l].querySelector("div.card-box div.info div.upname a");
            let href = targetElement.getAttribute("href");
            // 从目标元素的href属性值(//space.bilibili.com/1956977928)中获取uid ,并使用isUserNeedFilter判定是否屏蔽
            // 使用正则匹配
            let regex = /(\d+)/;
            let match = href.match(regex);
            // console.debug(match[0]);
            if (!videoCard[l].classList.contains('bft-user-filtered') && isUserNeedFilter(match[0])[0] === true) {
                // 执行屏蔽
                videoCard[l].classList.add('bft-overlay');
                console.log('[BF][用户][视频页视频推荐]匹配到规则：', isUserNeedFilter(match[0])[1], videoCard[l]);
            }
            // 为过滤过的打上标记
            videoCard[l].classList.add('bft-user-filtered');
        }
    }
    // // 用户过滤功能结束


    // ------------------------------
    // 内容过滤：主要功能函数
    // ------------------------------
    // 根据内容寻找并覆写 视频页
    function findTextandBlockinVideo() {
        // 寻找所有 .reoply-comternt 元素 用于视频评论区
        let targetElements = document.getElementsByClassName('reply-content-container');


        for (let i = 0; i < targetElements.length; i++) {
            // 保证检测的是没有被过滤过的
            if (!targetElements[i].classList.contains('bft-textFiltered')) {

                // 标记该元素为过滤过的
                targetElements[i].classList.add('bft-textFiltered');
                // //获取每个元素内包含的文本与B站的表情
                // 创建一个空数组，用于存储文本内容和表情符号
                var content = [];

                // 遍历元素的子节点
                for (var node of targetElements[i].querySelector('span').childNodes) {
                    // 判断节点类型
                    if (node.nodeType === Node.TEXT_NODE) {
                        // 如果是文本节点，将文本内容存入数组
                        content.push(node.textContent);
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IMG') {
                        // 如果是<img>元素，将表情符号的alt属性值存入数组
                        content.push(node.alt);
                    }
                }

                // 拼接文本内容和表情符号
                let targetText = content.join('');

                // console.debug('[BF][评论文本内容调试]', targetText); // 输出提取的结果

                // 请求函数,并且排除已过滤项
                if (isTextNeedBlock(targetText)[0] === true) {
                    // 若需要过滤，则为文本覆盖层
                    targetElements[i].classList.add('bft-heimu');
                    // 调试
                    console.log('[BF][内容][评论]匹配到规则：', isTextNeedBlock(targetText)[1], targetText, targetElements[i]);
                }
            }

        }
        // 寻找所有 .title 元素 用于视频页右侧推荐的视频
        let targetElementsforRight = document.getElementsByClassName('video-page-card-small');
        for (let i = 0; i < targetElementsforRight.length; i++) {
            //获取每个视频的标题
            var targetTextEle = targetElementsforRight[i].querySelector('div.card-box div.info a p.title');
            var targetText = targetTextEle.textContent;
            // 请求函数,并且排除已过滤项
            if (isTextNeedBlock(targetText)[0] === true && !targetElementsforRight[i].classList.contains('bft-textFiltered')) {
                // 若需要过滤，则将内部文本改为
                targetElementsforRight[i].classList.add('bft-overlay');
                // 调试
                console.log('[BF][内容][视频]匹配到规则：', isTextNeedBlock(targetText)[1], targetElementsforRight[i]);
            }
            // 检测过的元素添加标记
            targetElementsforRight[i].classList.add('bft-textFiltered');
        }
    }
    // 根据内容寻找并覆写 专栏页
    function findTextandBlockinArticle() {
        // 过滤专栏页的评论
        let targetComEle = Array.from(document.getElementsByClassName('text')).concat(Array.from(document.getElementsByClassName('text-con')));
        for (let i = 0; i < targetComEle.length; i++) {
            // //获取每个元素内包含的文本与B站的表情
            // 创建一个空数组，用于存储文本内容和表情符号
            let content = [];

            // 遍历元素的子节点
            for (let node of targetComEle[i].childNodes) {
                // 判断节点类型
                if (node.nodeType === Node.TEXT_NODE) {
                    // 如果是文本节点，将文本内容存入数组
                    content.push(node.textContent);
                } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IMG') {
                    // 如果是<img>元素，将表情符号的alt属性值存入数组
                    content.push(node.alt);
                }
            }

            // 拼接文本内容和表情符号
            let targetComText = content.join('');
            //判断是否需要过滤
            if (isTextNeedBlock(targetComText)[0] && !targetComEle[i].classList.contains('bft-textFiltered')) {
                // 若需要过滤
                targetComEle[i].classList.add('bft-overlay');
                // 调试
                console.log('[BF][内容][专栏页评论]匹配到规则：', isTextNeedBlock(targetComText)[1], targetComEle[i]);
            }
            // 添加标记
            targetComEle[i].classList.add('bft-textFiltered');
        }
    }
    // 哼哼，啊啊啊啊，我就是萝莉控

    // 根据内容寻找并覆写 搜索页
    function findTextandBlockinSearch() {
        // 过滤搜索的视频
        let targetEle = document.getElementsByClassName('bili-video-card');
        for (let j = 0; j < targetEle.length; j++) {
            let targetText = targetEle[j].querySelector('div.bili-video-card__wrap.__scale-wrap div.bili-video-card__info.__scale-disable div.bili-video-card__info--right a h3.bili-video-card__info--tit').getAttribute('title');
            if (isTextNeedBlock(targetText)[0] && !targetEle[j].classList.contains('bft-textFiltered')) {
                targetEle[j].classList.add('bft-overlay');
                console.log('[BF][内容][搜索页视频]匹配到规则：', isTextNeedBlock(targetText)[1], targetEle[j]);
            }
            // 为检测过的元素添加标记
            targetEle[j].classList.add('bft-textFiltered');
        }
        // 过滤搜索的专栏
        let targetArtEle = document.getElementsByClassName('b-article-card flex_start items_stretch search-article-card');
        for (let j = 0; j < targetArtEle.length; j++) {
            let targetArtText = targetArtEle[j].querySelector('div.article-content.pr_md h2.b_text.i_card_title.mt_0 a.text1').getAttribute('title');
            if (isTextNeedBlock(targetArtText)[0] && !targetArtEle[j].classList.contains('bft-textFiltered')) {
                targetArtEle[j].classList.add('bft-overlay');
                console.log('[BF][内容][搜索页专栏]匹配到规则：', isTextNeedBlock(targetArtText)[1], targetArtEle[j]);
            }
            // 为检测过的元素添加标记
            targetArtEle[j].classList.add('bft-textFiltered');
        }
        // 过滤影视与番剧
        let targetMedEle = document.getElementsByClassName('media-card');
        for (let j = 0; j < targetMedEle.length; j++) {
            let targetMedText = targetMedEle[j].querySelector('div.media-card-content div.media-card-content-head div.media-card-content-head-title a.text_ellipsis').getAttribute('title');
            if (isTextNeedBlock(targetMedText)[0] && !targetMedEle[j].classList.contains('bft-textFiltered')) {
                targetMedEle[j].classList.add('bft-overlay');
                console.log('[BF][内容][搜索页影视与番剧]匹配到规则：', isTextNeedBlock(targetMedText)[1], targetMedEle[j]);
            }
            // 为检测过的元素添加标记
            targetMedEle[j].classList.add('bft-textFiltered');
        }
        // 过滤直播间
        let targetLivEle = document.getElementsByClassName('bili-live-card');
        for (let j = 0; j < targetLivEle.length; j++) {
            let targetLivText = targetLivEle[j].querySelectorAll('div.bili-live-card__wrap.__scale-wrap div.bili-live-card__info.__scale-disable div.bili-live-card__info--text h3.bili-live-card__info--tit a span')[1].innerHTML;
            if (isTextNeedBlock(targetLivText)[0] && !targetLivEle[j].classList.contains('bft-textFiltered')) {
                targetLivEle[j].classList.add('bft-overlay');
                console.log('[BF][内容][搜索页直播]匹配到规则：', isTextNeedBlock(targetLivText)[1], targetLivEle[j]);
            }
            // 为检测过的元素添加标记
            targetLivEle[j].classList.add('bft-textFiltered');
        }
    }

    // 根据内容寻找覆写 各分区主页（除了： 纪录片 电视剧 电影 综艺 国创 番剧）
    function findTextandBlockinFenqu1() {
        // 过滤视频
        let targetEle = document.getElementsByClassName('bili-video-card');
        for (let j = 0; j < targetEle.length; j++) {
            let targetText = targetEle[j].querySelector('div.bili-video-card__wrap.__scale-wrap div.bili-video-card__info.__scale-disable div.bili-video-card__info--right h3.bili-video-card__info--tit').getAttribute('title');
            if (isTextNeedBlock(targetText)[0] && !targetEle[j].classList.contains('bft-textFiltered')) {
                targetEle[j].classList.add('bft-overlay');
                console.log('[BF][内容][各分区页视频]匹配到规则：', isTextNeedBlock(targetText)[1], targetEle[j]);
            }
            // 为检测过的元素添加标记
            targetEle[j].classList.add('bft-textFiltered');
        }
    }

    // 根据内容寻找覆写 首页
    function findTextandBlockinIndex() {
        // 过滤视频
        let targetEle = document.getElementsByClassName('bili-video-card is-rcmd');
        for (let j = 0; j < targetEle.length; j++) {
            let targetText = targetEle[j].querySelector('div.bili-video-card__wrap.__scale-wrap div.bili-video-card__info.__scale-disable div.bili-video-card__info--right h3.bili-video-card__info--tit').getAttribute('title');
            if (isTextNeedBlock(targetText)[0] && !targetEle[j].classList.contains('bft-textFiltered')) {
                targetEle[j].classList.add('bft-overlay');
                console.log('[BF][内容][首页视频]匹配到规则：', isTextNeedBlock(targetText)[1], targetEle[j]);
            }
            // 为检测过的元素添加标记
            targetEle[j].classList.add('bft-textFiltered');
        }
    }

    // 根据内容判断是否需要屏蔽, 返回 [true,匹配到的正则表达式]
    function isTextNeedBlock(text) {
        for (let b = 0; b < textFilterRules.length; b++) {
            // 遍历规则集
            if (textFilterRules[b].enable === true) {
                // 规则集为启用,再进行下一步
                // 获取正则表达式
                // 将字符串形式的正则表达式转换为正则表达式对象
                let regexArray = textFilterRules[b].rules.map(function (regexString) {
                    return new RegExp(regexString);
                });
                for (let i = 0; i < regexArray.length; i++) {
                    // 遍历正则表达式，若匹配到则立刻break并返回
                    if (regexArray[i].test(text)) {
                        return [true, regexArray[i]];
                    } else if (i === regexArray.length - 1 && b === textFilterRules.length - 1) {
                        // 若遍历完表达式仍没匹配上，则返回 [false,null]
                        return [false, null];
                    }
                }
            }
        }
        return [false, null];
    }

    // -----------------------------------
    // 其他功能过滤：主要功能函数
    // -----------------------------
    // --
    // 过滤指定时长视频
    // --
    // 过滤首页指定时长视频
    function findDurationandBlockinIndex() {
        let targetEle = document.getElementsByClassName('bili-video-card is-rcmd');
        for (let i = 0; i < targetEle.length; i++) {
            // 页面可能没完全加载，使用try来避免无法获取时长
            try {
                // 获取视频时长
                let timeString = targetEle[i].querySelector('div.bili-video-card__wrap.__scale-wrap a div.bili-video-card__image.__scale-player-wrap div.bili-video-card__mask div.bili-video-card__stats span.bili-video-card__stats__duration').innerHTML;
                // 转为秒
                let timeArray = timeString.split(":");
                let hours = 0;
                let minutes = 0;
                let seconds = 0;

                if (timeArray.length === 3) {
                    hours = parseInt(timeArray[0]);
                    minutes = parseInt(timeArray[1]);
                    seconds = parseInt(timeArray[2]);
                } else if (timeArray.length === 2) {
                    minutes = parseInt(timeArray[0]);
                    seconds = parseInt(timeArray[1]);
                }

                let totalSeconds = hours * 3600 + minutes * 60 + seconds;
                // 判断
                if (totalSeconds <= otherFilterRules.duration && !targetEle[i].classList.contains('bft-duration-filtered')) {
                    targetEle[i].classList.add('bft-overlay');
                    console.log('[BF][时长][首页视频]小于指定时间：', totalSeconds, targetEle[i]);

                }
                // 为过滤过的打上标记
                targetEle[i].classList.add('bft-duration-filtered');
            } catch (error) {

            }


        }
    }
    // 根据时长过滤视频页视频推荐
    function findDurationandBlockinVideo() {
        let targetEle = document.getElementsByClassName('video-page-card-small');
        for (let i = 0; i < targetEle.length; i++) {
            // 获取视频时长

            let timeString = targetEle[i].querySelector('div.card-box div.pic-box div.pic span.duration').innerHTML;
            // 转为秒
            let timeArray = timeString.split(":");
            let hours = 0;
            let minutes = 0;
            let seconds = 0;

            if (timeArray.length === 3) {
                hours = parseInt(timeArray[0]);
                minutes = parseInt(timeArray[1]);
                seconds = parseInt(timeArray[2]);
            } else if (timeArray.length === 2) {
                minutes = parseInt(timeArray[0]);
                seconds = parseInt(timeArray[1]);
            }

            let totalSeconds = hours * 3600 + minutes * 60 + seconds;
            // 判断

            if (totalSeconds <= otherFilterRules.duration && !targetEle[i].classList.contains('bft-duration-filtered')) {
                targetEle[i].classList.add('bft-overlay');
                console.log('[BF][时长][视频页视频推荐]小于指定时间：', totalSeconds, targetEle[i]);

            }
            // 为过滤过的打上标记
            targetEle[i].classList.add('bft-duration-filtered');
        }
    }
    // 根据时长过滤搜索页视频
    function findDurationandBlockinSearch() {
        let targetEle = document.getElementsByClassName('bili-video-card');
        for (let i = 0; i < targetEle.length; i++) {
            // 获取视频时长

            let timeString = targetEle[i].querySelector('div.bili-video-card__wrap.__scale-wrap a div.bili-video-card__image.__scale-player-wrap div.bili-video-card__mask div.bili-video-card__stats span.bili-video-card__stats__duration').innerHTML;
            // 转为秒
            let timeArray = timeString.split(":");
            let hours = 0;
            let minutes = 0;
            let seconds = 0;

            if (timeArray.length === 3) {
                hours = parseInt(timeArray[0]);
                minutes = parseInt(timeArray[1]);
                seconds = parseInt(timeArray[2]);
            } else if (timeArray.length === 2) {
                minutes = parseInt(timeArray[0]);
                seconds = parseInt(timeArray[1]);
            }

            let totalSeconds = hours * 3600 + minutes * 60 + seconds;
            // 判断

            if (totalSeconds <= otherFilterRules.duration && !targetEle[i].classList.contains('bft-duration-filtered')) {
                targetEle[i].classList.add('bft-overlay');
                console.log('[BF][时长][搜索页视频]小于指定时间：', totalSeconds, targetEle[i]);

            }
            // 为过滤过的打上标记
            targetEle[i].classList.add('bft-duration-filtered');
        }
    }
    // ------------------------------
    // 为合适处添加快速添加用户按钮
    // ------------------------------
    // 在视频播放页添加按钮
    function addFastAddUserButtonInVideo() {
        // 针对root主评论操作
        let rootReply = document.getElementsByClassName("content-warp");
        for (let i = 0; i < rootReply.length; i++) {

            // 获取该层的用户ID
            let rootReplyUidEle = rootReply[i].querySelector("div.user-info div.user-name");
            let rootReplyUid = rootReplyUidEle.getAttribute("data-user-id");

            // 为操作菜单增加一个快捷按钮
            // 检测是否存在这个快捷按钮，若不存在，则添加
            let childElement = rootReply[i].querySelector("div.user-info button.bfx-fastadd");

            if (childElement == null) {

                let rootReplyFastAddEle = document.createElement('button');
                rootReplyFastAddEle.innerText = '♻️';
                rootReplyFastAddEle.classList.add('bfx-fastadd'); // 添加class属性

                let rootReplyFastAddEleTarge = rootReply[i].querySelector("div.user-info");


                rootReplyFastAddEle.addEventListener('click', function () {
                    // console.debug('按钮被点击了，评论序号为', i, "用户UID", rootReplyUid);
                    // 调函数，并传递评论序号
                    fastAddUserFilterRules(rootReplyUid);
                });
                // 加入按钮
                rootReplyFastAddEleTarge.appendChild(rootReplyFastAddEle);
            }

        }

        // 针对评论的回复的操作
        let subReply = document.getElementsByClassName("sub-reply-item");
        for (let i = 0; i < subReply.length; i++) {

            // 获取该层的用户ID
            let subReplyUidEle = subReply[i].querySelector("div.sub-user-info div.sub-reply-avatar");
            let subReplyUid = subReplyUidEle.getAttribute("data-user-id");

            // 为操作菜单增加一个快捷按钮
            // 检测是否存在这个快捷按钮，若不存在，则添加
            let childElement = subReply[i].querySelector("button.bfx-fastadd");

            if (childElement == null) {

                let subReplyFastAddEle = document.createElement('button');
                subReplyFastAddEle.innerText = '♻️';
                subReplyFastAddEle.classList.add('bfx-fastadd'); // 添加class属性



                subReplyFastAddEle.addEventListener('click', function () {
                    // console.debug('按钮被点击了，评论序号为', i, "用户UID", subReplyUid);
                    // 调用函数，并传递评论序号
                    fastAddUserFilterRules(subReplyUid);
                });
                // 加入按钮
                subReply[i].appendChild(subReplyFastAddEle);
            }

        }
    }
    // 在个人空间添加按钮
    function addFastAddUserButtonInSpace() {
        let childElement = document.querySelector('html body div#app.visitor div.h div.wrapper div.h-inner div.h-user div.h-info.clearfix div.h-basic div button.bfx-fastadd');
        if (childElement === null) {

            let rootReplyFastAddEle = document.createElement('button');
            rootReplyFastAddEle.innerText = '♻️';
            rootReplyFastAddEle.classList.add('bfx-fastadd'); // 添加class属性
            rootReplyFastAddEle.setAttribute('style', 'font-size: small');
            let rootReplyFastAddEleTarge = document.querySelector("html body div#app.visitor div.h div.wrapper div.h-inner div.h-user div.h-info.clearfix div.h-basic div");
            let rootReplyUid = window.location.pathname.split('/')[1];

            rootReplyFastAddEle.addEventListener('click', function () {
                // console.debug('按钮被点击了，评论序号为', i, "用户UID", rootReplyUid);
                // 调函数，并传递评论序号
                fastAddUserFilterRules(rootReplyUid);
            });
            // 加入按钮
            rootReplyFastAddEleTarge.appendChild(rootReplyFastAddEle);
        }
    }
    // 我还是找不到对象

    // --------------------------------------------------------------------------
    // 配置与设定弹窗函数
    // --------------------------------------------------------------------------
    // 用户过滤设置
    function bftSettingMenu_userFilter() {
        // 确保没有其他面板被打开
        if (document.getElementById('bft-menu') === null && !GM_getValue("temp_isMenuOpen", false)) {
            // 添加已打开面板的标记
            GM_setValue("temp_isMenuOpen", true);
            //添加HTML
            let dialogHtml = `
        <div class="bft-setting-window" id="bft-editUserRulesMenu">
            <div class="bft-setting-title">
                用户过滤器 <small>共计{{this.userFilterRulesRaw.length}}组规则集</small>
                <button class="bft-flow-right bft-button-icon" title="新建远程规则集" @click="createRemoteRuleSet"><svg
                        class="bft-icon" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">

                        <path
                            d="M251-160q-88 0-149.5-61.5T40-371q0-78 50-137t127-71q20-97 94-158.5T482-799q112 0 189 81.5T748-522v24q72-2 122 46.5T920-329q0 69-50 119t-119 50H251Zm0-60h500q45 0 77-32t32-77q0-45-32-77t-77-32h-63v-84q0-91-61-154t-149-63q-88 0-149.5 63T267-522h-19q-62 0-105 43.5T100-371q0 63 44 107t107 44Zm229-260Z" />
                    </svg></button>

                <button style="margin-right: 5px;" class="bft-flow-right bft-button-icon" title="新建本地规则集"
                    @click="createRuleSet"><svg class="bft-icon" xmlns="http://www.w3.org/2000/svg" height="48"
                        viewBox="0 -960 960 960" width="48">
                        <path
                            d="M220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554v-186H220v680h520v-494H551ZM220-820v186-186 680-680Z" />
                    </svg></button>
            </div>
            <div class="bft-setting-contain">
                <!-- 规则集条目 -->
                <div class="bft-ruleset" v-for="(ruleSet, index) in userFilterRulesRaw" :key="index">
                    <div class="bft-ruleset-icon">
                        <!-- 图标 -->
                        <svg class="bft-icon" v-if="ruleSet.link !== 'local'" xmlns="http://www.w3.org/2000/svg" height="48"
                            viewBox="0 -960 960 960" width="48">

                            <path
                                d="M251-160q-88 0-149.5-61.5T40-371q0-78 50-137t127-71q20-97 94-158.5T482-799q112 0 189 81.5T748-522v24q72-2 122 46.5T920-329q0 69-50 119t-119 50H251Zm0-60h500q45 0 77-32t32-77q0-45-32-77t-77-32h-63v-84q0-91-61-154t-149-63q-88 0-149.5 63T267-522h-19q-62 0-105 43.5T100-371q0 63 44 107t107 44Zm229-260Z" />
                        </svg>
                        <svg class="bft-icon" v-if="ruleSet.link === 'local'" xmlns="http://www.w3.org/2000/svg" height="48"
                            viewBox="0 -960 960 960" width="48">
                            <path
                                d="M220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554v-186H220v680h520v-494H551ZM220-820v186-186 680-680Z" />
                        </svg>
                    </div>
                    <div class="bft-ruleset-info">
                        <div class="bft-ruleset-info-title">{{ ruleSet.name }}<small>{{ ruleSet.describe }}</small></div>
                        <div class="bft-ruleset-info-other">共{{ruleSet.rules.length }}条 | {{ ruleSet.lastUpdate | formatDate
                            }}</div>
                    </div>
                    <div class="bft-ruleset-action">
                        <input type="checkbox" title="启用" v-model.lazy="ruleSet.enable">
                        <button class="bft-button-icon" title="更新" @click="updateRuleSet(index)"
                            v-if="ruleSet.link !== 'local'">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                                <path
                                    d="M483-120q-75 0-141-28.5T226.5-226q-49.5-49-78-115T120-482q0-75 28.5-140t78-113.5Q276-784 342-812t141-28q80 0 151.5 35T758-709v-106h60v208H609v-60h105q-44-51-103.5-82T483-780q-125 0-214 85.5T180-485q0 127 88 216t215 89q125 0 211-88t86-213h60q0 150-104 255.5T483-120Zm122-197L451-469v-214h60v189l137 134-43 43Z" />
                            </svg>
                        </button>
                        <button class="bft-button-icon" title="导出" @click="outputRuleSet(index)"
                            v-if="ruleSet.link === 'local'">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                                <path
                                    d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v90h-60v-90H180v600h600v-90h60v90q0 24-18 42t-42 18H180Zm514-174-42-42 113-114H360v-60h405L652-624l42-42 186 186-186 186Z" />
                            </svg>
                        </button>
                        <button class="bft-button-icon" title="修改" @click="editRuleSet(index)"
                            v-if="index !== activeRuleSetIndex">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                                <path
                                    d="M180-180h44l443-443-44-44-443 443v44Zm614-486L666-794l42-42q17-17 42-17t42 17l44 44q17 17 17 42t-17 42l-42 42Zm-42 42L248-120H120v-128l504-504 128 128Zm-107-21-22-22 44 44-22-22Z" />
                            </svg>
                        </button>
                        <button class="bft-button-icon" title="收起" @click="closeEditWindow"
                            v-if="index === activeRuleSetIndex">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                                <path d="M450-160v-526L202-438l-42-42 320-320 320 320-42 42-248-248v526h-60Z" />
                            </svg>
                        </button>
                        <button class="bft-button-icon" title="删除" @click="deleteRuleSet(index)">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                                <path
                                    d="M261-120q-24.75 0-42.375-17.625T201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z" />
                            </svg>
                        </button>
                    </div>
                    <div class="bft-ruleset-contain" v-if="index === activeRuleSetIndex">
                        <div class="bft-input-container">
                            <input type="text" class="bft-input-field" required v-model="ruleSet.name"
                                @change="updateRulesetTime(index)" />
                            <label class="bft-input-label">名称</label>
                            <div class="bft-input-bar"></div>
                        </div>
                        <div class="bft-input-container">
                            <input type="text" class="bft-input-field" required v-model="ruleSet.describe"
                                @change="updateRulesetTime(index)" />
                            <label class="bft-input-label">描述</label>
                            <div class="bft-input-bar"></div>
                        </div>
                        <div class="bft-input-container">
                            <input type="number" class="bft-input-field" required v-model="ruleSet.level"
                                @change="updateRulesetTime(index)" min="1" max="5" />
                            <label class="bft-input-label">过滤等级</label>
                            <div class="bft-input-bar"></div>
                        </div>
                        <div class="bft-input-container" v-if="ruleSet.link !== 'local'">
                            <input type="url" class="bft-input-field" required v-model="ruleSet.link"
                                @change="updateRulesetTime(index)" />
                            <label class="bft-input-label">更新链接</label>
                            <div class="bft-input-bar"></div>
                        </div>
                        <div class="bft-ruleset-rulelist-action">
                            <button class="bft-button" @click="inputRuleSet(index)" v-if="ruleSet.link === 'local'">
                                导入
                            </button>
                            <button class="bft-button" @click="addRule(index)" v-if="ruleSet.link === 'local'">
                                新建
                            </button>
                            <button class="bft-button" @click="convertToLocal(index)" v-if="ruleSet.link !== 'local'">
                                转为本地规则集
                            </button>
                            <button class="bft-button" @click="prevPage" :disabled="currentPage === 0"  v-if="ruleSet.link === 'local'">上页</button>
                            <span  v-if="ruleSet.link === 'local'">{{ currentPage + 1 }} / {{ totalPages }}</span>
                            <button class="bft-button" @click="nextPage"
                                :disabled="currentPage === totalPages - 1"  v-if="ruleSet.link === 'local'">下页</button>
                        </div>
                        <div class="bft-ruleset-rulelist-list">
                            <!-- 显示规则 -->
                            <!-- 在computed属性paginatedRules中使用了slice方法返回了一个新的数组，但是在Vue中，使用v-model绑定的文本框仍然会修改原来的数组。 -->
                            <!-- 这是因为slice方法并不改变原数组，它返回一个从原数组中选取的新数组。而v-model是通过在组件实例中设置属性来实现双向绑定的，它会直接操作数据源（即原数组）。因此，即使我们在模板中展示的是paginatedRules，但通过v-model绑定的文本框实际上还是直接修改了userFilterRules[this.activeRuleSetIndex].rules。 -->
                            <div class="bft-ruleset-rulelist-item" v-for="(rule, ruleIndex) in paginatedRules"
                                :key="ruleIndex" v-if="ruleSet.link === 'local'">
                                <h1>#{{ currentPage * pageSize + ruleIndex +1}}</h1>
                                <button class="bft-button-icon" title="删除"
                                    @click="deleteRule(index, ruleIndex),updateRulesetTime(index)">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                                        <path
                                            d="M261-120q-24.75 0-42.375-17.625T201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z" />
                                    </svg>
                                </button>
                                <h2>{{rule.lastUpdate | formatDate}}</h2>
                                <div class="bft-input-container">
                                    <input type="number" class="bft-input-field" required v-model="rule.uid"
                                        @change="updateRuleTime(index,ruleIndex);checkDuplicate(index,ruleIndex)" />
                                    <label class="bft-input-label">UID</label>
                                    <div class="bft-input-bar"></div>
                                </div>
                                <div class="bft-input-container">
                                    <input type="number" class="bft-input-field" required v-model="rule.level"
                                        @change="updateRuleTime(index,ruleIndex)" min="1" max="5" />
                                    <label class="bft-input-label">标记等级</label>
                                    <div class="bft-input-bar"></div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
            <div class="bft-setting-action">
                <button class="bft-button bft-flow-left" @click="outputBlacklistInBili()">导出哔哩哔哩黑名单</button>
                <button class="bft-button" @click="saveRuleSets">保存</button>
                <button class="bft-button" @click="closeWindow">取消</button>
            </div>
        </div>
            `;
            let dialogElement = document.createElement('div');
            dialogElement.id = 'bft-menu';
            dialogElement.innerHTML = dialogHtml;
            document.body.appendChild(dialogElement);
            let userFilterRulesRaw = GM_getValue("userFilterRules", []);

            new Vue({
                el: '#bft-editUserRulesMenu',
                data: {
                    userFilterRulesRaw,
                    activeRuleSetIndex: -1, // 用于跟踪当前处于编辑状态的规则集的索引
                    pageSize: 100, // 展示规则条目时的每页规则数
                    currentPage: 0 // 当前规则条目当前页数
                },
                computed: {
                    // 计算展示规则条目时所需要的页数
                    totalPages() {
                        if (this.userFilterRulesRaw && this.userFilterRulesRaw[this.activeRuleSetIndex]) {
                            return Math.ceil(this.userFilterRulesRaw[this.activeRuleSetIndex].rules.length / this.pageSize);
                        }
                        return 0;
                    },
                    // 计算当前需要展示的条目
                    paginatedRules() {
                        if (this.userFilterRulesRaw && this.userFilterRulesRaw[this.activeRuleSetIndex]) {
                            const startIndex = this.currentPage * this.pageSize;
                            const endIndex = startIndex + this.pageSize;
                            return this.userFilterRulesRaw[this.activeRuleSetIndex].rules.slice(startIndex, endIndex);
                        }
                        return [];
                    }
                },
                methods: {
                    // 修改
                    editRuleSet(index) {
                        this.activeRuleSetIndex = index;
                        this.currentPage = 0; // 展开新规则集时重置为第一页
                    },
                    deleteRuleSet(index) {
                        // 删除规则集的逻辑
                        this.userFilterRulesRaw.splice(index, 1);
                        this.activeRuleSetIndex = -1; // 关闭二级悬浮窗
                    },
                    convertToLocal(index) {
                        // 远程规则集转为本地规则集的逻辑
                        this.userFilterRulesRaw[index].link = 'local';
                    },
                    deleteRule(ruleSetIndex, ruleIndex) {
                        // 删除规则的逻辑
                        // this.userFilterRulesRaw[ruleSetIndex].rules.splice(ruleIndex, 1);
                        // 计算当前展示的规则在实际规则数组中的索引
                        const actualIndex = this.currentPage * this.pageSize + ruleIndex;
                        // 删除实际索引对应的规则
                        this.userFilterRulesRaw[ruleSetIndex].rules.splice(actualIndex, 1);
                        // 如果这一页没有元素了就更新页码
                        if (this.currentPage + 1 > this.totalPages) {
                            this.currentPage--;
                        }

                    },
                    addRule(index) {
                        // 添加规则的逻辑
                        this.userFilterRulesRaw[index].rules.push({ uid: 0, level: 3, lastUpdate: parseInt(Date.now() / 1000) });
                        // 跳转至所在页
                        this.currentPage = this.totalPages - 1;
                        // 焦点指向新建元素的文本框
                        setTimeout(() => {
                            document.querySelector('.bft-ruleset-rulelist-item:last-child input').focus();
                        }, 10);
                    },
                    closeEditWindow() {
                        this.activeRuleSetIndex = -1;
                    },
                    saveRuleSets() {
                        // console.debug(this.userFilterRulesRaw);
                        // 保存规则集的逻辑
                        // 将规则写入配置中
                        GM_setValue("userFilterRules", this.userFilterRulesRaw);
                        // 重载配置
                        reloadRules();
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                        // 添加已关闭面板的标记
                        GM_setValue("temp_isMenuOpen", false);
                    },
                    closeWindow() {
                        // 关闭悬浮窗的逻辑
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                        // 添加已关闭面板的标记
                        GM_setValue("temp_isMenuOpen", false);
                    },
                    createRuleSet() {
                        // 创建新规则集的逻辑
                        this.userFilterRulesRaw.push({
                            "name": "例子",
                            "describe": "一个栗子",
                            "enable": true,
                            "link": "local",
                            "lastUpdate": parseInt(Date.now() / 1000),
                            "level": 3,
                            "rules": [
                                {
                                    "uid": 0,
                                    "level": 3,
                                    "lastUpdate": parseInt(Date.now() / 1000)
                                }
                            ]
                        });
                    },
                    createRemoteRuleSet() {
                        // 创建新规则集的逻辑
                        this.userFilterRulesRaw.push({
                            "name": "例子",
                            "describe": "一个栗子",
                            "enable": true,
                            "link": "",
                            "lastUpdate": parseInt(Date.now() / 1000),
                            "level": 3,
                            "rules": [
                                {
                                    "uid": 0,
                                    "level": 3,
                                    "lastUpdate": parseInt(Date.now() / 1000)
                                }
                            ]
                        });
                    },
                    updateRulesetTime(rulesetIndex) {
                        this.userFilterRulesRaw[rulesetIndex].lastUpdate = parseInt(Date.now() / 1000);
                    },
                    updateRuleTime(rulesetIndex, index) {
                        this.userFilterRulesRaw[rulesetIndex].rules[index].lastUpdate = parseInt(Date.now() / 1000);
                        this.userFilterRulesRaw[rulesetIndex].lastUpdate = parseInt(Date.now() / 1000);
                    },
                    outputRuleSet(index) {
                        // 导出为json
                        let outPut = JSON.stringify(this.userFilterRulesRaw[index].rules);
                        // var jsonObj = JSON.parse(jsonStr); //转为对象
                        // 复制到粘贴板
                        GM.setClipboard(outPut);
                        //提示 复制成功
                        console.info('[BF][配置]规则已经导入剪切板');
                        showSnackbar('已导入剪切板', 'info', 5, '确认');
                    },
                    updateRuleSet(index) {
                        // 手动更新规则
                        this.frechRules(this.userFilterRulesRaw[index].link, index);
                    },
                    async inputRuleSet(index) {
                        // 导入规则
                        // 获取内容
                        try {
                            var inputJson = await interactiveDialog('input', '输入Json以导入规则', '[{"uid":114514,"level":5,"lastUpdate":1680699306}]', 'text');
                            // 待获取后删除对话框html
                            document.getElementById('bft-dialog').remove();
                            if (inputJson != null && inputJson != "") {
                                let arrayInput = JSON.parse(inputJson); //转为对象
                                // console.log(arrayInput);
                                if (arrayInput.length != 0) {
                                    // 将规则集的更新时间设为现在时间
                                    this.userFilterRulesRaw[index].lastUpdate = Math.floor(Date.now() / 1000);
                                }
                                let errorMsg = [];
                                for (let m = 0; m < arrayInput.length; m++) {
                                    // 如果原规则集中存在该用户则不导入
                                    let isDup = false;
                                    for (let i = 0; i < this.userFilterRulesRaw[index].rules.length; i++) {
                                        if (arrayInput[m].uid == this.userFilterRulesRaw[index].rules[i].uid) {
                                            // 一旦重复，isDup设为true,同时结束当前循环，跳过当前用户
                                            isDup = true;
                                            console.error("[BF][配置]导入规则时发现重复用户：" + this.userFilterRulesRaw[index].rules[i].uid + "，位于原规则的第" + (i + 1));
                                            errorMsg[errorMsg.length] = this.userFilterRulesRaw[index].rules[i].uid + '(#' + (i + 1) + ')';
                                            break;
                                        }
                                    }
                                    if (isDup == false) {
                                        // 塞入当前时间戳
                                        arrayInput.lastUpdate = Math.floor(Date.now() / 1000);
                                        // console.debug(arrayInput[m]);
                                        // console.debug(this.userFilterRules[index].rules);
                                        // 将新用户塞入规则
                                        this.userFilterRulesRaw[index].rules.push(arrayInput[m]);
                                    }
                                }
                                showSnackbar('已导入', 'info', 5, '关闭');
                                // 在JavaScript中，对象之间的比较是基于引用的，而不是基于值的。所以，即使两个数组有相同的内容，它们也被视为不同的对象，它们的引用不相同。
                                // 因此，errorMsg !== [] 的比较结果始终为 true，即使 errorMsg 实际上是一个空数组 []。因为 errorMsg 和 [] 是两个不同的对象，它们的引用不同，所以条件始终为真。
                                if (errorMsg.length !== 0) {
                                    showSnackbar(`检测到以下已存在用户：${errorMsg}，这些用户未被导入`, 'warning', 3000, '关闭');
                                }
                            }
                        } catch (error) {
                            if (error !== 'user cancel this operation') {
                                showSnackbar(`${error}`, 'error', 5, '关闭');
                            }
                        }

                    },
                    frechRules(url, index) {
                        // 获取远程规则
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: url,
                            responseType: "json", // Expect a json response type
                            onload: function (response) {
                                // Check if the status code is 200 (OK)
                                if (response.status === 200 && response.response != undefined) {
                                    // Get the response body as a json object
                                    let json = response.response;

                                    // 转换
                                    // let array = JSON.parse(json);

                                    // Add the array to the obj[prop] property
                                    userFilterRulesRaw[index].rules = json;
                                    console.log('[BF][配置]远程配置获取成功。');
                                    showSnackbar('远程配置获取成功', 'info', 5, '关闭');
                                    // 更新 规则中的用户的更新日期
                                    userFilterRulesRaw[index].lastUpdate = Math.floor(Date.now() / 1000);
                                } else {
                                    // Handle other status codes here, such as logging an error message
                                    console.error("[BF][配置]远程配置格式异常，请检查链接是否有效。#" + response.statusText);
                                    showSnackbar('远程配置获取失败，请检查配置文件格式或链接是否有效', 'error', 10, '关闭');
                                }
                            },
                            onerror: function (error) {
                                // Handle errors here, such as logging an error message
                                console.error("[BF][配置]无法获取远程配置。#" + error.message);
                                showSnackbar('远程配置获取失败' + error.message, 'error', 5, '关闭');

                            }
                        });
                    },
                    checkDuplicate(index, userIndex) {
                        // 检查是否和本规则集中的用户重复了
                        for (let f = 0; f < this.userFilterRulesRaw[index].rules.length; f++) {
                            if (this.userFilterRulesRaw[index].rules[userIndex].uid == this.userFilterRulesRaw[index].rules[f].uid && userIndex != f) {
                                console.error(`[BF][配置]该用户已存在(#${f + 1})`);
                                showSnackbar(`该用户已存在于该规则集中，(#${f + 1})`, 'error', 3000, '关闭');
                            }
                        }
                    },
                    outputBlacklistInBili() {
                        // 导出B站站内黑名单
                        let blacklist = [];
                        console.info('[BF][配置]开始请求，请等待大约5秒');
                        showSnackbar('开始请求，请稍后，请不要执行其他操作', 'info', 5, '关闭');
                        // 从API请求黑名单
                        let page = 1;
                        queryBlackList();
                        function queryBlackList() {
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: "https://api.bilibili.com/x/relation/blacks?pn=" + page,
                                headers: {
                                    "ps": "50"
                                },
                                onload: function (response) {
                                    //json转为数组
                                    let data = JSON.parse(response.responseText);

                                    // console.debug("读取到的个数：", data.data.list.length);
                                    if (data.code === 0) {
                                        //请求成功
                                        //将数据转为BF可使用的格式
                                        // 遍历获取到的json，然后转为数组，放入blacklist
                                        for (let p = 0; p < data.data.list.length; p++) {
                                            blacklist[blacklist.length] = { "uid": data.data.list[p].mid, "level": 3, "lastUpdate": data.data.list[p].mtime, };
                                        };
                                        // 当随着page增加到获取不到黑名单为止
                                        if (data.data.list.length != 0) {
                                            //给page自增
                                            page++;
                                            // 重新调用这个函数
                                            queryBlackList();
                                        } else {
                                            //获取不到黑名单时，执行输出函数
                                            outputBlackList();
                                        };


                                    } else if (date.code === -101) {
                                        // 账号未登录
                                        console.error("[BF][配置]请求失败，账号未登录。Error: " + error.message);
                                        showSnackbar('请求失败，账号未登录。' + error.message, 'error', 5, '关闭');

                                        page = 114;
                                    } else if (date.code === -404) {
                                        page = 114;
                                        console.error("[BF][配置]请求失败，无法从API获取信息。Error: " + error.message);
                                        showSnackbar('请求失败，API错误。' + error.message, 'error', 5, '关闭');
                                    }
                                },
                                onerror: function (error) {
                                    // Handle errors here, such as logging an error message
                                    console.error("Error: " + error.message);
                                    showSnackbar('请求失败。' + error.message, 'error', 5, '关闭');
                                }

                            });
                        };
                        // 输出黑名单的函数
                        function outputBlackList() {
                            // 导出为json
                            let outPut = JSON.stringify(blacklist);
                            // var jsonObj = JSON.parse(jsonStr); //转为对象
                            // console.debug(outPut);
                            // 复制到粘贴板
                            GM.setClipboard(outPut);
                            //提示 复制成功
                            console.info('[BF][配置]请求成功。黑名单已粘贴到剪切板。');
                            showSnackbar('获取成功，已复制入剪切板', 'info', 5, '关闭');
                            page == 100;
                        }
                    },
                    // 翻页 下一页
                    nextPage() {
                        if (this.currentPage < this.totalPages - 1) {
                            this.currentPage++;
                        }
                    },
                    // 翻页 上一页
                    prevPage() {
                        if (this.currentPage > 0) {
                            this.currentPage--;
                        }
                    },
                }
            });
        } else if (GM_getValue("temp_isMenuOpen", false)) {
            showSnackbar('已存在已经打开的设置面板,请先关闭', 'error', 5, '确认');
        }

    }
    // 内容过滤设定
    function bftSettingMenu_textFilter() {
        if (document.getElementById('bft-menu') === null && !GM_getValue("temp_isMenuOpen", false)) {
            // 添加已打开面板的标记
            GM_setValue("temp_isMenuOpen", true);
            let dialogHtml = `
            <div class="bft-setting-window" id="bft-editTextrulesMenu">
        <div class="bft-setting-title">
            标题评论过滤器 <small>共计{{this.textFilterRulesRaw.length}}组规则集</small>
            <button style="margin-right: 5px;" class="bft-flow-right bft-button-icon" title="新建本地规则集"
                @click="addRuleSet"><svg class="bft-icon" xmlns="http://www.w3.org/2000/svg" height="48"
                    viewBox="0 -960 960 960" width="48">
                    <path
                        d="M220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554v-186H220v680h520v-494H551ZM220-820v186-186 680-680Z" />
                </svg></button>
        </div>
        <div class="bft-setting-contain">
            <!-- 规则集条目 -->
            <div class="bft-ruleset" v-for="(item, index) in textFilterRulesRaw" :key="index">
                <div class="bft-ruleset-icon">
                    <!-- 图标 -->
                    <svg class="bft-icon" v-if="item.type==='remote'" xmlns="http://www.w3.org/2000/svg" height="48"
                        viewBox="0 -960 960 960" width="48">

                        <path
                            d="M251-160q-88 0-149.5-61.5T40-371q0-78 50-137t127-71q20-97 94-158.5T482-799q112 0 189 81.5T748-522v24q72-2 122 46.5T920-329q0 69-50 119t-119 50H251Zm0-60h500q45 0 77-32t32-77q0-45-32-77t-77-32h-63v-84q0-91-61-154t-149-63q-88 0-149.5 63T267-522h-19q-62 0-105 43.5T100-371q0 63 44 107t107 44Zm229-260Z" />
                    </svg>
                    <svg class="bft-icon" v-if="item.type==='local'" xmlns="http://www.w3.org/2000/svg" height="48"
                        viewBox="0 -960 960 960" width="48">
                        <path
                            d="M220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554v-186H220v680h520v-494H551ZM220-820v186-186 680-680Z" />
                    </svg>
                </div>
                <div class="bft-ruleset-info">
                    <div class="bft-ruleset-info-title">{{ item.name }}<small>{{ item.describe }}</small></div>
                    <div class="bft-ruleset-info-other">共{{ item.rules.length }}条 | {{ item.lastUpdate |
                        formatDate
                        }}</div>
                </div>
                <div class="bft-ruleset-action">
                    <input type="checkbox" title="启用" v-model.lazy="item.enable">
                    <button class="bft-button-icon" title="更新" @click="updateRuleSet(index)"
                        v-if="item.type === 'remote'">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                            <path
                                d="M483-120q-75 0-141-28.5T226.5-226q-49.5-49-78-115T120-482q0-75 28.5-140t78-113.5Q276-784 342-812t141-28q80 0 151.5 35T758-709v-106h60v208H609v-60h105q-44-51-103.5-82T483-780q-125 0-214 85.5T180-485q0 127 88 216t215 89q125 0 211-88t86-213h60q0 150-104 255.5T483-120Zm122-197L451-469v-214h60v189l137 134-43 43Z" />
                        </svg>
                    </button>
                    <button class="bft-button-icon" title="导出" @click="outputRuleSet(index)"
                        v-if="item.type === 'local'">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                            <path
                                d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v90h-60v-90H180v600h600v-90h60v90q0 24-18 42t-42 18H180Zm514-174-42-42 113-114H360v-60h405L652-624l42-42 186 186-186 186Z" />
                        </svg>
                    </button>
                    <button class="bft-button-icon" title="修改" @click="editRuleSet(index)"
                        v-if="index !== activeRuleSetIndex">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                            <path
                                d="M180-180h44l443-443-44-44-443 443v44Zm614-486L666-794l42-42q17-17 42-17t42 17l44 44q17 17 17 42t-17 42l-42 42Zm-42 42L248-120H120v-128l504-504 128 128Zm-107-21-22-22 44 44-22-22Z" />
                        </svg>
                    </button>
                    <button class="bft-button-icon" title="收起" @click="closeEditWindow"
                        v-if="index === activeRuleSetIndex">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                            <path d="M450-160v-526L202-438l-42-42 320-320 320 320-42 42-248-248v526h-60Z" />
                        </svg>
                    </button>
                    <button class="bft-button-icon" title="删除" @click="deleteRuleSet(index)">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                            <path
                                d="M261-120q-24.75 0-42.375-17.625T201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z" />
                        </svg> </button>
                </div>
                <div class="bft-ruleset-contain" v-if="index === activeRuleSetIndex">
                    <div class="bft-input-container">
                        <input type="text" class="bft-input-field" required v-model="item.name"
                            @change="updateTime(index)" />
                        <label class="bft-input-label">名称</label>
                        <div class="bft-input-bar"></div>
                    </div>
                    <div class="bft-input-container">
                        <input type="text" class="bft-input-field" required v-model="item.describe"
                            @change="updateTime(index)" />
                        <label class="bft-input-label">描述</label>
                        <div class="bft-input-bar"></div>
                    </div>
                    <div class="bft-input-container" v-if="item.type === 'remote'">
                        <input type="text" class="bft-input-field" required v-model="item.link"
                            @change="updateTime(index)" type="url" />
                        <label class="bft-input-label">更新链接</label>
                        <div class="bft-input-bar"></div>
                    </div>

                    <label class="bft-select-label">类型：</label>
                    <select class="bft-select" v-model.lazy="item.type">
                        <option value="local">本地</option>
                        <option value="remote">远程</option>
                    </select>
                    <div class="bft-ruleset-rulelist-action">
                        <button class="bft-button" v-if="item.type === 'local'" @click=" jsonToLine(index)">
                            Json推送
                        </button>
                    </div>
                    <div class="bft-textarea-container">
                        <label v-if="item.type === 'local'">正则表达式(多条请分行)</label>
                        <textarea v-if="item.type === 'local'" @change="updateTime(index)"
                            v-model="item.rules"></textarea>
                    </div>
                    <div class="bft-textarea-container">
                        <label v-if="item.type === 'local'">正则表达式(Json格式)</label>
                        <textarea v-model="showRawRules" v-if="item.type === 'local'"></textarea>
                    </div>

                </div>

            </div>
        </div>
        <div class="bft-setting-action">
            <button class="bft-button" @click="saveRules">保存</button>
            <button class="bft-button" @click="close">取消</button>
        </div>

        `;
            // 添加html
            let dialogElement = document.createElement('div');
            dialogElement.id = 'bft-menu';
            dialogElement.innerHTML = dialogHtml;
            document.body.appendChild(dialogElement);
            let textFilterRulesRaw = GM_getValue("textFilterRules", []);
            // 将各规则集的正则分行
            for (let i = 0; i < textFilterRulesRaw.length; i++) {
                textFilterRulesRaw[i].rules = textFilterRulesRaw[i].rules.join('\n');
            }

            var bftEditMenu = new Vue({
                el: '#bft-editTextrulesMenu',
                data: {
                    textFilterRulesRaw,
                    activeRuleSetIndex: -1, // 用于跟踪当前处于编辑状态的规则集的索引
                },
                computed: {
                    showRawRules() {
                        // 将分行的规则重组为数组
                        return JSON.stringify(this.textFilterRulesRaw[this.activeRuleSetIndex].rules.split('\n'));
                    }
                },
                methods: {

                    // 修改
                    editRuleSet(index) {
                        this.activeRuleSetIndex = index;
                    },
                    closeEditWindow() {
                        this.activeRuleSetIndex = -1;
                    },
                    jsonToLine(index) {
                        try {
                            // 将json格式的输入框的内容化为分行，填入分行框中
                            this.textFilterRulesRaw[index].rules = JSON.parse(document.querySelectorAll('.bft-ruleset .bft-textarea-container textarea')[1].value).join('\n');
                        } catch (error) {
                            // 处理无效的 JSON 输入
                            showSnackbar('Json格式有误，请检查格式', 'error', 5, '关闭');
                        }

                    },
                    saveRules() {
                        // 将分行列出的规则重新组成数组
                        this.textFilterRulesRaw.forEach((item) => {
                            item.rules = item.rules.split('\n');
                        });
                        // 将最后更新时间设为当前时间
                        this.textFilterRulesRaw.forEach((item) => {
                            item.lastUpdate = Math.floor(Date.now() / 1000);
                        });
                        // 将规则写入配置中
                        GM_setValue("textFilterRules", this.textFilterRulesRaw);
                        // 重载配置
                        reloadRules();
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                        // 添加已关闭面板的标记
                        GM_setValue("temp_isMenuOpen", false);
                    },
                    addRuleSet() {
                        // 创建一个新的规则集对象
                        const newRuleSet = {
                            name: '',
                            describe: '',
                            rules: '',
                            enable: true,
                            type: 'local',
                            link: '',
                            lastUpdate: Math.floor(Date.now() / 1000),
                            createDate: Math.floor(Date.now() / 1000)
                        };

                        // 将新的规则集对象添加到数组中
                        this.textFilterRulesRaw.push(newRuleSet);
                    },
                    deleteRuleSet(index) {
                        // 删除指定规则集
                        this.textFilterRulesRaw.splice(index, 1);
                    },
                    outputRuleSet(index) {
                        // 导出指定规则集
                        GM.setClipboard(JSON.stringify(GM_getValue("textFilterRules", [])[index].rules));
                        showSnackbar('已导入剪切板', 'info', 5, '关闭');
                    },
                    updateTime(index) {
                        // 为指定规则集更新最后更新时间
                        this.textFilterRulesRaw[index].lastUpdate = Math.floor(Date.now() / 1000);
                    },
                    close() {
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                        // 添加已关闭面板的标记
                        GM_setValue("temp_isMenuOpen", false);
                    },
                    updateRuleSet(index) {
                        // 从url获取远程规则
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: this.textFilterRulesRaw[index].link,
                            responseType: "json", // Expect a json response type
                            onload: function (response) {
                                // Check if the status code is 200 (OK)
                                if (response.status === 200 && response.response != undefined) {
                                    // Get the response body as a json object
                                    let json = response.response;
                                    // 转换
                                    // let array = JSON.parse(json);
                                    // Add the array to the obj[prop] property
                                    // 将规则的正则分行
                                    json = json.join('\n');
                                    // 写入暂存规则
                                    textFilterRulesRaw[index].rules = json;
                                    // 更新更新日期
                                    textFilterRulesRaw[index].lastUpdate = Math.floor(Date.now() / 1000);
                                    console.log(`[BF][配置]第${index}个规则集已成功获取远程规则`);
                                } else {
                                    console.error(`[BF][配置]第${index}个规则集获取远程规则失败：格式错误，${response.statusText}`);
                                }
                            },
                            onerror: function (error) {
                                // Handle errors here, such as logging an error message
                                console.error("Error: " + error.message);
                                console.error(`[BF][配置]第${index}个规则集获取远程规则失败：无法访问，${error.message}`);
                            }
                        });
                    }

                }
            });

        } else if (GM_getValue("temp_isMenuOpen", false)) {
            showSnackbar('已存在已经打开的设置面板,请先关闭', 'error', 5, '确认');
        }
    }
    // 其他过滤设定
    function bftSettingMenu_otherFilter() {
        if (document.getElementById('bft-menu') === null && !GM_getValue("temp_isMenuOpen", false)) {
            // 添加已打开面板的标记
            GM_setValue("temp_isMenuOpen", true);
            let dialogHtml = `
            <div class="bft-setting-window" id="bft-editOtherrulesMenu">
            <div class="bft-setting-title">
                其他过滤 <small>时长过滤</small>
            </div>
            <div class="bft-setting-contain">
                <!-- 规则集条目 -->
                <div class="bft-ruleset">
                    <div class="bft-ruleset-contain">
                        <div class="bft-input-container">
                            <input type="number" class="bft-input-field" min="0" required
                                v-model.lazy="otherFilterRulesRaw.duration" />
                            <label class="bft-input-label">过滤视频时长低于（秒）：</label>
                            <div class="bft-input-bar"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bft-setting-action">
                <button class="bft-button" @click="saveRules">保存</button>
                <button class="bft-button" @click="close">取消</button>
            </div>
        </div>
            `;
            let dialogElement = document.createElement('div');
            dialogElement.id = 'bft-menu';
            dialogElement.innerHTML = dialogHtml;
            document.body.appendChild(dialogElement);
            let otherFilterRulesRaw = GM_getValue("otherFilterRules", { duration: 0 });

            var bftEditMenu = new Vue({
                el: '#bft-editOtherrulesMenu',
                data: {
                    otherFilterRulesRaw
                },
                methods: {
                    saveRules() {
                        // 将规则写入配置中
                        GM_setValue("otherFilterRules", this.otherFilterRulesRaw);
                        // 重载配置
                        reloadRules();
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                        // 添加已关闭面板的标记
                        GM_setValue("temp_isMenuOpen", false);
                    },
                    close() {
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                        // 添加已关闭面板的标记
                        GM_setValue("temp_isMenuOpen", false);
                    }
                }
            });
        } else if (GM_getValue("temp_isMenuOpen", false)) {
            showSnackbar('已存在已经打开的设置面板,请先关闭', 'error', 5, '确认');
        }
    }
    // 杂项设定
    function bftSettingMenu_setting() {
        if (document.getElementById('bft-menu') === null && !GM_getValue("temp_isMenuOpen", false)) {
            // 添加已打开面板的标记
            GM_setValue("temp_isMenuOpen", true);
            let dialogHtml = `
            <div class="bft-setting-window" id="bft-settingMenu">
            <div class="bft-setting-title">
                杂项设置 <small></small>
            </div>
            <div class="bft-setting-contain">
                <!-- 规则集条目 -->
                <div class="bft-ruleset">
                    <div class="bft-ruleset-contain">
                        <div class="bft-input-container">
                            <input type="number" class="bft-input-field" min="0" required
                            v-model.lazy="settingRaw.filterInterval" />
                            <label class="bft-input-label">过滤间隔（秒）</label>
                            <div class="bft-input-bar"></div>
                        </div>
                        <div class="bft-input-container">
                            <input type="number" class="bft-input-field" min="0" required
                            v-model.lazy="settingRaw.autoUpdate" />
                            <label class="bft-input-label">自动更新间隔（小时）</label>
                            <div class="bft-input-bar"></div>
                        </div>
                        <div class="bft-input-container">
                            <label>启用快速添加用户：</label>
                            <input v-model.lazy="settingRaw.enableFastAddUserFilterRules" type="checkbox" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="bft-setting-action">
                <button class="bft-button" @click="saveRules">保存</button>
                <button class="bft-button" @click="close">取消</button>
            </div>
        </div>
            `;
            let dialogElement = document.createElement('div');
            dialogElement.id = 'bft-menu';
            dialogElement.innerHTML = dialogHtml;
            document.body.appendChild(dialogElement);
            let settingRaw = GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true });
            var bftEditMenu = new Vue({
                el: '#bft-settingMenu',
                data: {
                    settingRaw
                },
                methods: {
                    saveRules() {
                        // 将规则写入配置中
                        GM_setValue("setting", this.settingRaw);
                        // 重载配置
                        reloadRules();
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                        // 添加已关闭面板的标记
                        GM_setValue("temp_isMenuOpen", false);
                    },
                    close() {
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                        // 添加已关闭面板的标记
                        GM_setValue("temp_isMenuOpen", false);
                    }
                }
            });
        } else if (GM_getValue("temp_isMenuOpen", false)) {
            showSnackbar('已存在已经打开的设置面板,请先关闭', 'error', 5, '确认');
        }
    }
    // 用户快速加入设置 不包括快速加入按钮
    function fastAddUserFilterRules(uid) {
        if (document.getElementById('bft-menu') === null) {
            // console.debug('[BF]已选中', uid);

            let dialogHtml = `
            <div class="bft-setting-window" id="bft-fastAdd">
            <div class="bft-setting-title">
                快速加入 <small>{{newRule.uid}}</small>
            </div>
            <div class="bft-setting-contain">
                <!-- 规则集条目 -->
                <div class="bft-ruleset">
                    <div class="bft-ruleset-contain">
                        <label class="bft-select-label">规则集：</label>
                        <select class="bft-select"  v-model="rulesetIndex[0]">
                            <option :value="index"  v-for="(item,index) in userFilterRulesRaw" v-if="item.link=='local'">{{item.name}}</option>
                        </select>
                        <div class="bft-input-container">
                            <input type="number" class="bft-input-field" min="1" max="5" required
                            v-model.lazy="newRule.level" />
                            <label class="bft-input-label">标记等级</label>
                            <div class="bft-input-bar"></div>
                        </div>

                    </div>
                </div>
            </div>
            <div class="bft-setting-action">
                <button class="bft-button" @click="saveRules">保存</button>
                <button class="bft-button" @click="close">取消</button>
            </div>
        </div>
            `;
            let dialogElement = document.createElement('div');
            dialogElement.id = 'bft-menu';
            dialogElement.innerHTML = dialogHtml;
            document.body.appendChild(dialogElement);
            var bftEditMenu = new Vue({
                el: '#bft-fastAdd',
                data: {
                    userFilterRulesRaw: GM_getValue("userFilterRules", [{
                        "name": "示例",
                        "describe": "这是一个本地规则集的示例",
                        "enable": false,
                        "link": "local",
                        "lastUpdate": 1680699306,
                        "level": 3,
                        "rules": [
                            {
                                "uid": "114514",
                                "level": "5",
                                "lastUpdate": 1680699306
                            }
                        ]
                    }]),
                    newRule: { uid: uid, level: 3, lastUpdate: parseInt(Date.now() / 1000) },
                    rulesetIndex: [0]
                },
                methods: {
                    saveRules() {
                        // 将规则写入配置中
                        // 检测规则集是否已经存在该用户
                        let isAdd = true;
                        for (let f = 0; f < this.userFilterRulesRaw[this.rulesetIndex[0]].rules.length; f++) {
                            if (this.newRule.uid == this.userFilterRulesRaw[this.rulesetIndex[0]].rules[f].uid) {
                                console.error('[BF][设置]无法添加，因为该用户已存在。#', f + 1);
                                showSnackbar(`无法添加，该用户已存在于该规则集中，(#${f + 1})`, 'error', 3000, '关闭');
                                isAdd = false;
                            }
                        }
                        if (isAdd == true) {
                            // 更新 新用户时间
                            this.newRule.lastUpdate = Math.floor(Date.now() / 1000);
                            // console.debug(`加入的规则集${this.rulesetIndex[0]}，${this.userFilterRulesRaw}`);
                            // 将新用户加入指定规则集
                            this.userFilterRulesRaw[this.rulesetIndex[0]].rules.push(this.newRule);
                            // 更新 规则更新日期
                            this.userFilterRulesRaw[this.rulesetIndex[0]].lastUpdate = Math.floor(Date.now() / 1000);
                            // 保存对话框中修改的配置至存储
                            GM_setValue("userFilterRules", this.userFilterRulesRaw);
                            console.info('[BF][设置]成功添加规则。');
                            showSnackbar(`成功添加规则`, 'info', 5, '关闭');
                        }
                        // 重载配置
                        reloadRules();
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                    },
                    close() {
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                    }
                }
            });
        }

    }
    // 关于页面 独立模态对话框
    function bftAboutDialog() {
        if (document.getElementById('bft-AboutDialog') === null) {

            let dialogHtml = `
            <div class="bft-setting-window" id="bft-fastAdd">
                <div class="bft-setting-title">
                    关于 <small id="bft-version"></small>
                </div>
                <div class="bft-setting-contain">
                    <div class="bft-about">
                        <h1>
                            关于本脚本
                        </h1>
                        <p>
                            这是一个可以过滤掉不顺眼的东西的小脚本。对于某些人，我真想说“[数据删除]！”
                        </p>
                        <p>
                            另外记住，一定要注意该脚本仍处于测试阶段，可能会造成意料之外的错误，请注意备份本脚本的设置。
                        </p>
                        <h1>
                            作者
                        </h1>
                        <p id="bft-author">
                        </p>
                        <h1>
                            外部链接
                        </h1>
                        <p>
                            <a href="https://github.com/ChizhaoEngine/BFT/wiki" target="_blank">使用文档</a>
                            <a href="https://github.com/ChizhaoEngine/BFT/" target="_blank">开源地址</a>
                            <a href="https://github.com/ChizhaoEngine/BFT/issues" target="_blank">问题报告</a>
                        </p>
                        <p id="bft-copyright" style="color: #ece4fc;">
                        </p>
                    </div>

                </div>
                <div class="bft-setting-action">
                    <button class="bft-button" id="bft-close-window">关闭</button>
                </div>
            </div>
            `;
            let dialogElement = document.createElement('div');
            dialogElement.id = 'bft-aboutDialog';
            dialogElement.innerHTML = dialogHtml;
            document.body.appendChild(dialogElement);
            // 其他
            document.getElementById('bft-version').innerHTML = GM_info.script.version;
            document.getElementById('bft-author').innerHTML = GM_info.script.author;
            document.getElementById('bft-copyright').innerHTML = GM_info.script.copyright;
            document.getElementById('bft-close-window').addEventListener("click", function () {
                document.getElementById('bft-aboutDialog').remove();
            });

        }
    }
    // 开启设置面板的按钮
    async function addOpenMenuButton() {
        // 每 500ms 执行一次循环
        while (document.body === null) {
            await new Promise(function (resolve) {
                // 通过延迟返回resolve来阻塞while的执行。
                //setTimeout(resolve,100) 和 setTimeout(resolve(),100) 有很大区别，后者会会立即执行，然后它的返回值将在 100 毫秒后被调用，这将导致resolve会立刻执行，不管有没有调用其返回值，从而无法阻塞while循环100ms。
                setTimeout(resolve, 500);
            });
        }
        // document.body 加载完后再执行
        let dialogHtml = `
        <div class="bft-fab-big"><svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px"
                viewBox="0 0 24 24" width="24px" fill="#000000">
                <g>
                    <path d="M0,0h24 M24,24H0" fill="none" />
                    <path
                        d="M7,6h10l-5.01,6.3L7,6z M4.25,5.61C6.27,8.2,10,13,10,13v6c0,0.55,0.45,1,1,1h2c0.55,0,1-0.45,1-1v-6 c0,0,3.72-4.8,5.74-7.39C20.25,4.95,19.78,4,18.95,4H5.04C4.21,4,3.74,4.95,4.25,5.61z" />
                    <path d="M0,0h24v24H0V0z" fill="none" />
                </g>
            </svg></div>
        <div class="bft-fab-mini-contain">
            <div class="bft-fab-mini" id='bftFab_openMenu_user'><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24"
                    width="24px" fill="#000000">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                        d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z" />
                </svg>
                <div class="bft-fab-mini-label">用户过滤设置</div>
            </div>
            <div class="bft-fab-mini" id='bftFab_openMenu_text'><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24"
                    width="24px" fill="#000000">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" />
                </svg>
                <div class="bft-fab-mini-label">标题评论过滤设置</div>
            </div>
            <div class="bft-fab-mini" id='bftFab_openMenu_other'><svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24"
                    height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                    <g>
                        <rect fill="none" height="24" width="24" />
                        <path
                            d="M9.78,11.16l-1.42,1.42c-0.68-0.69-1.34-1.58-1.79-2.94l1.94-0.49C8.83,10.04,9.28,10.65,9.78,11.16z M11,6L7,2L3,6h3.02 C6.04,6.81,6.1,7.54,6.21,8.17l1.94-0.49C8.08,7.2,8.03,6.63,8.02,6H11z M21,6l-4-4l-4,4h2.99c-0.1,3.68-1.28,4.75-2.54,5.88 c-0.5,0.44-1.01,0.92-1.45,1.55c-0.34-0.49-0.73-0.88-1.13-1.24L9.46,13.6C10.39,14.45,11,15.14,11,17c0,0,0,0,0,0h0v5h2v-5 c0,0,0,0,0,0c0-2.02,0.71-2.66,1.79-3.63c1.38-1.24,3.08-2.78,3.2-7.37H21z" />
                    </g>
                </svg>
                <div class="bft-fab-mini-label">其他过滤设置</div>
            </div>
            <div class="bft-fab-mini" id='bftFab_openMenu_otherset'><svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24"
                    height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                    <g>
                        <rect fill="none" height="24" width="24" />
                    </g>
                    <g>
                        <g>
                            <rect height="8.48" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -6.8717 17.6255)"
                                width="3" x="16.34" y="12.87" />
                            <path
                                d="M17.5,10c1.93,0,3.5-1.57,3.5-3.5c0-0.58-0.16-1.12-0.41-1.6l-2.7,2.7L16.4,6.11l2.7-2.7C18.62,3.16,18.08,3,17.5,3 C15.57,3,14,4.57,14,6.5c0,0.41,0.08,0.8,0.21,1.16l-1.85,1.85l-1.78-1.78l0.71-0.71L9.88,5.61L12,3.49 c-1.17-1.17-3.07-1.17-4.24,0L4.22,7.03l1.41,1.41H2.81L2.1,9.15l3.54,3.54l0.71-0.71V9.15l1.41,1.41l0.71-0.71l1.78,1.78 l-7.41,7.41l2.12,2.12L16.34,9.79C16.7,9.92,17.09,10,17.5,10z" />
                        </g>
                    </g>
                </svg>
                <div class="bft-fab-mini-label">杂项设置</div>
            </div>
            <div class="bft-fab-mini" id='bftFab_openMenu_about'>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                        d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <div class="bft-fab-mini-label">关于</div>

            </div>
        </div>
            `;
        let dialogElement = document.createElement('div');
        dialogElement.classList.add('bft-fab');
        dialogElement.innerHTML = dialogHtml;
        document.body.appendChild(dialogElement);
        // 点击事件监听器
        document.getElementById('bftFab_openMenu_user').addEventListener('click', function () {
            bftSettingMenu_userFilter();
        });
        document.getElementById('bftFab_openMenu_text').addEventListener('click', function () {
            bftSettingMenu_textFilter();
        });
        document.getElementById('bftFab_openMenu_other').addEventListener('click', function () {
            bftSettingMenu_otherFilter();
        });
        document.getElementById('bftFab_openMenu_otherset').addEventListener('click', function () {
            bftSettingMenu_setting();
        });
        document.getElementById('bftFab_openMenu_about').addEventListener('click', function () {
            bftAboutDialog();
        });

    }
    // -----
    // 组件
    // -----
    // Snackbar
    // --
    // 显示 Snackbar 的函数 actionText与action可以不添加，即不显示按钮或不执行
    function showSnackbar(message, level, time, actionText, action) {
        // 创建 Snackbar
        let snackbarContainer = document.createElement('div');
        snackbarContainer.classList.add('bft-snackbar');
        // 创建 logo
        let snackbarIcon = document.createElement('div');
        snackbarIcon.classList.add('bft-snackbar-icon');
        switch (level) {
            case 'error':
                snackbarIcon.style = `fill: red;`;
                snackbarIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M479.982-280q14.018 0 23.518-9.482 9.5-9.483 9.5-23.5 0-14.018-9.482-23.518-9.483-9.5-23.5-9.5-14.018 0-23.518 9.482-9.5 9.483-9.5 23.5 0 14.018 9.482 23.518 9.483 9.5 23.5 9.5ZM453-433h60v-253h-60v253Zm27.266 353q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80-397.681 80-480.5q0-82.819 31.5-155.659Q143-709 197.5-763t127.341-85.5Q397.681-880 480.5-880q82.819 0 155.659 31.5Q709-817 763-763t85.5 127Q880-563 880-480.266q0 82.734-31.5 155.5T763-197.684q-54 54.316-127 86Q563-80 480.266-80Zm.234-60Q622-140 721-239.5t99-241Q820-622 721.188-721 622.375-820 480-820q-141 0-240.5 98.812Q140-622.375 140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z"/></svg>`;
                break;
            case 'warning':
                snackbarIcon.style = `fill: #ffb772;`;
                snackbarIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m40-120 440-760 440 760H40Zm104-60h672L480-760 144-180Zm340.175-57q12.825 0 21.325-8.675 8.5-8.676 8.5-21.5 0-12.825-8.675-21.325-8.676-8.5-21.5-8.5-12.825 0-21.325 8.675-8.5 8.676-8.5 21.5 0 12.825 8.675 21.325 8.676 8.5 21.5 8.5ZM454-348h60v-224h-60v224Zm26-122Z"/></svg>`;
                break;
            case 'info':
                snackbarIcon.style = `fill: #65a3ff;`;
                snackbarIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M453-280h60v-240h-60v240Zm26.982-314q14.018 0 23.518-9.2T513-626q0-14.45-9.482-24.225-9.483-9.775-23.5-9.775-14.018 0-23.518 9.775T447-626q0 13.6 9.482 22.8 9.483 9.2 23.5 9.2Zm.284 514q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80-397.681 80-480.5q0-82.819 31.5-155.659Q143-709 197.5-763t127.341-85.5Q397.681-880 480.5-880q82.819 0 155.659 31.5Q709-817 763-763t85.5 127Q880-563 880-480.266q0 82.734-31.5 155.5T763-197.684q-54 54.316-127 86Q563-80 480.266-80Zm.234-60Q622-140 721-239.5t99-241Q820-622 721.188-721 622.375-820 480-820q-141 0-240.5 98.812Q140-622.375 140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z"/></svg>`;
                break;
        }
        snackbarContainer.appendChild(snackbarIcon);
        // 文本
        let snackbarContent = document.createElement('span');
        snackbarContent.classList.add('bft-snackbar-content');
        snackbarContent.textContent = message;
        snackbarContainer.appendChild(snackbarContent);
        // 添加按钮
        if (actionText && actionText !== "") {
            let snackbarButton = document.createElement('button');
            snackbarButton.textContent = actionText;
            snackbarButton.classList.add('bft-snackbar-button');
            snackbarButton.onclick = function () {
                hideSnackbar();
            };
            if (action && typeof action === 'function') {
                snackbarButton.onclick = function () {
                    action();
                    hideSnackbar();
                };
            }
            snackbarContainer.appendChild(snackbarButton);
        }
        // 创建容器
        // 创建容器
        if (document.getElementsByClassName('bft-snackbar-container')[0]) {
            var snackbarDiv = document.getElementsByClassName('bft-snackbar-container')[0];
        } else {
            var snackbarDiv = document.createElement('div');
            snackbarDiv.classList.add('bft-snackbar-container');
        }
        // 将 Snackbar 添加到容器中
        snackbarDiv.appendChild(snackbarContainer);
        //  将 Snackbar容器 添加到页面
        document.body.appendChild(snackbarDiv);

        // 定义延时，一定时间后隐藏 Snackbar
        setTimeout(function () {
            hideSnackbar();
        }, time * 1000); // 这里设置显示时间
    }
    // 隐藏 Snackbar 的函数
    function hideSnackbar() {
        let snackbarContainer = document.getElementsByClassName('bft-snackbar')[0];
        if (snackbarContainer) {
            document.getElementsByClassName('bft-snackbar')[0].remove();
        }
    }
    // --
    // 可交互式对话框
    function interactiveDialog(type, title, dialogText, inputType = 'text') {
        if (type === 'input' && document.getElementById('bft-dialog') === null) {
            const dialogHtml = `
            <div class="bft-dialog-model">
            <div class="bft-dialog">
    <div class="bft-dialog-title" id="bftDialog_title">[null]</div>
    <div class="bft-dialog-content" id="bftDialog_content">
        <div class="bft-input-container">
            <input id="bftDialog_input" type="text" class="bft-input-field" min="0" required />
            <label class="bft-input-label" id="bftDialog_label"></label>
            <div class="bft-input-bar"></div>
        </div>
    </div>
    <div class="bft-dialog-action">
        <button id="bftDialog_confirm" class="bft-button">确认</button>
        <button id="bftDialog_cancel" class="bft-button">取消</button>
    </div>
</div>
</div>
            `;
            let dialogElement = document.createElement('div');
            dialogElement.id = 'bft-dialog';
            dialogElement.innerHTML = dialogHtml;
            document.body.appendChild(dialogElement);
            document.getElementById('bftDialog_title').innerText = title;
            document.getElementById('bftDialog_label').innerText = dialogText;
            document.getElementById('bftDialog_input').setAttribute('type', inputType);

            // 创建一个Promise异步对象,等待后续操作
            return new Promise((resolve, reject) => {
                document.getElementById('bftDialog_confirm').addEventListener('click', function () {
                    // 提交时传回值

                    // const value = "Some value"; // 假设这是从点击事件中获取的值
                    resolve(document.getElementById('bftDialog_input').value); // 将值传递给异步函数
                });
                // 取消
                document.getElementById('bftDialog_cancel').addEventListener('click', function () {
                    document.getElementById('bft-dialog').remove();
                    reject('user cancel this operation');
                });
            });
        }
    }
    // --
    // -----
    // 其他
    // -----
    // 自动更新:内容过滤
    function autoUpdateTextRulesets() {
        // 读取规则集
        let textFilterRulesRaw = GM_getValue("textFilterRules", []);
        textFilterRulesRaw.forEach(function (resource) {
            //  只有是远程规则&&大于设定的更新时间才需要更新
            if (resource.type === "remote" && (Math.floor(Date.now() / 3600000) - resource.lastUpdate / 3600) >= GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).autoUpdate && GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).autoUpdate != 0) {
                console.log(`[BF][设置]规则集：${resource.name} 正在准备更新`);
                GM_xmlhttpRequest({
                    method: "GET",
                    url: resource.link,
                    responseType: "json", // Expect a json response type
                    onload: function (response) {
                        // Check if the status code is 200 (OK)
                        if (response.status === 200) {
                            // Get the response body as a json object
                            let json = response.response;

                            // 转换
                            // let array = JSON.parse(json);

                            // Add the array to the obj[prop] property
                            resource.rules = json;
                            console.log(json);
                            console.log(`规则集：${resource.name} 已更新`);
                            // 更新 规则中的用户的更新日期
                            resource.lastUpdate = Math.floor(Date.now() / 1000);
                            GM_setValue("textFilterRules", textFilterRulesRaw);
                        } else {
                            // Handle other status codes here, such as logging an error message
                            console.error("Request failed: " + response.statusText);
                        }
                    },
                    onerror: function (error) {
                        // Handle errors here, such as logging an error message
                        console.error("Error: " + error.message);
                    }
                });
            }
        });
    }
    // 自动更新：用户过滤
    function autoUpdateUserRulesets() {
        // 读取规则集
        let userFilterRulesRaw = GM_getValue("userFilterRules", []);
        userFilterRulesRaw.forEach(function (resource) {
            if (resource.link != "local" && (Math.floor(Date.now() / 3600000) - resource.lastUpdate / 3600) >= GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).autoUpdate && GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).autoUpdate != 0) {
                console.log(`[BF][设置]规则集：${resource.name} 正在准备更新`);
                GM_xmlhttpRequest({
                    method: "GET",
                    url: resource.link,
                    responseType: "json", // Expect a json response type
                    onload: function (response) {
                        // Check if the status code is 200 (OK)
                        if (response.status === 200) {
                            // Get the response body as a json object
                            let json = response.response;

                            // 转换
                            // let array = JSON.parse(json);

                            // Add the array to the obj[prop] property
                            resource.rules = json;
                            console.log(json);
                            console.log(`规则集：${resource.name} 已更新`);
                            // 更新 规则中的用户的更新日期
                            resource.lastUpdate = Math.floor(Date.now() / 1000);
                            GM_setValue("userFilterRules", userFilterRulesRaw);
                        } else {
                            // Handle other status codes here, such as logging an error message
                            console.error("Request failed: " + response.statusText);
                        }
                    },
                    onerror: function (error) {
                        // Handle errors here, such as logging an error message
                        console.error("Error: " + error.message);
                    }
                });
            }
        });
    }
    // 检测脚本更新
    function autoUpdateScript() {
        //发起一个get请求
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://raw.githubusercontent.com/ChizhaoEngine/BiliFilter/main/bft.user.js",
            onload: function (response) {
                const versionMatch = response.responseText.match(/@version\s+([0-9.]+)/);
                if (versionMatch[1] !== GM_info.script.version) {
                    showSnackbar('检测到BiliFilter需要更新', 'warning', 5, '更新', function () {
                        const newWindow = window.open("https://raw.githubusercontent.com/ChizhaoEngine/BiliFilter/main/bft.user.js");
                        newWindow.opener = null;
                    });
                }
            }
        });
    }
    autoUpdateScript();
    // 时间戳-->日期格式
    Vue.filter('formatDate', function (value) {
        if (value) {
            // 创建一个 Date 对象
            let dateRaw = Math.floor(value * 1000);
            let date = new Date(dateRaw);
            let year = date.getFullYear();
            // 获取月份，注意要加1   <--- 我是傻逼
            let month = date.getMonth() + 1;
            // 获取日期
            let day = date.getDate();
            // 获取小时
            let hour = date.getHours();
            // 获取分钟
            let minute = date.getMinutes();
            // 获取秒钟
            let second = date.getSeconds();

            // 如果月份、日期、小时、分钟或秒钟小于10，就在前面补0
            if (month < 10) {
                month = '0' + month;
            }

            if (day < 10) {
                day = '0' + day;
            }

            if (hour < 10) {
                hour = '0' + hour;
            }

            if (minute < 10) {
                minute = '0' + minute;
            }

            if (second < 10) {
                second = '0' + second;
            }

            // 拼接成 YYYY-MM-DD hh:mm:ss 的格式
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
        }
    });


    // Your shit code here...
})();