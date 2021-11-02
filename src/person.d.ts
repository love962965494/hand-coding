interface Person {
  name: string
  age: number
}

interface PersonConctrucot {
  new (name: string, age: number): Person
  readonly prototype: Person
}

declare const Person: PersonConctrucot