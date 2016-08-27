/**
 * 优先使用requestAnimationFrame实现动画
 * 不支持的浏览器降级使用 setTimeout
 * 建议对运动元素增加 (-webkit-)transform: translate3d(0, 0, 0) 开启GPU硬件加速以获得更好的性能
 */
var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(fun) {setTimeout(fun, 1000 / 60);};

/**
 * 抛物线运动组件
 * 本组件使用CommonJS形式编写
 * @param element 元素
 * @param params 参数
 * startPos - 抛物线起始坐标(x,y)
 * endPos - 抛物线终点坐标(x,y)
 * callback - 运动结束后回调函数
 */
exports.parabola = function(element, params) {
    params = params || {};

    var startPos = params.startPos;
    var endPos = params.endPos;
    var callback = params.callback;

    var x1 = startPos.x;
    var x2 = endPos.x;
    var y1 = startPos.y;
    var y2 = endPos.y;

    /**
     * (x1, y1) - 起点坐标   (x2, y2) - 终点坐标
     * 将原点(0, 0)移动到起点坐标处, 使其成为从原点开始的平抛运动
     * 此时, 起点坐标为(0, 0), 终点坐标为 (x2 - x1, y2 - y1), web坐标向下为正, 所以抛物线开头向下,但a值为正
     * 抛物线公式: y = (endY / Math.pow(endX, 2)) * x * x
     */
    var endX = x2 - x1;
    var endY = y2 - y1;

    /* 重力加速度 (模拟值) */
    var g = 0.2;

    /* 水平速度 (模拟值) */
    var s = 6;

    /**
     * 运动模式
     * 0 - 水平位移 < 垂直位移  以y为主,推算x, 自由落体优先
     * 1 - 水平位移 > 垂直位移  以x为主,推算y, 水平匀速优先
     */
    var mode = Math.abs(endX) < Math.abs(endY) ? 0 : 1;

    var directionX, directionY;
    if (endX > 0) {
        directionX = 'R';       // 向右
    } else if (endX < 0) {
        directionX = 'L';       // 向左
    }

    if (endY > 0) {
        directionY = 'D';       // 向下
    } else if (endY < 0) {
        directionY = 'U';       // 向上
    }

    var a = endY / Math.pow(endX, 2);

    element.style.left = x1 + 'px';
    element.style.top = y1 + 'px';

    var x = 0, y, tick = 0;

    function run() {
        tick++;

        if (mode == 0) {
            y = g * tick * tick;            // 纵向: 匀加速直线运动
            x = Math.sqrt(Math.abs(y / a));     // 横向, 根据y值反推, 匀速直线
        } else {
            x = Math.abs(x) + s;
            y = Math.abs(a) * x * x;
        }
        if (directionX == 'L') {
            x = -x;
        }
        if (directionY == 'U') {
            y = -y;
        }

        element.style.left = (x + x1) + 'px';
        element.style.top = (y + y1) + 'px';

        /* 根据y值判断动画是否结束 */
        if (directionY == 'D' && y < endY || directionY == 'U' && y > endY) {
            raf(run);
        } else {
            if (typeof callback === 'function') {
                callback();
            }
        }
    }

    raf(run);
};