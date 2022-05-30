# JavaScript 中常见的排序类型

![](/js/sort/banner.jpg)

## 前言

&emsp;&emsp;此文浅总结了常见的几大排序，并介绍了相关特性和优化方式。对稳定性、复杂度的含义和分析也做了简单说明，另外对于递归函数中，分析时间复杂度的`master`公式也做了阐述，希望对你有用。

## 排序

### 冒泡排序

&emsp;&emsp;冒泡排序（`Bubble Sort`）非常形象，数组在每次循环时，从左至右，相邻元素两两比较，将最大的元素逐渐交换到最后，每一轮循环最大元素在视觉上像是冒泡一样上浮到数组末尾。

![](/js/sort/bubble.gif)

&emsp;&emsp;以数组`[4, 3, 2, 1]`为例子，数组前一个元素与后一个元素比较，若前一个元素大则交换，一轮下来最大值被交换至末尾。数量上共计`3`（`4 - 1`）轮，第一轮将`4`放在末尾，第二轮将`3`放在末尾，第三轮将`2`放在末尾。

```javascript
for (var i = 0; i < 3; i++) {
  if (arr[i] > arr[i + 1]) {
    swap(arr, i, i + 1)
  }
} 
// [3, 2, 1, 4]

for (var i = 0; i < 2; i++) {
  if (arr[i] > arr[i + 1]) {
    swap(arr, i, i + 1)
  }
}
// [2, 1, 3, 4]

for (var i = 0; i < 1; i++) {
  if (arr[i] > arr[i + 1]) {
    swap(arr, i, i + 1)
  }
}
// [1, 2, 3, 4]
```

&emsp;&emsp;;`swap`用于交换数组两个元素。

```javascript
function swap(arr, i, j) {
  var temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}

// ES6
function swap(arr, i, j) {
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
```

&emsp;&emsp;可以发现，每轮的比较次数都会少一次，原因在于每一轮结束后就会正确排列出一个数，下一轮则不用再比较。例如第一轮结束数组为`[3, 2, 1, 4]`，下一轮时`4`就不用比较了。

&emsp;&emsp;封装为以下函数，其中外层循环用于控制轮数，内层循环用于比较交换。

```javascript
function bubbleSort(arr) {
  for (var i = 0; i < arr.length - 1; i++) {
    for (var j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1)
      }
    }
  }
}
```

#### 优化

&emsp;&emsp;以数组`[1, 2, 3, 4]`为例子，第一轮所有元素都没有发生交换，说明数组的顺序已经达到要求，可以跳出不用继续循环了。

```javascript
function bubbleSort(arr) {
  for (var i = 0, isChange; i < arr.length - 1; i++) {
    isChange = false

    for (var j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1)

        isChange = true
      }
    }

    if (!isChange) return
  }
}
```

#### 特性

&emsp;&emsp;最优情况下，数组已经是升序，例如`[1, 2, 3, 4]`，比较次数为`3`次。对于长度为`n`的升序数组，比较次数则为`n - 1`，所以时间复杂度为`O(n)`。

&emsp;&emsp;最坏情况下，数组是降序，例如`[4, 3, 2, 1]`，比较次数为`3 + 2 + 1 = 6`次。对于长度为`n`的降序数组，比较次数则为`(n - 1) + (n - 2) + ... + 2 + 1`，即`n * (n - 1) / 2`次，所以时间复杂度为<code>O(n<sup>2</sup>)</code>。

&emsp;&emsp;一般讨论的时间复杂度均是最坏情况下的时间复杂度，保证算法的运行时长不会比最差情况更长，因此冒泡排序的时间复杂度为<code>O(n<sup>2</sup>)</code>。另外冒泡排序的空间复杂度为常数级，即`O(1)`。

&emsp;&emsp;冒泡排序也属于原地排序，即未占用额外空间，并且在原数组上发生的交换。

&emsp;&emsp;冒泡排序也属于稳定排序。

&emsp;&emsp;何为稳定性呢？即排序后相同值元素的原始顺序不改变。

&emsp;&emsp;举个例子，若数组为`[3, 2, 3', 1]`，注意`3`和`3'`相等都是数值`3`，此处用于区分两者说明问题。冒泡排序结束后，数组为`[1, 2, 3, 3']`。排序前`3`位于`3'`前面，排序后`3`同样也是位于`3'`前面，此特性就是稳定性。

### 选择排序

&emsp;&emsp;选择排序（`Selection Sort`）也非常形象，实际上是在冒泡排序思路上的进一步优化。思考一下，冒泡排序过程中，为了将最大元素冒泡到数组末尾，两两元素交换是否有必要。结果当然是不必要，每一轮比较过程中，仅记录最大元素的索引值即可，一轮在结束时再去将最大元素交换到末尾即可。每一轮循环在视觉上相当于选择出最大元素，然后交换至末尾。

![](/js/sort/selection.gif)

&emsp;&emsp;以数组`[3, 4, 2, 1]`为例子，默认最大元素索引值为`0`，数组从索引`1`元素开始遍历，当元素值大于最大元素，则最大元素索引值更新为当前索引值。共计`3`（`4 - 1`）轮，第一轮选择出`4`，第二轮选择出`3`，第三轮选择出`2`。

```javascript
var maxIndex = 0
for (var i = 1; i < 4; i++) {
  if (arr[i] > arr[maxIndex]) {
    maxIndex = i
  }
}
swap(arr, maxIndex, 3)
// [3, 1, 2, 4]

var maxIndex = 0
for (var i = 1; i < 3; i++) {
  if (arr[i] > arr[maxIndex]) {
    maxIndex = i
  }
}
swap(arr, maxIndex, 2)
// [2, 1, 3, 4]

var maxIndex = 0
for (var i = 1; i < 2; i++) {
  if (arr[i] > arr[maxIndex]) {
    maxIndex = i
  }
}
swap(arr, maxIndex, 1)
// [1, 2, 3, 4]
```

