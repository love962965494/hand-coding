const jsonstringify = (data) => {
  const isCyclic = (obj) => {
    // 使用Set数据类型来存储已经检测过的对象
    const statckSet = new Set()
    let detected = false

    const detect = (obj) => {
      // 不是对象的话直接跳过
      if (obj && typeof obj !== 'object') {
        return
      }

      if (statckSet.has(obj)) {
        return (detected = true)
      }

      statckSet.add(obj)

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          detect(obj[key])
        }
      }

      // 平级检测完成之后，将当前对象删除，防止误判
      /**
       * 例如：对象的属性指向同一引用，如果不删除的话，会被认为是循环引用
       * let tempObj = {
       *   name: ''测试
       * }
       * let obj = {
       *   obj1: tempObj,
       *   obj2: tempObj
       * }
       *
       */
      statckSet.delete(obj)
    }

    detect(obj)

    return detected
  }

  if (isCyclic(data)) {
    throw new TypeError('Converting circular structure to JSON')
  }

  // 转换BigInt类型的值会报错
  if (typeof data === 'bigint') {
    throw new TypeError('Do not know how to serialize a BigInt')
  }

  const type = typeof data
  const commonKeys = ['undefined', 'function', 'symbol']
  const getType = (s) => (Object.prototype.toString.call(s) as string).replace(/\[object (.*?)\]/, '$1').toLowerCase()

  // 非对象类型
  if (type !== 'object' || data === null) {
    let result = data

    // NaN和Infinity格式的数据会被转换为null
    if ([NaN, Infinity, null].includes(data)) {
      result = 'null'

      // undefined、函数和symbol都会被转换成undefined
    } else if (commonKeys.includes(type)) {
      // 直接得到undefined，并不是一个字符串'undefined'
      return undefined
    } else if (type === 'string') {
      result = '"' + data + '"'
    }

    return String(result)
  } else if (type === 'object') {
    // 转换值如果有toJSON方法，该方法定义什么值就序列化对应值
    // Date日期类型调用了toJSON方法，将其转换为string类型(同Date.toISOString)，因此会被当做字符串处理
    if (typeof data.toJSON === 'function') {
      return jsonstringify(data.toJSON())
    } else if (Array.isArray(data)) {
      const result = data.map((it) => {
        // undefined、函数和symbol类型在数组中会被序列化为null
        return commonKeys.includes(typeof it) ? 'null' : jsonstringify(it)
      })

      return `[${result}]`.replace(/'/g, '"')
    } else {
      // Boolean和Number类型
      if (['boolean', 'number'].includes(getType(data))) {
        return String(data)
        // String类型
      } else if (getType(data) === 'string') {
        return '"' + data + '"'
      } else {
        let result = []

        Object.keys(data).forEach((key) => {
          // 所有以sumbol为属性键的属性都会被完全忽略掉，即便replacer参数中强制指定包含了它们
          if (typeof key !== 'symbol') {
            const value = data[key]

            // 'undefined'、函数和ymbol值出现在非数组对象的属性值中，在序列化过程中会被忽略
            if (!commonKeys.includes(typeof value)) {
              result.push(`"${key}":${jsonstringify(value)}`)
            }
          }
        })

        return `{${result}}`.replace(/'/, '"')
      }
    }
  }
}