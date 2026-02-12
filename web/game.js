// ========== 游戏配置 ==========
const CONFIG = {
    CANVAS_WIDTH: 960,
    CANVAS_HEIGHT: 640,
    TILE_SIZE: 32,
    PLAYER_SPEED: 3,
    PLAYER_DASH_SPEED: 8,
    PLAYER_DASH_DURATION: 200,
    ENEMY_SPEED: 1.5,
    BULLET_SPEED: 8,
    ENEMY_SPAWN_DELAY: 1000,
    TOTAL_FLOORS: 10,
    BOSS_FLOORS: [3, 7, 10] // Boss关卡
};

// ========== 资源管理器 ==========
const Assets = {
    images: {},
    loaded: false,

    load() {
        return new Promise((resolve) => {
            const imagesToLoad = [
                { key: 'character', src: 'assets/roguelikeChar_transparent.png' },
                { key: 'sheet', src: 'assets/sheet_white2x.png' }
            ];

            let loadedCount = 0;
            const total = imagesToLoad.length;

            // 超时保护：3秒后无论如何都resolve
            const timeout = setTimeout(() => {
                console.warn('⚠️ 素材加载超时，使用像素绘制模式');
                resolve();
            }, 3000);

            const checkDone = () => {
                loadedCount++;
                if (loadedCount >= total) {
                    clearTimeout(timeout);
                    this.loaded = true;
                    console.log('🎨 素材处理完成');
                    resolve();
                }
            };

            imagesToLoad.forEach(item => {
                const img = new Image();
                img.onload = () => {
                    console.log(`✅ 加载成功: ${item.key} (${img.width}x${img.height})`);
                    checkDone();
                };
                img.onerror = () => {
                    console.warn(`⚠️ 加载失败: ${item.src}（将使用像素绘制）`);
                    checkDone();
                };
                img.src = item.src;
                this.images[item.key] = img;
            });
        });
    }
};

// ========== 职业系统 ==========
const CLASSES = {
    warrior: {
        id: 'warrior',
        name: '战士',
        icon: '⚔️',
        desc: '近战高攻，生命值高',
        skill: '挥砍 — 大范围弧形斩击',
        baseHp: 120,
        baseDamage: 25,
        baseSpeed: 2.8,
        weaponType: 'slash',
        weaponColor: '#ef4444',
        advances: ['berserker', 'paladin']
    },
    mage: {
        id: 'mage',
        name: '法师',
        icon: '🔮',
        desc: '远程魔法，攻速快',
        skill: '魔法弹 — 高速远程投射',
        baseHp: 80,
        baseDamage: 30,
        baseSpeed: 3.2,
        weaponType: 'magic',
        weaponColor: '#a855f7',
        advances: ['archmage', 'elementalist']
    },
    ranger: {
        id: 'ranger',
        name: '游侠',
        icon: '🎯',
        desc: '灵活机动，多段攻击',
        skill: '扇形三连射 — 箭矢散射',
        baseHp: 100,
        baseDamage: 20,
        baseSpeed: 3.5,
        weaponType: 'projectile',
        weaponColor: '#10b981',
        advances: ['sniper', 'shadowblade']
    },
    beastmaster: {
        id: 'beastmaster',
        name: '牛哥',
        icon: '🐂',
        desc: '召唤猛牛冲撞，驯兽为战',
        skill: '召唤牛 — 牛朝敌人冲锋',
        baseHp: 110,
        baseDamage: 18,
        baseSpeed: 2.6,
        weaponType: 'summon_bull',
        weaponColor: '#92400e',
        advances: ['bullking', 'wildlord']
    },
    priest: {
        id: 'priest',
        name: '祭司',
        icon: '💫',
        desc: '神圣光芒，攻击同时治疗',
        skill: '圣光弹 — 命中回复少量HP',
        baseHp: 95,
        baseDamage: 22,
        baseSpeed: 2.9,
        weaponType: 'holy',
        weaponColor: '#facc15',
        advances: ['bishop', 'oracle']
    },
    ninja: {
        id: 'ninja',
        name: '忍者',
        icon: '🌀',
        desc: '极速手里剑，闪避如风',
        skill: '手里剑 — 极速连发飞镖',
        baseHp: 75,
        baseDamage: 15,
        baseSpeed: 4.0,
        weaponType: 'shuriken',
        weaponColor: '#64748b',
        advances: ['kage', 'samurai']
    },
    swordchild: {
        id: 'swordchild',
        name: '十年剑童',
        icon: '🗡️',
        desc: '御剑飞行，一剑追敌',
        skill: '飞剑 — 自动追踪敌人的飞剑（一次一把）',
        baseHp: 90,
        baseDamage: 35,
        baseSpeed: 3.0,
        weaponType: 'flying_sword',
        weaponColor: '#38bdf8',
        advances: ['swordmaster', 'swordsaint']
    }
};

const ADVANCED_CLASSES = {
    berserker: {
        id: 'berserker',
        name: '狂战士',
        icon: '🔥',
        desc: '狂暴之力，伤害暴增',
        skill: '重斩 — 超级重型挥砍',
        baseHp: 140,
        baseDamage: 35,
        baseSpeed: 3.0,
        weaponType: 'heavy_slash',
        weaponColor: '#dc2626',
        from: 'warrior'
    },
    paladin: {
        id: 'paladin',
        name: '圣骑士',
        icon: '✨',
        desc: '圣光守护，自带治疗',
        skill: '圣光斩 — 神圣近战斩击',
        baseHp: 150,
        baseDamage: 28,
        baseSpeed: 2.8,
        weaponType: 'holy_slash',
        weaponColor: '#fbbf24',
        from: 'warrior'
    },
    archmage: {
        id: 'archmage',
        name: '大法师',
        icon: '⚡',
        desc: '魔力激增，弹幕更密',
        skill: '奥术弹幕 — 密集魔法弹',
        baseHp: 90,
        baseDamage: 40,
        baseSpeed: 3.2,
        weaponType: 'arcane',
        weaponColor: '#8b5cf6',
        from: 'mage'
    },
    elementalist: {
        id: 'elementalist',
        name: '元素使',
        icon: '🌊',
        desc: '元素融合，附加效果',
        skill: '元素弹 — 多元素融合攻击',
        baseHp: 85,
        baseDamage: 32,
        baseSpeed: 3.3,
        weaponType: 'elemental',
        weaponColor: '#06b6d4',
        from: 'mage'
    },
    sniper: {
        id: 'sniper',
        name: '狙击手',
        icon: '🎯',
        desc: '精准射击，暴击率高',
        skill: '狙击 — 超远程穿透射击',
        baseHp: 95,
        baseDamage: 45,
        baseSpeed: 3.4,
        weaponType: 'snipe',
        weaponColor: '#f59e0b',
        from: 'ranger'
    },
    shadowblade: {
        id: 'shadowblade',
        name: '影刃',
        icon: '🗡️',
        desc: '暗影刺客，暴击必杀',
        skill: '暗影飞刃 — 极速穿刺',
        baseHp: 105,
        baseDamage: 25,
        baseSpeed: 4.0,
        weaponType: 'shadow',
        weaponColor: '#6366f1',
        from: 'ranger'
    },
    bullking: {
        id: 'bullking',
        name: '牛魔王',
        icon: '👑🐂',
        desc: '牛群暴走，大范围碾压',
        skill: '牛群冲锋 — 召唤多头牛',
        baseHp: 140,
        baseDamage: 28,
        baseSpeed: 2.8,
        weaponType: 'summon_herd',
        weaponColor: '#78350f',
        from: 'beastmaster'
    },
    wildlord: {
        id: 'wildlord',
        name: '荒野之主',
        icon: '🦁',
        desc: '驯服万兽，多种召唤',
        skill: '万兽齐奔 — 随机野兽突袭',
        baseHp: 120,
        baseDamage: 22,
        baseSpeed: 3.0,
        weaponType: 'summon_wild',
        weaponColor: '#65a30d',
        from: 'beastmaster'
    },
    bishop: {
        id: 'bishop',
        name: '大主教',
        icon: '✝️',
        desc: '圣光普照，范围治愈',
        skill: '圣光爆发 — 大范围神圣伤害',
        baseHp: 110,
        baseDamage: 30,
        baseSpeed: 2.9,
        weaponType: 'holy_burst',
        weaponColor: '#eab308',
        from: 'priest'
    },
    oracle: {
        id: 'oracle',
        name: '神谕者',
        icon: '🔮✨',
        desc: '预见命运，追踪导弹',
        skill: '神谕之箭 — 自动追踪敌人',
        baseHp: 90,
        baseDamage: 35,
        baseSpeed: 3.1,
        weaponType: 'homing',
        weaponColor: '#d946ef',
        from: 'priest'
    },
    kage: {
        id: 'kage',
        name: '影',
        icon: '👤',
        desc: '分身幻术，难以捕捉',
        skill: '影分身 — 多方向手里剑',
        baseHp: 80,
        baseDamage: 20,
        baseSpeed: 4.5,
        weaponType: 'shadow_clone',
        weaponColor: '#1e1b4b',
        from: 'ninja'
    },
    samurai: {
        id: 'samurai',
        name: '侍',
        icon: '⛩️',
        desc: '一刀必杀，武士之道',
        skill: '居合斩 — 蓄力超远斩击',
        baseHp: 100,
        baseDamage: 40,
        baseSpeed: 3.5,
        weaponType: 'iai_slash',
        weaponColor: '#dc2626',
        from: 'ninja'
    },
    swordmaster: {
        id: 'swordmaster',
        name: '剑圣',
        icon: '⚔️✨',
        desc: '万剑归宗，三剑齐飞',
        skill: '三剑齐飞 — 同时操控三把追踪飞剑',
        baseHp: 100,
        baseDamage: 40,
        baseSpeed: 3.2,
        weaponType: 'flying_sword_tri',
        weaponColor: '#0ea5e9',
        from: 'swordchild'
    },
    swordsaint: {
        id: 'swordsaint',
        name: '御剑仙人',
        icon: '🌟⚔️',
        desc: '剑气纵横，破碎虚空',
        skill: '剑气爆裂 — 飞剑命中后爆炸伤害周围敌人',
        baseHp: 95,
        baseDamage: 45,
        baseSpeed: 3.0,
        weaponType: 'flying_sword_burst',
        weaponColor: '#7dd3fc',
        from: 'swordchild'
    }
};

// ========== 存档系统 ==========
class SaveSystem {
    static save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static load(key, defaultValue = 0) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    static get coins() {
        return this.load('mermer_coins', 0);
    }

    static set coins(value) {
        this.save('mermer_coins', value);
    }

    static get totalRuns() {
        return this.load('mermer_runs', 0);
    }

    static set totalRuns(value) {
        this.save('mermer_runs', value);
    }

    static get victories() {
        return this.load('mermer_victories', 0);
    }

    static set victories(value) {
        this.save('mermer_victories', value);
    }
}

// ========== 奖励数据 ==========
const REWARDS = [
    // 普通 (rarity 1)
    { id: 1, name: '生命强化', desc: '最大生命值 +30', icon: '❤️', rarity: 1, effect: (p) => { p.maxHp += 30; p.hp = p.maxHp; } },
    { id: 2, name: '力量增强', desc: '攻击伤害 +5', icon: '⚔️', rarity: 1, effect: (p) => p.damage += 5 },
    { id: 3, name: '紧急治疗', desc: '恢复 50% 生命值', icon: '💚', rarity: 1, effect: (p) => p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.5) },
    { id: 4, name: '迅捷之靴', desc: '移动速度 +0.5', icon: '👟', rarity: 1, effect: (p) => p.speed += 0.5 },
    { id: 11, name: '铁皮', desc: '护甲 +3', icon: '🪖', rarity: 1, effect: (p) => p.armor += 3 },
    { id: 12, name: '射速强化', desc: '攻击速度 +15%', icon: '⏩', rarity: 1, effect: (p) => p.attackSpeedMult = (p.attackSpeedMult || 1) * 0.85 },
    // 稀有 (rarity 2)
    { id: 5, name: '暴击精通', desc: '暴击率 +15%', icon: '💥', rarity: 2, effect: (p) => p.critChance += 0.15 },
    { id: 6, name: '吸血之触', desc: '吸血 +10%', icon: '🩸', rarity: 2, effect: (p) => p.lifeSteal += 0.1 },
    { id: 7, name: '坚韧护盾', desc: '最大生命 +50，恢复满血', icon: '🛡️', rarity: 2, effect: (p) => { p.maxHp += 50; p.hp = p.maxHp; } },
    { id: 8, name: '狂怒之力', desc: '攻击伤害 +10', icon: '🔥', rarity: 2, effect: (p) => p.damage += 10 },
    { id: 13, name: '弹幕扩散', desc: '子弹数量 +1', icon: '🌟', rarity: 2, effect: (p) => p.extraBullets = (p.extraBullets || 0) + 1 },
    { id: 14, name: '穿透射击', desc: '子弹可穿透1个敌人', icon: '🔱', rarity: 2, effect: (p) => p.pierceCount = (p.pierceCount || 0) + 1 },
    { id: 15, name: '反弹护甲', desc: '受击时反弹伤害', icon: '💠', rarity: 2, effect: (p) => p.thornsDamage = (p.thornsDamage || 0) + 5 },
    { id: 18, name: '近战扩张', desc: '近战攻击范围 +25', icon: '💢', rarity: 2, effect: (p) => { p.slashRange = (p.slashRange || 80) + 25; } },
    { id: 19, name: '远程增幅', desc: '远程射程 +100', icon: '🎯', rarity: 2, effect: (p) => { p.rangedRange = (p.rangedRange || 350) + 100; } },
    { id: 20, name: '巨型子弹', desc: '子弹体积+50%，伤害+20%', icon: '🔴', rarity: 2, effect: (p) => { p.bulletSizeMult = (p.bulletSizeMult || 1) * 1.5; p.bulletDamageMult = (p.bulletDamageMult || 1) * 1.2; } },
    { id: 22, name: '金币磁铁', desc: '自动吸收附近金币', icon: '🧲', rarity: 2, effect: (p) => { p.magnetRange = 120; } },
    // 史诗 (rarity 3)
    { id: 9, name: '神圣恩赐', desc: '最大生命 +100，完全治疗', icon: '✨', rarity: 3, effect: (p) => { p.maxHp += 100; p.hp = p.maxHp; } },
    { id: 10, name: '破坏之力', desc: '攻击伤害 +20', icon: '⚡', rarity: 3, effect: (p) => p.damage += 20 },
    { id: 16, name: '死神镰刀', desc: '暴击伤害 3倍', icon: '💀', rarity: 3, effect: (p) => p.critMultiplier = 3 },
    { id: 17, name: '不灭之魂', desc: '死亡时复活一次(50%血)', icon: '👼', rarity: 3, effect: (p) => p.revive = true },
    { id: 21, name: '多重射击', desc: '子弹数+2，伤害减半（可叠加）', icon: '💨', rarity: 3, effect: (p) => { p.multiShot = (p.multiShot || 1) + 1; } },
    { id: 23, name: '嗜血狂暴', desc: '击杀后2秒内攻速+100%', icon: '🩸', rarity: 3, effect: (p) => { p.berserkerMode = true; } },
];

const SHOP_ITEMS = [
    { id: 1, name: '治疗药水', desc: '恢复 50 点生命', icon: '❤️', price: 15, effect: (p) => p.hp = Math.min(p.maxHp, p.hp + 50) },
    { id: 2, name: '磨刀石', desc: '攻击伤害 +3', icon: '⚔️', price: 30, effect: (p) => p.damage += 3 },
    { id: 3, name: '护甲片', desc: '减伤 +2', icon: '🛡️', price: 25, effect: (p) => p.armor += 2 },
    { id: 4, name: '大力丸', desc: '攻击伤害 +8', icon: '💪', price: 60, effect: (p) => p.damage += 8 },
    { id: 5, name: '满血药水', desc: '完全恢复生命', icon: '💖', price: 45, effect: (p) => p.hp = p.maxHp },
];

// ========== 伤害飘字系统 ==========
class DamageText {
    constructor(x, y, text, color = '#fff', isCrit = false) {
        this.x = x + (Math.random() - 0.5) * 20;
        this.y = y;
        this.text = text;
        this.color = color;
        this.isCrit = isCrit;
        this.life = 60; // 持续帧数
        this.maxLife = 60;
        this.vy = -2;
    }

    update() {
        this.y += this.vy;
        this.vy *= 0.95;
        this.life--;
        return this.life > 0;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = this.isCrit ? 'bold 20px monospace' : 'bold 14px monospace';
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        if (this.isCrit) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText(this.text, this.x, this.y);
            ctx.fillText(this.text, this.x, this.y);
        }
        ctx.restore();
    }
}

// ========== 击杀特效粒子 ==========
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.color = color;
        this.life = 30 + Math.random() * 20;
        this.maxLife = this.life;
        this.size = 2 + Math.random() * 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.life--;
        return this.life > 0;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

// ========== 实体基类 ==========
class Entity {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    collidesWith(other) {
        return Math.abs(this.x - other.x) < (this.size + other.size) / 2 &&
            Math.abs(this.y - other.y) < (this.size + other.size) / 2;
    }
}

