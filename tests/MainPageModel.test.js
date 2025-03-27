import { Selector } from "testcafe";

class MainPageModel {
  constructor() {
    this.timer = Selector("#timer");
    this.input = Selector("#guess");
    this.pause = Selector("#pause-btn");
    this.continue = Selector("#pause-text").find('.continue');
    this.winExit = Selector("#win").find('.exit');
    this.giveup = Selector('#give-up');
  }
}

export default new MainPageModel();