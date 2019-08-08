const util = require('util')
const mongoose = require('mongoose')
const config = require('../config/db.js');

class Mongo {
    constructor() {
        this.m = mongoose
        this.m.connect = util.promisify(this.m.connect)

        this.model = null
    }

    disconnect() {
        this.m.disconnect()
    }

    async connect() {
        return await this.m.connect(config.mongo.host, {
            useNewUrlParser: true
        })
    }

    createModel(collection, enumObj, timestamps = false) {
        const schema = this.m.Schema(enumObj, {
            timestamps,
            collection
        })
        this.model = this.m.model(collection, schema)

        const promisifyList = ['create', 'insertMany', 'update', 'remove', 'find', 'count']
        promisifyList.forEach(i=>{
            this.model[i]=util.promisify(this.model[i])
        })
    }

    async insert(...arg) {
        return await this.model.create(...arg)
    }

    async insertMany(...arg) {
        return await this.model.insertMany(...arg)
    }

    async update(condition, updateObj, multi = false) {
        return await this.model.update(condition, updateObj, { multi })
    }

    async remove(condition){
        return await this.model.remove(condition)
    }

    async find(...arg) {
        return await this.model.find(...arg)
    }

    async count(...arg) {
        return await this.model.count(...arg)
    }
}

module.exports = new Mongo()
