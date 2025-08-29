# winjs-plugin-icons-legacy

适配 WinJS 的 SVG 图标遗留方案插件，专为 Vue2 项目设计，使用 svg-sprite-loader 雪碧图技术。

<p>
  <a href="https://npmjs.com/package/@winner-fed/plugin-icons-legacy">
   <img src="https://img.shields.io/npm/v/@winner-fed/plugin-icons-legacy?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@winner-fed/plugin-icons-legacy?minimal=true"><img src="https://img.shields.io/npm/dm/@winner-fed/plugin-icons-legacy.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## 功能特性

- ✅ **SVG 雪碧图方案**：使用 svg-sprite-loader 将 SVG 图标转换为 symbol 标签
- ✅ **自动优化**：集成 svgo-loader 自动优化 SVG 文件，移除填充和描边属性
- ✅ **Vue2 专用**：专门为 Vue2 项目优化，配合 @winner-fed/preset-vue2 使用
- ✅ **自定义路径**：支持配置多个图标目录路径
- ✅ **开箱即用**：默认处理 `src/icons` 目录下的 SVG 文件
- ✅ **Webpack 兼容**：同时支持 Webpack 和 Rsbuild 构建方式

## 安装

```bash
npm install @winner-fed/plugin-icons-legacy -D
# 或
yarn add @winner-fed/plugin-icons-legacy -D
# 或
pnpm add @winner-fed/plugin-icons-legacy -D
```

## 配置

### 基本配置

在 `.winrc.ts` 文件中配置：

```typescript
import { defineConfig } from 'win';

export default defineConfig({
  presets: [require.resolve('@winner-fed/preset-vue2')],
  plugins: [require.resolve('@winner-fed/plugin-icons-legacy')],
  iconsLegacy: {
    // 可选：自定义图标目录
    include: [
      'src/assets/icons',
      'src/components/icons'
    ]
  }
});
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `include` | `string[]` | `[]` | 额外的图标目录路径，默认已包含 `src/icons` |

## 使用方式

### 1. 目录结构

```
src/
├── icons/
│   ├── index.js          # 图标入口文件
│   └── svg/
│       ├── dog.svg       # 图标文件
│       ├── cat.svg
│       └── ...
├── components/
│   └── SvgIcon/
│       └── index.vue     # 图标组件
└── pages/
    └── index.vue
```

### 2. 图标入口文件

创建 `src/icons/index.js`：

```javascript
const req = require.context('./svg', false, /\.svg$/);
const requireAll = (requireContext) => requireContext.keys();

// 自动引入所有 SVG 图标
requireAll(req).map(req);

const re = /\.\/(.*)\.svg/;

// 导出图标名称列表（可选）
export const iconNames = requireAll(req).map((i) => {
  return i.match(re)[1];
});
```

### 3. SvgIcon 组件

创建 `src/components/SvgIcon/index.vue`：

```vue
<template>
  <svg :class="['svg-icon', className]" aria-hidden="true" @click="clickHandle">
    <use :xlink:href="'#icon-' + (iconName || name)" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    iconName: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    className: {
      type: [String, Array],
      default: ''
    }
  },
  mounted() {
    if (!this.name && !this.iconName) {
      console.error('Missing required prop: "iconName or name"');
    }
  },
  methods: {
    clickHandle() {
      this.$emit('click');
    }
  }
};
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: -0.15em;
  overflow: visible;
  position: relative;
}
</style>
```

### 4. 在页面中使用

```vue
<template>
  <div>
    <!-- 使用 name 属性 -->
    <svg-icon name="dog" class="icon-large"></svg-icon>
    
    <!-- 使用 iconName 属性 -->
    <svg-icon iconName="cat" @click="handleIconClick"></svg-icon>
    
    <!-- 自定义样式 -->
    <svg-icon name="star" :className="['icon-star', 'active']"></svg-icon>
  </div>
</template>

<script>
// 引入图标
import '@/icons';

export default {
  methods: {
    handleIconClick() {
      console.log('图标被点击了');
    }
  }
};
</script>

<style>
.icon-large {
  font-size: 24px;
  color: #1890ff;
}

.icon-star.active {
  color: #faad14;
}
</style>
```

### 5. 全局注册组件

在 `main.js` 中全局注册：

```javascript
import Vue from 'vue';
import SvgIcon from '@/components/SvgIcon';

// 引入图标
import '@/icons';

// 全局注册组件
Vue.component('svg-icon', SvgIcon);

// 或者使用插件方式
const iconPlugin = {
  install(Vue) {
    Vue.component('svg-icon', SvgIcon);
  }
};

Vue.use(iconPlugin);
```

## 高级用法

### 动态引入图标

```javascript
// 动态引入特定图标
const importIcon = (name) => {
  return import(`@/icons/svg/${name}.svg`);
};

// 批量引入
const importIcons = (names) => {
  return Promise.all(names.map(name => importIcon(name)));
};
```

### 图标列表获取

```javascript
// 获取所有可用图标名称
import { iconNames } from '@/icons';

export default {
  data() {
    return {
      availableIcons: iconNames
    };
  }
};
```

## 技术原理

1. **svg-sprite-loader**：将 SVG 文件转换为 `<symbol>` 标签，并生成雪碧图
2. **svgo-loader**：优化 SVG 文件，移除不必要的属性（如 fill、stroke）
3. **符号引用**：通过 `<use>` 标签引用 symbol，实现图标复用
4. **自动配置**：插件自动配置 Webpack 和 Rsbuild 的加载规则

## 注意事项

- 仅支持 Vue2 项目，需要配合 `@winner-fed/preset-vue2` 使用
- SVG 文件应放在指定的图标目录中（默认 `src/icons`）
- 图标名称基于文件名，使用时需要保持一致
- 建议 SVG 文件不要包含 fill 和 stroke 属性，让组件控制颜色

## 常见问题

### Q: 为什么图标不显示？
A: 请确保：
1. 正确引入了 `@/icons` 入口文件
2. SVG 文件放在正确的目录中
3. 图标名称与文件名一致
4. 配置了正确的 preset-vue2

### Q: 如何自定义图标样式？
A: 通过 CSS 控制：
```css
.svg-icon {
  width: 20px;
  height: 20px;
  fill: #333;
}
```

### Q: 如何添加更多图标目录？
A: 在配置中添加 `include` 选项：
```typescript
iconsLegacy: {
  include: ['src/assets/icons', 'src/shared/icons']
}
```

## 许可证

[MIT](./LICENSE).
