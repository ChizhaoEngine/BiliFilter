# BF 🔪🐂🐎
一个可以过滤BiliBili上不顺眼的东西的`油猴脚本`，支持按用户/标题/甚至是视频时长过滤内容。

## 🐮🍺 介绍

通过规则集之类的进行屏蔽的脚本，其特性可总结为3点。

屏蔽：
- 屏蔽首页、分区页的视频（暂时除了纪录片、电视剧、电影、综艺、国创、番剧分区）
- 屏蔽视频播放页的视频推荐和评论
- 屏蔽搜索页的搜索结果（暂时不支持根据用户屏蔽）
- 屏蔽专栏页的评论

规则集：
- 按功能分为用户规则集和标题评论规则集：
    - 用户规则集：支持对用户发出的视频、评论进行屏蔽
    - 标题评论规则集：支持使用正则
- 按类型分为本地规则集和远程规则集：
    - 本地规则集：仅保存在本地的规则集，支持编辑、导入、导出规则集中的条目的操作
    - 远程规则集：从云端获取的规则集，支持更新、转为本地规则集的操作

其他过滤：
- 时长过滤：屏蔽低于设定时长的视频

![截图](https://github.com/ChizhaoEngine/BiliFilter/assets/114285377/91863e39-d82a-47e0-9444-2a659bd66b75)

![图片](https://github.com/ChizhaoEngine/BiliFilter/assets/114285377/f073a615-f217-4e25-9fe6-43ee49788c8b)



## ♿🚩 使用

### 准备

1. 首先请检查以下要求，确保您是可以使用这个脚本的。
    - 使用哔哩哔哩网页版（新版页面，即右下角那个三个点里面有`退出内测`和`返回旧版`两个按钮的页面），但并非手机版网页（即一般在手机上使用，域名是https://m.bilibili.com的网页）
    - 想屏蔽掉视频、评论、专栏，而不是页面中的广告（本脚本可过滤不了广告）
    - 会使用搜索引擎，去了解自己不知道的名词
2. 检查您使用的浏览器，确保满足以下条件，如果没有，请安装一个满足条件的。以下是本人`推荐`的各个操作系统所适用的浏览器及最低的浏览器版本。
    - Mac OS、Ipad OS: Safari(10.3+)
    - Windows、Linux: Chrome(55+)、Edge(15+)、Firefox(52+)
    - Android:[X浏览器](https://www.xbext.com/index.html)、[KiwiBroser](https://kiwibrowser.com/)
3. 为您的浏览器安装可以运行油猴脚本的插件
    - Safari：[Stay2](https://apps.apple.com/cn/app/id1591620171)
    - Chrome&Edge:[篡改猴](https://microsoftedge.microsoft.com/addons/detail/%E7%AF%A1%E6%94%B9%E7%8C%B4/iikmkjmpaadaobahmlepeloendndfphd?hl=zh-CN)
    - Firefox:[Tampermonkey](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)
    - X浏览器：不需要，该软件已经内置相关工具。
    - KiwiBrowser:[篡改猴](https://microsoftedge.microsoft.com/addons/detail/%E7%AF%A1%E6%94%B9%E7%8C%B4/

### 安装脚本
    

或者说，支持javascript ES8特性的浏览器内核，并且拥有支持运行油猴脚本的浏览器插件即可。

不推荐手机用户使用该脚本，除非你能忍受将网页调为电脑版（桌面版）页面后的样式（字比较小）。

该脚本依赖Tampermonkey浏览器插件。您需要安装Tampermonkey浏览器插件。[知乎上的教程](https://zhuanlan.zhihu.com/p/128453110)

注意本脚本暂时不支持Greasemonkey（或许以后也不会支持）！另外关于IOS与MAC的使用请参照[这个](https://github.com/XIU2/UserScript/issues/107)，或者是使用[Stay](https://apps.apple.com/cn/app/stay-2-%E6%9C%AC%E5%9C%B0%E8%84%9A%E6%9C%AC%E7%AE%A1%E7%90%86%E5%99%A8/id1591620171)。不支持IOS的userscripts！

安装浏览器插件Tampermonkey后，使用该[链接](https://github.com/ChizhaoEngine/BFT/raw/main/bft.user.js)安装脚本。重载页面后，在右键菜单中的油猴脚本菜单即可找到相关设置。或者在任务栏的插件菜单中也可找到设置按钮。

## 🕷️🐍 兼容性

与其他的油猴脚本待测试，如有兼容性问题请直接提issue。

若使用先前的远古版本，直接升级即可。

## 🍆🍑 API的使用

仅获取b站黑名单会使用API。本脚本尽可能不使用API。

## 🕊️📄 计划

- [ ] 支持屏蔽所有分区页
- [ ] 支持对用户空间动态的屏蔽
- [ ] 支持屏蔽用户私信
- [ ] 支持根据用户屏蔽搜索页内容
- [ ] 支持屏蔽专栏
- [ ] 适配旧页面
- [ ] 优化代码逻辑

更多建议或需求欢迎在issue提。
