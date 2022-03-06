# Audio

![](/html/label/audio/banner.jpg)

## 概述

&emsp;&emsp;;[audio](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio) 用于在文档中嵌入音频元素。

&emsp;&emsp;;`audio`元素是`HTML5`新增的行内标签，`IE8`及以下浏览器不支持`audio`标签。

&emsp;&emsp;若浏览器不支持`video`元素或者无法播放音频，则会显示替代文本（开始和结束标签之间的内容）。

```javascript
<audio src="music.mp3">当前浏览器不支持audio标签</audio>
```

## 标签属性

- `autoplay`：音频会尽快自动播放，不会等待整个音频下载完成
- `controls`：浏览器提供包括声音、播放进度、播放暂停的控制面板（不同浏览器不一致），用户可以控制音频播放
- `loop`：循环播放音频
- `muted`：是否静音，默认值为`false`，表示有声音
- `preload`：预加载，包括`auto`、`metadata`和`none`三个参数值，`auto`表示加载音频，`metadata`表示不加载音频，但是需要获取音频元数据（如音频长度），`none`表示不加载音频。若指定为空字符串，则等效于`auto`。注意`autoplay`属性优先级高于`preload`，若`autoplay`被指定，则会忽略此属性，浏览器将加载音频以供播放
- `src`：嵌入的音频`URL`

## 设置多个音频资源

&emsp;&emsp;不同浏览器支持的音频播放格式有所不同，一般为了兼容效果，会放置多种音频格式，浏览器会自上而下选择符合的音频格式。

```javascript
<audio controls>
  <source src="music.ogg" type="audio/ogg" />
  <source src="music.mp3" type="audio/mpeg" />
  <source src="music.wav" type="audio/Wav" />
  当前浏览器不支持audio标签
</audio>
```

## 元素属性

### 只读

- `duration`：双进度浮点数，音频的播放时长，以秒为单位。若音频不可用或者音频未加载，则返回`NaN`
- `paused`：若音频被暂停或者未开始播放，则返回`true`
- `ended`：音频是否播放完毕，播放完毕则返回`true`
- `error`：发生错误情况下的`MediaError`对象
- `currentSrc`：返回正在播放或加载的音频的`URL`地址，对应于浏览器在`source`元素中选择的文件
- `seeking`：用户是否在音频中移动或者跳跃到新的播放点

```javascript
<audio preload="auto" src="music.mp3" onseeking="fn()" controls />
<script>
  var audio = document.querySelector('audio')

  function fn() {
    console.log(audio.seeking)
  }
</script>
```

### 可读写

- `autoplay`：设置音频自动播放，或者查询音频是否设置`autoplay`
- `loop`：设置或者查询音频是否循环播放
- `currentTime`：返回音频当前的播放时间点，双精度浮点数，单位为秒。音频未播放，可用于设置音频开始播放的时间点。音频播放过程中，可用于设置音频播放时间点
- `controls`：显示或隐藏音频控制面板，或者查询控制面板是否可见
- `volume`：返回音量值，介于`0-1`之间的双进度浮点数，或者设置音量值
- `muted`：设置或者查询是否静音
- `playbackRate`：设置或者查询音频的播放速度，`1`表示正常速度，大于`1`表示快进，`0-1`之间表示慢进，`0`表示暂停（控制面板仍然是播放，仅仅是速度为`0`）

### 特殊属性

#### played

