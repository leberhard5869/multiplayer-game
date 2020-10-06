class Collectible {
  constructor(width, height, margin, speed, id) {
    this.x = Math.floor(Math.random() * (width - 2 * margin) / speed) * speed + margin;
    this.y = Math.floor(Math.random() * (height - 2 * margin) / speed) * speed + margin;
    this.value = 1;
    this.id = id;
  }
}

/* FCC comment...
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
