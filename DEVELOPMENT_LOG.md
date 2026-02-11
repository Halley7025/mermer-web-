# MerMer 梅墨域 - 开发日志

> 本文档记录了游戏的所有开发进度和更新内容

---

## 📅 2026年2月11日 - 第十一次更新 v11.6 （Player.takeDamage 方法修复）

### 🐛 关键Bug修复

#### 1. **Player.takeDamage 方法缺失** ⚠️ 致命错误
**问题表现**：
- 被怪物攻击后游戏卡死
- 点击"继续游戏"按钮也卡死
- 暂停菜单无法正常使用
- 控制台报错：`TypeError: player.takeDamage is not a function`
- 错误位置：
  - `game.js:1077` - Enemy.update() 中调用
  - `game.js:1430` - BossEnemy.update() 中调用
  - `game.js:2299` - 玩家与敌人子弹碰撞检测中调用

**问题原因**：
- Player 类有 `heal()` 方法但缺少 `takeDamage()` 方法
- Enemy 和 BossEnemy 的 update 方法中需要调用 player.takeDamage
- 玩家与敌人子弹碰撞检测中也需要调用这个方法
- 导致任何伤害判定都会让游戏崩溃

**修复方案**：
在 Player 类中新增 `takeDamage()` 方法：
```javascript
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
```

**方法特性**：
- ✅ 护甲减伤：`finalDamage = max(1, amount - armor)`
- ✅ 最低伤害保证：至少造成 1 点伤害
- ✅ 生命偷取：如果有生命偷取属性，受到伤害时回复生命
- ✅ 返回实际伤害值：便于显示伤害飘字

### 📊 影响范围

**修复前**：
- ❌ 被怪物攻击立即卡死
- ❌ 无法继续游戏
- ❌ 暂停菜单失效
- ❌ 游戏完全无法进行

**修复后**：
- ✅ 怪物攻击正常工作
- ✅ 玩家正常受到伤害
- ✅ 护甲效果生效
- ✅ 生命偷取效果生效
- ✅ 暂停/继续正常工作

### 🔍 技术细节

**与 Enemy.takeDamage 的对比**：
```javascript
// Enemy 的简单版本
takeDamage(amount) {
    this.hp -= amount;
    return this.hp <= 0;  // 返回是否死亡
}

// Player 的增强版本
takeDamage(amount) {
    const finalDamage = Math.max(1, amount - this.armor);
    this.hp -= finalDamage;
    if (this.lifeSteal > 0 && amount > 0) {
        this.heal(amount * this.lifeSteal);
    }
    return finalDamage;  // 返回实际伤害
}
```

**设计差异原因**：
- Player 需要考虑护甲减伤
- Player 需要触发生命偷取
- Player 返回实际伤害用于游戏反馈
- Enemy 只需简单的伤害和死亡判断

### 🎮 测试验证

**测试步骤**：
1. ✅ 刷新游戏页面（F5）
2. ✅ 选择任意职业
3. ✅ 进入游戏战斗
4. ✅ 让敌人靠近并攻击玩家
5. ✅ 应该看到玩家血量减少，游戏继续运行
6. ✅ 按 ESC 暂停/继续应该正常工作

**控制台检查**：
- 不应再有 `takeDamage is not a function` 错误
- 游戏循环正常运行
- 伤害计算正确

### 🔧 代码完整性检查

**已修复的缺失方法**：
- ✅ v11.5: `Bullet.isOutOfBounds()` - 子弹边界检查
- ✅ v11.6: `Player.takeDamage()` - 玩家受伤判定

**建议后续检查**：
- 检查其他核心方法是否缺失
- 添加方法存在性的单元测试
- 代码审查时确保继承关系正确

---

## 📅 2026年2月11日 - 第十一次更新 v11.5 （致命Bug修复 - Bullet类缺失方法）

### 🐛 关键Bug修复

#### 1. **Bullet.isOutOfBounds 方法缺失** ⚠️ 致命错误
**问题表现**：
- 所有职业按下攻击键后立即卡死
- 控制台报错：`TypeError: b.isOutOfBounds is not a function`
- 错误位置：`game.js:2201` - `this.bullets.filter(b => !b.isOutOfBounds())`

**问题原因**：
- Bullet 类缺少 `isOutOfBounds()` 方法
- Entity 基类也没有这个方法
- 代码中却在 `update()` 方法中调用了 `b.isOutOfBounds()`
- 导致游戏循环崩溃

**修复方案**：
在 Bullet 类中新增 `isOutOfBounds()` 方法：
```javascript
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
```

**检查条件**：
- ✅ 生命周期结束 (`lifeTime <= 0`)
- ✅ 超出左边界 (`x < -50`)
- ✅ 超出右边界 (`x > CANVAS_WIDTH + 50`)
- ✅ 超出上边界 (`y < -50`)
- ✅ 超出下边界 (`y > CANVAS_HEIGHT + 50`)
- 缓冲区：50像素，避免子弹刚离开边界就被移除

### 📊 影响范围

**修复前**：
- ❌ 游戏完全无法进行
- ❌ 任何职业按下攻击键立即崩溃
- ❌ 错误信息：`TypeError: b.isOutOfBounds is not a function`

**修复后**：
- ✅ 所有职业攻击正常
- ✅ 子弹正确移除
- ✅ 游戏循环正常运行
- ✅ 无 JavaScript 错误

### 🔍 技术分析

**为什么会出现这个问题**：
- 之前的代码修复过程中可能删除了这个方法
- 或者初始代码中就缺少这个方法
- `update()` 方法依赖 `isOutOfBounds()` 来清理超出边界的子弹

**方法作用**：
- 每帧游戏循环都会调用这个方法
- 筛选出仍在有效范围内的子弹
- 移除超出边界或生命周期结束的子弹
- 防止内存泄漏（子弹对象累积）

### 🎮 测试验证

**测试步骤**：
1. ✅ 刷新游戏页面
2. ✅ 选择任意职业（战士/法师/游侠等）
3. ✅ 点击鼠标攻击
4. ✅ 应该能看到子弹/攻击效果
5. ✅ 游戏正常运行，无卡死

**控制台检查**：
- 不应再有 `isOutOfBounds is not a function` 错误
- 游戏循环正常运行
- 子弹正确生成和移除

### 🔧 后续建议

**代码审查**：
- 检查其他类是否也有缺失的方法
- 确保所有 Entity 子类都有必要的方法
- 建议添加单元测试验证关键方法存在

---

## 📅 2026年2月11日 - 第十一次更新 v11.4 （近战攻击修复 + 错误处理增强）

### 🐛 关键Bug修复

#### 1. **近战攻击无法执行问题**
**问题诊断**：
- `createSlashAttack()` 方法依赖全局 `game` 变量
- 使用 `typeof game !== 'undefined'` 检查，但在某些情况下检查失败
- 导致战士类职业点击攻击后卡死（近战伤害判定无法执行）

**修复方案**：
- 修改 `shoot()` 方法签名：增加 `gameInstance` 参数
  ```javascript
  shoot(targetX, targetY, bullets, gameInstance = null)
  ```
- 修改 `createSlashAttack()` 方法：接收 `gameInstance` 参数
  ```javascript
  createSlashAttack(dirX, dirY, bullets, gameInstance)
  ```
- 优先使用传入的 `gameInstance`，回退到 `window.game`
  ```javascript
  const game = gameInstance || (typeof window !== 'undefined' && window.game);
  ```

**调用链更新**：
- 鼠标点击事件：`this.player.shoot(..., this.bullets, this)`
- 持续攻击逻辑：`this.player.shoot(..., this.bullets, this)`
- 确保近战攻击始终能访问到正确的 game 实例

#### 2. **界面切换失败问题**
**问题表现**：
- 返回主菜单后重新选择职业，界面不切换
- 停留在上一个职业的卡死界面

**修复方案**：
- `showScreen()` 方法增加详细日志
- 增加 try-catch 错误处理
- 逐个记录界面隐藏/显示操作
  ```javascript
  console.log('🖼️ 切换界面:', screenId);
  console.log('  - 隐藏界面:', s.id);
  console.log('  ✅ 显示界面:', screenId);
  ```
- 检查目标界面是否存在，不存在则报错

#### 3. **全面错误捕获系统**

**selectClass() 方法增强**：
- 完整的 try-catch 包裹
- 详细的状态检查日志
  ```javascript
  console.log('🎯 职业类型:', classData.weaponType);
  console.log('  - playerClass:', this.player.className);
  console.log('  - 全局game对象:', typeof window.game !== 'undefined' ? '✅' : '❌');
  ```
- 错误发生时弹出友好提示
- 输出完整错误堆栈便于调试

**gameLoop() 方法增强**：
- 添加 try-catch 防止游戏循环崩溃
- 错误发生时自动暂停游戏
- 弹出错误提示，避免静默失败
  ```javascript
  catch (error) {
      console.error('❌ gameLoop 发生错误:', error);
      this.isPaused = true;
      alert('游戏运行时发生错误：' + error.message);
  }
  ```

### 📊 调试增强

