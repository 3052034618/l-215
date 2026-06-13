export default defineAppConfig({
  pages: [
    'pages/resources/index',
    'pages/calendar/index',
    'pages/pickup/index',
    'pages/records/index',
    'pages/admin/index',
    'pages/detail/index',
    'pages/booking-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '企业资产预约',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/resources/index',
        text: '资源'
      },
      {
        pagePath: 'pages/calendar/index',
        text: '预约'
      },
      {
        pagePath: 'pages/pickup/index',
        text: '领取'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      },
      {
        pagePath: 'pages/admin/index',
        text: '管理'
      }
    ]
  }
})
