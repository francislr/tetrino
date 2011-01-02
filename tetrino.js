
TETRINO_BUTTON_A = 1;
TETRINO_BUTTON_B = 2;
TETRINO_BUTTON_LEFT = 3;
TETRINO_BUTTON_TOP = 4;
TETRINO_BUTTON_RIGHT = 5;
TETRINO_BUTTON_BOTTOM = 6;

TETRINO_KEYBOARD_MAP = {
  37: TETRINO_BUTTON_LEFT,
  38: TETRINO_BUTTON_TOP,
  39: TETRINO_BUTTON_RIGHT,
  40: TETRINO_BUTTON_BOTTOM,
  13: TETRINO_BUTTON_A,
  32: TETRINO_BUTTON_B
};

TETRINO_CHAR_WIDTH = 8;
TETRINO_CHAR_HEIGHT = 13;
TETRINO_CHAR_MAP_URL = "character-set.gif";

TetrinoThisCall = function (_this, func) {
  return function () {
    func.apply(_this, arguments);
  };
};

TetrinoElement = function (x, y, width, height) {
  this.element = document.createElement("DIV");
  this.setPosition(x, y);
  this.setDimensions(width, height);
};

TetrinoElement.prototype.setDimensions = function (width, height) {
  this.width = width,
  this.height = height;
  if (width != undefined || height != undefined) {
    width = width ?
      width + "px" : "auto",
    height = height ?
      height + "px" : "auto";
    this.element.style.width = width,
    this.element.style.height = height;
  }
};

TetrinoElement.prototype.setPosition = function (x, y) {
  if (x != undefined && y != undefined) {
    this.element.style.position = "absolute";
    this.x = x,
    this.y = y;
    this.element.style.left = x + "px",
    this.element.style.top = y + "px";
  }
  else {
    this.element.style.left = "auto",
    this.element.style.top = "auto";
  }
};

TetrinoElement.prototype.setClass = function (class_name) {
  if (!this.element) {
    return ;
  }
  if (this.element.className) {
    this.element.className = class_name;
  }
  else {
    this.element.setAttribute("class", class_name);
  }
};

TetrinoElement.prototype.appendTo = function (element) {
  element.appendChild(this.element);
};

TetrinoElement.prototype.destroy = function () {
  if (!this.element || !this.element.parentNode) {
    return ;
  }
  this.element.parentNode.removeChild(this.element);
};

TetrinoText = function (caption, x, y, width, height, char_width, char_height, char_map_url) {
  this.char_width = char_width || TETRINO_CHAR_WIDTH,
  this.char_height = char_height || TETRINO_CHAR_HEIGHT;
  this.char_map_url = char_map_url || TETRINO_CHAR_MAP_URL;
  height = height || this.char_height;
  TetrinoElement.call(this, x, y, width, height);
  this.chars_map = new Array();
  if (caption) {
    this.setText(caption);
  }
  this.setClass("TetrinoText");
};

TetrinoText.prototype = new TetrinoElement;

TetrinoText.prototype.newCharacterElement = function (character) {
  var char_code = character.charCodeAt(0);
  var char_first = "#".charCodeAt(0), // 35
      char_last = "z".charCodeAt(0); // 122
  var line_feed = char_code == "\n".charCodeAt(0), // 10
      space = char_code == " ".charCodeAt(0); // 32
  if ((char_code >= char_first && char_code <= char_last) || line_feed || space) {
    var char_index = char_code - char_first;
    var char_offset = char_index * this.char_width;
    var char_element = document.createElement("DIV");
    char_element.style.height = this.char_height + "px";
    char_element.style.float = "left";
    if (line_feed) {
      char_element.style.width = "0",
      char_element.style.clear = "left";
    }
    else {
      char_element.style.width = this.char_width + "px";
      if (!space) {
        char_element.style.backgroundImage = "url(" + this.char_map_url + ")";
        char_element.style.backgroundPosition = "-" + char_offset + "px 0";
      }
    }
    return char_element;
  }
  return null;
};

TetrinoText.prototype.setText = function (text) {
  this.reset();
  for (var i = 0; i < text.length; i++) {
    var character = text.charAt(i);
    var char_element = this.newCharacterElement(character);
    if (char_element) {
      this.element.appendChild(char_element);
      this.chars_map.push(char_element);
    }
  }
};