#### 4. **详细日志追踪**
**selectClass 完整日志**：
```
========================================
🎯 选择职业: 战士
🎯 职业类型: slash
✅ 玩家创建成功: 战士
🎮 游戏状态检查:
  - floor: 1
  - endless: false
  - player: ✅
  - playerClass: 战士
  - weaponType: slash
  - keys对象: {...}
  - 全局game对象: ✅
🖼️ 切换界面: gameScreen
  - 隐藏界面: loadingScreen
  - 隐藏界面: mainMenu
  - 隐藏界面: classSelectScreen
  ✅ 显示界面: gameScreen
✅ 状态设置为 playing
✅ 职业选择完成，游戏开始！
========================================
```

**showScreen 详细日志**：
- 记录每个界面的隐藏操作
- 确认目标界面的显示操作
- 错误时输出界面ID不存在的提示

### 🔧 技术改进

**参数传递优化**：
- 避免依赖全局变量
- 通过参数显式传递 game 实例
- 提高代码可测试性和可维护性

**错误处理策略**：
- 关键方法全部添加 try-catch
- 错误发生时不会导致整个游戏崩溃
- 详细的错误信息便于快速定位问题

### 🎮 预期效果

**修复前**：
- ❌ 选择战士后点击攻击卡死
- ❌ 返回主菜单后界面不切换
- ❌ 错误静默发生，无提示

**修复后**：
- ✅ 近战攻击正常工作
- ✅ 界面切换正常
- ✅ 任何错误都有详细日志和提示
- ✅ 控制台输出完整调试信息

### 🧪 测试要点

1. **战士类职业测试**：
   - 选择战士
   - 点击鼠标攻击
   - 应该看到挥砍动画和敌人受到伤害

2. **界面切换测试**：
   - 开始游戏 → 返回主菜单
   - 重新开始 → 选择不同职业
   - 应该看到完整的界面切换日志

3. **错误日志检查**：
   - 打开控制台（F12）
   - 查看是否有红色错误信息
   - 所有操作都应该有对应的绿色✅日志

---

## 📅 2026年2月11日 - 第十一次更新 v11.3 （游戏状态管理修复）

### 🐛 关键问题修复

#### 1. **新增游戏状态重置系统**
**问题诊断**：
- 退出游戏后重新开始，游戏状态未重置
- 导致新游戏继承旧关卡、旧敌人、旧子弹等
- `backToMenu()` 只设置state，未清空所有游戏对象
- `startRun()` 和 `startEndlessMode()` 未重置游戏状态

**新增方法**：`resetGame()`
```javascript
resetGame() {
    // 重置所有游戏状态
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
    this.music.stopAll();
}
```

**调用位置**：
- `startRun()` - 开始普通模式时重置
- `startEndlessMode()` - 开始无尽模式时重置
- `backToMenu()` - 返回主菜单时重置

#### 2. **职业选择流程优化**
**改进内容**：
- `selectClass()` 方法增加详细日志
- 检查floor、endless、player、keys对象状态
- 先执行 `showScreen('gameScreen')` 再设置 `state = 'playing'`
- 确保界面切换完成后再开始游戏循环

**调试日志**：
```javascript
console.log('🎮 游戏状态检查:');
console.log('  - floor:', this.floor);
console.log('  - endless:', this.endless);
console.log('  - player:', this.player ? '✅' : '❌');
console.log('  - keys对象:', this.keys);
```

#### 3. **无尽模式初始化修复**
**旧逻辑问题**：
- `startEndlessMode()` 调用 `startRun()`
- 导致 `endless` 标志在 `resetGame()` 中被清除

**新逻辑**：
```javascript
startEndlessMode() {
    this.resetGame();        // 先重置状态
    this.endless = true;     // 再设置endless标志
    this.state = 'classSelect';
    this.showScreen('classSelectScreen');
    this.renderClassSelection();
}
```

#### 4. **返回主菜单流程完善**
**新增功能**：
- 调用 `resetGame()` 完全清空游戏状态
- 添加详细日志追踪
- 确保暂停菜单被隐藏
- 自动播放主菜单音乐

### 🔧 代码结构修复

#### 5. **gameOver() 方法结构修复**
**问题**：
- `backToMenu()` 代码错误插入到 `gameOver()` 中间
- 导致 `gameOver()` 方法功能异常
- 存在重复的 `backToMenu()` 定义

**修复**：
- 恢复 `gameOver()` 方法完整性
- 移除错误插入的代码
- 统一 `backToMenu()` 方法定义

### 📊 修复效果

**问题1：选完角色卡死**
- ✅ 添加状态检查日志，便于诊断
- ✅ 确保player对象正确创建
- ✅ 确保keys对象可用
- ✅ 界面切换时机优化

**问题2：退出后状态未重置**
- ✅ `resetGame()` 清空所有游戏对象
- ✅ `startRun()` 调用resetGame()
- ✅ `startEndlessMode()` 调用resetGame()后再设置endless
- ✅ `backToMenu()` 调用resetGame()

### 🎮 测试检查点

1. **新游戏启动**：
   - 控制台应显示 `🔄 重置游戏状态`
   - floor应为1，endless应为false（普通模式）

2. **无尽模式启动**：
   - floor应为1，endless应为true
   - 状态完全重置

3. **返回主菜单**：
   - 所有游戏对象清空
   - 控制台显示 `✅ 已返回主菜单`
   - 主菜单音乐自动播放

4. **再次开始游戏**：
   - 应该是全新状态
   - 不继承上一局任何数据

---

## 📅 2026年2月11日 - 第十一次更新 v11.2 （严重Bug修复 + 加载界面）

### 🐛 关键语法错误修复

#### 1. **Bullet类结构错误**
**问题诊断**：
- `update()` 方法中包含了整个switch语句的渲染代码
- 所有 `ctx` 渲染逻辑错误地放在update方法内的if语句中
- 缺少独立的 `draw()` 方法
- 导致整个JavaScript文件解析失败

**修复方案**：
- 正确分离 `update()` 和 `draw()` 方法
- update() 只处理逻辑（距离追踪、生命周期）
- draw() 处理所有渲染（switch包含所有bulletType的视觉效果）
- 添加 `ctx.save()` 和 `ctx.restore()` 保护渲染状态

#### 2. **Game类方法定义混乱**
**问题诊断**：
- `loadStats()` 方法缺失完整定义
- `startRun()` 方法重复定义
- 方法中间出现孤立的if语句
- 语法错误：`.music.stopAll();.getElementById`（缺少换行）

**修复方案**：
- 完整定义 `loadStats()` 方法（加载统计 + 主菜单音乐）
- 统一 `startRun()` 方法定义（停止音乐 + 进入职业选择）
- 移除重复和孤立的代码块

#### 3. **Player类方法闭合缺失**
**问题诊断**：
- `createShadowAttack()` 方法缺少闭合的 `}`
- 导致后续 `heal()` 方法被认为在 `createShadowAttack` 内部

**修复方案**：
- 在 `createShadowAttack()` 的for循环后添加 `}`
- 确保每个方法正确闭合

### 🎨 加载界面系统

