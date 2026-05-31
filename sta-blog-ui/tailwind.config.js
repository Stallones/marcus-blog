// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        // coinglass 风格颜色
        surface: {
          0: '#ffffff',      // 亮色卡片
          50: '#f8f9fa',     // 亮色主背景
          100: '#f1f3f5',    // 亮色次级
          200: '#e9ecef',    // 亮色边框
          700: '#21262d',    // 暗色次级
          800: '#161b22',    // 暗色卡片
          900: '#0d1117',    // 暗色主背景
        },
        accent: {
          light: '#3b82f6',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          night: '#58a6ff',
        },
        border: {
          light: '#e9ecef',
          dark: '#30363d',
        },
        text: {
          primary: '#212529',
          secondary: '#6c757d',
          dark: '#e6edf3',
          'dark-secondary': '#8b949e',
        },
      },
    },
  },
  plugins: [],
};