// ========== 玩家 ==========
class Player extends Entity {
    constructor(x, y, classData = null) {
        super(x, y, 32, '#5b8def'); // 从24改为32

        // 职业数据
        this.classData = classData || CLASSES.warrior;
        this.className = this.classData.name;
        this.weaponType = this.classData.weaponType;
        this.weaponColor = this.classData.weaponColor;

        // 基础属性（受职业影响）
        this.maxHp = this.classData.baseHp;
        this.hp = this.maxHp;
        this.damage = this.classData.baseDamage;
        this.speed = this.classData.baseSpeed;
        this.critChance = 0;
        this.lifeSteal = 0;
        this.armor = 0;
        this.isDashing = false;
        this.dashTime = 0;
        this.coins = 0;
        this.shootCooldown = 0;
        this.berserkerTimer = 0; // 嗜血狂暴计时器
    }

    update(keys) {
        // 冲刺
        if (this.isDashing) {
            this.dashTime -= 16;
            if (this.dashTime <= 0) {
                this.isDashing = false;
            }
        }

        // 嗜血狂暴计时
        if (this.berserkerTimer > 0) {
            this.berserkerTimer--;
        }

        // 移动
        let moveSpeed = this.isDashing ? CONFIG.PLAYER_DASH_SPEED : this.speed;
        this.vx = 0;
        this.vy = 0;

        if (keys['w'] || keys['ArrowUp']) this.vy = -moveSpeed;
        if (keys['s'] || keys['ArrowDown']) this.vy = moveSpeed;
        if (keys['a'] || keys['ArrowLeft']) this.vx = -moveSpeed;
        if (keys['d'] || keys['ArrowRight']) this.vx = moveSpeed;

        // 归一化对角线速度
        if (this.vx !== 0 && this.vy !== 0) {
            this.vx *= 0.707;
            this.vy *= 0.707;
        }

        super.update();

        // 边界限制
        const margin = 40;
        this.x = Math.max(margin, Math.min(CONFIG.CANVAS_WIDTH - margin, this.x));
        this.y = Math.max(margin, Math.min(CONFIG.CANVAS_HEIGHT - margin, this.y));

        // 冷却时间递减
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    dash() {
        if (!this.isDashing && (this.vx !== 0 || this.vy !== 0)) {
            this.isDashing = true;
            this.dashTime = CONFIG.PLAYER_DASH_DURATION;
        }
    }

    // 计算调整后的攻击冷却（应用攻速和嗜血狂暴效果）
    getAdjustedCooldown(baseCooldown) {
        let cooldown = baseCooldown;

        // 攻速加成
        if (this.attackSpeedMult) {
            cooldown *= this.attackSpeedMult;
        }

        // 嗜血狂暴（击杀后2秒内攻速翻倍）
        if (this.berserkerMode && this.berserkerTimer > 0) {
            cooldown *= 0.5;
        }

        return Math.max(1, Math.floor(cooldown));
    }

    // 击杀敌人时调用（触发嗜血狂暴）
    onKillEnemy() {
        if (this.berserkerMode) {
            this.berserkerTimer = 120; // 2秒（60fps * 2）
        }
    }

    shoot(targetX, targetY, bullets, gameInstance = null) {
        // 冷却时间检查
        if (this.shootCooldown > 0) {
            return;
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const dirX = dx / dist;
            const dirY = dy / dist;

            // 根据武器类型创建不同的攻击效果
            switch (this.weaponType) {
                case 'slash': // 战士-挥砍（近战范围攻击）
                case 'heavy_slash': // 狂战士
                case 'holy_slash': // 圣骑士
                    this.createSlashAttack(dirX, dirY, bullets, gameInstance);
                    this.shootCooldown = this.getAdjustedCooldown(25); // 近战慢速重击
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('slash');
                    break;

                case 'magic': // 法师-魔法弹
                case 'arcane': // 大法师
                    this.createMagicAttack(dirX, dirY, bullets);
                    this.shootCooldown = this.getAdjustedCooldown(18); // 法师中速
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('magic');
                    break;

                case 'elemental': // 元素使
                    this.createElementalAttack(dirX, dirY, bullets);
                    this.shootCooldown = this.getAdjustedCooldown(20); // 元素稍慢
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('magic');
                    break;

                case 'projectile': // 游侠-多段
                    this.createProjectileAttack(dirX, dirY, bullets);
                    this.shootCooldown = this.getAdjustedCooldown(22); // 游侠适中
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('arrow');
                    break;

                case 'snipe': // 狙击手
                    this.createSnipeAttack(dirX, dirY, bullets);
                    this.shootCooldown = this.getAdjustedCooldown(40); // 狙击最慢高伤
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('arrow');
                    break;

                case 'shadow': // 影刃
                    this.createShadowAttack(dirX, dirY, bullets);
                    this.shootCooldown = this.getAdjustedCooldown(10); // 影刃快攻
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('shuriken');
                    break;

                case 'summon_bull': // 牛哥-召唤牛
                case 'summon_herd': // 牛魔王-牛群
                case 'summon_wild': // 荒野之主-万兽
                    this.createSummonAttack(dirX, dirY, bullets, gameInstance);
                    this.shootCooldown = this.getAdjustedCooldown(this.weaponType === 'summon_herd' ? 28 : this.weaponType === 'summon_wild' ? 25 : 35);
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('summon');
                    break;

                case 'holy': // 祭司-圣光弹
                case 'holy_burst': // 大主教-圣光爆发
                    this.createHolyAttack(dirX, dirY, bullets, gameInstance);
                    this.shootCooldown = this.getAdjustedCooldown(this.weaponType === 'holy_burst' ? 22 : 20);
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('holy');
                    break;

                case 'homing': // 神谕者-追踪弹
                    this.createHomingAttack(dirX, dirY, bullets, gameInstance);
                    this.shootCooldown = this.getAdjustedCooldown(30);
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('magic');
                    break;

                case 'shuriken': // 忍者-手里剑
                case 'shadow_clone': // 影-影分身
                    this.createShurikenAttack(dirX, dirY, bullets);
                    this.shootCooldown = this.getAdjustedCooldown(this.weaponType === 'shadow_clone' ? 6 : 8);
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('shuriken');
                    break;

                case 'iai_slash': // 侍-居合斩
                    this.createIaiSlash(dirX, dirY, bullets, gameInstance);
                    this.shootCooldown = this.getAdjustedCooldown(45);
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('slash');
                    break;

                case 'flying_sword': // 十年剑童-飞剑
                case 'flying_sword_tri': // 剑圣-三剑
                case 'flying_sword_burst': // 御剑仙人-爆裂剑
                    this.createFlyingSwordAttack(dirX, dirY, bullets, gameInstance);
                    this.shootCooldown = this.getAdjustedCooldown(this.weaponType === 'flying_sword_tri' ? 20 : 40);
                    if (gameInstance && gameInstance.music) gameInstance.music.playSFX('sword');
                    break;

                default:
                    const bullet = new Bullet(this.x, this.y, dirX, dirY, this.damage, true, this.weaponColor);
                    bullets.push(bullet);
                    this.shootCooldown = 20;
            }
        }
    }

    createSlashAttack(dirX, dirY, bullets, gameInstance) {
        // 近战挥砍 — 大范围短距弧形斩击
        const angle = Math.atan2(dirY, dirX);
        const slashRange = this.slashRange || 80; // 斩击范围（支持奖励增强）
        const slashArc = Math.PI * 1.0; // 弧度范围（180度半圆）

        // 对范围内敌人直接造成伤害（真正的近战）
        // 优先使用传入的gameInstance，否则尝试全局game
        const game = gameInstance || (typeof window !== 'undefined' && window.game);

        if (game && game.enemies) {
            // 反向遍历避免splice导致索引错误
            for (let i = game.enemies.length - 1; i >= 0; i--) {
                const enemy = game.enemies[i];
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= slashRange) {
                    const enemyAngle = Math.atan2(dy, dx);
                    let angleDiff = enemyAngle - angle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    if (Math.abs(angleDiff) <= slashArc / 2) {
                        const isCrit = Math.random() < this.critChance;
                        const critMult = this.critMultiplier || 2;
                        const dmg = this.damage * (isCrit ? critMult : 1);
                        if (enemy.takeDamage(dmg)) {
                            for (let k = 0; k < 8; k++) {
                                game.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
                            }
                            game.enemies.splice(i, 1);
                            game.stats.kills++;
                            this.onKillEnemy(); // 触发击杀效果（嗜血狂暴等）
                            const coinDrop = (enemy.isBoss ? 15 : 5) + Math.floor(Math.random() * 5);
                            this.coins += coinDrop;
                            game.stats.coinsEarned += coinDrop;
                            game.damageTexts.push(new DamageText(enemy.x, enemy.y + 10, '+' + coinDrop + '🪙', '#fbbf24'));
                            if (this.lifeSteal > 0) this.heal(dmg * this.lifeSteal);
                        }
                        game.damageTexts.push(new DamageText(enemy.x, enemy.y - 10,
                            Math.floor(dmg).toString(), isCrit ? '#fbbf24' : '#fff', isCrit));
                    }
                }
            }
        }

        // ===== 战士近战抵消敌方子弹 =====
        if (game && game.bullets) {
            for (let i = game.bullets.length - 1; i >= 0; i--) {
                const bullet = game.bullets[i];
                if (bullet.isPlayer) continue; // 只检查敌方子弹
                const dx = bullet.x - this.x;
                const dy = bullet.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= slashRange) {
                    const bulletAngle = Math.atan2(dy, dx);
                    let angleDiff = bulletAngle - angle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    if (Math.abs(angleDiff) <= slashArc / 2) {
                        // 子弹被斩碎
                        game.bullets.splice(i, 1);
                        // 生成击碎粒子
                        for (let k = 0; k < 4; k++) {
                            game.particles.push(new Particle(bullet.x, bullet.y, '#fbbf24'));
                        }
                        game.damageTexts.push(new DamageText(bullet.x, bullet.y - 5, '挡！', '#fbbf24', false));
                        if (game.music) game.music.playSFX('deflect');
                    }
                }
            }
        }