&emsp;&emsp;也能发现，每轮比较次数都会少一次，原因也是每一轮都会正确排列出一个元素，下一轮不用再比较。另外每一轮循环结束，还要将最大元素交换至末尾。

&emsp;&emsp;封装为以下函数，外层循环控制轮数，内存循环用于比较更新最大索引。

```javascript
function selectionSort(arr) {
  for (var i = 0, maxIndex; i < arr.length - 1; i++) {
    maxIndex = 0

    for (var j = 1; j < arr.length - i; j++) {
      if (arr[j] > arr[maxIndex]) {
        maxIndex = j
      }
    }

    swap(arr, maxIndex, j - 1)
  }
}
```

#### 特性

&emsp;&emsp;选择排序的时间复杂度为<code>O(n<sup>2</sup>)</code>，虽然与冒泡排序的时间复杂度一致，但是元素的交换次数很少，最多交换`n - 1`次，而冒泡排序则远不止，因此性能上选择排序优于冒泡排序。空间复杂度上选择排序为`O(1)`。

&emsp;&emsp;选择排序也属于原地排序，但是选择排序不稳定。

&emsp;&emsp;为什么呢？

&emsp;&emsp;还是以`[3, 2, 3', 1]`数组为例子，第一轮开始`maxIndex`为`0`，遍历过程中`maxIndex`未发生改变，结束时数组为`[1, 2, 3', 3]`。明显发现，排序前`3`位于`3'`前面，排序后`3`却位于`3'`后面，因此选择排序是不稳定的。

### 插入排序

&emsp;&emsp;插入排序（`Insertion Sort`）也非常形象，思路上相对复杂一点，但是也很好理解。取出数组的一个元素，依次与前面元素比较，若前面元素较大，则将前面元素后移，否则插入放回。视觉上确实是将元素值插入到数组前面。

![](/js/sort/insertion.gif)

&emsp;&emsp;以数组`[4, 3, 2, 1]`为例子，取出元素`3`，与前面的元素依次比较，`4`大于`3`，将`4`后移动一位至索引`1`位置，而`3`则插入到索引`0`处。共计`3`轮，第一轮插入`3`，第二轮插入`2`，第三轮插入`1`。

```javascript
var current = arr[1]
var i = 0
while (i > -1 && arr[i] > current) {
  arr[i + 1] = arr[i]
  i--
}
arr[i + 1] = current
// [3, 4, 2, 1]

var current = arr[2]
var i = 1
while (i > -1 && arr[i] > current) {
  arr[i + 1] = arr[i]
  i--
}
arr[i + 1] = current
// [2, 3, 4, 1]

var current = arr[3]
var i = 2
while (i > -1 && arr[i] > current) {
  arr[i + 1] = arr[i]
  i--
}
arr[i + 1] = current
// [1, 2, 3, 4]
```

&emsp;&emsp;封装为以下函数，其中外层循环控制轮数并取出元素，内层循环用于比较并右移元素。

```javascript
function insertionSort(arr) {
  for (var j, current, i = 1; i < arr.length; i++) {
    current = arr[i]
    j = i - 1

    while (j > -1 && arr[j] > current) {
      arr[j + 1] = arr[j]
      j--
    }

    arr[j + 1] = current
  }
}
```

#### 特性

&emsp;&emsp;最优情况下，数组已经是升序，例如`[1, 2, 3, 4]`，比较次数为`3`次。对于长度为`n`的升序数组，比较次数为`n - 1`，所以时间复杂度为`O(n)`。

&emsp;&emsp;最坏情况下，数组是降序，例如`[4, 3, 2, 1]`，比较次数为`1 + 2 + 3 = 6`次。对于长度为`n`的降序数组，比较次数则为`1 + 2 + ... + (n - 2) + (n - 1)`，即`n * (n - 1) / 2`次，所以时间复杂度为<code>O(n<sup>2</sup>)</code>。另外插入排序的空间复杂度为常数级`O(1)`。

&emsp;&emsp;插入排序也属于原地排序和稳定排序。

### 归并排序

&emsp;&emsp;归并排序（`Merge Sort`）即递归与合并，是分而治之思想的典型例子，先递归将原数组二分拆为多个单数组，然后以合并两个有序数组为核心，持续合并为有序数组。

![](/js/sort/merge.gif)

&emsp;&emsp;以数组`[8, 7, 2, 1, 6, 5, 4, 3]`为例子，将数组从中部持续拆分下去，拆分为`8`个单数组（例如`[8]`或`[7]`等等）结束，单数组必然是有序的。然后考虑两个有序数组合并的问题，并持续合并成有序的数组。

![](/js/sort/merge.png)

&emsp;&emsp;封装为以下函数，其中`mergeSort`用于递归拆分数组为单数组，`merge`用于合并两个有序的数组。

```javascript
function mergeSort(arr) {
  var len = arr.length

  if (len < 2) return arr

  var middleIndex = Math.floor(len / 2)
  var left = arr.slice(0, middleIndex)
  var right = arr.slice(middleIndex)

  return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
  var result = []

  while (left.length && right.length) {
    if (left[0] <= right[0]) {
      result.push(left.shift())
    } else {
      result.push(right.shift())
    }
  }

  if (left.length) {
    result.push(...left)
  }

  if (right.length) {
    result.push(...right)
  }

  return result
}
```

