# ES6 集合

![](/js/collection/banner.jpg)

## 前言

&emsp;&emsp;此文介绍了`ES6`中集合相关的`Set`和`Map`结构，跟随此文你将了解到。

 - `ES6`为什么引入`Set`结构
 - 强弱引用与垃圾回收
 - `WeakMap`之`polyfill`实现
 - `WeakMap`的应用场景

## Set

&emsp;&emsp;;[Set](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set) 是值的集合，类似数组，元素有序且唯一。

### 属性方法

 - [Set.prototype.size](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set/size) 用于返回`Set`实例中的元素个数

```javascript
var set = new Set([1, 2])

set.size // 2
```

 - [Set.prototype.add](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set/add) 用于向`Set`实例末尾添加元素，并返回实例

&emsp;&emsp;注意重复的元素不会被添加进去，也就说明了`Set`内元素是唯一的。

```javascript
var set = new Set([1, 2])

set.add(3).add(3) // Set(3) {1, 2, 3}
set.add(NaN).add(NaN) // Set(4) {1, 2, 3, NaN}
set.add(-0).add(+0) // Set(5) {1, 2, 3, NaN, 0}
```

> `Set`类内部两个`NaN`是相等的，并且也是 [零值相等](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness#%E9%9B%B6%E5%80%BC%E7%9B%B8%E7%AD%89) 的，即`+0`等于`-0`

 - [Set.prototype.delete](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set/delete) 用于删除指定的元素。删除成功返回`true`，否则为`false`

```javascript
var set = new Set([1, 2])

set.delete(2) // true
set // Set(1) {1}
```

 - [Set.prototype.has](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set/has) 用于查询指定元素是否在`Set`实例中

```javascript
var set = new Set([1, 2])

set.has(1) // true
```

 - [Set.prototype.clear](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set/clear) 用于清空`Set`实例中的元素

```javascript
var set = new Set([1, 2])

set.clear() // Set(0) {size: 0}
```

 - [Set.prototype.forEach(callback)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach) 根据元素的插入顺序，依次执行回调函数

&emsp;&emsp;注意`Set`结构没有键名，只有键值。也可以说键和值相同。

```javascript
var set = new Set(['foo', 'bar'])

set.forEach((value, key) => {
  console.log(key, value)
  // foo foo
  // bar bar
})
```

 - [Set.prototype.values](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set/values) 返回元素值的遍历器对象，可用`for...of`遍历。而 [Set.prototype.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/keys) 内部则是调用的`Set.prototype.values`

```javascript
var set = new Set(['foo', 'bar'])

for (var key of set.keys()) {
  console.log(key)
  // foo
  // bar
}

for (var value of set.values()) {
  console.log(value)
  // foo
  // bar
}
```

&emsp;&emsp;注意`for...of`使用的`[Symbol.iterator]()`遍历器函数，本质上调用的是`values`方法。

```javascript
Set.prototype[Symbol.iterator] === Set.prototype.values // true
```

 - [Set.prototype.entries](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set/entries) 用于返回元素键值对的遍历器对象

```javascript
var set = new Set(['foo', 'bar'])

for (var item of set.entries()) {
  console.log(item)
  // ['foo', 'foo']
  // ['bar', 'bar']
}
```

### 用例

#### 并集

&emsp;&emsp;并集即两个集合的元素合并。

```javascript
var x = new Set([1, 2]), y = new Set([2, 3])

function union(setX, setY) {
  return new Set([...setX, ...setY])
}

union(x, y) // Set(3) {1, 2, 3}
```

#### 交集

&emsp;&emsp;交集即两集合中相同的元素。

```javascript
var x = new Set([1, 2]), y = new Set([2, 3])

function intersection(setX, setY) {
  return new Set([...setX].filter(el => setY.has(el)))
}

intersection(x, y) // Set(1) {2}
```

#### 差集

&emsp;&emsp;差集即在当前集合，但是不在另一集合的元素，具有相对性。

```javascript
var x = new Set([1, 2]), y = new Set([2, 3])

function difference(setX, setY) {
  return new Set([...setX].filter(el => !setY.has(el)))
}

// x 相对于 y 的差集
difference(x, y) // Set(1) {1}
```

#### 对称差集

&emsp;&emsp;对称差集即两集合中均不在交集中的元素。

```javascript
var x = new Set([1, 2]), y = new Set([2, 3])

function symmetricDifference(setX, setY) {
  return new Set([...difference(setX, setY), ...difference(setY, setX)])
}

symmetricDifference(x, y) // Set(2) {1, 3}
```

#### 子集

&emsp;&emsp;子集即当前集合中的元素是否都在另一集合中。

```javascript
var x = new Set([1, 2]), y = new Set([1, 2, 3])

function isSubset(subset, set) {
  return [...subset].every(el => set.has(el))
}

// x 是 y 的子集
isSubset(x, y) // true
```

#### 超集

&emsp;&emsp;超集与子集说法相反。

```javascript
var x = new Set([1, 2]), y = new Set([1, 2, 3])

function isSuperset(superset, set) {
  return [...set].every(el => superset.has(el))
}

// y 是 x 的超集
isSuperset(y, x) // true
```

#### 去重

&emsp;&emsp;双层循环，优点是原理简单，兼容性好。

&emsp;&emsp;内部循环可替换为`indexOf`、`includes`等，外层循环可替换为`reduce`等。

```javascript
function unique(array) {
  var result = []

  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < result.length; j++) {
      if (array[i] === result[j]) break
    }

    if (j === result.length) {
      result.push(array[i])
    }
  }

  return result
}

unique([1, 1, 3, '3', NaN, NaN, +0, -0, {}, {}]) // [1, 3, '3', NaN, NaN, 0, {}, {}]
```

&emsp;&emsp;;`filters / indexOf`方式。

&emsp;&emsp;注意数组中若有多个相同元素，`indexOf`只返回首个元素的索引。

```javascript
function unique(array) {
  return array.filter(function (el, index) {
    return array.indexOf(el) === index
  })
}

unique([1, 1, 3, '3', NaN, NaN, +0, -0, {}, {}]) // [1, 3, '3', 0, {}, {}]
```

&emsp;&emsp;;`Set`方式。

```javascript
// or Array.from(new Set(array))
const unique = array => [...new Set(array)]

function unique(array) {
  const set = new Set()
  return array.filter(el => !set.has(el) && set.add(el))
}

unique([1, 1, 3, '3', NaN, NaN, +0, -0, {}, {}]) // [1, 3, '3', NaN, 0, {}, {}]
```

&emsp;&emsp;;`lodash`中 [uniq](https://github.com/lodash/lodash/blob/master/uniq.js) 去重函数核心为 [baseUniq](https://github.com/lodash/lodash/blob/master/.internal/baseUniq.js)。

&emsp;&emsp;数组长度大于等于`200`时，会创建`Set`用来去重。长度小于`200`时，主要运用双层循环的原理去重，为了保证统一性，`NaN`和零值也考虑了在内。

```javascript
_.uniq([1, 1, 3, '3', NaN, NaN, +0, -0, {}, {}]) // [1, 3, '3', NaN, 0, {}, {}]
```

### 意义

&emsp;&emsp;思考下`ES6`引入`Set`结构有何用意?

&emsp;&emsp;;`Set`类的部分实现如下，仅为简易版，能说明问题就行。

```javascript
class Set {
  constructor() {
    this.values = []
  }

  add(value) {
    if (!this.has(value)) {
      this.values.push(value)
    }

    return this
  }

  has(value) {
    return this.values.includes(value)
  }
}
```

&emsp;&emsp;可以发现，结合`Array`并加以修饰，是可以封装出来`Set`结构的。

&emsp;&emsp;但是性能上会存在很大的问题。

#### 唯一性

&emsp;&emsp;以判断实例上是否有指定元素为例，即`has`方法。

&emsp;&emsp;简易版本只能通过`includes`、`indexOf`或者`forEach`等来判断，实际此类方法在底层都是用`for`循环实现的，因此时间复杂度为`O(n)`。

&emsp;&emsp;原生`Set`类则并非如此，在添加元素时，元素在内存中的存储位置是根据哈希函数计算得出的。而在查找元素时，依据哈希函数，将会立马得出元素的存储位置，因此时间复杂度为`O(1)`。换句话说，原生`Set`类中元素的内存地址，是算出来的，而不是找出来的。

> 例如哈希表（一段连续的内存）长度为`5`，若存入的元素`el`哈希值为`12`，哈希函数计算`12 % 5 = 2`，所以`el`元素就保存在哈希表的第`2`块内存上

&emsp;&emsp;对于相同值，计算出来的内存地址必然是相同的，也就决定了`Set`元素`唯一性`的特征。

#### 有序性

&emsp;&emsp;数组根据索引号查找元素，速度快且效率高。但是根据元素查找索引（进一步查找位置），就没有捷径可言了，只能遍历数组，逐一对比，优化一下可以排序后二分查找。而哈希表则不用遍历，仅计算就能找到元素对应的位置，所以哈希表不用索引，也不产出索引。也即是`Set`类没有`get(index)`索引访问的原因，实例方法`delete(el)`、`has(el)`等也都是针对元素的。

&emsp;&emsp;由于内存地址是算出来的，那元素就肯定不是依次排列在内存中了，即不连续分布，那怎么保证`有序性`呢？非常简单，元素额外维护几个指针，形成一条插入链即可。

![](/js/collection/chain.png)

&emsp;&emsp;遍历实例打印`null` `{}` `A` `10`。

#### 哈希冲突

&emsp;&emsp;哈希函数选取合理的话，哈希表中的元素分布也会非常均匀。但是注意，对于两个毫无关系的值，哈希函数完全有可能计算出相同的地址，形成常说的哈希冲突。解决方式有很多，比较常用的是拉链法（也叫开链法），即在同一内存地址上拓展。

![](/js/collection/hash.png)

&emsp;&emsp;而`ES6`对`Set`的设计也体现了对哈希冲突的担忧。即`Set`实例的长度为`size`，而非`length`。

&emsp;&emsp;数组的`length`就是数组保存的元素个数，那么哈希表的`length`也是哈希表保存的元素个数？

&emsp;&emsp;不一定，因为哈希冲突的原因，哈希表的元素个数可能会大于哈希表的长度。

## Map

&emsp;&emsp;;[Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map) 是键值对的集合，类似对象，元素也是有序且唯一。

&emsp;&emsp;;`js`中`Object`仅支持字符串和`Symbol`作为键，而`Map`则可以用任意类型作为键，相对于`Object`来说是一种更为完善的哈希结构，还有一些关于`Object`和`Map`的对比，可参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map#objects_%E5%92%8C_maps_%E7%9A%84%E6%AF%94%E8%BE%83)。

### 属性方法

 - [Map.prototype.size](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/size) 用于返回`Map`实例的键值对元素个数

```javascript
var map = new Map([[1, 11], [2, 22]])

map.size // 2
```

 - [Map.prototype.set(key, value)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/set)：添加或修改键值对元素，并返回`Map`实例

```javascript
var map = new Map([[1, 11], [2, 22]])

map.set(1, 111).set(3, 33) // Map(3) {1 => 111, 2 => 22, 3 => 33}
```

> 相较于对象，`Map`可以将任何类型作为键

 - [Map.prototype.delete(key)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/delete) 用于删除指定的元素。删除成功返回`true`，否则为`false`

```javascript
var map = new Map([[1, 11], [2, 22]])

map.delete(1) // true
map // Map(1) {2 => 22}
```

 - [Map.prototype.get(key)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/get) 获取键对应的键值，不存在则返回`undefined`

```javascript
var map = new Map([[1, 11], [2, 22]])

map.get(1) // 11
```

 - [Map.prototype.has(key)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/has) 用于查询元素是否在`Map`实例中

```javascript
var map = new Map([[1, 11], [2, 22]])

map.has(2) // true
```

 - [Map.prototype.clear](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/clear) 用于清空`Map`实例中的元素

```javascript
var map = new Map([[1, 11], [2, 22]])

map.clear() // Map(0) {size: 0}
```

 - [Map.prototype.forEach(callback)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach) 根据元素的插入顺序，依次执行回调函数

```javascript
var map = new Map([['foo', 1], ['bar', 2]])

map.forEach((value, key) => {
  console.log(key, value)
  // foo 1
  // bar 2
})
```

 - [Map.prototype.keys](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/keys) 返回元素键`key`的遍历器对象，可用`for...of`遍历

```javascript
var map = new Map([['foo', 1], ['bar', 2]])

for (var key of map.keys()) {
  console.log(key)
  // foo
  // bar
}
```

 - [Map.prototype.values](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/values) 返回元素键值`value`的遍历器对象

```javascript
var map = new Map([['foo', 1], ['bar', 2]])

for (var value of map.values()) {
  console.log(value)
  // 1
  // 2
}
```

 - [Map.prototype.entries](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map/entries) 返回元素键值对的遍历器对象

```javascript
var map = new Map([['foo', 1], ['bar', 2]])

for (var item of map.entries()) {
  console.log(item)
  // ['foo', 1]
  // ['bar', 2]
}
```

&emsp;&emsp;注意`for...of`调用的`[Symbol.iterator]()`遍历器函数，本质上调用的是`entries`方法。

```javascript
Map.prototype[Symbol.iterator] === Map.prototype.entries // true
```

### 用例

&emsp;&emsp;;`Map`转对象。

```javascript
var map = new Map([
  [Symbol(), 1],
  [{}, 2],
])

Object.fromEntries(map)
// {
//   [object Object]: 2,
//   Symbol(): 1,
// }
```

&emsp;&emsp;对象转`Map`。

```javascript
var object = { key: 1 }

new Map(Object.entries(object)) // Map(1) {'key' => 1}
```

&emsp;&emsp;;`Map`转`JSON`。

```javascript
const replacer = (key, value) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: [...value.entries()],
    }
  }

  return value
}

const object = {
  id: 1,
  map: new Map([
    ['id', 1],
    ['value', 'foo'],
  ]),
}
const stringify = JSON.stringify(object, replacer)
// {"id":1,"map":{"dataType":"Map","value":[["id",1],["value","foo"]]}}
```

&emsp;&emsp;;`JSON`转`Map`。

```javascript
const reviver = (key, value) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value)
    }
  }
  return value
}

JSON.parse(stringify, reviver)
// {id: 1, map: Map(2)}
```

## WeakSet

&emsp;&emsp;;[WeakSet](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) 与`Set`结构类似，有两点区别。

&emsp;&emsp;;`WeakSet`元素只能为对象。

```javascript
var ws = new WeakSet()

ws.add({}) // WeakSet {{…}}
ws.add(null) // Uncaught TypeError: Invalid value used in weak set at WeakSet.add
```

&emsp;&emsp;;`WeakSet`对元素持弱引用，即垃圾回收机制会忽略对元素的引用。

### 方法

 - [WeakSet.prototype.add](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/add) 用于向实例添加元素

```javascript
var ws = new WeakSet()

ws.add({ value: 1 })
ws // WeakSet {{…}}
```

 - [WeakSet.prototype.delete](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/delete) 用于删除指定元素。

```javascript
var object = { value: 1 }
var ws = new WeakSet([object])

ws.delete(object) // true
ws // WeakSet {}
```

 - [WeakSet.prototype.has](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/has) 用于查询指定元素是否在`WeakSet`实例中

```javascript
var object = { value: 1 }
var ws = new WeakSet([object])

ws.has(object) // true
```

## WeakMap

&emsp;&emsp;;[WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) 也与`Map`类似，元素也只能为对象，另外`WeakMap`对键持弱引用。

```javascript
var ws = new WeakMap()

ws.set({}, 1) // WeakMap {{…} => 1}
ws.set(null, 2) // Uncaught TypeError: Invalid value used as weak map key at WeakMap.set
```

### 方法

 - [WeakMap.prototype.set(key, value)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/set) 添加或修改键值对元素，并返回`Map`实例

```javascript
var object = { value: 1 }
var ws = new WeakMap([[object, 1]])

ws.set({}, 2).set(object, 11) // WeakMap {{…} => 2, {…} => 11}
```

 - [WeakMap.prototype.get(key)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/get) 获取键对应的键值，不存在则返回`undefined`

```javascript
var object = { value: 1 }
var ws = new WeakMap([[object, 1]])

ws.get(object) // 1
```

 - [WeakMap.prototype.has(key)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/has) 用于查询元素是否在`weakMap`实例中

```javascript
var object = { value: 1 }
var ws = new WeakMap([[object, 1]])

ws.has(object) // true
```

 - [WeakMap.prototype.delete(key)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/delete) 用于删除指定的元素。删除成功返回`true`，否则为`false`

```javascript
var object = { value: 1 }
var ws = new WeakMap([[object, 1]])

ws.delete(object)
ws // WeakMap {}
```

### 意义

#### 引用

&emsp;&emsp;什么是强弱引用呢？

&emsp;&emsp;创建一个`JavaScript`对象，都将建立一个变量和对象的强引用。

```javascript
var object = new Object()
```

&emsp;&emsp;只有手动运行`object = null`，对象才有可能会被垃圾回收清除掉。

![](/js/collection/next.png)

> 变量`object`与对象`new Object()`建立了强引用，`object`指向空，对象`new Object()`无任何引用，即不可达

&emsp;&emsp;然而若创建一个弱引用对象，`object`可能随时都会被清除。

```javascript
var object = new WeakObject()
```

&emsp;&emsp;;`Map`类型也是类似，运行`map.add(key, value)`，将建立`map`对`key`的强引用。严格一点来说，建立的是`map`对`key`所指向的对象的强引用。

![](/js/collection/map.png)

&emsp;&emsp;但是注意，单纯运行`key = null`并不能让`key`指向的原对象被回收，原因在于`map`还对原对象持有引用。

![](/js/collection/map-active.png)

&emsp;&emsp;因此对象`new Array()`并不会被回收。

```javascript
var map = new Map()
var key = new Array(10 * 1024 * 1024)

map.set(key, 1)
key = null
```

#### 垃圾回收（GC）

&emsp;&emsp;我们可以在`node`环境中证明此问题。

&emsp;&emsp;创建`index.js`文件，`global.gc()`表示手动触发垃圾回收，[process.memoryUsage()](https://www.nodeapp.cn/process.html#process_process_memoryusage) 将返回内存的使用情况（对象，属性值的单位为字节），其中`heapUsed`表示已分配的内存大小。

```javascript
// index.js
function GC() {
  global.gc()

  var { heapUsed } = process.memoryUsage()
  console.log(`heapUsed: ${~~(heapUsed / 1024 / 1024)}M`)
}

GC()

var map = new Map()
var key = new Array(10 * 1024 * 1024)
map.set(key, 1)
GC()

key = null
GC()
```

&emsp;&emsp;命令行执行`node --expose-gc index.js`，参数`--expose-gc`表示暴露出垃圾回收功能。

![](/js/collection/38383.png)

&emsp;&emsp;很明显，运行`key = null`内存并无变化，若想让`new Array()`被回收，可以执行`map.delete(key)`消除掉`map`对原对象持有的引用。

```javascript
// index.js
...
GC()

map.delete(key)
key = null
GC()
```

&emsp;&emsp;;`new Array()`被回收。

![](/js/collection/3833.png)

&emsp;&emsp;如果说把`index.js`中的`Map`换成`WeakMap`呢？

```javascript
// index.js
...
var ws = new WeakMap()
var key = new Array(10 * 1024 * 1024)
ws.set(key, 1)
GC()

key = null
GC()
```

&emsp;&emsp;;`new Array()`也被回收，说明了`WeakMap`对`key`所指向的对象持有的弱引用，垃圾回收将不会考虑在内。

![](/js/collection/3833.png)

&emsp;&emsp;另外`JavaScript`规范并没有规定垃圾回收的运行时机，不同的引擎之间也有不同的差异。如果能获取`WeakMap`元素个数，或者可以遍历。有可能刚开始元素个数为`5`，但是中途引擎触发了垃圾回收，清除了`3`个，重新获取个数却为`2`。

&emsp;&emsp;那岂不是乱套了吗？因此`ES6`就规定`WeakMap`没有`size`属性，也不能遍历。仅支持`set`、`get`、`has`和`delete`。至于`clear`，并不是删除了，是一开始就没在提案里，而 [讨论](https://esdiscuss.org/topic/removal-of-weakmap-weakset-clear) 是否添加`clear`的结果，并未达成一致，也就没加。

&emsp;&emsp;即使可以遍历，那么在`WeakMap`使用过程中，垃圾回收就不能运行。而什么时候回收就成了问题，不仅垃圾回收的灵活性会大大降低，回收机制也将更加复杂，显然是引擎厂商不愿意看到的。

#### 扩展

&emsp;&emsp;一个浏览器垃圾回收的例子。

&emsp;&emsp;;`Chrome`的控制台粘贴以下代码。

```javascript
var ws = new WeakSet()

ws.add({ x: 1 })

console.log(ws)
```

&emsp;&emsp;运行结果为。

![](/js/collection/log.png)

&emsp;&emsp;关闭控制台再打开，对象被回收。

![](/js/collection/log-gc.png)

&emsp;&emsp;原因很简单，控制台关闭时，垃圾回收机制介入了。

### polyfill

&emsp;&emsp;感觉上`WeakMap/WeakSet`的机制是没有 [polyfill](https://www.npmjs.com/package/weakmap-polyfill) 的，事实也确实如此。但是如果减少一些限制，是可以模拟的。

```javascript
function genId(prefix) {
  return prefix + '_' + rand() + '_' + rand()
}

function rand() {
  return Math.random().toString().substring(2)
}

function WeakMap() {
  this._id = genId('_WeakMap')
}

WeakMap.prototype.set = function (key, value) {
  key[this._id] = value
}

WeakMap.prototype.get = function (key) {
  return key[this._id]
}

WeakMap.prototype.has = function (key) {
  return key.hasOwnProperty(this._id)
}

WeakMap.prototype['delete'] = function (key) {
  if (this.has(key)) {
    delete key[this._id]

    return true
  }

  return false
}

var wm = new WeakMap()
var key = {}
wm.set(key, 1)
wm['delete'](key)
```

&emsp;&emsp;原理上非常简单，运行`wm.set(key, value)`时，把`value`作为属性值保存在`key`上，属性的生命周期将与对象完全一致，并不会影响垃圾回收。

&emsp;&emsp;但是也有不足之处，原生`WeakMap`的核心思想是`在不改变对象属性的情况下拓展对象`，而以上则违背了此思想。另外并未考虑键名重复时的情况，冻结的对象也未考虑。

### 场景

#### DOM 关联

&emsp;&emsp;在花瓣网中，图片`DOM`结构上都有自定义`data`属性，保存了关联的数据。

![](/js/collection/DOM.png)

&emsp;&emsp;自定义 [data](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/dataset) 属性示例。

```javascript
<p>hello world</p>

var p = document.querySelector('p')

p.dataset.value = 1
console.log(p.dataset.value) // 1
```

&emsp;&emsp;如果是`JQuery`构建的页面，提供了`$.data()`方法，将`DOM`与数据关联。

```javascript
var p = document.querySelector('p')

$.data(p, { value: 1 })
$.data(p) // {value: 1}
```

&emsp;&emsp;;`DOM`元素删除时，关联关系并不会解除，主动执行`$.removeData()`才能解除关联。

```javascript
$.removeData(p)
p.parentNode.removeChild(p)
p = null
```

&emsp;&emsp;以下为简化版本`JQuery`，参考了 [JQuery](https://jquery.com/) 的`3.6.1`版本。

```javascript
const dataUser = {
  expando: 'jQuery361000000',
  set(el, value) {
    el[this.expando] = value
  },
  get(el) {
    return el[this.expando]
  },
  remove(el) {
    el[this.expando] = undefined
  },
}

const $ = () => {}

$.data = (el, value) => {
  if (value) {
    dataUser.set(el, value)
  } else {
    return dataUser.get(el)
  }
}
$.removeData = el => {
  dataUser.remove(el)
}
```

&emsp;&emsp;;`DOM`与数据关联的核心思想，即是将数据作为了`DOM`对象的属性值，与`WeakMap`模拟版高度相似。

&emsp;&emsp;而用`WeakMap`替代的优势在于，一旦`DOM`元素删除，关联关系自动解除。对于删除的`DOM`和数据，若没有被持有引用，将会被垃圾回收清除掉，避免内存泄漏。

```javascript
var ws = new WeakMap()
var p = document.querySelector('p')

ws.set(p, { value: 1 })

p.parentNode.removeChild(p)
p = null
```

&emsp;&emsp;另外`WeakMap`并未破坏原有`DOM`对象的属性，而在`JQuery`中，即使是运行了`$.removeData()`，也仅仅只是将属性值置为`undefined`，并未删除属性。

![](/js/collection/jq.png)

#### 事件系统

&emsp;&emsp;;`node`中的 [EventEmitter](https://www.nodeapp.cn/events.html#events_class_eventemitter) 类，可用于事件的发布订阅。

```javascript
const EventEmitter = require('events')

class Emitter extends EventEmitter {}

var emit = new Emitter()

emit.on('message', () => {
  console.log('hello')
})

emit.emit('message')
```

&emsp;&emsp;浏览器中虽没有`EventEmitter`类，但是可以借助`WeakMap`。

```javascript
const listeners = new WeakMap()
const on = (object, eventName, listener) => {
  var value = listeners.get(object)

  if (!value) value = {}
  if (!value[eventName]) value[eventName] = []

  value[eventName].push(listener)
  listeners.set(object, value)
}
const emit = (object, eventName) => {
  var value = listeners.get(object)

  if (!value) value = {}
  if (!value[eventName]) value[eventName] = []

  value[eventName].forEach(listener => {
    listener.call(object, eventName)
  })
}
```

&emsp;&emsp;实现对任意对象添加事件机制。

```javascript
var object = {}

on(object, 'message', () => {
  console.log('hello')
})

emit(object, 'message')
```

#### 私有属性

&emsp;&emsp;;`ES2020`引入了类的私有属性。

```javascript
class Person {
  #age

  constructor(name, age) {
    this.name = name
    this.#age = age
  }

  getAge() {
    return this.#age
  }
}

var p = new Person('xx', 18)
console.log(p.getAge()) // 18
console.log(p.#age) // SyntaxError: Private field '#age' must be declared in an enclosing class
```

&emsp;&emsp;在 [Babel](https://www.babeljs.cn/repl) 的在线编辑器中，取消`ENV PRESET`预置器的`Enabled`勾选。

&emsp;&emsp;发现`babel`将`#prop`语法转换成了`WeakMap`，以支持低版本浏览器。

```javascript
var _age = new WeakMap()

function _classPrivateFieldSet(receiver, descriptor, value) {
  descriptor.set(receiver, value)
}

function _classPrivateFieldGet(receiver, descriptor) {
  return descriptor.get(receiver)
}

class Person {
  constructor(name, age) {
    this.name = name

    _classPrivateFieldSet(this, _age, age)
  }

  getAge() {
    return _classPrivateFieldGet(this, _age)
  }
}

var p = new Person('xx', 18)
console.log(p.getAge()) // 18
```

#### 数据缓存

&emsp;&emsp;;[vue3](https://github.com/vuejs/core/blob/v3.2.0/packages/reactivity/src/reactive.ts#L30) 在创建响应式对象时，用了`WeakMap`缓存，避免重复代理。

```javascript
export const reactiveMap = new WeakMap()

export function reactive() {
  return createReactiveObject(reactiveMap)
}

function createReactiveObject(proxyMap) {
  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  proxyMap.set(target, proxy)
  return proxy
}
```

## 参考

 - [Map 和 Set 为什么是有序的？](https://www.zhihu.com/question/543282694)
 - [哈希表和哈希冲突](https://www.zhihu.com/question/330112288)
 - [Map 和 Set 的底层数据结构](https://blog.csdn.net/qfc_128220/article/details/121786849)
 - [Sets and Maps](https://github.com/nzakas/understandinges6/blob/master/manuscript/07-Sets-And-Maps.md)
 - [为什么无法迭代 WeakMap？](https://www.zhihu.com/question/458213150)

##  🎉 写在最后

🍻伙伴们，如果你已经看到了这里，觉得这篇文章有帮助到你的话不妨点赞👍或 [Star](https://github.com/dongwei1125/blog) ✨支持一下哦！

手动码字，如有错误，欢迎在评论区指正💬~

你的支持就是我更新的最大动力💪~

[GitHub](https://github.com/dongwei1125) / [Gitee](https://gitee.com/dongwei1125)、[GitHub Pages](https://dongwei1125.github.io/)、[掘金](https://juejin.cn/user/2621689331987783)、[CSDN](https://blog.csdn.net/Don_GW) 同步更新，欢迎关注😉~