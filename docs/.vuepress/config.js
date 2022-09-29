module.exports = {
  title: 'DonV',
  description: 'A paper about JavaScript, HTML and CSS.',
  head: [
    ['link', { rel: 'icon', href: '/header.jpg' }]
  ],
  themeConfig: {
    logo: '/header.jpg',
    lastUpdated: '最后更新时间',
    backToTop: true,
    sidebar: 'auto',
    nav: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: 'JavaScript',
        link: '/pages/js/nav.md'
      },
      {
        text: 'HTML',
        link: '/pages/html/nav.md'
      },
      {
        text: 'CSS',
        link: '/pages/css/nav.md'
      },
      {
        text: '其它',
        link: '/pages/other/nav.md'
      },
      {
        text: '应用',
        link: '/pages/app/nav.md'
      },
      {
        text: '关于',
        items: [
          { text: 'GitHub', link: 'https://github.com/dongwei1125' },
          { text: 'Gitee', link: 'https://gitee.com/dongwei1125' },
          { text: '掘金', link: 'https://juejin.cn/user/2621689331987783' },
          { text: 'CSDN', link: 'https://blog.csdn.net/Don_GW' },
          { text: 'NPM', link: 'https://www.npmjs.com/~dongwei1125' }
        ]
      }
    ]
  },
  plugins: ['@vuepress/back-to-top']
}