#### master 主定理

&emsp;&emsp;递归非常常见，编写出的代码也相当简洁。但是相对于循环程序，递归的时间复杂度却难以估计，`master`公式就是用于估计递归程序的时间复杂度的。

<LaTeX>T(n)=aT(\frac{n}{b})+O(n^d)</LaTeX>

&emsp;&emsp;以下为各变量的含义，**注意子问题的规模大小要相同**。

 - `n`：问题的规模大小
 - `a`：原问题拆分出的子问题个数
 - `n / b`：每个子问题的规模大小，
 - <code>O(n<sup>d</sup>)</code>：除了递归之外，剩余的程序的时间复杂度

&emsp;&emsp;其中常量`a`、`b`和`d`存在三种关系。

 - <code>log<sub>b</sub>a > d</code>：时间复杂度为<code>O(n<sup>log<sub>b</sub>a</sup>)</code>
 - <code>log<sub>b</sub>a = d</code>：时间复杂度为<code>O(n<sup>d</sup>logn)</code>
 - <code>log<sub>b</sub>a < d</code>：时间复杂度为<code>O(n<sup>d</sup>)</code>

> 提供一个简单的记忆方式，等于关系记为<code>O(n<sup>d</sup>logn)</code>。而大小于关系，<code>log<sub>b</sub>a</code>和`d`两者谁大，`n`的指数就是谁

&emsp;&emsp;以获取数组最大值为实例，来分析下各种情况的时间复杂度。

```javascript
function getMax(arr) {
  var len = arr.length

  if (len < 2) return arr[0]

  var middleIndex = Math.floor(len / 2)
  var left = arr.slice(0, middleIndex)
  var right = arr.slice(middleIndex)

  return Math.max(getMax(left), getMax(right))
}
```

&emsp;&emsp;若数组长度为`n`，执行`getMax`函数时，会将数组从中间拆分为两个数组。问题即转换为求两个长度为`n / 2`的数组的最大值。因此数组`n`求最大值所消耗的时间可以表示为`T(n) = T(n / 2) + T(n / 2) + f(n)`，其中`f(n)`表示除了递归之外的程序花费的时间，`f(n)`可以计为<code>O(n<sup>d</sup>)</code>。

&emsp;&emsp;例如`getMax`中求出左右数组的最大值之后，还要对左右的最大值再求一次最大值，此次花费的时间即为`f(n)`。

##### 大于

&emsp;&emsp;;`getMax`消耗的时间为<code>T(n) = 2T(n / 2) + O(n<sup>d</sup>)</code>，对照`master`公式明显发现，常数`a = 2`且`b = 2`。

&emsp;&emsp;除了递归之外，还要额外执行一次`Math.max`函数，用于求左右最大值的最大值，其时间复杂度为`O(1)`。很好理解，因为只执行了一次，所以为常数级`O(1)`，故常数`d = 0`。

&emsp;&emsp;现在`a = 2`，`b = 2`和`d = 0`恰好满足<code>log<sub>b</sub>a > d</code>，因此`getMax`的时间复杂度为<code>O(n<sup>log<sub>b</sub>a</sup>) = O(n)</code>。实际上求最大值，一个`for`循环的时间复杂度也是`O(n)`，故此时递归和循环是一样的。

##### 等于

&emsp;&emsp;稍微修改下`getMax`。

```javascript
function getMax(arr) {
  var len = arr.length

  if (len < 2) return arr[0]

  var middleIndex = Math.floor(len / 2)
  var left = arr.slice(0, middleIndex)
  var right = arr.slice(middleIndex)

  for (var i = 0; i < len; i++) { 
    ...
  }

  return Math.max(getMax(left), getMax(right))
}
```

&emsp;&emsp;根据刚才的分析，`a`和`b`都为`2`。但是额外增加了一个`for`循环，`f(n)`额外时间则为执行`for`循环和`Math.max`所花费的时间。很明显`for`循环的时间复杂度为`O(n)`，因此`d = 1`。

&emsp;&emsp;现在`a = 2`，`b = 2`和`d = 1`恰好满足<code>log<sub>b</sub>a = d</code>，因此`getMax`的时间复杂度为<code>O(n<sup>d</sup>logn) = O(nlogn)</code>。

##### 小于

&emsp;&emsp;现在来思考一个问题，若`getMax`函数拆分的数组不是从中间，而是从其它位置呢。比如`left`为数组的前`2 / 3`部分，`right`为数组的后`2 / 3`部分，虽然说两数组会有重叠部分，但是两数组或者说两子问题的规模是一致的吧，都是`2n / 3`的规模。

&emsp;&emsp;因此`getMax`消耗的时间为<code>T(n) = 2T(2n / 3) + O(n<sup>d</sup>)</code>，故`a = 2`，`b = 3 / 2`。若`getMax`内部`for`循环还嵌套了`for`循环，时间复杂度为<code>O(n<sup>2</sup>)</code>，则`d = 2`。

&emsp;&emsp;现在`a = 2`，`b = 3 / 2`和`d = 2`恰好满足<code>log<sub>b</sub>a < d</code>，因此`getMax`的时间复杂度为<code>O(n<sup>d</sup>) = O(n<sup>2</sup>)</code>。

#### 特性

##### 时间复杂度

&emsp;&emsp;归并排序内部为递归算法，子问题的规模为`n / 2`且子问题规模一致，`master`公式为<code>T(n) = 2T(n / 2) + O(n<sup>d</sup>)</code>，因此`a = 2`，`b = 2`。除了递归之外，额外的程序即`merge`合并函数，由于其内部为`while`循环，`merge`函数的时间复杂度为`O(n)`，故`d = 1`。

