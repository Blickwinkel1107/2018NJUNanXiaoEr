// pages/issue/issue.js
let app = getApp();
let Bmob = app.globalData.Bmob;
Page({
	data: {
		/*
		yhr 5-17：
		在data中定义商品名、商品描述、商品价格、商品种类
		方便在函数方法中修改
		tempFilePaths应为列表而不是字符串，因为可能都是选择多个图片
		isFull用来判断是否已选择9张图，并隐藏上传图片按钮
    yhr 5-18:
    添加ableToClick，默认值为true
    点击提交后置位false
		*/
		ableToClick: true,
		isFull: false,
		product_name: '',
		product_description: '',
		product_price: null,
		//化妆品种类是默认值
		product_category: '化妆品',
		//urlArr: [],
		tempFiles: {},
		value: [],
		items: [{ name: 'A', value: '化妆品' }, { name: 'B', value: '服饰装扮' }, { name: 'C', value: '食品饮料' }, { name: 'D', value: '演出门票' }, { name: 'E', value: '数码电子' }, { name: 'F', value: '其他' }]

	},

	//事件处理函数
	onLoad: function () {

	},
	onModalOpen() {

	},
	onModalClose() {

	},

	/*
	yhr 5-17:
	获取商品名函方法
	*/
	productTitle: function (e) {
		let that = this;
		that.setData({
			product_name: e.detail.value
		});
		//console.log(that.data.product_name);
	},

	/*
	yhr 5-17:
	获取商品描述方法
	*/
	productDetail: function (e) {
		let that = this;
		that.setData({
			product_description: e.detail.value
		});
		//console.log(that.data.product_description);
	},

	/*
	yhr 5-17:
	获取商品价格方法
	*/
	productPrice: function (e) {
		let that = this;
		if (isNaN(Number(e.detail.value))) {
			wx.showModal({
				title: '提示',
				content: '价格输入必须为数字！',
			});
			that.setData({
				product_price: null
			});
			console.log(that.data.product_price);
		}
		else if (Number(e.detail.value) > 10000) {
			wx.showModal({
				title: '提示',
				content: '亲~您的物品价格太高了哟，这个小平台承受不起呢，换个地方卖吧~，',
			});
			that.setData({
				product_price: Number(e.detail.value)
			});
		}
		else {
			that.setData({
				product_price: Number(e.detail.value)
			});
			//console.log(that.data.product_price);
		}
	},

	/*
	yhr 5-17:
	获取商品种类方法
	*/
	bindCheckboxChange: function (e) {
		let that = this;
		console.log(e.detail.value);
		if (e.detail.value.length != 0) {
			for (let i = 0; i < that.data.items.length; i++) {
				if (that.data.items[i].name == e.detail.value) {
					that.setData({
						product_category: that.data.items[i].value
					});
				}
			}
		}
		else {
			that.setData({
				product_category: '化妆品'
			});
		}
		console.log(that.data.product_category);
	},

	//上传图片的方法
	/*
	yhr 5-17:
	删除上传Loading框
	删除wx.uploadFile，应该在提交方法中调用该功能更为合适
	当已经选择9张图片时应隐藏上传按钮
	*/
	/*
	yhr 5-18:
	修复上传图片时的bug
	改用回调函数返回值的tempFiles属性
	（原来使用的是tempFilePaths）
	deletImage方法也做了相应的改动
	*/
	upImg: function () {
		let that = this;
		wx.chooseImage({
			count: 4,
			sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				console.log(res);
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
				let tempFiles = res.tempFiles;
				that.setData({
					tempFiles: tempFiles
				});
				//console.log(that.data.tempFilePaths);
				if (res.tempFilePaths.length == 4) {
					that.setData({
						isFull: true
					});
				}
			}
		})
	},

	//删除已上传图片的方法
	/*
	yhr 5-17:
	不使用urlArr（有错）
	直接使用tempFilePaths
	*/
	deleteImage: function (e) {
		// 获取本地显示的图片数组
		let that = this;
		let index = e.currentTarget.dataset.index;
		let imagePaths = that.data.tempFiles;
		imagePaths.splice(index, 1);
		that.setData({
			tempFiles: imagePaths,
			isFull: false
		});
		//console.log(that.data.tempFilePaths);
	},

	/*
	yhr 5-17:
	新增提交方法
	为修改数据库的入口
	*/
	submit: function () {
		let that = this;
		if (that.data.ableToClick) {
			if (that.data.tempFiles.length == 0) {
				wx.showModal({
					title: '提示',
					content: '上传的图片数量至少为一张！',
				});
			}
			else if (that.data.product_price == null || that.data.product_price <= 0 || that.data.product_price > 10000) {
				wx.showModal({
					title: '提示',
					content: '请重新输入价格！',
				});
			}
			else if (that.data.product_description == '') {
				wx.showModal({
					title: '提示',
					content: '请输入商品描述！',
				});
			}
			else if (that.data.product_name == '') {
				wx.showModal({
					title: '提示',
					content: '请输入商品标题！',
				})
			}
			else {
				that.setData({
					ableToClick: false
				});
				/*
				对数据库的操作写在这里
				*/
				let tempFiles = that.data.tempFiles;
				console.log(tempFiles);
				let file1 = Bmob.File();
				let item = tempFiles[0];
				console.log(item);
				file1 = Bmob.File("upload.jpg", item.path);
				file1.save().then(res => {
					let obj = Bmob.Query("goods");
					let item1 = JSON.parse(res);
					//console.log(that.data.product_name, that.data.product_price, that.data.product_description, that.data.product_category, app.globalData.userOpenId);
					obj.set("name", that.data.product_name);
					obj.set("price", that.data.product_price);
					obj.set("description", that.data.product_description);
					obj.set("category", that.data.product_category);
					obj.set("seller", app.globalData.userOpenId);
					obj.set("state", 0);
					obj.set("clicks", 0);
					obj.set("imgUrl", item1.url);
					//console.log("okokokokokokok");
					obj.save().then(res => {
						let file;
						let objectId = res.objectId;
						if (tempFiles.length == 1) {
							let obj = Bmob.Query("goodsImgs");
							obj.set("goodsObjectId", objectId);
							obj.set("imgUrl", item1.url);
							obj.save().then(res => {
								that.issued();
							});
							return;
						}
						for (let i = 1; i < tempFiles.length; ++i) {
							let item = tempFiles[i];
							//console.log(item);
							file = Bmob.File("upload.jpg", item.path);
						}
						//console.log(file);
						file.save().then(res => {
							let addQueue = new Array();
							for (let item of res) {
								let obj = Bmob.Query("goodsImgs");
								item = JSON.parse(item);
								//console.log(item);
								//console.log(item.url, objectId);
								obj.set("goodsObjectId", objectId)
								obj.set("imgUrl", item.url);
								addQueue.push(obj);
							}
							Bmob.Query("goodsImgs").saveAll(addQueue).then(res => {
								that.issued();
							});
						});
					});
				});
			}
		}
	},

	/*
	yhr 5-18:
	提示发布成功
	并跳转到、并重新加载首页
	*/
	issued: function () {
		let that = this;
		wx.showToast({
			title: '发布成功',
			icon: 'success',
			duration: 1000
		});
		that.sleep(1200);
		wx.reLaunch({
			url: '../../pages/index/index',
		});
	},

	sleep: function (sleepTime) {
		for (var start = Date.now(); Date.now() - start <= sleepTime;) { }
	}

})