TetrinoText.prototype.setCharacter = function (index, character) {
  if (index >= this.chars_map.length) {
    return false;
  }
  var current_char_element = this.chars_map[index];
  var new_char_element = this.newCharacterElement(character);
  this.element.replaceChild(new_char_element, current_char_element);
  this.chars_map[index] = new_char_element;
};

TetrinoText.prototype.setBackgroundColor = function (color) {
  this.element.style.backgroundColor = color;
};

TetrinoText.prototype.reset = function () {
  var char_element;
  while (char_element = this.chars_map.pop()) {
    this.element.removeChild(char_element);
  }
};

TetrinoMenu = function (x, y) {
  TetrinoElement.call(this, x, y, 0, 0);
  this.choices = new Array();
  this.highlight_index = -1;
};

TetrinoMenu.prototype = new TetrinoElement;

TetrinoMenu.prototype.addChoice = function (text, select_func, focus_func) {
  var choice = {
    "select_func": select_func,
    "focus_func": focus_func,
    "text": text
  };
  this.choices.push(choice);
  text.appendTo(this.element);
  if (this.choices.length == 1) {
    this.highlightChoice(0);
  }
};

TetrinoMenu.prototype.getChoice = function (index) {
  if (index < 0 && index >= this.choices.length) {
    return null;
  }
  return this.choices[index];
};

TetrinoMenu.prototype.getCurrentChoice = function () {
  return this.getChoice(this.highlight_index);
};

TetrinoMenu.prototype.highlightChoice = function (index) {
  var current_choice = this.getCurrentChoice(),
      new_choice = this.getChoice(index);
  if (current_choice) {
    current_choice.text.setBackgroundColor("transparent");
  }
  this.highlight_index -1;
  if (new_choice) {
    new_choice.text.setBackgroundColor("#ff0000");
    if (new_choice.focus_func) {
      new_choice.focus_func();
    }
    this.highlight_index = index;
    return true;
  }
  return false;
};

TetrinoMenu.prototype.highlightNextChoice = function () {
  if (this.highlight_index + 1 >= this.choices.length) {
    return false;
  }
  this.highlightChoice(this.highlight_index + 1);
  return true;
};

TetrinoMenu.prototype.highlightPreviousChoice = function () {
  if (this.highlight_index - 1 < 0) {
    return false;
  }
  this.highlightChoice(this.highlight_index - 1);
  return true;
};

TetrinoMenu.prototype.selectChoice = function () {
  var current_choice = this.getCurrentChoice();
  if (current_choice.select_func) {
    current_choice.select_func();
  }
};

TetrinoMenu.prototype.buttonPress = function (button) {
  switch (button) {
  case TETRINO_BUTTON_LEFT:
    
    break ;
  case TETRINO_BUTTON_TOP:
    this.highlightPreviousChoice();
    break ;
  case TETRINO_BUTTON_RIGHT:
    break ;
  case TETRINO_BUTTON_BOTTOM:
    this.highlightNextChoice();
    break ;
  case TETRINO_BUTTON_A:
  case TETRINO_BUTTON_B:
    this.selectChoice();
    break ;
  }
};

TetrinoGrid = function (grid_width, grid_height, block_width, block_height) {
  TetrinoElement.call(this, undefined, undefined,
    grid_width * block_width, grid_height * block_height);
  this.grid_width = grid_width,
  this.grid_height = grid_height;
  this.block_width = block_width,
  this.block_height = block_height;
  //var grid = document.createElement("DIV");
  this.element.className = "TetrinoGrid";
  //grid.style.position = "relative";
  //grid.style.width = (grid_width * block_width) + "px",
  //grid.style.height = (grid_height * block_height) + "px";
  //this.grid_element = grid;
  var blocks = new Array(grid_width);
  for (var i = 0; i < grid_width; i++) {
    blocks[i] = new Array(grid_height);
    for (var j = 0; j < grid_height; j++) {
      blocks[i][j] = null;
    }
  }
  this.blocks = blocks;
};

TetrinoGrid.prototype = new TetrinoElement;

//TetrinoGrid.prototype.appendTo = function (element) {
//  element.appendChild(this.grid_element);
//};

TetrinoGrid.prototype.setBlock = function (x, y, block) {
  if (x >= this.grid_width || y >= this.grid_height) {
    return ;
  }
  block.setSize(this.block_width, this.block_height);
  this.blocks[x][y] = block;
  block.setPosition(x, y);
  this.element.appendChild(block.block_div);
};

