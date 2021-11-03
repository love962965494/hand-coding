/**
 * What happened when we callnew：
 *    · It creates a new object. The type of this object, is simply object.
 *    · It sets the new object's internal, inaccessible, [[prototype]](i.e. __proto__) property to be the
 *      constructor function's external, accessible, prototype object(every function automatically has a
 *      prototype property).
 *    · It makes the this variable point to the newly created object.
 *    · It executes the constructor function, using the newly created object whenever this is mentioned.
 *    · It returns the newly created object, unless the constructor function returns a non-null object
 *      reference. In this case, that object reference is returned instead.
 */
function New(func: (...args: any[]) => void, ...args: any[]) {
  const res = {}
  if (func.prototype !== null) {
    ;(res as any).__proto__ = func.prototype
  }
  const ret = func.apply(res, args)

  if ((typeof ret === 'object' || typeof ret === 'function') && ret !== null) {
    return ret
  }

  return res
}

/****************** Test ****************/
function Person(name: string, age: number) {
  this.name = name
  this.age = age
}

const person1 = New(Person, 'HHH', 13)
const person2 = new Person('HHH', 13)

console.log('person1: ', person1)
console.log('person2: ', person2)