        // 创建视觉弧形斩击特效（不造成伤害，纯视觉）
        const slashBullet = new Bullet(
            this.x + dirX * 20, this.y + dirY * 20,
            dirX * 0.1, dirY * 0.1,
            0, true, this.weaponColor, 'melee_slash'
        );
        slashBullet.slashAngle = angle;
        slashBullet.slashArc = slashArc;
        slashBullet.slashRange = slashRange;
        slashBullet.originX = this.x;
        slashBullet.originY = this.y;
        slashBullet.lifeTime = 8;
        slashBullet.size = 0; // 不参与碰撞
        bullets.push(slashBullet);
    }

    createMagicAttack(dirX, dirY, bullets) {
        // 魔法弹 - 单发高速（支持多重射击）
        const rangeLimit = this.rangedRange || 380;
        const multiShot = this.multiShot || 1;
        const spreadCount = 1 + (multiShot - 1) * 2; // 1→3→5→7
        const damageReduction = Math.pow(0.5, multiShot - 1); // 1→0.5→0.25→0.125

        for (let i = 0; i < spreadCount; i++) {
            const offset = (i - (spreadCount - 1) / 2) * 0.15;
            const angle = Math.atan2(dirY, dirX) + offset;
            const bullet = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle),
                this.damage * damageReduction * (this.bulletDamageMult || 1),
                true, this.weaponColor, 'magic', rangeLimit);
            bullet.size = 8 * (this.bulletSizeMult || 1);
            bullet.vx *= 1.5;
            bullet.vy *= 1.5;
            bullets.push(bullet);
        }
    }

    createElementalAttack(dirX, dirY, bullets) {
        // 元素弹 - 双发带效果（支持多重射击）
        const rangeLimit = this.rangedRange || 360;
        const multiShot = this.multiShot || 1;
        const baseSpreadCount = 2; // 基础2发
        const totalCount = baseSpreadCount + (multiShot - 1) * 2; // 2→4→6→8
        const damageReduction = Math.pow(0.5, multiShot - 1);

        for (let i = 0; i < totalCount; i++) {
            const offset = (i - (totalCount - 1) / 2) * 0.18;
            const angle = Math.atan2(dirY, dirX) + offset;
            const bullet = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle),
                this.damage * 0.8 * damageReduction * (this.bulletDamageMult || 1),
                true, this.weaponColor, 'elemental', rangeLimit);
            bullet.size = 8 * (this.bulletSizeMult || 1);
            bullets.push(bullet);
        }
    }

    createProjectileAttack(dirX, dirY, bullets) {
        // 游侠 - 扇形三连发（支持多重射击）
        const baseAngle = Math.atan2(dirY, dirX);
        const rangeLimit = this.rangedRange || 350;
        const multiShot = this.multiShot || 1;
        const spreadCount = 3 + (multiShot - 1) * 2; // 3→5→7→9
        const damageReduction = Math.pow(0.5, multiShot - 1);

        for (let i = 0; i < spreadCount; i++) {
            const offset = (i - (spreadCount - 1) / 2) * 0.15;
            const angle = baseAngle + offset;
            const bullet = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle),
                this.damage * 0.7 * damageReduction * (this.bulletDamageMult || 1),
                true, this.weaponColor, 'arrow', rangeLimit);
            bullet.size = 6 * (this.bulletSizeMult || 1);
            bullets.push(bullet);
        }
    }

    createSnipeAttack(dirX, dirY, bullets) {
        // 狙击 - 单发高伤害穿透（支持多重射击）
        const rangeLimit = this.rangedRange || 400;
        const multiShot = this.multiShot || 1;
        const spreadCount = 1 + (multiShot - 1) * 2; // 1→3→5
        const damageReduction = Math.pow(0.5, multiShot - 1);

        for (let i = 0; i < spreadCount; i++) {
            const offset = (i - (spreadCount - 1) / 2) * 0.1;
            const angle = Math.atan2(dirY, dirX) + offset;
            const bullet = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle),
                this.damage * 2 * damageReduction * (this.bulletDamageMult || 1),
                true, this.weaponColor, 'snipe', rangeLimit);
            bullet.size = 10 * (this.bulletSizeMult || 1);
            bullet.canPierce = true;
            bullets.push(bullet);
        }
    }

    createShadowAttack(dirX, dirY, bullets) {
        // 影刃 - 快速小型弹幕（支持多重射击）
        const rangeLimit = this.rangedRange || 300;
        const multiShot = this.multiShot || 1;
        const spreadCount = 1 + (multiShot - 1) * 2;
        const damageReduction = Math.pow(0.5, multiShot - 1);

        for (let i = 0; i < spreadCount; i++) {
            const offset = (i - (spreadCount - 1) / 2) * 0.12;
            const angle = Math.atan2(dirY, dirX) + offset;
            const bullet = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle),
                this.damage * damageReduction * (this.bulletDamageMult || 1),
                true, this.weaponColor, 'shadow', rangeLimit);
            bullet.size = 6 * (this.bulletSizeMult || 1);
            bullet.vx *= 1.8;
            bullet.vy *= 1.8;
            bullets.push(bullet);
        }
    }

    // ===== 牛哥系 - 召唤攻击 =====
    createSummonAttack(dirX, dirY, bullets, gameInstance) {
        const angle = Math.atan2(dirY, dirX);
        let summonCount = 1;
        if (this.weaponType === 'summon_herd') summonCount = 3;
        else if (this.weaponType === 'summon_wild') summonCount = 2;

        const multiShot = this.multiShot || 1;
        summonCount += (multiShot - 1);
        const damageReduction = Math.pow(0.7, multiShot - 1);

        for (let i = 0; i < summonCount; i++) {
            const spread = (i - (summonCount - 1) / 2) * 0.3;
            const a = angle + spread;
            const bull = new Bullet(this.x, this.y, Math.cos(a), Math.sin(a),
                this.damage * 1.5 * damageReduction * (this.bulletDamageMult || 1),
                true, this.weaponColor,
                this.weaponType === 'summon_wild' ? 'wild_beast' : 'bull', 350);
            bull.size = this.weaponType === 'summon_herd' ? 18 : 22;
            bull.vx *= 0.8; // 牛跑得稍慢但伤害高
            bull.vy *= 0.8;
            bull.lifeTime = 80;
            bull.canPierce = true; // 牛可以碾压多个敌人
            bullets.push(bull);
        }
    }

    // ===== 祭司系 - 圣光攻击 =====
    createHolyAttack(dirX, dirY, bullets, gameInstance) {
        const rangeLimit = this.rangedRange || 350;
        const multiShot = this.multiShot || 1;
        const damageReduction = Math.pow(0.5, multiShot - 1);

        if (this.weaponType === 'holy_burst') {
            // 大主教：8方向圣光爆发
            const count = 8 + (multiShot - 1) * 4;
            for (let i = 0; i < count; i++) {
                const a = (Math.PI * 2 / count) * i;
                const bullet = new Bullet(this.x, this.y, Math.cos(a), Math.sin(a),
                    this.damage * 0.6 * damageReduction * (this.bulletDamageMult || 1),
                    true, this.weaponColor, 'holy_orb', rangeLimit);
                bullet.size = 7 * (this.bulletSizeMult || 1);
                bullet.healOnHit = 2; // 命中回血
                bullets.push(bullet);
            }
        } else {
            // 祭司：单发圣光弹，命中回血
            const spreadCount = 1 + (multiShot - 1) * 2;
            for (let i = 0; i < spreadCount; i++) {
                const offset = (i - (spreadCount - 1) / 2) * 0.15;
                const angle = Math.atan2(dirY, dirX) + offset;
                const bullet = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle),
                    this.damage * damageReduction * (this.bulletDamageMult || 1),
                    true, this.weaponColor, 'holy_orb', rangeLimit);
                bullet.size = 10 * (this.bulletSizeMult || 1);
                bullet.healOnHit = 3; // 命中回血
                bullet.vx *= 1.2;
                bullet.vy *= 1.2;
                bullets.push(bullet);
            }
        }
    }

    // ===== 神谕者 - 追踪弹 =====
    createHomingAttack(dirX, dirY, bullets, gameInstance) {
        const rangeLimit = this.rangedRange || 400;
        const multiShot = this.multiShot || 1;
        const count = 2 + (multiShot - 1) * 2;
        const damageReduction = Math.pow(0.5, multiShot - 1);

        for (let i = 0; i < count; i++) {
            const offset = (i - (count - 1) / 2) * 0.4;
            const angle = Math.atan2(dirY, dirX) + offset;
            const bullet = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle),
                this.damage * 0.8 * damageReduction * (this.bulletDamageMult || 1),
                true, this.weaponColor, 'homing', rangeLimit);
            bullet.size = 8 * (this.bulletSizeMult || 1);
            bullet.isHoming = true;
            bullet.vx *= 0.9;
            bullet.vy *= 0.9;
            bullets.push(bullet);
        }
    }

    // ===== 忍者系 - 手里剑 =====
    createShurikenAttack(dirX, dirY, bullets) {
        const rangeLimit = this.rangedRange || 320;
        const multiShot = this.multiShot || 1;
        const damageReduction = Math.pow(0.5, multiShot - 1);

        if (this.weaponType === 'shadow_clone') {
            // 影分身：4方向同时发射
            const baseAngle = Math.atan2(dirY, dirX);
            const count = 4 + (multiShot - 1) * 2;
            for (let i = 0; i < count; i++) {
                const a = baseAngle + (Math.PI * 2 / count) * i;
                const bullet = new Bullet(this.x, this.y, Math.cos(a), Math.sin(a),
                    this.damage * 0.5 * damageReduction * (this.bulletDamageMult || 1),
                    true, this.weaponColor, 'shuriken', rangeLimit);
                bullet.size = 6 * (this.bulletSizeMult || 1);
                bullet.vx *= 2.0;
                bullet.vy *= 2.0;
                bullets.push(bullet);
            }
        } else {
            // 忍者：快速双发
            const spreadCount = 2 + (multiShot - 1) * 2;
            for (let i = 0; i < spreadCount; i++) {
                const offset = (i - (spreadCount - 1) / 2) * 0.1;
                const angle = Math.atan2(dirY, dirX) + offset;
                const bullet = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle),
                    this.damage * damageReduction * (this.bulletDamageMult || 1),
                    true, this.weaponColor, 'shuriken', rangeLimit);
                bullet.size = 6 * (this.bulletSizeMult || 1);
                bullet.vx *= 2.2;
                bullet.vy *= 2.2;
                bullets.push(bullet);
            }
        }
    }

    // ===== 侍 - 居合斩 =====
    createIaiSlash(dirX, dirY, bullets, gameInstance) {
        // 超远距离直线斩击
        const angle = Math.atan2(dirY, dirX);
        const slashRange = 200;
        const game = gameInstance || (typeof window !== 'undefined' && window.game);

        if (game && game.enemies) {
            for (let i = game.enemies.length - 1; i >= 0; i--) {
                const enemy = game.enemies[i];
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= slashRange) {
                    const enemyAngle = Math.atan2(dy, dx);
                    let angleDiff = enemyAngle - angle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    if (Math.abs(angleDiff) <= 0.35) { // 窄范围高伤
                        const isCrit = Math.random() < (this.critChance + 0.2); // 额外20%暴击
                        const critMult = this.critMultiplier || 2.5;
                        const dmg = this.damage * 2.5 * (isCrit ? critMult : 1);
                        if (enemy.takeDamage(dmg)) {
                            for (let k = 0; k < 12; k++) {
                                game.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
                            }
                            game.enemies.splice(i, 1);
                            game.stats.kills++;
                            this.onKillEnemy();
                            const coinDrop = (enemy.isBoss ? 15 : 5) + Math.floor(Math.random() * 5);
                            this.coins += coinDrop;
                            game.stats.coinsEarned += coinDrop;
                            game.damageTexts.push(new DamageText(enemy.x, enemy.y + 10, '+' + coinDrop + '🪙', '#fbbf24'));
                            if (this.lifeSteal > 0) this.heal(dmg * this.lifeSteal);
                        }
                        game.damageTexts.push(new DamageText(enemy.x, enemy.y - 10,
                            Math.floor(dmg).toString(), isCrit ? '#fbbf24' : '#fff', isCrit));
                    }
                }
            }
        }

        // 居合斩视觉特效 — 长条光线
        const slashBullet = new Bullet(
            this.x + dirX * 40, this.y + dirY * 40,
            dirX * 0.1, dirY * 0.1,
            0, true, '#dc2626', 'iai_visual'
        );
        slashBullet.slashAngle = angle;
        slashBullet.slashRange = slashRange;
        slashBullet.originX = this.x;
        slashBullet.originY = this.y;
        slashBullet.lifeTime = 10;
        slashBullet.size = 0;
        bullets.push(slashBullet);
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    // ===== 十年剑童系 - 飞剑 =====
    createFlyingSwordAttack(dirX, dirY, bullets, gameInstance) {
        // 检查当前飞剑数量
        const swordTypes = ['flying_sword', 'flying_sword_tri', 'flying_sword_burst'];
        const existingSwords = bullets.filter(b => b.isPlayer && swordTypes.includes(b.bulletType));
        const maxSwords = this.weaponType === 'flying_sword_tri' ? 3 : 1;
        if (existingSwords.length >= maxSwords) return;

        const angle = Math.atan2(dirY, dirX);
        const multiShot = this.multiShot || 1;
        const damageReduction = Math.pow(0.7, multiShot - 1);

        const count = this.weaponType === 'flying_sword_tri' ? Math.min(3 - existingSwords.length, 1 + (multiShot - 1)) : 1;
        for (let i = 0; i < count; i++) {
            const spread = (i - (count - 1) / 2) * 0.3;
            const a = angle + spread;
            const sword = new Bullet(this.x, this.y, Math.cos(a), Math.sin(a),
                this.damage * 2.0 * damageReduction * (this.bulletDamageMult || 1),
                true, this.weaponColor, this.weaponType, 500);
            sword.size = 12 * (this.bulletSizeMult || 1);
            sword.isHoming = true;
            sword.turnRate = 0.15; // 飞剑追踪更强
            sword.lifeTime = 150; // 寿命更长
            sword.vx *= 0.7; // 起始速度稍慢，但追踪很准
            sword.vy *= 0.7;
            if (this.weaponType === 'flying_sword_burst') {
                sword.explodeOnHit = true; // 命中后爆炸
            }
            bullets.push(sword);
        }
    }

    takeDamage(amount) {
        // 护甲减伤
        const finalDamage = Math.max(1, amount - this.armor);
        this.hp -= finalDamage;

        // 生命偷取
        if (this.lifeSteal > 0 && amount > 0) {
            this.heal(amount * this.lifeSteal);
        }

        return finalDamage;
    }

    draw(ctx) {
        // 冲刺特效
        if (this.isDashing) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#5b8def';
            ctx.fillRect(this.x - this.size / 2 - 4, this.y - this.size / 2 - 4, this.size + 8, this.size + 8);
            ctx.globalAlpha = 1;
        }

        // 像素风格玩家
        this.drawPixelPlayer(ctx);

        // 职业名标签（在血条上方）
        ctx.fillStyle = this.weaponColor;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.className, this.x, this.y - this.size / 2 - 16);

        // 血条
        const barWidth = 40;
        const barHeight = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size / 2 - 10, barWidth, barHeight);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size / 2 - 10, barWidth * (this.hp / this.maxHp), barHeight);
    }

    drawPixelPlayer(ctx) {
        // 始终使用像素绘制（每个职业独立外观）
        this.drawPixelPlayerFallback(ctx);
    }

    drawPixelPlayerFallback(ctx) {
        const classId = this.classData ? this.classData.id : 'warrior';
        const from = this.classData ? this.classData.from : null;

        // 根据职业基础类型选择绘制方案
        if (classId === 'warrior' || classId === 'berserker' || classId === 'paladin' || from === 'warrior') {
            this.drawWarriorModel(ctx, classId);
        } else if (classId === 'mage' || classId === 'archmage' || classId === 'elementalist' || from === 'mage') {
            this.drawMageModel(ctx, classId);
        } else if (classId === 'ranger' || classId === 'sniper' || classId === 'shadowblade' || from === 'ranger') {
            this.drawRangerModel(ctx, classId);
        } else if (classId === 'beastmaster' || classId === 'bullking' || classId === 'wildlord' || from === 'beastmaster') {
            this.drawBeastmasterModel(ctx, classId);
        } else if (classId === 'priest' || classId === 'bishop' || classId === 'oracle' || from === 'priest') {
            this.drawPriestModel(ctx, classId);
        } else if (classId === 'ninja' || classId === 'kage' || classId === 'samurai' || from === 'ninja') {
            this.drawNinjaModel(ctx, classId);
        } else if (classId === 'swordchild' || classId === 'swordmaster' || classId === 'swordsaint' || from === 'swordchild') {
            this.drawSwordchildModel(ctx, classId);
        } else {
            this.drawWarriorModel(ctx, classId);
        }
    }

    // ===== 战士系模型 =====
    drawWarriorModel(ctx, classId) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        let mainColor, darkColor, lightColor, weaponGlow;
        if (classId === 'berserker') {
            mainColor = '#dc2626'; darkColor = '#7f1d1d'; lightColor = '#fca5a5'; weaponGlow = '#ef4444';
        } else if (classId === 'paladin') {
            mainColor = '#f4f4f5'; darkColor = '#a1a1aa'; lightColor = '#fbbf24'; weaponGlow = '#fbbf24';
        } else {
            mainColor = '#a1a1aa'; darkColor = '#52525b'; lightColor = '#d4d4d8'; weaponGlow = '#ef4444';
        }

        // 身体轮廓（大方块 - 板甲体型）
        ctx.fillStyle = darkColor;
        ctx.fillRect(px - 14, py - 12, 28, 28);

        // 头盔
        ctx.fillStyle = mainColor;
        ctx.fillRect(px - 8, py - 14, 16, 10);
        // 面罩缝隙
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(px - 5, py - 8, 4, 3);
        ctx.fillRect(px + 1, py - 8, 4, 3);
        // 眼睛发光
        ctx.fillStyle = weaponGlow;
        ctx.fillRect(px - 4, py - 7, 2, 1);
        ctx.fillRect(px + 2, py - 7, 2, 1);

        // 铠甲主体
        ctx.fillStyle = mainColor;
        ctx.fillRect(px - 12, py - 2, 24, 14);
        // 中心装饰
        ctx.fillStyle = lightColor;
        ctx.fillRect(px - 2, py + 0, 4, 8);
        // 肩甲（明显凸出）
        ctx.fillStyle = lightColor;
        ctx.fillRect(px - 15, py - 3, 6, 8);
        ctx.fillRect(px + 9, py - 3, 6, 8);

        // 腿部
        ctx.fillStyle = darkColor;
        ctx.fillRect(px - 8, py + 12, 7, 6);
        ctx.fillRect(px + 1, py + 12, 7, 6);

        // 大剑（右手，很大很明显）
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(px + 14, py - 16, 4, 24);
        // 剑柄
        ctx.fillStyle = weaponGlow;
        ctx.fillRect(px + 12, py + 6, 8, 4);
        // 剑尖高光
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 14, py - 16, 4, 4);

        // 盾牌（左手，战士特有）
        if (classId !== 'berserker') {
            ctx.fillStyle = darkColor;
            ctx.fillRect(px - 20, py - 4, 8, 12);
            ctx.fillStyle = lightColor;
            ctx.fillRect(px - 18, py - 2, 4, 8);
        }

        // 狂战士火焰特效
        if (classId === 'berserker') {
            ctx.save();
            const t = Date.now() / 100;
            ctx.globalAlpha = 0.6 + Math.sin(t) * 0.3;
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(px - 6, py - 18 + Math.sin(t) * 2, 4, 5);
            ctx.fillRect(px + 2, py - 19 + Math.sin(t * 1.3) * 2, 4, 6);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(px - 4, py - 16 + Math.sin(t * 0.8) * 2, 3, 3);
            ctx.fillRect(px + 3, py - 17 + Math.sin(t * 1.1) * 2, 3, 4);
            ctx.restore();
        }

        // 圣骑士光环
        if (classId === 'paladin') {
            ctx.save();
            ctx.globalAlpha = 0.2 + Math.sin(Date.now() / 300) * 0.1;
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, 24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ===== 法师系模型 =====
    drawMageModel(ctx, classId) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        let robeColor, robeDark, robeLight, orbColor;
        if (classId === 'archmage') {
            robeColor = '#7c3aed'; robeDark = '#4c1d95'; robeLight = '#a78bfa'; orbColor = '#c084fc';
        } else if (classId === 'elementalist') {
            robeColor = '#0891b2'; robeDark = '#155e75'; robeLight = '#22d3ee'; orbColor = '#67e8f9';
        } else {
            robeColor = '#9333ea'; robeDark = '#581c87'; robeLight = '#c084fc'; orbColor = '#a855f7';
        }

        // 尖帽子（大三角 — 最显著特征）
        ctx.fillStyle = robeDark;
        ctx.beginPath();
        ctx.moveTo(px, py - 22);
        ctx.lineTo(px - 10, py - 6);
        ctx.lineTo(px + 10, py - 6);
        ctx.closePath();
        ctx.fill();
        // 帽子边沿
        ctx.fillStyle = robeColor;
        ctx.fillRect(px - 12, py - 8, 24, 4);

        // 面部
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(px - 6, py - 4, 12, 6);
        // 眼睛
        ctx.fillStyle = robeLight;
        ctx.fillRect(px - 4, py - 2, 3, 2);
        ctx.fillRect(px + 1, py - 2, 3, 2);

        // 长袍身体（A字形）
        ctx.fillStyle = robeColor;
        ctx.beginPath();
        ctx.moveTo(px - 8, py + 2);
        ctx.lineTo(px + 8, py + 2);
        ctx.lineTo(px + 14, py + 18);
        ctx.lineTo(px - 14, py + 18);
        ctx.closePath();
        ctx.fill();
        // 袍带
        ctx.fillStyle = robeLight;
        ctx.fillRect(px - 6, py + 5, 12, 3);
        // 袍子中心纹
        ctx.fillStyle = robeDark;
        ctx.fillRect(px - 1, py + 2, 2, 16);

        // 法杖（左手，长杖 + 大发光球 — 显著特征）
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(px - 18, py - 16, 3, 36);
        // 法球（顶端，大且发光）
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = orbColor;
        ctx.fillStyle = orbColor;
        ctx.beginPath();
        ctx.arc(px - 16, py - 18, 6, 0, Math.PI * 2);
        ctx.fill();
        // 内核白光
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px - 16, py - 18, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 元素使环绕粒子
        if (classId === 'elementalist') {
            ctx.save();
            const t = Date.now() / 400;
            const colors = ['#ef4444', '#3b82f6', '#22c55e', '#fbbf24'];
            for (let i = 0; i < 4; i++) {
                const a = t + i * Math.PI / 2;
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = colors[i];
                ctx.beginPath();
                ctx.arc(px + Math.cos(a) * 20, py + Math.sin(a) * 14, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        // 大法师紫焰光环
        if (classId === 'archmage') {
            ctx.save();
            ctx.globalAlpha = 0.25 + Math.sin(Date.now() / 200) * 0.15;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#a855f7';
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ===== 游侠系模型 =====
    drawRangerModel(ctx, classId) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        let hoodColor, cloakColor, accentColor, darkColor;
        if (classId === 'sniper') {
            hoodColor = '#b45309'; cloakColor = '#78350f'; accentColor = '#f59e0b'; darkColor = '#713f12';
        } else if (classId === 'shadowblade') {
            hoodColor = '#4338ca'; cloakColor = '#1e1b4b'; accentColor = '#818cf8'; darkColor = '#312e81';
        } else {
            hoodColor = '#16a34a'; cloakColor = '#14532d'; accentColor = '#22c55e'; darkColor = '#052e16';
        }

        // 飘动的披风（显著特征 — 比身体大）
        ctx.fillStyle = cloakColor;
        const cloakSway = Math.sin(Date.now() / 300) * 2;
        ctx.beginPath();
        ctx.moveTo(px - 6, py - 4);
        ctx.lineTo(px + 6, py - 4);
        ctx.lineTo(px + 10 + cloakSway, py + 18);
        ctx.lineTo(px - 10 + cloakSway, py + 18);
        ctx.closePath();
        ctx.fill();

        // 兜帽（尖顶 — 和法师帽不同，更圆润）
        ctx.fillStyle = hoodColor;
        ctx.beginPath();
        ctx.arc(px, py - 8, 10, Math.PI, 0);
        ctx.lineTo(px + 10, py - 2);
        ctx.lineTo(px - 10, py - 2);
        ctx.closePath();
        ctx.fill();

        // 面部阴影（只露眼睛 — 与法师的露脸区分）
        ctx.fillStyle = '#111';
        ctx.fillRect(px - 6, py - 6, 12, 6);
        // 发光眼睛
        ctx.fillStyle = accentColor;
        ctx.fillRect(px - 4, py - 4, 3, 2);
        ctx.fillRect(px + 1, py - 4, 3, 2);

        // 紧身衣身体（比战士窄、比法师短）
        ctx.fillStyle = darkColor;
        ctx.fillRect(px - 6, py + 0, 12, 10);
        // 腰带
        ctx.fillStyle = accentColor;
        ctx.fillRect(px - 6, py + 4, 12, 2);
        // 扣环
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px - 1, py + 3.5, 3, 3);

        // 腿部（灵活的靴子）
        ctx.fillStyle = darkColor;
        ctx.fillRect(px - 6, py + 10, 5, 8);
        ctx.fillRect(px + 1, py + 10, 5, 8);
        ctx.fillStyle = hoodColor;
        ctx.fillRect(px - 7, py + 15, 6, 3);
        ctx.fillRect(px + 1, py + 15, 6, 3);

        // 武器
        if (classId === 'shadowblade') {
            // 双匕首（交叉放在身前）
            ctx.fillStyle = '#d4d4d8';
            ctx.save();
            ctx.translate(px - 12, py + 2);
            ctx.rotate(-0.4);
            ctx.fillRect(0, 0, 2, 14);
            ctx.restore();
            ctx.save();
            ctx.translate(px + 12, py + 2);
            ctx.rotate(0.4);
            ctx.fillRect(-2, 0, 2, 14);
            ctx.restore();
            // 匕首发光
            ctx.fillStyle = accentColor;
            ctx.fillRect(px - 14, py + 2, 3, 2);
            ctx.fillRect(px + 11, py + 2, 3, 2);
        } else {
            // 弓（大弓 — 明显特征）
            ctx.strokeStyle = hoodColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(px + 16, py, 14, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.stroke();
            // 弓弦
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px + 16 + Math.cos(-Math.PI * 0.45) * 14, py + Math.sin(-Math.PI * 0.45) * 14);
            ctx.lineTo(px + 16 + Math.cos(Math.PI * 0.45) * 14, py + Math.sin(Math.PI * 0.45) * 14);
            ctx.stroke();
            // 箭（上弦状态）
            ctx.fillStyle = accentColor;
            ctx.fillRect(px + 8, py - 1, 10, 2);
            // 箭头
            ctx.fillStyle = '#e5e7eb';
            ctx.beginPath();
            ctx.moveTo(px + 18, py - 3);
            ctx.lineTo(px + 22, py);
            ctx.lineTo(px + 18, py + 3);
            ctx.closePath();
            ctx.fill();
        }

        // 影刃隐身效果
        if (classId === 'shadowblade') {
            ctx.save();
            ctx.globalAlpha = 0.15 + Math.sin(Date.now() / 200) * 0.1;
            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            ctx.arc(px, py, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ===== 牛哥/驯兽师系模型 =====
    drawBeastmasterModel(ctx, classId) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        let mainColor, darkColor, accentColor;
        if (classId === 'bullking') {
            mainColor = '#78350f'; darkColor = '#451a03'; accentColor = '#fbbf24';
        } else if (classId === 'wildlord') {
            mainColor = '#365314'; darkColor = '#1a2e05'; accentColor = '#84cc16';
        } else {
            mainColor = '#92400e'; darkColor = '#78350f'; accentColor = '#f59e0b';
        }

        // 粗壮身体
        ctx.fillStyle = darkColor;
        ctx.fillRect(px - 13, py - 8, 26, 24);
        // 披风毛皮
        ctx.fillStyle = mainColor;
        ctx.fillRect(px - 11, py - 6, 22, 18);
        // 头部
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(px - 7, py - 14, 14, 10);
        // 眼睛
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(px - 4, py - 9, 3, 3);
        ctx.fillRect(px + 1, py - 9, 3, 3);
        // 牛角头饰
        ctx.fillStyle = accentColor;
        ctx.fillRect(px - 10, py - 16, 4, 5);
        ctx.fillRect(px + 6, py - 16, 4, 5);
        ctx.fillRect(px - 12, py - 18, 3, 4);
        ctx.fillRect(px + 9, py - 18, 3, 4);
        // 鞭子/绳索（右手）
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        const whipSway = Math.sin(Date.now() / 200) * 8;
        ctx.beginPath();
        ctx.moveTo(px + 14, py + 2);
        ctx.quadraticCurveTo(px + 22 + whipSway, py - 5, px + 18 + whipSway, py - 15);
        ctx.stroke();
        // 腿
        ctx.fillStyle = darkColor;
        ctx.fillRect(px - 8, py + 12, 6, 7);
        ctx.fillRect(px + 2, py + 12, 6, 7);
        // 牛魔王王冠
        if (classId === 'bullking') {
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(px - 5, py - 19, 10, 4);
            ctx.fillRect(px - 3, py - 22, 2, 4);
            ctx.fillRect(px + 1, py - 22, 2, 4);
        }
        // 荒野之主绿光环
        if (classId === 'wildlord') {
            ctx.save();
            ctx.globalAlpha = 0.2 + Math.sin(Date.now() / 300) * 0.1;
            ctx.strokeStyle = '#84cc16';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, 24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ===== 祭司系模型 =====
    drawPriestModel(ctx, classId) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        let robeColor, robeDark, glowColor;
        if (classId === 'bishop') {
            robeColor = '#fef3c7'; robeDark = '#fbbf24'; glowColor = '#eab308';
        } else if (classId === 'oracle') {
            robeColor = '#e9d5ff'; robeDark = '#a855f7'; glowColor = '#d946ef';
        } else {
            robeColor = '#fef9c3'; robeDark = '#facc15'; glowColor = '#eab308';
        }

        // 白色长袍（A字形）
        ctx.fillStyle = robeColor;
        ctx.beginPath();
        ctx.moveTo(px - 8, py - 2);
        ctx.lineTo(px + 8, py - 2);
        ctx.lineTo(px + 12, py + 18);
        ctx.lineTo(px - 12, py + 18);
        ctx.closePath();
        ctx.fill();
        // 袍带
        ctx.fillStyle = robeDark;
        ctx.fillRect(px - 6, py + 3, 12, 3);
        // 十字中心
        ctx.fillStyle = robeDark;
        ctx.fillRect(px - 1, py + 0, 2, 14);
        ctx.fillRect(px - 4, py + 5, 8, 2);
        // 头部
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(px - 6, py - 10, 12, 10);
        // 头冠/兜帽
        ctx.fillStyle = robeColor;
        ctx.fillRect(px - 8, py - 14, 16, 6);
        ctx.fillStyle = robeDark;
        ctx.fillRect(px - 2, py - 15, 4, 4); // 十字顶
        ctx.fillRect(px - 4, py - 13, 8, 2);
        // 眼睛
        ctx.fillStyle = glowColor;
        ctx.fillRect(px - 3, py - 6, 2, 2);
        ctx.fillRect(px + 1, py - 6, 2, 2);
        // 法杖
        ctx.fillStyle = '#d4d4d8';
        ctx.fillRect(px - 16, py - 12, 2, 30);
        // 法杖顶端圣光球
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = glowColor;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(px - 15, py - 14, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px - 15, py - 14, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // 大主教光环
        if (classId === 'bishop') {
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 250) * 0.15;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fbbf24';
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, 24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        // 神谕者眼球特效
        if (classId === 'oracle') {
            ctx.save();
            const t = Date.now() / 300;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#d946ef';
            ctx.beginPath();
            ctx.arc(px, py - 20, 4 + Math.sin(t) * 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(px, py - 20, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ===== 忍者系模型 =====
    drawNinjaModel(ctx, classId) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        let mainColor, darkColor, accentColor;
        if (classId === 'kage') {
            mainColor = '#1e1b4b'; darkColor = '#0f0a2e'; accentColor = '#818cf8';
        } else if (classId === 'samurai') {
            mainColor = '#7f1d1d'; darkColor = '#450a0a'; accentColor = '#dc2626';
        } else {
            mainColor = '#1f2937'; darkColor = '#111827'; accentColor = '#64748b';
        }

        // 紧身衣身体（瘦小灵活）
        ctx.fillStyle = mainColor;
        ctx.fillRect(px - 7, py - 4, 14, 14);
        // 头巾
        ctx.fillStyle = darkColor;
        ctx.fillRect(px - 8, py - 14, 16, 12);
        // 面具（只露眼睛）
        ctx.fillStyle = mainColor;
        ctx.fillRect(px - 6, py - 10, 12, 4);
        // 发光眼睛
        ctx.fillStyle = accentColor;
        ctx.fillRect(px - 4, py - 8, 3, 2);
        ctx.fillRect(px + 1, py - 8, 3, 2);
        // 飘带（头巾尾部）
        const bandSway = Math.sin(Date.now() / 200) * 4;
        ctx.fillStyle = accentColor;
        ctx.fillRect(px + 8, py - 12 + bandSway * 0.3, 8, 3);
        ctx.fillRect(px + 12, py - 10 + bandSway * 0.5, 6, 3);
        // 腿
        ctx.fillStyle = darkColor;
        ctx.fillRect(px - 6, py + 10, 5, 8);
        ctx.fillRect(px + 1, py + 10, 5, 8);

        if (classId === 'samurai') {
            // 武士刀（长且发光）
            ctx.fillStyle = '#e5e7eb';
            ctx.save();
            ctx.translate(px + 8, py - 18);
            ctx.rotate(0.2);
            ctx.fillRect(0, 0, 3, 28);
            ctx.fillStyle = accentColor;
            ctx.fillRect(-1, 26, 5, 4); // 刀柄
            ctx.restore();
        } else {
            // 手里剑（手持）
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(px - 14, py - 2, 6, 2);
            ctx.fillRect(px - 12, py - 4, 2, 6);
            // 右手手里剑
            ctx.fillRect(px + 10, py - 2, 6, 2);
            ctx.fillRect(px + 12, py - 4, 2, 6);
        }

        // 影分身残影
        if (classId === 'kage') {
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = accentColor;
            ctx.fillRect(px - 10 + Math.sin(Date.now() / 150) * 3, py - 6, 14, 14);
            ctx.fillRect(px + 3 - Math.sin(Date.now() / 150) * 3, py - 6, 14, 14);
            ctx.restore();
        }
    }

    // ===== 十年剑童系模型 =====
    drawSwordchildModel(ctx, classId) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        let robeColor, robeDark, swordGlow, accentColor;
        if (classId === 'swordmaster') {
            robeColor = '#0369a1'; robeDark = '#0c4a6e'; swordGlow = '#0ea5e9'; accentColor = '#38bdf8';
        } else if (classId === 'swordsaint') {
            robeColor = '#e0f2fe'; robeDark = '#bae6fd'; swordGlow = '#7dd3fc'; accentColor = '#f0f9ff';
        } else {
            robeColor = '#0284c7'; robeDark = '#075985'; swordGlow = '#38bdf8'; accentColor = '#7dd3fc';
        }

        // 道袍身体（A字形，少年体型）
        ctx.fillStyle = robeColor;
        ctx.beginPath();
        ctx.moveTo(px - 7, py - 2);
        ctx.lineTo(px + 7, py - 2);
        ctx.lineTo(px + 10, py + 16);
        ctx.lineTo(px - 10, py + 16);
        ctx.closePath();
        ctx.fill();
        // 腰带
        ctx.fillStyle = swordGlow;
        ctx.fillRect(px - 6, py + 3, 12, 2);
        // 袖子
        ctx.fillStyle = robeDark;
        ctx.fillRect(px - 12, py - 1, 6, 8);
        ctx.fillRect(px + 6, py - 1, 6, 8);

        // 头部（年轻面容）
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(px - 6, py - 12, 12, 10);
        // 头发（青色长发）
        ctx.fillStyle = robeDark;
        ctx.fillRect(px - 7, py - 14, 14, 6);
        ctx.fillRect(px - 8, py - 10, 3, 10); // 左侧发丝
        ctx.fillRect(px + 5, py - 10, 3, 10); // 右侧发丝
        // 眼睛
        ctx.fillStyle = swordGlow;
        ctx.fillRect(px - 4, py - 8, 2, 2);
        ctx.fillRect(px + 2, py - 8, 2, 2);

        // 浮空飞剑（绕身旋转）
        ctx.save();
        const swordAngle = Date.now() / 400;
        const swordCount = classId === 'swordmaster' ? 3 : 1;
        for (let i = 0; i < swordCount; i++) {
            const a = swordAngle + (Math.PI * 2 / swordCount) * i;
            const sx = px + Math.cos(a) * 18;
            const sy = py + Math.sin(a) * 12;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(a + Math.PI / 4);
            ctx.shadowBlur = 8;
            ctx.shadowColor = swordGlow;
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(-1.5, -8, 3, 16); // 剑身
            ctx.fillStyle = swordGlow;
            ctx.fillRect(-2.5, 6, 5, 3); // 剑护手
            ctx.fillStyle = '#92400e';
            ctx.fillRect(-1, 9, 2, 4); // 剑柄
            ctx.restore();
        }
        ctx.restore();

        // 御剑仙人光环
        if (classId === 'swordsaint') {
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.15;
            ctx.shadowBlur = 15;
            ctx.shadowColor = swordGlow;
            ctx.strokeStyle = swordGlow;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, 24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        // 剑圣剑气纹
        if (classId === 'swordmaster') {
            ctx.save();
            const t = Date.now() / 150;
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = swordGlow;
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const sa = t + i * 2.1;
                ctx.beginPath();
                ctx.moveTo(px + Math.cos(sa) * 8, py + Math.sin(sa) * 8);
                ctx.lineTo(px + Math.cos(sa) * 22, py + Math.sin(sa) * 16);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
}

// ========== 怪物类型配置 ==========
const ENEMY_TYPES = {
    // 1-3层：温和型
    slime: { name: '史莱姆', hpMult: 1, dmgMult: 1, speedMult: 1, color: '#22c55e', floors: [1, 2, 3] },
    bat: { name: '蝙蝠', hpMult: 0.7, dmgMult: 0.8, speedMult: 1.6, color: '#8b5cf6', floors: [1, 2, 3] },
    // 4-6层：中等型
    skeleton: { name: '骷髅', hpMult: 1.3, dmgMult: 1.3, speedMult: 1.1, color: '#d4d4d8', floors: [4, 5, 6] },
    ghost: { name: '幽灵', hpMult: 1.0, dmgMult: 1.5, speedMult: 1.3, color: '#67e8f9', floors: [4, 5, 6] },
    orc: { name: '兽人', hpMult: 1.8, dmgMult: 1.4, speedMult: 0.8, color: '#84cc16', floors: [4, 5, 6] },
    // 7-10层：恐怖型
    demon: { name: '恶魔', hpMult: 1.5, dmgMult: 1.8, speedMult: 1.2, color: '#dc2626', floors: [7, 8, 9, 10] },
    wraith: { name: '怨灵', hpMult: 1.2, dmgMult: 2.0, speedMult: 1.5, color: '#6366f1', floors: [7, 8, 9, 10] },
    golem: { name: '魔像', hpMult: 2.5, dmgMult: 1.5, speedMult: 0.6, color: '#78716c', floors: [7, 8, 9, 10] },
};

function getEnemyTypeForFloor(floor) {
    const available = Object.values(ENEMY_TYPES).filter(t => t.floors.includes(floor));
    if (available.length === 0) {
        // 后期用最强的
        const lateTypes = Object.values(ENEMY_TYPES).filter(t => t.floors.includes(10));
        return lateTypes[Math.floor(Math.random() * lateTypes.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
}

// ========== 敌人 ==========
class Enemy extends Entity {
    constructor(x, y, floor) {
        const enemyType = getEnemyTypeForFloor(floor);
        super(x, y, 20, enemyType.color);
        this.enemyType = enemyType;
        this.floor = floor;
        this.maxHp = Math.floor((30 + floor * 10) * enemyType.hpMult);
        this.hp = this.maxHp;
        this.damage = Math.floor((10 + floor * 2) * enemyType.dmgMult);
        this.speed = CONFIG.ENEMY_SPEED * enemyType.speedMult;
        this.attackCooldown = 0;
    }

    update(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 30) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        } else {
            this.vx = 0;
            this.vy = 0;

            if (this.attackCooldown <= 0) {
                player.takeDamage(this.damage);
                this.attackCooldown = 60;
            }
        }

        this.attackCooldown--;
        super.update();
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }

    draw(ctx) {
        // 像素风格敌人
        this.drawPixelEnemy(ctx);

        // 血条
        const barWidth = 30;
        const barHeight = 3;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size / 2 - 8, barWidth, barHeight);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size / 2 - 8, barWidth * (this.hp / this.maxHp), barHeight);
    }

    drawPixelEnemy(ctx) {
        // 优先使用像素绘制（更有辨识度）
        this.drawPixelEnemyFallback(ctx);
    }

    drawPixelEnemyFallback(ctx) {
        const typeName = this.enemyType ? this.enemyType.name : '史莱姆';
        switch (typeName) {
            case '史莱姆': this.drawSlime(ctx); break;
            case '蝙蝠': this.drawBat(ctx); break;
            case '骷髅': this.drawSkeleton(ctx); break;
            case '幽灵': this.drawGhost(ctx); break;
            case '兽人': this.drawOrc(ctx); break;
            case '恶魔': this.drawDemon(ctx); break;
            case '怨灵': this.drawWraith(ctx); break;
            case '魔像': this.drawGolem(ctx); break;
            default: this.drawSlime(ctx);
        }
    }

    drawSlime(ctx) {
        const s = 4;
        const px = Math.floor(this.x - 12);
        const py = Math.floor(this.y - 12);
        const bounce = Math.sin(Date.now() / 300) * 1.5;

        ctx.fillStyle = '#15803d';
        ctx.fillRect(px + s * 0, py + s * 3 + bounce, s * 6, s * 3);
        ctx.fillRect(px + s * 1, py + s * 2 + bounce, s * 4, s * 1);
        ctx.fillRect(px + s * 2, py + s * 1 + bounce, s * 2, s * 1);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px + s * 1, py + s * 3 + bounce, s * 4, s * 2.5);
        ctx.fillRect(px + s * 2, py + s * 2 + bounce, s * 2, s * 1);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(px + s * 2, py + s * 2.5 + bounce, s * 2, s * 1);
        // 眼睛
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(px + s * 2, py + s * 3.5 + bounce, s * 0.7, s * 0.7);
        ctx.fillRect(px + s * 3.3, py + s * 3.5 + bounce, s * 0.7, s * 0.7);
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + s * 2.3, py + s * 3.5 + bounce, s * 0.3, s * 0.3);
        ctx.fillRect(px + s * 3.6, py + s * 3.5 + bounce, s * 0.3, s * 0.3);
    }

    drawBat(ctx) {
        const s = 3;
        const px = Math.floor(this.x - 12);
        const py = Math.floor(this.y - 10);
        const wingFlap = Math.sin(Date.now() / 100) * 3;

        // 翅膀
        ctx.fillStyle = '#6d28d9';
        ctx.fillRect(px - s * 1, py + s * 1 + wingFlap, s * 3, s * 2);
        ctx.fillRect(px + s * 5, py + s * 1 - wingFlap, s * 3, s * 2);
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(px - s * 0.5, py + s * 1.5 + wingFlap, s * 2, s * 1);
        ctx.fillRect(px + s * 5.5, py + s * 1.5 - wingFlap, s * 2, s * 1);
        // 身体
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(px + s * 2, py + s * 0.5, s * 3, s * 3.5);
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(px + s * 2.5, py + s * 1, s * 2, s * 2);
        // 眼睛（发光红色）
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(px + s * 2.5, py + s * 1.5, s * 0.7, s * 0.7);
        ctx.fillRect(px + s * 3.8, py + s * 1.5, s * 0.7, s * 0.7);
        // 獠牙
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + s * 2.8, py + s * 3, s * 0.3, s * 0.6);
        ctx.fillRect(px + s * 3.9, py + s * 3, s * 0.3, s * 0.6);
    }

    drawSkeleton(ctx) {
        const s = 3.5;
        const px = Math.floor(this.x - 12);
        const py = Math.floor(this.y - 14);

        // 头骨
        ctx.fillStyle = '#f5f5f4';
        ctx.fillRect(px + s * 1.5, py + s * 0.5, s * 4, s * 3);
        ctx.fillStyle = '#d6d3d1';
        ctx.fillRect(px + s * 2, py + s * 1, s * 3, s * 2);
        // 眼窝
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(px + s * 2, py + s * 1.2, s * 1, s * 1);
        ctx.fillRect(px + s * 4, py + s * 1.2, s * 1, s * 1);
        // 鼻孔
        ctx.fillRect(px + s * 3.2, py + s * 2.3, s * 0.6, s * 0.4);
        // 牙齿
        ctx.fillStyle = '#e7e5e4';
        ctx.fillRect(px + s * 2.2, py + s * 2.8, s * 2.6, s * 0.5);
        ctx.fillStyle = '#1c1917';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(px + s * (2.4 + i * 0.6), py + s * 2.8, s * 0.15, s * 0.5);
        }
        // 肋骨
        ctx.fillStyle = '#d6d3d1';
        ctx.fillRect(px + s * 3, py + s * 3.5, s * 1, s * 2.5);
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = '#e7e5e4';
            ctx.fillRect(px + s * 2, py + s * (3.8 + i * 0.7), s * 3, s * 0.3);
        }
        // 腿骨
        ctx.fillStyle = '#d6d3d1';
        ctx.fillRect(px + s * 2.3, py + s * 6, s * 0.7, s * 2);
        ctx.fillRect(px + s * 4, py + s * 6, s * 0.7, s * 2);
    }

    drawGhost(ctx) {
        const s = 3.5;
        const px = Math.floor(this.x - 12);
        const py = Math.floor(this.y - 12);
        const float = Math.sin(Date.now() / 400) * 3;

        ctx.save();
        ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 500) * 0.15;
        // 主体
        ctx.fillStyle = '#a5f3fc';
        ctx.fillRect(px + s * 1, py + s * 1 + float, s * 5, s * 4);
        ctx.fillRect(px + s * 2, py + s * 0.5 + float, s * 3, s * 1);
        // 底部波浪
        ctx.fillRect(px + s * 1, py + s * 5 + float, s * 1.5, s * 1);
        ctx.fillRect(px + s * 3.5, py + s * 5 + float, s * 1.5, s * 1);
        // 内部光亮
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(px + s * 2, py + s * 1.5 + float, s * 3, s * 2.5);
        // 眼睛
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(px + s * 2, py + s * 2 + float, s * 1, s * 1.2);
        ctx.fillRect(px + s * 4, py + s * 2 + float, s * 1, s * 1.2);
        // 嘴
        ctx.fillRect(px + s * 3, py + s * 3.5 + float, s * 1, s * 0.7);
        ctx.restore();
    }

    drawOrc(ctx) {
        const s = 4;
        const px = Math.floor(this.x - 14);
        const py = Math.floor(this.y - 14);

        // 轮廓
        ctx.fillStyle = '#365314';
        ctx.fillRect(px + s * 0.5, py + s * 0, s * 6, s * 7);
        // 头
        ctx.fillStyle = '#65a30d';
        ctx.fillRect(px + s * 1.5, py + s * 0.5, s * 4, s * 2.5);
        // 下颌
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(px + s * 1.5, py + s * 2.5, s * 4, s * 1);
        // 獠牙
        ctx.fillStyle = '#fef9c3';
        ctx.fillRect(px + s * 2, py + s * 2.8, s * 0.4, s * 0.8);
        ctx.fillRect(px + s * 4.6, py + s * 2.8, s * 0.4, s * 0.8);
        // 眼睛（愤怒）
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px + s * 2, py + s * 1.2, s * 1.2, s * 0.8);
        ctx.fillRect(px + s * 3.8, py + s * 1.2, s * 1.2, s * 0.8);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(px + s * 2.3, py + s * 1.4, s * 0.5, s * 0.5);
        ctx.fillRect(px + s * 4.2, py + s * 1.4, s * 0.5, s * 0.5);
        // 粗壮身体
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(px + s * 0.5, py + s * 3.5, s * 6, s * 2.5);
        ctx.fillStyle = '#65a30d';
        ctx.fillRect(px + s * 1.5, py + s * 3.5, s * 4, s * 2.5);
        // 腿
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(px + s * 1.5, py + s * 6, s * 1.5, s * 1.5);
        ctx.fillRect(px + s * 4, py + s * 6, s * 1.5, s * 1.5);
    }

    drawDemon(ctx) {
        const s = 3.5;
        const px = Math.floor(this.x - 12);
        const py = Math.floor(this.y - 14);

        // 犄角
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(px + s * 0.5, py + s * -0.5, s * 1, s * 2);
        ctx.fillRect(px + s * 5.5, py + s * -0.5, s * 1, s * 2);
        // 头
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(px + s * 1.5, py + s * 0.5, s * 4, s * 2.5);
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(px + s * 2, py + s * 1, s * 3, s * 1.5);
        // 眼睛（发光）
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px + s * 2, py + s * 1.3, s * 1, s * 0.7);
        ctx.fillRect(px + s * 4, py + s * 1.3, s * 1, s * 0.7);
        ctx.restore();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(px + s * 2.3, py + s * 1.5, s * 0.4, s * 0.4);
        ctx.fillRect(px + s * 4.3, py + s * 1.5, s * 0.4, s * 0.4);
        // 身体
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(px + s * 1, py + s * 3, s * 5, s * 3);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(px + s * 2, py + s * 3, s * 3, s * 3);
        // 翅膀
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(px - s * 0.5, py + s * 3, s * 2, s * 2.5);
        ctx.fillRect(px + s * 5.5, py + s * 3, s * 2, s * 2.5);
        // 尾巴
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(px + s * 6, py + s * 5.5, s * 1.5, s * 0.5);
        ctx.fillRect(px + s * 7, py + s * 5, s * 0.5, s * 0.5);
        // 胸部纹路
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(px + s * 3, py + s * 3.5, s * 1, s * 1);
        // 腿
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(px + s * 1.5, py + s * 6, s * 1.5, s * 2);
        ctx.fillRect(px + s * 4, py + s * 6, s * 1.5, s * 2);
    }

    drawWraith(ctx) {
        const s = 3.5;
        const px = Math.floor(this.x - 12);
        const py = Math.floor(this.y - 14);
        const float = Math.sin(Date.now() / 350) * 4;

        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.2;
        // 身体
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(px + s * 1, py + s * 1 + float, s * 5, s * 5);
        ctx.fillRect(px + s * 2, py + s * 0.5 + float, s * 3, s * 1);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(px + s * 2, py + s * 1.5 + float, s * 3, s * 3.5);
        // 底部碎片
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(px + s * 0.5, py + s * 6 + float, s * 1.5, s * 1.5);
        ctx.fillRect(px + s * 2.5, py + s * 6 + float, s * 1, s * 2);
        ctx.fillRect(px + s * 5, py + s * 6 + float, s * 1.5, s * 1);
        // 眼睛（红色发光）
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(px + s * 2, py + s * 2.5 + float, s * 1, s * 0.7);
        ctx.fillRect(px + s * 4, py + s * 2.5 + float, s * 1, s * 0.7);
        ctx.shadowBlur = 0;
        // 黑暗光环
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.arc(this.x, this.y + float, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawGolem(ctx) {
        const s = 4;
        const px = Math.floor(this.x - 14);
        const py = Math.floor(this.y - 14);

        // 身体（大块岩石）
        ctx.fillStyle = '#57534e';
        ctx.fillRect(px + s * 0.5, py + s * 2, s * 6, s * 4);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(px + s * 1, py + s * 2.5, s * 5, s * 3);
        // 头
        ctx.fillStyle = '#57534e';
        ctx.fillRect(px + s * 1.5, py + s * 0.5, s * 4, s * 2);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(px + s * 2, py + s * 0.8, s * 3, s * 1.2);
        // 发光眼睛
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + s * 2, py + s * 1, s * 0.8, s * 0.6);
        ctx.fillRect(px + s * 4.2, py + s * 1, s * 0.8, s * 0.6);
        ctx.restore();
        // 裂纹
        ctx.fillStyle = '#44403c';
        ctx.fillRect(px + s * 2.5, py + s * 3, s * 0.3, s * 2);
        ctx.fillRect(px + s * 4, py + s * 2.5, s * 0.3, s * 1.5);
        ctx.fillRect(px + s * 1.5, py + s * 4, s * 1.5, s * 0.3);
        // 粗壮手臂
        ctx.fillStyle = '#57534e';
        ctx.fillRect(px - s * 0.5, py + s * 2.5, s * 1.5, s * 3);
        ctx.fillRect(px + s * 6, py + s * 2.5, s * 1.5, s * 3);
        // 腿
        ctx.fillStyle = '#44403c';
        ctx.fillRect(px + s * 1, py + s * 6, s * 2, s * 1.5);
        ctx.fillRect(px + s * 4, py + s * 6, s * 2, s * 1.5);
        // 核心发光
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px + s * 3, py + s * 3.5, s * 1, s * 1);
        ctx.restore();
    }
}

// ========== Boss敌人 ==========
class BossEnemy extends Enemy {
    constructor(x, y, floor) {
        super(x, y, floor);
        this.size = 70; // Boss体型巨大（40 → 70）
        this.maxHp = 500 + floor * 100; // 大幅增强生命值（floor 10约1500 HP）
        this.hp = this.maxHp;
        this.damage = 10 + floor * 3; // 降低伤害平衡坦度（15+5f → 10+3f）
        this.speed = CONFIG.ENEMY_SPEED * 0.6; // 更慢更坦（0.7 → 0.6）
        this.shootCooldown = 0;
        this.isBoss = true;
        this.auraPhase = 0; // 能量光环动画
    }

    update(player, bullets) {
        // Boss追踪玩家
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 60) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        } else {
            this.vx = 0;
            this.vy = 0;
            if (this.attackCooldown <= 0) {
                player.takeDamage(this.damage);
                this.attackCooldown = 60;
            }
        }
        this.attackCooldown--;

        // Boss发射子弹
        this.shootCooldown--;
        if (this.shootCooldown <= 0 && bullets) {
            this.shootCooldown = 90;
            if (dist > 0) {
                const bullet = new Bullet(this.x, this.y, dx / dist, dy / dist, this.damage * 0.6, false, '#ff4444', 'enemy');
                bullets.push(bullet);
            }
        }

        // 直接调用Entity的update
        this.x += this.vx;
        this.y += this.vy;
    }

    drawPixelEnemy(ctx) {
        // Boss巨大能量光环（发光特效）
        this.auraPhase = (this.auraPhase + 1) % 120;
        const auraSize = 35 + Math.sin(this.auraPhase * 0.05) * 5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#a855f7';
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, auraSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        const s = 7; // Boss像素块更大（5 → 7）
        const px = Math.floor(this.x - 28); // 居中偏移增大
        const py = Math.floor(this.y - 28);

        // Boss史莱姆王 - 轮廓
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(px + s * 0, py + s * 4, s * 8, s * 4);
        ctx.fillRect(px + s * 1, py + s * 3, s * 6, s * 1);
        ctx.fillRect(px + s * 2, py + s * 2, s * 4, s * 1);
        ctx.fillRect(px + s * 2.5, py + s * 1, s * 3, s * 1);

        // 主体 (深红色)
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(px + s * 1, py + s * 4, s * 6, s * 3);
        ctx.fillRect(px + s * 2, py + s * 3, s * 4, s * 1);
        ctx.fillRect(px + s * 2.5, py + s * 2, s * 3, s * 1);

        // 高光 (红色)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(px + s * 2, py + s * 4, s * 4, s * 2);
        ctx.fillRect(px + s * 2.5, py + s * 3, s * 3, s * 1);

        // 王冠 (金色)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px + s * 2, py + s * 1.5, s * 1, s * 0.8);
        ctx.fillRect(px + s * 3.5, py + s * 1, s * 1, s * 1.3);
        ctx.fillRect(px + s * 5, py + s * 1.5, s * 1, s * 0.8);

        // 眼睛 (红光强化)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px + s * 2.5, py + s * 4.5, s * 1, s * 1);
        ctx.fillRect(px + s * 4.5, py + s * 4.5, s * 1, s * 1);

        // 眼睛发光
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(px + s * 2.7, py + s * 4.7, s * 0.6, s * 0.6);
        ctx.fillRect(px + s * 4.7, py + s * 4.7, s * 0.6, s * 0.6);
        ctx.shadowBlur = 0;

        // 能量核心 (紫色增强)
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(px + s * 3.5, py + s * 5.5, s * 1, s * 1);

        // 能量发光强化
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#a855f7';
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(px + s * 3.7, py + s * 5.7, s * 0.6, s * 0.6);
        ctx.shadowBlur = 0;
    }
}

