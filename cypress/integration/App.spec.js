import { SELECTORS, PRICE_PER_LOTTO, LOTTO_NUMBER_REGEXP } from "../../src/js/constants";

beforeEach(() => {
  cy.visit("http://localhost:5500");
});

describe("Initial state", () => {
  it("$numOfLottos는 0개를 표시", () => {
    cy.get(SELECTORS.NUMBER_OF_LOTTOS).should("contain.text", "0개");
  });

  it("$lottos는 비어있음", () => {
    cy.get(SELECTORS.LOTTOS).should("be.empty");
  });
});

describe("금액 입력", () => {
  it("정상적인 금액 입력", () => {
    cy.get(SELECTORS.CHARGE_INPUT).type(5000);
    cy.get(SELECTORS.CHARGE_BUTTON).click();
    cy.get(SELECTORS.CHARGE_INPUT).should("have.value", "");
  });

  it("1 개당 가격에 나누어 떨어지지 않는 금액 입력", () => {
    cy.get(SELECTORS.CHARGE_INPUT).type(5500);
    cy.get(SELECTORS.CHARGE_BUTTON).click();
    cy.on("window:alert", (text) => expect(text).to.contain(PRICE_PER_LOTTO));
  });

  it("일반 문자열을 값으로 입력", () => {
    cy.get(SELECTORS.CHARGE_INPUT).type("hello world");
    cy.get(SELECTORS.CHARGE_INPUT).should("have.value", "");
  });
});

describe("구매", () => {
  it("1개당 1000원인 로또를 10장 구매", () => {
    cy.get(SELECTORS.CHARGE_INPUT).type(10000);
    cy.get(SELECTORS.CHARGE_BUTTON).click();
    cy.get(SELECTORS.NUMBER_OF_LOTTOS).should("contain.text", "10");
    cy.get(SELECTORS.LOTTOS).children().should("have.length", 10);
    cy.get(SELECTORS.CHARGE_INPUT).should("have.value", "");
  });
});

describe("로또 번호 시각화", () => {
  it("번호 보기가 true이면 구매한 로또 번호 보여주기", () => {
    cy.get(SELECTORS.CHARGE_INPUT).type(10000);
    cy.get(SELECTORS.CHARGE_BUTTON).click();
    cy.get(SELECTORS.NUMBER_VISIBILITY_TOGGLE).click({ force: true });
    cy.get(SELECTORS.LOTTOS)
      .children()
      .each((el) => {
        cy.wrap(el).children("span").should("to.be.visible");
      });
  });

  it("번호 보기를 true에서 false로 바꾸면 번호를 안보여줌", () => {
    cy.get(SELECTORS.CHARGE_INPUT).type(10000);
    cy.get(SELECTORS.CHARGE_BUTTON).click();
    cy.get(SELECTORS.NUMBER_VISIBILITY_TOGGLE).click({ force: true });
    cy.get(SELECTORS.NUMBER_VISIBILITY_TOGGLE).click({ force: true });
    cy.get(SELECTORS.LOTTOS)
      .children()
      .each((el) => {
        cy.wrap(el).children("span").should("to.not.be.visible");
      });
  });

  it("로또를 구매하지 않았으면 번호보기가 true여도 변화없음", () => {
    cy.get(SELECTORS.NUMBER_VISIBILITY_TOGGLE).click({ force: true });
    cy.get(SELECTORS.LOTTOS).should("be.empty");
  });
});