&emsp;&emsp;;`a = 2`，`b = 2`，`d = 1`，符合<code>log<sub>b</sub>a = d</code>条件，时间复杂度为<code>O(n<sup>d</sup>logn) = O(nlogn)</code>。

##### 空间复杂度

&emsp;&emsp;注意归并排序的空间复杂度为`O(n)`，而不是`O(nlogn)`。

&emsp;&emsp;虽然在合并过程中会开辟<code>log<sub>2</sub>n</code>个长度为`n`的数组，总占用的空间为<code>nlog<sub>2</sub>n</code>。但是在排序过程中，始终只有一个`merge`合并函数执行，而之前的`merge`函数在执行后会将占用的空间释放。

&emsp;&emsp;以长度为`8`的数组为例，将开辟`3`（<code>log<sub>2</sub>8</code>）个长度为`8`的数组，总占用空间为<code>8 * log<sub>2</sub>8 = 8 * 3</code>，`merge`函数占用的空间长度依次为`2, 2, 2, 2, 4, 4, 8`。最后一次合并时，`merge`函数占用的空间才会达到最大长度`8`，而之前合并占用的空间都已经被释放。

![](/js/sort/log28.png)

&emsp;&emsp;为了进一步说明，我们来改动一下`merge`函数，将临时数组`result`作为全局变量。若`mergeSort`排序的数组长度为`n`，则临时数组`result`最大长度将达到`n`。

```javascript
var result = []

function mergeSort(arr) {
  ...
}

function merge(left, right) {
  result = []

  while (left.length && right.length) {
    ...
  }

  if (left.length) {
    ...
  }

  if (right.length) {
    ...
  }

  return result
}
```

&emsp;&emsp;因此若数组长度为`n`，占用的最大临时空间则为`n`，故空间复杂度为`O(n)`。

##### 稳定性

&emsp;&emsp;以`[3, 3', 2, 1]`为例子，将拆分为`[3]`和`[3']`两个数组，合并阶段由于`3`等于`3'`，则临时数组先`push`推入`3`，然后继续推入`3'`，排序前后`3`均位于`3'`前面，因此归并排序是稳定的。

> 注意条件`left[0] <= right[0]`，若条件仅为`left[0] < right[0]`，则会造成排序不稳定

&emsp;&emsp;另外归并排序是非原地排序，因为占用了额外空间，也未在原数组上排序。

### 快速排序

&emsp;&emsp;快速排序（`Quick Sort`）也非常形象，即排序性能上非常快，另外快速排序也是分而治之思想的典型例子。核心原理是规定基准值（`pivot`），然后根据基准值将数组一分为三，包括小于基准值的部分、基准值、大于基准值的部分。

![](/js/sort/quick.gif)

&emsp;&emsp;以数组`[4, 5, 2, 1, 3]`为例来说明分区原理，将数组末尾的元素作为基准值，然后遍历数组，若元素小于或者等于基准值，则将其交换至数组头部。另外注意当遍历到数组末尾处元素时，必然会等于基准值，发生交换，换句话说基准值也会被交换到头部。

![](/js/sort/pivot.png)

&emsp;&emsp;封装为以下函数，其中`quickSort`对基准值分成的左右部分进行递归排序，`partition`用于将数组分区。

```javascript
function quickSort(arr, start = 0, end = arr.length - 1) {
  if (start >= end) return

  var pivotIndex = partition(arr, start, end)
  quickSort(arr, start, pivotIndex - 1)
  quickSort(arr, pivotIndex + 1, end)
}

function partition(arr, start, end) {
  for (var i = start, j = start, pivot = arr[end]; i <= end; i++) {
    if (arr[i] <= pivot) {
      swap(arr, i, j++)
    }
  }

  return j - 1
}
```

&emsp;&emsp;数组`[7, 4, 5, 2, 8, 1, 3, 6]`的排序过程，搭配动图参考效果更加。

![](/js/sort/quick.png)

#### 特性

##### 时间复杂度

&emsp;&emsp;最优情况下，每次递归选取的基准值，刚好将数组分为长度相同的两个区间。对规模为`n`的数组排序，即转换为对两个规模为`n / 2`的数组排序，符合`master`主定理条件，时间复杂度为`T(n)  = 2T(n / 2) + O(n)`。容易知道，`a = 2`，`b = 2`和`d = 1`，因此最优情况下的时间复杂度为<code>O(n<sup>d</sup>logn) = O(nlogn)</code>。

&emsp;&emsp;最坏情况下，数组是升序，例如`[1, 2, 3, 4]`，比较次数为`4 + 3 + 2 = 9`次。对于长度为`n`的升序数组，比较次数则为`n + (n - 1) + ... + 3 + 2`，即`(n + 2) * (n - 1) / 2`次（算法代码存在差异，比较次数也会有所差异，注意区分），所以最坏情况下的时间复杂度为<code>O(n<sup>2</sup>)</code>。

&emsp;&emsp;快速排序的平均时间复杂度为`O(nlogn)`，对分析过程感兴趣的可以参考文末，此处不作过多说明。

##### 空间复杂度

&emsp;&emsp;空间复杂度参考两条原则，数组长度和递归深度，其中包括。

 - 若为数组，数组长度则为空间复杂度。例如一维数组长度为`n`，空间复杂度为`O(n)`。二维数组长度为`n * n`，空间复杂度为<code>O(n<sup>2</sup>)</code>，多维以此类推
 - 若为递归，递归深度则为空间复杂度的最大值。例如递归深度为`n`，空间复杂度为`O(n)`
 - 若递归和数组两者都有，则空间复杂度为两者中较大值