// ========== 子弹 ==========
class Bullet extends Entity {
    constructor(x, y, dx, dy, damage, isPlayer, color = null, type = 'normal', maxRange = null) {
        super(x, y, 8, color || (isPlayer ? '#fbbf24' : '#ef4444'));
        this.vx = dx * CONFIG.BULLET_SPEED;
        this.vy = dy * CONFIG.BULLET_SPEED;
        this.damage = damage;
        this.isPlayer = isPlayer;
        this.bulletType = type;
        this.lifeTime = 100; // 生命周期
        this.canPierce = false; // 穿透能力
        this.maxRange = maxRange; // 最大飞行距离（null = 无限制）
        this.distanceTraveled = 0; // 已飞行距离
    }

    update(game = null) {
        // 追踪弹逻辑
        if (this.isHoming && game && game.enemies && game.enemies.length > 0) {
            let closest = null;
            let closestDist = Infinity;
            for (const enemy of game.enemies) {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < closestDist) {
                    closestDist = d;
                    closest = enemy;
                }
            }
            if (closest) {
                const dx = closest.x - this.x;
                const dy = closest.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    const turnRate = this.turnRate || 0.08;
                    this.vx += (dx / dist) * speed * turnRate;
                    this.vy += (dy / dist) * speed * turnRate;
                    // 保持速度恒定
                    const newSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (newSpeed > 0) {
                        this.vx = (this.vx / newSpeed) * speed;
                        this.vy = (this.vy / newSpeed) * speed;
                    }
                }
            }
        }

        super.update();
        this.lifeTime--;

        // 距离追踪
        const dx = this.vx;
        const dy = this.vy;
        const speed = Math.sqrt(dx * dx + dy * dy);
        this.distanceTraveled += speed;

        // 检查达到最大范围
        if (this.maxRange !== null && this.distanceTraveled >= this.maxRange) {
            this.lifeTime = 0; // 触发销毁
        }
    }

    draw(ctx) {
        ctx.save();

        switch (this.bulletType) {
            case 'melee_slash':
                // 近战弧形斩击特效
                ctx.globalAlpha = 0.7 * (this.lifeTime / 8);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(
                    this.originX, this.originY,
                    this.slashRange * (1 - this.lifeTime / 16),
                    this.slashAngle - this.slashArc / 2,
                    this.slashAngle + this.slashArc / 2
                );
                ctx.stroke();
                // 第二层更亮
                ctx.globalAlpha = 0.4 * (this.lifeTime / 8);
                ctx.lineWidth = 8;
                ctx.strokeStyle = '#fff';
                ctx.beginPath();
                ctx.arc(
                    this.originX, this.originY,
                    this.slashRange * (1 - this.lifeTime / 16) * 0.8,
                    this.slashAngle - this.slashArc / 3,
                    this.slashAngle + this.slashArc / 3
                );
                ctx.stroke();
                break;

            case 'slash':
                // 挥砍效果 - 弧形
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'magic':
            case 'arcane':
                // 魔法效果 - 发光
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                break;

            case 'elemental':
                // 元素效果 - 彩色粒子
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                break;

            case 'arrow':
                // 箭矢效果 - 尾迹
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x - this.vx * 0.8, this.y - this.vy * 0.8);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
                // 箭头
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'snipe':
                // 狙击效果 - 长条光束
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.x - this.vx * 0.5, this.y - this.vy * 0.5);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                break;

            case 'bull': {
                // 牛的像素单位
                const bs = 4;
                const bpx = Math.floor(this.x - 10);
                const bpy = Math.floor(this.y - 8);
                // 身体(棕色)
                ctx.fillStyle = '#78350f';
                ctx.fillRect(bpx + bs * 1, bpy + bs * 1, bs * 3, bs * 2.5);
                // 头
                ctx.fillStyle = '#92400e';
                ctx.fillRect(bpx + bs * 3.5, bpy + bs * 1, bs * 1.5, bs * 2);
                // 牛角
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(bpx + bs * 4, bpy + bs * 0, bs * 0.5, bs * 1);
                ctx.fillRect(bpx + bs * 4.5, bpy + bs * 0, bs * 0.5, bs * 1);
                // 眼睛
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(bpx + bs * 4, bpy + bs * 1.3, bs * 0.4, bs * 0.4);
                // 脚
                ctx.fillStyle = '#451a03';
                ctx.fillRect(bpx + bs * 1.2, bpy + bs * 3.2, bs * 0.6, bs * 1);
                ctx.fillRect(bpx + bs * 3, bpy + bs * 3.2, bs * 0.6, bs * 1);
                // 尘土特效
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = '#d4a574';
                ctx.fillRect(bpx - bs * 0.5, bpy + bs * 3, bs * 1, bs * 0.8);
                ctx.fillRect(bpx - bs * 1, bpy + bs * 2.5, bs * 0.6, bs * 0.6);
                ctx.globalAlpha = 1;
                break;
            }

            case 'wild_beast': {
                // 野兽(狼形)
                const ws = 3;
                const wpx = Math.floor(this.x - 8);
                const wpy = Math.floor(this.y - 6);
                ctx.fillStyle = '#65a30d';
                ctx.fillRect(wpx + ws * 1, wpy + ws * 1, ws * 3, ws * 2);
                ctx.fillStyle = '#4d7c0f';
                ctx.fillRect(wpx + ws * 3, wpy + ws * 0.5, ws * 2, ws * 1.5);
                // 耳朵
                ctx.fillRect(wpx + ws * 4, wpy - ws * 0.3, ws * 0.5, ws * 0.8);
                ctx.fillRect(wpx + ws * 4.5, wpy - ws * 0.3, ws * 0.5, ws * 0.8);
                // 眼
                ctx.fillStyle = '#facc15';
                ctx.fillRect(wpx + ws * 3.5, wpy + ws * 1, ws * 0.4, ws * 0.4);
                // 尾巴
                ctx.fillStyle = '#65a30d';
                ctx.fillRect(wpx - ws * 0.5, wpy + ws * 1.5, ws * 1.5, ws * 0.5);
                break;
            }

            case 'holy_orb': {
                // 圣光球 - 金色发光
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#facc15';
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.25, 0, Math.PI * 2);
                ctx.fill();
                // 十字光芒
                ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(this.x - this.size, this.y);
                ctx.lineTo(this.x + this.size, this.y);
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x, this.y + this.size);
                ctx.stroke();
                break;
            }

            case 'homing': {
                // 追踪弹 - 紫色尾迹
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
                // 拖尾
                ctx.globalAlpha = 0.4;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
                ctx.globalAlpha = 0.2;
                ctx.beginPath();
                ctx.moveTo(this.x - this.vx * 3, this.y - this.vy * 3);
                ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
                ctx.stroke();
                ctx.globalAlpha = 1;
                break;
            }

            case 'shuriken': {
                // 手里剑 - 旋转的星形
                const rot = Date.now() / 50;
                ctx.translate(this.x, this.y);
                ctx.rotate(rot);
                ctx.fillStyle = '#94a3b8';
                // 四角星
                for (let j = 0; j < 4; j++) {
                    ctx.rotate(Math.PI / 2);
                    ctx.fillRect(-1, -this.size, 2, this.size);
                }
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(-2, -2, 4, 4);
                break;
            }

            case 'flying_sword':
            case 'flying_sword_tri':
            case 'flying_sword_burst': {
                // 飞剑 — 旋转发光剑
                const swordRot = Date.now() / 80;
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const flyAngle = speed > 0 ? Math.atan2(this.vy, this.vx) : swordRot;
                ctx.translate(this.x, this.y);
                ctx.rotate(flyAngle + Math.PI / 4);
                // 剑光
                ctx.shadowBlur = 12;
                ctx.shadowColor = this.color;
                // 剑身
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(-2, -10, 4, 20);
                // 剑尖高光
                ctx.fillStyle = '#fff';
                ctx.fillRect(-1.5, -10, 3, 4);
                // 剑护手
                ctx.fillStyle = this.color;
                ctx.fillRect(-3.5, 8, 7, 3);
                // 剑柄
                ctx.fillStyle = '#78350f';
                ctx.fillRect(-1, 11, 2, 5);
                // 剑气尾迹
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = this.color;
                ctx.fillRect(-1, 14, 2, 8);
                ctx.globalAlpha = 0.15;
                ctx.fillRect(-0.5, 20, 1, 6);
                ctx.globalAlpha = 1;
                // 爆裂剑额外特效
                if (this.bulletType === 'flying_sword_burst') {
                    ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 100) * 0.2;
                    ctx.strokeStyle = '#7dd3fc';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, 10, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
                break;
            }

            case 'iai_visual': {
                // 居合斩特效 - 长光线
                const progress = 1 - this.lifeTime / 10;
                ctx.globalAlpha = 0.8 * (this.lifeTime / 10);
                ctx.strokeStyle = '#dc2626';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(this.originX, this.originY);
                const endX = this.originX + Math.cos(this.slashAngle) * this.slashRange * progress;
                const endY = this.originY + Math.sin(this.slashAngle) * this.slashRange * progress;
                ctx.lineTo(endX, endY);
                ctx.stroke();
                // 白光内层
                ctx.globalAlpha = 0.5 * (this.lifeTime / 10);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.originX, this.originY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                break;
            }

            default:
                super.draw(ctx);
        }

        ctx.restore();
    }

    isOutOfBounds() {
        // 检查子弹是否超出边界或生命周期结束
        return (
            this.lifeTime <= 0 ||
            this.x < -50 ||
            this.x > CONFIG.CANVAS_WIDTH + 50 ||
            this.y < -50 ||
            this.y > CONFIG.CANVAS_HEIGHT + 50
        );
    }
}

