// 按键效果管理器
class KeyboardEffect {
    constructor() {
        this.container = document.getElementById('container');
        this.activeKeys = new Set(); // 当前按下的所有按键
        this.currentElement = null; // 当前显示的元素
        this.fadeTimer = null; // 淡出计时器
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        // 忽略重复按键（按住不放时浏览器会重复触发keydown）
        if (e.repeat) return;

        const key = e.key;
        this.activeKeys.add(key);
        
        // 清除之前的淡出计时器
        clearTimeout(this.fadeTimer);
        
        // 如果已有显示元素，先移除
        if (this.currentElement) {
            this.currentElement.remove();
        }
        
        // 创建新元素显示组合键
        this.currentElement = this.createComboElement();
        this.container.appendChild(this.currentElement);
        
        // 生成星星效果
        this.createStars(this.currentElement);
    }

    handleKeyUp(e) {
        const key = e.key;
        this.activeKeys.delete(key);
        
        const isModifier = ['Control', 'Alt'].includes(key);
        
        clearTimeout(this.fadeTimer);
        
        if (this.activeKeys.size > 0) {
            if (isModifier) {
                // 松开修饰键，保持当前显示，启动淡出
                this.startFadeOut();
            } else {
                // 松开普通键，更新显示
                this.updateDisplay();
            }
        } else {
            // 所有按键都松开，开始淡出
            this.startFadeOut();
        }
    }

    startFadeOut() {
        if (!this.currentElement) return;
        
        this.currentElement.classList.remove('pressed');
        
        this.fadeTimer = setTimeout(() => {
            if (this.currentElement) {
                this.currentElement.classList.add('fade-out');
                this.currentElement.addEventListener('transitionend', () => {
                    this.removeCurrentElement();
                }, { once: true });
            }
        }, 1000);
    }

    updateDisplay() {
        if (this.currentElement) {
            this.currentElement.remove();
        }
        this.currentElement = this.createComboElement();
        this.container.appendChild(this.currentElement);
    }

    removeCurrentElement() {
        if (this.currentElement) {
            clearTimeout(this.fadeTimer);
            this.currentElement.remove();
            this.currentElement = null;
        }
    }

    createStars(element) {
        const starCount = 6;
        const rect = element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // 从方块边缘随机位置出发
            const side = Math.floor(Math.random() * 4);  // 0:上, 1:右, 2:下, 3:左
            let startX, startY;
            
            switch(side) {
                case 0:  // 上边
                    startX = rect.left - containerRect.left + Math.random() * rect.width;
                    startY = rect.top - containerRect.top;
                    break;
                case 1:  // 右边
                    startX = rect.right - containerRect.left;
                    startY = rect.top - containerRect.top + Math.random() * rect.height;
                    break;
                case 2:  // 下边
                    startX = rect.left - containerRect.left + Math.random() * rect.width;
                    startY = rect.bottom - containerRect.top;
                    break;
                case 3:  // 左边
                    startX = rect.left - containerRect.left;
                    startY = rect.top - containerRect.top + Math.random() * rect.height;
                    break;
            }
            
            // 随机初始速度（向外扩散）
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 2;  // 稍微向上偏移
            
            // 随机大小
            const size = 10 + Math.random() * 8;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // 随机颜色（紫蓝色调）
            const colors = [
                '#AA00FF',  // 亮紫色
                '#9600FF',  // 紫色
                '#7c3aed',  // 深紫色
                '#6F00FF',  // 蓝紫色
                '#5512FB',  // 电光蓝紫
                '#3C00FF',  // 蓝色
                '#6366f1',  // 靛蓝色
                '#a855f7',  // 柔和紫色
                '#9900ff',  // 薰衣草紫
                '#30cfff',  // 天蓝色
                '#2563eb',  // 皇家蓝
                '#c4b5fd',  // 淡紫色
            ];
            star.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            // 设置初始位置
            star.style.left = `${startX}px`;
            star.style.top = `${startY}px`;
            
            this.container.appendChild(star);
            
            // 使用 JavaScript 动画
            this.animateStar(star, startX, startY, vx, vy);
        }
    }

    animateStar(star, x, y, vx, vy) {
        const gravity = 0.2;  // 重力加速度
        let opacity = 1;
        const fadeSpeed = 0.015;  // 淡出速度
        
        const animate = () => {
            // 更新位置
            x += vx;
            y += vy;
            vy += gravity;  // 重力作用
            
            // 更新透明度
            opacity -= fadeSpeed;
            
            // 设置位置和透明度
            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            star.style.opacity = opacity;
            
            // 检查是否结束
            if (opacity > 0 && y < this.container.offsetHeight + 50) {
                requestAnimationFrame(animate);
            } else {
                star.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }

    createComboElement() {
        const element = document.createElement('div');
        element.className = 'key pressed';
        element.textContent = this.getComboText();
        
        // 动态调整宽度（仅组合键需要）
        if (element.textContent.length > 3) {
            element.style.width = `${Math.max(80, element.textContent.length * 18 + 32)}px`;
        }
        
        return element;
    }

    getComboText() {
        // 按照修饰键在前，普通键在后的顺序排列
        const modifierOrder = ['Control', 'Shift', 'Alt', 'Meta'];
        const modifiers = [];
        const normalKeys = [];
        
        this.activeKeys.forEach(key => {
            if (modifierOrder.includes(key)) {
                modifiers.push(key);
            } else {
                normalKeys.push(key);
            }
        });
        
        // 按修饰键顺序排序
        modifiers.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b));
        
        // 只有当包含Ctrl或Alt时才显示组合键格式
        const hasComboModifier = modifiers.includes('Control') || modifiers.includes('Alt');
        
        if (hasComboModifier && normalKeys.length > 0) {
            // 组合键：修饰键 + 最后一个普通键
            const lastNormalKey = normalKeys[normalKeys.length - 1];
            const allKeys = [...modifiers, lastNormalKey];
            const displayTexts = allKeys.map(key => this.getDisplayKey(key));
            return displayTexts.join('+');
        } else if (modifiers.length > 0 && normalKeys.length === 0) {
            // 只有修饰键
            return modifiers.map(key => this.getDisplayKey(key)).join('+');
        } else {
            // 只有普通键，显示最后一个
            const lastKey = normalKeys[normalKeys.length - 1];
            return this.getDisplayKey(lastKey);
        }
    }

    getDisplayKey(key) {
        // 特殊按键显示
        const specialKeys = {
            ' ': 'Space',
            'Enter': 'Enter',
            'Backspace': 'Backspace',
            'Tab': 'Tab',
            'Shift': 'Shift',
            'Control': 'Ctrl',
            'Alt': 'Alt',
            'Escape': 'Esc',
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'Meta': 'Win'
        };
        
        return specialKeys[key] || key.toUpperCase();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new KeyboardEffect();
});