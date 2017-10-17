import React, { Component } from 'react';
import { NavLink as Link } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import action from '../redux/actions';
import { Loading, DataNull, Header, Footer } from './common';

import GetNextPageModule from './get-next-page';

const target = process.env.NODE_ENV !== 'production' ? 'https://cnodejs.org' : 'https://cnodejs.org'; //目标网站

/**
 * 模块入口方法
 *
 * @param {Object} mySetting
 * @returns
 */
const Main = (mySetting) => {
    var setting = {
        id: '', //应用唯一id表示
        type: 'GET', //请求类型
        url: '', //请求地址
        data: null, //发送给服务器的数据
        component: <div></div>, //数据回调给的组件
        success: (state) => {
            return state;
        }, //请求成功后执行的方法
        error: (state) => {
            return state;
        } //请求失败后执行的方法
    };

    /**
     * 覆盖默认设置
     */
    for (let key in mySetting) {
        setting[key] = mySetting[key];
    }

    /**
     * 组件入口
     *
     * @class Index
     * @extends {Component}
     */
    class Index extends Component {
        constructor(props) {
            super(props);

            /**
             * 初始化状态
             *
             * @param {Object} props
             */
            this.initState = (props) => {
                var { state, location } = props;
                var { pathname, search } = location;
                this.path = pathname + search;

                if (typeof this.action == 'undefined' && location.action == 'PUSH') {
                    this.action = false;
                } else {
                    this.action = true;
                }

                if (typeof state.path[this.path] === 'object' && state.path[this.path].path === this.path && this.action) {
                    this.state = state.path[this.path];
                } else {
                    this.state = Object.assign({}, state.defaults); //数据库不存在当前的path数据，则从默认对象中复制，注意：要复制对象，而不是引用
                    this.state.path = this.path;
                    this.action = false;
                }

            }

            /**
             * DOM初始化完成后执行回调
             */
            this.readyDOM = () => {
                var { success, error } = this.props.setting;
                var { scrollX, scrollY } = this.state;
                if (this.get)
                    return false; //已经加载过
                window.scrollTo(scrollX, scrollY); //设置滚动条位置
                this.get = new GetNextPageModule(this.refs.loading, {
                    url: target + this.getUrl(),
                    data: this.getData(),
                    start: this.start,
                    load: this.load,
                    error: this.error
                });
            }

            /**
             * 请求开始
             */
            this.start = () => {
                this.state.loadAnimation = true;
                this.state.loadMsg = '正在加载中...';
                this
                    .props
                    .setState(this.state);
            }
            /**
             * 下一页加载成功
             *
             * @param {Object} res
             */
            this.load = (res) => {
                var { state } = this;
                var { data } = res;
                if (!data.length && data.length < before.limit) {
                    state.nextBtn = false;
                    state.loadMsg = '没有了';
                } else {
                    state.nextBtn = true;
                    state.loadMsg = '上拉加载更多';
                }
                Array
                    .prototype
                    .push
                    .apply(state.data, data);
                state.loadAnimation = false;
                state.page = ++state.page;
                this
                    .props
                    .setState(state);
            }

            /**
             * 请求失败时
             */
            this.error = () => {
                this.state.loadAnimation = false;
                this.state.loadMsg = '加载失败';
                this
                    .props
                    .setState(this.state);
            }

            /**
             * url更改时
             */
            this.unmount = () => {
                this
                    .get
                    .end();
                delete this.get;
                delete this.action;
                this.state.scrollX = window.scrollX; //记录滚动条位置
                this.state.scrollY = window.scrollY;
                this
                    .props
                    .setState(this.state);
            }

            /**
             * 获取ajax 请求url
             *
             * @returns Object
             */
            this.getUrl = () => {
                var { url } = this.props.setting;
                if (typeof url === 'function') {
                    return url(this.props, this.state);
                } else if (url && typeof url === 'string') {
                    return url;
                } else {
                    return this.props.location.pathname;
                }
            }

            /**
             * 获取要发送给服务器的数据
             *
             * @returns
             */
            this.getData = () => {
                var { data } = this.props.setting;
                if (typeof data === 'function') {
                    return data(this.props, this.state);
                } else if (data && typeof data === 'string') {
                    return data;
                } else {
                    return queryString
                        .parse(this.props.location.search)
                        .tab;
                }
            }

            console.log(this.props);
            this.initState(this.props);
        }
        render() {
            var { loadAnimation, loadMsg } = this.state;
            return (
                <div>
                    <this.props.setting.component {...this.props} state={this.state} />
                    <div ref="loading">
                        <Loading loadAnimation={loadAnimation} loadMsg={loadMsg} />
                    </div>
                </div>
            );
        }
        /**
         * 在初始化渲染执行之后立刻调用一次，仅客户端有效（服务器端不会调用）。
         * 在生命周期中的这个时间点，组件拥有一个 DOM 展现，
         * 你可以通过 this.getDOMNode() 来获取相应 DOM 节点。
         */
        componentDidMount() {
            this.readyDOM();
        }
        /**
         * 在组件接收到新的 props 的时候调用。在初始化渲染的时候，该方法不会调用
         */
        componentWillReceiveProps(np) {
            var { location } = np;
            var { pathname, search } = location;
            var path = pathname + search;
            if (this.path !== path) {
                this.unmount(); //地址栏已经发生改变，做一些卸载前的处理
            }

            this.initState(np);

        }
        /**
         * 在组件的更新已经同步到 DOM 中之后立刻被调用。该方法不会在初始化渲染的时候调用。
         * 使用该方法可以在组件更新之后操作 DOM 元素。
         */
        componentDidUpdate() {
            this.readyDOM();
        }
        /**
         * 在组件从 DOM 中移除的时候立刻被调用。
         * 在该方法中执行任何必要的清理，比如无效的定时器，
         * 或者清除在 componentDidMount 中创建的 DOM 元素
         */
        componentWillUnmount() {
            this.unmount(); //地址栏已经发生改变，做一些卸载前的处理
        }

    }
    Index.defaultProps = {
        setting
    }

    return connect((state) => {
        return {
            state: state[setting.id],
            User: state.User
        }
    }, action(action.id))(Index); //连接redux
}

export default Main;