// ========== 音乐系统 ==========
class MusicManager {
    constructor() {
        this.audioContext = null;
        this.currentTrack = null;
        this.isMuted = false;
        this.volume = 0.4;
        this.sfxVolume = 0.3;
        this.initialized = false;
        this._pendingResume = false;

        // 监听用户首次交互以解锁AudioContext
        const unlockAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('🔊 AudioContext已解锁');
                    // 如果有待播放的音乐，重新播放
                    if (this._pendingResume) {
                        this._pendingResume = false;
                    }
                });
            }
            // 初始化（如果还没初始化的话）
            if (!this.initialized) {
                this.init();
            }
        };
        document.addEventListener('click', unlockAudio, { once: false });
        document.addEventListener('keydown', unlockAudio, { once: false });
        document.addEventListener('touchstart', unlockAudio, { once: false });
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // 立即尝试resume
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.initialized = true;
            console.log('🎵 音乐系统初始化成功, state:', this.audioContext.state);
        } catch (e) {
            console.warn('⚠️ 音乐系统初始化失败:', e);
        }
    }

    _ensureContext() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return false;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return true;
    }

    // ===== BGM =====
    playNormalBGM() {
        if (!this._ensureContext() || this.isMuted) return;
        this.stopAll();
        this.currentTrack = this.createNormalBGM();
    }

    playBossBGM() {
        if (!this._ensureContext() || this.isMuted) return;
        this.stopAll();
        this.currentTrack = this.createBossBGM();
    }

    playMenuBGM() {
        if (!this._ensureContext() || this.isMuted) return;
        this.stopAll();
        this.currentTrack = this.createMenuBGM();
    }

    createNormalBGM() {
        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.gain.value = this.volume * 0.35;
        gainNode.connect(ctx.destination);

        // 神秘探索风格 - 双层琶音
        const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
        const bass = [130.81, 164.81, 196.00, 130.81];
        let noteIndex = 0;
        let alive = true;

        const playNote = () => {
            if (!alive || this.isMuted || !this.currentTrack) return;
            try {
                // 主旋律
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = notes[noteIndex % notes.length];
                const noteGain = ctx.createGain();
                noteGain.gain.setValueAtTime(0, ctx.currentTime);
                noteGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.08);
                noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
                osc.connect(noteGain);
                noteGain.connect(gainNode);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 1.2);

                // 低音伴奏（每2拍）
                if (noteIndex % 2 === 0) {
                    const bassOsc = ctx.createOscillator();
                    bassOsc.type = 'triangle';
                    bassOsc.frequency.value = bass[Math.floor(noteIndex / 2) % bass.length];
                    const bassGain = ctx.createGain();
                    bassGain.gain.setValueAtTime(0, ctx.currentTime);
                    bassGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
                    bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
                    bassOsc.connect(bassGain);
                    bassGain.connect(gainNode);
                    bassOsc.start(ctx.currentTime);
                    bassOsc.stop(ctx.currentTime + 1.5);
                }

                noteIndex++;
                setTimeout(playNote, 700);
            } catch (e) { alive = false; }
        };

        playNote();
        return { gainNode, kill: () => { alive = false; } };
    }

    createBossBGM() {
        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.gain.value = this.volume * 0.4;
        gainNode.connect(ctx.destination);

        let beatCount = 0;
        let alive = true;

        const playBeat = () => {
            if (!alive || this.isMuted || !this.currentTrack) return;
            try {
                // 低音鼓
                const bassOsc = ctx.createOscillator();
                bassOsc.type = 'sine';
                bassOsc.frequency.setValueAtTime(120, ctx.currentTime);
                bassOsc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
                const bassGain = ctx.createGain();
                bassGain.gain.setValueAtTime(0.6, ctx.currentTime);
                bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
                bassOsc.connect(bassGain);
                bassGain.connect(gainNode);
                bassOsc.start(ctx.currentTime);
                bassOsc.stop(ctx.currentTime + 0.18);

                // 高音（每两拍）
                if (beatCount % 2 === 0) {
                    const trebleOsc = ctx.createOscillator();
                    trebleOsc.type = 'sawtooth';
                    trebleOsc.frequency.value = 800 + (beatCount % 8) * 100;
                    const trebleGain = ctx.createGain();
                    trebleGain.gain.setValueAtTime(0.12, ctx.currentTime);
                    trebleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
                    trebleOsc.connect(trebleGain);
                    trebleGain.connect(gainNode);
                    trebleOsc.start(ctx.currentTime);
                    trebleOsc.stop(ctx.currentTime + 0.08);
                }

                // 紧张旋律（每4拍）
                if (beatCount % 4 === 0) {
                    const melodyNotes = [440, 523.25, 659.25, 523.25];
                    const melOsc = ctx.createOscillator();
                    melOsc.type = 'square';
                    melOsc.frequency.value = melodyNotes[(beatCount / 4) % melodyNotes.length];
                    const melGain = ctx.createGain();
                    melGain.gain.setValueAtTime(0.08, ctx.currentTime);
                    melGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                    melOsc.connect(melGain);
                    melGain.connect(gainNode);
                    melOsc.start(ctx.currentTime);
                    melOsc.stop(ctx.currentTime + 0.2);
                }

                beatCount++;
                setTimeout(playBeat, 220);
            } catch (e) { alive = false; }
        };

        playBeat();
        return { gainNode, kill: () => { alive = false; } };
    }

    createMenuBGM() {
        const ctx = this.audioContext;
        const gainNode = ctx.createGain();
        gainNode.gain.value = this.volume * 0.3;
        gainNode.connect(ctx.destination);

        const melody = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.00];
        let noteIndex = 0;
        let alive = true;

        const playNote = () => {
            if (!alive || this.isMuted || !this.currentTrack) return;
            try {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = melody[noteIndex % melody.length];
                const noteGain = ctx.createGain();
                noteGain.gain.setValueAtTime(0, ctx.currentTime);
                noteGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.04);
                noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
                osc.connect(noteGain);
                noteGain.connect(gainNode);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.7);

                // 和弦衬底（每3拍）
                if (noteIndex % 3 === 0) {
                    const chordOsc = ctx.createOscillator();
                    chordOsc.type = 'sine';
                    chordOsc.frequency.value = melody[noteIndex % melody.length] * 0.5;
                    const chordGain = ctx.createGain();
                    chordGain.gain.setValueAtTime(0, ctx.currentTime);
                    chordGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
                    chordGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
                    chordOsc.connect(chordGain);
                    chordGain.connect(gainNode);
                    chordOsc.start(ctx.currentTime);
                    chordOsc.stop(ctx.currentTime + 1.2);
                }

                noteIndex++;
                setTimeout(playNote, 550);
            } catch (e) { alive = false; }
        };

        playNote();
        return { gainNode, kill: () => { alive = false; } };
    }

    stopAll() {
        if (this.currentTrack) {
            if (this.currentTrack.kill) this.currentTrack.kill();
            if (this.currentTrack.gainNode) {
                try { this.currentTrack.gainNode.disconnect(); } catch (e) { }
            }
            this.currentTrack = null;
        }
    }

    toggle() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAll();
        }
        return this.isMuted;
    }

    // ===== 音效系统 (SFX) =====
    playSFX(type) {
        if (!this._ensureContext() || this.isMuted) return;
        try {
            switch (type) {
                case 'slash': this._playSlashSFX(); break;
                case 'magic': this._playMagicSFX(); break;
                case 'arrow': this._playArrowSFX(); break;
                case 'summon': this._playSummonSFX(); break;
                case 'holy': this._playHolySFX(); break;
                case 'shuriken': this._playShurikenSFX(); break;
                case 'sword': this._playSwordSFX(); break;
                case 'hit': this._playHitSFX(); break;
                case 'deflect': this._playDeflectSFX(); break;
            }
        } catch (e) {
            // 音效播放失败不影响游戏
        }
    }

    _playSlashSFX() {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    _playMagicSFX() {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
    }

    _playArrowSFX() {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
    }

    _playSummonSFX() {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }

    _playHolySFX() {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1500, ctx.currentTime + 0.06);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    }

    _playShurikenSFX() {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    }

    _playSwordSFX() {
        const ctx = this.audioContext;
        // 飞剑音效 - 金属嗡鸣
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    }

    _playHitSFX() {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    }

    _playDeflectSFX() {
        const ctx = this.audioContext;
        // 金属碰撞反弹音
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
    }
}

