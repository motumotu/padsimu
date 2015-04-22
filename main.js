$(function() {
// 定数
const DROP_NUM = 6;    // ドロップの種類
const TILE_NUM = 2;    // タイルの種類
const WIDTH_NUM = 6;   // 横のドロップ数
const HEIGHT_NUM = 5;  // 縦のドロップ数
const TILE_SIZE = 40;  // タイルの大きさ

// 変数
var canvas;
var context;
var imgDrop = [];
var imgTile = [];
var board;
var haveDrop;
var preX;
var preY;
var mouseX;
var mouseY;
var comboNow;   // コンボ中か
var comboNum;   // コンボ数
var removePos;  // 消す位置

//-------------------------------------------------------
// ドロップクラス
//-------------------------------------------------------
// コンストラクタ
var Drop = function(color) {
    this.color = color;   // 種類
    this.alpha = 1;       // 透明度
    this.alive = true;    // 生きてるか
}
// メソッド
Drop.prototype = {
    // 更新処理
    update: function() {
        // 取り除く処理
        if (this.alive == false && this.alpha > 0) {
            this.alpha -= 0.05;
            if (this.alpha <= 0) this.remove();
        }
    },
    // 消す処理
    remove: function() {
        this.alpha = 0;
        this.alive = false;
        this.color = -1;
    }
};
//-------------------------------------------------------
// 初期処理
//-------------------------------------------------------
function init() {
    canvas = document.getElementById('canv'); // キャンバス読み込み
    context = canvas.getContext('2d');        // 描画用オブジェクト
    loadImage();                              // 画像読み込み
    initBoard();                              // 盤面初期化
    initRemovePos();                          // 消去用配列
    haveDrop = -1;                            // 持っているドロップ
    comboNum = 0;                             // コンボした数
    comboNow = false;                         // コンボ中か
    $('#combonum').val('');                   // コンボ数表示内容初期化
}
//-------------------------------------------------------
// 盤面初期化
//-------------------------------------------------------
function initBoard() {
    if(!board) board = new Array();
    for (var i = 0; i < HEIGHT_NUM; i++) {
        if (!board[i]) board[i] = new Array();
        for (var j = 0; j < WIDTH_NUM; j++) {
            var color = Math.floor(Math.random()*10000) % DROP_NUM; // 色
            board[i][j] = new Drop(color);                          // オブジェクトの生成
        }
    }
}
function initRemovePos() {
    if (!removePos) removePos = new Array();
    for (var i = 0; i < HEIGHT_NUM; i++) {
        if (!removePos[i]) removePos[i] = new Array();
        for (var j = 0; j < WIDTH_NUM; j++) {
            removePos[i][j] = false;
        }
    }
}
//-------------------------------------------------------
// 更新処理
//-------------------------------------------------------
function update() {
    //---- 更新処理
    for (var i = 0; i < HEIGHT_NUM; i++) {
        for (var j = 0; j < WIDTH_NUM; j++) {
            board[i][j].update();  // 盤面のドロップの更新
        }
    }
    // コンボ処理
    if (comboNow == true) {  // コンボ中か
        removeDrop();        // ドロップ消去処理
    }
    //---- 描画処理
    draw();
}
//-------------------------------------------------------
// 描画処理
//-------------------------------------------------------
function draw() {
    if (!canvas || !canvas.getContext) return false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    drawTile();
    drawDrop();
    drawHaveDrop();
}
//-------------------------------------------------------
// タイル描画
//-------------------------------------------------------
function drawTile() {
    for (var i = 0; i < HEIGHT_NUM; i++) {
        for (var j = 0; j < WIDTH_NUM; j++) {
            context.drawImage(imgTile[(i + j) % 2], TILE_SIZE * j, TILE_SIZE * i);
        }
    }
}
//-------------------------------------------------------
// ドロップ描画
//-------------------------------------------------------
function drawDrop() {
    for (var i = 0; i < HEIGHT_NUM; i++) {             // y座標
        for (var j = 0; j < WIDTH_NUM; j++) {          // x座標
            if (board[i][j].color == -1) continue;     // 空きマスなら無視
            context.globalAlpha = board[i][j].alpha;   // 透明度の変更
            context.drawImage(imgDrop[board[i][j].color],  TILE_SIZE * j,  TILE_SIZE * i); // 描画
        }
    }
    context.globalAlpha = 1;   // 透明度を元に戻す
}
//-------------------------------------------------------
// 持っているドロップ描画
//-------------------------------------------------------
function drawHaveDrop() {
    if (haveDrop == -1) return;
    context.drawImage(imgDrop[haveDrop],  mouseX - TILE_SIZE / 2,  mouseY - TILE_SIZE / 2);
}
//-------------------------------------------------------
// 画像読み込み処理
//-------------------------------------------------------
function loadImage() {
    for (var i = 0; i < DROP_NUM; i++) {
        imgDrop[i] = new Image();
        imgDrop[i].src = "image/drop_" + (i + 1) + ".png";
    }
    for (var i = 0; i < TILE_NUM; i++) {
        imgTile[i] = new Image();
        imgTile[i].src = "image/tile_" + (i + 1) + ".png";
    }
}
//-------------------------------------------------------
// マウスクリック処理
//-------------------------------------------------------
$('#canv').mousedown(function(e) {
    if (comboNow == true) return;              // コンボ中なら持てない
    mouseX = e.pageX - $(this).offset().left;  // マウスのx座標
    mouseY = e.pageY - $(this).offset().top;   // マウスのy座標
    var px = Math.floor(mouseX / TILE_SIZE);   // ドロップの位置x
    var py = Math.floor(mouseY / TILE_SIZE);   // ドロップの位置y
    if (haveDrop != -1) return;                // ドロップをすでにつかんでいたら以降の処理を無視
    haveDrop = board[py][px].color;            // 持っているドロップの色を保持
    board[py][px].color = -1;                  // 空マスにする
    preX = px;                                 // 前フレームのx座標
    preY = py;                                 // 前フレームのy座標
})
//-------------------------------------------------------
// マウス移動時処理
//-------------------------------------------------------
.mousemove(function(e) {
    if (comboNow == true) return;               // コンボ中ならドロップを掴めない
    mouseX = e.pageX - $(this).offset().left;   // マウスのx座標
    mouseY = e.pageY - $(this).offset().top;    // マウスのy座標
    var px = Math.floor(mouseX / TILE_SIZE);    // ドロップの位置x
    var py = Math.floor(mouseY / TILE_SIZE);    // ドロップの位置y
    if (px < 0 || px >= WIDTH_NUM || py < 0 || py >= HEIGHT_NUM) return; // 範囲外チェック
    if (haveDrop != -1 && (px != preX || py != preY)) {  // ドロップの移動判定
        var t = board[py][px];                  // 入れ替え処理
        board[py][px] = board[preY][preX];
        board[preY][preX] = t;
    }
    preX = px;                                  // 前フレームの座標x更新
    preY = py;                                  // 前フレームの座標y更新
})
//-------------------------------------------------------
// マウスクリック終了時処理
//-------------------------------------------------------
.mouseup(function(e) {
    if (comboNow == true) return;               // コンボ中なら処理をしない
    mouseX = e.pageX - $(this).offset().left;   // マウスのx座標
    mouseY = e.pageY - $(this).offset().top;    // マウスのy座標
    var px = Math.floor(mouseX / TILE_SIZE);    // ドロップの位置x
    var py = Math.floor(mouseY / TILE_SIZE);    // ドロップの位置y
    if (haveDrop == -1) return;                 // ドロップを持っていないなら以降の処理を無視
    board[py][px].color = haveDrop;             // 空マスにドロップを設置
    haveDrop = -1;                              // 手持ちのドロップを消去
    registRemovePos();                          // 削除するドロップの登録
    comboNow = true;                            // コンボ中か
    $('#combonum').val('0  コンボ');              // コンボ数表記
})
//-------------------------------------------------------
// 「再配置」ボタンクリック処理
//-------------------------------------------------------
$('#relocation').click(function() {
    comboNum = 0;
    initBoard();
    initRemovePos();
    $('#combonum').val('');
    comboNow = false;
});
//-------------------------------------------------------
// ウィンドウ読み込み時の処理
//-------------------------------------------------------
window.onload = function() {
    init();                     // 初期化処理
    setInterval(function() {    // 繰り返し処理
        update();               // ループ処理
    }, 17);                     // 待ち時間設定
}
//-------------------------------------------------------
// 取り除く場所の登録
//-------------------------------------------------------
function registRemovePos() {
    initRemovePos();                   // フラグ用の配列の初期化
    for (var i = HEIGHT_NUM - 1; i >= 0; i--) {
        for (var j = 0; j < WIDTH_NUM; j++) {
            registRemovePosOne(j, i);  // 消す場所の登録
        }
    }
}
//-------------------------------------------------------
// 取り除く場所の登録
//-------------------------------------------------------
function registRemovePosOne(x, y) {
    var dx = [0, 1, 0, -1];
    var dy = [-1, 0, 1, 0];

    for (var dire = 0; dire < 4; dire++) {
        for (var i = 1; ; i++) {
            var px = x + dx[dire] * i;
            var py = y + dy[dire] * i;
            if (px < 0 || px >= WIDTH_NUM || py < 0 || py >= HEIGHT_NUM) break;
            if (board[py][px].color != board[y][x].color) break;
            if (board[py][px].color == -1) break;
            if (i >= 2) {
                removePos[py][px] = true;
            }
            if (i == 2) {
                removePos[y][x] = true;
                removePos[y+dy[dire]][x+dx[dire]] = true;
            }
        }
    }
}
//-------------------------------------------------------
// 取り除く処理
//-------------------------------------------------------
function removeDrop() {
    for (var i = HEIGHT_NUM - 1; i >= 0; i--) {
        for (var j = 0; j < WIDTH_NUM; j++) {
            // 消してる途中なら
            if (removePos[i][j] == true && board[i][j].alive == false &&  board[i][j].alpha > 0) return;
            // 消す対象なら
            if (removePos[i][j] == true && board[i][j].alive == true && board[i][j].alpha == 1) {
                board[i][j].alive = false;
                removeDropAround(j, i, board[i][j].color);
                comboNum++;
                $('#combonum').val(comboNum+'  コンボ');
                return;
            }
        }
    }
    fallDrop();
}
function removeDropAround(x, y, color) {
    var dx = [0, 1, 0, -1];
    var dy = [-1, 0, 1, 0];
    for (var dire = 0; dire < 4; dire++) {
        var px = x + dx[dire];
        var py = y + dy[dire];
        if (px < 0 || px >= WIDTH_NUM || py < 0 || py >= HEIGHT_NUM) continue;
        if (removePos[py][px] == true && board[py][px].alive == true && board[py][px].color == color) {
            board[py][px].alive = false;
            removeDropAround(px, py, color);
        }
    }
}
//-------------------------------------------------------
// 落とす処理
//-------------------------------------------------------
function fallDrop() {
    var end = true;
    while (end) {
        end = false;
        for (var i = HEIGHT_NUM - 1; i >= 1; i--) {
            for (var j = 0; j < WIDTH_NUM; j++) {
                // 落ちるドロップをみつけたら
                if (board[i][j].alive == false && board[i - 1][j].alive == true) {
                    end = true;
                    var t = board[i][j];
                    board[i][j] = board[i - 1][j];
                    board[i - 1][j] = t;
                }
            }
        }
    }
    registRemovePos();  // 再登録
}
})