// ==UserScript==
// @name         BiliFilter3
// @namespace    https://github.com/ChizhaoEngine/BiliFilter
// @version      0.3.7
// @description  杀掉你不想看到的东西
// @author       池沼动力
// @license      CC BY-NC-ND 4.0
// @match        *.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico?v=1
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
    .bft-heimu span{
        
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .bft-heimu:hover span{
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
        z-index: 5; /* 提高层级，使覆盖层在内容上方 */
        border-radius: 5px;
      }
      
      .bft-overlay:hover::after {
        opacity: 0;
      }

      /*  设置面板  */
      .bft-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f0f0f0;
        z-index: 9999;
        padding: 10px;

    }


      .bft-panel form {
        margin-bottom: 10px;
    }

    .bft-panel label {
        display: block;
        margin-bottom: 5px;
    }

    .bft-panel input[type="checkbox"] {
        margin-right: 5px;
    }

    .bft-panel input[type="text"],
    .bft-panel input[type="url"],
    .bft-panel input[type="number"],
    .bft-panel textarea {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        box-sizing: border-box;
        width: 90%;
        margin: 5px;
    }

    .bft-panel select {
        width: 100%;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        box-sizing: border-box;

    }

    .bft-panel button {
        padding: 8px 16px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        margin-top: 10px;
    }

    .bft-panel button:hover {
        background-color: #0056b3;
    }
    .bft-panel button:active {
        background-color: #00377d;
    }
    .bft-panel button:focus {
      background-color: #0056b3;
    }


    .bft-panel {
        max-height: 90vh;
        overflow: auto;
    }

    .bft-panel-title {
        background-color: #eaeaea;
        border: none;
        border-radius: 3px;
        padding: 10px;
    }


    .bft-panel h2 {
        display: block;
        font-size: 1.5em;
        margin-block-start: 0.83em;
        margin-block-end: 0.83em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        font-weight: bold;
    }

    .bft-panel h3 {
        display: block;
        font-size: 1.17em;
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        font-weight: bold;
    }


    .bft-panel p {
        display: block;
        font-size: 1em;
    }

    .bft-panel label {
        display: block;
        font-size: 1em;
        margin-top: 5px;
    }

    .bft-bottom-buttons {
        margin-top: 15px;
    }
      
  
    
    `);

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
    //


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
                    console.log("[BFT][用户][视频页评论]发现目标", mainCommentUid, '规则集:', isUserNeedFilter(mainCommentUid)[1], mainComment[mainCommentId]);
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
                    console.log("[BFT][用户][视频页评论]发现目标", subReplyUid, '规则集:', isUserNeedFilter(subReplyUid)[1], subReply[i]);
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
                console.log('[BFT][用户][首页视频]匹配到规则：', isUserNeedFilter(match[0])[1], videoCard[l]);
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
                console.log('[BFT][用户][视频页视频推荐]匹配到规则：', isUserNeedFilter(match[0])[1], videoCard[l]);
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

                // console.debug('[BFT][评论文本内容调试]', targetText); // 输出提取的结果

                // 请求函数,并且排除已过滤项
                if (isTextNeedBlock(targetText)[0] === true) {
                    // 若需要过滤，则为文本覆盖层
                    targetElements[i].classList.add('bft-heimu');
                    // 调试
                    console.log('[BFT][内容][评论]匹配到规则：', isTextNeedBlock(targetText)[1], targetText, targetElements[i]);
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
                console.log('[BFT][内容][视频]匹配到规则：', isTextNeedBlock(targetText)[1], targetElementsforRight[i]);
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
                console.log('[BFT][内容][专栏页评论]匹配到规则：', isTextNeedBlock(targetComText)[1], targetComEle[i]);
            }
            // 添加标记
            targetComEle[i].classList.add('bft-textFiltered');
        }
    }

    // 根据内容寻找并覆写 搜索页
    function findTextandBlockinSearch() {
        // 过滤搜索的视频
        let targetEle = document.getElementsByClassName('bili-video-card');
        for (let j = 0; j < targetEle.length; j++) {
            let targetText = targetEle[j].querySelector('div.bili-video-card__wrap.__scale-wrap div.bili-video-card__info.__scale-disable div.bili-video-card__info--right a h3.bili-video-card__info--tit').getAttribute('title');
            if (isTextNeedBlock(targetText)[0] && !targetEle[j].classList.contains('bft-textFiltered')) {
                targetEle[j].classList.add('bft-overlay');
                console.log('[BFT][内容][搜索页视频]匹配到规则：', isTextNeedBlock(targetText)[1], targetEle[j]);
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
                console.log('[BFT][内容][搜索页专栏]匹配到规则：', isTextNeedBlock(targetArtText)[1], targetArtEle[j]);
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
                console.log('[BFT][内容][搜索页影视与番剧]匹配到规则：', isTextNeedBlock(targetMedText)[1], targetMedEle[j]);
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
                console.log('[BFT][内容][搜索页直播]匹配到规则：', isTextNeedBlock(targetLivText)[1], targetLivEle[j]);
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
                console.log('[BFT][内容][各分区页视频]匹配到规则：', isTextNeedBlock(targetText)[1], targetEle[j]);
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
                console.log('[BFT][内容][首页视频]匹配到规则：', isTextNeedBlock(targetText)[1], targetEle[j]);
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
                    console.log('[BFT][时长][首页视频]小于指定时间：', totalSeconds, targetEle[i]);

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
                console.log('[BFT][时长][视频页视频推荐]小于指定时间：', totalSeconds, targetEle[i]);

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
                console.log('[BFT][时长][搜索页视频]小于指定时间：', totalSeconds, targetEle[i]);

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

    // --------------------------------------------------------------------------
    // 配置与设定弹窗函数
    // --------------------------------------------------------------------------
    // 用户过滤设置
    function bftSettingMenu_userFilter() {
        if (document.getElementById('bft-menu') === null) {
            let dialogHtml = `
            <style>
            #bft-editUserRulesMenu {
                position: fixed;
                top: 20px;
                right: 20px;
                border: 1px solid #ffffff;
                border-radius: 5px;
                background-color: #f7f7f7;
                z-index: 9999;
                padding: 10px;
                width: 364px;
    
            }
    
    
        </style>
        <div id="bft-editUserRulesMenu">
            <!-- 主悬浮窗 -->
            <div class="bft-panel">
                <h2>用户过滤设置</h2>
                <!-- 循环渲染规则集列表 -->
                <div v-for="(ruleSet, index) in userFilterRulesRaw" :key="index" class="bft-panel-title" style="margin: 5px;">
                    <div class="rule-set-header">
                        <h3>{{ ruleSet.name }} {{ ruleSet.enable ? '✅' : '❌' }}</h3>
                        <p>{{ ruleSet.describe }}</p>
                        <p>类型: {{ ruleSet.link === 'local' ? '本地' : '远程' }}</p>
                        <p>最后更新: {{ ruleSet.lastUpdate | formatDate }}</p>
                        <p>共{{ ruleSet.rules.length }}条规则</p>
                        <!-- 编辑、导出、删除规则集、更新按钮 -->
                        <!-- 根据规则集类型决定是否显示相应按钮 -->
                        <button type="button" @click="editRuleSet(index)" v-if="index !== activeRuleSetIndex">编辑</button>
                        <button type="button" @click="closeEditWindow" v-if="index === activeRuleSetIndex">收起</button>
                        <button type="button" @click="outputRuleSet(index)" v-if="ruleSet.link === 'local'">导出</button>
                        <button type="button" @click="deleteRuleSet(index)">删除</button>
                        <button type="button" @click="updateRuleSet(index)" v-if="ruleSet.link !== 'local'">更新</button>
                    </div>
                    <!-- 二级悬浮窗，编辑规则集 -->
                    <div v-if="index === activeRuleSetIndex" class="edit-floating-window">
                        <h3>编辑规则集</h3>
                        <form>
                            <!-- 表单组件，用于更改规则集的属性 -->
                            <label>名称:</label>
                            <input type="text" v-model="ruleSet.name" @change="updateRulesetTime(index)">
                            <label>描述:</label>
                            <input type="text" v-model="ruleSet.describe" @change="updateRulesetTime(index)">
                            <label>过滤等级(仅过滤标记等级数值上低于过滤等级的用户):</label>
                            <input type="text" v-model="ruleSet.level" @change="updateRulesetTime(index)">
                            <label>启用：</label>
                            <input v-model.lazy="ruleSet.enable" type="checkbox" />
                            <label v-if="ruleSet.link !== 'local'">更新链接:</label>
                            <input type="text" v-model="ruleSet.link" v-if="ruleSet.link !== 'local'"
                                @change="updateRulesetTime(index)">
                            <button type="button" @click="convertToLocal(index)"
                                v-if="ruleSet.link !== 'local'">转为本地规则</button>
                            <button type="button" @click="closeEditWindow" style="display: block;">收起</button>
    
                            <!-- 更改rules数组的表单组件 -->
                            <label v-for="(rule, ruleIndex) in ruleSet.rules" :key="ruleIndex" style="margin-top: 20px;"
                                v-if="ruleSet.link === 'local'">
                                <p>#{{ruleIndex+1}} ⏰{{rule.lastUpdate | formatDate}}</p>
                                <label>UID:</label> <input type="text" v-model="rule.uid"
                                    @change="updateRuleTime(index,ruleIndex);checkDuplicate(index,ruleIndex)">
                                <label>标记级别:</label> <input type="text" v-model="rule.level"
                                    @change="updateRuleTime(index,ruleIndex)">
                                <button type="button" @click="deleteRule(index, ruleIndex)"
                                    style="margin-top: 10px;">删除</button>
                            </label>
                            <button type="button" @click="addRule(index)" v-if="ruleSet.link === 'local'">新建</button>
                            <button type="button" @click="inputRuleSet(index)"
                                v-if="ruleSet.link === 'local'">导入Json</button>
                        </form>
                        <button type="button" @click="closeEditWindow">收起</button>
                    </div>
                </div>
                <!-- 底部按钮 -->
                <div class="bft-bottom-buttons">
                    <button type="button" @click="saveRuleSets">保存</button>
                    <button type="button" @click="closeWindow" style="background-color: red;">取消</button>
                    <button type="button" @click="createRuleSet">新建本地规则集</button>
                    <button type="button" @click="createRemoteRuleSet">新建远程规则集</button>
                    <button type="button" @click="outputBlacklistInBili()">导出B站黑名单</button>
    
                </div>
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
                    activeRuleSetIndex: -1 // 用于跟踪当前处于编辑状态的规则集的索引
                },
                methods: {
                    editRuleSet(index) {
                        this.activeRuleSetIndex = index;
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
                        this.userFilterRulesRaw[ruleSetIndex].rules.splice(ruleIndex, 1);
                    },
                    addRule(index) {
                        // 添加规则的逻辑
                        this.userFilterRulesRaw[index].rules.push({ uid: 0, level: 3, lastUpdate: parseInt(Date.now() / 1000) });
                    },
                    closeEditWindow() {
                        this.activeRuleSetIndex = -1;
                    },
                    saveRuleSets() {
                        // 保存规则集的逻辑
                        // 将规则写入配置中
                        GM_setValue("userFilterRules", this.userFilterRulesRaw);
                        // 重载配置
                        reloadRules();
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                    },
                    closeWindow() {
                        // 关闭悬浮窗的逻辑
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
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
                        console.error(outPut);
                        // 复制到粘贴板
                        GM.setClipboard(outPut);
                        //提示 复制成功
                        console.info('[BFT][配置]规则已经导入剪切板');
                        alert('已导出至剪切板');
                    },
                    updateRuleSet(index) {
                        // 手动更新规则
                        this.frechRules(this.userFilterRulesRaw[index].link, index);
                    },
                    inputRuleSet(index) {
                        //导入规则
                        let inputJson = prompt("输入Json以导入规则", '[{"uid":"114514","level":"5","lastUpdate":1680699306}]');
                        if (inputJson != null && inputJson != "") {
                            let arrayInput = JSON.parse(inputJson); //转为对象
                            // console.log(arrayInput);
                            if (arrayInput.length != 0) {
                                // 将规则集的更新时间设为现在时间
                                this.userFilterRulesRaw[index].lastUpdate = Math.floor(Date.now() / 1000);
                            }
                            for (let m = 0; m < arrayInput.length; m++) {
                                // 如果原规则集中存在该用户则不导入
                                let isDup = false;
                                for (let i = 0; i < this.userFilterRulesRaw[index].rules.length; i++) {
                                    if (arrayInput[m].uid == this.userFilterRulesRaw[index].rules[i].uid) {
                                        // 一旦重复，isDup设为true,同时结束当前循环，跳过当前用户
                                        isDup = true;
                                        console.err("导入规则时发现重复用户：" + this.userFilterRulesRaw[index].rules[i].uid + "，位于原规则的第" + (i + 1));
                                        alert('发生错误：无法导入，因为目标规则集中该用户已存在。#', i + 1);
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
                                    console.log('[BFT][配置]远程配置获取成功。');
                                    alert('远程配置获取成功');
                                    // 更新 规则中的用户的更新日期
                                    userFilterRulesRaw[index].lastUpdate = Math.floor(Date.now() / 1000);
                                } else {
                                    // Handle other status codes here, such as logging an error message
                                    console.error("[BFT][配置]远程配置格式异常，请检查链接是否有效。#" + response.statusText);
                                    alert("远程配置格式异常，请检查链接是否有效。#" + response.statusText);

                                }
                            },
                            onerror: function (error) {
                                // Handle errors here, such as logging an error message
                                console.error("[BFT][配置]无法获取远程配置。#" + error.message);
                                alert("无法获取远程配置。#" + error.message);

                            }
                        });
                    },
                    checkDuplicate(index, userIndex) {
                        // 检查是否和本规则集中的用户重复了
                        for (let f = 0; f < this.userFilterRulesRaw[index].rules.length; f++) {
                            if (this.userFilterRulesRaw[index].rules[userIndex].uid == this.userFilterRulesRaw[index].rules[f].uid && userIndex != f) {
                                console.error(`[BFT][配置]该用户已存在(#${f + 1})`);
                                alert(`该用户已存在(#${f + 1})`);
                            }
                        }
                    },
                    outputBlacklistInBili() {
                        // 导出B站站内黑名单
                        let blacklist = [];
                        console.info('[BFT][配置]开始请求，请等待大约5秒');
                        alert('开始请求，请等待大约5秒');
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
                                        console.error("[BFT][配置]请求失败，账号未登录。Error: " + error.message);
                                        alert("请求失败，账号未登录。Error: " + error.message);

                                        page = 114;
                                    } else if (date.code === -404) {
                                        page = 114;
                                        console.error("[BFT][配置]请求失败，无法从API获取信息。Error: " + error.message);
                                        alert("请求失败，无法从API获取信息。Error: " + error.message);
                                    }
                                },
                                onerror: function (error) {
                                    // Handle errors here, such as logging an error message
                                    console.error("Error: " + error.message);
                                    alert("错误: " + error.message);
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
                            console.info('[BFT][配置]请求成功。黑名单已粘贴到剪切板。');
                            alert('请求成功。黑名单已粘贴到剪切板');
                            page == 100;
                        }
                    },
                }
            });
        }

    }
    // 内容过滤设定
    function bftSettingMenu_textFilter() {
        if (document.getElementById('bft-menu') === null) {
            let dialogHtml = `
            <style>
            .bft-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: #f0f0f0;
                z-index: 9999;
                padding: 10px;
    
            }
    
            .bft-panel form {
                margin-bottom: 10px;
            }
    
            .bft-panel label {
                display: block;
                margin-bottom: 5px;
            }
    
            .bft-panel input[type="text"],
            .bft-panel input[type="url"],
            .bft-panel textarea {
                width: 100%;
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 3px;
                box-sizing: border-box;
            }
    
            .bft-panel input[type="checkbox"] {
                margin-right: 5px;
            }
    
            .bft-panel select {
                width: 100%;
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 3px;
                box-sizing: border-box;
            }
    
            .bft-panel button {
                padding: 8px 16px;
                background-color: #007bff;
                color: #fff;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            }
    
            .bft-panel button:hover {
                background-color: #0056b3;
            }
    
            .bft-panel .bft-panelContent {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease-out;
            }
    
            .bft-panel input[type="checkbox"]:checked+label+.bft-panelContent {
                max-height: 500px;
                /* 根据实际内容调整高度 */
            }
    
            .bft-panel {
                max-height: 90vh;
                overflow: auto;
            }
    
            .bft-panelTitle {
                background-color: #eaeaea;
                border: none;
                border-radius: 3px;
                padding: 10px;
            }
    
            .bft-panelTitle:hover {
                background-color: #ccc;
            }
    
            .bft-panel h2 {
                display: block;
                font-size: 1.5em;
                margin-block-start: 0.83em;
                margin-block-end: 0.83em;
                margin-inline-start: 0px;
                margin-inline-end: 0px;
                font-weight: bold;
            }
    
            .bft-panel h3 {
                display: block;
                font-size: 1.17em;
                margin-block-start: 1em;
                margin-block-end: 1em;
                margin-inline-start: 0px;
                margin-inline-end: 0px;
                font-weight: bold;
            }
            .bft-panel h4 {
                display: block;
                font-size: 0.8em;
                margin-block-start: 1em;
                margin-block-end: 1em;
                margin-inline-start: 0px;
                margin-inline-end: 0px;
                font-weight: bold;
            }
    
        </style>
        <div id="bft-editTextrulesMenu">
            <div class="bft-panel">
                <h2>内容过滤设置</h2>
                <form v-for="(item, index) in textFilterRulesRaw" :key="index">
                    <input style="visibility: hidden;" type="checkbox" :id="'bft-toggle' + index">
                    <label class="bft-panelTitle" :for="'bft-toggle' + index">
                        <h3>
                            {{item.name}} - {{item.describe}}
                        </h3>
                        <h4> <span v-if="item.type==='remote'">☁️远程</span><span v-if="item.type==='local'">💾本地</span> -
                            <span v-if="item.enable===true">✅启用</span><span v-if="item.enable===false">❌禁用</span> -
    
                            最后更新：{{item.lastUpdate | formatDate}}
                            创建日期：{{item.createDate | formatDate}}
                        </h4>
                    </label>
                    <div class="bft-panelContent"><label>名称：</label>
                        <input @change="updateTime(index)" v-model.lazy="item.name" type="text" />
    
                        <label>描述：</label>
                        <input @change="updateTime(index)" v-model.lazy="item.describe" type="text" />
    
    
    
                        <label>启用：</label>
                        <input @change="updateTime(index)" v-model.lazy="item.enable" type="checkbox" />
    
                        <label>类型：</label>
                        <select @change="updateTime(index)" v-model.lazy="item.type">
                            <option value="local">本地</option>
                            <option value="remote">远程</option>
                        </select>
    
                        <label v-if="item.type === 'remote'">更新链接：</label>
                        <input @change="updateTime(index)" v-if="item.type === 'remote'" v-model.lazy="item.link"
                            type="url" />
    
    
                        <label v-if="item.type === 'local'">正则表达式（多条请分行）：</label>
                        <textarea v-if="item.type === 'local'" rows="4" cols="50" @change="updateTime(index)"
                            v-model.lazy="item.rules"></textarea>
                        <button type="button" @click="deleteRuleSet(index)">删除</button>
                        <button type="button" @click="updateRuleSet(index)" v-if="item.type === 'remote'">更新</button>
                        <button type="button" @click="outputRuleSet(index)">导出为Json</button>
                    </div>
    
    
                </form>
                <button @click="addRuleSet">新建规则集</button>
                <button @click="saveRules">保存并关闭</button>
                <button @click="close">关闭</button>
            </div>
    
    
    
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
                    textFilterRulesRaw
                },
                methods: {
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
                    }
                    ,
                    outputRuleSet(index) {
                        // 导出指定规则集
                        GM.setClipboard(JSON.stringify(GM_getValue("textFilterRules", [])[index].rules));
                        alert('已导出至剪切板');
                    },
                    updateTime(index) {
                        // 为指定规则集更新最后更新时间
                        this.textFilterRulesRaw[index].lastUpdate = Math.floor(Date.now() / 1000);
                    },
                    close() {
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
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
                                    console.log(`[BFT][配置]第${index}个规则集已成功获取远程规则`);
                                } else {
                                    console.error(`[BFT][配置]第${index}个规则集获取远程规则失败：格式错误，${response.statusText}`);
                                }
                            },
                            onerror: function (error) {
                                // Handle errors here, such as logging an error message
                                console.error("Error: " + error.message);
                                console.error(`[BFT][配置]第${index}个规则集获取远程规则失败：无法访问，${error.message}`);
                            }
                        });
                    }

                }
            });
        }
    }
    // 其他过滤设定
    function bftSettingMenu_otherFilter() {
        if (document.getElementById('bft-menu') === null) {
            let dialogHtml = `
            <div id="bft-editOtherrulesMenu">
                <div class="bft-panel">
                    <h2>其他过滤设置</h2>
                    <form >
                        
                        <div class="bft-panelContent"><label>过滤视频时长低于（秒）：</label>
                            <input v-model.lazy="otherFilterRulesRaw.duration" type="number" />
        
                        </div>
        
        
                    </form>
                    <button @click="saveRules">保存并关闭</button>
                    <button @click="close">关闭</button>
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
                    },
                    close() {
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                    }
                }
            });
        }
    }
    // 杂项设定
    function bftSettingMenu_setting() {
        if (document.getElementById('bft-menu') === null) {
            let dialogHtml = `
            <div id="bft-settingMenu">
                <div class="bft-panel">
                    <h2>杂项设定</h2>
                    <form >
                        
                        <div class="bft-panelContent">
                            <label>过滤间隔（秒）：</label>
                            <input v-model.lazy="settingRaw.filterInterval" type="number" />
                            <label>自动更新间隔（小时）：</label>
                            <input v-model.lazy="settingRaw.autoUpdate" type="number" />
                            <label>启用快速添加用户：</label>
                            <input v-model.lazy="settingRaw.enableFastAddUserFilterRules" type="checkbox" />   
                        </div>
        
        
                    </form>
                    <button @click="saveRules">保存并关闭</button>
                    <button @click="close">关闭</button>
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
                    },
                    close() {
                        // 删除设定面板HTML
                        document.getElementById('bft-menu').remove();
                    }
                }
            });
        }
    }
    // 用户快速加入设置 不包括快速加入按钮
    function fastAddUserFilterRules(uid) {
        if (document.getElementById('bft-menu') === null) {
            // console.debug('[BFT]已选中', uid);

            let dialogHtml = `
            <div id="bft-fastAdd">
                <div class="bft-panel">
                    <h2>快速加入</h2>
                    <form >
                       <p>{{newRule.uid}}</p>
                       <label>规则集</label>
                       <select v-model="rulesetIndex[0]">
                         <option :value="index"  v-for="(item,index) in userFilterRulesRaw" v-if="item.link=='local'">{{item.name}}</option>
                       </select>
                       <label>标记等级（推荐值为1~5，越接近1越需要屏蔽。当规则集过滤等级高于标记等级则执行过滤。）</label>
                       <input v-model.lazy="newRule.level" type="number" />
                    </form>
                    <button @click="saveRules">保存并关闭</button>
                    <button @click="close">关闭</button>
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
                                alert('无法添加，因为该用户已存在。#', f + 1);
                                console.error('[BFT][设置]无法添加，因为该用户已存在。#', f + 1);
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
                            console.info('[BFT][设置]成功添加规则。');
                            alert('成功添加规则。');
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
    // 关于页面 模态对话框
    function bftAboutDialog() {
        if (document.getElementById('bft-dialog') === null) {

            let dialogHtml = `
              <style>
              /* 模态弹窗样式 */
              .bft-modal {
                position: fixed;
                z-index: 1002;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0, 0, 0, 0.5);
                border-radius: 5px;
              }
              
              .bft-modal-content {
                background-color: #fefefe;
                padding: 46px;
                border: 1px solid #888;
                width: 80%;
                border-radius: 10px;
                margin-top: 30%;
                max-width: 550px;
                margin: 200px auto;
              }
          
              .bft-button{
                  padding: 8px 16px;
                  background-color: #007bff;
                  color: #fff;
                  border: none;
                  border-radius: 3px;
                  cursor: pointer;
                  margin-top: 10px;
              }
          
              .bft-button:hover {
                  background-color: #0056b3;
              }
              .bft-button:active {
                  background-color: #00377d;
                }

                /* 文本排版样式 */

                h1 {
                    font-size: 1.8em;
                    text-align: center;
                    margin-top: 0;
                  }


                h2 {
                    font-size: 1.5em;
                  margin-top: 0;
                }
                
                p, ul {
                    font-size: 0.9em;
                  margin-top: 10px;
                  margin-bottom: 10px;
                }
                
                ul {
                  padding-left: 20px;
                }
                
                li {
                  margin-bottom: 5px;
                }
                
                a {
                  color: #337ab7;
                  text-decoration: none;
                  display:block
                }
                
                a:hover {
                  text-decoration: underline;
                }

            </style>
            <!-- 模态弹窗内容 -->
            <div id="myModal" class="bft-modal">
              <div class="bft-modal-content">
                <h1>关于 BiliFilter 3</h1>
                <p>这是一个可以过滤掉不顺眼的东西的小脚本。对于某些人，我真想说“去你妈的，傻逼！”</p>
                
                <h2>贡献者</h2>
                <ul>
                  <li>Cheek Lost</li>
                  <li>隔壁萝莉控</li>
                </ul>
                          
                <h2>外部链接</h2>
                <a href="https://github.com/ChizhaoEngine/BFT/wiki">使用文档</a>
                <a href="https://github.com/ChizhaoEngine/BFT/">开源地址</a>
                <a href="https://github.com/ChizhaoEngine/BFT/issues">问题报告</a>

                <p><small> © 署名-非商业性使用-禁止演绎 4.0 国际 (CC BY-NC-ND 4.0) </small></p>
              </div>
            </div>
            `;
            let dialogElement = document.createElement('div');
            dialogElement.id = 'bft-dialog';
            dialogElement.innerHTML = dialogHtml;
            document.body.appendChild(dialogElement);
            // 获取模态弹窗元素
            var modal = document.getElementById("myModal");
            // 点击模态弹窗以外的区域时关闭模态弹窗
            window.addEventListener("click", function (event) {
                if (event.target == modal) {
                    document.getElementById('bft-dialog').remove();
                }
            });

        }
    }
    // -----
    // 其他
    // -----
    // 自动更新:内容过滤
    function autoUpdateTextRulesets() {
        // 读取规则集
        let textFilterRulesRaw = GM_getValue("textFilterRules", []);
        textFilterRulesRaw.forEach(function (resource) {
            if (resource.type === "remote" && (Math.floor(Date.now() / 3600000) - resource.lastUpdate / 3600) >= GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).autoUpdate && GM_getValue("setting", { filterInterval: 1, autoUpdate: 6, enableFastAddUserFilterRules: true }).autoUpdate != 0) {
                console.log(`[BFT][设置]规则集：${resource.name} 正在准备更新`);
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
                console.log(`[BFT][设置]规则集：${resource.name} 正在准备更新`);
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
    // 我什么时候才能找到对象
    // Your code here...
})();