// ========== 游戏主类 ==========
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        this.state = 'menu'; // menu, classSelect, playing, reward, rest, end, classAdvance, victory
        this.floor = 1;
        this.roomType = 'combat'; // combat, reward, rest, boss
        this.player = null;
        this.selectedClass = null; // 当前选择的职业
        this.enemies = [];
        this.bullets = [];
        this.damageTexts = []; // 伤害飘字
        this.particles = []; // 击杀粒子特效
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.isPaused = false;
        this.isSpawningEnemies = false; // 标记是否正在生成敌人
        this.isMouseDown = false; // 鼠标按下状态
        this.isGameLoopRunning = false; // 标记游戏循环是否已启动
        this.endless = false; // 无尽模式标志

        // 帧率控制（锁定60fps逻辑更新）
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS; // 16.667ms
        this.lastFrameTime = 0;
        this.accumulator = 0;

        // 音乐系统
        this.music = new MusicManager();

        this.stats = {
            kills: 0,
            coinsEarned: 0
        };

        this.init();
        this.loadStats();
        this.startGameLoop(); // 在初始化后立即启动游戏循环

        // 延迟启动主菜单音乐（等待用户首次交互）
        setTimeout(() => {
            this.music.playMenuBGM();
        }, 100);
    }

    init() {
        console.log('🎮 初始化游戏事件监听器');

        // 键盘事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // 空格键冲刺
            if (e.key === ' ' && this.state === 'playing' && this.player) {
                e.preventDefault();
                this.player.dash();
            }

            // ESC 暂停
            if (e.key === 'Escape' && this.state === 'playing') {
                this.isPaused ? this.resume() : this.pause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.state === 'playing' && this.player) {
                this.isMouseDown = true;
                const rect = this.canvas.getBoundingClientRect();
                this.player.shoot(e.clientX - rect.left, e.clientY - rect.top, this.bullets, this);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }

    loadStats() {
        document.getElementById('totalCoins').textContent = SaveSystem.coins;
        document.getElementById('totalRuns').textContent = SaveSystem.totalRuns;
        document.getElementById('victories').textContent = SaveSystem.victories;

        // 如果在主菜单，播放主菜单音乐
        if (this.state === 'menu') {
            this.music.playMenuBGM();
        }
    }

    resetGame() {
        console.log('🔄 重置游戏状态');
        // 重置游戏状态
        this.floor = 1;
        this.player = null;
        this.selectedClass = null;
        this.enemies = [];
        this.bullets = [];
        this.damageTexts = [];
        this.particles = [];
        this.stats = { kills: 0, coinsEarned: 0 };
        this.isPaused = false;
        this.isSpawningEnemies = false;
        this.isMouseDown = false;
        this.endless = false;
        this.roomType = 'combat';

        // 停止所有音乐
        this.music.stopAll();
        console.log('✅ 游戏状态已重置');
    }

    startRun() {
        console.log('📍 startRun 被调用');
        // 重置游戏状态
        this.resetGame();
        // 显示职业选择界面
        this.state = 'classSelect';
        this.showScreen('classSelectScreen');
        this.renderClassSelection();
    }

    startEndlessMode() {
        console.log('🔥 开始无尽模式');
        // 重置游戏状态
        this.resetGame();
        this.endless = true;
        // 显示职业选择界面
        this.state = 'classSelect';
        this.showScreen('classSelectScreen');
        this.renderClassSelection();
    }

    renderClassSelection() {
        const container = document.getElementById('classCards');
        const preview = document.getElementById('classPreview');
        container.innerHTML = '';

        // 显示默认提示
        preview.innerHTML = `
            <div class="preview-placeholder">
                <span class="preview-hint">← 将鼠标移到角色上查看详情</span>
            </div>
        `;

        // 获取稀有度颜色
        const getRarityInfo = (cls) => {
            if (cls.from) return { label: '进阶', color: '#fbbf24', border: '#92400e' };
            return { label: '基础', color: '#94a3b8', border: '#3d4866' };
        };

        Object.values(CLASSES).forEach(cls => {
            const card = document.createElement('div');
            card.className = 'class-grid-item';
            card.innerHTML = `<span class="grid-icon">${cls.icon}</span><span class="grid-name">${cls.name}</span>`;

            // 悬停显示详情
            card.onmouseenter = () => {
                const rInfo = getRarityInfo(cls);
                preview.innerHTML = `
                    <div class="preview-card">
                        <div class="preview-header">
                            <div class="preview-icon">${cls.icon}</div>
                            <div class="preview-title">
                                <h3>${cls.name}</h3>
                                <span class="preview-rarity" style="color:${rInfo.color}">${rInfo.label}职业</span>
                            </div>
                        </div>
                        <p class="preview-desc">${cls.desc}</p>
                        <div class="preview-skill">
                            <span class="skill-label">⚔ 技能</span>
                            <span class="skill-text">${cls.skill || '普通攻击'}</span>
                        </div>
                        <div class="preview-stats">
                            <div class="stat-item"><span class="stat-icon">❤</span> 生命 <span class="stat-val">${cls.baseHp}</span></div>
                            <div class="stat-item"><span class="stat-icon">⚔</span> 攻击 <span class="stat-val">${cls.baseDamage}</span></div>
                            <div class="stat-item"><span class="stat-icon">⚡</span> 速度 <span class="stat-val">${cls.baseSpeed.toFixed(1)}</span></div>
                        </div>
                        ${cls.advances ? `<div class="preview-advance">📈 可进阶: ${cls.advances.map(a => ADVANCED_CLASSES[a]?.name || a).join('、')}</div>` : ''}
                        ${cls.from ? `<div class="preview-from">🔗 进阶自: ${Object.values(CLASSES).find(c => c.advances?.includes(cls.id))?.name || '?'}</div>` : ''}
                        <button class="btn-select-class" id="selectClassBtn">选择此角色</button>
                    </div>
                `;
                document.getElementById('selectClassBtn').onclick = () => this.selectClass(cls);
                // 高亮当前卡片
                container.querySelectorAll('.class-grid-item').forEach(c => c.classList.remove('hovered'));
                card.classList.add('hovered');
            };

            card.onclick = () => this.selectClass(cls);
            container.appendChild(card);
        });
    }

    selectClass(classData) {
        console.log('========================================');
        console.log('🎯 选择职业:', classData.name);
        console.log('🎯 职业类型:', classData.weaponType);

        try {
            this.selectedClass = classData;

            // 创建玩家（使用当前floor，可能是1也可能是无尽模式继承的层数）
            this.player = new Player(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, classData);
            console.log('✅ 玩家创建成功:', this.player.className);

            // 清空战斗相关的数组（如果之前有残留）
            this.enemies = [];
            this.bullets = [];
            this.damageTexts = [];
            this.particles = [];

            // 确保floor已设置（startRun已经设置了）
            if (!this.floor || this.floor < 1) {
                this.floor = 1;
            }

            console.log('🎮 游戏状态检查:');
            console.log('  - floor:', this.floor);
            console.log('  - endless:', this.endless);
            console.log('  - player:', this.player ? '✅' : '❌');
            console.log('  - playerClass:', this.player ? this.player.className : 'N/A');
            console.log('  - weaponType:', this.player ? this.player.weaponType : 'N/A');
            console.log('  - keys对象:', this.keys);
            console.log('  - 全局game对象:', typeof window.game !== 'undefined' ? '✅' : '❌');

            // 切换到游戏界面
            this.showScreen('gameScreen');

            // 设置状态为playing（在showScreen之后，确保界面已切换）
            this.state = 'playing';
            console.log('✅ 状态设置为 playing');

            // 开始战斗房间
            this.startCombatRoom();
            console.log('✅ 职业选择完成，游戏开始！');
            console.log('========================================');
        } catch (error) {
            console.error('❌ selectClass 发生错误:', error);
            console.error('错误堆栈:', error.stack);
            alert('选择职业时发生错误：' + error.message);
        }
    }

    startCombatRoom() {
        console.log('⚔️ 开始战斗房间 - 楼层:', this.floor);
        this.roomType = 'combat';
        this.enemies = [];
        this.isSpawningEnemies = true; // 开始生成敌人

        // 检查是否为Boss关
        const isBossFloor = CONFIG.BOSS_FLOORS.includes(this.floor);
        console.log('Boss关卡?', isBossFloor);

        // 播放对应的背景音乐
        if (isBossFloor) {
            this.music.playBossBGM();
        } else {
            this.music.playNormalBGM();
        }

        if (isBossFloor) {
            // Boss关：生成一个Boss和少量小怪（远离玩家）
            setTimeout(() => {
                // 在离玩家最远的角落生成Boss
                const corners = [
                    { x: 80, y: 80 }, { x: CONFIG.CANVAS_WIDTH - 80, y: 80 },
                    { x: 80, y: CONFIG.CANVAS_HEIGHT - 80 }, { x: CONFIG.CANVAS_WIDTH - 80, y: CONFIG.CANVAS_HEIGHT - 80 }
                ];
                let bestCorner = corners[0];
                let bestDist = 0;
                if (this.player) {
                    for (const c of corners) {
                        const d = Math.sqrt((c.x - this.player.x) ** 2 + (c.y - this.player.y) ** 2);
                        if (d > bestDist) { bestDist = d; bestCorner = c; }
                    }
                }
                this.enemies.push(new BossEnemy(bestCorner.x, bestCorner.y, this.floor));
                console.log('👑 Boss生成完成');
            }, 500);

            // 添加2个小怪辅助
            for (let i = 0; i < 2; i++) {
                setTimeout(() => {
                    this.spawnEnemy();
                    console.log('👾 生成小怪', i + 1, '/2');
                    if (i === 1) {
                        this.isSpawningEnemies = false; // 所有敌人生成完毕
                        console.log('✅ Boss关敌人生成完成');
                    }
                }, (i + 1) * CONFIG.ENEMY_SPAWN_DELAY);
            }
        } else {
            // 普通关：生成多个普通敌人
            const enemyCount = 3 + Math.floor(this.floor / 2);
            console.log('👾 将生成', enemyCount, '个普通敌人');
            for (let i = 0; i < enemyCount; i++) {
                setTimeout(() => {
                    this.spawnEnemy();
                    console.log('👾 生成敌人', (i + 1), '/', enemyCount);
                    if (i === enemyCount - 1) {
                        this.isSpawningEnemies = false; // 所有敌人生成完毕
                        console.log('✅ 所有敌人生成完成');
                    }
                }, i * CONFIG.ENEMY_SPAWN_DELAY);
            }
        }
    }

    spawnEnemy() {
        const minDistFromPlayer = 150; // 最小生成距离
        let x, y;
        let attempts = 0;

        // 尝试找到离玩家足够远的位置
        do {
            const side = Math.floor(Math.random() * 4);
            const margin = 40;
            switch (side) {
                case 0: x = margin + Math.random() * (CONFIG.CANVAS_WIDTH - margin * 2); y = margin; break;
                case 1: x = margin + Math.random() * (CONFIG.CANVAS_WIDTH - margin * 2); y = CONFIG.CANVAS_HEIGHT - margin; break;
                case 2: x = margin; y = margin + Math.random() * (CONFIG.CANVAS_HEIGHT - margin * 2); break;
                case 3: x = CONFIG.CANVAS_WIDTH - margin; y = margin + Math.random() * (CONFIG.CANVAS_HEIGHT - margin * 2); break;
            }
            attempts++;
        } while (
            this.player &&
            Math.sqrt((x - this.player.x) ** 2 + (y - this.player.y) ** 2) < minDistFromPlayer &&
            attempts < 20
        );

        this.enemies.push(new Enemy(x, y, this.floor));
    }

    startGameLoop() {
        if (this.isGameLoopRunning) return; // 防止重复启动
        this.isGameLoopRunning = true;
        this.lastFrameTime = performance.now();
        this.accumulator = 0;
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {
        try {
            // 计算帧间隔时间
            const deltaTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;

            // 防止极端情况（切换标签页后回来等）
            const clampedDelta = Math.min(deltaTime, 200);

            // 累积时间，按固定步长（16.667ms = 60fps）更新游戏逻辑
            this.accumulator += clampedDelta;

            // 只在playing状态且未暂停时更新游戏逻辑
            if (this.state === 'playing' && !this.isPaused) {
                // 按60fps步长消耗累积时间
                while (this.accumulator >= this.frameInterval) {
                    this.update();
                    this.accumulator -= this.frameInterval;
                }
                // 每个渲染帧都绘制（保持视觉平滑）
                this.render();
                this.updateHUD();
            } else {
                // 非playing状态也要消耗累积时间，防止切回时爆发更新
                this.accumulator = 0;
            }
        } catch (error) {
            console.error('❌ gameLoop 发生错误:', error);
            console.error('错误堆栈:', error.stack);
            // 暂停游戏避免循环错误
            this.isPaused = true;
            alert('游戏运行时发生错误：' + error.message + '\n\n请查看控制台了解详情');
        }

        // 无论什么状态都要保持游戏循环运行
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    update() {
        if (!this.player) {
            console.warn('⚠️ update被调用但player不存在');
            return;
        }

        // 更新玩家
        this.player.update(this.keys);

        // 鼠标持续攻击
        if (this.isMouseDown && this.player.shootCooldown === 0) {
            this.player.shoot(this.mouseX, this.mouseY, this.bullets, this);
        }

        // 更新敌人
        for (const enemy of this.enemies) {
            if (enemy instanceof BossEnemy) {
                enemy.update(this.player, this.bullets);
            } else {
                enemy.update(this.player);
            }
        }

        // 更新子弹
        for (const bullet of this.bullets) {
            bullet.update(this); // 传入 game 对象以支持分裂弹
        }

        // 碰撞检测
        this.checkCollisions();

        // 移除超出边界的子弹
        this.bullets = this.bullets.filter(b => !b.isOutOfBounds());

        // 更新伤害飘字
        this.damageTexts = this.damageTexts.filter(dt => dt.update());

        // 更新粒子特效
        this.particles = this.particles.filter(p => p.update());

        // 检查房间清理（只有在敌人生成完成且所有敌人被消灭时触发）
        if (this.roomType === 'combat' && !this.isSpawningEnemies && this.enemies.length === 0) {
            this.onRoomCleared();
        }

        // 检查玩家死亡
        if (this.player.hp <= 0) {
            // 检查是否有复活
            if (this.player.revive) {
                this.player.revive = false;
                this.player.hp = this.player.maxHp * 0.5;
                this.damageTexts.push(new DamageText(this.player.x, this.player.y - 20, '复活！', '#fbbf24', true));
                // 复活特效
                for (let i = 0; i < 20; i++) {
                    this.particles.push(new Particle(this.player.x, this.player.y, '#fbbf24'));
                }
            } else {
                this.gameOver();
            }
        }
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            if (bullet.isPlayer) {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    if (bullet.collidesWith(enemy)) {
                        const isCrit = Math.random() < this.player.critChance;
                        const critMult = this.player.critMultiplier || 2;
                        const damage = bullet.damage * (isCrit ? critMult : 1);

                        // 伤害飘字
                        const dmgColor = isCrit ? '#fbbf24' : '#fff';
                        this.damageTexts.push(new DamageText(enemy.x, enemy.y - 10, Math.floor(damage).toString(), dmgColor, isCrit));

                        // 圣光弹命中回血
                        if (bullet.healOnHit && this.player) {
                            this.player.heal(bullet.healOnHit);
                        }

                        if (enemy.takeDamage(damage)) {
                            // 击杀特效粒子
                            for (let k = 0; k < 8; k++) {
                                this.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
                            }

                            this.enemies.splice(j, 1);
                            this.stats.kills++;
                            this.player.onKillEnemy(); // 触发击杀效果（嗜血狂暴等）

                            // 掉落金币（怪物强度越高掉越多）
                            const baseCoin = enemy.isBoss ? 20 : (5 + Math.floor(this.floor * 1.5));
                            const coinDrop = baseCoin + Math.floor(Math.random() * 5);

                            // 磁铁效果：如果有磁铁，金币直接吸收
                            if (this.player.magnetRange) {
                                this.player.coins += coinDrop;
                                this.stats.coinsEarned += coinDrop;
                                this.damageTexts.push(new DamageText(this.player.x, this.player.y - 30, '+' + coinDrop + '🪙', '#fbbf24'));
                            } else {
                                this.player.coins += coinDrop;
                                this.stats.coinsEarned += coinDrop;
                                this.damageTexts.push(new DamageText(enemy.x, enemy.y + 10, '+' + coinDrop + '🪙', '#fbbf24'));
                            }

                            // 反弹护甲伤害
                            // (thornsDamage handled in takeDamage)

                            // 吸血
                            if (this.player.lifeSteal > 0) {
                                this.player.heal(damage * this.player.lifeSteal);
                            }
                        }

                        // 飞剑爆炸（御剑仙人）
                        if (bullet.explodeOnHit) {
                            const explodeRadius = 80;
                            // 爆炸视觉特效
                            for (let k = 0; k < 12; k++) {
                                this.particles.push(new Particle(bullet.x, bullet.y, '#38bdf8'));
                                this.particles.push(new Particle(bullet.x, bullet.y, '#fbbf24'));
                            }
                            // 对范围内所有敌人造成伤害
                            for (let ej = this.enemies.length - 1; ej >= 0; ej--) {
                                if (ej === j) continue; // 已经受伤的敌人跳过
                                const ae = this.enemies[ej];
                                const adx = ae.x - bullet.x;
                                const ady = ae.y - bullet.y;
                                if (Math.sqrt(adx * adx + ady * ady) <= explodeRadius) {
                                    const aoeDmg = bullet.damage * 0.7;
                                    this.damageTexts.push(new DamageText(ae.x, ae.y - 10, Math.floor(aoeDmg).toString(), '#38bdf8'));
                                    if (ae.takeDamage(aoeDmg)) {
                                        for (let k = 0; k < 8; k++) this.particles.push(new Particle(ae.x, ae.y, ae.color));
                                        const bc = ae.isBoss ? 20 : (5 + Math.floor(this.floor * 1.5));
                                        this.player.coins += bc;
                                        this.stats.coinsEarned += bc;
                                        this.stats.kills++;
                                        this.player.onKillEnemy();
                                        this.enemies.splice(ej, 1);
                                        if (ej < j) j--; // 调整索引
                                    }
                                }
                            }
                            if (this.music) this.music.playSFX('hit');
                            this.bullets.splice(i, 1);
                            break;
                        }

                        // 穿透子弹不移除，否则移除
                        if (!bullet.canPierce) {
                            this.bullets.splice(i, 1);
                            break;
                        }
                        // 穿透子弹继续检测下一个敌人
                    }
                }
            } else {
                // 敌方子弹 vs 玩家
                if (this.player && bullet.collidesWith(this.player)) {
                    this.player.takeDamage(bullet.damage);
                    this.damageTexts.push(new DamageText(this.player.x, this.player.y - 10, Math.floor(bullet.damage).toString(), '#ef4444'));
                    this.bullets.splice(i, 1);
                }
            }
        }
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = '#1a1d2e';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // 绘制网格
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += CONFIG.TILE_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += CONFIG.TILE_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
            this.ctx.stroke();
        }

        // 绘制边框
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // 绘制实体
        for (const bullet of this.bullets) bullet.draw(this.ctx);
        for (const enemy of this.enemies) enemy.draw(this.ctx);
        if (this.player) this.player.draw(this.ctx);

        // 绘制粒子特效
        for (const particle of this.particles) particle.draw(this.ctx);

        // 绘制伤害飘字
        for (const dt of this.damageTexts) dt.draw(this.ctx);

        // 绘制波数提示
        if (this.isSpawningEnemies || this.enemies.length > 0) {
            this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
            this.ctx.font = '14px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`敌人: ${this.enemies.length}`, 10, CONFIG.CANVAS_HEIGHT - 10);
        }

        // 绘制Boss血条
        const boss = this.enemies.find(e => e.isBoss);
        if (boss) {
            this.drawBossHealthBar(this.ctx, boss);
        }

        // 绘制塔形进度条
        this.drawTowerProgress(this.ctx);

    }

    drawBossHealthBar(ctx, boss) {
        const barWidth = 320;
        const barHeight = 18;
        const x = (CONFIG.CANVAS_WIDTH - barWidth) / 2;
        const y = 16;

        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(x - 4, y - 4, barWidth + 8, barHeight + 22);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 4, y - 4, barWidth + 8, barHeight + 22);

        // Boss名字
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        const bossName = `👑 ${this.floor}层 Boss — 史莱姆王`;
        ctx.fillText(bossName, CONFIG.CANVAS_WIDTH / 2, y + 10);

        // 血条底色
        ctx.fillStyle = '#374151';
        ctx.fillRect(x, y + 14, barWidth, barHeight - 8);

        // 血条颜色（根据血量变色）
        const hpPercent = boss.hp / boss.maxHp;
        let barColor;
        if (hpPercent > 0.6) barColor = '#ef4444';
        else if (hpPercent > 0.3) barColor = '#f59e0b';
        else barColor = '#dc2626';

        // 血条
        ctx.fillStyle = barColor;
        ctx.fillRect(x, y + 14, barWidth * hpPercent, barHeight - 8);

        // 血条高光
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x, y + 14, barWidth * hpPercent, (barHeight - 8) / 2);

        // HP数字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(boss.hp)} / ${boss.maxHp}`, CONFIG.CANVAS_WIDTH / 2, y + 22);
    }

    updateHUD() {
        if (!this.player) return;

        // 更新血条
        const healthPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        document.getElementById('healthText').textContent = Math.ceil(this.player.hp) + '/' + this.player.maxHp;

        // 更新金币和层数
        document.getElementById('coinsText').textContent = this.player.coins;
        document.getElementById('floorText').textContent = this.floor;
    }

    drawTowerProgress(ctx) {
        const towerX = CONFIG.CANVAS_WIDTH - 60;
        const towerY = 80;

        // 无尽模式：显示当前楼层数字而非塔结构
        if (this.endless && this.floor > CONFIG.TOTAL_FLOORS) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(towerX - 40, towerY - 10, 80, 60);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.strokeRect(towerX - 40, towerY - 10, 80, 60);

            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('无尽模式', towerX, towerY + 10);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px monospace';
            ctx.fillText('层数: ' + this.floor, towerX, towerY + 35);
            return;
        }

        // 正常模式：绘制10层塔
        const floorHeight = 48;
        const baseWidth = 50;

        // 绘制塔的每一层
        for (let i = 0; i < CONFIG.TOTAL_FLOORS; i++) {
            const floorNum = CONFIG.TOTAL_FLOORS - i;
            const y = towerY + i * floorHeight;
            const width = baseWidth - i * 1.5; // 越往上越窄
            const x = towerX - width / 2;

            // 判断状态
            const isBoss = CONFIG.BOSS_FLOORS.includes(floorNum);
            const isCleared = floorNum < this.floor;
            const isCurrent = floorNum === this.floor;

            // 选择颜色
            let color;
            if (isCleared) {
                color = 'rgba(74, 222, 128, 0.8)'; // 已通过 - 绿色
            } else if (isCurrent) {
                color = 'rgba(251, 191, 36, 0.9)'; // 当前层 - 黄色
            } else if (isBoss) {
                color = 'rgba(220, 38, 38, 0.6)'; // Boss层 - 红色
            } else {
                color = 'rgba(107, 114, 128, 0.4)'; // 未到达 - 灰色
            }

            // 绘制楼层
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, floorHeight - 5);

            // 绘制边框
            ctx.strokeStyle = isCurrent ? '#fbbf24' : 'rgba(31, 41, 55, 0.8)';
            ctx.lineWidth = isCurrent ? 3 : 2;
            ctx.strokeRect(x, y, width, floorHeight - 5);

            // 绘制楼层号
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(floorNum, towerX, y + 27);

            // Boss层标记
            if (isBoss) {
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 16px Arial';
                ctx.fillText('👑', towerX + width / 2 + 12, y + 28);
            }
        }

        // 绘制塔顶
        const topY = towerY - 25;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(towerX, topY);
        ctx.lineTo(towerX - 18, topY + 25);
        ctx.lineTo(towerX + 18, topY + 25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(31, 41, 55, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 塔顶星星
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('⭐', towerX, topY + 17);
    }

    onRoomCleared() {
        this.state = 'transition';

        setTimeout(() => {
            // 检查是否刚通过Boss关，且职业可以进阶
            const isBossFloor = CONFIG.BOSS_FLOORS.includes(this.floor);
            const canAdvance = isBossFloor && this.selectedClass &&
                this.selectedClass.advances &&
                this.selectedClass.advances.length > 0;

            if (canAdvance) {
                this.showClassAdvancement();
            } else if (this.floor % 3 === 0) {
                this.showRestRoom();
            } else {
                this.showRewardRoom();
            }
        }, 500);
    }

    showClassAdvancement() {
        this.state = 'classAdvance';
        this.showScreen('classAdvanceScreen');

        const container = document.getElementById('advanceCards');
        container.innerHTML = '';

        const currentClass = document.getElementById('currentClassName');
        currentClass.textContent = this.selectedClass.name;

        this.selectedClass.advances.forEach(advanceId => {
            const advClass = ADVANCED_CLASSES[advanceId];
            const card = document.createElement('div');
            card.className = 'class-card advance-card';
            card.innerHTML = `
                <div class="class-icon">${advClass.icon}</div>
                <h3>${advClass.name}</h3>
                <p class="class-desc">${advClass.desc}</p>
                <div class="class-stats">
                    <div>❤ ${advClass.baseHp} <span class="stat-diff">(+${advClass.baseHp - this.selectedClass.baseHp})</span></div>
                    <div>⚔ ${advClass.baseDamage} <span class="stat-diff">(+${advClass.baseDamage - this.selectedClass.baseDamage})</span></div>
                    <div>⚡ ${advClass.baseSpeed.toFixed(1)} <span class="stat-diff">(+${(advClass.baseSpeed - this.selectedClass.baseSpeed).toFixed(1)})</span></div>
                </div>
            `;
            card.onclick = () => this.advanceClass(advClass);
            container.appendChild(card);
        });
    }

    advanceClass(advancedClass) {
        // 保存当前血量百分比
        const hpPercent = this.player.hp / this.player.maxHp;

        // 更新职业
        this.selectedClass = advancedClass;
        this.player.classData = advancedClass;
        this.player.className = advancedClass.name;
        this.player.weaponType = advancedClass.weaponType;
        this.player.weaponColor = advancedClass.weaponColor;

        // 更新属性
        const oldMaxHp = this.player.maxHp;
        this.player.maxHp = advancedClass.baseHp;
        this.player.hp = this.player.maxHp * hpPercent; // 保持血量百分比
        this.player.damage = advancedClass.baseDamage;
        this.player.speed = advancedClass.baseSpeed;

        // 继续游戏流程
        if (this.floor % 3 === 0) {
            this.showRestRoom();
        } else {
            this.showRewardRoom();
        }
    }

    showRewardRoom() {
        this.state = 'reward';
        this.showScreen('rewardScreen');

        const rewardCards = document.getElementById('rewardCards');
        rewardCards.innerHTML = '';

        const availableRewards = [...REWARDS];
        const selectedRewards = [];

        for (let i = 0; i < 3 && availableRewards.length > 0; i++) {
            const index = Math.floor(Math.random() * availableRewards.length);
            selectedRewards.push(availableRewards[index]);
            availableRewards.splice(index, 1);
        }

        selectedRewards.forEach(reward => {
            const card = document.createElement('div');
            card.className = `reward-card rarity-${reward.rarity}`;
            card.innerHTML = `
                <div class="reward-icon">${reward.icon}</div>
                <h3>${reward.name}</h3>
                <p>${reward.desc}</p>
            `;
            card.onclick = () => this.selectReward(reward);
            rewardCards.appendChild(card);
        });
    }

    selectReward(reward) {
        reward.effect(this.player);
        this.nextRoom();
    }

    showRestRoom() {
        this.state = 'rest';
        this.showScreen('restScreen');

        document.getElementById('restCoins').textContent = this.player.coins;

        // 免费奖励（多选一）
        const freeRewards = document.getElementById('freeRewards');
        freeRewards.innerHTML = '';

        const freeOptions = [
            { name: '生命强化', desc: '最大生命值 +30', icon: '❤️', effect: (p) => { p.maxHp += 30; p.hp = p.maxHp; } },
            { name: '力量增强', desc: '攻击伤害 +5', icon: '⚔️', effect: (p) => p.damage += 5 },
            { name: '紧急治疗', desc: '恢复 50% 生命值', icon: '💚', effect: (p) => p.heal(p.maxHp * 0.5) }
        ];

        let freeRewardPicked = false;
        const freeCards = [];

        freeOptions.forEach(reward => {
            const card = document.createElement('div');
            card.className = 'reward-card rarity-1';
            card.innerHTML = `
                <div class="reward-icon">${reward.icon}</div>
                <h3>${reward.name}</h3>
                <p>${reward.desc}</p>
                <div style="font-size:11px;color:#9ca3af;margin-top:4px">（三选一）</div>
            `;
            card.onclick = () => {
                if (freeRewardPicked) return;
                freeRewardPicked = true;
                reward.effect(this.player);
                // 选中的高亮，其他变暗
                freeCards.forEach(c => {
                    if (c === card) {
                        c.style.border = '2px solid #22c55e';
                        c.style.opacity = '1';
                    } else {
                        c.style.opacity = '0.3';
                        c.style.pointerEvents = 'none';
                    }
                });
            };
            freeCards.push(card);
            freeRewards.appendChild(card);
        });

        // 商店物品
        const shopItems = document.getElementById('shopItems');
        shopItems.innerHTML = '';

        SHOP_ITEMS.forEach(item => {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            shopItem.innerHTML = `
                <div class="reward-icon">${item.icon}</div>
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <div class="price">🪙 ${item.price}</div>
            `;
            shopItem.onclick = () => this.buyItem(item, shopItem);
            shopItems.appendChild(shopItem);
        });
    }

    buyItem(item, element) {
        if (this.player.coins >= item.price && !element.classList.contains('sold-out')) {
            this.player.coins -= item.price;
            item.effect(this.player);
            element.classList.add('sold-out');
            document.getElementById('restCoins').textContent = this.player.coins;
        }
    }

    nextRoom() {
        this.floor++;

        // 检查是否通关第10层（非无尽模式）
        if (this.floor > CONFIG.TOTAL_FLOORS && !this.endless) {
            this.showVictory();
            return;
        }

        this.state = 'playing';
        this.showScreen('gameScreen');
        this.startCombatRoom();
        // gameLoop已在构造函数中启动，无需重复调用
    }

    showVictory() {
        this.state = 'victory';
        this.showScreen('victoryScreen');
        document.getElementById('victoryKills').textContent = this.stats.kills;
        document.getElementById('victoryCoins').textContent = this.stats.coinsEarned;
    }

    enterEndlessMode() {
        console.log('🔥 进入无尽模式！');
        this.endless = true;
        this.floor = CONFIG.TOTAL_FLOORS; // 从第10层继续
        this.nextRoom();
    }

    endRunVictory() {
        console.log('🏆 通关成功！');
        this.state = 'end';

        // 保存统计（通关视为胜利）
        SaveSystem.totalRuns++;
        SaveSystem.victories++;
        SaveSystem.coins += this.stats.coinsEarned;

        // 显示结算（胜利版本）
        this.showScreen('endScreen');
        document.getElementById('endTitle').textContent = '🏆 通关成功！';
        document.getElementById('endFlavor').textContent = '你已成功征服深渊，成为传说！';
        document.getElementById('endFloor').textContent = this.floor;
        document.getElementById('endKills').textContent = this.stats.kills;
        document.getElementById('endCoins').textContent = this.stats.coinsEarned;

        this.loadStats();
    }

    gameOver() {
        this.state = 'end';

        // 保存统计
        SaveSystem.totalRuns++;
        SaveSystem.coins += this.stats.coinsEarned;

        // 显示结算
        this.showScreen('endScreen');
        document.getElementById('endTitle').textContent = '已死亡';
        document.getElementById('endFlavor').textContent = '记忆再次陷入混沌...';
        document.getElementById('endFloor').textContent = this.floor;
        document.getElementById('endKills').textContent = this.stats.kills;
        document.getElementById('endCoins').textContent = this.stats.coinsEarned;

        this.loadStats();
    }

    pause() {
        this.isPaused = true;
        document.getElementById('pauseMenu').classList.add('active');
    }

    resume() {
        this.isPaused = false;
        document.getElementById('pauseMenu').classList.remove('active');
        // gameLoop已在构造函数中启动，无需重复调用
    }

    backToMenu() {
        console.log('🏠 返回主菜单');
        // 完全重置游戏状态
        this.resetGame();
        // 设置为菜单状态
        this.state = 'menu';
        // 隐藏暂停菜单（如果有的话）
        document.getElementById('pauseMenu').classList.remove('active');
        // 显示主菜单
        this.showScreen('mainMenu');
        // 加载统计并播放主菜单音乐
        this.loadStats();
        console.log('✅ 已返回主菜单');
    }

    showStats() {
        alert(`统计数据\n\n记忆币: ${SaveSystem.coins
            }\n总局数: ${SaveSystem.totalRuns}\n胜利: ${SaveSystem.victories}\n胜率: ${SaveSystem.totalRuns > 0 ? ((SaveSystem.victories / SaveSystem.totalRuns * 100).toFixed(1) + '%') : '0%'}`);
    }

    showScreen(screenId) {
        console.log('🖼️ 切换界面:', screenId);
        try {
            // 移除所有 active 类
            document.querySelectorAll('.screen').forEach(s => {
                s.classList.remove('active');
                console.log('  - 隐藏界面:', s.id);
            });

            // 添加 active 类到目标界面
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                console.log('  ✅ 显示界面:', screenId);
            } else {
                console.error('  ❌ 找不到界面:', screenId);
            }
        } catch (error) {
            console.error('❌ showScreen 错误:', error);
        }
    }
}