TetrinoGrid.prototype.removeBlock = function (x, y) {
  var block = this.blocks[x][y];
  if (!block) {
    return false;
  }
  this.element.removeChild(block.block_div);
  this.blocks[x][y] = null;
};

TetrinoGrid.prototype.forEachBlock = function (f, matrix) {
  var blocks = matrix || this.blocks;
  for (var x = 0; x < blocks.length; x++) {
    for (var y = 0; y < blocks[x].length; y++) {
      var block = blocks[x][y];
      if (block) {
        if (!f(block, x, y)) {
          return false;
        }
      }
    }
  }
  return true;
};

TetrinoGrid.prototype.updateBlockPosition = function () {
  var f = function (block, bx, by) {
    if (bx != block.x || by != block.y) {
      block.setPosition(bx, by);
    }
    return true;
  }
  this.forEachBlock(f);
};

TetrinoGrid.prototype.removeAllBlocks = function () {
  var self = this;
  var f = function (block, bx, by) {
    self.removeBlock(bx, by);
    return true;
  };
  this.forEachBlock(f);
};

TetrinoGrid.prototype.checkCollision = function (grid, x, y, matrix) {
  matrix = matrix || grid.blocks;
  var self = this;
  var f = function (block, bx, by) {
    var cx = bx + x,
        cy = by + y;
      if (cx >= self.grid_width || cx < 0
          || cy >= self.grid_height || cy < 0
          || self.blocks[cx][cy] != null) {
        return false;
      }
    return true;
  }
  return this.forEachBlock(f, matrix);
};


TetrinoGrid.prototype.checkRotationCollision = function (grid, x, y) {
  x = x || grid.x,
  y = y || grid.y;
  matrix = TetrinoRotateMatrix(grid.blocks);
  return this.checkCollision(grid, x, y, matrix);
};

TetrinoGrid.prototype.rotate = function () {
  matrix = TetrinoRotateMatrix(this.blocks);
  this.blocks = matrix;
  this.updateBlockPosition();
};

function TetrinoRotateMatrix(matrix) {
  var l = matrix.length;
  var n = new Array(l);
  for (var i = 0; i < l; i++) {
    n[i] = new Array(l);
  }
  for (var i = 0; i < l; i++) {
    for (var j = 0; j < l; j++) {
      n[l - j - 1][i] = matrix[i][j];
    }
  }
  return n;
}

TetrinoPiece = function (block_width, block_height, matrix, block_style) {
  var grid_width = matrix[0].length,
      grid_height = matrix.length;
  TetrinoGrid.call(this, grid_width, grid_height, block_width, block_height);
  var grid = this.element;
  this.element.className = "TetrinoPiece";
  this.element.style.position = "absolute"
  this.setPosition(0, 0);
  this.setClass("TetrinoPiece");
  for (var i = 0; i < grid_width; i++) {
    for (var j = 0; j < grid_height; j++) {
      if (matrix[i][j]) {
        var block = new TetrinoBlock(block_style);
        this.setBlock(i, j, block);
      }
    }
  }
};

TetrinoPiece.prototype = new TetrinoGrid;

TetrinoPiece.prototype.setPosition = function (x, y) {
  this.x = x,
  this.y = y;
  this.element.style.left = (x * this.block_width) + "px",
  this.element.style.top = (y * this.block_height) + "px";
};

TetrinoPiece.prototype.removeFrom = function (element) {
  element.removeChild(this.element);
};

TetrinoPiece.prototype.putInGrid = function (grid) {
  var self = this;
  var f = function (block, bx, by) {
    var new_block = new TetrinoBlock();
    new_block.block_div = block.block_div.cloneNode(false);
    grid.setBlock(self.x + bx, self.y + by, new_block);
    return true;
  };
  this.forEachBlock(f);
};

TetrinoBlock = function (block_style) {
  this.x = 0,
  this.y = 0;
  var block_div = document.createElement("DIV")
  if (block_style) {
    block_div.className = "TetrinoBlock " + block_style;
  }
  block_div.style.position = "absolute";
  this.block_div = block_div;
};

TetrinoBlock.prototype.setPosition = function (x, y) {
  var block_div = this.block_div;
  this.x = x,
  this.y = y;
  block_div.style.left = (x * this.width) + "px",
  block_div.style.top = (y * this.height) + "px";
};

TetrinoBlock.prototype.setSize = function (width, height) {
  this.width = width,
  this.height = height;
  var block_div = this.block_div;
  block_div.style.width = width + "px",
  block_div.style.height = height + "px";
};