&emsp;&emsp;快速排序虽然为原地排序，没有占用额外的数组，空间复杂度为`O(1)`。

&emsp;&emsp;但是注意存在递归，最优情况下递归深度为<code>log<sub>2</sub>n</code>，最差情况下递归深度为`n`，故快速排序空间复杂度范围为`O(logn)`到`O(n)`。

##### 稳定性

&emsp;&emsp;快速排序是不稳定的，以`[3, 1, 3', 2]`数组为例子，分区后数组为`[1, 2, 3', 3]`，很明显快速排序是不稳定的。

#### 非原地排序版

&emsp;&emsp;此版本与归并排序非常类似，但是更加符合快速排序的原理，即数组一分为三个区间。

```javascript
function quickSort(arr) {
  var len = arr.length

  if (len < 2) return arr

  var pivot = arr[len - 1]
  var left = arr.filter((v, i) => v <= pivot && i !== len - 1)
  var right = arr.filter(v => v > pivot)

  return quickSort(left).concat(pivot, quickSort(right))
}
```

&emsp;&emsp;最优情况下，数组规模`n`转换为两个`n / 2`规模的数组，`T(n)  = 2T(n / 2) + O(n)`，`filter`时间复杂度为`O(n)`，多个也是`O(n)`，根据`master`主定理，时间复杂度为`O(nlogn)`。

&emsp;&emsp;最差情况下，即升序，例如`[1, 2, 3, 4]`，比较次数为`4 + 3 + 2`。长度为`n`的数组，比较次数为`n + (n - 1) + ... + 3 + 2`，即`(n + 2) * (n - 1) / 2`，时间复杂度为<code>O(n<sup>2</sup>)</code>。

&emsp;&emsp;空间复杂度与归并一致，均为`O(n)`，仅最后一次`concat`拼接时，占用的空间才会达到最大长度`n`，之前占用的空间都已经被释放，另外此排序是稳定的。

### 计数排序

&emsp;&emsp;计数排序（`Count Sort`）也非常形象，是非比较排序，原理是开辟一个新数组，然后遍历原数组，将数据值转换为新数组的键，键上的值记录数据值出现的次数。

![](/js/sort/count.gif)

&emsp;&emsp;封装为以下函数，注意新数组中可能存在很多的`empty`空位，`for`循环不会跳过空位。

&emsp;&emsp;;`counts`为计数数组，例如数组`[0, 1, 3, 1]`，生成的计数数组`counts`为`[1, 2, empty, 1]`，表示数值`0`有`1`个，数值`1`有两个，数值`3`有`1`个。

```javascript
function countSort(arr) {
  var value, counts = [], result = []

  for (var i = 0; i < arr.length; i++) {
    value = arr[i]

    counts[value] = counts[value] || 0
    counts[value]++
  }

  for (var j = 0; j < counts.length; j++) {
    while (counts[j] > 0) {
      result.push(j)
      counts[j]--
    }
  }

  return result
}
```

&emsp;&emsp;以上`countSort`函数无法排序负数，引入`min`最小值偏移量。

```javascript
function countSort(arr) {
  var value, counts = [], result = []
  const min = Math.min(...arr)

  for (var i = 0; i < arr.length; i++) {
    value = arr[i] - min

    counts[value] = counts[value] || 0
    counts[value]++
  }

  for (var j = 0; j < counts.length; j++) {
    while (counts[j] > 0) {
      result.push(j + min)
      counts[j]--
    }
  }

  return result
}
```

#### 特性

&emsp;&emsp;以上计数排序的循环次数为`n + n + n + k`次，其中获取最小值循环`n`次，生成计数数组循环`n`次，`while`循环恰好为`count`总数，也就是原数组长度`n`，`k`为计数数组长度，故时间复杂度为`O(n + k)`。

&emsp;&emsp;空间复杂度为`O(n + k)`，`k`为计数数组`counts`的长度，`n`为结果数组`result`的长度。

&emsp;&emsp;另外以上计数排序不是原地排序，并且不稳定。

#### 稳定版

&emsp;&emsp;在计数数组之上，衍生出了累加数组，何为累加数组呢？即累加数组中的元素都是计数数组对应元素与之前元素之和。

&emsp;&emsp;比如计数数组`[1, 2, 3]`，生成的累加数组为`[1, 3, 6]`。累加数组的第三个元素`6`就是计数数组的第三个元素`3`与之前元素`1`和`2`相加的和。

```javascript
var counts = [1, 2, 3], adds = []

for (var i = 0; i < counts.length; i++) {
  counts[i] = counts[i] || 0

  for (var sum = 0, j = i; j > -1; j--) {
    sum += counts[j]
  }

  adds[i] = sum
}

adds // [1, 3, 6]
```

&emsp;&emsp;若累加数组就用`counts`表示呢？

```javascript
var counts = [1, 2, 3]

for (var i = 1; i < counts.length; i++) {
  counts[i] = counts[i] || 0
  counts[i] += counts[i - 1]
}

counts // [1, 3, 6]
```

&emsp;&emsp;数组`[2, 1, 2, 0, 2, 1]`，计数数组为`[1, 2, 3]`，累加数组为`[1, 3, 6]`，排序结果`result`为`[0, 1, 1, 2, 2, 2]`。

&emsp;&emsp;现在思考下累加数组的作用呢？

