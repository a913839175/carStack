<template>
    <div class="header">
        <div class="logo">{{sysName}}</div>
        <slot name="topnav"></slot>
        <div class="userinfo">
            <el-dropdown trigger="click">
                <span class="el-dropdown-link userinfo-inner"><img :src="this.sysUserAvatar" class="radius-circle rotate-hover" height="50" >{{getUserName}}</span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item divided @click.native="userInfo">个人信息</el-dropdown-item>
                    <el-dropdown-item divided @click.native="changeTheme">切换布局</el-dropdown-item>
                    <el-dropdown-item divided @click.native="changeCollapse">收起展开</el-dropdown-item>
                    <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>
<script>
    import {isLogin} from '../../utils';
    export default {
        data() {
            return {
                sysName:'车栈金融后台管理',
                sysUserAvatar:'./static/img/Avatar.jpg',
                sysUserName: '',
            }
        },
        created() {
            var user = this.$store.state.user;
            if (isLogin()) {
                this.sysUserAvatar = user.avatar || this.sysUserAvatar;
            }else{
                this.$router.push('/login');
            }
        },
        computed:{
            getUserName(){
                return this.$store.state.user.username;
            }
        },
        methods:{
            userInfo(){
                this.$router.push({ path: '/UserInfo' });
            },
            logout() {
                var self = this;
                self.$confirm('确认退出吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    self.$store.dispatch('Logout').then(() => {
                        // self.$router.push({ path: '/login' });
                        location.reload();
                    }).catch(err => {
                        self.$message.error(err);
                    });                  
                });
            },
            changeTheme(){
                var navbarPosition = this.$store.state.user.navbarPosition == 'left' ? 'top' : 'left';
                this.$store.commit("SET_LAYOUT", navbarPosition)
            },
            changeCollapse(){
                var navbarPosition = this.$store.state.user.navbarPosition;
                if(navbarPosition == 'left'){
                   var Collapse = this.$store.state.user.Collapse === 'false' ? 'true' : 'false';
                    this.$store.commit("SET_Collapse", Collapse) 
                }else{
                    this.$alert('菜单栏为垂直状态时才能收起菜单');
                }
                
            }
        }
    }
</script>
<style scoped>
    .radius-circle{
        border-radius: 50%;
    }
    .rotate-hover:hover{
        animation: myfirst 2s infinite linear;
        -webkit-animation: myfirst 2s infinite linear;
    }
    @keyframes myfirst
    {
        0%{
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        50%{
            -webkit-transform: rotate(180deg);
            transform: rotate(180deg);
        }
        100%{
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
    .header {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 60px;
        font-size: 22px;
        line-height: 60px;
        color: #fff;
    }
    .header .logo{
        float: left;
        width:200px;
        text-align: center;
        font-family: cursive;
    }
    .userinfo {
        text-align: right;
        padding-right: 50px;
        font-size: 16px;
        float: right;
    }
    .userinfo-inner {
        cursor: pointer;
        color:#fff;       
    }
    .userinfo-inner img {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        margin: 10px 0px 10px 10px;
        float: right;
    }
    .userinfo .el-dropdown-link{
        position: relative;
        display: inline-block;
        padding-left: 50px;
        color: #fff;
        cursor: pointer;
        vertical-align: middle;
    }
    .el-dropdown-menu__item{
        text-align: center;
    }
</style>
