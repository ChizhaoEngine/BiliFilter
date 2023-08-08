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
