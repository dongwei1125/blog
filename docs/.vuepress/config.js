module.exports = {
  title: 'Don_GW',
  description: 'A paper about JavaScript, HTML and CSS.',
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ],
  themeConfig: {
    logo: '/logo.png',
    lastUpdated: '最后更新时间',
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
          { text: '掘金', link: 'https://juejin.cn/user/2621689331987783' },
          { text: 'CSDN', link: 'https://blog.csdn.net/Don_GW' }
        ]
      }
    ]
  }
}