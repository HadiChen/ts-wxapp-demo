Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.setData!({
      logs: (wx.getStorageSync('logs') || []).map((log: string) => {
        return log
      })
    })
  }
})
