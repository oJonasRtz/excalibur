import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';


const game = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.Fixed,
  backgroundColor: ex.Color.Black
});

const paddle1 = new Paddle(50, game.drawHeight / 2);
const paddle2 = new Paddle(game.drawWidth - 50, game.drawHeight / 2, 2);

game.add(paddle1);
game.add(paddle2);

game.start();
