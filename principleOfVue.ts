/** Created by lixiangyang on 2017/7/5...*/
"use strict";
let uuid = 0;
const noop = function(){};
const sharedPropetyDefine = {
    enumerable: true,
    configurable: false,
    set: noop,
    get: noop
}

export default class Vue<Object>{
    [index: number]: any;
    [index: string]: any;
    uuid: number = uuid++;
    constructor(data: Object){
        this.$data = data;
        Object.getOwnPropertyNames(data).forEach((key) => {
            this._proxy(key);
        })
        new Observer(data);
    }
    _proxy(key: string){
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: false,
            set(val: any): void{
                this.$data[key] = val;
            },
            get(): any{
                return this.$data[key];
            }
        });
    }
    $watch(exp: String, cb: Function): Watcher<Object, String, Function>{
        return new Watcher(this, exp, cb);
    }
}

class Observer<Object>{
    constructor(data: Object){
        this.walk(data);
    }
    walk(data: Object){
        Object.getOwnPropertyNames(data).forEach((key: string) => {
            this.defineReactive(data, key, data[key]);
            observer(data[key]);
        })
    }
    defineReactive(data: Object, key: any, val: any){
        let dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get(){
                if(Dep.target) Dep.target.addDeps(dep);
                return val;
            },
            set(nVal: any){
                if( nVal === val ) return;
                observer(nVal);
                val = nVal;
                dep.notify();
            }
        })
    }
}

const observer = function(obj: any){
    if(typeof obj !== 'object') return;
    return new Observer(obj);
}

export class Dep{
    subs: Watcher<Object, String, Function>[] = [];
    static target: any;
    constructor(){};
    addSubs(sub: Watcher<Object, String, Function>){
        this.subs.push(sub);
    }
    notify(){
        this.subs.forEach((sub) => {
            sub.run();
        })
    }
}

export class Watcher<Object, String, Function>{
    [index: string]: any;
    constructor(vm: Vue<Object>, exp: String, cb: Function){
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        this.val = this.get();
    }
    addDeps(dep: Dep): void{
        this.dep = dep;
        dep.addSubs(this);
    }
    get(): any{
        Dep.target = this;
        let val = this.getVal(this.exp);
        Dep.target = null;
        return val;
    }
    getVal(exp){
        let splits = exp.split('.');
        if(splits.length < 2) return this.vm[exp];
        return splits.reduce((pre, cur) => {
            return this.vm[pre][cur]
        })
    }
    run(): void{
        let nVal = this.get();
        if( this.val === nVal ) return;
        this.val = nVal;
        this.cb.call(this.vm, nVal, this.val);
    }
}