// ========== 启动游戏 ==========
let game; // 全局变量

// 页面加载完成后立即初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 页面加载完成，正在初始化...');

    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    const loadingScreen = document.getElementById('loadingScreen');
    const mainMenu = document.getElementById('mainMenu');

    // 更新加载进度
    function updateProgress(percent, text) {
        if (loadingBar) loadingBar.style.width = percent + '%';
        if (loadingText) loadingText.textContent = text;
    }

    updateProgress(20, '正在加载游戏引擎...');

    setTimeout(() => {
        try {
            updateProgress(50, '正在初始化游戏...');

            // 立即创建游戏对象
            game = new Game();
            window.game = game; // 显式暴露到全局作用域

            console.log('✅ 游戏初始化完成！', game);
            console.log('🔍 game.startRun:', typeof game.startRun);
            console.log('🔍 game.startEndlessMode:', typeof game.startEndlessMode);
            console.log('🔍 game.showStats:', typeof game.showStats);

            updateProgress(80, '正在准备游戏界面...');

            setTimeout(() => {
                updateProgress(100, '加载完成！');

                // 延迟隐藏加载界面，显示主菜单
                setTimeout(() => {
                    if (loadingScreen) loadingScreen.classList.remove('active');
                    if (mainMenu) mainMenu.classList.add('active');
                    console.log('🎉 游戏已准备就绪！');
                }, 300);
            }, 200);

        } catch (error) {
            console.error('❌ 游戏初始化失败:', error);
            updateProgress(0, '初始化失败！');
            alert('游戏初始化失败，请刷新页面重试。\n\n错误信息: ' + error.message + '\n\n详细信息: ' + error.stack);
        }
    }, 100);

    // 后台加载素材（可选）
    Assets.load().then(() => {
        console.log('📦 素材加载完成（可选）');
    }).catch(() => {
        console.log('⚠️ 素材加载失败，使用像素绘制模式');
    });
});