&emsp;&emsp;以累加数组第一个元素`1`（索引`0`）为例，表明了数值`0`一定位于结果数组`result`的`0`（`1 - 0`）索引处。若有相同数值，例如第二个元素`3`（索引`1`），表明数值`1`最后的位置一定位于`result`的`2`（`3 - 1`）的索引处。

&emsp;&emsp;很明显发现，累加数组就是保存了数值在结果数组中的位置信息，相同数值则保存的是最后出现的位置。

&emsp;&emsp;封装为以下函数，注意生成`result`时，是倒序循环的原数组，保证了稳定性。

```javascript
function countSort(arr) {
  var counts = [], result = []

  for (var value, i = 0; i < arr.length; i++) {
    value = arr[i]

    counts[value] = counts[value] || 0
    counts[value]++
  }

  for (var j = 1; j < counts.length; j++) {
    counts[j] = counts[j] || 0
    counts[j] += counts[j - 1] || 0
  }

  for (var value, index, k = arr.length - 1; k > -1; k--) {
    value = arr[k]

    index = counts[value] - 1
    result[index] = arr[k]
    counts[value]--
  }

  return result
}
```

&emsp;&emsp;数组`[0, 1, 3, 1]`的排序过程，其中累加数组为`[1, 3, 3, 4]`。

![](/js/sort/count.png)

&emsp;&emsp;引入`min`偏移量可排序负数。

```javascript
function countSort(arr) {
  var counts = [], result = []
  const min = Math.min(...arr)

  for (var value, i = 0; i < arr.length; i++) {
    value = arr[i] - min

    counts[value] = counts[value] || 0
    counts[value]++
  }

  for (var j = 1; j < counts.length; j++) {
    counts[j] = counts[j] || 0
    counts[j] += counts[j - 1] || 0
  }

  for (var value, index, k = arr.length - 1; k > -1; k--) {
    value = arr[k] - min

    index = counts[value] - 1
    result[index] = arr[k]
    counts[value]--
  }

  return result
}
```

&emsp;&emsp;稳定版计数排序的循环次数为`n + n + k + n`，因此时间复杂度为`O(n + k)`，空间复杂度为`O(n + k)`，非原地排序。

&emsp;&emsp;计数排序的缺点也很明显。

 - 无法排序非整数，局限性很高
 - 适用于数据范围较小的数组，数据范围较大时耗费内存
 - 数据量大的时候可能存在排序效率不如比较排序的情况

### 基数排序

&emsp;&emsp;基数排序（`Radix Sort`）也非常形象，运用了桶的概念，桶的数量由基数决定的。例如十进制数的基数为`10`，则桶的数量为`10`个，保存位数在`0 ~ 9`之间的数。

&emsp;&emsp;数组中的最值决定排序次数，每次排序获取数值的位数，放入对应的桶中，然后循环桶将数值取出。由于桶是有序的，取出的数在位数上则也是有序的，并且排序是由低位开始，故排序结束数组将是有序的。

![](/js/sort/radix.gif)

&emsp;&emsp;以数组`[1, 61, 865, 65, 5]`为例子，最大值为`865`，则排序`3`轮，分别为个位十位百位。

![](/js/sort/radix.png)

&emsp;&emsp;封装为以下函数。

```javascript
function radixSort(arr) {
  var n = 1, buckets = [], len = arr.length, max = Math.max(...arr)

  do {
    for (var i = 0; i < len; i++) {
      const value = arr[i]
      const digit = Math.floor(value / n) % 10

      buckets[digit] = buckets[digit] || []
      buckets[digit].unshift(value)
    }

    for (var j = 0, k = 0; j < 10; j++) {
      buckets[j] = buckets[j] || []

      while (buckets[j].length) {
        arr[k] = buckets[j].pop()
        k++
      }
    }

    n *= 10
  } while ((max = Math.floor(max / 10)))
}
```

&emsp;&emsp;其中`digit`表示取出数字的固定位，以`865`为例。

```javascript
// 个位
Math.floor(865 / 1) % 10   // 5

// 十位
Math.floor(865 / 10) % 10  // 6

// 百位
Math.floor(865 / 100) % 10 // 8 
```

#### 特性

&emsp;&emsp;以上基数排序的循环次数为`n + k * 2n`，其中获取最大值循环`n`次，`do ... while`循环`k`次，`k`由最大值决定。`2n`为`n + n`，`do ... while`循环体中，数字放入桶中循环`n`次，从桶中取出循环`n`次（`while`总的循环次数恰好为原数组长度`n`），故时间复杂度为`o(kn)`。

&emsp;&emsp;空间复杂度为`O(n + k)`，其中`n`为原数组长度，`k`为桶的数量或者基数。

&emsp;&emsp;由于占用了额外的空间，基数排序为非原地排序，但是为稳定排序。

#### 负数版

&emsp;&emsp;以上基数排序的排序范围非常小，只能排序`0`和正数，引入偏移量可排序负数。

```javascript
function radixSort(arr) {
  var buckets = [], len = arr.length, n = 1, min = Infinity, max = -Infinity
  
  for (var i = 0; i < len; i++) {
    if (arr[i] > max) max = arr[i]
    if (arr[i] < min) min = arr[i]
  }

  max -= min

  do {
    for (var i = 0; i < len; i++) {
      const value = arr[i] - min
      const digit = Math.floor(value / n) % 10

      buckets[digit] = buckets[digit] || []
      buckets[digit].unshift(value)
    }

    for (var j = 0, k = 0; j < 10; j++) {
      buckets[j] = buckets[j] || []

      while (buckets[j].length) {
        arr[k] = buckets[j].pop() + min
        k++
      }
    }

    n *= 10
  } while ((max = Math.floor(max / 10)))
}
```