function TetrinoRandomColor () {
  var color_index = Math.floor(Math.random() * TetrinoBlockColors.length);
  return TetrinoBlockColors[color_index];
}

TetrinoDisplay = function () {
  TetrinoElement.call(this);
  this.setClass("TetrinoDisplay");
  this.score_label = new TetrinoText("Score");
  this.score_label.appendTo(this.element);
  this.score_value = new TetrinoText("0");
  this.score_value.appendTo(this.element);
  this.next_piece_label = new TetrinoText("Next");
  this.next_piece_label.appendTo(this.element);
  this.next_piece_container = new TetrinoElement();
  this.next_piece_container.setClass("TetrinoNextPiece");
  this.next_piece_container.appendTo(this.element);
  this.next_piece = null;
};

TetrinoDisplay.prototype = new TetrinoElement;

TetrinoDisplay.prototype.setNextPiece = function (next_piece) {
  if (this.next_piece) {
    this.next_piece.removeFrom(this.next_piece_container.element);
    this.next_piece = null;
  }
  if (next_piece) {
    next_piece.appendTo(this.next_piece_container.element);
    this.next_piece = next_piece;
  }
};

Tetrino = function (grid_width, grid_height, block_width, block_height) {
  TetrinoElement.call(this, 0, 0, 500, 500);
  this.grid = new TetrinoGrid(grid_width, grid_height, block_width, block_height);
  this.display = new TetrinoDisplay();
  this.piece = null;
  this.generateHoldQueue();
  this.piece_index = 0;
  this.nextPiece();
  this.grid.appendTo(this.element);
  this.display.appendTo(this.element);
};

Tetrino.prototype = new TetrinoElement;

Tetrino.prototype.generateHoldQueue = function () {
  var hold_queue = new Array(25),
      pieces = TetrinoPieces.length;
  for (var i = 0; i < 25; i++) {
    var p = Math.floor(Math.random() * pieces);
    hold_queue[i] = TetrinoPieces[p];
  }
  this.hold_queue = hold_queue;
};

Tetrino.prototype.nextPieceIndex = function () {
  var piece_index = this.piece_index;
  piece_index++;
  if (piece_index >= this.hold_queue.length) {
    piece_index = 0;
  }
  return piece_index;
};

Tetrino.prototype.nextPiece = function () {
  var piece_index = this.nextPieceIndex();
  var block_width = this.grid.block_width,
      block_height = this.grid.block_height;
  if (this.piece) {
    this.piece.removeFrom(this.grid.element);
  }
  var piece_matrix = this.hold_queue[piece_index],
      color_class = TetrinoRandomColor();
  var next_piece_index = (piece_index + 1) % this.hold_queue.length;
  var next_piece_matrix = this.hold_queue[next_piece_index];
  var next_piece = new TetrinoPiece(block_width, block_height, next_piece_matrix, color_class);
  this.piece = new TetrinoPiece(block_width, block_height, piece_matrix, color_class);
  this.piece.appendTo(this.grid.element);
  this.display.setNextPiece(next_piece);
  this.piece_index = piece_index;
};

Tetrino.prototype.checkLine = function () {
  for (var y = 0; y < this.grid.grid_height; y++) {
    for (var x = 0; x < this.grid.grid_width; x++) {
      if (!this.grid.blocks[x][y]) {
        break ;
      }
    }
    if (x == this.grid.grid_width) {
      for (var x = 0; x < this.grid.grid_width; x++) {
        this.grid.removeBlock(x, y);
      }
      for (var i = y; i >= 0; i--) {
        for (var j = 0; j < this.grid.grid_width; j++) {
          this.grid.blocks[j][i]  = this.grid.blocks[j][i - 1];
        }
      }
      this.grid.updateBlockPosition();
    }
  }
};

Tetrino.prototype.move = function (x, y) {
  var piece = this.piece,
      grid = this.grid;
  if (!piece) {
    return false;
  }
  if (x || y) {
    var cx = piece.x + x,
        cy = piece.y + y;
    if (grid.checkCollision(piece, cx, cy)) {
      piece.setPosition(cx, cy);
      return true;
    }
    else if (y == 1) {
      this.piece.putInGrid(this.grid);
      this.nextPiece();
      this.checkLine();
    }
  }
  return false;
};