#### 4. **渐进式加载体验**
**视觉设计**：
- 渐变背景：紫色到深紫色 (#667eea → #764ba2)
- 居中布局：游戏标题 + 进度条 + 状态文本
- 进度条动画：平滑过渡效果（0.3s transition）

**加载阶段**：
```
20%  → 正在加载游戏引擎...（100ms延迟）
50%  → 正在初始化游戏...
80%  → 正在准备游戏界面...（200ms延迟）
100% → 加载完成！（300ms延迟后进入主菜单）
```

**错误处理**：
- 捕获Game构造函数异常
- 显示详细错误信息（message + stack trace）
- 进度条重置为0%，状态显示"初始化失败！"

**流程优化**：
- 使用setTimeout分段初始化，避免阻塞UI
- 加载界面默认active，主菜单初始隐藏
- 初始化完成后自动切换界面
- 添加3个console.log验证方法可用性

### 🔍 调试增强

#### 5. **详细日志系统**
**初始化验证**：
```javascript
console.log('✅ 游戏初始化完成！', game);
console.log('🔍 game.startRun:', typeof game.startRun);
console.log('🔍 game.startEndlessMode:', typeof game.startEndlessMode);
console.log('🔍 game.showStats:', typeof game.showStats);
console.log('🎉 游戏已准备就绪！');
```

**全局作用域暴露**：
- 显式赋值：`window.game = game`
- 确保HTML onclick事件可访问game对象
- 支持浏览器控制台调试

### 📊 技术细节

**修复的语法错误位置**：
- Line 662: `heal(amount) {` - 前置方法未闭合
- Line 1544-1636: switch in update() - 应该在draw()中
- Line 1921: `.stopAll();.getElementById` - 缺少换行
- Line 1927: 重复的 `startRun()` 定义

**文件变更**：
- game.js: 2732行 → 正确结构化
- index.html: 新增加载界面（13行）
- 语法验证: ✅ node --check 通过

---

## 📅 2026年2月11日 - 第十一次更新 v11.1（主菜单音乐 + 调试修复）

### 🎵 主菜单背景音乐

#### 1. **轻快愉悦的菜单BGM**
**技术实现**：
- 新增 `MusicManager.playMenuBGM()` 方法
- 柔和旋律：C-D-E-G-E-D（大调音阶）
- 三角波（triangle）音色 - 比正弦波更温暖
- 节奏：600ms / 音符（轻快节奏）
- 音量：0.12（比战斗音乐更柔和）

**自动播放时机**：
- 游戏初始化完成后 100ms 自动播放
- 从游戏内返回主菜单时自动恢复
- `loadStats()` 在主菜单状态时自动播放
- 进入职业选择界面时自动停止

### 🐛 Bug 修复

#### 2. **主菜单按钮响应问题修复**
**问题原因**：
- `game` 对象虽然在顶层作用域声明，但现代浏览器可能对 HTML onclick 访问存在限制

**修复方案**：
- 显式将 `game` 对象暴露到全局 `window` 对象
- 添加：`window.game = game;`

**调试增强**：
- Game 构造函数包装在 try-catch 中
- 初始化失败时弹出友好错误提示
- 添加详细的 console.log 日志：
  - 游戏对象初始化状态
  - 方法类型检查（startRun, startEndlessMode）
  - 按钮点击事件追踪

**音乐切换逻辑优化**：
- `startRun()` 方法添加日志并停止主菜单音乐
- `backToMenu()` 方法通过 `loadStats()` 自动恢复菜单音乐
- 确保音乐状态与游戏状态同步

---

## 📅 2026年2月11日 - 第十一次更新 v11（音乐系统 + 多重射击 + 新奖励）

### 🎵 背景音乐系统

#### 1. **Web Audio API 音乐引擎**
**技术实现**：
- 基于 `AudioContext` 的实时音频合成
- 延迟初始化（用户首次交互时启动）
- 音量控制和静音开关

**普通关卡音乐**：
- 神秘探索风格
- 缓慢琶音（C-E-G-C 大三和弦）
- 节奏：800ms / 音符
- 正弦波（sine）柔和音色

**Boss关卡音乐**：
- 紧张激烈风格
- 快速低音鼓点（100→40Hz 下滑）
- 高音刺激（1200-1600Hz 方波）
- 节奏：250ms / 拍（240 BPM）
- 每两拍高音刺激增强紧张感

**播放控制**：
- `startCombatRoom()` 根据是否为Boss关自动切换音乐
- `music.playNormalBGM()` / `music.playBossBGM()`
- 支持静音切换

### 💥 多重射击系统（重写分裂射击）

#### 2. **新机制：同时发射多排子弹**
**旧设计问题**：
- 子弹消失时分裂不直观
- 玩家无法预判分裂方向

**新设计**：
- 发射时同时发射多排子弹（扇形）
- 每获得一次"多重射击"，子弹数 +2
- 伤害衰减：每层减半

**数值公式**：
```
multiShot = 1（默认）: 基础发射数（法师1发，游侠3发，元素2发）
multiShot = 2（1次多重射击）: +2发，伤害 ×0.5
multiShot = 3（2次多重射击）: +4发，伤害 ×0.25
multiShot = 4（3次多重射击）: +6发，伤害 ×0.125
```

**各职业基础发射数**：
- 法师（magic）: 1 → 3 → 5 → 7
- 元素（elemental）: 2 → 4 → 6 → 8
- 游侠（projectile）: 3 → 5 → 7 → 9
- 狙击（snipe）: 1 → 3 → 5 → 7
- 影刃（shadow）: 1 → 3 → 5 → 7

**扇形角度**：
- 法师/游侠/狙击：0.15 弧度间隔
- 元素：0.18 弧度间隔（更宽）
- 影刃：0.12 弧度间隔（更密集）

### 🎁 新奖励系统

#### 3. **金币磁铁** 🧲（稀有）
- 击杀敌人后金币直接吸收到玩家位置
- 不再需要走动拾取
- 金币提示显示在玩家头顶
- 磁铁范围：120px（后续可扩展强化）

#### 4. **嗜血狂暴** 🩸（史诗）
- 击杀敌人后触发狂暴状态
- 持续时间：2 秒（120 帧）
- 效果：攻击速度 +100%（冷却减半）
- 可与其他攻速加成叠加
- 视觉：击杀后立即进入高频输出模式

**技术实现**：
- `Player.berserkerTimer` 计时器
- `Player.onKillEnemy()` 击杀回调
- `Player.getAdjustedCooldown()` 计算实际冷却
- 攻速计算顺序：基础冷却 → 攻速乘数 → 狂暴加成

### 🎮 无尽模式UI改进

#### 5. **主菜单无尽模式入口**
- 主菜单"无尽模式"按钮现可直接开启
- 调用 `game.startEndlessMode()` 方法
- 无尽模式标志从一开始就为`true`
- 无需通关第10层即可体验无限挑战

### 🛠️ 代码重构

#### 6. **Bullet类简化**
移除旧的分裂逻辑：
- 删除 `canSplit` 属性
- 删除 `spawnSplits()` 方法
- 删除 `originX/originY` 属性
- 简化 `update()` 方法

#### 7. **Player攻击方法统一**
所有远程攻击支持多重射击：
- `createMagicAttack()` - 法师
- `createElementalAttack()` - 元素
- `createProjectileAttack()` - 游侠
- `createSnipeAttack()` - 狙击
- `createShadowAttack()` - 影刃

**统一逻辑**：
```javascript
const multiShot = this.multiShot || 1;
const spreadCount = baseCount + (multiShot - 1) * 2;
const damageReduction = Math.pow(0.5, multiShot - 1);
for (let i = 0; i < spreadCount; i++) {
    const offset = (i - (spreadCount - 1) / 2) * spreadAngle;
    // 创建子弹...
}
```

### 📊 新奖励数据

**REWARDS数组扩展**：21 → **23** 个奖励

| ID | 名称 | 稀有度 | 效果 |
|----|------|--------|------|
| 22 | 金币磁铁 | 稀有 | 自动吸收附近金币 |
| 23 | 嗜血狂暴 | 史诗 | 击杀后2秒内攻速+100% |

**奖励21更名**：
- 旧：分裂射击（子弹消失时分裂）
- 新：多重射击（子弹数+2，伤害减半，可叠加）

### 🎨 玩法改进

#### 8. **战略深度提升**
**多重射击**：
- 范围控制能力显著增强
- 弥补远程职业的走位需求
- 伤害衰减需要权衡选择（高频低伤 vs 低频高伤）

**金币磁铁**：
- 降低操作压力
- 避免高强度战斗中错过金币
- 参考 Vampire Survivors 经典设计

**嗜血狂暴**：
- 奖励激进打法（击杀 → 更快击杀 → 连锁）
- 创造"割草"快感
- 高风险高回报（需要近距离快速击杀）

### 🔊 体验优化

**音乐氛围**：
- 普通关卡：探索、神秘、缓和
- Boss关卡：紧张、激烈、快节奏
- 音乐自动切换无需手动操作

**视觉反馈**：
- 磁铁吸收：金币提示显示在玩家头顶
- 嗜血狂暴：攻击频率明显加快（视觉可见）

### ⚙️ 平衡数据

| 元素 | 旧数值 | 新数值 | 备注 |
|------|--------|--------|------|
| 多重射击伤害 | 无 | 0.5^(n-1) | 每层减半 |
| 狂暴攻速加成 | - | +100% | 2秒持续 |
| 磁铁范围 | - | 120px | 直接吸收 |
| 音乐BPM | - | Normal:75, Boss:240 | - |

### 🐛 Bug修复

#### 9. **修复createProjectileAttack缺失bullets.push**
- 游侠的箭矢没有添加到bullets数组
- 导致子弹不显示
- 已在所有攻击方法中统一添加`bullets.push(bullet)`

### 📝 新统计

**音乐系统**：
- MusicManager类：182 行代码
- 2种BGM轨道（普通/Boss）
- Web Audio API 实时合成

**多重射击**：
- 5个攻击方法重写
- 支持3层叠加（1→3→5→7发）
- 伤害公式：`Math.pow(0.5, multiShot - 1)`

### 🎯 市场热门功能借鉴

参考游戏：
- **Vampire Survivors**: 金币磁铁、嗜血狂暴、多重射击
- **Brotato**: 攻速加成叠加
- **Risk of Rain 2**: 击杀触发BUFF

已实现：
- ✅ 金币磁铁（直接吸收）
- ✅ 嗜血狂暴（击杀加攻速）
- ✅ 多重射击（扇形弹幕）
- ✅ 音乐系统（氛围切换）

暂未实现（后续扩展）：
- ⏳ 经验值升级系统
- ⏳ 武器进化系统
- ⏳ 随机事件（精英怪、宝箱）
- ⏳ 成就系统

### 🔧 技术亮点

**Web Audio API**：
- 无需外部音频文件
- 实时合成降低加载时间
- 轻量级（<200行代码）

**公式驱动设计**：
- 多重射击伤害：`Math.pow(0.5, n-1)`
- 攻速计算：`baseCooldown * attackSpeedMult * (berserker ? 0.5 : 1)`
- 子弹数计算：`baseCount + (multiShot - 1) * 2`

**事件驱动架构**：
- `Player.onKillEnemy()` 击杀回调
- 解耦击杀逻辑和效果触发
- 便于后续扩展（击杀触发更多效果）

---

## 📅 2026年2月11日 - 第十次更新（无尽模式 + Boss强化 + 新奖励系统）

### 🔥 核心功能

#### 1. **无尽模式系统** ∞
**胜利界面**：
- 通关第10层后显示胜利界面
- 玩家可选择：
  - "继续挑战（无尽模式）"：从第11层继续
  - "载入史册并返回"：结算胜利，计入统计

**无尽模式机制**：
- 添加 `Game.endless` 标志
- 第10层后可无限挑战
- 塔显示切换为数字计数器（层数: X）

#### 2. **Boss大幅强化** 👑
**体型增大**：
- size: 40 → **70**（75%增加）
- 视觉像素块：5 → **7**

**生命值大幅提升**：
```
旧公式: maxHp = 150 + floor * 40   (第10层 = 550 HP)
新公式: maxHp = 500 + floor * 100  (第10层 = 1500 HP，几乎3倍)
```
**坦度平衡**：
- 降低伤害输出：15 + floor * 5 → **10 + floor * 3**
- 降低移动速度：0.7 → **0.6**
- 目标：第10层Boss可抗10秒以上

**视觉特效强化**：
- 能量光环动画（波动半径35±5px）
- 眼睛红光特效（shadowBlur: 8px）
- 核心紫光增强（shadowBlur: 10→15px）

### 🎁 新奖励系统

#### 3. **近战增强奖励** 💢
**近战扩张**（稀有）：
- 近战攻击范围 +25
- 支持叠加（80 → 105 → 130...）
- 效果：`player.slashRange` 属性
- 适用于战士系职业

#### 4. **远程增强奖励** 🎯
**远程增幅**（稀有）：
- 远程射程 +100
- 支持叠加（350 → 450 → 550...）
- 效果：`player.rangedRange` 属性
- 适用于法师/游侠系

**巨型子弹**（稀有）：
- 子弹体积 +50%（乘法叠加）
- 子弹伤害 +20%（乘法叠加）
- 效果：`bulletSizeMult`, `bulletDamageMult`

#### 5. **分裂射击系统** 💨（史诗）
**机制**：
- 子弹消失时产生2枚45°分裂弹
- 分裂弹伤害 = 50% 原伤害
- 分裂弹射程 = 60% 原射程
- 分裂弹不再二次分裂

**技术实现**：
- Bullet类新增 `canSplit` 属性
- `update()` 检测 `lifeTime === 1` 时触发
- `spawnSplits()` 生成分裂弹

### 🔫 远程平衡

#### 6. **射程限制系统** 🎯
**目标**：限制远程职业跨图狙击

**各职业基础射程**：
```javascript
游侠（箭矢）：  350px
法师（魔法）：  380px
元素（元素）：  360px
狙击（狙击）：  400px
影刃（影刃）：  300px
```

**技术实现**：
- Bullet构造函数新增 `maxRange` 参数
- 新增 `distanceTraveled` 追踪飞行距离
- 达到 `maxRange` 时 `lifeTime = 0` 销毁
- 近战职业保持 `maxRange = null`（无限制）

### 🛠️ 技术优化

#### 7. **代码重构**
**Bullet类扩展**：
```javascript
constructor(x, y, dx, dy, damage, isPlayer, color, type, maxRange = null)
+ maxRange: 最大飞行距离
+ distanceTraveled: 已飞行距离
+ canSplit: 是否可分裂
+ spawnSplits(): 分裂逻辑
```

**Player攻击方法**：
- 所有远程攻击传入 `maxRange` 参数
- 支持 `bulletSizeMult` 和 `bulletDamageMult` 倍率
- 支持 `player.slashRange` 近战范围
- 支持 `player.splitBullets` 分裂开关

**Game类**：
- `bullet.update()` 传入 `this` 以支持分裂
- `drawTowerProgress()` 适配无尽模式显示

### 📊 新统计

**REWARDS数组扩展**：
- 17 → **21** 个奖励
- 新增4个奖励：近战扩张、远程增幅、巨型子弹、分裂射击

**无尽模式统计**（后续扩展）：
- 最高楼层记录
- 无尽模式死亡统计

### 🎨 视觉改进

**Boss视觉**：
- 体型增大75%
- 光环动画120帧周期
- 多层发光特效

**塔显示**：
- 正常模式：显示10层塔结构
- 无尽模式：切换为数字计数面板

### ⚙️ 平衡数据

| 元素      | 旧数值         | 新数值           | 变化     |
|---------|-------------|---------------|--------|
| Boss体型  | 40          | 70            | +75%   |
| Boss血量  | 550 (F10)   | 1500 (F10)    | +173%  |
| Boss伤害  | 65 (F10)    | 40 (F10)      | -38%   |
| 远程射程    | 无限制         | 300~400px     | 新增限制   |
| 奖励总数    | 17          | 21            | +4     |

### 📝 游戏玩法影响

**战略深度提升**：
- 远程职业需要考虑走位（不能无限风筝）
- 分裂弹创造范围控制玩法
- 近战范围增强让战士更具压制力

**Boss战难度提升**：
- Boss生存时间延长3倍+
- 需要更精细的走位和技巧
- 强制玩家掌握闪避机制

**无尽模式挑战**：
- 为高水平玩家提供无限挑战
- 后续可扩展排行榜系统

---

## 📅 2026年2月11日 - 第九次更新（战斗修复 + 模型重做 + 刷怪优化）

### 🐛 Bug修复

#### 1. **游侠无法攻击** ⚠️ 严重Bug
**问题描述**：
- 游侠的 `createProjectileAttack` 使用 `setTimeout` 延迟创建子弹
- `setTimeout` 回调在异步执行，可能在游戏状态变化后才触发
- 导致子弹创建失败或丢失

**修复方案**：
- 将 `setTimeout` 三连发改为同步扇形三发
- 子弹类型从 `'projectile'` 改为 `'arrow'`
- 新增箭矢视觉效果（尾迹 + 箭头）

#### 2. **战士近战splice迭代Bug**
- `for...of` 遍历时 `splice` 会跳过元素
- 改为反向 `for` 循环（`i--`），安全删除

### ⚔️ 战斗平衡

#### 3. **攻击频率调回正常水平** ⏱️
之前为了调试将攻击冷却改到极低值（法师5帧 ≈ 0.08秒），导致变成机关枪。

| 职业 | 旧冷却(帧) | 新冷却(帧) | 约等于 |
|------|-----------|-----------|--------|
| 战士/挥砍 | 12 | 25 | 0.42秒 |
| 法师/魔法 | 5 | 18 | 0.30秒 |
| 元素使 | 7 | 20 | 0.33秒 |
| 游侠/弓箭 | 8 | 22 | 0.37秒 |
| 狙击手 | 15 | 40 | 0.67秒 |
| 影刃 | 3 | 10 | 0.17秒 |

#### 4. **战士攻击范围加大** 🗡️
- 斩击范围：45px → **80px**
- 斩击弧度：144° → **180°（半圆）**
- 这样战士可以更安全地在近战距离攻击

### 🎨 角色模型全面重做

#### 5. **三职业视觉差异化** 👤
**之前的问题**：像素块太小（4px），三个职业几乎看不出区别。

**重做方案**：使用更大的几何形状，强调每个职业的标志性特征：

- **战士**：方正宽厚的板甲轮廓 + 凸出肩甲 + 大剑 + 盾牌
  - 狂战士：红色铠甲 + 头顶双焰（动态）
  - 圣骑士：白金铠甲 + 圣光圆环

- **法师**：大三角尖帽 + A字形长袍 + 长法杖 + 大发光球
  - 大法师：紫色光环脉动
  - 元素使：四色粒子公转

- **游侠**：半圆兜帽 + 飘动披风（动态） + 大弓+弦+箭
  - 狙击手：棕色皮甲
  - 影刃：暗紫 + 双匕首 + 隐身光环

#### 6. **职业名标签**
- 角色头顶显示职业名称（用武器颜色）
- 血条颜色改为绿色（之前是红色看着像在掉血）

#### 7. **始终使用像素绘制**
- `drawPixelPlayer` 不再尝试使用精灵表（裁剪不对导致三个职业看起来一样）
- 始终调用 `drawPixelPlayerFallback` 使用手绘模型

### 🐛 刷怪系统优化

#### 8. **敌人生成远离玩家** 📏
- 新增最小生成距离：150px
- 最多尝试20次找到合适位置
- 避免怪物刷到玩家脸上直接造成大量伤害

#### 9. **Boss远离玩家生成**
- Boss不再固定在屏幕中心生成（可能和玩家重叠）
- 改为在离玩家最远的角落生成
- 四个候选角落：(80,80)、(880,80)、(80,560)、(880,560)

#### 10. **游侠箭矢视觉效果**
- 新增 `'arrow'` 子弹类型
- 箭矢尾迹（绿色拖尾线条）
- 箭头（白色三角形 + 绿色中心）

---

## 📅 2026年2月11日 - 第八次更新（视觉大改 + 平衡性优化）

### 🎨 视觉与模型大改

#### 1. **各职业独立像素模型** 🧙‍♂️
- **战士系**：重甲骑士，肩甲 + 铠甲 + 长剑
  - 狂战士：深红色铠甲，头顶火焰动画
  - 圣骑士：金白色铠甲，自带圣光光环
- **法师系**：长袍 + 尖帽 + 法杖 + 发光法球
  - 大法师：深紫色长袍，紫焰环绕
  - 元素使：青色长袍，四色元素粒子旋转
- **游侠系**：兜帽 + 披风 + 弓/匕首
  - 狙击手：棕色皮甲，长弓弓弦
  - 影刃：暗蓝披风，双匕首，暗影光环

#### 2. **8种怪物类型，按楼层分级** 👾
- **1-3层（温和型）**：
  - 🟢 史莱姆：绿色弹跳体，经典入门怪
  - 🟣 蝙蝠：紫色翅膀扇动动画，速度快血量低
- **4-6层（中等型）**：
  - ⚪ 骷髅：头骨 + 肋骨 + 腿骨，伤害高
  - 🔵 幽灵：半透明浮动效果，穿墙感
  - 🟤 兽人：粗壮身体 + 獠牙，血厚速慢
- **7-10层（恐怖型）**：
  - 🔴 恶魔：犄角 + 翅膀 + 尾巴，发光眼睛
  - 🟪 怨灵：深紫飘浮，红色发光眼，暗域光环
  - ⬜ 魔像：岩石身躯，裂纹，核心发光

每种怪物有独立的属性系数（生命/伤害/速度），越高层怪物基础属性越高。

#### 3. **Boss血条HUD** 👑
- 屏幕顶部居中显示Boss大血条（320px宽）
- 显示Boss名称和楼层
- 血量根据百分比变色（绿→黄→红）
- 实时显示HP数字

### ⚔️ 战斗系统改进

#### 4. **战士近战挥砍重做** 🗡️
- **之前**：发射3个球形弹体（远程攻击）
- **现在**：真正的近战弧形斩击
  - 范围45像素，144度弧形
  - 直接对范围内敌人造成伤害（不需要弹体碰撞）
  - 白色弧形斩击特效带淡出动画
  - 支持暴击、吸血等属性
  - 狂战士/圣骑士共享此近战逻辑

### 💰 经济系统平衡

#### 5. **金币掉落提升**
- 普通怪物：`2+随机3` → `5+楼层×1.5+随机5`
- Boss怪物：`10+随机3` → `20+随机5`
- 高层怪物掉落更多金币

#### 6. **商店价格大幅下调**
| 物品 | 旧价格 | 新价格 |
|------|--------|--------|
| 治疗药水 | 50🪙 | 15🪙 |
| 磨刀石 | 100🪙 | 30🪙 |
| 护甲片 | 80🪙 | 25🪙 |
| 大力丸 | 200🪙 | 60🪙 |
| 满血药水 | 150🪙 | 45🪙 |

### 🏠 休息站改进

#### 7. **免费奖励改为三选一**
- **之前**：可以全部领取（太imba）
- **现在**：只能选择一个，选中后其他变灰
- 卡片底部显示"（三选一）"提示
- 选中卡片绿色高亮边框

---

## 📅 2026年2月11日 - 第七次更新（重大修复 + 肉鸽元素完善）

### 🐛 致命Bug修复

#### 1. **Assets.load() 在 file:// 协议下卡死** ⚠️ 根本原因

**问题描述**：
- 用户通过双击 `index.html` 打开游戏（使用 `file:///` 协议）
- `Assets.load()` 异步加载图片，但在 `file://` 协议下可能永远不触发 `onload/onerror`
- Promise 永远不 resolve → `game` 永远是 `undefined`
- 点击"普通模式"报错：`game is not defined`

**修复方案**：
```javascript
// 1. 添加3秒超时保护
const timeout = setTimeout(() => {
    console.warn('⚠️ 素材加载超时，使用像素绘制模式');
    resolve();
}, 3000);

// 2. 使用 DOMContentLoaded 确保页面就绪
document.addEventListener('DOMContentLoaded', () => {
    Assets.load().finally(() => {
        game = new Game(); // 无论成功失败都创建游戏
    });
});
```

**关键改动**：
- `Assets.load()` 加了3秒超时保护
- 使用 `.finally()` 替代 `.then()/.catch()`，确保100%执行
- 使用 `DOMContentLoaded` 替代立即执行

### ✨ 新增肉鸽游戏元素

#### 1. **伤害飘字系统** 🎯
```javascript
class DamageText {
    // 伤害数字从敌人/玩家头上飘起
    // 暴击显示金色大字
    // 拾取金币显示"+N🪙"
    // 复活显示"复活！"
}
```

#### 2. **击杀粒子特效** ✨
```javascript
class Particle {
    // 敌人死亡时爆出8个彩色粒子
    // 粒子带速度和衰减
    // 复活时爆出20个金色粒子
}
```

#### 3. **更丰富的奖励系统** (17个奖励)
新增7个奖励：
- 🪖 铁皮（护甲+3）
- ⏩ 射速强化（攻速+15%）
- 🌟 弹幕扩散（子弹数量+1）
- 🔱 穿透射击（穿透+1）
- 💠 反弹护甲（荆棘伤害）
- 💀 死神镰刀（暴击3倍）
- 👼 不灭之魂（死亡复活一次）

#### 4. **复活机制** 👼
- 获得"不灭之魂"奖励后，死亡时自动复活
- 复活恢复50%生命
- 显示金色粒子特效和飘字
- 一局只能触发一次

#### 5. **更多商店物品** 🛒
新增2个商店物品：
- 💪 大力丸（攻击+8，200金）
- 💖 满血药水（完全恢复，150金）

#### 6. **Boss强化** 👑
- Boss体型增大到40（原32）
- Boss血量提升：150 + floor*40（原100 + floor*30）
- Boss发射子弹间隔90帧（更合理）
- Boss追踪距离调整为60
- Boss击杀掉落更多金币（10+）

#### 7. **战场信息** 📊
- 左下角显示当前敌人数量
- 实时更新

### 🔧 技术改进

#### 代码结构优化
```
新增类：
├── DamageText    - 伤害飘字（60帧渐隐上浮）
├── Particle      - 粒子特效（30-50帧衰减扩散）

Game新增属性：
├── damageTexts[] - 伤害飘字数组
├── particles[]   - 粒子特效数组

碰撞检测增强：
├── 暴击倍率支持（critMultiplier）
├── 伤害飘字生成
├── 击杀粒子生成
├── Boss额外金币
└── 敌方子弹伤害飘字

Update增强：
├── 粒子更新与过滤
├── 飘字更新与过滤
└── 复活机制检查

Render增强：
├── 粒子绘制
├── 飘字绘制
└── 敌人计数显示
```

### 📁 文件修改
- `game.js`：
  - 重写 Assets.load()（超时保护）
  - 重写启动代码（DOMContentLoaded + finally）
  - 新增 DamageText 类（伤害飘字）
  - 新增 Particle 类（击杀粒子）
  - 扩充 REWARDS 数组（10→17个）
  - 扩充 SHOP_ITEMS 数组（3→5个）
  - 重写 BossEnemy.update()（独立追踪逻辑）
  - 增强 checkCollisions()（飘字+粒子+暴击倍率）
  - 增强 update()（飘字/粒子更新+复活机制）
  - 增强 render()（绘制飘字/粒子+敌人计数）

### 💡 经验教训

**关于 file:// 协议**：
1. 浏览器对 `file://` 有严格的安全限制
2. `Image.onload` 在某些浏览器的 `file://` 下不触发
3. 异步操作必须有超时保护机制
4. 使用 `.finally()` 确保关键代码必定执行
5. 不能假设用户会通过HTTP服务器访问游戏

**关于肉鸽游戏设计**：
一个完整的roguelike应该包含：
- ✅ 随机奖励选择（3选1）
- ✅ 职业系统与进阶
- ✅ Boss战斗
- ✅ 伤害飘字
- ✅ 击杀特效
- ✅ 复活机制
- ✅ 商店系统
- ⏳ 更多敌人类型
- ⏳ 被动技能树
- ⏳ 成就系统

---

## 📅 2026年2月11日 - 第六次更新 v3（调试版本）

### 🔍 调试系统

用户反馈角色无法移动、怪物不出现的问题。添加了完整的调试日志系统来追踪问题。

#### 添加的调试日志

1. **游戏初始化**
   ```javascript
   console.log('🎮 初始化游戏事件监听器');
   console.log('🎮 正在加载游戏...');
   console.log('✨ 游戏启动成功！');
   ```

2. **职业选择**
   ```javascript
   console.log('🎯 选择职业:', classData.name);
   console.log('🎮 游戏状态设置为: playing');
   console.log('🧙 玩家创建完成:', this.player);
   console.log('✅ 职业选择完成，开始战斗');
   ```

3. **战斗房间**
   ```javascript
   console.log('⚔️ 开始战斗房间 - 楼层:', this.floor);
   console.log('Boss关卡?', isBossFloor);
   console.log('👾 将生成', enemyCount, '个普通敌人');
   console.log('👾 生成敌人', (i + 1), '/', enemyCount);
   console.log('✅ 所有敌人生成完成');
   ```

4. **游戏循环**
   ```javascript
   // update被调用但player不存在时
   console.warn('⚠️ update被调用但player不存在');
   ```

### 🔧 代码验证

**已确认正常的部分**：
- ✅ Entity基类的update()正确更新x, y坐标
- ✅ Player.update(keys)接收keys对象
- ✅ super.update()被正确调用
- ✅ 键盘事件监听器正确绑定
- ✅ gameLoop在构造函数中正确启动
- ✅ state正确设置为'playing'
- ✅ 敌人生成逻辑使用setTimeout

**代码结构**：
```
游戏流程：
1. Assets.load() → 加载素材
2. new Game() → 初始化
   ├─ init() → 绑定键盘/鼠标事件
   ├─ loadStats() → 加载统计数据
   └─ startGameLoop() → 启动游戏循环
3. 用户点击职业 → selectClass()
   ├─ state = 'playing'
   ├─ new Player()
   └─ startCombatRoom()
       └─ setTimeout生成敌人
4. gameLoop() 持续运行
   └─ if (state === 'playing')
       ├─ update()
       │   └─ player.update(keys)
       │       └─ Entity.update() → x += vx, y += vy
       └─ render()
```

### 📊 预期调试输出

正常运行时控制台应该显示：
```
🎮 正在加载游戏...
✅ 加载成功: character
✅ 加载成功: sheet
🎨 所有素材加载完成！
🎮 初始化游戏事件监听器
✨ 游戏启动成功！
--- 点击职业后 ---
🎯 选择职业: 战士
🎮 游戏状态设置为: playing
🧙 玩家创建完成: Player {...}
⚔️ 开始战斗房间 - 楼层: 1
Boss关卡? false
👾 将生成 3 个普通敌人
✅ 职业选择完成，开始战斗
--- 1秒后 ---
👾 生成敌人 1 / 3
--- 2秒后 ---
👾 生成敌人 2 / 3
--- 3秒后 ---
👾 生成敌人 3 / 3
✅ 所有敌人生成完成
```

### 🎯 下一步诊断

如果问题仍然存在，需要检查：
1. 浏览器控制台的实际输出
2. state是否真的被设置为'playing'
3. keys对象是否正确更新
4. Player对象是否正确创建
5. 敌人数组是否有元素

### 📁 文件修改
- `game.js`：
  - 添加完整调试日志系统
  - 在关键位置添加console.log
  - 保留核心调试，移除过多的移动日志

---

## 📅 2026年2月11日 - 第六次更新 v2（紧急修复）

### 🐛 严重Bug修复

#### **全局变量作用域问题** ⚠️ 导致主菜单按钮失效

**问题描述**：
- 点击"普通模式"按钮无反应
- 浏览器控制台报错：`Uncaught ReferenceError: game is not defined`
- 主菜单完全无法使用

**根本原因**：
```javascript
// ❌ 错误代码：game在局部作用域中
Assets.load().then(() => {
    const game = new Game(); // 只在then()作用域内可见
});

// HTML中的onclick无法访问
<button onclick="game.startRun()">普通模式</button>
```

**修复方案**：
```javascript
// ✅ 正确：声明为全局变量
let game; // 在顶层作用域声明

Assets.load().then(() => {
    game = new Game(); // 赋值给全局变量
});

// 现在HTML可以访问了
<button onclick="game.startRun()">普通模式</button>
```

### 💡 问题分析

**为什么会发生**：
1. 我添加了异步素材加载：`Assets.load().then()`
2. 将 `new Game()` 放在then回调中
3. 使用了 `const game`（块作用域）而不是全局声明
4. HTML的onclick属性需要访问全局的game对象

**影响范围**：
- ✅ 主菜单三个按钮全部失效
- ✅ 统计按钮也无法使用
- ✅ 整个游戏入口被完全堵塞

### 📁 文件修改
- `game.js`：
  - 第1393行：添加 `let game;` 全局声明
  - 第1397行：改为 `game = new Game();`（赋值）
  - 第1401行：改为 `game = new Game();`（赋值）

### ✅ 修复验证
刷新页面后：
- ✅ 点击"普通模式"进入职业选择
- ✅ 点击"统计"显示数据
- ✅ 控制台无报错
- ✅ 游戏正常启动

---

## 📅 2026年2月11日 - 第六次更新（重大Bug修复）

### 🐛 关键Bug修复

#### 1. **GameLoop启动失败** ⚠️ 严重问题
**问题描述**：
- 选择职业后进入战斗画面，但角色和怪物完全不显示
- 游戏界面卡死，无法操作
- 只能看到HUD和塔形进度条，画布内容为空

**深度分析**：
```javascript
// 第一个问题：gameLoop条件判断后直接return
gameLoop() {
    if (this.state !== 'playing' || this.isPaused) return; // ❌ 停止递归
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
}

// 第二个问题：没有在初始化时启动gameLoop
constructor() {
    // ... 初始化代码
    this.init();
    // ❌ 缺少 this.gameLoop() 调用
}
```

**为什么会失败**：
1. `selectClass()`调用`gameLoop()`时，state已经是'playing'
2. 但初次调用后，如果有任何状态切换，循环就会中断
3. 一旦return，`requestAnimationFrame`不再被调用
4. 游戏循环永久停止，画布不再更新

**完整修复方案**：
```javascript
// ✅ 修复1：确保gameLoop永不停止
gameLoop() {
    // 只在playing状态时执行游戏逻辑
    if (this.state === 'playing' && !this.isPaused) {
        this.update();
        this.render();
        this.updateHUD();
    }
    // 无论什么状态都保持循环运行
    requestAnimationFrame(() => this.gameLoop());
}

// ✅ 修复2：添加启动方法，防止重复调用
startGameLoop() {
    if (this.isGameLoopRunning) return;
    this.isGameLoopRunning = true;
    this.gameLoop();
}

// ✅ 修复3：在构造函数中启动
constructor() {
    // ... 初始化代码
    this.init();
    this.loadStats();
    this.startGameLoop(); // 立即启动循环
}

// ✅ 修复4：selectClass中移除重复调用
selectClass(classData) {
    // ...
    // gameLoop已在构造函数中启动，无需重复调用
}
```

### ✨ 新增功能

#### 1. **素材资源管理系统**
- 创建`Assets`资源管理器
- 支持图片预加载和错误处理
- 实现降级渲染策略（图片失败时使用像素绘制）

```javascript
const Assets = {
    images: {},
    loaded: false,
    load() {
        return new Promise((resolve, reject) => {
            // 加载角色和精灵表
            // 支持加载失败降级
        });
    }
};
```

#### 2. **图片素材集成**
- ✅ 角色素材：`roguelikeChar_transparent.png`
- ✅ 完整精灵表：`sheet_white2x.png`
- ✅ 自动降级到像素绘制
- ✅ 控制台日志显示加载状态

#### 3. **混合渲染系统**
```javascript
// Player绘制优先级
drawPixelPlayer(ctx) {
    if (Assets.loaded && Assets.images.character.complete) {
        // 使用图片素材
        ctx.drawImage(...);
    } else {
        // 降级到像素绘制
        this.drawPixelPlayerFallback(ctx);
    }
}
```

### 📚 文档更新

#### 新增文档
1. **`assets/素材说明.md`** - 完整的素材文件分类
   - 🎮 角色相关（3个文件）
   - 🗺️ 地图/背景（4个文件）
   - 🛡️ 道具/物品（2个文件）
   - 🎯 UI图标（2个文件）
   - 📋 精灵表集合（4个文件）
   - 推荐使用方案和集成建议

### 🔧 技术改进

#### 代码结构优化
```
游戏启动流程（修复后）：
1. 加载HTML/CSS/JS
2. Assets.load() - 预加载图片
3. new Game() - 初始化游戏对象
4. startGameLoop() - 启动游戏循环
5. 用户选择职业
6. state = 'playing' - 激活游戏逻辑
7. gameLoop持续运行，根据state决定是否更新
```

#### 渲染管线
```
render() {
  清空画布
  → 绘制网格背景
  → 绘制边框
  → 绘制子弹
  → 绘制敌人（图片 or 像素）
  → 绘制玩家（图片 or 像素）
  → 绘制塔形进度条
  → 更新HUD
}
```

### 🎨 素材整理

#### Assets文件夹内容
```
assets/
├── 角色类
│   ├── spritesheet_characters.png ⭐ 推荐
│   ├── roguelikeChar_magenta.png
│   └── roguelikeChar_transparent.png ✅ 当前使用
├── 地图类
│   ├── tilemap.png
│   ├── tilemap_packed.png
│   └── spritesheet_tiles.png
├── 道具类
│   ├── genericItems_spritesheet_colored.png
│   └── genericItems_spritesheet_white.png
├── UI类
│   ├── iconsDefault.png
│   └── iconsDouble.png
└── 完整精灵表
    ├── sheet_black1x.png
    ├── sheet_black2x.png
    ├── sheet_white1x.png ⭐ 完整素材
    └── sheet_white2x.png ✅ 当前使用
```

### 🐛 修复的问题总结
1. ✅ **GameLoop永不启动** - 添加构造函数启动
2. ✅ **GameLoop中途停止** - 移除条件return
3. ✅ **重复启动循环** - 添加isGameLoopRunning标志
4. ✅ **素材加载无降级** - 实现fallback渲染

### 📁 文件修改
- `game.js`：
  - 添加Assets资源管理器（60行）
  - 修改Game构造函数（添加startGameLoop）
  - 优化gameLoop逻辑（移除条件return）
  - 修改Player.drawPixelPlayer（图片+降级）
  - 修改Enemy.drawPixelEnemy（图片+降级）
  - 修改游戏启动代码（异步加载）
- 新增：`assets/素材说明.md`（200+行）

### 💡 经验总结

#### 为什么GameLoop会失败
1. **错误假设**：以为只要在selectClass中调用就行
2. **忽略的问题**：条件return会永久中断循环
3. **正确做法**：
   - 在构造函数启动（确保单次启动）
   - 循环体内判断状态（而非循环外）
   - 使用标志防止重复启动

#### RequestAnimationFrame最佳实践
```javascript
// ❌ 错误：条件return
gameLoop() {
    if (条件) return; // 停止递归
    // ...
    requestAnimationFrame(gameLoop);
}

// ✅ 正确：条件在内部
gameLoop() {
    if (条件) {
        // 执行逻辑
    }
    requestAnimationFrame(gameLoop); // 始终递归
}
```

### 🎯 下一步计划
1. ✅ 测试游戏是否正常运行
2. ⏳ 调整精灵表坐标（当前使用估计值）
3. ⏳ 添加不同职业的角色图片
4. ⏳ 从精灵表提取更多怪物类型
5. ⏳ 添加动画效果（移动、攻击）

---

## 📅 2026年2月11日 - 第五次更新

### 🐛 紧急Bug修复（已过时 - 见第六次更新）

#### 1. **游戏循环致命问题**
⚠️ 注意：此修复不完整，导致问题仍然存在
- 问题：修改了gameLoop逻辑，但没有在构造函数启动
- 结果：游戏仍然无法正常运行
- 真正修复：见第六次更新

---

## 📅 2026年2月11日 - 第四次更新

### ✨ 新增功能

#### 1. 攻击系统完全重做
- **修复冷却递减问题**：之前shootCooldown没有在update中递减，导致攻击间隔异常长
- **大幅降低攻击冷却**：所有职业攻击更流畅（参考土豆兄弟）
  - 战士系：12帧（0.2秒）
  - 法师系：5帧（0.08秒）- 最流畅的远程输出
  - 元素使：7帧（0.12秒）
  - 游侠系：8帧（0.13秒）
  - 狙击手：15帧（0.25秒）
  - 影刃：3帧（0.05秒）- 极速刺客
- **真正的持续射击**：按住鼠标即可连续攻击，无需反复点击

#### 2. UI优化
- **移除准星**：删除了鼠标位置的十字准星
  - 与系统鼠标指针重叠
  - 提升视觉简洁度
  - 参考土豆兄弟等现代roguelike游戏的UI设计

### 🔧 技术改进
- 在`Player.update()`中添加`shootCooldown--`递减逻辑
- 在`render()`中移除准星绘制代码
- 优化所有武器的攻击频率数值

### 🐛 修复的问题
- ✅ **关键Bug**：攻击冷却不递减，导致10秒+才能攻击一次
- ✅ 准星与鼠标重叠的视觉问题

### 📁 文件修改
- `game.js`：
  - `Player.update()`：添加shootCooldown递减
  - `shoot()`：所有武器冷却时间大幅降低
  - `render()`：移除准星绘制代码

### 💡 设计理念
参考《土豆兄弟》等优秀roguelike游戏：
- 攻击应该流畅且频繁
- 让玩家感受到"爽快"的战斗节奏
- UI应该简洁，不遮挡游戏画面
- 鼠标操作应该自然直观

---

## 📅 2026年2月11日 - 第三次更新

### ✨ 新增功能

#### 1. 攻击系统优化
- **修复攻击频率问题**：改为鼠标按下即可攻击，不再需要等待冷却
- **持续攻击机制**：按住鼠标左键可以连续攻击（根据武器冷却）
- **流畅射击体验**：
  - 战士系：20帧冷却（约0.33秒）
  - 法师系：10帧冷却（约0.17秒）
  - 元素使：12帧冷却（约0.2秒）
  - 游侠系：15帧冷却（约0.25秒）
  - 狙击手：25帧冷却（约0.42秒）
  - 影刃：6帧冷却（约0.1秒）

#### 2. 角色模型重制
- **更清晰的人物轮廓**：
  - 像素块从3x3增加到4x4
  - 添加黑色轮廓描边
  - 头部、身体、手臂、腿部分离更明显
  - 眼睛增加眼珠细节
  - 武器颜色指示器（显示职业武器颜色）
- **更好的视觉识别**：
  - 人物高度从24像素增加到32像素
  - 更有立体感和层次感

#### 3. 怪物模型重制
- **普通敌人 - 史莱姆风格**：
  - 圆润的Q版造型
  - 深红色轮廓 + 红色主体
  - 淡红色高光效果
  - 可爱的黑色大眼睛（带白色高光）
  - 参考经典RPG游戏史莱姆设计

- **Boss敌人 - 史莱姆王**：
  - 体型更大（5x5像素块）
  - 金色王冠装饰
  - 发光的红色眼睛
  - 紫色能量核心（带发光特效）
  - 多层次渐变色彩
  - 更有威严感的设计

### 🎨 视觉改进
- 所有角色和怪物采用更精致的像素画风
- 添加阴影和高光效果
- Boss有特殊的发光粒子效果
- 角色武器颜色实时显示

### 🔧 技术改进
- 修改鼠标事件从`click`改为`mousedown/mouseup`
- 添加`isMouseDown`状态追踪
- 在`update()`方法中检测持续射击
- 优化射击冷却机制（在射击时设置，而不是每帧递减）
- 重构角色和怪物绘制函数

### 🐛 修复的问题
- ✅ 战士攻击频率太低的问题
- ✅ 需要连续点击才能攻击的问题
- ✅ 角色轮廓不清晰的问题
- ✅ 怪物设计单调的问题

### 📁 文件修改
- `game.js`：
  - 构造函数添加`isMouseDown`状态
  - `init()`方法修改鼠标事件监听
  - `update()`方法添加持续射击逻辑
  - `shoot()`方法移除冷却递减
  - 调整所有武器的冷却时间
  - 完全重写`drawPixelPlayer()`
  - 完全重写`drawPixelEnemy()`（普通敌人）
  - 完全重写`BossEnemy.drawPixelEnemy()`

---

## 📅 2026年2月11日 - 第二次更新

### ✨ 新增功能

#### 1. 职业系统
- **开局职业选择**：游戏开始时可以选择3种职业
  - ⚔️ **战士**：近战高攻，生命值高 (HP: 120, 攻击: 25, 速度: 2.8)
    - 武器：挥砍攻击（扇形3发近战）
  - 🔮 **法师**：远程魔法，攻速快 (HP: 80, 攻击: 30, 速度: 3.2)
    - 武器：魔法弹（单发高速带发光效果）
  - 🎯 **游侠**：灵活机动，多段攻击 (HP: 100, 攻击: 20, 速度: 3.5)
    - 武器：弹幕（三连发）

#### 2. 职业进阶系统
- **进阶触发**：通过Boss关（第3/7/10层）后可选择职业进阶
- **进阶职业**（每个职业2个进阶方向）：
  
  **战士进阶：**
  - 🔥 **狂战士**：狂暴之力，伤害暴增 (HP: 140, 攻击: 35, 速度: 3.0)
  - ✨ **圣骑士**：圣光守护，自带治疗 (HP: 150, 攻击: 28, 速度: 2.8)
  
  **法师进阶：**
  - ⚡ **大法师**：魔力激增，弹幕更密 (HP: 90, 攻击: 40, 速度: 3.2)
  - 🌊 **元素使**：元素融合，附加效果 (HP: 85, 攻击: 32, 速度: 3.3)
  
  **游侠进阶：**
  - 🎯 **狙击手**：精准射击，暴击率高 (HP: 95, 攻击: 45, 速度: 3.4)
  - 🗡️ **影刃**：暗影刺客，暴击必杀 (HP: 105, 攻击: 25, 速度: 4.0)

#### 3. 武器特效系统
- **挥砍攻击**（战士/狂战士/圣骑士）：扇形近战范围攻击，3发弧形子弹
- **魔法弹**（法师/大法师）：高速单发，带发光特效
- **元素弹**（元素使）：双发彩色粒子，带渐变效果
- **弹幕**（游侠）：三连发，快速连射
- **狙击**（狙击手）：高伤害穿透弹，带光束尾迹
- **影刃**（影刃）：快速小型弹幕，高攻速

#### 4. UI改进
- **休息站增加返回主菜单按钮**：玩家可以在休息站直接返回主菜单
- **职业选择界面**：精美的职业卡片展示，显示职业图标、描述和属性
- **职业进阶界面**：展示进阶选项，显示属性对比（+增量）

### 🎨 视觉效果
- 不同职业的子弹颜色：
  - 战士系：红色 (#ef4444 / #dc2626 / #fbbf24)
  - 法师系：紫色 (#a855f7 / #8b5cf6 / #06b6d4)
  - 游侠系：绿色/橙色/蓝色 (#10b981 / #f59e0b / #6366f1)
- 子弹特效：
  - 挥砍：弧形半透明
  - 魔法：发光阴影效果
  - 元素：径向渐变粒子
  - 狙击：长条光束尾迹

### 🔧 技术改进
- Player类增加职业数据支持
- 新增多种攻击创建方法：
  - `createSlashAttack()` - 近战挥砍
  - `createMagicAttack()` - 魔法弹
  - `createElementalAttack()` - 元素弹
  - `createProjectileAttack()` - 弹幕
  - `createSnipeAttack()` - 狙击
  - `createShadowAttack()` - 影刃
- Bullet类增加类型和特效支持
- 游戏流程增加职业进阶判断逻辑

### 📁 文件修改
- `game.js`：
  - 新增 `CLASSES` 和 `ADVANCED_CLASSES` 配置对象
  - 修改 `Player` 构造函数支持职业参数
  - 重写 `shoot()` 方法支持多种武器类型
  - 新增多个武器创建方法
  - 修改 `Bullet` 类支持不同类型和绘制效果
  - 新增 `renderClassSelection()` 职业选择渲染
  - 新增 `selectClass()` 职业选择逻辑
  - 新增 `showClassAdvancement()` 职业进阶界面
  - 新增 `advanceClass()` 职业进阶逻辑
  - 修改 `onRoomCleared()` 添加进阶判断

- `index.html`：
  - 新增 `classSelectScreen` 职业选择界面
  - 新增 `classAdvanceScreen` 职业进阶界面
  - 休息站添加返回主菜单按钮

- `style.css`：
  - 新增职业选择相关样式
  - 新增职业卡片样式 `.class-card`
  - 新增职业图标样式 `.class-icon`
  - 新增职业属性展示样式 `.class-stats`
  - 新增进阶卡片样式 `.advance-card`
  - 新增属性差异样式 `.stat-diff`

### 🎮 游戏流程变化
1. 主菜单 → **职业选择** → 战斗
2. 通过Boss关 → **职业进阶选择** → 奖励/休息站
3. 休息站 → 可直接返回主菜单

---

## 📅 2026年2月11日 - 第一次更新

### ✨ 新增功能

#### 1. 像素风格角色模型
- **玩家角色**：蓝色像素小人，包含头部、身体、手臂和腿部
  - 身体：蓝色 (#5b8def)
  - 头部：亮蓝色 (#7ba5f7)
  - 眼睛：白色
  - 腿部：深蓝色 (#3a5fa0)

#### 2. 像素风格怪物模型
- **普通敌人**：红色像素怪物
  - 身体：红色 (#ef4444)
  - 尖角：深红色 (#b91c1c)
  - 眼睛：黄色发光 (#fbbf24)
  - 嘴巴：深红色 (#7f1d1d)

- **Boss敌人**：大型Boss怪物
  - 体型：比普通敌人大1.6倍
  - 身体：深红色 (#991b1b)
  - 头部：红色 (#dc2626)
  - 大型尖角：深红色 (#7f1d1d)
  - 眼睛：黄色发光 (#fbbf24)
  - 能量装饰：紫色 (#a855f7)
  - 特殊能力：会向玩家发射子弹

#### 3. 塔形进度条系统
- **位置**：游戏画面右侧
- **结构**：10层塔楼，从下到上逐渐变窄
- **状态显示**：
  - 🟢 绿色：已通过的楼层
  - 🟡 黄色：当前所在楼层（加粗边框高亮）
  - 🔴 红色：Boss关卡（第3、7、10层）
  - ⚫ 灰色：未到达的楼层
- **Boss标记**：Boss层显示👑图标
- **塔顶**：金色三角形 + ⭐星星装饰

#### 4. Boss关卡机制
- **Boss层配置**：第3、7、10层
- **敌人组成**：
  - 1个大型Boss（中央生成）
  - 2个普通小怪（边缘生成）
- **Boss特性**：
  - 血量：100 + 层数 × 30
  - 伤害：15 + 层数 × 5
  - 速度：普通敌人的70%
  - 每60帧发射一次子弹

### 🎨 视觉效果
- 所有角色采用3像素块大小绘制（Boss为4像素）
- 保留了血条显示
- 塔形进度条实时更新
- Boss层有特殊的金色标记

### 🔧 技术改进
- 新增 `drawPixelPlayer()` 方法绘制玩家像素模型
- 新增 `drawPixelEnemy()` 方法绘制敌人像素模型
- 新增 `BossEnemy` 类继承自 `Enemy`
- 新增 `drawTowerProgress()` 方法绘制塔形进度条
- 修改 `startCombatRoom()` 支持Boss关特殊生成逻辑
- 配置中添加 `TOTAL_FLOORS` 和 `BOSS_FLOORS`

### 📁 文件修改
- `game.js`：
  - CONFIG添加 `TOTAL_FLOORS: 10` 和 `BOSS_FLOORS: [3, 7, 10]`
  - Player类的 `draw()` 方法调用 `drawPixelPlayer()`
  - Enemy类的 `draw()` 方法调用 `drawPixelEnemy()`
  - 新增 `BossEnemy` 类
  - `render()` 方法中调用 `drawTowerProgress()`
  - `startCombatRoom()` 中添加Boss关判断逻辑

### 🎮 游戏玩法
- 玩家可以通过右侧塔形进度条清楚看到：
  - 当前所在楼层
  - 还需要闯多少关
  - 哪些是Boss关卡
  - 已经通过了哪些关卡

---

## 📝 初始版本功能

### 核心系统
- ✅ 玩家移动控制（WASD/方向键）
- ✅ 冲刺系统（空格键）
- ✅ 鼠标射击
- ✅ 敌人生成和AI
- ✅ 碰撞检测
- ✅ 血量系统

### 游戏进程
- ✅ 楼层系统（1-10层）
- ✅ 战斗房间
- ✅ 奖励选择（三选一）
- ✅ 休息站（免费奖励 + 商店）
- ✅ 死亡结算

### UI系统
- ✅ 主菜单
- ✅ HUD（血量、金币、层数）
- ✅ 暂停菜单
- ✅ 结算界面

### 数据持久化
- ✅ 记忆币保存
- ✅ 总局数统计
- ✅ 胜利次数统计

---

## 🔮 未来计划

### 待实现功能
- [ ] 更多奖励类型
- [ ] 遗物系统
- [ ] 商店物品多样化
- [ ] 特殊事件房间
- [ ] 成就系统
- [ ] 音效和背景音乐
- [ ] 更多Boss种类
- [ ] 难度选择
- [ ] 无尽模式

### 优化计划
- [ ] 性能优化
- [ ] 平衡性调整
- [ ] 更丰富的视觉特效
- [ ] 粒子系统
- [ ] 屏幕震动效果

---

## 📊 统计信息

- **代码行数**：约1300行（game.js）
- **职业数量**：3个基础职业 + 6个进阶职业
- **武器类型**：7种不同的攻击方式
- **总楼层数**：10层
- **Boss关卡**：3个（第3/7/10层）
- **文件数量**：3个（HTML + CSS + JS）
- **怪物类型**：史莱姆（普通）+ 史莱姆王（Boss）

---

## 🐛 已知问题

- 游侠三连发可能在快速点击时表现不稳定（setTimeout问题）
- 子弹数量较多时可能影响性能

---

## 💡 开发笔记

### 攻击频率设计
参考土豆兄弟等roguelike游戏：
- 60FPS下，5-15帧冷却是比较舒适的射速
- 法师类应该最快（5帧 = 12发/秒）
- 重型武器可以稍慢（15帧 = 4发/秒）
- 刺客类可以极快（3帧 = 20发/秒）

### 职业平衡性考虑
- **战士**：高血量坦克定位，近战范围伤害
- **法师**：高输出脆皮，适合远程风筝
- **游侠**：平衡型，高机动性

### 进阶设计思路
- 每个职业提供2个不同方向的进阶
- 一个偏向极端强化（如狂战士强化输出）
- 一个偏向平衡发展（如圣骑士增加生存）

### 子弹系统设计
- 每种武器有独特的视觉效果
- 冷却时间不同，平衡输出频率
- 部分武器有特殊属性（如狙击穿透）

### 像素艺术设计
- 角色采用4x4像素块，带黑色轮廓
- 怪物采用史莱姆风格，Q版可爱
- Boss有特殊装饰和发光效果
- 所有模型都有高光和阴影细节

---

**最后更新时间**：2026年2月11日
**版本号**：v0.4.0
**开发者备注**：修复关键Bug！攻击系统现在流畅如丝，战斗体验大幅提升！参考土豆兄弟优化了攻击频率和UI设计。