&emsp;&emsp;负数版的时间空间复杂度与之前的基数排序一致，注意负数版由于存在数值与`min`加减运算的情况，是不稳定的。

&emsp;&emsp;例如数组`[1, 3, new Number(1)]`，之前版本将排序为`[1, Number, 3]`，而负数版则为`[1, 1, 3]`，排序的元素由`new Number(1)`变成了`1`，去探讨稳定性没有多大意义。你也可以理解为扩大了排序范围，但是丢失了稳定性，毕竟元素都改变了。

### 桶排序

&emsp;&emsp;桶排序（`Bucket Sort / Bin Sort`）即将待排序元素放入对应的桶，桶间有序，桶内无序，然后局部排序桶内元素即可。其中计数排序和基数排序就属于一类比较特殊的桶排序。

&emsp;&emsp;严格来说，桶排序不是一种排序方式，因为独立的桶内部还是依赖于常见的排序，更多的是一种数组预处理的过程，或者说是一种优化方式，符合分而治之的思想，对于处理大批量的数据将会非常有用。

![](/js/sort/bucket.gif)

&emsp;&emsp;封装为以下函数，其中桶的数量为`count`，由最值和桶内的数据个数`size`决定。合理的`size`将决定桶内数据的排序方式，插入排序在数据量不大的时候就比较合适。当`size`为`1`时，桶排序与计数排序将高度相似。

```javascript
function bucketSort(arr, size = 6) {
  var buckets = [], count = 0, n = 0, len = arr.length, min = Infinity, max = -Infinity
    
  for (var i = 0; i < len; i++) {
    if (arr[i] > max) max = arr[i]
    if (arr[i] < min) min = arr[i]
  }

  count = Math.floor((max - min) / size) + 1

  for (var i = 0; i < count; i++) {
    buckets[i] = []
  }

  for (var i = 0; i < len; i++) {
    var index = Math.floor((arr[i] - min) / size)

    buckets[index].push(arr[i])
  }

  for (var i = 0; i < buckets.length; i++) {
    var item = buckets[i]

	insertionSort(item)

    for (var j = 0; j < item.length; j++) {
      arr[n] = item[j]
      n++
    }
  }
}
```

&emsp;&emsp;以数据量为`100000`的数组为例，桶排序与插入排序的效率对比。

```javascript
var first = [], second = []

for (var i = 0; i < 100000; i++) {
  var value = (Math.random() > 0.5 ? 1 : -1) * Math.floor(100000 * Math.random())

  first.push(value)
  second.push(value)
}

...

console.time('bucketSort')
bucketSort(first)
console.timeEnd('bucketSort')

console.time('insertionSort')
insertionSort(second)
console.timeEnd('insertionSort')

// bucketSort: 11.285888671875 ms
// insertionSort: 1559.23193359375 ms
```

#### 特性

##### 时间复杂度

&emsp;&emsp;桶排序的时间复杂度分为三个部分，包括。

 - 获取最值，根据最值和桶内元素的个数创建桶，元素分配到桶中
 - 所有的桶独立排序
 - 桶元素依次取出，完成排序

&emsp;&emsp;第一步为`O(n + k + n)`，其中获取最值循环`n`次，创建桶循环`k`次，`k`为桶的个数，元素分配到桶中循环`n`次。第三步循环`k`个桶，将`n`个元素取出，即`O(n + k)`。

&emsp;&emsp;第二步选择的排序方式不同，时间复杂度也会不同。例如插入排序，时间复杂度为`O(n)`到<code>O(n<sup>2</sup>)</code>之间，`k`个规模为`m`（`n / k`）的数组时间复杂度为`O(km)`到<code>O(km<sup>2</sup>)</code>之间，代入`m = n / k`则为`O(n)`到<code>O(n<sup>2</sup> / k)</code>范围。

&emsp;&emsp;合并的时间复杂度为`O(n + k)`到<code>O(n<sup>2</sup>)</code>。

##### 空间复杂度

&emsp;&emsp;空间复杂度，桶排序的稳定性都由内部的排序决定。例如内部为插入排序，则桶排序的空间复杂度为`O(n + k)`，`n`为桶内数组的长度之和，也就是原数组的长度，`k`为桶的数量。插入排序为稳定排序，因此以上桶排序也是稳定的。

&emsp;&emsp;另外由于占用了额外空间，桶排序则不是原地排序。

&emsp;&emsp;桶排序的缺点也很明显。

 - 占用空间，桶的数量越多，空间复杂度就越高，相对的时间复杂度就越低。当桶的数量与数组个数相等时，将退化成计数排序
 - 数据要相当紧凑，太分散会创建很多空的桶

### 堆排序

&emsp;&emsp;堆排序（`Heap Sort`）也非常形象，主要原理是运用堆的性质，依次取出数组中的最大值。

#### 大顶堆

&emsp;&emsp;堆排序中提到的堆是一种叫做完全二叉树的数据结构，包括大顶堆和小顶堆。

![](/js/sort/maxHeap.png)

&emsp;&emsp;以大顶堆为例，它的根节点一定是最大值，且每个节点都大于或者等于左右子节点的值。

&emsp;&emsp;若当前节点的索引为`i`，则左子节点为`i * 2 + 1`，右子节点为`i * 2 + 2`，父节点为`Math.floor((i - 1) / 2)`。

&emsp;&emsp;注意观察，最后一个叶子节点的父节点，一定是最后一个非叶子节点。最后一个非叶子节点之前的节点，也全部都是非叶子节点。

