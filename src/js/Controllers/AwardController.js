import { Controller } from "./Controller.js";
import { parseDecimal } from "../utils/parser.js";

export class AwardController extends Controller {
  constructor(view, model, properties) {
    super(view, model, properties);
    this.addEventHandlers();
    this.render();
  }

  getWinningNumbers(e) {
    const formData = new FormData(e.target);
    return {
      winningNumbers: formData.getAll("winningNumbers").map(parseDecimal),
      bonusNumber: parseDecimal(formData.get("bonusNumber")),
    };
  }

  drawLotto(e) {
    try {
      e.preventDefault();
      const lottos = this.properties.getLottos();
      this.model.drawLotto(lottos, this.getWinningNumbers(e));
      this.render();
    } catch (e) {
      window.alert(e.message);
    }
  }

  resetApp() {
    this.properties.resetApp();
  }

  closeModal() {
    this.model.closeAward();
    this.render();
  }

  addEventHandlers() {
    this.view.$winningNumberForm.addEventListener("submit", this.drawLotto.bind(this));
    this.view.$awardModalCloseButton.addEventListener("click", this.closeModal.bind(this));
    this.view.$resetButton.addEventListener("click", this.resetApp.bind(this));
  }
}
