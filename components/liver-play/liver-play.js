// components/liver-play/liver-play.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isFirst: true,
    deviceHeight: 0,
    deviceWidth: 0,
    orientation: "vertical",
    isPlay: true,
    isMute: false,
    playOrPause: "暂停",
    showControlBar: true,
    playerComponentHeight: "450rpx",
    controlBarHeight: "100rpx",
    controlBarWidth: "100%",
    controlBarTop: "360rpx",
    playBtnLeft: "3%",
    playBtnTop: "18rpx",
    refreshBtnLeft: "15%",
    refreshBtnTop: "-40rpx",
    muteBtnLeft: "28%",
    muteBtnTop: "-100rpx",
    fullBtnLeft: "88%",
    fullBtnTop: "-160rpx",
    videoHeight: 0,
    videoWidth: 0,
    hasGotVideo: false,
    currentDirection: "vertical",
    isFullScreen: false,
    isNeedRotate: false,
    isLoading: true,
    canShowNetModal: true,
    allowCellular: false
  },
  ready: function () {
    this.liverCtx = wx.createLivePlayerContext('liver-play', this)
    var _this = this
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          deviceHeight: res.screenHeight,
          deviceWidth: res.screenWidth
        })
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindTest() {
      wx.showToast({
        title: 'ok',
      })
    },
    handleControlBar() {
      this.setData({
        showControlBar: !this.data.showControlBar
      })
    },
    stateChange(e) {
      var code = e.detail.code
      // if (code === 2007 || code === 2104 || code === 2105 || code === -2302) {
      //   this.setData({
      //     isLoading: true
      //   })
      // } else if (code === 2004 || code === 2003) {
      //   this.setData({
      //     isLoading: false
      //   })
      // }
      switch (code) {
        case 2004:
          this.setData({ isLoading: false })
          break;
        case 2103:
          this.setData({ isLoading: true })
          break;
        case -2301:
          this.setData({ isLoading: true })
          break;
      }
      console.log(e)
      console.log('live-player code:', e.detail.code)
    },
    netChange(info) {
      var _this = this
      wx.getNetworkType({
        success: function (res) {
          var networkType = res.networkType
          if (networkType === 'none' && _this.data.canShowNetModal) {
            _this.setData({
              canShowNetModal: false
            })
            wx.showModal({
              title: '网络提示',
              content: '请检查您的网络！',
              success: function (res) {
                console.log('no net')
                _this.setData({
                  canShowNetModal: true
                })
              }
            })

          } else if (networkType !== 'wifi' && _this.data.canShowNetModal 
            && !_this.data.allowCellular) {
            console.log('should pause')
            _this._pause()
            _this.setData({
              canShowNetModal: false
            })
            wx.showModal({
              title: '网络提示',
              content: '您当前为非wifi播放',
              confirmText: '继续播放',
              cancelText: '停止播放',
              success: function (res) {
                if (res.confirm) {
                  _this._play()
                  _this.setData({
                    allowCellular: true
                  })
                }
                console.log('resume play')
                _this.setData({
                  canShowNetModal: true
                })
              }
            })
          }
        }
      })
      var videoObj = info.detail.info
      if (!this.data.hasGotVideo) {
        if (videoObj.videoHeight > 0 && videoObj.videoWidth > 0) {
          this.setData({
            videoHeight: videoObj.videoHeight,
            videoWidth: videoObj.videoWidth,
            hasGotVideo: true
          })
        }
      }
    },
    fullScreenChange(info, fullScreen) {
      if (info.detail.fullScreen) {
        if (this.data.videoHeight < this.data.videoWidth || this.data.isFirst) {
          this.setData({
            orientation: "horizontal",
            playerComponentHeight: this.data.deviceHeight + "px",
            controlBarHeight: this.data.deviceHeight + "px",
            controlBarWidth: "100rpx",
            controlBarTop: "0rpx",
            playBtnLeft: "20rpx",
            playBtnTop: "10%",
            refreshBtnLeft: "20rpx",
            refreshBtnTop: "15%",
            muteBtnLeft: "20rpx",
            muteBtnTop: "20%",
            fullBtnLeft: "20rpx",
            fullBtnTop: "73%",
            // fullBtnLeft: "20rpx",
            // fullBtnTop: "80%",
            playBtnRotate: 90,
            isFullScreen: true,
            isNeedRotate: true,
            isFirst: false
          })
        } else {
          this.setData({
            orientation: "vertical",
            playerComponentHeight: this.data.deviceHeight + "px",
            controlBarHeight: "100rpx",
            controlBarWidth: "100%",
            controlBarTop: "90%",
            playBtnLeft: "3%",
            playBtnTop: "18rpx",
            refreshBtnLeft: "15%",
            refreshBtnTop: "-40rpx",
            muteBtnLeft: "28%",
            muteBtnTop: "-100rpx",
            fullBtnLeft: "88%",
            fullBtnTop: "-160rpx",
            playBtnRotate: 0,
            isFullScreen: true,
            isNeedRotate: false,
            isFirst: false
          })
        }
      } else {
        this.setData({
          orientation: "vertical",
          playerComponentHeight: "450rpx",
          controlBarHeight: "100rpx",
          controlBarWidth: "100%",
          controlBarTop: "360rpx",
          playBtnLeft: "3%",
          playBtnTop: "18rpx",
          refreshBtnLeft: "15%",
          refreshBtnTop: "-40rpx",
          muteBtnLeft: "28%",
          muteBtnTop: "-100rpx",
          fullBtnLeft: "88%",
          fullBtnTop: "-160rpx",
          playBtnRotate: 0,
          isFullScreen: false,
          isNeedRotate: false,
          isFirst: false
        })
      }
    },
    error(e) {
      console.error('live-player error:', e.detail.code, e.detail.message)
    },
    bindRefresh() {
      var _this = this
      this.liverCtx.play({
        success: function () {
          _this.setData({
            isPlay: true
          })
          console.log('resume success!')
        },
        fail: function () {
          console.log('resume failed!')
        },
        complete: function () {
          console.log('resume complete!')
        }
      })
    },
    bindFullScreen() {
      setTimeout(this._fullScreen.bind(this), 50)
    },
    _fullScreen() {
      if (this.data.isFullScreen) {
        this.liverCtx.exitFullScreen({
          success: function () {
            console.log('enter full screen mode success!')
          },
          fail: function () {
            console.log('enter full screen mode failed!')
          },
          complete: function () {
            console.log('enter full screen mode complete!')
          }
        })
      } else {
        this.liverCtx.requestFullScreen({
          success: function () {
            console.log('enter full screen mode success!')
          },
          fail: function () {
            console.log('enter full screen mode failed!')
          },
          complete: function () {
            console.log('enter full screen mode complete!')
          }
        })
      }
    },
    bindMute() {
      var _this = this
      this.liverCtx.mute({
        success: res => {
          _this.setData({
            isMute: !_this.data.isMute
          })
          console.log('mute success')
        },
        fail: res => {
          console.log('mute fail')
        }
      })
    },
    _play() {
      var _this = this
      this.liverCtx.play({
        success: res => {
          _this.setData({
            isPlay: true
          })
          console.log('play success')
        },
        fail: res => {
          console.log('play fail')
        }
      })
    },
    _pause() {
      var _this = this
      this.liverCtx.pause({
        success: res => {
          _this.setData({
            playOrPause: "播放",
            isPlay: false
          })
          console.log('pause success')
        },
        fail: res => {
          console.log('pause fail')
        }
      })
    },
    bindPlay() {
      if (!this.data.isPlay) {
        this._play()
      } else {
        this._pause()
      }
    }
  }
})
