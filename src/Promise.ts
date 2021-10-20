const PENDING = 'pending' as const
const RESOLVED = 'resolved' as const
const REJECTED = 'rejected' as const

type Status = typeof PENDING | typeof RESOLVED | typeof REJECTED
type Executor = (resolve: (value: any) => void, reject: (reason: any) => void) => void

class MyPromise {
  status: Status
  value: any
  reason: any
  resolveCallbacks: ((...args: any[]) => void)[]
  rejectCallbacks: ((...args: any[]) => void)[]

  constructor(executor: Executor) {
    this.status = PENDING
    this.value = ''
    this.reason = ''
    this.resolveCallbacks = []
    this.rejectCallbacks = []

    function resolve(this: MyPromise, value: any) {
      if (this.status !== PENDING) {
        return
      }

      this.value = value
      this.status = RESOLVED
      this.resolveCallbacks.forEach((fn) => fn(this.value))
    }

    function reject(this: MyPromise, reason: any) {
      if (this.status !== PENDING) {
        return
      }

      this.status = REJECTED
      this.reason = reason
      this.rejectCallbacks.forEach((fn) => fn(this.reason))
    }

    executor(resolve.bind(this), reject.bind(this))
  }

  then(onFulfilled?, onRejected?) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason
          }

    function resolvePromise(promise, value, resolve, reject) {
      if (promise === value) {
        return reject(new TypeError('Chaining cycle detected for promise'))
      }

      let called = false

      try {
        if (value instanceof MyPromise) {
          const then = value.then

          then.call(
            value,
            (val) => {
              if (called) {
                return
              }

              called = true
              resolvePromise(promise, val, resolve, reject)
            },
            (err) => {
              if (called) {
                return
              }

              called = true
              reject(err)
            }
          )
        } else {
          resolve(value)
        }
      } catch (error) {
        reject(error)
      }
    }

    const myPromise = new MyPromise((resolve, reject) => {
      function fulfilled(this: MyPromise) {
        setTimeout(() => {
          try {
            const value = onFulfilled(this.value)

            resolvePromise(myPromise, value, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }

      function rejected(this: MyPromise) {
        setTimeout(() => {
          try {
            const reason = onRejected(this.reason)

            resolvePromise(myPromise, reason, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }

      if (this.status === PENDING) {
        this.resolveCallbacks.push(fulfilled.bind(this))
        this.rejectCallbacks.push(rejected.bind(this))
      }

      if (this.status === RESOLVED) {
        fulfilled.call(this)
      }

      if (this.status === REJECTED) {
        rejected.call(this)
      }
    })

    return myPromise
  }

  catch(fn) {
    return this.then(null, fn)
  }

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }

  static race(promises: MyPromise[]) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => promise.then(resolve, reject))
    })
  }

  static all(promises: MyPromise[]) {
    const arr = []
    let index = 0

    return new MyPromise((resolve, reject) => {
      promises.forEach((promise, i) => {
        promise.then((value) => {
          arr[i] = value
          if (++index === promises.length) {
            resolve(arr)
          }
        }, reject)
      })
    })
  }
}

new MyPromise((resolve) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
  .then((val) => {
    console.log('val: ', val)

    return MyPromise.resolve('of')
  })
  .then((val) => {
    console.log('val of then 1: ', val)

    return 'promise'
  })
  .then((val) => {
    console.log('val of then 2: ', val)

    throw new Error('error')
  }).catch(err => {
    console.log('err: ', err)

    return MyPromise.reject('wwuuwuw')
  }).then(val => {
    console.log('val of catch in then: ', val)
  }).catch(err => {
    console.log('val of catch in catch: ', err)
  })
