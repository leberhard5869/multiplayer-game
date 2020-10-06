class Player {
  constructor(width, height, margin, speed, id) {
    this.x = Math.floor(Math.random() * (width - 2 * margin) / speed) * speed + margin;
    this.y = Math.floor(Math.random() * (height - 2 * margin) / speed) * speed + margin;
    this.oldx = this.x;
    this.oldy = this.y;
    this.deltax = 0;
    this.deltay = 0;
    this.score = 0;
    this.id = id;
    this.colour = `rgb(${Math.floor(Math.random() * 257)}, ${Math.floor(Math.random() * 257)}, ${Math.floor(Math.random() * 257)})`;
  }

  movePlayer(dir, speed, width, height, margin, playerWidth) {
    switch(dir) {
      case "up":
        this.y - speed >= margin ? this.y -= speed : this.y = margin;
        break;
      case "down":
        this.y + speed <= height - margin - playerWidth ? this.y += speed : this.y = height - margin - playerWidth;
        break;
      case "left":
        this.x - speed >= margin ? this.x -= speed : this.x = margin;
        break;    
      case "right":
        this.x + speed <= width - margin - playerWidth? this.x += speed : this.x = width - margin - playerWidth;
        break;        
    }
  }

  collision(item) {
    if (this.x == item.x && this.y == item.y) {
      this.score += item.value;
      return true;
    } else {
      return false;
    };
  }

  calculateRank(arr) {
    arr.sort((a,b) => { return b.score - a.score });
    let rank = arr.findIndex(elm => elm.id == this.id) + 1;
    return `Rank: ${rank} / ${arr.length}`;
  };
}

export default Player;
