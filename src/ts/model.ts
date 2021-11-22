import { ErrorMsgs, UNIT_PRICE, GRADES, Entry, WinningList, MAX_NUM, MIN_NUM, NUMBERS_PER_LOTTO } from './constants.js'

const arrayGen = (size: number, mapper: (v: any, k: number) => any) => [...Array(size)].map(mapper)
const ALL_NUMBERS = arrayGen(MAX_NUM, (_, i) => i + 1) as number[]

class LottoModel {
  #data: {
    amount: number
    list: Entry[]
    randomEntries: boolean[]
  } = {
    amount: 0,
    list: [],
    randomEntries: [],
  }

  isValid(item: number[], validLength: number) {
    if (item.length !== validLength || [...new Set(item)].length !== item.length) throw Error(ErrorMsgs.DUPLICATED)
    if (item.some(n => n < MIN_NUM || n > MAX_NUM)) throw Error(ErrorMsgs.OUT_OF_RANGE)
    return true
  }
  reset() {
    this.#data = {
      amount: 0,
      list: [],
      randomEntries: [],
    }
  }
  setPrice(price: number) {
    if (price < UNIT_PRICE) throw Error(ErrorMsgs.MIN_PRICE)
    const amount = Math.floor(price / UNIT_PRICE)
    this.#data.amount = amount
    this.#data.list = []
    this.toggleRandomEntries(false)
    return amount
  }
  generateRandomEntry(values: Entry) {
    const selectedValues = values.filter(v => v > 0)
    const cloneNumbers = [...ALL_NUMBERS].filter(v => !selectedValues.includes(v))
    const randomResult = arrayGen(
      NUMBERS_PER_LOTTO - selectedValues.length,
      () => cloneNumbers.splice(Math.floor(Math.random() * cloneNumbers.length), 1)[0],
    )
    return values.map(v => v || randomResult.pop()) as Entry
  }
  toggleRandomEntry(index: number, checked: boolean) {
    this.#data.randomEntries[index] = checked
  }
  toggleRandomEntries(checked: boolean) {
    this.#data.randomEntries = [...new Array(this.#data.amount)].fill(checked)
  }
  get isEntriesAllRandom() {
    return this.#data.randomEntries.length === this.#data.amount && this.#data.randomEntries.every(e => !!e)
  }
  setEntry(index: number, values: Entry, isRandom: boolean = false) {
    this.toggleRandomEntry(index, isRandom)
    const res = isRandom ? this.generateRandomEntry(values) : values
    if (!this.isValid(res, NUMBERS_PER_LOTTO)) return
    this.#data.list[index] = res
    return res
  }
  getWinList(numbers: number[]) {
    const amount = this.#data.list.length
    const winningNumbers = [...numbers]
    if (!this.isValid(winningNumbers, NUMBERS_PER_LOTTO + 1)) return false
    const bonusNumber = winningNumbers.pop() as number

    const res: WinningList = this.#data.list.reduce(
      (p, c) => {
        const matched = winningNumbers.filter(num => c.includes(+num)) || []
        const bonusMatched = matched.length === NUMBERS_PER_LOTTO - 1 && c.includes(+bonusNumber)
        switch (matched.length) {
          case 3:
            p.g5 += 1
            break
          case 4:
            p.g4 += 1
            break
          case 5: {
            if (!bonusMatched) p.g3 += 1
            else p.g2 += 1
            break
          }
          case 6:
            p.g1 += 1
        }
        return p
      },
      {
        g5: 0,
        g4: 0,
        g3: 0,
        g2: 0,
        g1: 0,
      },
    )

    return {
      winningList: res,
      earningRate:
        (100 *
          (Object.entries(GRADES).reduce((p, [g, { winPrice }]) => p + winPrice * res[g], 0) - amount * UNIT_PRICE)) /
        (amount * UNIT_PRICE),
    }
  }
}

export default new LottoModel()