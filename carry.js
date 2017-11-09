function express(){
	if(!(this instanceof express)) return new express()
	this.__blocks = []
}

express.prototype = {
	use: function(fn){
		this.__blocks.push(fn)
		return this
	},
	listen: function(obj){
		let self = this
		let blocks = this.__blocks
		let len = blocks.length >> 0
		if(0 === len) return Promise.resolve(obj)
		function next(n){
			if(n >= len) return Promise.resolve(obj)
			let fn = blocks[n]
			if(typeof fn !== 'function') return Promise.reject(`${fn} is not function...`)
			try{
				fn.call(self, obj, function(){
					next(n+1)
				})
				return Promise.resolve(obj)
			}catch(e){
				return Promise.reject(e.message)
			}
		}
		return next(0)
	}
}


let app = express()

app.use(function(obj, next){
	obj.count++
	next()
	obj.count++
}).use(function(obj, next){
	obj.count++
	next()
	obj.count++
}).listen({count: 0}).then(obj => console.log(obj), err => console.log(err))