Tetrino.prototype.rotate = function () {
  if (!this.piece) {
    return false;
  }
  if (this.grid.checkRotationCollision(this.piece)) {
    this.piece.rotate();
  }
};

Tetrino.prototype.buttonPress = function (button) {
  switch (button) {
  case TETRINO_BUTTON_LEFT:
    this.move(-1, 0);
    break ;
  case TETRINO_BUTTON_TOP:
    this.rotate();
    break ;
  case TETRINO_BUTTON_RIGHT:
    this.move(1, 0);
    break ;
  case TETRINO_BUTTON_BOTTOM:
    this.move(0, 1);
    break ;
  }
};

TetrinoMainMenu = function (callback) {
  TetrinoMenu.apply(this, arguments);
  this.addChoice(new TetrinoText("Play Now", undefined, undefined, 200, undefined),
    callback["play_now_func"]);
  this.addChoice(new TetrinoText("Options", undefined, undefined, 200, undefined),
    callback["options_func"]);
};

TetrinoMainMenu.prototype = new TetrinoMenu;

TetrinoGame = function (x, y, width, height) {
  TetrinoElement.call(this, x, y, width, height);
  this.controller = null;
  this.panel = null;
  this.setPanel(new TetrinoMainMenu({
    "play_now_func": TetrinoThisCall(this, this.startGame)
  }));
};

TetrinoGame.prototype = new TetrinoElement;

TetrinoGame.prototype.setController = function (controller) {
  if (controller) {
    if (!controller.init(this)) {
      return false;
    }
    controller.game = this;
  }
  if (this.controller) {
    if (this.controller.shutdown) {
      this.controller.shutdown();
    }
    this.controller = null;
  }
  this.controller = controller;
};

TetrinoGame.prototype.setPanel = function (panel_element) {
  if (this.panel) {
    if (this.panel.destroy) {
      this.panel.destroy();
    }
    this.panel = null;
  }
  if (panel_element) {
    if (panel_element.appendTo) {
      panel_element.appendTo(this.element);
    }
    this.panel = panel_element;
  }
};

TetrinoGame.prototype.startGame = function () {
  this.setPanel(new Tetrino(10, 22, 16, 16));
};

TetrinoGame.prototype.buttonPress = function (button) {
  if (this.panel) {
    this.panel.buttonPress(button);
  }
};

TetrinoKeybordController = function () {
  var self = this;
  window.addEventListener("keydown", function (e) {
    e = e || event;
    return self.onKeyDown(e.keyCode);
  }, true);
};

TetrinoKeybordController.prototype.init = function () {
  return true;
};

TetrinoKeybordController.prototype.onKeyDown = function (keycode) {
  if (!(keycode in TETRINO_KEYBOARD_MAP)) {
    return ;
  }
  var button = TETRINO_KEYBOARD_MAP[keycode];
  this.game.buttonPress(button);
  return ;
};

TetrinoPieces = [
  [
    [ 0, 0, 0, 0 ],
    [ 1, 1, 1, 1 ],
    [ 0, 0, 0, 0 ],
    [ 0, 0, 0, 0 ],
  ],
  [
    [ 0, 0, 0, 0 ],
    [ 0, 0, 1, 0 ],
    [ 1, 1, 1, 0 ],
    [ 0, 0, 0, 0 ],
  ],
  [
    [ 0, 0, 0, 0 ],
    [ 1, 0, 0, 0 ],
    [ 1, 1, 1, 0 ],
    [ 0, 0, 0, 0 ],
  ],
  [
    [ 1, 1 ],
    [ 1, 1 ],
  ],
  [
    [ 0, 0, 0, 0 ],
    [ 0, 1, 1, 0 ],
    [ 1, 1, 0, 0 ],
    [ 0, 0, 0, 0 ],
  ],
  [
    [ 0, 0, 0, 0 ],
    [ 1, 1, 0, 0 ],
    [ 0, 1, 1, 0 ],
    [ 0, 0, 0, 0 ],
  ],
  [
    [ 0, 0, 0, 0 ],
    [ 1, 1, 1, 0 ],
    [ 0, 1, 0, 0 ],
    [ 0, 0, 0, 0 ],
  ]
];

TetrinoBlockColors = [
  "TetrinoBlock-Blue",
  "TetrinoBlock-Orange",
  "TetrinoBlock-Red",
  "TetrinoBlock-Magenta",
  "TetrinoBlock-Yellow",
  "TetrinoBlock-Green",
  "TetrinoBlock-Grey",
];