&emsp;&emsp;表示用户已经播放的音频范围，返回 [TimeRanges](https://developer.mozilla.org/zh-CN/docs/Web/API/TimeRanges) 对象，其中`TimeRanges`对象包括一个`length`属性和`start()`、`end()`两个方法。

- `length`：获取音频范围的数量，未开始播放为`0`，开始播放后至少为`1`
- `start(index)`：获取某个音频范围的开始位置
- `end(index)`：获取某个音频范围的结束位置

&emsp;&emsp;若用户在音频中移动或者跳跃播放点，则会获得多个音频范围。

&emsp;&emsp;如下为一段音频，用户跳跃了播放点两次，因此`played.length`为`3`，其中三段音频范围分别为开始播放、第一个跳跃点、第二个跳跃点的播放范围。

![](/html/label/audio/played.gif)

&emsp;&emsp;上述部分代码如下。

```javascript
<audio src="music.mp3" controls></audio>
<button id="btn">console.log</button>

<script>
  var btn = document.querySelector('#btn')
  var audio = document.querySelector('audio')

  btn.addEventListener('click', () => {
    const length = audio.played.length
    console.log(`length: ${length}`)

    for (var i = 0; i < length; i++) {
      var start = audio.played.start(i)
      var end = audio.played.end(i)

      console.log(`index: ${i}, start: ${start}, end: ${end}, durations: ${end - start}s`)
    }
  })
</script>
```

#### buffered

&emsp;&emsp;表示浏览器已经缓存的音频范围，返回`TimeRanges`对象，若音频已完全加载则`buffered.length`为`1`，`buffered.start(0)`为`0`，`buffered.end(0)`为音频时长，[详细参考](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/buffered)。

#### seekable

&emsp;&emsp;表示用户可跳转或移动的音频范围，返回`TimeRanges`对象，若音频已完全加载则`seekable.length`为`1`，`seekable.start(0)`为`0`，`seekable.end(0)`为音频时长。音频未加载或者加载错误，则`seakable.length`为`0`，对应的`start(0)`和`end(0)`也就不存在，[详细参考](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/seekable)。

#### networkState

&emsp;&emsp;获取音频的网络范围，[详细参考](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/networkState)。

- `0`：`NETWORK_EMPTY`，音频尚未初始化
- `1`：`NETWORK_IDLE`，浏览器已选择好采用什么编码格式来播放媒体，但尚未建立网络连接
- `2`：`NETWORK_LOADING`，浏览器正在加载
- `3`：`NETWORK_NO_SOURCE`，未找到音频资源

#### error

&emsp;&emsp;通常正常加载音频，则返回`null`，若加载过程中发生错误，浏览器将会返回`MediaError`对象。`MediaError`对象包括`code`和`message`属性，`message`为错误描述信息，`code`为如下错误码。

- `1`：`MEDIA_ERR_ABORTED`，音频加载加载过程中由于用户操作而被终止
- `2`：`MEDIA_ERR_NETWORK`，确认音频资源可用，但是加载时出现网路错误，音频加载被终止
- `3`：`MEDIA_ERR_DECODE`，确认音频资源可用，但是解码发生错误
- `4`：`MEDIA_ERR_SRC_NOT_SUPPORTED`，音频格式不被支持或者资源不可用

## 方法

### play

&emsp;&emsp;播放音频，返回`Promise`，播放成功时为`resolved`，因为任何原因播放失败为`rejected`，[详细参考](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/play)。

```javascript
var audio = document.querySelector('audio')

audio
  .play()
  .then(() => { })
  .catch(() => { })
```

### pause

&emsp;&emsp;暂停音频，无返回值，[详细参考](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/pause)。

```javascript
var audio = document.querySelector('audio')

audio.pause()
```

### load

&emsp;&emsp;重新加载`src`指定的资源，[详细参考](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/load)。

```javascript
var audio = document.querySelector('audio')

audio.src = 'music.mp3'
audio.load()
```

## 事件

### 常用事件

- [loadstart](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/loadstart_event)：开始载入音频时触发
- [durationchange](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/durationchange_event)：`duration`属性更新时触发
- [loadedmetadata](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event)：音频元数据加载完成时触发
- [loadeddata](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/loadeddata_event)：音频的第一帧加载完成时触发，此时整个音频还未加载完
- [progress](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/progress_event)：音频正在加载时触发
- [canplay](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/canplay_event)：浏览器能够开始播放音频时触发
- [canplaythrough](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/canplaythrough_event)：浏览器预计在不停下来进行缓冲的情况下，能够持续播放指定的音频时会触发

### 其他事件

- [abort](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/abort_event)：音频终止时触发，非错误导致
- [emptied](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/emptied_event)：音频加载后又被清空，如加载后又调用 load 重新加载
- [ended](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended_event)：播放结束，若设置`loop`属性，音频播放结束后不会触发
- [error](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/error_event)：发生错误
- [play](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/play_event)：播放事件，第一次播放、暂停后播放会触发
- [playing](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/playing_event)：播放事件，第一次播放、暂停后播放、播放结束后循环播放会触发
- [pause](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/pause_event)：暂停事件
- [ratechange](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ratechange_event)：播放速率改变
- [seeking](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ratechange_event)：播放点改变开始
- [seeked](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ratechange_event)：播放点改变结束
- [stalled](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/stalled_event)：浏览器尝试获取音频，但是音频不可用时触发
- [suspend](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/suspend_event)：音频加载暂停时触发
- [timeupdate](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event)：音频`currentTime`改变时触发
- [volumechange](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volumechange_event)：音量改变时触发，包括静音
- [waiting](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/waiting_event)：开始播放前缓冲下一帧时触发

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~