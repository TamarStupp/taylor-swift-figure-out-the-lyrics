import { Selector } from "testcafe";

class MainPageModel {
  constructor() {
    this.timer = Selector("#timer");
    this.input = Selector("#guess");
    this.pause = Selector("pause");
    this.countinue = Selector("#pause-text").child('.continue')

  }
}