&emsp;&emsp;数组长度为`n`，最后一个叶子节点为`n - 1`。`n - 1`代入`Math.floor((i - 1) / 2)`则有`Math.floor((n - 1 - 1) / 2)`，化简即最后一个非叶子节点为`Math.floor(n / 2) - 1`。

#### 堆化

&emsp;&emsp;那么如何将一个无序序列构建成大顶堆呢？

&emsp;&emsp;根据大顶堆的性质，非叶子节点均大于等于左右子节点。因此先要找到所有的非叶子节点，然后交换当前节点和左右子节点，形成父节点大于子节点的结构。

![](/js/sort/heapify.png)

&emsp;&emsp;又如何找到所有的非叶子节点呢？

&emsp;&emsp;刚才已经知道，最后一个非叶子节点之前的所有节点都是非叶子节点，且最后一个非叶子节点的索引为`Math.floor(n / 2) - 1`，故索引在`0`到`Math.floor(n / 2) - 1`之间都是非叶子节点。

&emsp;&emsp;以数组`[6, 5, 1, 7, 8, 4]`为例，`Math.floor(6 / 2) - 1 = 2`，故索引为`0 1 2`的节点都是非叶子节点。

![](/js/sort/leaf.png)

&emsp;&emsp;思考一个问题，是自顶向下从`0`开始循环到`2`，还是自底向上从`2`开始循环到`0`呢？

&emsp;&emsp;假设当前节点位于二叉树第`i`层，如果是自顶向下，在与第`i + 1`层的子节点发生交换后，第`i`层并不能保证小于第`i - 1`层，还要向上回溯第`i - 1`层。

&emsp;&emsp;如果是自底向上，在与第`i + 1`层交换后，事实上也不能保证第`i`层小于第`i - 1`层。但是注意，由于是自底向上，循环了第`i`层后，紧接着会继续循环`i - 1`层，而此时就保证了第`i`层小于第`i - 1`层。

&emsp;&emsp;还是以数组`[6, 5, 1, 7, 8, 4]`为例，两种情况的过程为。

```javascript
// 自顶向下
     6             6             8             8             8
   /   \         /   \         /   \         /   \         /   \
  5     1  -->  8     1  -->  6     1  -->  7     1  -->  7     4
 / \   /       / \   /       / \   /       / \   /       / \   /
7   8 4       7   5 4       7   5 4       6   5 4       6   5 1

// 自底向上
     6             6             6             8             8
   /   \         /   \         /   \         /   \         /   \
  5     1  -->  5     4  -->  8     4  -->  6     4  -->  7     4
 / \   /       / \   /       / \   /       / \   /       / \   /
7   8 4       7   8 1       7   5 1       7   5 1       6   5 1
```

&emsp;&emsp;自底向上的动态过程。

![](/js/sort/maxHeap.gif)

&emsp;&emsp;构建大顶堆过程封装为`buildMaxHeap`函数。

```javascript
function buildMaxHeap(arr) {
  for (var i = Math.floor(arr.length / 2) - 1; i > -1; i--) {
    heapify(arr, i)
  }
}

function heapify(arr, i) {
  var n = arr.length,
    max = i,
    left = i * 2 + 1,
    right = i * 2 + 2

  if (left < n && arr[left] > arr[max]) {
    max = left
  }

  if (right < n && arr[right] > arr[max]) {
    max = right
  }

  if (max !== i) {
    swap(arr, i, max)
    heapify(arr, max, n)
  }
}

var arr = [6, 5, 1, 7, 8, 4]
buildMaxHeap(arr)
console.log(arr) // [8, 7, 4, 6, 5, 1]
```

#### 排序

&emsp;&emsp;构建出大顶堆，排序过程就非常简单了。

&emsp;&emsp;大顶堆的根节点为最大值，将根节点与末尾节点交换，取出最大值，然后对剩下的节点持续构建成大顶堆。

&emsp;&emsp;注意取出最大值后，二叉树除了根节点不符合当前节点大于等于子节点的性质之外，剩下的所有节点都符合。因此仅仅对根节点执行堆化即可。

![](/js/sort/heapify.gif)

&emsp;&emsp;封装为以下函数。

```javascript
function heapSort(arr) {
  var len = arr.length

  buildMaxHeap(arr, len)

  for (var j = len - 1; j > 0; j--) {
    swap(arr, 0, j)
    heapify(arr, 0, j)
  }
}

function buildMaxHeap(arr, len) {
  for (var i = Math.floor(len / 2) - 1; i > -1; i--) {
    heapify(arr, i)
  }
}

function heapify(arr, i, n = arr.length) {
  var max = i,
    left = i * 2 + 1,
    right = i * 2 + 2

  if (left < n && arr[left] > arr[max]) {
    max = left
  }

  if (right < n && arr[right] > arr[max]) {
    max = right
  }

  if (max !== i) {
    swap(arr, i, max)
    heapify(arr, max, n)
  }
}
```

#### 特性

&emsp;&emsp;堆排序的时间复杂度为`O(nlogn)`，空间复杂度为`O(1)`，没有占用额外的空间，即也是原地排序。

&emsp;&emsp;以数组`[2, 1, 2']`为例子，排序后为`[1, 2', 2]`，因此堆排序是不稳定的。

## 参考

 - [排序可视化](https://visualgo.net/zh/sorting)
 - [快速排序的时间复杂度分析](https://zhuanlan.zhihu.com/p/341201904)
 - [阮一峰快速排序](http://www.ruanyifeng.com/blog/2011/04/quicksort_in_javascript.html)
 - [如何看待文章《面试官：阮一峰版的快速排序完全是错的》？](https://www.zhihu.com/question/276746146/answer/392700912)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~